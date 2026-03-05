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
// FAQ TOGGLE
// ============================================

document.querySelectorAll('.faq-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling;
        const icon = toggle.querySelector('.material-symbols-outlined');
        content.classList.toggle('hidden');
        icon?.classList.toggle('rotate-180');
    });
});

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
// SCROLL COUNTER PARA STATS
// ============================================

const statsSection = document.querySelector('[style*="bg-primary"]');
const stats = document.querySelectorAll('[style*="text-6xl"]');

if (statsSection && stats.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                stats.forEach(stat => {
                    animateCounter(stat);
                });
            }
        });
    });

    statsObserver.observe(statsSection);
}

function animateCounter(element) {
    const text = element.textContent;
    const isPercentage = text.includes('%');
    const isMoney = text.includes('$');
    const isNumber = text.includes('+');
    
    let finalValue;
    if (isPercentage) finalValue = parseInt(text) || 30;
    else if (isMoney) finalValue = 5;
    else if (isNumber) finalValue = parseInt(text) || 100;
    else finalValue = parseInt(text) || 7;

    let currentValue = 0;
    const increment = finalValue / 50;

    const counter = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(counter);
        }
        
        if (isPercentage) element.textContent = Math.floor(currentValue) + '%';
        else if (isMoney) element.textContent = '$' + Math.floor(currentValue) + 'M';
        else if (isNumber) element.textContent = Math.floor(currentValue) + '+';
        else element.textContent = Math.floor(currentValue);
    }, 30);
}

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
// HEADER SCROLL EFFECT
// ============================================

const header = document.getElementById('main-header');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        header?.classList.add('shadow-lg');
    } else {
        header?.classList.remove('shadow-lg');
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

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
