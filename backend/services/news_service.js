const axios = require('axios');
require('dotenv').config();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

module.exports = {
    fetchLatestNews: async () => {
        try {
            // Keywords: Economía Popular y Solidaria, Agricultura, Emprendimiento, Cooperativas, Ecuador
            const query = '(Economía Popular y Solidaria OR Agricultura OR Emprendimiento OR Cooperativas OR Producción) AND Ecuador';
            const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=es&country=ec&max=5&apikey=${GNEWS_API_KEY}`;
            
            const response = await axios.get(url);
            if (response.data && response.data.articles) {
                return response.data.articles.map(article => ({
                    title: article.title,
                    original_title: article.title,
                    source_url: article.url,
                    category: 'Ecuador Economics'
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching news from GNews:', error.message);
            return [];
        }
    }
};
