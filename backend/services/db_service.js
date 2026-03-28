const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'news.db'));

// Create tables
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
        status TEXT DEFAULT 'pending', -- pending, processing, completed, error
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

module.exports = {
    insertNews: (news) => {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO news (title, original_title, source_url, category)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(news.title, news.original_title, news.source_url, news.category);
    },
    updateNewsAI: (id, data) => {
        const stmt = db.prepare(`
            UPDATE news SET 
                title = ?, 
                summary = ?, 
                content = ?, 
                status = 'processing' 
            WHERE id = ?
        `);
        return stmt.run(data.title, data.summary, data.content, id);
    },
    updateNewsVideo: (id, videoUrl, videoId) => {
        const stmt = db.prepare(`
            UPDATE news SET 
                video_url = ?, 
                video_id = ?, 
                status = 'completed' 
            WHERE id = ?
        `);
        return stmt.run(videoUrl, videoId, id);
    },
    getLatestNews: (limit = 10) => {
        return db.prepare(`
            SELECT * FROM news 
            WHERE status = 'completed' 
            ORDER BY created_at DESC 
            LIMIT ?
        `).all(limit);
    },
    getPendingNews: () => {
        return db.prepare(`
            SELECT * FROM news 
            WHERE status = 'pending' 
            ORDER BY created_at ASC
        `).all();
    }
};
