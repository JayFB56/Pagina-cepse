'use strict';

require('dotenv').config();
//console.log('JWT_SECRET cargado:', !!process.env.JWT_SECRET);



const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const dbService = require('./services/db_service');
const authService = require('./services/auth_service');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);
app.disable('x-powered-by');

// ============================================================
// CONFIG
// ============================================================
const DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'https://cepse-esmeraldas.com',
    'https://www.cepse-esmeraldas.com',
];

const ENV_ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

const ALLOWED_ORIGINS = new Set([...DEFAULT_ALLOWED_ORIGINS, ...ENV_ALLOWED_ORIGINS]);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true);

        if (
            ALLOWED_ORIGINS.has(origin) ||
            /\.vercel\.app$/i.test(origin)
        ) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ============================================================
// FILES
// ============================================================
const UPLOAD_DIR = path.join(__dirname, '..', 'assets', 'img', 'cms');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Compatibilidad: servir por ambas rutas para no romper el front
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/assets/img/cms', express.static(UPLOAD_DIR));

const MIME_TO_EXT = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

const ALLOWED_MIME = new Set(Object.keys(MIME_TO_EXT));
const UPLOAD_MAX_MB = Math.min(
    Math.max(Number(process.env.UPLOAD_MAX_MB) || 5, 1),
    20
);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = MIME_TO_EXT[file.mimetype] || path.extname(file.originalname).toLowerCase() || '.jpg';
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, safeName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: UPLOAD_MAX_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.has(file.mimetype)) {
            return cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG y WEBP.'));
        }
        cb(null, true);
    },
});

function parsePositiveInt(value, fallback = null) {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return fallback;
    return n;
}

function parseLimit(value, fallback = 50, max = 100) {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return fallback;
    return Math.min(n, max);
}

function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function pickDefined(value, fallback) {
    return typeof value === 'undefined' ? fallback : value;
}

function getIp(req) {
    return req.ip || req.socket?.remoteAddress || null;
}

function scalar(sql, params = []) {
    const row = dbService.db.prepare(sql).get(...params);
    if (!row) return 0;
    const key = Object.keys(row)[0];
    return Number(row[key]) || 0;
}

function ensureObject(value) {
    return value && typeof value === 'object' ? value : {};
}

function send404(res, message = 'No encontrado') {
    return res.status(404).json({ success: false, error: message });
}

// ============================================================
// LEGACY API
// ============================================================
app.get('/api/noticias', (req, res) => {
    try {
        const limit = parseLimit(req.query.limit, 10, 100);
        const news = dbService.getLatestNews(limit);
        res.json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/noticias/:id', (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        const news = dbService.db.prepare(`
            SELECT *
            FROM news
            WHERE id = ?
        `).get(id);

        if (!news) return send404(res, 'No encontrado');

        res.json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// PUBLIC CMS API
// ============================================================
app.get('/api/public/posts', (req, res) => {
    try {
        const section = normalizeText(req.query.section) || undefined;
        const limit = parseLimit(req.query.limit, 50, 100);

        const result = dbService.listPosts({
            section,
            status: 'published',
            page: 1,
            perPage: limit,
        });

        res.json({
            success: true,
            data: result.rows,
            total: result.total,
            page: result.page,
            perPage: result.perPage,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/public/posts/:id', (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        const post = dbService.getPostById(id);
        if (!post || post.status !== 'published') {
            return send404(res, 'No encontrado');
        }

        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// AUTH
// ============================================================
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
});

app.post('/api/cms/auth/login', loginLimiter, async (req, res) => {
    try {
        const body = ensureObject(req.body);
        const username = normalizeText(body.username);
        const password = typeof body.password === 'string' ? body.password : '';

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Usuario y contraseña requeridos' });
        }

        const result = await authService.login(username, password, { ipAddress: getIp(req) });

        if (!result.ok) {
            return res.status(401).json({ success: false, error: result.error });
        }

        return res.json({
            success: true,
            token: result.token,
            user: result.user,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/cms/auth/logout', authService.authMiddleware, (req, res) => {
    try {
        dbService.logActivity({
            userId: req.user.id,
            action: 'logout',
            targetType: 'auth',
            details: req.user.username,
            ipAddress: getIp(req),
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/cms/auth/me', authService.authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
        },
    });
});

// ============================================================
// POSTS
// ============================================================
app.get('/api/cms/posts', authService.authMiddleware, (req, res) => {
    try {
        const section = normalizeText(req.query.section) || undefined;
        const status = normalizeText(req.query.status) || undefined;
        const page = parsePositiveInt(req.query.page, 1) || 1;
        const perPage = parseLimit(req.query.perPage, 20, 100);

        const result = dbService.listPosts({
            section,
            status,
            page,
            perPage,
        });

        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/cms/posts/:id', authService.authMiddleware, (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        const post = dbService.getPostById(id);
        if (!post) return send404(res, 'No encontrado');

        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/cms/posts', authService.authMiddleware, (req, res) => {
    try {
        const body = ensureObject(req.body);

        const payload = {
            ...body,
            author_id: req.user.id,
        };

        const result = dbService.createPost(payload);
        const createdId = Number(result.lastInsertRowid);

        const created = dbService.getPostById(createdId);

        dbService.logActivity({
            userId: req.user.id,
            action: 'post_create',
            targetType: 'post',
            targetId: createdId,
            details: created ? `${created.section}: ${created.title}` : null,
            ipAddress: getIp(req),
        });

        res.status(201).json({ success: true, data: created, id: createdId });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/cms/posts/:id', authService.authMiddleware, (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        const existing = dbService.getPostById(id);
        if (!existing) return send404(res, 'No encontrado');

        const body = ensureObject(req.body);

        const payload = {
            section: pickDefined(body.section, existing.section),
            title: pickDefined(body.title, existing.title),
            summary: pickDefined(body.summary, existing.summary),
            content: pickDefined(body.content, existing.content),
            image_url: pickDefined(body.image_url, existing.image_url),
            event_date: pickDefined(body.event_date, existing.event_date),
            status: pickDefined(body.status, existing.status),
            author_id: pickDefined(body.author_id, existing.author_id),
        };

        const result = dbService.updatePost(id, payload);
        if (!result || result.changes === 0) {
            return send404(res, 'No encontrado');
        }

        const updated = dbService.getPostById(id);

        dbService.logActivity({
            userId: req.user.id,
            action: 'post_update',
            targetType: 'post',
            targetId: id,
            details: updated ? `${updated.section}: ${updated.title}` : null,
            ipAddress: getIp(req),
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/cms/posts/:id', authService.authMiddleware, (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        const existing = dbService.getPostById(id);
        if (!existing) return send404(res, 'No encontrado');

        const result = dbService.deletePost(id);
        if (!result || result.changes === 0) {
            return send404(res, 'No encontrado');
        }

        dbService.logActivity({
            userId: req.user.id,
            action: 'post_delete',
            targetType: 'post',
            targetId: id,
            details: `${existing.section}: ${existing.title}`,
            ipAddress: getIp(req),
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/cms/posts/:id/publish', authService.authMiddleware, (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        const existing = dbService.getPostById(id);
        if (!existing) return send404(res, 'No encontrado');

        const result = dbService.setPostStatus(id, 'published');
        if (!result || result.changes === 0) {
            return send404(res, 'No encontrado');
        }

        const updated = dbService.getPostById(id);

        dbService.logActivity({
            userId: req.user.id,
            action: 'post_publish',
            targetType: 'post',
            targetId: id,
            details: updated ? `${updated.section}: ${updated.title}` : null,
            ipAddress: getIp(req),
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/cms/posts/:id/unpublish', authService.authMiddleware, (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        const existing = dbService.getPostById(id);
        if (!existing) return send404(res, 'No encontrado');

        const result = dbService.setPostStatus(id, 'draft');
        if (!result || result.changes === 0) {
            return send404(res, 'No encontrado');
        }

        const updated = dbService.getPostById(id);

        dbService.logActivity({
            userId: req.user.id,
            action: 'post_unpublish',
            targetType: 'post',
            targetId: id,
            details: updated ? `${updated.section}: ${updated.title}` : null,
            ipAddress: getIp(req),
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================================
// METRICS
// ============================================================
app.get('/api/cms/metrics', authService.authMiddleware, authService.requireRole('admin', 'presidente'), (req, res) => {
    try {
        const postsTotal = scalar(`SELECT COUNT(*) AS n FROM cms_posts`);
        const postsPublished = scalar(`SELECT COUNT(*) AS n FROM cms_posts WHERE status = 'published'`);
        const postsDraft = scalar(`SELECT COUNT(*) AS n FROM cms_posts WHERE status = 'draft'`);
        const usersTotal = scalar(`SELECT COUNT(*) AS n FROM cms_users`);
        const usersActive = scalar(`SELECT COUNT(*) AS n FROM cms_users WHERE active = 1`);
        const newsTotal = scalar(`SELECT COUNT(*) AS n FROM news`);
        const newsCompleted = scalar(`SELECT COUNT(*) AS n FROM news WHERE status = 'completed'`);
        const newsPending = scalar(`SELECT COUNT(*) AS n FROM news WHERE status = 'pending'`);
        const activityTotal = scalar(`SELECT COUNT(*) AS n FROM cms_activity_log`);

        res.json({
            success: true,
            data: {
                users: {
                    total: usersTotal,
                    active: usersActive,
                },
                posts: {
                    total: postsTotal,
                    published: postsPublished,
                    draft: postsDraft,
                    bySection: dbService.countPostsBySection(),
                },
                news: {
                    total: newsTotal,
                    completed: newsCompleted,
                    pending: newsPending,
                },
                activity: {
                    total: activityTotal,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// UPLOADS
// ============================================================
app.post('/api/cms/upload', authService.authMiddleware, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Archivo requerido' });
        }

        const fileName = req.file.filename;
        const uploadUrl = `/uploads/${fileName}`;
        const assetUrl = `/assets/img/cms/${fileName}`;

        dbService.logActivity({
            userId: req.user.id,
            action: 'upload',
            targetType: 'image',
            targetId: null,
            details: fileName,
            ipAddress: getIp(req),
        });

        res.json({
            success: true,
            url: uploadUrl,
            assetUrl,
            filename: fileName,
        });
    });
});

// ============================================================
// USERS ADMIN
// ============================================================
app.get('/api/cms/activity', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        const limit = parseLimit(req.query.limit, 100, 500);
        const data = dbService.listActivity({ limit });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/cms/users', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        res.json({ success: true, data: dbService.listUsers() });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/cms/users', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        const body = ensureObject(req.body);
        const username = normalizeText(body.username);
        const password = typeof body.password === 'string' ? body.password : '';
        const role = normalizeText(body.role);

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'username, password y role son obligatorios',
            });
        }

        if (!['presidente', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Rol inválido' });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'La contraseña debe tener al menos 8 caracteres',
            });
        }

        const passwordHash = authService.hashPassword(password);

        try {
            const result = dbService.createUser({ username, passwordHash, role });

            dbService.logActivity({
                userId: req.user.id,
                action: 'user_create',
                targetType: 'user',
                targetId: Number(result.lastInsertRowid),
                details: `${username} (${role})`,
                ipAddress: getIp(req),
            });

            res.status(201).json({
                success: true,
                id: Number(result.lastInsertRowid),
            });
        } catch (dbErr) {
            if (String(dbErr.message).includes('UNIQUE')) {
                return res.status(409).json({ success: false, error: 'El usuario ya existe' });
            }
            throw dbErr;
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/cms/users/:id/toggle', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'No puedes desactivarte a ti mismo',
            });
        }

        const result = dbService.toggleUserActive(id);
        if (!result || result.changes === 0) {
            return send404(res, 'Usuario no encontrado');
        }

        dbService.logActivity({
            userId: req.user.id,
            action: 'user_toggle',
            targetType: 'user',
            targetId: id,
            ipAddress: getIp(req),
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/cms/users/:id/password', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        const body = ensureObject(req.body);
        const password = typeof body.password === 'string' ? body.password : '';

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'La nueva contraseña debe tener al menos 8 caracteres',
            });
        }

        const passwordHash = authService.hashPassword(password);
        const result = dbService.updateUserPassword(id, passwordHash);

        if (!result || result.changes === 0) {
            return send404(res, 'Usuario no encontrado');
        }

        dbService.logActivity({
            userId: req.user.id,
            action: 'user_update_password',
            targetType: 'user',
            targetId: id,
            ipAddress: getIp(req),
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/cms/users/:id', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        const id = parsePositiveInt(req.params.id);
        if (!id) return res.status(400).json({ success: false, error: 'ID inválido' });

        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'No puedes eliminarte a ti mismo',
            });
        }

        const result = dbService.deleteUser(id);
        if (!result || result.changes === 0) {
            return send404(res, 'Usuario no encontrado');
        }

        dbService.logActivity({
            userId: req.user.id,
            action: 'user_delete',
            targetType: 'user',
            targetId: id,
            ipAddress: getIp(req),
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// HEALTH
// ============================================================
app.get('/api/health', (req, res) => {
    try {
        const health = typeof dbService.healthCheck === 'function'
            ? dbService.healthCheck()
            : { ok: true };

        res.json({
            success: true,
            status: 'ok',
            timestamp: new Date().toISOString(),
            db: health,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// 404 API
// ============================================================
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
    }
    return next();
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
    const status =
        err?.message === 'Not allowed by CORS' ? 403 :
        err?.status && Number.isInteger(err.status) ? err.status :
        500;

    if (!res.headersSent) {
        return res.status(status).json({
            success: false,
            error: err?.message || 'Error interno del servidor',
        });
    }

    return next(err);
});

// ============================================================
// START
// ============================================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`---  Servidor API + CMS activo en puerto ${PORT} ---`);
        console.log(`API URL:     http://localhost:${PORT}/api/noticias`);
        console.log(`CMS URL:     http://localhost:${PORT}/api/cms/...`);
        console.log(`Public CMS:  http://localhost:${PORT}/api/public/posts`);
    });
}

module.exports = app;