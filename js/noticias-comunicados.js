// ============================================
// NOTICIAS-COMUNICADOS MODULE — js/noticias-comunicados.js
// Contenido estático (sin dependencia de Railway)
// ============================================

window.initNoticiasComponent = function() {
    'use strict';

    if (window.__noticiasInitialized) return true;

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

    // ============================================
    // CONTENIDO ESTÁTICO (reemplaza Railway API)
    // ============================================
    const STATIC_POSTS = {
        noticias: [
            {
                title: 'CEPSE fortalece alianzas con el sector solidario provincial',
                summary: 'La Cámara Provincial impulsa nuevas estrategias para el fortalecimiento de cooperativas y asociaciones en Esmeraldas.',
                image_url: 'assets/news/fortalecimiento.png',
                published_at: '2025-06-15',
                category: 'noticias'
            },
            {
                title: 'Capacitación en gestión administrativa para emprendedores',
                summary: 'Más de 50 emprendedores participaron en el taller de fortalecimiento de capacidades organizacionales.',
                image_url: 'assets/news/gestion.png',
                published_at: '2025-06-10',
                category: 'noticias'
            },
            {
                title: 'Nuevos convenios de cooperación interinstitucional',
                summary: 'CEPSE firma acuerdos con entidades locales para ampliar el alcance de sus servicios.',
                image_url: 'assets/news/cooperacion.png',
                published_at: '2025-06-05',
                category: 'noticias'
            }
        ],
        comunicados: [
            {
                title: 'Comunicado oficial sobre el estado de la economía solidaria',
                summary: 'Informe actualizado sobre los avances y desafíos del sector economía popular y solidaria en la provincia.',
                image_url: '',
                published_at: '2025-06-12',
                category: 'comunicados'
            }
        ],
        eventos: [
            {
                title: 'Feria del Emprendimiento Solidario 2025',
                summary: 'Evento anual que reúne a los principales actores de la economía popular y solidaria de Esmeraldas.',
                image_url: '',
                published_at: '2025-07-01',
                category: 'eventos'
            }
        ],
        destacados: [
            {
                title: 'CEPSE: Un año de logros en favor del sector solidario',
                summary: 'Resumen de los principales hitos alcanzados por la cámara durante el periodo institucional.',
                image_url: '',
                published_at: '2025-06-20',
                category: 'destacados'
            }
        ]
    };

    const STATIC_TICKER = [
        'CEPSE fortalece alianzas con el sector solidario',
        'Capacitación en gestión administrativa para emprendedores',
        'Nuevos convenios de cooperación interinstitucional',
        'Feria del Emprendimiento Solidario 2025',
        'CEPSE: Un año de logros en favor del sector solidario'
    ];

    let state = {
        allPosts: {},
        currentFilter: 'noticias',
        heroIndex: 0,
        heroAutoplayInterval: null,
        loading: false,
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
    // CARGA DE CONTENIDO ESTÁTICO
    // ============================================
    function loadStaticContent() {
        state.allPosts = { ...STATIC_POSTS };
        state.loading = false;
        renderContent();
    }

    // ============================================
    // RENDER FUNCTIONS
    // ============================================
    function showLoadingState() {
        if (heroSkeleton) heroSkeleton.style.display = 'block';
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
        if (heroSkeleton) heroSkeleton.style.display = 'none';
        postsContainer.innerHTML = '';
        errorState.classList.remove('hidden');
        emptyState.classList.add('hidden');
        loadMoreBtn.classList.add('hidden');
    }

    function showEmptyState() {
        if (heroSkeleton) heroSkeleton.style.display = 'none';
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

        if (heroSkeleton) heroSkeleton.style.display = 'none';
        emptyState.classList.add('hidden');
        errorState.classList.add('hidden');

        renderHero(posts[0]);
        renderGrid(posts.slice(1));
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
                    <div class="relative h-48 overflow-hidden bg-slate-200 group-hover/card:scale-105 transition-transform duration-500" style="${imageStyle}">
                        ${!hasImage ? `
                            <div class="absolute inset-0 flex items-center justify-center opacity-30">
                                <div class="text-6xl">${SECTIONS[state.currentFilter].icon}</div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="p-5 md:p-6 flex flex-col flex-grow">
                        <div class="mb-3">
                            <span class="category-badge ${colors.badge}">
                                ${SECTIONS[state.currentFilter].label}
                            </span>
                        </div>
                        <h4 class="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover/card:text-emerald-600 transition-colors">
                            ${escapeHtml(post.title)}
                        </h4>
                        ${post.summary ? `
                            <p class="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
                                ${escapeHtml(post.summary)}
                            </p>
                        ` : ''}
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

            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            renderContent();
        });
    });

    // ============================================
    // EVENT LISTENERS
    // ============================================
    retryBtn?.addEventListener('click', loadStaticContent);
    retryErrorBtn?.addEventListener('click', loadStaticContent);

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
        return color;
    }

    // ============================================
    // VIDEO PLAYLIST (desde assets/videos.txt — local)
    // ============================================
    let videoPlayer = null;
    let videoIdList = [];
    let currentVideoIdx = 0;

    function extractYouTubeId(url) {
        if (!url) return null;
        const trimmed = url.trim();
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        ];
        for (const pattern of patterns) {
            const match = trimmed.match(pattern);
            if (match) return match[1];
        }
        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
        return null;
    }

    function ensureYouTubeAPI() {
        return new Promise(function(resolve) {
            if (window.YT && window.YT.Player) { resolve(); return; }
            var prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function() {
                if (prev) prev();
                resolve();
            };
            if (!document.querySelector('script[src*="iframe_api"]')) {
                var tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(tag);
            }
        });
    }

    function renderThumbnails(ids) {
        var container = document.getElementById('video-thumbnails');
        if (!container) return;
        var html = '';
        for (var i = 0; i < ids.length; i++) {
            var active = i === 0 ? 'border-emerald-500 ring-2 ring-emerald-500/40' : 'border-transparent hover:border-emerald-400';
            html += '<button class="video-thumb flex-shrink-0 w-28 md:w-36 rounded-lg overflow-hidden border-2 transition-all duration-200 ' + active + '" data-index="' + i + '">';
            html += '<img src="https://img.youtube.com/vi/' + ids[i] + '/mqdefault.jpg" alt="Video ' + (i + 1) + '" class="w-full aspect-video object-cover" loading="lazy">';
            html += '</button>';
        }
        container.innerHTML = html;
    }

    function playVideo(index) {
        if (!videoPlayer || !videoIdList.length) return;
        currentVideoIdx = index;
        videoPlayer.loadVideoById(videoIdList[index]);
        var thumbs = document.querySelectorAll('.video-thumb');
        for (var i = 0; i < thumbs.length; i++) {
            var el = thumbs[i];
            if (i === index) {
                el.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-500/40');
                el.classList.remove('border-transparent', 'hover:border-emerald-400');
            } else {
                el.classList.remove('border-emerald-500', 'ring-2', 'ring-emerald-500/40');
                el.classList.add('border-transparent', 'hover:border-emerald-400');
            }
        }
    }

    async function loadNewsVideo() {
        try {
            var res = await fetch('/assets/videos.txt');
            if (!res.ok) {
                var c = document.getElementById('news-video');
                if (c) c.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white">No hay v\u00eddeo disponible</div>';
                return;
            }
            var text = await res.text();
            var lines = text.split('\n');
            var ids = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line && line.charAt(0) !== '#') {
                    var id = extractYouTubeId(line);
                    if (id) ids.push(id);
                }
            }

            var container = document.getElementById('news-video');
            if (!container) return;

            if (!ids.length) {
                container.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white">No hay v\u00eddeos en la lista</div>';
                return;
            }

            videoIdList = ids;
            container.innerHTML = '<div id="youtube-player" class="w-full h-full"></div>';

            await ensureYouTubeAPI();

            renderThumbnails(ids);

            videoPlayer = new YT.Player('youtube-player', {
                width: '100%',
                height: '100%',
                videoId: ids[0],
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    rel: 0,
                    modestbranding: 1
                },
                events: {
                    onReady: function() { videoPlayer.playVideo(); },
                    onStateChange: function(e) {
                        if (e.data === YT.PlayerState.ENDED) {
                            playVideo((currentVideoIdx + 1) % videoIdList.length);
                        }
                    }
                }
            });

            var thumbsContainer = document.getElementById('video-thumbnails');
            if (thumbsContainer) {
                thumbsContainer.addEventListener('click', function(e) {
                    var btn = e.target.closest('.video-thumb');
                    if (btn) playVideo(parseInt(btn.getAttribute('data-index')));
                });
            }
        } catch (err) {
            console.error('Error loading video playlist:', err);
        }
    }

    // ============================================
    // TICKER ESTÁTICO (reemplaza Railway API)
    // ============================================
    function loadTicker() {
        var content = document.getElementById('news-ticker-content');
        if (!content) return;
        var text = STATIC_TICKER.join('  •  ');
        content.textContent = text || 'No hay noticias disponibles';
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    loadStaticContent();
    loadNewsVideo();
    loadTicker();

    window.__noticiasInitialized = true;
    return true;
};

// Immediate init attempt, then poll
if (!window.initNoticiasComponent()) {
    let attempts = 0;
    const poll = setInterval(() => {
        if (window.initNoticiasComponent() || ++attempts > 60) clearInterval(poll);
    }, 100);
}
