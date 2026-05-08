const db = require('./db_service');

const VALID_SECTIONS = ['noticias', 'comunicados', 'eventos', 'destacados'];

function validatePostInput(input) {
    if (!input.title || !input.title.trim()) return 'Título obligatorio';
    if (!VALID_SECTIONS.includes(input.section)) return 'Sección inválida';
    if (input.status && !['draft', 'published'].includes(input.status)) return 'Estado inválido';
    if (input.section === 'eventos' && input.event_date) {
        if (isNaN(Date.parse(input.event_date))) return 'Fecha del evento inválida';
    }
    return null;
}

function createPost(input, authorId) {
    const err = validatePostInput(input);
    if (err) throw new Error(err);
    const result = db.createPost({ ...input, author_id: authorId });
    return db.getPostById(result.lastInsertRowid);
}

function updatePost(id, input) {
    const err = validatePostInput(input);
    if (err) throw new Error(err);
    const result = db.updatePost(id, input);
    if (result.changes === 0) throw new Error('Publicación no encontrada');
    return db.getPostById(id);
}

function publishPost(id) {
    db.setPostStatus(id, 'published');
    return db.getPostById(id);
}

function unpublishPost(id) {
    db.setPostStatus(id, 'draft');
    return db.getPostById(id);
}

function deletePost(id) {
    const result = db.deletePost(id);
    return result.changes > 0;
}

function getPost(id) {
    return db.getPostById(id);
}

function listPosts(filters) {
    return db.listPosts(filters);
}

function metrics() {
    const counts = db.countPostsBySection();
    const summary = {};
    VALID_SECTIONS.forEach(s => { summary[s] = { draft: 0, published: 0, total: 0 }; });
    counts.forEach(({ section, status, n }) => {
        if (!summary[section]) return;
        summary[section][status] = n;
        summary[section].total += n;
    });
    return summary;
}

function listPublic({ section, limit = 50 } = {}) {
    if (section && !VALID_SECTIONS.includes(section)) return [];
    const filters = { status: 'published', perPage: limit };
    if (section) filters.section = section;
    const { rows } = db.listPosts(filters);
    return rows.map(r => ({
        id: r.id,
        section: r.section,
        title: r.title,
        summary: r.summary,
        content: r.content,
        image_url: r.image_url,
        event_date: r.event_date,
        published_at: r.published_at,
        created_at: r.created_at
    }));
}

function getPublic(id) {
    const p = db.getPostById(id);
    if (!p || p.status !== 'published') return null;
    return {
        id: p.id,
        section: p.section,
        title: p.title,
        summary: p.summary,
        content: p.content,
        image_url: p.image_url,
        event_date: p.event_date,
        published_at: p.published_at,
        created_at: p.created_at
    };
}

module.exports = {
    VALID_SECTIONS,
    createPost,
    updatePost,
    publishPost,
    unpublishPost,
    deletePost,
    getPost,
    listPosts,
    metrics,
    listPublic,
    getPublic
};
