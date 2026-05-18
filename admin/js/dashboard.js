/* ============================================================
   CEPSE CMS — Dashboard
   ============================================================ */

(async function init() {
    if (!CMSAuth.requireAuth()) return;

    const me = await CMSAuth.fetchMe();
    if (!me) { CMSAuth.clear(); window.location.href = 'index.html'; return; }

    document.getElementById('sb-username').textContent = me.username;
    document.getElementById('sb-role').textContent = me.role === 'admin' ? 'Administrador' : 'Presidente';

    if (me.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    }

    document.getElementById('logout-btn').addEventListener('click', () => CMSAuth.logout());

    const links = document.querySelectorAll('.sidebar-link[data-view]');
    const views = document.querySelectorAll('.view');

    function showView(viewName, opts = {}) {
        links.forEach(l => l.classList.toggle('active',
            l.dataset.view === viewName && (!opts.section || l.dataset.section === opts.section)));
        views.forEach(v => v.classList.toggle('hidden', v.id !== `view-${viewName}`));

        if (viewName === 'overview') loadOverview();
        if (viewName === 'posts') loadPostsView(opts.section || '');
        if (viewName === 'users') loadUsersView();
        if (viewName === 'activity') loadActivityView();
    }

    links.forEach(l => l.addEventListener('click', () => {
        showView(l.dataset.view, { section: l.dataset.section });
    }));

    // ============================================================
    // OVERVIEW
    // ============================================================
    async function loadOverview() {
        const metricsEl = document.getElementById('metric-grid');
        metricsEl.innerHTML = '<div class="text-soft text-sm">Cargando métricas...</div>';

        const m = await CMSAPI.get('/api/cms/metrics');
        if (!m.ok) { metricsEl.innerHTML = `<div class="form-error">${m.error}</div>`; return; }

        const sections = [
            { key: 'noticias', label: 'Noticias', cls: '' },
            { key: 'comunicados', label: 'Comunicados', cls: 'gold' },
            { key: 'eventos', label: 'Eventos', cls: '' },
            { key: 'destacados', label: 'Destacados', cls: 'gold' }
        ];
        metricsEl.innerHTML = sections.map(s => {
            const d = m.data[s.key] || { published: 0, draft: 0, total: 0 };
            return `
                <div class="metric-card ${s.cls}">
                    <div class="metric-label">${s.label}</div>
                    <div class="metric-value">${d.published}</div>
                    <div class="metric-meta">${d.draft} en borrador · ${d.total} totales</div>
                </div>`;
        }).join('');

        const sectionFilter = document.getElementById('recent-section');
        sectionFilter.onchange = renderRecent;
        await renderRecent();

        // Hook: botón para rotar vídeo (disponible para admin y presidente)
        const rotateBtn = document.getElementById('rotate-video-btn');
        if (rotateBtn) {
            rotateBtn.onclick = async () => {
                if (!confirm('¿Desea rotar el vídeo ahora y reiniciar el temporizador de 10 horas?')) return;
                rotateBtn.disabled = true;
                rotateBtn.textContent = 'Rotando...';
                const r = await CMSAPI.post('/api/cms/news/rotate-video');
                rotateBtn.disabled = false;
                rotateBtn.textContent = '🔁 Rotar vídeo';
                if (!r.ok) return alert(r.error || 'Error al rotar el vídeo');
                alert('Vídeo rotado correctamente. El cambio se aplicará en la web.');
            };
        }
    }

    async function renderRecent() {
        const tbody = document.querySelector('#recent-table tbody');
        tbody.innerHTML = '<tr><td colspan="6" class="text-soft text-sm">Cargando...</td></tr>';
        const section = document.getElementById('recent-section').value;
        const qs = new URLSearchParams({ perPage: 10 });
        if (section) qs.set('section', section);
        const r = await CMSAPI.get(`/api/cms/posts?${qs.toString()}`);
        if (!r.ok) { tbody.innerHTML = `<tr><td colspan="6" class="form-error">${r.error}</td></tr>`; return; }
        renderPostsRows(tbody, r.rows);
    }

    // ============================================================
    // POSTS POR SECCIÓN
    // ============================================================
    let currentSection = '';
    let searchDebounce = null;

    async function loadPostsView(section) {
        currentSection = section;
        const titles = {
            noticias: 'Noticias', comunicados: 'Comunicados',
            eventos: 'Eventos', destacados: 'Destacados', '': 'Publicaciones'
        };
        document.getElementById('posts-title').textContent = titles[section] || 'Publicaciones';
        document.getElementById('posts-subtitle').textContent =
            section ? `Listado de ${titles[section].toLowerCase()}.` : 'Listado completo.';
        document.getElementById('posts-new-btn').href =
            'editor.html' + (section ? `?section=${section}` : '');

        document.getElementById('posts-status').onchange = renderPosts;
        document.getElementById('posts-search').oninput = () => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(renderPosts, 250);
        };
        await renderPosts();
    }

    async function renderPosts() {
        const tbody = document.querySelector('#posts-table tbody');
        tbody.innerHTML = '<tr><td colspan="6" class="text-soft text-sm">Cargando...</td></tr>';

        const qs = new URLSearchParams({ perPage: 100 });
        if (currentSection) qs.set('section', currentSection);
        const status = document.getElementById('posts-status').value;
        if (status) qs.set('status', status);

        const r = await CMSAPI.get(`/api/cms/posts?${qs.toString()}`);
        if (!r.ok) { tbody.innerHTML = `<tr><td colspan="6" class="form-error">${r.error}</td></tr>`; return; }

        const search = document.getElementById('posts-search').value.toLowerCase().trim();
        const filtered = search
            ? r.rows.filter(p => p.title.toLowerCase().includes(search))
            : r.rows;

        renderPostsRows(tbody, filtered);
    }

    function renderPostsRows(tbody, rows) {
        if (!rows || rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Sin publicaciones por ahora.</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(p => `
            <tr>
                <td><strong>${escapeHtml(p.title)}</strong></td>
                <td><span class="badge badge-section">${p.section}</span></td>
                <td>${p.status === 'published'
                    ? '<span class="badge badge-published">Publicado</span>'
                    : '<span class="badge badge-draft">Borrador</span>'}</td>
                <td>${escapeHtml(p.author_username || '—')}</td>
                <td class="text-sm text-soft">${formatDate(p.updated_at)}</td>
                <td class="actions">
                    <a class="btn btn-secondary btn-sm" href="editor.html?id=${p.id}">Editar</a>
                    ${p.status === 'published'
                        ? `<button class="btn btn-ghost btn-sm" data-action="unpublish" data-id="${p.id}">Despublicar</button>`
                        : `<button class="btn btn-primary btn-sm" data-action="publish" data-id="${p.id}">Publicar</button>`}
                    <button class="btn btn-danger btn-sm" data-action="delete" data-id="${p.id}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => handlePostAction(btn.dataset.action, btn.dataset.id));
        });
    }

    async function handlePostAction(action, id) {
        if (action === 'delete') {
            if (!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
            const r = await CMSAPI.del(`/api/cms/posts/${id}`);
            if (!r.ok) return alert(r.error);
        } else if (action === 'publish') {
            const r = await CMSAPI.post(`/api/cms/posts/${id}/publish`);
            if (!r.ok) return alert(r.error);
        } else if (action === 'unpublish') {
            const r = await CMSAPI.post(`/api/cms/posts/${id}/unpublish`);
            if (!r.ok) return alert(r.error);
        }
        // Refrescar la vista activa
        const activeView = document.querySelector('.view:not(.hidden)').id.replace('view-', '');
        if (activeView === 'overview') renderRecent();
        else renderPosts();
    }

    // ============================================================
    // USERS (admin)
    // ============================================================
    async function loadUsersView() {
        const newBtn = document.getElementById('new-user-btn');
        const panel = document.getElementById('new-user-panel');
        const errEl = document.getElementById('new-user-error');
        const okEl = document.getElementById('new-user-success');

        newBtn.onclick = () => panel.classList.toggle('hidden');
        document.getElementById('nu-cancel').onclick = () => panel.classList.add('hidden');

        document.getElementById('nu-create').onclick = async () => {
            errEl.classList.add('hidden'); okEl.classList.add('hidden');
            const username = document.getElementById('nu-username').value.trim();
            const password = document.getElementById('nu-password').value;
            const role = document.getElementById('nu-role').value;
            const r = await CMSAPI.post('/api/cms/users', { username, password, role });
            if (!r.ok) {
                errEl.textContent = r.error; errEl.classList.remove('hidden'); return;
            }
            okEl.textContent = `Usuario "${username}" creado.`;
            okEl.classList.remove('hidden');
            document.getElementById('nu-username').value = '';
            document.getElementById('nu-password').value = '';
            await renderUsers();
        };

        const editPanel = document.getElementById('edit-user-panel');
        document.getElementById('eu-cancel').onclick = () => editPanel.classList.add('hidden');
        document.getElementById('eu-save').onclick = async () => {
            const euErr = document.getElementById('edit-user-error');
            const euOk = document.getElementById('edit-user-success');
            euErr.classList.add('hidden'); euOk.classList.add('hidden');
            
            const id = document.getElementById('eu-id').value;
            const password = document.getElementById('eu-password').value;
            
            const r = await CMSAPI.put(`/api/cms/users/${id}/password`, { password });
            if (!r.ok) {
                euErr.textContent = r.error; euErr.classList.remove('hidden'); return;
            }
            euOk.textContent = 'Contraseña actualizada correctamente.';
            euOk.classList.remove('hidden');
            document.getElementById('eu-password').value = '';
        };

        await renderUsers();
    }

    async function renderUsers() {
        const tbody = document.querySelector('#users-table tbody');
        tbody.innerHTML = '<tr><td colspan="6" class="text-soft text-sm">Cargando...</td></tr>';
        const r = await CMSAPI.get('/api/cms/users');
        if (!r.ok) { tbody.innerHTML = `<tr><td colspan="6" class="form-error">${r.error}</td></tr>`; return; }
        if (!r.data.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Sin usuarios.</td></tr>';
            return;
        }
        tbody.innerHTML = r.data.map(u => `
            <tr>
                <td>${u.id}</td>
                <td><strong>${escapeHtml(u.username)}</strong></td>
                <td><span class="badge badge-role ${u.role}">${u.role === 'admin' ? 'Administrador' : 'Presidente'}</span></td>
                <td>${u.active ? '<span class="badge badge-published">Activo</span>' : '<span class="badge badge-draft">Inactivo</span>'}</td>
                <td class="text-sm text-soft">${u.last_login ? formatDate(u.last_login) : 'Nunca'}</td>
                <td class="actions">
                    <button class="btn btn-secondary btn-sm" data-edit="${u.id}" data-username="${escapeHtml(u.username)}">Editar</button>
                    <button class="btn btn-secondary btn-sm" data-toggle="${u.id}">
                        ${u.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button class="btn btn-danger btn-sm" data-delete="${u.id}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('¿Cambiar el estado de este usuario?')) return;
                const r = await CMSAPI.put(`/api/cms/users/${btn.dataset.toggle}/toggle`);
                if (!r.ok) return alert(r.error);
                await renderUsers();
            });
        });

        tbody.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('¿Eliminar permanentemente este usuario? Esta acción no se puede deshacer.')) return;
                const r = await CMSAPI.del(`/api/cms/users/${btn.dataset.delete}`);
                if (!r.ok) return alert(r.error);
                await renderUsers();
            });
        });

        tbody.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('eu-id').value = btn.dataset.edit;
                document.getElementById('eu-username').textContent = btn.dataset.username;
                document.getElementById('eu-password').value = '';
                document.getElementById('edit-user-error').classList.add('hidden');
                document.getElementById('edit-user-success').classList.add('hidden');
                document.getElementById('edit-user-panel').classList.remove('hidden');
            });
        });
    }

    // ============================================================
    // ACTIVITY (admin)
    // ============================================================
    async function loadActivityView() {
        document.getElementById('refresh-activity').onclick = renderActivity;
        await renderActivity();
    }

    async function renderActivity() {
        const list = document.getElementById('activity-list');
        list.innerHTML = '<div class="panel-body text-soft text-sm">Cargando...</div>';
        const r = await CMSAPI.get('/api/cms/activity?limit=200');
        if (!r.ok) { list.innerHTML = `<div class="panel-body form-error">${r.error}</div>`; return; }
        if (!r.data.length) {
            list.innerHTML = '<div class="empty-state">Sin actividad registrada.</div>';
            return;
        }
        list.innerHTML = r.data.map(a => `
            <div class="activity-row">
                <div class="activity-time">${formatDate(a.created_at)}</div>
                <div>
                    <span class="activity-user">${escapeHtml(a.username || 'sistema')}</span>
                    <span class="activity-action"> · ${escapeHtml(actionLabel(a.action))}</span>
                    ${a.details ? `<div class="activity-detail">${escapeHtml(a.details)}</div>` : ''}
                </div>
                <div class="text-sm text-soft">${escapeHtml(a.ip_address || '')}</div>
            </div>
        `).join('');
    }

    // ============================================================
    // HELPERS
    // ============================================================
    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function formatDate(s) {
        if (!s) return '—';
        const d = new Date(s.replace(' ', 'T') + (s.includes('Z') ? '' : 'Z'));
        if (isNaN(d.getTime())) return s;
        return d.toLocaleString('es-EC', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function actionLabel(a) {
        const map = {
            login: 'inició sesión',
            login_failed: 'intento fallido de login',
            logout: 'cerró sesión',
            post_create: 'creó una publicación',
            post_update: 'actualizó una publicación',
            post_delete: 'eliminó una publicación',
            post_publish: 'publicó una entrada',
            post_unpublish: 'despublicó una entrada',
            user_create: 'creó un usuario',
            user_toggle: 'cambió estado de usuario',
            upload: 'subió una imagen'
        };
        return map[a] || a;
    }

    // Vista inicial
    showView('overview');
})();
