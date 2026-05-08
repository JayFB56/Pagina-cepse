/* ============================================================
   CEPSE CMS — Cliente compartido de autenticación + API
   ============================================================ */

// URL del backend. En dev: localhost:3000. En producción, cambiar al
// dominio del backend desplegado (Railway, Render, etc.)
const API_BASE = (function () {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // En producción: obtener del localStorage o usar variable de entorno
    // Por defecto, asumir que el backend está en /api proxy de Vercel
    // O dejar esta URL y actualizar en vercel.json si es necesario
    if (typeof BACKEND_URL !== 'undefined') {
        return BACKEND_URL;
    }
    // Fallback: si nada funciona, intentar en el mismo dominio
    return `${window.location.protocol}//${window.location.hostname}`;
})();

const TOKEN_KEY = 'cepse_cms_token';
const USER_KEY = 'cepse_cms_user';

const CMSAuth = {
    getToken() { return localStorage.getItem(TOKEN_KEY); },
    getUser() {
        const raw = localStorage.getItem(USER_KEY);
        try { return raw ? JSON.parse(raw) : null; } catch { return null; }
    },
    setSession(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    async login(username, password) {
        try {
            const res = await fetch(`${API_BASE}/api/cms/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                return { ok: false, error: data.error || 'Error al iniciar sesión' };
            }
            this.setSession(data.token, data.user);
            return { ok: true, user: data.user };
        } catch (e) {
            return { ok: false, error: 'No se pudo conectar con el servidor' };
        }
    },

    async fetchMe() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const res = await fetch(`${API_BASE}/api/cms/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) { this.clear(); return null; }
            const data = await res.json();
            return data.user;
        } catch { return null; }
    },

    async logout() {
        const token = this.getToken();
        if (token) {
            try {
                await fetch(`${API_BASE}/api/cms/auth/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch {}
        }
        this.clear();
        window.location.href = 'index.html';
    },

    requireAuth() {
        const token = this.getToken();
        if (!token) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

// Helper para llamadas autenticadas a la API
const CMSAPI = {
    async request(path, options = {}) {
        const token = CMSAuth.getToken();
        const headers = options.headers || {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (!(options.body instanceof FormData) && options.body) {
            headers['Content-Type'] = 'application/json';
        }

        let res;
        try {
            res = await fetch(`${API_BASE}${path}`, { ...options, headers });
        } catch (e) {
            return { ok: false, error: 'Error de conexión con el servidor' };
        }

        if (res.status === 401) {
            CMSAuth.clear();
            window.location.href = 'index.html';
            return { ok: false, error: 'Sesión expirada' };
        }

        let data = {};
        try { data = await res.json(); } catch {}
        if (!res.ok || data.success === false) {
            return { ok: false, error: data.error || `Error ${res.status}` };
        }
        return { ok: true, ...data };
    },

    get(path) { return this.request(path); },
    post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); },
    put(path, body) { return this.request(path, { method: 'PUT', body: JSON.stringify(body) }); },
    del(path) { return this.request(path, { method: 'DELETE' }); },

    async upload(file) {
        const fd = new FormData();
        fd.append('image', file);
        return this.request('/api/cms/upload', { method: 'POST', body: fd });
    }
};

window.CMSAuth = CMSAuth;
window.CMSAPI = CMSAPI;
window.API_BASE = API_BASE;
