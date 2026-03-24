// ============================================
// SERVICES MODULE — js/services.js
// Llamado desde index.html después de cargar el componente
// ============================================

window.initServices = function () {
    'use strict';

    /* ── DATOS DE LOS SERVICIOS ── */
    const SERVICES_DATA = {
        escuela: {
            title: 'Escuela de EPS',
            icon: 'school',
            category: 'Formación',
            desc: 'Formación corporativa continua y altamente especializada en modelos de gestión, enfocada en blindar la resiliencia administrativa de organizaciones del sector popular y solidario.',
            items: ['Gestión Empresarial', 'Contabilidad Tributaria', 'Estrategia Comercial', 'Liderazgo Cooperativo', 'Marketing Institucional'],
            label: 'Certificados de Aprobación',
            gradient: 'from-[#00552b] to-emerald-500',
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            dotColor: '#d4af37',
        },
        posicionamiento: {
            title: 'Posicionamiento',
            icon: 'storefront',
            category: 'Comercial',
            desc: 'Conexión directa, blindada y sin intermediación parasitaria hacia licitaciones institucionales y mercados élite finales.',
            items: ['Catálogo SERCOP', 'Ruedas de Negocio', 'Contratos a Futuro', 'Networking Estratégico', 'Ferias Internacionales'],
            label: 'Cadenas Formales',
            gradient: 'from-[#d4af37] to-[#b3922d]',
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
            dotColor: '#00552b',
        },
        auditoria: {
            title: 'Auditoría Legal',
            icon: 'gavel',
            category: 'Legal',
            desc: 'Soporte estructurado para obtención de personerías jurídicas, cumplimiento normativo (SRI, IESS) y resolución de disputas.',
            items: ['Personería Jurídica SEPS', 'Estatutos Notariados', 'Gestión Tributaria', 'Compliance Regulatorio', 'Defensa Patrimonial'],
            label: 'Protección Fiduciaria',
            gradient: 'from-[#00552b] to-emerald-500',
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            dotColor: '#d4af37',
        },
        capital: {
            title: 'Inyección de Capital',
            icon: 'payments',
            category: 'Financiero',
            desc: 'Nivelación y acceso prioritario a líneas de crédito fiduciario con colateral simplificado y métricas de tasa preferencial.',
            items: ['Financiamiento Activos', 'Líneas de Producción', 'Crédito Cooperativo', 'Capital Semilla', 'Fondos de Garantía'],
            label: 'Capital de Riesgo',
            gradient: 'from-[#d4af37] to-[#b3922d]',
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
            dotColor: '#00552b',
        },
        id: {
            title: 'I+D Certificado',
            icon: 'biotech',
            category: 'Formación',
            desc: 'Estandarización química e industrial de procesos para obtener BPM y trazabilidad exigida por mercados europeos o norteamericanos.',
            items: ['Notificación Sanitaria (ARCSA)', 'Manuales BPM', 'Auditoría ISO 9001', 'Normativa FDA / CE Mark', 'Trazabilidad de Cadena'],
            label: 'Estándares Globales',
            gradient: 'from-[#00552b] to-emerald-500',
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            dotColor: '#d4af37',
        },
        alianzas: {
            title: 'Macro Alianzas',
            icon: 'handshake',
            category: 'Comercial',
            desc: 'La Cámara CEPSE lidera frentes supra-nacionales, tejiendo convenios con ministerios y ONGs extranjeras para apalancar masivamente a nuestras bases.',
            items: ['Bilateralismo Estatal', 'Fondos No Reembolsables', 'Gremio Confederado', 'Convenios ONU', 'Cooperación UE'],
            label: 'Representatividad',
            gradient: 'from-[#00552b] to-emerald-500',
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
            dotColor: '#d4af37',
        },
    };

    /* ────────────────────────────────────────
       MODAL DE DETALLE
    ──────────────────────────────────────── */
    const modal   = document.getElementById('service-detail-modal');
    const overlay = document.getElementById('sdm-overlay');
    const panel   = modal ? modal.querySelector('.sdm-panel') : null;
    const closeBtn= document.getElementById('sdm-close');

    function openServiceModal(id) {
        const d = SERVICES_DATA[id];
        if (!d || !modal || !panel) return;

        document.getElementById('sdm-icon').textContent = d.icon;
        document.getElementById('sdm-icon-wrap').className =
            `w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-br ${d.gradient}`;
        document.getElementById('sdm-header').className =
            `h-2 w-full bg-gradient-to-r ${d.gradient}`;
        document.getElementById('sdm-badge').textContent = d.category;
        document.getElementById('sdm-badge').className =
            `text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border inline-block mb-2 ${d.badgeClass}`;
        document.getElementById('sdm-title').textContent = d.title;
        document.getElementById('sdm-desc').textContent  = d.desc;
        document.getElementById('sdm-label').textContent = d.label;
        document.getElementById('sdm-label').style.color = d.dotColor;

        const list = document.getElementById('sdm-items');
        list.innerHTML = d.items.map(item => `
            <li class="flex items-center gap-3">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background:${d.dotColor}"></span>
                <span class="text-[0.9rem] text-slate-700 font-medium">${item}</span>
            </li>`).join('');

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            panel.classList.remove('scale-95', 'opacity-0');
            panel.classList.add('scale-100', 'opacity-100');
        });
    }

    function closeServiceModal() {
        if (!modal || !panel) return;
        panel.classList.remove('scale-100', 'opacity-100');
        panel.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeServiceModal);
    if (overlay)  overlay.addEventListener('click', closeServiceModal);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeServiceModal();
    });

    document.querySelectorAll('.service-card').forEach(card => {
        const open = () => openServiceModal(card.dataset.serviceId);
        card.addEventListener('click', open);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });

    /* ────────────────────────────────────────
       FILTROS DE CATEGORÍA
    ──────────────────────────────────────── */
    const tabs  = document.querySelectorAll('.services-tab');
    const cards = document.querySelectorAll('.service-card');
    const empty = document.getElementById('services-empty');
    let activeFilter = 'all';
    let searchTerm   = '';

    function applyFilters() {
        let visible = 0;
        cards.forEach(card => {
            const cat  = card.dataset.category;
            const text = (card.querySelector('h4')?.textContent || '') +
                         (card.querySelector('p')?.textContent  || '');
            const matchFilter = activeFilter === 'all' || cat === activeFilter;
            const matchSearch = !searchTerm || text.toLowerCase().includes(searchTerm);
            if (matchFilter && matchSearch) {
                card.style.display = '';
                card.style.animation = 'fadeInUp 0.35s ease both';
                visible++;
            } else {
                card.style.display = 'none';
            }
        });
        if (empty) empty.classList.toggle('hidden', visible > 0);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active-tab','bg-[#00552b]','text-white','border-[#00552b]');
                t.classList.add('border-slate-200','text-slate-600','bg-white');
            });
            tab.classList.add('active-tab','bg-[#00552b]','text-white','border-[#00552b]');
            tab.classList.remove('border-slate-200','text-slate-600','bg-white');
            activeFilter = tab.dataset.filter;
            applyFilters();
        });
    });

    /* ────────────────────────────────────────
       BÚSQUEDA
    ──────────────────────────────────────── */
    const searchInput = document.getElementById('services-search');
    const searchClear = document.getElementById('services-search-clear');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchTerm = searchInput.value.trim().toLowerCase();
            if (searchClear) searchClear.classList.toggle('hidden', !searchTerm);
            applyFilters();
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchTerm = '';
            searchClear.classList.add('hidden');
            applyFilters();
            if (searchInput) searchInput.focus();
        });
    }

    /* ────────────────────────────────────────
       BOTÓN "VER TODOS"
    ──────────────────────────────────────── */
    const viewAllBtn = document.getElementById('services-view-all-btn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            const el = document.getElementById('services-container');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            tabs.forEach(t => {
                t.classList.remove('active-tab','bg-[#00552b]','text-white','border-[#00552b]');
                t.classList.add('border-slate-200','text-slate-600','bg-white');
            });
            if (tabs[0]) {
                tabs[0].classList.add('active-tab','bg-[#00552b]','text-white','border-[#00552b]');
                tabs[0].classList.remove('border-slate-200','text-slate-600','bg-white');
            }
            activeFilter = 'all';
            if (searchInput) searchInput.value = '';
            searchTerm = '';
            if (searchClear) searchClear.classList.add('hidden');
            applyFilters();
        });
    }

    /* ────────────────────────────────────────
       CONTADORES ANIMADOS DE MÉTRICAS
    ──────────────────────────────────────── */
    function animateServicesCounters() {
        document.querySelectorAll('[data-services-counter]').forEach(el => {
            const target = +el.getAttribute('data-services-counter');
            const step = 16;
            const steps = 1400 / step;
            let current = 0;
            const increment = target / steps;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target.toLocaleString('es-EC');
                    clearInterval(timer);
                } else {
                    el.textContent = Math.ceil(current).toLocaleString('es-EC');
                }
            }, step);
        });
    }

    const firstMetric = document.querySelector('.services-metric');
    if (firstMetric) {
        const metricsObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateServicesCounters();
                    metricsObserver.disconnect();
                }
            });
        }, { threshold: 0.3 });
        metricsObserver.observe(firstMetric);
    }

    /* ────────────────────────────────────────
       KEYFRAME fadeInUp
    ──────────────────────────────────────── */
    if (!document.getElementById('services-anim-style')) {
        const style = document.createElement('style');
        style.id = 'services-anim-style';
        style.textContent = `
            @keyframes fadeInUp {
                from { opacity:0; transform:translateY(16px); }
                to   { opacity:1; transform:translateY(0); }
            }`;
        document.head.appendChild(style);
    }

    /* ────────────────────────────────────────
       SIMULADOR DE SERVICIOS (3 pasos)
    ──────────────────────────────────────── */
    const RECOMENDACIONES = {
        cooperativa: {
            legal:      { inicio: ['auditoria','escuela'],        crecimiento: ['auditoria','capital'],       consolidado: ['alianzas','capital'] },
            financiero: { inicio: ['capital','auditoria'],        crecimiento: ['capital','alianzas'],         consolidado: ['capital','alianzas'] },
            mercado:    { inicio: ['posicionamiento','auditoria'],crecimiento: ['posicionamiento','alianzas'], consolidado: ['alianzas','posicionamiento'] },
            formacion:  { inicio: ['escuela','auditoria'],        crecimiento: ['escuela','id'],               consolidado: ['escuela','alianzas'] },
        },
        asociacion: {
            legal:      { inicio: ['auditoria','escuela'],        crecimiento: ['auditoria','posicionamiento'],consolidado: ['alianzas','auditoria'] },
            financiero: { inicio: ['capital','escuela'],          crecimiento: ['capital','posicionamiento'],  consolidado: ['capital','alianzas'] },
            mercado:    { inicio: ['posicionamiento','escuela'],  crecimiento: ['posicionamiento','id'],       consolidado: ['alianzas','posicionamiento'] },
            formacion:  { inicio: ['escuela','id'],               crecimiento: ['id','escuela'],               consolidado: ['id','alianzas'] },
        },
        emprendimiento: {
            legal:      { inicio: ['auditoria','escuela'],        crecimiento: ['auditoria','capital'],       consolidado: ['posicionamiento','capital'] },
            financiero: { inicio: ['capital','escuela'],          crecimiento: ['capital','id'],               consolidado: ['capital','alianzas'] },
            mercado:    { inicio: ['escuela','posicionamiento'],  crecimiento: ['posicionamiento','id'],       consolidado: ['alianzas','posicionamiento'] },
            formacion:  { inicio: ['escuela','id'],               crecimiento: ['id','escuela'],               consolidado: ['id','posicionamiento'] },
        },
        federacion: {
            legal:      { inicio: ['auditoria','escuela'],        crecimiento: ['alianzas','auditoria'],      consolidado: ['alianzas','capital'] },
            financiero: { inicio: ['capital','auditoria'],        crecimiento: ['alianzas','capital'],         consolidado: ['alianzas','capital'] },
            mercado:    { inicio: ['alianzas','posicionamiento'], crecimiento: ['alianzas','posicionamiento'], consolidado: ['alianzas','id'] },
            formacion:  { inicio: ['escuela','id'],               crecimiento: ['escuela','alianzas'],         consolidado: ['alianzas','id'] },
        },
    };

    const RESUMEN = {
        escuela:         { icon:'school',     title:'Escuela de EPS',       color:'#00552b', why:'Fortalecerá la gestión interna y cumplimiento administrativo.' },
        posicionamiento: { icon:'storefront', title:'Posicionamiento',       color:'#d4af37', why:'Ampliará canales de venta hacia licitaciones y mercados formales.' },
        auditoria:       { icon:'gavel',      title:'Auditoría Legal',       color:'#00552b', why:'Garantizará cumplimiento normativo ante SEPS, SRI e IESS.' },
        capital:         { icon:'payments',   title:'Inyección de Capital',  color:'#d4af37', why:'Habilitará líneas de crédito preferencial para su producción.' },
        id:              { icon:'biotech',    title:'I+D Certificado',       color:'#00552b', why:'Abrirá mercados internacionales con certificación BPM e ISO.' },
        alianzas:        { icon:'handshake',  title:'Macro Alianzas',        color:'#00552b', why:'Conectará con fondos no reembolsables y convenios ministeriales.' },
    };

    const nextBtn    = document.getElementById('sim-next');
    const backBtn    = document.getElementById('sim-back');
    const navDiv     = document.getElementById('sim-nav');
    const restartBtn = document.getElementById('sim-restart');
    const progressBar= document.getElementById('sim-progress-bar');

    if (!nextBtn) return; // Simulador no presente en el DOM

    let current = 1;
    const answers = {};

    function bindOptions(stepEl) {
        stepEl.querySelectorAll('.sim-option').forEach(label => {
            // Evitar listeners dobles
            const clone = label.cloneNode(true);
            label.parentNode.replaceChild(clone, label);
            clone.addEventListener('click', () => {
                const group = clone.closest('[id^="sim-q"]');
                group.querySelectorAll('.sim-option > div').forEach(d => {
                    d.classList.remove('!border-[#00552b]','border-[#00552b]','bg-emerald-50','border-emerald-400');
                });
                clone.querySelector('div').classList.add('border-[#00552b]','bg-emerald-50');
                answers[`q${current}`] = clone.dataset.value;
                nextBtn.disabled = false;
            });
        });
    }

    function showStep(n) {
        document.querySelectorAll('.sim-step').forEach(s => s.classList.add('hidden'));
        const el = document.getElementById(`sim-step-${n}`);
        if (el) { el.classList.remove('hidden'); bindOptions(el); }

        [1,2,3].forEach(i => {
            const dot = document.getElementById(`sim-dot-${i}`);
            if (!dot) return;
            if (i <= n) { dot.classList.add('bg-[#00552b]'); dot.classList.remove('bg-slate-200'); }
            else        { dot.classList.remove('bg-[#00552b]'); dot.classList.add('bg-slate-200'); }
        });

        const stepLabel = document.getElementById('sim-step-label');
        if (stepLabel) stepLabel.textContent = `Paso ${n} de 3`;
        if (progressBar) progressBar.style.width = `${Math.round((n / 3) * 100)}%`;

        backBtn.classList.toggle('hidden', n === 1);
        nextBtn.innerHTML = n < 3
            ? 'Siguiente <span class="material-symbols-outlined text-base leading-none align-middle">arrow_forward</span>'
            : 'Ver mi plan <span class="material-symbols-outlined text-base leading-none align-middle">auto_awesome</span>';
        nextBtn.disabled = !answers[`q${n}`];
        current = n;
    }

    function showResult() {
        document.querySelectorAll('.sim-step').forEach(s => s.classList.add('hidden'));
        const resultEl = document.getElementById('sim-result');
        if (resultEl) resultEl.classList.remove('hidden');
        if (navDiv)   navDiv.classList.add('hidden');
        if (progressBar) progressBar.style.width = '100%';
        const stepLabel = document.getElementById('sim-step-label');
        if (stepLabel) stepLabel.textContent = '¡Plan listo!';

        const ids = (RECOMENDACIONES[answers.q1]?.[answers.q2]?.[answers.q3]) || ['escuela','auditoria'];
        const container = document.getElementById('sim-result-cards');
        if (!container) return;

        container.innerHTML = ids.map((id, i) => {
            const s = RESUMEN[id];
            const rank = i === 0 ? '⭐ Recomendación principal' : '✦ Complementario';
            return `
            <div class="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50" style="animation:fadeInUp .4s ease ${i * 0.1}s both">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:${s.color}20">
                    <span class="material-symbols-outlined text-xl" style="color:${s.color}">${s.icon}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-0.5">
                        <p class="font-black text-slate-900 text-sm">${s.title}</p>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="color:${s.color};background:${s.color}15">${rank}</span>
                    </div>
                    <p class="text-slate-500 text-xs leading-relaxed">${s.why}</p>
                </div>
            </div>`;
        }).join('');
    }

    nextBtn.addEventListener('click', () => {
        if (current < 3) showStep(current + 1);
        else showResult();
    });

    backBtn.addEventListener('click', () => {
        if (current > 1) showStep(current - 1);
    });

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            delete answers.q1; delete answers.q2; delete answers.q3;
            const resultEl = document.getElementById('sim-result');
            if (resultEl) resultEl.classList.add('hidden');
            if (navDiv)   navDiv.classList.remove('hidden');
            showStep(1);
            document.querySelectorAll('.sim-option > div').forEach(d =>
                d.classList.remove('border-[#00552b]','bg-emerald-50'));
        });
    }

    // Arrancar en el paso 1
    showStep(1);
};
