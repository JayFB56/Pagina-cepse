/* ============================================================
   CEPSE CMS — Editor de publicaciones
   ============================================================ */

(async function init() {
    if (!CMSAuth.requireAuth()) return;

    const me = await CMSAuth.fetchMe();
    if (!me) { CMSAuth.clear(); window.location.href = 'index.html'; return; }
    document.getElementById('sb-username').textContent = me.username;
    document.getElementById('sb-role').textContent = me.role === 'admin' ? 'Administrador' : 'Presidente';
    document.getElementById('logout-btn').addEventListener('click', () => CMSAuth.logout());

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');
    const presetSection = params.get('section');

    const $ = (id) => document.getElementById(id);
    const errEl = $('editor-error');
    const okEl = $('editor-success');

    // ---- Quill ----
    const quill = new Quill('#quill-editor', {
        theme: 'snow',
        placeholder: 'Escribe el contenido completo de la publicación...',
        modules: {
            toolbar: [
                [{ header: [2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'blockquote'],
                [{ align: [] }],
                ['clean']
            ]
        }
    });

    // ---- Sección + fecha del evento ----
    const sectionEl = $('section');
    const eventGroup = $('event-date-group');
    function toggleEventDate() {
        eventGroup.style.display = sectionEl.value === 'eventos' ? 'block' : 'none';
    }
    sectionEl.addEventListener('change', toggleEventDate);
    if (presetSection) sectionEl.value = presetSection;
    toggleEventDate();

    // ---- Imagen ----
    const imageInput = $('image-input');
    const preview = $('image-preview');
    const imageUrlField = $('image_url');
    const removeBtn = $('remove-image-btn');

    function renderPreview(url) {
        if (url) {
            const fullUrl = url.startsWith('http') ? url : `${window.API_BASE}${url}`;
            preview.innerHTML = `<img src="${fullUrl}" alt="">`;
            removeBtn.classList.remove('hidden');
        } else {
            preview.innerHTML = '<span class="empty">Sin imagen seleccionada</span>';
            removeBtn.classList.add('hidden');
        }
    }

    imageInput.addEventListener('change', async () => {
        const file = imageInput.files[0];
        if (!file) return;
        preview.innerHTML = '<span class="empty"><span class="spinner"></span> Subiendo...</span>';
        const r = await CMSAPI.upload(file);
        if (!r.ok) {
            showError(r.error);
            renderPreview(imageUrlField.value);
            return;
        }
        imageUrlField.value = r.url;
        renderPreview(r.url);
    });

    removeBtn.addEventListener('click', () => {
        imageUrlField.value = '';
        imageInput.value = '';
        renderPreview('');
    });

    // ---- Cargar publicación si editamos ----
    if (editId) {
        $('editor-title').textContent = 'Editar publicación';
        $('editor-subtitle').textContent = 'Actualiza el contenido y guarda los cambios.';
        const r = await CMSAPI.get(`/api/cms/posts/${editId}`);
        if (!r.ok) {
            showError(r.error);
        } else {
            const p = r.data;
            $('title').value = p.title || '';
            $('summary').value = p.summary || '';
            sectionEl.value = p.section;
            $('status').value = p.status;
            $('event_date').value = p.event_date || '';
            imageUrlField.value = p.image_url || '';
            renderPreview(p.image_url);
            if (p.content) quill.root.innerHTML = p.content;
            toggleEventDate();
        }
    }

    // ---- Guardar ----
    async function save(forceStatus) {
        clearMessages();
        const title = $('title').value.trim();
        if (!title) return showError('El título es obligatorio.');

        const payload = {
            title,
            summary: $('summary').value.trim(),
            content: quill.root.innerHTML,
            section: sectionEl.value,
            status: forceStatus || $('status').value,
            image_url: imageUrlField.value || null,
            event_date: sectionEl.value === 'eventos' ? ($('event_date').value || null) : null
        };

        setBusy(true);
        const r = editId
            ? await CMSAPI.put(`/api/cms/posts/${editId}`, payload)
            : await CMSAPI.post('/api/cms/posts', payload);
        setBusy(false);

        if (!r.ok) return showError(r.error);

        showSuccess(editId ? 'Cambios guardados.' : 'Publicación creada.');

        // Si era nueva, comportamiento según estado: publicar limpia el formulario,
        // guardar en borrador redirige al editor para edición posterior.
        const resultingStatus = r.data && r.data.status ? r.data.status : (forceStatus || $('status').value);

        if (!editId && r.data && r.data.id) {
            if (resultingStatus === 'published') {
                clearForm();
            } else {
                setTimeout(() => {
                    window.location.href = `editor.html?id=${r.data.id}`;
                }, 700);
            }
        } else {
            $('status').value = r.data.status;
        }
    }

    $('save-draft-btn').addEventListener('click', () => save('draft'));
    $('publish-btn').addEventListener('click', () => save('published'));
    $('cancel-btn').addEventListener('click', () => {
        if (confirm('¿Descartar cambios y volver al panel?')) {
            window.location.href = 'dashboard.html';
        }
    });

    function showError(msg) {
        okEl.classList.add('hidden');
        errEl.textContent = msg;
        errEl.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function showSuccess(msg) {
        errEl.classList.add('hidden');
        okEl.textContent = msg;
        okEl.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function clearMessages() {
        errEl.classList.add('hidden');
        okEl.classList.add('hidden');
    }
    function clearForm() {
        $('title').value = '';
        $('summary').value = '';
        quill.root.innerHTML = '';
        sectionEl.value = presetSection || 'noticias';
        $('status').value = 'draft';
        $('event_date').value = '';
        imageUrlField.value = '';
        imageInput.value = '';
        renderPreview('');
        setBusy(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function setBusy(busy) {
        $('save-draft-btn').disabled = busy;
        $('publish-btn').disabled = busy;
    }
})();
