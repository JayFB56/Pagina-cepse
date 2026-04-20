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

app.listen(PORT, () => {
  console.log(`\n✅ Servidor CEPSE iniciado en http://localhost:${PORT}`);
  console.log(`📁 Directorio: ${__dirname}`);
  console.log(`🔗 Accede a: http://192.168.1.16:${PORT}`);
  console.log(`❌ Para detener: Ctrl + C\n`);
});
