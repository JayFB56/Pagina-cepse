# 🚀 CEPSE AI News Backend - Guía de Inicio

Este sistema automatiza la captura de noticias, el procesamiento con IA (Gemini) y la generación de videos con presentadora virtual (HeyGen).

## 🛠 Instalación

1.  **Entrar a la carpeta backend**:
    ```bash
    cd backend
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    - Renombra `.env.example` a `.env`.
    - Agrega tus API Keys:
        - `GNEWS_API_KEY`: Consíguela en [gnews.io](https://gnews.io/).
        - `GEMINI_API_KEY`: Consíguela en [Google AI Studio](https://aistudio.google.com/).
        - `HEYGEN_API_KEY`: Consíguela en tu panel de HeyGen.

## 🏃‍♂️ Ejecución

### En Desarrollo
Para iniciar el servidor y la automatización simultáneamente:
```bash
npm start
```
*El sistema buscará noticias inmediatamente al iniciar y luego cada 6 horas.*

### En Producción (Hostinger / VPS)
Se recomienda usar `pm2` para mantener el proceso activo:
```bash
npm install -g pm2
pm2 start server.js --name "cepse-api"
pm2 start cron/automation.js --name "cepse-cron"
```

## 🌐 API Endpoints
- **GET** `/api/noticias`: Obtiene las últimas 10 noticias procesadas con video.

## 📁 Estructura
- `/services`: Lógica de integración con APIs externas.
- `/cron`: Lógica de automatización programada.
- `/data`: Base de datos SQLite local.
