const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
    processNewsWithAI: async (originalTitle, url) => {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            
            const prompt = `
                Actúa como un editor senior institucional para CEPSE (Cámara Provincial de Economía Popular y Solidaria de Esmeraldas).
                Basado en esta noticia: "${originalTitle}" (Fuente: ${url})
                Genera un objeto JSON con los siguientes campos:
                1. "institutional_title": Título formal y profesional (máximo 15 palabras).
                2. "summary": Resumen institucional de 2-3 párrafos destacando el impacto socioeconómico.
                3. "video_script": Un libreto corto (60-90 segundos) para una presentadora virtual.
                4. "tags": Lista de 5 palabras clave relacionadas.
                
                Instrucciones críticas:
                - Tono neutral y profesional.
                - Sin opiniones políticas.
                - Enfocado en el desarrollo local y productivo.
                - Devuelve SOLO el JSON sin texto adicional.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            
            // Cleanup in case Gemini returns markdown blocks
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            
            return JSON.parse(text);
        } catch (error) {
            console.error('Error processing news with Gemini:', error.message);
            return null;
        }
    }
};
