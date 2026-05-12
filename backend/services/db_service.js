const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH
    ? path.resolve(__dirname, '..', process.env.DB_PATH)
    : path.join(dbDir, 'news.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================================
// SCHEMA
// ============================================================
db.exec(`
    CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        original_title TEXT,
        summary TEXT,
        content TEXT,
        video_url TEXT,
        video_id TEXT,
        source_url TEXT UNIQUE,
        category TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('presidente', 'admin')),
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS cms_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL CHECK(section IN ('noticias', 'comunicados', 'eventos', 'destacados')),
        title TEXT NOT NULL,
        summary TEXT,
        content TEXT,
        image_url TEXT,
        event_date DATE,
        status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
        author_id INTEGER REFERENCES cms_users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS cms_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES cms_users(id),
        action TEXT NOT NULL,
        target_type TEXT,
        target_id INTEGER,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_posts_section ON cms_posts(section);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON cms_posts(status);
    CREATE INDEX IF NOT EXISTS idx_activity_user ON cms_activity_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON cms_activity_log(created_at);
`);

// ============================================================
// SEED — usuarios iniciales
// ============================================================
function seedDefaultUsers() {
    const count = db.prepare('SELECT COUNT(*) AS n FROM cms_users').get().n;

    const insert = db.prepare(`
        INSERT OR IGNORE INTO cms_users (username, password_hash, role)
        VALUES (?, ?, ?)
    `);

    // Insertar si no existen (OR IGNORE no falla si ya existen)
    insert.run('presidente', bcrypt.hashSync('Damian20', 10), 'presidente');
    insert.run('admin', bcrypt.hashSync('Admin@Cepse25', 10), 'admin');

    if (count === 0) {
        console.log('[db] Usuarios CMS iniciales creados (presidente, admin).');
    } else {
        console.log('[db] Usuarios CMS verificados. Seed omitido (ya existen registros).');
    }
}

seedDefaultUsers();

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
    db,

    // ---------- News (legacy IA backend) ----------
    insertNews: (news) => {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO news (title, original_title, source_url, category)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(news.title, news.original_title, news.source_url, news.category);
    },
    updateNewsAI: (id, data) => {
        const stmt = db.prepare(`
            UPDATE news SET title = ?, summary = ?, content = ?, status = 'processing'
            WHERE id = ?
        `);
        return stmt.run(data.title, data.summary, data.content, id);
    },
    updateNewsVideo: (id, videoUrl, videoId) => {
        const stmt = db.prepare(`
            UPDATE news SET video_url = ?, video_id = ?, status = 'completed'
            WHERE id = ?
        `);
        return stmt.run(videoUrl, videoId, id);
    },
    getLatestNews: (limit = 10) => {
        return db.prepare(`
            SELECT * FROM news WHERE status = 'completed'
            ORDER BY created_at DESC LIMIT ?
        `).all(limit);
    },
    getPendingNews: () => {
        return db.prepare(`SELECT * FROM news WHERE status = 'pending' ORDER BY created_at ASC`).all();
    },

    // ---------- CMS users ----------
    findUserByUsername: (username) => {
        return db.prepare('SELECT * FROM cms_users WHERE username = ?').get(username);
    },
    findUserById: (id) => {
        return db.prepare('SELECT id, username, role, active, created_at, last_login FROM cms_users WHERE id = ?').get(id);
    },
    listUsers: () => {
        return db.prepare(`
            SELECT id, username, role, active, created_at, last_login
            FROM cms_users ORDER BY id ASC
        `).all();
    },
    createUser: ({ username, passwordHash, role }) => {
        const stmt = db.prepare(`
            INSERT INTO cms_users (username, password_hash, role)
            VALUES (?, ?, ?)
        `);
        return stmt.run(username, passwordHash, role);
    },
    toggleUserActive: (id) => {
        return db.prepare(`
            UPDATE cms_users SET active = CASE active WHEN 1 THEN 0 ELSE 1 END
            WHERE id = ?
        `).run(id);
    },
    updateUserLastLogin: (id) => {
        return db.prepare('UPDATE cms_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    },
    updateUserPassword: (id, passwordHash) => {
        return db.prepare('UPDATE cms_users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
    },

    // ---------- CMS posts ----------
    createPost: (post) => {
        const stmt = db.prepare(`
            INSERT INTO cms_posts
            (section, title, summary, content, image_url, event_date, status, author_id, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const publishedAt = post.status === 'published' ? new Date().toISOString() : null;
        return stmt.run(
            post.section, post.title, post.summary || null, post.content || null,
            post.image_url || null, post.event_date || null,
            post.status || 'draft', post.author_id, publishedAt
        );
    },
    updatePost: (id, post) => {
        const existing = db.prepare('SELECT status, published_at FROM cms_posts WHERE id = ?').get(id);
        if (!existing) return { changes: 0 };
        let publishedAt = existing.published_at;
        if (post.status === 'published' && existing.status !== 'published') {
            publishedAt = new Date().toISOString();
        }
        const stmt = db.prepare(`
            UPDATE cms_posts SET
                section = ?, title = ?, summary = ?, content = ?,
                image_url = ?, event_date = ?, status = ?,
                published_at = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            post.section, post.title, post.summary || null, post.content || null,
            post.image_url || null, post.event_date || null,
            post.status || 'draft', publishedAt, id
        );
    },
    setPostStatus: (id, status) => {
        const publishedAt = status === 'published' ? new Date().toISOString() : null;
        return db.prepare(`
            UPDATE cms_posts SET status = ?, published_at = COALESCE(?, published_at),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(status, publishedAt, id);
    },
    deletePost: (id) => {
        return db.prepare('DELETE FROM cms_posts WHERE id = ?').run(id);
    },
    getPostById: (id) => {
        return db.prepare(`
            SELECT p.*, u.username AS author_username
            FROM cms_posts p LEFT JOIN cms_users u ON u.id = p.author_id
            WHERE p.id = ?
        `).get(id);
    },
    listPosts: ({ section, status, page = 1, perPage = 20 } = {}) => {
        const where = [];
        const params = [];
        if (section) { where.push('p.section = ?'); params.push(section); }
        if (status)  { where.push('p.status = ?');  params.push(status); }
        const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
        const offset = (Math.max(1, page) - 1) * perPage;

        const rows = db.prepare(`
            SELECT p.*, u.username AS author_username
            FROM cms_posts p LEFT JOIN cms_users u ON u.id = p.author_id
            ${whereSql}
            ORDER BY p.updated_at DESC
            LIMIT ? OFFSET ?
        `).all(...params, perPage, offset);

        const total = db.prepare(`SELECT COUNT(*) AS n FROM cms_posts p ${whereSql}`).get(...params).n;
        return { rows, total, page, perPage };
    },
    countPostsBySection: () => {
        return db.prepare(`
            SELECT section, status, COUNT(*) AS n FROM cms_posts
            GROUP BY section, status
        `).all();
    },

    // ---------- Activity log ----------
    logActivity: ({ userId, action, targetType, targetId, details, ipAddress }) => {
        return db.prepare(`
            INSERT INTO cms_activity_log
            (user_id, action, target_type, target_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId || null, action, targetType || null, targetId || null,
               details || null, ipAddress || null);
    },
    listActivity: ({ limit = 100 } = {}) => {
        return db.prepare(`
            SELECT a.*, u.username
            FROM cms_activity_log a LEFT JOIN cms_users u ON u.id = a.user_id
            ORDER BY a.created_at DESC LIMIT ?
        `).all(limit);
    },

    initDB: () => {
        seedDefaultUsers();
        return { ok: true };
    }
};
