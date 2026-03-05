# 📊 CONFIGURACIÓN COMPLETA: Google Sheets + CEPSE Website

## 📋 Tabla de Contenidos
1. [Arquitectura General](#arquitectura)
2. [Configuración de Google Sheets](#google-sheets)
3. [Configuración de Google Apps Script](#google-apps-script)
4. [Integración Frontend](#frontend)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Arquitectura General {#arquitectura}

### Flujo de Datos
```
Usuario llena formulario en web
           ↓
JavaScript valida datos (js/forms-handler.js)
           ↓
Fetch POST a Google Apps Script
           ↓
Apps Script recibe y valida datos
           ↓
Inserta fila en Google Sheets
           ↓
Retorna respuesta JSON a frontend
           ↓
Modal muestra "¡Éxito!" y se cierra
```

### Archivos Nuevos Creados

| Archivo | Propósito |
|---------|-----------|
| `js/forms-config.js` | Configuración de 5 tipos de formularios |
| `js/forms-handler.js` | Clase FormManager para manejar modales y validación |
| `css/modal-forms.css` | Estilos de modales y animaciones |
| `google-apps-script.gs` | Backend serverless (Google Apps Script) |

### Cambios a index.html
Necesitas agregar estos scripts:
```html
<!-- Crear modales dinámicamente -->
<link rel="stylesheet" href="css/modal-forms.css">
<script src="js/forms-config.js"></script>
<script src="js/forms-handler.js"></script>
```

---

## Configuración de Google Sheets {#google-sheets}

### PASO 1: Crear Google Sheet
1. Ve a [sheets.google.com](https://sheets.google.com)
2. Crea un nuevo Spreadsheet llamado `CEPSE - Base de Datos`
3. **COPIA el ID** de la URL: `https://docs.google.com/spreadsheets/d/**ID_AQUI**/edit`

### PASO 2: Crear Hojas (Sheets)
Renombra la primera hoja a `Afiliaciones` y crea 4 más:

1. **Afiliaciones** (para "Unirse ahora")
2. **Contactos** (para "Contáctanos")
3. **Consultorias** (para asesoramiento personalizado)
4. **Registros_Eventos** (para eventos)
5. **Registros_Ferias** (para ferias comerciales)

Una hoja adicional se creará automáticamente:
6. **Auditoria** (automática - registra cada envío)

### PASO 3: Configurar Permisos
1. Click en "Compartir" (botón arriba a la derecha)
2. Copia tu email de Google
3. Keeps privado (no compartir públicamente)
4. **IMPORTANTE**: Tu Google Apps Script necesita acceso de edición

---

## Configuración de Google Apps Script {#google-apps-script}

### PASO 1: Crear Proyecto Apps Script
1. Ve a [script.google.com](https://script.google.com)
2. Click en "Nuevo Proyecto"
3. Nómbralo: `CEPSE-FormHandler`

### PASO 2: Copiar Código
1. Abre el archivo `google-apps-script.gs` de tu proyecto
2. Copia TODO el contenido
3. En Apps Script, en el editor (izquierda), elimina el código default
4. Pega TODO el código del archivo
5. **GUARDA EL PROYECTO** (Ctrl+S)

### PASO 3: Reemplazar Google Sheet ID
1. En `google-apps-script.gs`, línea 9:
```javascript
const SHEET_ID = 'TU_GOOGLE_SHEET_ID'; // ← REEMPLAZA AQUÍ
```
2. Reemplaza con el ID que copiaste en Google Sheets
3. Guarda nuevamente

### PASO 4: Publicar como Web App
1. En Apps Script, click en "Desplegar" → "Nueva implementación"
2. Tipo: selecciona "Aplicación web"
3. Ejecutar como: (tu cuenta de Google)
4. Quién tiene acceso: "Cualquiera"
5. Click "Desplegar"
6. **COPIA la URL** que aparece: `https://script.google.com/macros/s/...`

### PASO 5: Obtener Deployment ID
Después de desplegar, Apps Script mostrará esta URL:
```
https://script.google.com/macros/s/AKfycbyXXXXXXXXXXXXX/usercontent
```
**Copia todo lo que va entre `/s/` y `/usercontent`** - ese es tu `DEPLOYMENT_ID`

---

## Integración Frontend {#frontend}

### PASO 1: Actualizar index.html
Agregar estas líneas en el `<head>` (antes del `</head>`):

```html
<!-- Modal Styles -->
<link rel="stylesheet" href="css/modal-forms.css">

<!-- Form Configuration & Handler -->
<script src="js/forms-config.js"></script>
<script src="js/forms-handler.js"></script>
```

### PASO 2: Actualizar js/forms-handler.js
En la línea ~160, reemplaza:
```javascript
const API_ENDPOINT = 'https://script.google.com/macros/s/TU_DEPLOYMENT_ID/usercontent';
```

Con tu URL real:
```javascript
const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyXXXXXXXXXXXXX/usercontent';
```

### PASO 3: Agregar Atributos data-form a Botones
En tus componentes HTML, agrega el atributo `data-form` a los botones:

**En header.html o donde esté "Unirse ahora":**
```html
<button data-form="affiliation" class="btn-primary">
    Unirse ahora
</button>
```

**En componentes con "Contacto":**
```html
<button data-form="contact" class="btn-primary">
    Contáctanos
</button>
```

**En servicios o donde haya consultoría:**
```html
<button data-form="consulting" class="btn-primary">
    Solicitar Consultoría
</button>
```

**Para eventos:**
```html
<button data-form="eventRegistration" class="btn-primary">
    Registrarse
</button>
```

**Para ferias:**
```html
<button data-form="fairRegistration" class="btn-primary">
    Participar en Feria
</button>
```

### PASO 4: Actualizar CSS si falta modal
Si el CSS para modales no está incluido, agrega a `css/main.css`:

```css
/* Copiar TODO el contenido de css/modal-forms.css y pegarlo aquí */
```

---

## Testing {#testing}

### PASO 1: Verificar Configuration en Apps Script
1. En Apps Script, ve a "Ejecutar"
2. Selecciona la función `testConfiguration`
3. Click en ejecutar
4. En "Ejecuciones" (izquierda) debería ver "Completed"
5. El Log debería mostrar: `Configuración OK`

### PASO 2: Test de Formulario
1. Abre tu sitio web en navegador
2. Click en un botón de formulario (ej: "Unirse ahora")
3. Rellena campos con datos de prueba
4. Click "Enviar Solicitud"
5. Debería ver: `✓ ¡Solicitud enviada con éxito!`

### PASO 3: Verificar Datos en Google Sheets
1. Abre tu Google Sheet `CEPSE - Base de Datos`
2. Abre la hoja correspondiente (ej: `Afiliaciones`)
3. Deberías ver una nueva fila con tus datos de prueba

### PASO 4: Verificar Auditoria
1. En Google Sheets, abre la hoja `Auditoria`
2. Deberías ver un registro de cada formulario enviado

---

## Troubleshooting {#troubleshooting}

### ❌ Error: "Cannot read property of undefined"
**Solución**: El `DEPLOYMENT_ID` es incorrecto en `forms-handler.js`
- Verifica que copiaste bien la URL desde Apps Script
- Debe verse así: `https://script.google.com/macros/s/AKfycby...xxxxxx/usercontent`

### ❌ Error: "Invalid Google Sheet ID"
**Solución**: El `SHEET_ID` en `google-apps-script.gs` es incorrecto
- Vuelve a copiar el ID de la URL de Google Sheets
- No incluyas `/edit` al final
- Debe ser solo: `1aBcDeFg...hIjKlMnOpQrStUvWxYz`

### ❌ Modal no aparece al clickear botón
**Solución**: Falta el atributo `data-form` en el botón
- Verifica que el botón tenga: `data-form="affiliation"` (u otro tipo)
- El nombre debe coincidir con las claves en `FORMS_CONFIG`

### ❌ Formulario se envía pero no aparece en Google Sheets
**Solución**: Los permisos no están configurados
1. Ve a Apps Script → Configuración
2. Busca proyecto ID (Project ID)
3. En Google Sheets, click Compartir
4. Agrega el email de Apps Script (generalmente es un `@cloudserviceaccount.gserviceaccount.com`)

### ❌ Falta encabezados en hojas
**Solución**: Los encabezados se crean automáticamente en el primer envío
- Envía un formulario de prueba
- La función `createHeaders()` en Apps Script creará las columnas automáticamente

### ❌ Errores en Console: "Forms not initialized"
**Solución**: El script no se cargó en el orden correcto
1. Verifica que `forms-config.js` se carga ANTES que `forms-handler.js`
2. En index.html debe estar en este orden:
   ```html
   <script src="js/forms-config.js"></script>
   <script src="js/forms-handler.js"></script>
   ```

---

## Testing Completo Checklist

- [ ] Google Sheet creado con 5 hojas
- [ ] Google Apps Script copiado y guardado
- [ ] `SHEET_ID` reemplazado en Apps Script
- [ ] Apps Script publicado como Web App
- [ ] `DEPLOYMENT_ID` copiado
- [ ] `DEPLOYMENT_ID` reemplazado en `forms-handler.js`
- [ ] Scripts incluidos en `index.html`
- [ ] Botones tienen `data-form="..."` correcto
- [ ] Primero test en Apps Script: `testConfiguration()`
- [ ] Test manual: llenar y enviar formulario
- [ ] Verificar datos en Google Sheets

---

## Resumen de URLs Importantes

| Recurso | URL |
|---------|-----|
| Google Sheets | https://docs.google.com/spreadsheets/d/**TU_ID**/edit |
| Google Apps Script | https://script.google.com |
| Endpoint Backend | https://script.google.com/macros/s/**DEPLOYMENT_ID**/usercontent |

---

## Notas Finales

✅ **Seguridad**: Los datos se validan en servidor (Google Apps Script)
✅ **CORS**: Google Apps Script maneja automáticamente CORS
✅ **Escalabilidad**: Puedes tener miles de registros sin problema
✅ **Servidor**: No necesitas servidor propio, Google lo proporciona gratis
✅ **Auditoría**: Todos los envíos se registran con timestamp

---

**¿Preguntas?** Revisa la sección [Troubleshooting](#troubleshooting) o contacta al equipo de desarrollo.
