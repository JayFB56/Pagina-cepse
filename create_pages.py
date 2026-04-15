import os

template = '''<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>TITLE - CEPSE</title>
    <link rel="icon" type="image/x-icon" href="../assets/img/icon.ico">
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap" rel="stylesheet" />
    <script id="tailwind-config" src="../js/config.js"></script>
    <link rel="stylesheet" href="../css/main.css">
    <style>
        ::selection { background-color: #10b981; color: white; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #10b981; }
        #preloader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; z-index: 99999; display: flex; align-items: center; justify-content: center; transition: opacity 0.6s ease-out, visibility 0.6s; }
        #preloader.fade-out { opacity: 0; visibility: hidden; pointer-events: none; }
    </style>
</head>
<body class="font-display text-slate-900 min-h-screen relative antialiased bg-slate-50">
    <div id="preloader"><div class="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div></div>
    <div id="header-container"></div>
    
    <main class="relative z-10">
        COMPONENT_CONTAINERS
    </main>
    
    <div id="footer-container"></div>
    <script>
        async function loadComponent(id, filePath) { 
            try { 
                const r = await fetch('../' + filePath); 
                let html = await r.text(); 
                html = html.replace(/(src|href)="assets\//g, '$1="../assets/'); 
                html = html.replace(/href="index\.html/g, 'href="../index.html'); 
                html = html.replace(/href="(acuerdo-ministerial\.html|estatuto\.html|galeria\.html|noticias\.html|presidente\.html|privacidad\.html|servicios\.html|quienes-somos\.html|mision-vision\.html|beneficios\.html|impacto\.html|contacto\.html)/g, 'href="$1'); 
                document.getElementById(id).innerHTML = html; 
            } catch (e) { 
                console.error(e); 
            } 
        }
        window.addEventListener('DOMContentLoaded', async () => {
            const promises = [
                loadComponent('header-container', 'components/header.html'),
                loadComponent('footer-container', 'components/footer.html'),
                LOADS
            ];
            await Promise.all(promises);
            setTimeout(() => { 
                if (window.initHeader) window.initHeader(); 
                if (window.initStats) window.initStats();
                if (window.initFAQ) window.initFAQ();
                if (window.initServices) window.initServices();
                if (window.initWhatWeDo) window.initWhatWeDo();
                if (window.initImpact) window.initImpact();
                document.getElementById('preloader').classList.add('fade-out'); 
            }, 300);
        });
    </script>
    <script src="../js/interactions.js"></script>
    <script src="../js/services.js"></script>
    <script src="../js/what-we-do.js"></script>
    <script src="../js/impact.js"></script>
</body>
</html>'''

pages = {
    'quienes-somos.html': {'title': 'Quiénes Somos', 'containers': '<div id="about-container"></div>', 'calls': "loadComponent('about-container', 'components/about.html')"},
    'mision-vision.html': {'title': 'Misión y Visión', 'containers': '<div id="mission-vision-container"></div>', 'calls': "loadComponent('mission-vision-container', 'components/mission-vision.html')"},
    'beneficios.html': {'title': 'Beneficios', 'containers': '<div id="benefits-container"></div>', 'calls': "loadComponent('benefits-container', 'components/benefits.html')"},
    'impacto.html': {'title': 'Impacto Territorial', 'containers': '<div id="impact-container"></div>\n        <div id="stats-container"></div>', 'calls': "loadComponent('impact-container', 'components/impact.html'),\n                loadComponent('stats-container', 'components/stats.html')"},
    'contacto.html': {'title': 'Contacto', 'containers': '<div id="contact-container"></div>\n        <div id="faq-container"></div>', 'calls': "loadComponent('contact-container', 'components/contact.html'),\n                loadComponent('faq-container', 'components/faq.html')"}
}

base_path = 'c:/Users/USER/Music/Pagina-cepse/pages/'

for p, data in pages.items():
    content = template.replace('TITLE', data['title'])
    content = content.replace('COMPONENT_CONTAINERS', data['containers'])
    content = content.replace('LOADS', data['calls'])
    with open(base_path + p, 'w', encoding='utf-8') as f:
        f.write(content)

print('Pages created')
