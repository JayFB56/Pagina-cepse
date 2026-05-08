require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const dbService = require('./services/db_service');
const authService = require('./services/auth_service');
const cmsService = require('./services/cms_service');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8080',
            'https://cepse-esmeraldas.com',
            'https://www.cepse-esmeraldas.com'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));

// Servir imágenes subidas (assets/img/cms) bajo /uploads para conveniencia
const UPLOAD_DIR = path.join(__dirname, '..', 'assets', 'img', 'cms');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

// ============================================================
// LEGACY API (sitio público / IA)
// ============================================================
app.get('/api/noticias', (req, res) => {
    try {
        const news = dbService.getLatestNews(10);
        res.json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/noticias/:id', (req, res) => {
    res.json({ success: true, message: 'Status check not implemented in this demo' });
});

// ============================================================
// PUBLIC CMS API (sin auth, sólo published)
// ============================================================
app.get('/api/public/posts', (req, res) => {
    try {
        const { section, limit } = req.query;
        const data = cmsService.listPublic({
            section,
            limit: limit ? Math.min(parseInt(limit, 10) || 50, 100) : 50
        });
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/public/posts/:id', (req, res) => {
    try {
        const post = cmsService.getPublic(parseInt(req.params.id, 10));
        if (!post) return res.status(404).json({ success: false, error: 'No encontrado' });
        res.json({ success: true, data: post });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
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
    message: { success: false, error: 'Demasiados intentos. Intenta en 15 minutos.' }
});

app.post('/api/cms/auth/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Usuario y contraseña requeridos' });
        }
        const result = await authService.login(username, password);
        if (!result.ok) {
            dbService.logActivity({
                userId: null,
                action: 'login_failed',
                details: `username=${username}`,
                ipAddress: req.ip
            });
            return res.status(401).json({ success: false, error: result.error });
        }
        dbService.logActivity({
            userId: result.user.id,
            action: 'login',
            ipAddress: req.ip
        });
        res.json({ success: true, token: result.token, user: result.user });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/cms/auth/logout', authService.authMiddleware, (req, res) => {
    dbService.logActivity({ userId: req.user.id, action: 'logout', ipAddress: req.ip });
    res.json({ success: true });
});

app.get('/api/cms/auth/me', authService.authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: { id: req.user.id, username: req.user.username, role: req.user.role }
    });
});

// ============================================================
// POSTS
// ============================================================
app.get('/api/cms/posts', authService.authMiddleware, (req, res) => {
    try {
        const { section, status, page = 1, perPage = 20 } = req.query;
        const result = cmsService.listPosts({
            section, status,
            page: parseInt(page, 10) || 1,
            perPage: Math.min(parseInt(perPage, 10) || 20, 100)
        });
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/cms/posts/:id', authService.authMiddleware, (req, res) => {
    try {
        const post = cmsService.getPost(parseInt(req.params.id, 10));
        if (!post) return res.status(404).json({ success: false, error: 'No encontrado' });
        res.json({ success: true, data: post });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/cms/posts', authService.authMiddleware, (req, res) => {
    try {
        const post = cmsService.createPost(req.body, req.user.id);
        dbService.logActivity({
            userId: req.user.id,
            action: 'post_create',
            targetType: 'post',
            targetId: post.id,
            details: `${post.section}: ${post.title}`,
            ipAddress: req.ip
        });
        res.status(201).json({ success: true, data: post });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.put('/api/cms/posts/:id', authService.authMiddleware, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const post = cmsService.updatePost(id, req.body);
        dbService.logActivity({
            userId: req.user.id,
            action: 'post_update',
            targetType: 'post',
            targetId: id,
            details: `${post.section}: ${post.title}`,
            ipAddress: req.ip
        });
        res.json({ success: true, data: post });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.delete('/api/cms/posts/:id', authService.authMiddleware, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const ok = cmsService.deletePost(id);
        if (!ok) return res.status(404).json({ success: false, error: 'No encontrado' });
        dbService.logActivity({
            userId: req.user.id,
            action: 'post_delete',
            targetType: 'post',
            targetId: id,
            ipAddress: req.ip
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/cms/posts/:id/publish', authService.authMiddleware, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const post = cmsService.publishPost(id);
        dbService.logActivity({
            userId: req.user.id,
            action: 'post_publish',
            targetType: 'post',
            targetId: id,
            ipAddress: req.ip
        });
        res.json({ success: true, data: post });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.post('/api/cms/posts/:id/unpublish', authService.authMiddleware, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const post = cmsService.unpublishPost(id);
        dbService.logActivity({
            userId: req.user.id,
            action: 'post_unpublish',
            targetType: 'post',
            targetId: id,
            ipAddress: req.ip
        });
        res.json({ success: true, data: post });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.get('/api/cms/metrics', authService.authMiddleware, (req, res) => {
    try {
        res.json({ success: true, data: cmsService.metrics() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ============================================================
// UPLOADS
// ============================================================
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_MAX_MB = parseInt(process.env.UPLOAD_MAX_MB || '5', 10);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
        const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, safe);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: UPLOAD_MAX_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
            return cb(new Error('Tipo de archivo no permitido (sólo JPG, PNG, WEBP)'));
        }
        cb(null, true);
    }
});

app.post('/api/cms/upload', authService.authMiddleware, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, error: err.message });
        if (!req.file) return res.status(400).json({ success: false, error: 'Archivo requerido' });

        const publicPath = `/assets/img/cms/${req.file.filename}`;
        dbService.logActivity({
            userId: req.user.id,
            action: 'upload',
            targetType: 'image',
            details: req.file.filename,
            ipAddress: req.ip
        });
        res.json({ success: true, url: publicPath, filename: req.file.filename });
    });
});

// ============================================================
// ADMIN — usuarios y actividad
// ============================================================
app.get('/api/cms/activity', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
        res.json({ success: true, data: dbService.listActivity({ limit }) });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/cms/users', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        res.json({ success: true, data: dbService.listUsers() });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/cms/users', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        const { username, password, role } = req.body || {};
        if (!username || !password || !role) {
            return res.status(400).json({ success: false, error: 'username, password y role son obligatorios' });
        }
        if (!['presidente', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Rol inválido' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, error: 'Contraseña debe tener al menos 8 caracteres' });
        }
        const passwordHash = authService.hashPassword(password);
        try {
            const result = dbService.createUser({ username, passwordHash, role });
            dbService.logActivity({
                userId: req.user.id,
                action: 'user_create',
                targetType: 'user',
                targetId: result.lastInsertRowid,
                details: `${username} (${role})`,
                ipAddress: req.ip
            });
            res.status(201).json({ success: true, id: result.lastInsertRowid });
        } catch (dbErr) {
            if (String(dbErr.message).includes('UNIQUE')) {
                return res.status(409).json({ success: false, error: 'El usuario ya existe' });
            }
            throw dbErr;
        }
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.put('/api/cms/users/:id/toggle', authService.authMiddleware, authService.requireRole('admin'), (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (id === req.user.id) {
            return res.status(400).json({ success: false, error: 'No puedes desactivarte a ti mismo' });
        }
        const result = dbService.toggleUserActive(id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        dbService.logActivity({
            userId: req.user.id,
            action: 'user_toggle',
            targetType: 'user',
            targetId: id,
            ipAddress: req.ip
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ============================================================
// HEALTH
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// START
// ============================================================
app.listen(PORT, () => {
    console.log(`--- ✅ Servidor CEPSE API + CMS activo en puerto ${PORT} ---`);
    console.log(`API URL:    http://localhost:${PORT}/api/noticias`);
    console.log(`CMS URL:    http://localhost:${PORT}/api/cms/...`);
    console.log(`Public CMS: http://localhost:${PORT}/api/public/posts`);
});
