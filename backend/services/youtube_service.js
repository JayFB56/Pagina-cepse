const fs = require('fs');
const path = require('path');

// Servicio simple que obtiene el último vídeo de canales de YouTube usando el feed RSS
// Configuración: definir la variable de entorno YT_CHANNELS con valores separados por comas.
// Cada valor puede ser:
// - un channel id (empieza con "UC...")
// - una URL de canal (/channel/.. o /user/.. o youtu.be/..)
// - un username (se usará como ?user=USERNAME)

const DATA_FILE = path.join(__dirname, '..', 'data', 'latest_news_video.json');

let rotationTimer = null;

function readDataFile() {
    try {
        if (!fs.existsSync(DATA_FILE)) return null;
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error('[youtube_service] readDataFile error', e && e.message ? e.message : e);
        return null;
    }
}

function writeDataFile(obj) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {
        console.error('[youtube_service] writeDataFile error', e && e.message ? e.message : e);
    }
}

function extractId(input) {
    if (!input) return null;
    const v = String(input).trim();
    try {
        const u = new URL(v);
        const p = u.pathname || '';
        if (p.startsWith('/channel/')) return { type: 'channel', id: p.split('/')[2] };
        if (p.startsWith('/user/')) return { type: 'user', id: p.split('/')[2] };
        if (p.startsWith('/@')) return { type: 'handle', id: p.split('/')[1] };
        if (p.startsWith('/c/')) return { type: 'custom', id: p.split('/')[2] };
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

    // Helper: try to resolve a channel ID by fetching the page and extracting metadata
    async function resolveChannelIdFromInput(input) {
        if (!input) return null;
        const s = String(input).trim();
        if (s.startsWith('UC')) return s; // already a channel id

        const candidates = [];
        try {
            const u = new URL(s);
            candidates.push(s);
            const p = u.pathname || '';
            const seg = p.split('/').filter(Boolean).pop();
            if (seg) {
                // if seg looks like @handle include @ form
                if (seg.startsWith('@')) {
                    candidates.push(`https://www.youtube.com/${seg}`);
                    candidates.push(`https://www.youtube.com/@${seg.replace(/^@/, '')}`);
                    candidates.push(`https://www.youtube.com/c/${seg.replace(/^@/, '')}`);
                    candidates.push(`https://www.youtube.com/user/${seg.replace(/^@/, '')}`);
                } else {
                    candidates.push(`https://www.youtube.com/@${seg}`);
                    candidates.push(`https://www.youtube.com/c/${seg}`);
                    candidates.push(`https://www.youtube.com/user/${seg}`);
                }
            }
        } catch (err) {
            // not a URL, treat as handle/name
            const clean = s.replace(/^@/, '');
            candidates.push(`https://www.youtube.com/@${clean}`);
            candidates.push(`https://www.youtube.com/c/${clean}`);
            candidates.push(`https://www.youtube.com/user/${clean}`);
        }

        // de-duplicate
        const seen = new Set();
        const uniq = candidates.filter(c => c && !seen.has(c) && seen.add(c));

        for (const c of uniq) {
            try {
                const res = await fetch(c, { headers: { 'User-Agent': 'node.js' } });
                if (!res.ok) continue;
                const text = await res.text();

                // Try several patterns: JSON channelId or meta tag or canonical link
                let m = text.match(/"channelId"\s*:\s*"(UC[0-9A-Za-z_-]{20,})"/);
                if (!m) m = text.match(/<meta itemprop="channelId" content="(UC[0-9A-Za-z_-]{20,})"/i);
                if (!m) m = text.match(/<link rel="canonical" href="https?:\/\/www\.youtube\.com\/channel\/(UC[0-9A-Za-z_-]{20,})"/i);
                if (m) return m[1];
            } catch (e) {
                // ignore and continue
            }
        }
        return null;
    }

    // If input is a direct video id or youtu.be link
    if (parsed.type === 'video') {
        return { videoId: parsed.id, title: null, published: null, link: `https://www.youtube.com/watch?v=${parsed.id}` };
    }

    // Try to get channel id
    let channelId = null;
    if (parsed.type === 'channel' && parsed.id && parsed.id.startsWith('UC')) {
        channelId = parsed.id;
    } else {
        channelId = await resolveChannelIdFromInput(raw);
    }

    // If couldn't resolve but parsed.type was 'user', try legacy user feed
    if (!channelId && parsed.type === 'user') {
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?user=${encodeURIComponent(parsed.id)}`;
        return await fetchLatestFromFeed(feedUrl);
    }

    if (!channelId) return null;

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
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

// Elige aleatoriamente un canal de la lista YT_CHANNELS y guarda su último vídeo.
async function rotateRandomVideo(options = {}) {
    const rawList = (process.env.YT_CHANNELS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (rawList.length === 0) {
        console.log('[youtube_service] No YT_CHANNELS configured; cannot rotate');
        return null;
    }

    // allow passing a specific list (for testing)
    const list = Array.isArray(options.list) && options.list.length ? options.list : rawList;

    // pick random channel
    const choice = list[Math.floor(Math.random() * list.length)];
    try {
        const data = await fetchLatestVideoForInput(choice);
        if (!data || !data.videoId) {
            console.log('[youtube_service] No video found for chosen channel', choice);
            return null;
        }

        const now = new Date();
        const nextAt = new Date(now.getTime() + (options.hours || 10) * 60 * 60 * 1000);

        const out = {
            updatedAt: now.toISOString(),
            selected: { source: choice, ...data },
            list: [ { source: choice, ...data } ],
            nextRotationAt: nextAt.toISOString()
        };

        writeDataFile(out);

        // schedule in-process rotation
        scheduleNextRotation((options.hours || 10) * 60 * 60 * 1000);

        console.log('[youtube_service] Rotated to', out.selected.videoId, 'next at', out.nextRotationAt);
        return out;
    } catch (e) {
        console.error('[youtube_service] rotateRandomVideo error', e && e.message ? e.message : e);
        return null;
    }
}

function scheduleNextRotation(ms) {
    try {
        if (rotationTimer) clearTimeout(rotationTimer);
        rotationTimer = setTimeout(async () => {
            try {
                await rotateRandomVideo();
            } catch (err) {
                console.error('[youtube_service] scheduled rotate error', err && err.message ? err.message : err);
            }
        }, ms);
        console.log('[youtube_service] Next rotation scheduled in', ms, 'ms');
    } catch (e) {
        console.error('[youtube_service] scheduleNextRotation error', e && e.message ? e.message : e);
    }
}

function initScheduledRotation() {
    const data = readDataFile();
    if (data && data.nextRotationAt) {
        const next = new Date(data.nextRotationAt).getTime();
        const now = Date.now();
        if (next > now) {
            scheduleNextRotation(next - now);
            console.log('[youtube_service] Loaded nextRotationAt from file:', data.nextRotationAt);
            return;
        }
    }
    // if no nextRotationAt or already passed, do nothing
}

module.exports = {
    updateLatestVideos,
    fetchLatestVideoForInput,
    rotateRandomVideo,
    scheduleNextRotation,
    initScheduledRotation,
};
