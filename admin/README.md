# Panel Administrativo CEPSE

CMS interno para gestionar las publicaciones del sitio público de CEPSE
(Noticias, Comunicados, Eventos y Destacados).

## Arquitectura

- **Frontend del panel:** HTML + CSS + JS Vanilla (sin frameworks de UI), Quill.js para edición de contenido enriquecido. Vive en [admin/](.)
- **Backend:** Node.js + Express 4 + SQLite (better-sqlite3), montado sobre `backend/server.js`
- **Autenticación:** JWT (8h de expiración), `localStorage` en el cliente
- **Almacenamiento de imágenes:** local en `assets/img/cms/` (servido por el backend en `/uploads/...`)

## Roles

| Rol | Permisos |
|-----|----------|
| **Presidente** | Crear, editar, publicar, despublicar y eliminar publicaciones; subir imágenes |
| **Administrador** | Todo lo anterior + gestión de usuarios + log de actividad |

## Credenciales iniciales

> ⚠️ **Cambia estas contraseñas inmediatamente en producción.**

| Usuario      | Contraseña       | Rol        |
|--------------|------------------|------------|
| `presidente` | `Cepse2025!`     | presidente |
| `admin`      | `Admin@Cepse25`  | admin      |

## Cómo correr el panel

### Requisitos
- Node.js 18 o superior
- Las dependencias del backend instaladas (ver `backend/package.json`)

### Pasos

```bash
# 1. Instalar dependencias del backend (si no lo has hecho)
cd backend
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env y completa al menos JWT_SECRET (string largo aleatorio)

# 3. Inicializar la base de datos (crea tablas + usuarios iniciales)
npm run init-db

# 4. Iniciar el backend (puerto 3000 por defecto)
npm start

# 5. En otra terminal, iniciar el sitio (puerto 8080)
cd ..
npm run dev

# 6. Abre el panel
# http://localhost:8080/admin/
```

## Cambiar contraseñas

### Opción A — desde el panel (recomendado)

> Esta funcionalidad se gestiona via API. Por ahora se debe hacer manualmente
> con la opción B; queda para una iteración futura un formulario de "cambiar
> contraseña" en el panel.

### Opción B — manualmente desde la base de datos

Desde `backend/`:

```bash
node -e "
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const db = new Database('./data/news.db');
const hash = bcrypt.hashSync('NUEVA_CONTRASENA', 10);
db.prepare('UPDATE cms_users SET password_hash = ? WHERE username = ?')
  .run(hash, 'presidente');
console.log('Contraseña actualizada');
"
```

## Estructura de archivos

```
admin/
├── index.html        # Login
├── dashboard.html    # Panel principal (lista, filtros, métricas)
├── editor.html       # Editor de publicaciones (crear/editar)
├── css/
│   └── admin.css     # Estilos institucionales (verde #006633 / dorado #d4af37)
└── js/
    ├── auth.js       # Cliente compartido: sesión, fetch autenticado, upload
    ├── dashboard.js  # Lógica del panel y vistas
    └── editor.js     # Lógica del editor
```

## API consumida por el panel

Todas las rutas están en `http://localhost:3000/api/cms/*` (excepto `/api/public/*`
que es pública). El cliente las llama via `CMSAPI` en `js/auth.js`.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST   | `/api/cms/auth/login` | público | Login → JWT |
| GET    | `/api/cms/auth/me` | bearer | Datos del usuario logueado |
| GET    | `/api/cms/posts` | bearer | Listado con filtros `?section=&status=` |
| POST   | `/api/cms/posts` | bearer | Crear |
| PUT    | `/api/cms/posts/:id` | bearer | Actualizar |
| DELETE | `/api/cms/posts/:id` | bearer | Eliminar |
| POST   | `/api/cms/posts/:id/publish` | bearer | Cambiar a publicado |
| POST   | `/api/cms/posts/:id/unpublish` | bearer | Volver a borrador |
| POST   | `/api/cms/upload` | bearer | Subir imagen (multipart `image`) |
| GET    | `/api/cms/metrics` | bearer | Conteo por sección y estado |
| GET    | `/api/cms/activity` | admin | Log de actividad |
| GET    | `/api/cms/users` | admin | Listado de usuarios |
| POST   | `/api/cms/users` | admin | Crear usuario |
| PUT    | `/api/cms/users/:id/toggle` | admin | Activar/desactivar |

## Despliegue en producción

1. Despliega el backend en un servicio que soporte SQLite con almacenamiento
   persistente (Railway, Render, Fly.io). Vercel **no** sirve para el backend
   con SQLite porque su filesystem es efímero.
2. Configura `JWT_SECRET` como variable de entorno con un string aleatorio
   largo (32+ caracteres).
3. Cambia las contraseñas iniciales antes de exponer el panel.
4. Edita `admin/js/auth.js` para apuntar `API_BASE` al dominio de tu backend
   en producción.
5. Las páginas estáticas (sitio + panel) se siguen sirviendo en Vercel; el
   panel hace `fetch` al backend remoto.

## Seguridad

- Contraseñas hasheadas con `bcryptjs` (10 rounds)
- JWT con expiración de 8 horas
- Rate limiting en `/api/cms/auth/login`: 5 intentos / 15 min / IP
- Validación de tipo y tamaño en uploads (sólo JPG/PNG/WEBP, ≤5 MB)
- CORS abierto: en producción, restringe `cors()` al dominio del sitio
