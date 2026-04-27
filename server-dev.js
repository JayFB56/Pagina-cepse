const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Middleware para ignorar favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.status(204).send();
});

// Servir archivos estáticos - ANTES del middleware de rewrite
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Middleware para rewrite de URLs - DESPUÉS de servir estáticos
app.use((req, res, next) => {
  const url = req.url;
  
  // Ignorar archivos con extensión (ya fueron servidos como estáticos)
  if (url.includes('.')) {
    return next();
  }
  
  // Si es raíz
  if (url === '/' || url === '') {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  
  // Convertir /seccion/pagina → /pages/seccion/pagina.html
  let filePath = path.join(__dirname, 'pages', url + '.html');
  
  // Verificar si el archivo existe
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Si la ruta es una carpeta de sección (ej: /nosotros/), buscar la primera subpágina
  const dirPath = path.join(__dirname, 'pages', url);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).sort();
    if (files.length > 0) {
      // Redirigir a la primera página de esa sección
      const cleanUrl = url.replace(/\/$/, '');
      return res.redirect(301, `${cleanUrl}/${files[0].replace('.html', '')}`);
    }
  }
  
  // Si no existe, intentar con index.html (para carpetas)
  filePath = path.join(__dirname, 'pages', url, 'index.html');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Si aún no existe, enviar 404
  next();
});

// Manejo de rutas 404
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Exportar para Vercel
module.exports = app;

// Ejecutar en local (no en Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Servidor CEPSE iniciado en http://localhost:${PORT}`);
    console.log(`📁 Directorio: ${__dirname}`);
    console.log(`🔗 Accede a: http://0.0.0.0:${PORT} (todas las interfaces)`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`🔗 Red local: http://192.168.1.16:${PORT}`);
    console.log(`❌ Para detener: Ctrl + C\n`);
  });
}
