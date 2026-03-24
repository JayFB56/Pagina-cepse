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
    
    function checkScroll() {
        if (window.scrollY > 80) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }
    
    checkScroll();
    window.addEventListener('scroll', checkScroll);

    // Menu Móvil
    const openBtn = document.getElementById('menu-open-btn');
    const closeBtn = document.getElementById('menu-close-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-item');

    if(openBtn && closeBtn && mobileMenu) {
        function openMobileMenu() {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                mobileMenu.classList.add('is-open');
                document.body.style.overflow = 'hidden'; 
            }, 10);
        }

        function closeMobileMenu() {
            mobileMenu.classList.remove('is-open');
            document.body.style.overflow = '';
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        }

        openBtn.addEventListener('click', openMobileMenu);
        closeBtn.addEventListener('click', closeMobileMenu);

        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }
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
