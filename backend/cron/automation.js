const cron = require('node-cron');
const newsService = require('../services/news_service');
const aiService = require('../services/ai_service');
const videoService = require('../services/video_service');
const dbService = require('../services/db_service');

require('dotenv').config();

console.log('---  Iniciando Sistema de Automatización CEPSE ---');

async function runAutomation() {
    console.log('[CRON] Buscando nuevas noticias...');
    
    // 1. Obtener noticias de GNews
    const articles = await newsService.fetchLatestNews();
    console.log(`[CRON] Se encontraron ${articles.length} artículos en GNews.`);

    // 2. Guardar en Base de Datos
    for (const article of articles) {
        dbService.insertNews(article);
    }

    // 3. Procesar Pendientes con IA
    const pending = dbService.getPendingNews();
    if (pending.length === 0) {
        console.log('[CRON] No hay noticias nuevas para procesar.');
        return;
    }

    console.log(`[CRON] Procesando ${pending.length} noticias con Gemini y HeyGen...`);

    for (const news of pending) {
        try {
            console.log(`[IA] Procesando: ${news.original_title}`);
            const aiData = await aiService.processNewsWithAI(news.original_title, news.source_url);
            
            if (aiData) {
                // Actualizar DB con datos de IA
                dbService.updateNewsAI(news.id, {
                    title: aiData.institutional_title,
                    summary: aiData.summary,
                    content: aiData.video_script
                });

                // Generar Video con HeyGen
                console.log(`[VIDEO] Generando video para: ${news.id}`);
                const videoData = await videoService.generateVideo(aiData.video_script);
                
                if (videoData) {
                    // Nota: En este paso guardamos el ID para luego consultar el status
                    // Para simplificar esta entrega, asumiremos que se completará
                    // Y guardaremos el videoId. Una mejora real sería un polling service.
                    dbService.updateNewsVideo(news.id, '', videoData.videoId);
                    console.log(`[OK] Noticia ${news.id} enviada a producción de video.`);
                }
            }
        } catch (error) {
            console.error(`[ERROR] Falló procesamiento de noticia ${news.id}:`, error.message);
        }
    }
}

// Programar cada 6 horas: 0 */6 * * *
// Para pruebas, puedes usar cada minuto: */1 * * * *
cron.schedule('0 */6 * * *', () => {
    runAutomation();
});

// Ejecutar inmediatamente al iniciar para efectos de demo
runAutomation();

module.exports = runAutomation;
