// ============================================
// MODAL DE REGISTRO
// ============================================

const modal = document.getElementById('register-modal');
const openModalBtns = document.querySelectorAll('[id*="open-register-modal"]');
const closeModalBtn = document.getElementById('close-modal');

openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

closeModalBtn?.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            modal?.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// ============================================
// FAQ ACCORDION (Refactored for async loading)
// ============================================

window.initFAQ = function() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    faqItems.forEach(item => {
        const toggleButton = item.querySelector('.faq-toggle');
        const content = item.querySelector('.faq-content');
        const icon = item.querySelector('.faq-icon');
        if (!toggleButton || !content || !icon) return;
        
        toggleButton.addEventListener('click', () => {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    const otherBtn = otherItem.querySelector('.faq-toggle');
                    const otherContent = otherItem.querySelector('.faq-content');
                    const otherIcon = otherItem.querySelector('.faq-icon');
                    
                    if(otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    otherItem.classList.remove('border-emerald-300', 'shadow-[0_10px_30px_rgba(0,102,51,0.08)]', 'ring-1', 'ring-emerald-500/10');
                    if(otherContent) otherContent.style.maxHeight = null;
                    if(otherIcon) {
                        otherIcon.style.transform = 'rotate(0deg)';
                        otherIcon.classList.remove('text-emerald-600');
                    }
                }
            });
            
            if (!isExpanded) {
                toggleButton.setAttribute('aria-expanded', 'true');
                item.classList.add('border-emerald-300', 'shadow-[0_10px_30px_rgba(0,102,51,0.08)]', 'ring-1', 'ring-emerald-500/10');
                content.style.maxHeight = content.scrollHeight + "px";
                icon.style.transform = 'rotate(180deg)';
                icon.classList.add('text-emerald-600');
            } else {
                toggleButton.setAttribute('aria-expanded', 'false');
                item.classList.remove('border-emerald-300', 'shadow-[0_10px_30px_rgba(0,102,51,0.08)]', 'ring-1', 'ring-emerald-500/10');
                content.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
                icon.classList.remove('text-emerald-600');
            }
        });
        
        window.addEventListener('resize', () => {
            const isExp = toggleButton.getAttribute('aria-expanded') === 'true';
            if (isExp) content.style.maxHeight = content.scrollHeight + "px";
        });
    });
};

// ============================================
// ANIMACIONES AL SCROLL
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// ============================================
// SCROLL COUNTER PARA STATS (Refactored setup)
// ============================================

window.initStats = function() {
    const counters = document.querySelectorAll('.stat-counter');
    if (counters.length === 0) return;
    
    const speed = 50; 
    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const updateCount = () => {
                const count = +counter.innerText;
                const inc = target / speed;
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 40);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                counters.forEach(c => c.innerText = '0');
                animateCounters();
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const statsSection = document.getElementById('stats-container');
    if (statsSection) {
        observer.observe(statsSection);
    }
};

// ============================================
// VALIDACIÓN DE FORMULARIOS
// ============================================

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validar campos requeridos
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('border-red-500');
                isValid = false;
            } else {
                field.classList.remove('border-red-500');
            }
        });

        if (isValid) {
            // Mostrar mensaje de éxito
            const successMsg = document.createElement('div');
            successMsg.className = 'fixed top-6 right-6 bg-primary text-slate-900 px-6 py-3 rounded-lg shadow-lg font-bold z-50';
            successMsg.textContent = '✓ Solicitud enviada exitosamente';
            document.body.appendChild(successMsg);

            // Limpiar formulario
            form.reset();

            // Remover mensaje después de 4 segundos
            setTimeout(() => {
                successMsg.remove();
            }, 4000);

            // Cerrar modal if open
            modal?.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// ============================================
// HEADER SCROLL EFFECT & MOBILE MENU (Refactored)
// ============================================

window.initHeader = function() {
    const header = document.getElementById('main-header');
    if (!header) return;

    /* ── Scroll shadow effect ── */
    function checkScroll() {
        if (window.scrollY > 60) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.10)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }
    }
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });

    /* ── Mobile menu ── */
    const openBtn   = document.getElementById('menu-open-btn');
    const closeBtn  = document.getElementById('menu-close-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
        if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
        /* Close all accordion panels */
        document.querySelectorAll('.mob-panel.is-open').forEach(function(p) {
            p.classList.remove('is-open');
        });
        document.querySelectorAll('.mob-item-trigger.is-open').forEach(function(t) {
            t.classList.remove('is-open');
            t.setAttribute('aria-expanded', 'false');
        });
    }

    if (openBtn)  openBtn.addEventListener('click', openMobileMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);

    /* Close on mobile-link click */
    document.querySelectorAll('.mobile-link').forEach(function(link) {
        link.addEventListener('click', closeMobileMenu);
    });

    /* Close on backdrop click */
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) closeMobileMenu();
        });
    }

    /* ── Mobile accordion ── */
    document.querySelectorAll('[data-mob-toggle]').forEach(function(trigger) {
        trigger.addEventListener('click', function() {
            var targetId = trigger.getAttribute('data-mob-toggle');
            var panel    = document.getElementById(targetId);
            if (!panel) return;
            var isOpen = panel.classList.contains('is-open');

            /* Close all */
            document.querySelectorAll('.mob-panel.is-open').forEach(function(p) {
                p.classList.remove('is-open');
            });
            document.querySelectorAll('.mob-item-trigger.is-open').forEach(function(t) {
                t.classList.remove('is-open');
                t.setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                panel.classList.add('is-open');
                trigger.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ── Megamenu viewport clamp ── */
    function clampMegaMenu() {
        var mega = document.querySelector('.nav-mega-panel');
        if (!mega) return;
        var wrapper = mega.closest('.nav-item-wrapper');
        if (!wrapper) return;
        var rect    = wrapper.getBoundingClientRect();
        var menuW   = mega.offsetWidth || 760;
        var viewW   = window.innerWidth;
        var idealLeft = rect.left + rect.width / 2 - menuW / 2;
        var clamped   = Math.max(12, Math.min(idealLeft, viewW - menuW - 12));
        var offset    = clamped - rect.left;
        /* Set CSS custom property so both hidden and hover CSS rules use it */
        mega.style.setProperty('--mega-tx', offset + 'px');
    }
    clampMegaMenu();
    window.addEventListener('resize', clampMegaMenu, { passive: true });

    /* ── ESC key ── */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) {
            closeMobileMenu();
        }
    });
};

// ============================================
// BOTÓN SCROLL TO TOP
// ============================================

const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'fixed bottom-20 right-6 w-12 h-12 bg-primary text-slate-900 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all z-40 hidden font-bold text-xl';
scrollTopBtn.innerHTML = '↑';
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.remove('hidden');
    } else {
        scrollTopBtn.classList.add('hidden');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================
// ACTIVE LINK IN NAVIGATION
// ============================================

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('text-primary', 'font-bold');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('text-primary', 'font-bold');
        }
    });
});
