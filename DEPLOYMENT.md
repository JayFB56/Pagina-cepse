# CEPSE Website - Guía de Deployment

## Problema Local

✅ **Servidor funcionando correctamente:**
- `localhost:8080` - Acceso local
- `192.168.1.16:8080` - Red local (todas las interfaces)

❌ **GitHub Pages NO funciona** porque es 100% estático (no ejecuta Node.js)

## Solución: Netlify (Recomendado)

### Pasos para Deployar a Netlify:

#### 1. Crear cuenta en Netlify
- Ve a https://www.netlify.com
- Crea una cuenta (puedes usar GitHub)

#### 2. Conectar tu repositorio
- En Netlify Dashboard: "New site from Git"
- Selecciona GitHub y autoriza
- Elige el repositorio `Pagina-cepse`

#### 3. Configuración de Build
Netlify automáticamente detectará `netlify.toml`:
- **Build command**: `npm install`
- **Publish directory**: `.` (raíz)
- **Functions**: `netlify/functions`

#### 4. Deploy
- Netlify automáticamente deployará cuando hagas push a `main` o `develop`
- Tu sitio estará en: `https://tu-site.netlify.app`

#### 5. Dominio personalizado (opcional)
- En Netlify: Site settings → Domain management
- Apunta tu dominio (CNAME) a Netlify

---

## Alternativa: Vercel

Si prefieres Vercel:
- https://vercel.com
- Igual de fácil pero mejor para Next.js (no necesario aquí)

---

## Archivos preparados:

✅ `netlify.toml` - Configuración para Netlify
✅ `package.json` - Scripts de start/dev
✅ `server-dev.js` - Servidor Express listo

---

## Próximos pasos:

1. Push de cambios a GitHub: `git add . && git commit -m "Deploy config" && git push`
2. Conectar Netlify al repositorio
3. ¡Listo! Tu sitio estará online

---

## ¿Problemas con rutas en Netlify?

Si las rutas no funcionan en Netlify:
- Las reglas de redirect en `netlify.toml` lo solucionan
- Todas las solicitudes → `/index.html` → el servidor las maneja

**Resultado**: Tu web funcionará igual online que en local ✅
