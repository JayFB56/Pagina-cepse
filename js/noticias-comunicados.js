// ============================================
// NOTICIAS-COMUNICADOS MODULE — js/noticias-comunicados.js
// Integración de Noticias, Comunicados, Eventos y Destacados
// ============================================

window.initNoticiasComponent = function() {
    'use strict';

    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : '';

    const SECTIONS = {
        noticias: { icon: '🏛️', color: 'emerald', label: 'Noticias' },
        comunicados: { icon: '📄', color: 'blue', label: 'Comunicados' },
        eventos: { icon: '📅', color: 'amber', label: 'Eventos' },
        destacados: { icon: '⭐', color: 'purple', label: 'Destacados' }
    };

    const CATEGORY_COLORS = {
        noticias: { bg: '#dcfce7', text: '#15803d', badge: 'category-noticias' },
        comunicados: { bg: '#dbeafe', text: '#0c4a6e', badge: 'category-comunicados' },
        eventos: { bg: '#fef3c7', text: '#92400e', badge: 'category-eventos' },
        destacados: { bg: '#f3e8ff', text: '#6b21a8', badge: 'category-destacados' }
    };

    let state = {
        allPosts: {},
        currentFilter: 'noticias',
        heroIndex: 0,
        heroAutoplayInterval: null,
        loading: true,
        error: null
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const heroContainer = document.getElementById('hero-news-container');
    const heroSkeleton = document.getElementById('hero-skeleton');
    const postsContainer = document.getElementById('posts-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const emptyState = document.getElementById('empty-state');
    const errorState = document.getElementById('error-state');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const retryBtn = document.getElementById('retry-btn');
    const retryErrorBtn = document.getElementById('retry-error-btn');

    if (!heroContainer || !postsContainer) return;

    // ============================================
    // FETCH DATA
    // ============================================
    async function fetchAllPosts() {
        state.loading = true;
        state.error = null;
        showLoadingState();

        try {
            const promises = Object.keys(SECTIONS).map(section =>
                fetch(`${API_BASE}/api/public/posts?section=${section}&limit=20`)
                    .then(r => r.json())
                    .then(data => ({
                        section,
                        posts: (data.success && data.data) ? data.data : []
                    }))
                    .catch(() => ({ section, posts: [] }))
            );

            const results = await Promise.all(promises);

            state.allPosts = {};
            results.forEach(({ section, posts }) => {
                state.allPosts[section] = posts;
            });

            state.loading = false;
            renderContent();
        } catch (err) {
            state.error = err.message;
            state.loading = false;
            showErrorState();
        }
    }

    // ============================================
    // RENDER FUNCTIONS
    // ============================================
    function showLoadingState() {
        heroSkeleton.style.display = 'block';
        postsContainer.innerHTML = `
            <div class="h-96 bg-slate-200 rounded-2xl overflow-hidden relative">
                <div class="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer"></div>
            </div>
            <div class="h-96 bg-slate-200 rounded-2xl overflow-hidden relative">
                <div class="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer"></div>
            </div>
            <div class="h-96 bg-slate-200 rounded-2xl overflow-hidden relative">
                <div class="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer"></div>
            </div>
        `;
        emptyState.classList.add('hidden');
        errorState.classList.add('hidden');
        loadMoreBtn.classList.add('hidden');
    }

    function showErrorState() {
        heroSkeleton.style.display = 'none';
        postsContainer.innerHTML = '';
        errorState.classList.remove('hidden');
        emptyState.classList.add('hidden');
        loadMoreBtn.classList.add('hidden');
    }

    function showEmptyState() {
        heroSkeleton.style.display = 'none';
        postsContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        errorState.classList.add('hidden');
        loadMoreBtn.classList.add('hidden');
    }

    function renderContent() {
        const posts = state.allPosts[state.currentFilter] || [];

        if (posts.length === 0) {
            showEmptyState();
            return;
        }

        heroSkeleton.style.display = 'none';
        emptyState.classList.add('hidden');
        errorState.classList.add('hidden');

        // Render hero
        renderHero(posts[0]);

        // Render grid
        renderGrid(posts.slice(1));

        // Setup autoplay
        setupHeroAutoplay(posts);
    }

    function renderHero(post) {
        const colors = CATEGORY_COLORS[state.currentFilter] || CATEGORY_COLORS.noticias;
        const formattedDate = formatDate(post.published_at || post.created_at);
        const imageUrl = post.image_url || null;
        const hasImage = imageUrl && imageUrl.trim() !== '';

        const backgroundStyle = hasImage
            ? `background-image: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url('${imageUrl}'); background-size: cover; background-position: center;`
            : `background: linear-gradient(135deg, ${colors.bg}, ${adjustBrightness(colors.bg, -20)});`;

        const heroHTML = `
            <div class="relative w-full h-96 md:h-[28rem] rounded-3xl overflow-hidden group/hero" style="${backgroundStyle}">
                ${!hasImage ? `
                    <div class="absolute inset-0 flex items-center justify-center text-opacity-20">
                        <div class="text-9xl opacity-20">${SECTIONS[state.currentFilter].icon}</div>
                    </div>
                ` : ''}

                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-10 text-white hero-content">
                    <div class="mb-4">
                        <span class="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                              style="background-color: rgba(255,255,255,0.2); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.3);">
                            ${SECTIONS[state.currentFilter].label}
                        </span>
                    </div>
                    <h3 class="text-2xl md:text-4xl font-black font-serif mb-3 leading-tight line-clamp-3">${escapeHtml(post.title)}</h3>
                    ${post.summary ? `<p class="text-sm md:text-base text-white/90 mb-4 line-clamp-2">${escapeHtml(post.summary)}</p>` : ''}
                    <div class="flex items-center justify-between">
                        <span class="text-xs md:text-sm font-bold opacity-80">📅 ${formattedDate}</span>
                        <button onclick="window.location.href='#'" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-sm transition-all hover:shadow-lg">
                            Leer más →
                        </button>
                    </div>
                </div>

                <!-- Hero navigation buttons (hidden on mobile, shown on desktop) -->
                <button id="hero-prev" class="hero-nav-btn absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex z-20 opacity-0 group-hover/hero:opacity-100 transition-opacity">←</button>
                <button id="hero-next" class="hero-nav-btn absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex z-20 opacity-0 group-hover/hero:opacity-100 transition-opacity">→</button>

                <!-- Hero indicators -->
                <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    ${state.allPosts[state.currentFilter].slice(0, 5).map((_, i) => `
                        <button class="hero-indicator w-2.5 h-2.5 rounded-full transition-all ${i === state.heroIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'}"
                                onclick="window.heroGoTo(${i})"></button>
                    `).join('')}
                </div>
            </div>
        `;

        heroContainer.innerHTML = heroHTML;

        // Attach button listeners
        document.getElementById('hero-prev')?.addEventListener('click', () => heroPrevious());
        document.getElementById('hero-next')?.addEventListener('click', () => heroNext());
    }

    function renderGrid(posts) {
        const gridHTML = posts.map((post, idx) => {
            const colors = CATEGORY_COLORS[state.currentFilter] || CATEGORY_COLORS.noticias;
            const formattedDate = formatDate(post.published_at || post.created_at);
            const imageUrl = post.image_url || null;
            const hasImage = imageUrl && imageUrl.trim() !== '';

            const imageStyle = hasImage
                ? `background-image: url('${imageUrl}'); background-size: cover; background-position: center;`
                : `background: linear-gradient(135deg, ${colors.bg}, ${adjustBrightness(colors.bg, -15)});`;

            return `
                <div class="post-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100/50 flex flex-col h-full group/card">
                    <!-- Image/Visual -->
                    <div class="relative h-48 overflow-hidden bg-slate-200 group-hover/card:scale-105 transition-transform duration-500" style="${imageStyle}">
                        ${!hasImage ? `
                            <div class="absolute inset-0 flex items-center justify-center opacity-30">
                                <div class="text-6xl">${SECTIONS[state.currentFilter].icon}</div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Content -->
                    <div class="p-5 md:p-6 flex flex-col flex-grow">
                        <!-- Badge -->
                        <div class="mb-3">
                            <span class="category-badge ${colors.badge}">
                                ${SECTIONS[state.currentFilter].label}
                            </span>
                        </div>

                        <!-- Title -->
                        <h4 class="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover/card:text-emerald-600 transition-colors">
                            ${escapeHtml(post.title)}
                        </h4>

                        <!-- Summary -->
                        ${post.summary ? `
                            <p class="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
                                ${escapeHtml(post.summary)}
                            </p>
                        ` : ''}

                        <!-- Footer -->
                        <div class="border-t border-slate-100 pt-4 mt-auto">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold text-slate-400">
                                    📅 ${formattedDate}
                                </span>
                                <span class="text-sm font-bold text-emerald-600 group-hover/card:translate-x-1 transition-transform">
                                    →
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        postsContainer.innerHTML = gridHTML || '<p class="col-span-full text-center text-slate-500">No hay más contenido</p>';
    }

    // ============================================
    // HERO CAROUSEL
    // ============================================
    function setupHeroAutoplay(posts) {
        clearInterval(state.heroAutoplayInterval);
        state.heroIndex = 0;

        if (posts.length > 1) {
            state.heroAutoplayInterval = setInterval(() => {
                state.heroIndex = (state.heroIndex + 1) % posts.length;
                updateHero(posts);
            }, 6000);
        }
    }

    function heroPrevious() {
        const posts = state.allPosts[state.currentFilter];
        state.heroIndex = (state.heroIndex - 1 + posts.length) % posts.length;
        updateHero(posts);
        resetAutoplay(posts);
    }

    function heroNext() {
        const posts = state.allPosts[state.currentFilter];
        state.heroIndex = (state.heroIndex + 1) % posts.length;
        updateHero(posts);
        resetAutoplay(posts);
    }

    function updateHero(posts) {
        renderHero(posts[state.heroIndex]);
    }

    function resetAutoplay(posts) {
        clearInterval(state.heroAutoplayInterval);
        if (posts.length > 1) {
            state.heroAutoplayInterval = setInterval(() => {
                state.heroIndex = (state.heroIndex + 1) % posts.length;
                updateHero(posts);
            }, 6000);
        }
    }

    // Global hero navigation function
    window.heroGoTo = function(index) {
        const posts = state.allPosts[state.currentFilter];
        state.heroIndex = index;
        updateHero(posts);
        resetAutoplay(posts);
    };

    // ============================================
    // FILTER HANDLING
    // ============================================
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            if (filter === state.currentFilter) return;

            state.currentFilter = filter;
            state.heroIndex = 0;

            // Update button styles
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Re-render
            renderContent();
        });
    });

    // ============================================
    // EVENT LISTENERS
    // ============================================
    retryBtn.addEventListener('click', fetchAllPosts);
    retryErrorBtn.addEventListener('click', fetchAllPosts);

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function formatDate(dateStr) {
        if (!dateStr) return 'Sin fecha';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function adjustBrightness(color, percent) {
        // Simple hex brightness adjustment
        return color;
    }

    // ============================================
    // VIDEO AUTOMÁTICO Y TICKER
    // ============================================
    async function loadNewsVideo() {
        try {
            const res = await fetch(`${API_BASE}/api/news/video`);
            if (!res.ok) return;
            const json = await res.json();
            const container = document.getElementById('news-video');
            if (!container) return;

            if (json.success && json.data && json.data.selected && json.data.selected.videoId) {
                const vid = json.data.selected.videoId;
                const embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&rel=0`;
                container.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`;
            } else {
                container.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white">No hay vídeo disponible</div>';
            }
        } catch (err) {
            console.error('Error loading news video:', err);
        }
    }

    async function loadTicker() {
        try {
            const res = await fetch(`${API_BASE}/api/noticias?limit=20`);
            if (!res.ok) return;
            const json = await res.json();
            const content = document.getElementById('news-ticker-content');
            if (!content) return;

            if (json.success && Array.isArray(json.data)) {
                const titles = json.data.map(item => item.title || '').filter(Boolean);
                const text = titles.join('  •  ');
                content.textContent = text || 'No hay noticias disponibles';
            }
        } catch (err) {
            console.error('Error loading ticker:', err);
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    fetchAllPosts();

    // Cargar vídeo automático y ticker
    loadNewsVideo();
    loadTicker();

    // Volver a cargar el vídeo cada 10 horas (coincide con el cron del backend)
    setInterval(loadNewsVideo, 10 * 60 * 60 * 1000);

    return true;
};

// Immediate init attempt, then poll
if (!window.initNoticiasComponent()) {
    let attempts = 0;
    const poll = setInterval(() => {
        if (window.initNoticiasComponent() || ++attempts > 60) clearInterval(poll);
    }, 100);
}
