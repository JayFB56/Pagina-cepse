# Migración a Vercel - Guía Paso a Paso

## 📋 Qué YA está configurado (automático):

✅ `vercel.json` - Configuración del servidor
✅ `.vercelignore` - Archivos a ignorar
✅ `server-dev.js` - Exportable para Vercel
✅ `package.json` - Scripts actualizados

---

## 🚀 Lo que DEBES hacer en tu cuenta de Vercel:

### Paso 1: Crear cuenta en Vercel
- Ve a: https://vercel.com
- Crea una cuenta (recomendado: usa GitHub para más fácil)
- Verifica tu email

### Paso 2: Conectar GitHub
- En Vercel Dashboard: Click en tu perfil → "Settings"
- Busca "Integrations" o "GitHub"
- Autoriza Vercel a acceder a tus repositorios de GitHub

### Paso 3: Importar proyecto
- En Vercel Dashboard: Click en "Add New..." → "Project"
- Selecciona "Import Git Repository"
- Busca y selecciona `Pagina-cepse`
- Click en "Import"

### Paso 4: Configurar el proyecto
En la siguiente pantalla:

**Build & Development Settings:**
- Framework Preset: **None** (ya está configurado)
- Build Command: `npm install` (puede dejar vacío)
- Output Directory: dejar vacío
- Environment Variables: dejar vacío

Click en **"Deploy"** y espera...

### Paso 5: ¡Listo! 🎉
Vercel desplegará automáticamente:
- Tu sitio estará en: `https://pagina-cepse.vercel.app` (o similar)
- Cada push a GitHub → redeploy automático
- Dominio personalizado disponible

---

## 📦 Después del Deploy (opcional):

### Agregar dominio personalizado
- Settings del proyecto en Vercel
- "Domains"
- Agrega tu dominio (ej: www.cepse.ec)
- Sigue instrucciones de DNS

### Ver logs/errores
- En Vercel: "Deployments" → último deploy
- Click en "Functions" para ver logs del servidor

---

## 🔧 Troubleshooting

**Si ves errores de rutas:**
- El `vercel.json` ya está configurado para manejarlas
- Todas las solicitudes van al servidor Express

**Si falta favicon:**
- Ya está en `assets/img/favicon.ico`
- Middleware Express lo sirve correctamente

**Si no se cargan assets:**
- Middleware en `server-dev.js` sirve `/assets`, `/css`, `/js` correctamente
- Vercel respeta esto automáticamente

---

## ✅ Verificación Final

Después de deployed, prueba:

1. Home: `https://tu-dominio.vercel.app/`
2. Página profunda: `https://tu-dominio.vercel.app/servicios/areas-productivas/textil`
3. Requisitos: `https://tu-dominio.vercel.app/asociaciones-y-miembros/requisitos-de-afiliacion`
4. Gestión: `https://tu-dominio.vercel.app/gestion-institucional/gestion-institucional`

Todo debería funcionar exactamente como en local 🚀

---

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs en Vercel → Deployments
2. Verifica que todo está en GitHub
3. Prueba un nuevo deploy (Settings → Deployments → redeploy)

**Tu servidor Express funcionará exactamente igual en Vercel que en local.**
