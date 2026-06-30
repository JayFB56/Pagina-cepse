const cron = require('node-cron');
const newsService = require('../services/news_service');
const aiService = require('../services/ai_service');
const dbService = require('../services/db_service');

require('dotenv').config();

console.log('---  Iniciando Sistema de Automatización CEPSE ---');

async function runAutomation() {
    console.log('[CRON] Buscando nuevas noticias...');
    
    const articles = await newsService.fetchLatestNews();
    console.log(`[CRON] Se encontraron ${articles.length} artículos en GNews.`);

    for (const article of articles) {
        dbService.insertNews(article);
    }

    const pending = dbService.getPendingNews();
    if (pending.length === 0) {
        console.log('[CRON] No hay noticias nuevas para procesar.');
        return;
    }

    console.log(`[CRON] Procesando ${pending.length} noticias con Gemini...`);

    for (const news of pending) {
        try {
            console.log(`[IA] Procesando: ${news.original_title}`);
            const aiData = await aiService.processNewsWithAI(news.original_title, news.source_url);
            
            if (aiData) {
                dbService.updateNewsAI(news.id, {
                    title: aiData.institutional_title,
                    summary: aiData.summary,
                    content: aiData.video_script
                });
            }
        } catch (error) {
            console.error(`[ERROR] Falló procesamiento de noticia ${news.id}:`, error.message);
        }
    }
}

cron.schedule('0 */6 * * *', () => {
    runAutomation();
});

runAutomation();

module.exports = runAutomation;
