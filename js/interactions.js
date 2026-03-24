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
// FAQ ACCORDION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar que existan elementos .faq-toggle en la página
    const faqToggles = document.querySelectorAll('.faq-toggle');
    
    if (faqToggles.length === 0) {
        // Si no hay FAQ en esta página, salir silenciosamente
        return;
    }

    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();

            // Obtener elementos relacionados
            const faqItem = toggle.closest('.faq-item');
            const content = toggle.nextElementSibling;
            const icon = toggle.querySelector('.material-symbols-outlined');

            // Validar que los elementos críticos existan
            if (!faqItem || !content) {
                console.warn('Estructura FAQ incompleta detectada');
                return;
            }

            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

            // Cerrar otros items abiertos (modo acordeón)
            document.querySelectorAll('.faq-toggle').forEach(otherToggle => {
                if (otherToggle !== toggle && otherToggle.getAttribute('aria-expanded') === 'true') {
                    const otherContent = otherToggle.nextElementSibling;
                    const otherIcon = otherToggle.querySelector('.material-symbols-outlined');

                    // Validar que el contenido del otro item exista
                    if (otherContent) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                        
                        // Animar el cierre
                        otherContent.style.maxHeight = '0px';
                        
                        // Agregar hidden después de que termine la transición (300ms)
                        setTimeout(() => {
                            otherContent.classList.add('hidden');
                        }, 300);
                    }

                    // Rotar el icono si existe
                    if (otherIcon) {
                        otherIcon.classList.remove('rotate-180');
                    }
                }
            });

            // Actualizar estado del item actual
            toggle.setAttribute('aria-expanded', !isExpanded);

            // Animar max-height para apertura/cierre suave
            if (!isExpanded) {
                // ABRIR: Remover hidden primero para que el navegador pueda calcular scrollHeight
                content.classList.remove('hidden');

                // Usar requestAnimationFrame para asegurar que el DOM se haya recalculado
                requestAnimationFrame(() => {
                    // Ahora calcular la altura real del contenido
                    const scrollHeight = content.scrollHeight;
                    content.style.maxHeight = scrollHeight + 'px';
                });
            } else {
                // CERRAR: Animar la reducción de max-height
                content.style.maxHeight = '0px';

                // Agregar hidden después de que termine la transición (sincronizado con CSS 300ms)
                setTimeout(() => {
                    content.classList.add('hidden');
                }, 300);
            }

            // Rotar el icono si existe
            if (icon) {
                icon.classList.toggle('rotate-180');
            }
        });
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
// VALIDACIÓN DE FORMULARIOS Y ENVÍO A FIREBASE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const requiredFields = contactForm.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('border-red-500');
                    isValid = false;
                } else {
                    field.classList.remove('border-red-500');
                }
            });

            if (!isValid) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            data.formType = 'contact';

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            try {
                if (window.firebaseSubmit) {
                    const result = await window.firebaseSubmit(data);
                    
                    if (result.success) {
                        const successMsg = document.createElement('div');
                        successMsg.className = 'fixed top-6 right-6 bg-primary text-slate-900 px-6 py-3 rounded-lg shadow-lg font-bold z-50';
                        successMsg.innerHTML = '<span class="material-symbols-outlined inline mr-2">check_circle</span>¡Solicitud enviada con éxito!';
                        document.body.appendChild(successMsg);

                        contactForm.reset();

                        setTimeout(() => {
                            successMsg.remove();
                        }, 4000);
                    }
                } else {
                    alert('Sistema de almacenamiento no disponible. Intenta más tarde.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('No se pudo enviar el formulario. Intenta más tarde.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    document.querySelectorAll('form:not(#contact-form)').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
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
                const successMsg = document.createElement('div');
                successMsg.className = 'fixed top-6 right-6 bg-primary text-slate-900 px-6 py-3 rounded-lg shadow-lg font-bold z-50';
                successMsg.textContent = '✓ Solicitud enviada exitosamente';
                document.body.appendChild(successMsg);

                form.reset();

                setTimeout(() => {
                    successMsg.remove();
                }, 4000);

                const modal = form.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            }
        });
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
