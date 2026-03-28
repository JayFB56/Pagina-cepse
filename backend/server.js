const express = require('express');
const cors = require('cors');
const dbService = require('./services/db_service');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main Endpoint for Frontend
app.get('/api/noticias', (req, res) => {
    try {
        const news = dbService.getLatestNews(10);
        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to check status of a specific news
app.get('/api/noticias/:id', (req, res) => {
    // Implement standard status check if needed
    res.json({ success: true, message: "Status check not implemented in this demo" });
});

app.listen(PORT, () => {
    console.log(`--- ✅ Servidor CEPSE API Activo en puerto ${PORT} ---`);
    console.log(`API URL: http://localhost:${PORT}/api/noticias`);
});
