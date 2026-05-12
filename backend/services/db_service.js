'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, '../data');
const DEFAULT_DB_FILE = 'news.db';
const SCHEMA_VERSION = 2;

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

const dbPath = process.env.DB_PATH
    ? path.resolve(__dirname, '..', process.env.DB_PATH)
    : path.join(DB_DIR, DEFAULT_DB_FILE);

const db = new Database(dbPath, {
    fileMustExist: false,
    timeout: 5000,
});

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');
db.pragma('busy_timeout = 5000');
db.pragma('temp_store = MEMORY');

const ALLOWED_ROLES = new Set(['presidente', 'admin']);
const ALLOWED_POST_SECTIONS = new Set(['noticias', 'comunicados', 'eventos', 'destacados']);
const ALLOWED_POST_STATUS = new Set(['draft', 'published']);
const ALLOWED_NEWS_STATUS = new Set(['pending', 'processing', 'completed', 'failed']);

const DEFAULT_USERS = [
    { username: 'presidente', role: 'presidente', envKey: 'CMS_PRESIDENT_PASSWORD' },
    { username: 'admin', role: 'admin', envKey: 'CMS_ADMIN_PASSWORD' },
];

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function cleanText(value, fallback = null) {
    if (value === undefined || value === null) return fallback;
    const text = String(value).trim();
    return text.length ? text : fallback;
}

function optionalText(value) {
    return cleanText(value, null);
}

function toInt(value, fallback = null) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    const i = Math.trunc(n);
    return Number.isInteger(i) ? i : fallback;
}

function positiveInt(value, fieldName = 'id') {
    const n = toInt(value, null);
    if (!Number.isInteger(n) || n <= 0) {
        throw new Error(`${fieldName} inválido`);
    }
    return n;
}

function safePagination(page = 1, perPage = 20) {
    const p = Math.max(1, toInt(page, 1));
    const limit = Math.min(100, Math.max(1, toInt(perPage, 20)));
    return { page: p, perPage: limit };
}

function allowedValue(value, set, fieldName) {
    const v = cleanText(value, '');
    if (!set.has(v)) {
        throw new Error(`${fieldName} inválido`);
    }
    return v;
}

function hashPassword(plainPassword) {
    if (!isNonEmptyString(plainPassword) || plainPassword.trim().length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    return bcrypt.hashSync(plainPassword, 12);
}

function verifyPassword(plainPassword, passwordHash) {
    if (!isNonEmptyString(plainPassword) || !isNonEmptyString(passwordHash)) return false;
    return bcrypt.compareSync(plainPassword, passwordHash);
}

function ensurePasswordHash(passwordHash) {
    const value = cleanText(passwordHash, '');
    if (!value || value.length < 20) {
        throw new Error('passwordHash inválido');
    }
    return value;
}

function generateTemporaryPassword(length = 18) {
    return crypto.randomBytes(Math.ceil(length * 3 / 4))
        .toString('base64')
        .replace(/[+/=]/g, '')
        .slice(0, length);
}

function tableExists(tableName) {
    const row = db.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = ?
    `).get(tableName);
    return !!row;
}

function columnExists(tableName, columnName) {
    if (!tableExists(tableName)) return false;
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some(col => col.name === columnName);
}

function ensureColumn(tableName, columnName, definition) {
    if (!tableExists(tableName)) return;
    if (columnExists(tableName, columnName)) return;
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

function ensureIndex(sql) {
    db.exec(sql);
}

function getSchemaVersion() {
    if (!tableExists('db_meta')) return 0;
    const row = db.prepare(`SELECT value FROM db_meta WHERE key = 'schema_version'`).get();
    return row ? toInt(row.value, 0) : 0;
}

function setSchemaVersion(version) {
    db.prepare(`
        INSERT INTO db_meta (key, value)
        VALUES ('schema_version', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(String(version));
}

function ensureBaseSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS db_meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL CHECK(length(trim(title)) > 0),
            original_title TEXT,
            summary TEXT,
            content TEXT,
            video_url TEXT,
            video_id TEXT,
            source_url TEXT UNIQUE,
            category TEXT,
            status TEXT NOT NULL DEFAULT 'pending'
                CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS cms_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL CHECK(length(trim(username)) > 0),
            password_hash TEXT NOT NULL CHECK(length(password_hash) > 20),
            role TEXT NOT NULL CHECK(role IN ('presidente', 'admin')),
            active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0, 1)),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        );

        CREATE TABLE IF NOT EXISTS cms_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section TEXT NOT NULL CHECK(section IN ('noticias', 'comunicados', 'eventos', 'destacados')),
            title TEXT NOT NULL CHECK(length(trim(title)) > 0),
            summary TEXT,
            content TEXT,
            image_url TEXT,
            event_date DATE,
            status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
            author_id INTEGER REFERENCES cms_users(id) ON DELETE SET NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            published_at DATETIME
        );

        CREATE TABLE IF NOT EXISTS cms_activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES cms_users(id) ON DELETE SET NULL,
            action TEXT NOT NULL CHECK(length(trim(action)) > 0),
            target_type TEXT,
            target_id INTEGER,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);

    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_news_status ON news(status)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)`);

    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_users_username ON cms_users(username)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_users_active ON cms_users(active)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_users_role ON cms_users(role)`);

    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_posts_section ON cms_posts(section)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_posts_status ON cms_posts(status)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_posts_author_id ON cms_posts(author_id)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON cms_posts(created_at)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON cms_posts(updated_at)`);

    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_activity_user ON cms_activity_log(user_id)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_activity_created ON cms_activity_log(created_at)`);
    ensureIndex(`CREATE INDEX IF NOT EXISTS idx_activity_action ON cms_activity_log(action)`);
}

function runMigrations() {
    const currentVersion = getSchemaVersion();

    db.transaction(() => {
        if (currentVersion < 1) {
            ensureBaseSchema();
            setSchemaVersion(1);
        }

        if (currentVersion < 2) {
            // Añadidos suaves para no romper bases antiguas.
            ensureColumn('news', 'status', `TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed'))`);
            ensureColumn('cms_users', 'active', `INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0, 1))`);
            ensureColumn('cms_users', 'last_login', `DATETIME`);
            ensureColumn('cms_posts', 'status', `TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published'))`);
            ensureColumn('cms_posts', 'published_at', `DATETIME`);
            ensureColumn('cms_activity_log', 'ip_address', `TEXT`);
            setSchemaVersion(2);
        }
    })();
}

function seedDefaultUsers() {
    const insert = db.prepare(`
        INSERT INTO cms_users (username, password_hash, role)
        VALUES (?, ?, ?)
    `);

    db.transaction(() => {
        for (const user of DEFAULT_USERS) {
            const exists = db.prepare(`
                SELECT id
                FROM cms_users
                WHERE username = ?
            `).get(user.username);

            if (exists) continue;

            const envPassword = cleanText(process.env[user.envKey], '');
            const plainPassword = envPassword || generateTemporaryPassword();
            const passwordHash = hashPassword(plainPassword);

            insert.run(user.username, passwordHash, user.role);

            if (!envPassword) {
                console.warn(`[db] Usuario inicial "${user.username}" creado con contraseña temporal: ${plainPassword}`);
                console.warn(`[db] Define la variable de entorno ${user.envKey} para fijarla permanentemente.`);
            }
        }
    })();
}

function countActiveUsersByRole(role) {
    return db.prepare(`
        SELECT COUNT(*) AS n
        FROM cms_users
        WHERE role = ? AND active = 1
    `).get(role).n;
}

function getUserRoleAndState(userId) {
    return db.prepare(`
        SELECT id, role, active
        FROM cms_users
        WHERE id = ?
    `).get(userId);
}

function ensureNotRemovingLastActiveRole(userId, actionLabel) {
    const user = getUserRoleAndState(userId);
    if (!user) return;

    if (user.active === 1) {
        const activeCount = countActiveUsersByRole(user.role);
        if (activeCount <= 1) {
            throw new Error(`No se puede ${actionLabel}: quedaría sin usuarios activos el rol "${user.role}"`);
        }
    }
}

runMigrations();
seedDefaultUsers();

function normalizeNewsInput(news = {}) {
    const title = cleanText(news.title, '');
    if (!title) throw new Error('title es obligatorio');

    const status = news.status
        ? allowedValue(news.status, ALLOWED_NEWS_STATUS, 'status')
        : 'pending';

    return {
        title,
        original_title: optionalText(news.original_title),
        source_url: optionalText(news.source_url),
        category: optionalText(news.category),
        summary: optionalText(news.summary),
        content: optionalText(news.content),
        video_url: optionalText(news.video_url),
        video_id: optionalText(news.video_id),
        status,
    };
}

function normalizePostInput(post = {}) {
    const section = allowedValue(post.section, ALLOWED_POST_SECTIONS, 'section');
    const title = cleanText(post.title, '');
    if (!title) throw new Error('title es obligatorio');

    const status = post.status
        ? allowedValue(post.status, ALLOWED_POST_STATUS, 'status')
        : 'draft';

    const authorId = post.author_id === undefined || post.author_id === null || post.author_id === ''
        ? null
        : positiveInt(post.author_id, 'author_id');

    return {
        section,
        title,
        summary: optionalText(post.summary),
        content: optionalText(post.content),
        image_url: optionalText(post.image_url),
        event_date: optionalText(post.event_date),
        status,
        author_id: authorId,
    };
}

module.exports = {
    db,
    hashPassword,
    verifyPassword,

    insertNews: (news) => {
        const n = normalizeNewsInput(news);

        const stmt = db.prepare(`
            INSERT OR IGNORE INTO news
            (title, original_title, source_url, category, summary, content, video_url, video_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            n.title,
            n.original_title,
            n.source_url,
            n.category,
            n.summary,
            n.content,
            n.video_url,
            n.video_id,
            n.status
        );
    },

    updateNewsAI: (id, data = {}) => {
        const newsId = positiveInt(id, 'news id');
        const title = cleanText(data.title, '');
        if (!title) throw new Error('title es obligatorio');

        const stmt = db.prepare(`
            UPDATE news
            SET title = ?,
                summary = ?,
                content = ?,
                status = 'processing'
            WHERE id = ?
        `);

        return stmt.run(
            title,
            optionalText(data.summary),
            optionalText(data.content),
            newsId
        );
    },

    updateNewsVideo: (id, videoUrl, videoId) => {
        const newsId = positiveInt(id, 'news id');

        const stmt = db.prepare(`
            UPDATE news
            SET video_url = ?,
                video_id = ?,
                status = 'completed'
            WHERE id = ?
        `);

        return stmt.run(
            optionalText(videoUrl),
            optionalText(videoId),
            newsId
        );
    },

    getLatestNews: (limit = 10) => {
        const safeLimit = Math.min(100, Math.max(1, toInt(limit, 10)));
        return db.prepare(`
            SELECT *
            FROM news
            WHERE status = 'completed'
            ORDER BY created_at DESC
            LIMIT ?
        `).all(safeLimit);
    },

    getPendingNews: () => {
        return db.prepare(`
            SELECT *
            FROM news
            WHERE status = 'pending'
            ORDER BY created_at ASC
        `).all();
    },

    findUserByUsername: (username) => {
        const safeUsername = cleanText(username, '');
        if (!safeUsername) return undefined;

        return db.prepare(`
            SELECT *
            FROM cms_users
            WHERE username = ?
        `).get(safeUsername);
    },

    findUserById: (id) => {
        const userId = positiveInt(id, 'user id');
        return db.prepare(`
            SELECT id, username, role, active, created_at, last_login
            FROM cms_users
            WHERE id = ?
        `).get(userId);
    },

    listUsers: () => {
        return db.prepare(`
            SELECT id, username, role, active, created_at, last_login
            FROM cms_users
            ORDER BY id ASC
        `).all();
    },

    createUser: ({ username, passwordHash, role } = {}) => {
        const safeUsername = cleanText(username, '');
        if (!safeUsername) throw new Error('username es obligatorio');

        const safeRole = allowedValue(role, ALLOWED_ROLES, 'role');
        const safePasswordHash = ensurePasswordHash(passwordHash);

        return db.prepare(`
            INSERT INTO cms_users (username, password_hash, role)
            VALUES (?, ?, ?)
        `).run(safeUsername, safePasswordHash, safeRole);
    },

    toggleUserActive: (id) => {
        const userId = positiveInt(id, 'user id');
        ensureNotRemovingLastActiveRole(userId, 'desactivar');

        return db.prepare(`
            UPDATE cms_users
            SET active = CASE active WHEN 1 THEN 0 ELSE 1 END
            WHERE id = ?
        `).run(userId);
    },

    updateUserLastLogin: (id) => {
        const userId = positiveInt(id, 'user id');

        return db.prepare(`
            UPDATE cms_users
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(userId);
    },

    updateUserPassword: (id, passwordHash) => {
        const userId = positiveInt(id, 'user id');
        const safePasswordHash = ensurePasswordHash(passwordHash);

        return db.prepare(`
            UPDATE cms_users
            SET password_hash = ?
            WHERE id = ?
        `).run(safePasswordHash, userId);
    },

    deleteUser: (id) => {
        const userId = positiveInt(id, 'user id');
        ensureNotRemovingLastActiveRole(userId, 'eliminar');

        return db.prepare(`
            DELETE FROM cms_users
            WHERE id = ?
        `).run(userId);
    },

    createPost: (post) => {
        const p = normalizePostInput(post);
        const publishedAt = p.status === 'published' ? new Date().toISOString() : null;

        return db.prepare(`
            INSERT INTO cms_posts
            (section, title, summary, content, image_url, event_date, status, author_id, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            p.section,
            p.title,
            p.summary,
            p.content,
            p.image_url,
            p.event_date,
            p.status,
            p.author_id,
            publishedAt
        );
    },

    updatePost: (id, post) => {
        const postId = positiveInt(id, 'post id');
        const existing = db.prepare(`
            SELECT id, status, published_at
            FROM cms_posts
            WHERE id = ?
        `).get(postId);

        if (!existing) return { changes: 0 };

        const p = normalizePostInput(post);
        let publishedAt = existing.published_at;

        if (p.status === 'published' && existing.status !== 'published') {
            publishedAt = new Date().toISOString();
        }

        return db.prepare(`
            UPDATE cms_posts SET
                section = ?,
                title = ?,
                summary = ?,
                content = ?,
                image_url = ?,
                event_date = ?,
                status = ?,
                author_id = ?,
                published_at = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            p.section,
            p.title,
            p.summary,
            p.content,
            p.image_url,
            p.event_date,
            p.status,
            p.author_id,
            publishedAt,
            postId
        );
    },

    setPostStatus: (id, status) => {
        const postId = positiveInt(id, 'post id');
        const safeStatus = allowedValue(status, ALLOWED_POST_STATUS, 'status');
        const publishedAt = safeStatus === 'published' ? new Date().toISOString() : null;

        return db.prepare(`
            UPDATE cms_posts
            SET status = ?,
                published_at = COALESCE(?, published_at),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(safeStatus, publishedAt, postId);
    },

    deletePost: (id) => {
        const postId = positiveInt(id, 'post id');
        return db.prepare(`
            DELETE FROM cms_posts
            WHERE id = ?
        `).run(postId);
    },

    getPostById: (id) => {
        const postId = positiveInt(id, 'post id');
        return db.prepare(`
            SELECT p.*, u.username AS author_username
            FROM cms_posts p
            LEFT JOIN cms_users u ON u.id = p.author_id
            WHERE p.id = ?
        `).get(postId);
    },

    listPosts: ({ section, status, page = 1, perPage = 20 } = {}) => {
        const { page: safePage, perPage: safePerPage } = safePagination(page, perPage);
        const where = [];
        const params = [];

        if (section) {
            where.push('p.section = ?');
            params.push(allowedValue(section, ALLOWED_POST_SECTIONS, 'section'));
        }

        if (status) {
            where.push('p.status = ?');
            params.push(allowedValue(status, ALLOWED_POST_STATUS, 'status'));
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const offset = (safePage - 1) * safePerPage;

        const rows = db.prepare(`
            SELECT p.*, u.username AS author_username
            FROM cms_posts p
            LEFT JOIN cms_users u ON u.id = p.author_id
            ${whereSql}
            ORDER BY p.updated_at DESC
            LIMIT ? OFFSET ?
        `).all(...params, safePerPage, offset);

        const total = db.prepare(`
            SELECT COUNT(*) AS n
            FROM cms_posts p
            ${whereSql}
        `).get(...params).n;

        return {
            rows,
            total,
            page: safePage,
            perPage: safePerPage,
        };
    },

    countPostsBySection: () => {
        return db.prepare(`
            SELECT section, status, COUNT(*) AS n
            FROM cms_posts
            GROUP BY section, status
            ORDER BY section ASC, status ASC
        `).all();
    },

    logActivity: ({ userId, action, targetType, targetId, details, ipAddress } = {}) => {
        const safeAction = cleanText(action, '');
        if (!safeAction) throw new Error('action es obligatorio');

        return db.prepare(`
            INSERT INTO cms_activity_log
            (user_id, action, target_type, target_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            userId === undefined || userId === null || userId === ''
                ? null
                : positiveInt(userId, 'userId'),
            safeAction,
            optionalText(targetType),
            targetId === undefined || targetId === null || targetId === ''
                ? null
                : toInt(targetId, null),
            optionalText(details),
            optionalText(ipAddress)
        );
    },

    listActivity: ({ limit = 100 } = {}) => {
        const safeLimit = Math.min(500, Math.max(1, toInt(limit, 100)));

        return db.prepare(`
            SELECT a.*, u.username
            FROM cms_activity_log a
            LEFT JOIN cms_users u ON u.id = a.user_id
            ORDER BY a.created_at DESC
            LIMIT ?
        `).all(safeLimit);
    },

    initDB: () => {
        runMigrations();
        seedDefaultUsers();
        return { ok: true };
    },

    healthCheck: () => {
        const meta = db.prepare(`SELECT value FROM db_meta WHERE key = 'schema_version'`).get();
        return {
            ok: true,
            schemaVersion: meta ? toInt(meta.value, 0) : 0,
            dbPath,
        };
    },
};