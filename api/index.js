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

// ANTES DE TODO: Servir archivos estáticos con extensión completa
// Esto evita que se procesen como rutas de SPA
app.use('/assets', express.static(path.join(baseDir, 'assets'), { 
  maxAge: '1h',
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

app.use('/css', express.static(path.join(baseDir, 'css'), { 
  maxAge: '1h',
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

app.use('/js', express.static(path.join(baseDir, 'js'), { 
  maxAge: '1h',
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

// Componentes HTML - servir directamente SIN pasar por el rewrite
app.use('/components', express.static(path.join(baseDir, 'components'), { 
  maxAge: '1h',
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

app.use('/pages', express.static(path.join(baseDir, 'pages'), { 
  maxAge: '1h',
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

// Middleware para archivos con extensión - NO reescribir
app.get('*', (req, res, next) => {
  const url = req.url;
  
  // Si tiene extensión, es un archivo estático
  if (url.includes('.')) {
    return next();
  }
  
  // Si es una ruta sin extensión, proceder con el rewrite
  next();
});

// Middleware para rewrite de URLs - SOLO para rutas sin extensión
app.get('*', (req, res, next) => {
  const url = req.url;
  
  // Si es raíz
  if (url === '/' || url === '' || url === '/index.html') {
    const indexPath = path.join(baseDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // Convertir /seccion/pagina → /pages/seccion/pagina.html
  let filePath = path.join(baseDir, 'pages', url + '.html');
  
  // Verificar si el archivo existe
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Si la ruta es una carpeta de sección (ej: /nosotros/), buscar la primera subpágina
  const dirPath = path.join(baseDir, 'pages', url.replace(/\/$/, ''));
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).sort();
    if (files.length > 0) {
      // Redirigir a la primera página de esa sección
      const cleanUrl = url.replace(/\/$/, '');
      return res.redirect(301, `${cleanUrl}/${files[0].replace('.html', '')}`);
    }
  }
  
  // Si no existe, intentar con index.html (para carpetas)
  filePath = path.join(baseDir, 'pages', url.replace(/\/$/, ''), 'index.html');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Si nada coincide, servir el index.html para la SPA
  const indexPath = path.join(baseDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  res.status(404).send('Not found');
});

// Exportar para Vercel
module.exports = app;
