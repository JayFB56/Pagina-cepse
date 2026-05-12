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
            typeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            icon: 'school',
            iconColor: 'bg-blue-500/30',
            iconBg: 'bg-blue-900/50',
            title: 'Programa de Educación Financiera',
            description: 'Conoce los nuevos cursos gratuitos dirigidos a fortalecer la gestión financiera de organizaciones.',
            date: 'Actualizado',
            url: 'https://www.seps.gob.ec/capacitacion/'
        },
        {
            id: 'seps-02',
            type: 'Normativa',
            typeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            icon: 'gavel',
            iconColor: 'bg-emerald-500/30',
            iconBg: 'bg-emerald-900/50',
            title: 'Resoluciones Ley EPS',
            description: 'Accede a resoluciones y reglamentos actualizados de la SEPS con vigencia legal.',
            date: 'Normativa',
            url: 'https://www.seps.gob.ec/normativa/'
        },
        {
            id: 'seps-03',
            type: 'Alerta UAFE',
            typeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            icon: 'warning',
            iconColor: 'bg-amber-500/30',
            iconBg: 'bg-amber-900/50',
            title: 'Prevención de Lavado de Activos',
            description: 'Guías y reportes obligatorios para la prevención de delitos financieros.',
            date: 'Obligatorio',
            url: 'https://www.seps.gob.ec/prevencion-lavado-de-activos/'
        },
        {
            id: 'seps-04',
            type: 'Servicio',
            typeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            icon: 'support_agent',
            iconColor: 'bg-purple-500/30',
            iconBg: 'bg-purple-900/50',
            title: 'Balcón de Servicios en Línea',
            description: 'Gestione trámites, certificados y actualización de directivas desde la web.',
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
               class="seps-card group relative bg-slate-800/50 backdrop-blur rounded-2xl p-6 md:p-7 border border-slate-700/50 hover:border-emerald-500/50 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden outline-none focus:ring-4 focus:ring-emerald-500/20">

                <!-- Background gradient overlay -->
                <div class="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                     style="background: linear-gradient(135deg, rgba(16,185,129,0.05), rgba(59,130,246,0.05));"></div>

                <!-- Icon background glow -->
                <div class="absolute -right-8 -top-8 w-32 h-32 ${anuncio.iconBg} rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>

                <div class="relative z-10">
                    <!-- Icon -->
                    <div class="w-14 h-14 ${anuncio.iconBg} rounded-xl flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-white text-2xl">${anuncio.icon}</span>
                    </div>

                    <!-- Type badge -->
                    <div class="inline-block mb-4">
                        <span class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${anuncio.typeColor} bg-gradient-to-r from-transparent to-transparent">
                            ${anuncio.type}
                        </span>
                    </div>

                    <!-- Title -->
                    <h3 class="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors leading-tight">
                        ${anuncio.title}
                    </h3>

                    <!-- Description -->
                    <p class="text-slate-300 text-sm leading-relaxed mb-5 line-clamp-3">
                        ${anuncio.description}
                    </p>
                </div>

                <!-- Footer -->
                <div class="relative z-10 border-t border-slate-700/50 pt-4 mt-auto">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            ${anuncio.date}
                        </span>
                        <span class="flex items-center gap-1 text-sm font-bold text-emerald-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-transform">
                            Acceder <span class="material-symbols-outlined text-base">arrow_forward</span>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });

    container.innerHTML = cardsHTML;

    return true;
};

// Immediate init attempt, then poll
if (!window.initSepsAnuncios()) {
    let attempts = 0;
    const poll = setInterval(() => {
        if (window.initSepsAnuncios() || ++attempts > 60) clearInterval(poll);
    }, 100);
}