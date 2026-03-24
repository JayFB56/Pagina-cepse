// ============================================
// IMPACT MODULE — js/impact.js
// Maneja contadores animados y revelación al scroll
// ============================================

window.initImpact = function() {
    'use strict';

    /* ── CONTADORES ANIMADOS ── */
    function animateImpactCounters() {
        const counters = document.querySelectorAll('[data-impact-counter]');
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-impact-counter');
            const duration = 2000; // 2 segundos
            const stepTime = 20;
            const totalSteps = duration / stepTime;
            const increment = target / totalSteps;
            
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target.toLocaleString('es-EC');
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.ceil(current).toLocaleString('es-EC');
                }
            }, stepTime);
        });
    }

    /* ── ANIMACIÓN AL SCROLL (REVEAL) ── */
    const revealElements = document.querySelectorAll('.impact-reveal, .impact-stat-card');
    
    if (revealElements.length) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px'
        };

        const impactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    
                    // Si la tarjeta contiene un contador, lo disparamos
                    const counter = entry.target.querySelector('[data-impact-counter]');
                    if (counter && !entry.target.classList.contains('counted')) {
                        entry.target.classList.add('counted');
                        // Un pequeño delay para que la tarjeta se vea antes de que el número empiece a subir
                        setTimeout(animateImpactCounters, 400);
                    }
                }
            });
        }, observerOptions);

        revealElements.forEach(el => impactObserver.observe(el));
    }
};
