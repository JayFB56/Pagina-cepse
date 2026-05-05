const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware para ignorar favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.status(204).send();
});

// Determinar el directorio base correctamente en Vercel
const baseDir = process.env.VERCEL ? path.join(__dirname, '..') : __dirname;

// Servir archivos estáticos - ANTES del middleware de rewrite
app.use('/assets', express.static(path.join(baseDir, 'assets')));
app.use('/css', express.static(path.join(baseDir, 'css')));
app.use('/js', express.static(path.join(baseDir, 'js')));
app.use('/components', express.static(path.join(baseDir, 'components')));
app.use('/pages', express.static(path.join(baseDir, 'pages')));

// Middleware para rewrite de URLs - DESPUÉS de servir estáticos
app.use((req, res, next) => {
  const url = req.url;
  
  // Ignorar archivos con extensión (ya fueron servidos como estáticos)
  if (url.includes('.')) {
    return next();
  }
  
  // Si es raíz
  if (url === '/' || url === '') {
    return res.sendFile(path.join(baseDir, 'index.html'));
  }
  
  // Convertir /seccion/pagina → /pages/seccion/pagina.html
  let filePath = path.join(baseDir, 'pages', url + '.html');
  
  // Verificar si el archivo existe
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Si la ruta es una carpeta de sección (ej: /nosotros/), buscar la primera subpágina
  const dirPath = path.join(baseDir, 'pages', url);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).sort();
    if (files.length > 0) {
      // Redirigir a la primera página de esa sección
      const cleanUrl = url.replace(/\/$/, '');
      return res.redirect(301, `${cleanUrl}/${files[0].replace('.html', '')}`);
    }
  }
  
  // Si no existe, intentar con index.html (para carpetas)
  filePath = path.join(baseDir, 'pages', url, 'index.html');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Si aún no existe, enviar 404
  next();
});

// Manejo de rutas 404
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).sendFile(path.join(baseDir, 'index.html'));
});

// Exportar para Vercel
module.exports = app;
