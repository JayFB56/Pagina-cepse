const fs = require('fs');
const path = require('path');

// Servicio simple que obtiene el último vídeo de canales de YouTube usando el feed RSS
// Configuración: definir la variable de entorno YT_CHANNELS con valores separados por comas.
// Cada valor puede ser:
// - un channel id (empieza con "UC...")
// - una URL de canal (/channel/.. o /user/.. o youtu.be/..)
// - un username (se usará como ?user=USERNAME)

const DATA_FILE = path.join(__dirname, '..', 'data', 'latest_news_video.json');

function extractId(input) {
    if (!input) return null;
    const v = String(input).trim();
    try {
        const u = new URL(v);
        const p = u.pathname || '';
        if (p.startsWith('/channel/')) return { type: 'channel', id: p.split('/')[2] };
        if (p.startsWith('/user/')) return { type: 'user', id: p.split('/')[2] };
        if (u.hostname === 'youtu.be') return { type: 'video', id: p.replace(/^\//, '') };
        // fallback: last segment
        const seg = p.split('/').filter(Boolean).pop();
        if (seg) return { type: seg.startsWith('UC') ? 'channel' : 'user', id: seg };
    } catch (e) {
        // no es una URL
    }

    if (v.startsWith('UC')) return { type: 'channel', id: v };
    return { type: 'user', id: v };
}

async function fetchLatestFromFeed(feedUrl) {
    try {
        const res = await fetch(feedUrl, { headers: { 'User-Agent': 'node.js' } });
        if (!res.ok) return null;
        const text = await res.text();

        const entryMatch = text.match(/<entry>([\s\S]*?)<\/entry>/);
        if (!entryMatch) return null;
        const entry = entryMatch[1];

        const idMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const pubMatch = entry.match(/<published>(.*?)<\/published>/);
        const linkMatch = entry.match(/<link[^>]*href="([^"]+)"/);

        return {
            videoId: idMatch ? idMatch[1] : null,
            title: titleMatch ? titleMatch[1] : null,
            published: pubMatch ? pubMatch[1] : null,
            link: linkMatch ? linkMatch[1] : null,
        };
    } catch (err) {
        console.error('[youtube_service] fetchLatestFromFeed error:', err && err.message ? err.message : err);
        return null;
    }
}

async function fetchLatestVideoForInput(raw) {
    const parsed = extractId(raw);
    if (!parsed) return null;

    let feedUrl = null;
    if (parsed.type === 'channel') {
        feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${parsed.id}`;
    } else if (parsed.type === 'user') {
        feedUrl = `https://www.youtube.com/feeds/videos.xml?user=${encodeURIComponent(parsed.id)}`;
    } else if (parsed.type === 'video') {
        // If a video URL/id was provided, return it directly (no feed)
        return { videoId: parsed.id, title: null, published: null, link: `https://www.youtube.com/watch?v=${parsed.id}` };
    }

    if (!feedUrl) return null;
    return await fetchLatestFromFeed(feedUrl);
}

async function updateLatestVideos() {
    const raw = (process.env.YT_CHANNELS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (raw.length === 0) {
        console.log('[youtube_service] No YT_CHANNELS configured; skipping update');
        return null;
    }

    const results = [];
    for (const r of raw) {
        try {
            const data = await fetchLatestVideoForInput(r);
            if (data && data.videoId) {
                results.push({ source: r, ...data });
            }
        } catch (e) {
            console.error('[youtube_service] error fetching for', r, e && e.message ? e.message : e);
        }
    }

    if (results.length === 0) {
        console.log('[youtube_service] No videos found for configured channels');
        return null;
    }

    // elegir el más reciente por published
    const selected = results.reduce((a, b) => {
        if (!a) return b;
        if (!a.published) return b;
        if (!b.published) return a;
        return new Date(a.published) > new Date(b.published) ? a : b;
    }, null);

    const out = { updatedAt: new Date().toISOString(), selected, list: results };

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(out, null, 2), 'utf8');
    } catch (e) {
        console.error('[youtube_service] Error writing data file', e && e.message ? e.message : e);
    }

    console.log('[youtube_service] Updated latest_news_video.json selected=', selected ? selected.videoId : null);
    return out;
}

module.exports = {
    updateLatestVideos,
    fetchLatestVideoForInput,
};
