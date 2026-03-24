// ============================================
// WHAT WE DO MODULE — js/what-we-do.js
// Maneja interacciones del Roadmap e Impacto
// ============================================

window.initWhatWeDo = function() {
    'use strict';

    /* ── DATA DEL ROADMAP ── */
    const ROADMAP_DATA = {
        1: {
            title: 'Formalización',
            icon: 'account_balance',
            desc: 'Establecemos las bases jurídicas sólidas para que su asociación sea un ente de crédito y contratación formal ante el estado.'
        },
        2: {
            title: 'Nivelación Técnica',
            icon: 'model_training',
            desc: 'A través de la Escuela de EPS, formamos a sus líderes en contabilidad, gestión técnica y normativa de cumplimiento.'
        },
        3: {
            title: 'Apalancamiento',
            icon: 'currency_exchange',
            desc: 'Conectamos su producción con líneas de crédito fiduciario y capital semilla para escalar procesos industriales.'
        },
        4: {
            title: 'Exportación y Elite',
            icon: 'public',
            desc: 'Llevamos sus productos a mercados internacionales y licitaciones estatales de gran escala con certificación de calidad.'
        }
    };

    const triggers = document.querySelectorAll('.path-trigger');
    const content  = document.getElementById('step-content');
    const icon     = document.getElementById('step-icon');
    const title    = document.getElementById('step-title');
    const desc     = document.getElementById('step-desc');

    if (!triggers.length || !content) return;

    function activateStep(n) {
        const step = ROADMAP_DATA[n];
        if (!step) return;

        // Desactivar otros
        triggers.forEach(t => t.classList.remove('active'));
        
        // Activar actual
        const activeTrigger = document.querySelector(`.path-trigger[data-step="${n}"]`);
        if (activeTrigger) activeTrigger.classList.add('active');

        // Efecto visual en panel
        content.style.opacity = '0';
        content.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            icon.textContent = step.icon;
            title.textContent = step.title;
            desc.textContent = step.desc;
            
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }, 300);
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const n = trigger.dataset.step;
            activateStep(n);
        });
    });

    /* ── ANIMACIÓN AL SCROLL (REVEAL) ── */
    const revealElements = document.querySelectorAll('.reveal');
    
    if (revealElements.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // revealObserver.unobserve(entry.target); // Si solo queremos que pase una vez
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => revealObserver.observe(el));
    }
};
