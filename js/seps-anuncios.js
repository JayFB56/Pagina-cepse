// ============================================
// SEPS ANUNCIOS MODULE — js/seps-anuncios.js
// Integración de Información Institucional de la SEPS (Sección Integrada)
// ============================================

window.initSepsAnuncios = function() {
    'use strict';

    // Data escalable de anuncios
    const SEPS_ANUNCIOS_DATA = [
        {
            id: 'seps-01',
            type: 'Capacitación',
            typeColor: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: 'school',
            iconColor: 'bg-blue-600',
            title: 'Programa de Educación Financiera',
            description: 'Conoce los nuevos cursos gratuitos dirigidos a fortalecer la gestión.',
            date: 'Actualizado',
            url: 'https://www.seps.gob.ec/capacitacion/'
        },
        {
            id: 'seps-02',
            type: 'Normativa',
            typeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            icon: 'gavel',
            iconColor: 'bg-emerald-600',
            title: 'Resoluciones Ley EPS',
            description: 'Accede a resoluciones y reglamentos actualizados de la SEPS.',
            date: 'Normativa',
            url: 'https://www.seps.gob.ec/normativa/'
        },
        {
            id: 'seps-03',
            type: 'Alerta UAFE',
            typeColor: 'bg-amber-100 text-amber-800 border-amber-200',
            icon: 'campaign',
            iconColor: 'bg-amber-500',
            title: 'Prevención de Lavado',
            description: 'Guías y reportes obligatorios para la prevención de delitos.',
            date: 'Obligatorio',
            url: 'https://www.seps.gob.ec/prevencion-lavado-de-activos/'
        },
        {
            id: 'seps-04',
            type: 'Servicio',
            typeColor: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: 'support_agent',
            iconColor: 'bg-purple-600',
            title: 'Balcón de Servicios',
            description: 'Gestione trámites, certificados y actualización de directivas.',
            date: 'Portal en Línea',
            url: 'https://servicios.seps.gob.ec/bse/owd/paginas/login.jsf'
        }
    ];

    const container = document.getElementById('seps-grid-container');
    if (!container) return;

    // 1. Construir las tarjetas dinámicamente
    let cardsHTML = '';
    SEPS_ANUNCIOS_DATA.forEach(anuncio => {
        cardsHTML += `
            <a href="${anuncio.url}" target="_blank" rel="noopener noreferrer" 
               class="group relative bg-white rounded-2xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:border-emerald-300 hover:bg-emerald-50/10 transition-all duration-300 flex flex-col justify-between overflow-hidden outline-none focus:ring-4 focus:ring-emerald-500/20 reveal">
                <div class="absolute -right-6 -top-6 w-24 h-24 ${anuncio.iconColor} opacity-[0.03] rounded-full blur-xl group-hover:opacity-10 transition-opacity"></div>
                <div>
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-12 h-12 ${anuncio.iconColor} rounded-xl flex items-center justify-center shadow-md">
                            <span class="material-symbols-outlined text-white text-2xl">${anuncio.icon}</span>
                        </div>
                        <span class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${anuncio.typeColor}">
                            ${anuncio.type}
                        </span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors leading-tight">
                        ${anuncio.title}
                    </h3>
                    <p class="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
                        ${anuncio.description}
                    </p>
                </div>
                <div class="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                    <span class="text-[10px] font-bold text-slate-400 p-1 bg-slate-100 rounded uppercase tracking-wide">
                        ${anuncio.date}
                    </span>
                    <span class="flex items-center gap-1 text-sm font-bold text-emerald-600 group-hover:text-emerald-700">
                        Acceder <span class="material-symbols-outlined text-[1.1rem] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </span>
                </div>
            </a>
        `;
    });
    
    container.innerHTML = cardsHTML;

    // Reactivar observador de scroll para las tarjetas
    const revealElements = document.querySelectorAll('#seps-info .reveal');
    if (revealElements.length && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }
};
