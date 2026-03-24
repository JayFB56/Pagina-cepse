# 👁️ CÓMO VER LAS SOLICITUDES - GUÍA VISUAL

Sigue estos pasos exactos para ver donde están guardadas las solicitudes.

---

## 🌐 DESDE UNA COMPUTADORA

### Paso 1: Abre Firebase Console

En tu navegador (Chrome, Firefox, Safari, etc.) copia y abre este enlace:

```
https://console.firebase.google.com
```

Verás una página de Google. Si no has iniciado sesión, haz clic en **"Inicia sesión"**.

---

### Paso 2: Selecciona tu Proyecto

Después de iniciar sesión, verás una lista de proyectos.

**Busca y haz clic en:** `lechefacil-db12e`

Si no lo ves, puede estar en una carpeta. Busca el nombre completo.

---

### Paso 3: Abre Firestore Database

En el menú de la izquierda, verás varias opciones. Busca y haz clic en:

**"Firestore Database"**

(Está debajo de "Realtime Database" si la ves)

---

### Paso 4: Abre tu Colección

Una vez en Firestore, verás colecciones listadas. Busca y abre:

**"form_submissions"**

Aquí aparecen **TODAS LAS SOLICITUDES** que la gente envía desde tu página web.

---

### Paso 5: Mira los Datos

Cada línea es una solicitud diferente. Puedes:

- **Hacer clic en cualquier solicitud** para ver todos sus detalles
- **Ver el ID único** de cada solicitud (primer número)
- **Filtrar por fecha** usando los iconos de arriba

---

## 📱 DESDE TU TELÉFONO

### Opción A: Usando el Navegador

1. Abre Chrome, Safari, etc.
2. Ve a: `https://console.firebase.google.com`
3. Inicia sesión
4. Sigue los mismos pasos anteriores
5. Verás todo igual que en la computadora

### Opción B: Usando la App Firebase

1. Descarga la app **"Firebase"** desde:
   - Google Play (Android)
   - App Store (iPhone)

2. Abre la app
3. Inicia sesión con tu Gmail
4. Selecciona: `lechefacil-db12e`
5. Toca **"Firestore Database"**
6. Abre **"form_submissions"**

**Ventaja:** La app actualiza los datos en tiempo real (sin necesidad de refrescar)

---

## 🔍 CÓMO ENCONTRAR UNA SOLICITUD ESPECÍFICA

### Buscar por Nombre

1. En Firestore, abre: **form_submissions**
2. Haz clic en el icono de **FILTRO** (embudo)
3. Selecciona el campo: **name**
4. Escribe el nombre que buscas
5. Haz clic en **"Buscar"**

### Buscar por Email

1. Mismo proceso que arriba
2. Pero selecciona el campo: **email**
3. Escribe el email

### Buscar por Fecha

1. Haz clic en **FILTRO**
2. Selecciona: **submittedAt**
3. Elige el rango de fechas
4. Haz clic en **"Buscar"**

### Buscar por Tipo de Formulario

1. Haz clic en **FILTRO**
2. Selecciona: **formType**
3. Elige: affiliation, contact, consulting, etc.
4. Busca

---

## 📊 INFORMACIÓN QUE VES EN CADA SOLICITUD

Cuando abres una solicitud, ves estos datos:

| Campo | Ejemplo | Qué es |
|-------|---------|--------|
| **name** | Juan García | Nombre de quien envía |
| **email** | juan@example.com | Correo de contacto |
| **phone** | +593 9 XXXXX | Teléfono (si lo puso) |
| **organization** | Cooperativa San Luis | Nombre del grupo/empresa |
| **type** | cooperativa | Tipo: asociación, cooperativa, etc. |
| **formType** | affiliation | Qué tipo de solicitud es |
| **message** | Queremos afiliarnos... | Lo que escribe (si aplica) |
| **timestamp** | Mar 11, 2026, 2:30 PM | Fecha y hora exacta |
| **submittedAt** | 11/3/2026, 14:30:45 | Formato alternativo de fecha |

---

## 💾 CÓMO DESCARGAR LOS DATOS

### Opción 1: Exportar Todo a un Archivo

1. En **form_submissions**, haz clic en los **3 PUNTOS** (...) arriba
2. Selecciona: **"Exportar colección"**
3. Elige dónde guardar en tu computadora
4. Se descarga un archivo `form_submissions.json`

Este archivo puedes abrirlo en:
- Excel
- Google Sheets
- Bloc de Notas
- Excel online

### Opción 2: Copiar Datos Manualmente

1. Abre la solicitud que quieres
2. Selecciona el texto con el ratón
3. Presiona Ctrl+C (Windows) o Cmd+C (Mac)
4. Abre Excel o Google Sheets
5. Presiona Ctrl+V (Windows) o Cmd+V (Mac)
6. Listo, está pegado

---

## ⚠️ COSAS IMPORTANTES

✅ **Hacer:**
- Ver cuantas solicitudes quieras
- Compartir el acceso con otros
- Descargar los datos cuando quieras
- Borrar datos antiguos que no necesites

❌ **NO Hacer:**
- No borres la colección accidentalmente
- No compartas tu contraseña
- No cambies la estructura de la base de datos

---

## 🔐 SEGURIDAD

- Solo tú y personas que autorices pueden ver las solicitudes
- Google encripta todos los datos
- Se hace backup automático
- No se pierden los datos

---

## 👥 COMPARTIR CON TU EQUIPO

Si quieres que otros miembros de tu organización vean las solicitudes:

1. En Firebase, ve a **"Configuración del Proyecto"** (engranaje arriba)
2. Haz clic en **"Usuarios y permisos"**
3. Haz clic en **"Agregar miembro"**
4. Escribe el email de la persona
5. Dale rol: **"Editor"** (para que vea todo)
6. Haz clic en **"Agregar"**

Esa persona recibirá un email y podrá acceder igual que tú.

---

## 💡 CONSEJOS

- **Revisa regularmente:** Dedica 5 minutos al día
- **Organiza:** Crea carpetas o usa filtros para organizarte
- **Responde rápido:** Las personas valoran responder en 24 horas
- **Exporta mensualmente:** Guarda copias en Excel

---

## 🆘 PROBLEMAS COMUNES

### "No puedo ver Firestore"
→ Recarga la página (F5)  
→ Asegúrate de estar en el proyecto correcto

### "No veo form_submissions"
→ Espera 10 segundos (a veces tarda en cargar)  
→ Recarga (F5)  
→ Verifica el nombre exacto: "form_submissions"

### "No veo las solicitudes que envié"
→ Verifica que se guardó con el mensaje "¡Enviado con éxito!"  
→ Espera 5 segundos  
→ Recarga Firebase  
→ Usa filtros para buscar

### "Alguien cambió mis datos"
→ Ve a **"Auditoría"** en Firebase para ver quién accedió  
→ Contacta a Google si hay actividad sospechosa

---

**¡Listo! Ahora sabes cómo ver todas tus solicitudes. Preguntas? Lee FIREBASE-SOLICITUDES.md**
