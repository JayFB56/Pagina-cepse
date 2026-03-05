# 📐 ARQUITECTURA: Sistema de Formularios CEPSE + Google Sheets

## 🏗️ Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO EN SITIO WEB                         │
└────────────────────────┬─────────────────────────────────────────────┘
                         │ Click en botón
                         ↓
        ┌────────────────────────────────┐
        │  Botón con data-form="tipo"    │
        │  <button data-form="...">      │
        └────────────┬───────────────────┘
                     │ EventListener
                     ↓
        ┌────────────────────────────────┐
        │   FormManager.openForm()       │
        │   (js/forms-handler.js)        │
        └────────────┬───────────────────┘
                     │ Crea modal
                     ↓
        ┌────────────────────────────────┐
        │   Renderizar Modal HTML        │
        │   Con campos del formulario    │
        │   (dinámico desde config)      │
        └────────────┬───────────────────┘
                     │ Usuario llena
                     ↓
        ┌────────────────────────────────┐
        │   FormManager.handleSubmit()   │
        │   - Valida campos              │
        │   - Prepara JSON               │
        └────────────┬───────────────────┘
                     │ Fetch POST
                     ↓
     ┌───────────────────────────────────────┐
     │   GOOGLE APPS SCRIPT (Backend)        │
     │   doPost(e) function                  │
     │   (google-apps-script.gs)             │
     └───────────────┬───────────────────────┘
                     │ Procesa datos
                     ↓
     ┌───────────────────────────────────────┐
     │   Google Sheets                       │
     │   Inserta fila en hoja correcta:      │
     │   - Afiliaciones                      │
     │   - Contactos                         │
     │   - Consultorias                      │
     │   - Registros_Eventos                 │
     │   - Registros_Ferias                  │
     │   - Auditoria (automática)            │
     └───────────────┬───────────────────────┘
                     │ Response JSON
                     ↓
        ┌────────────────────────────────┐
        │   Frontend recibe respuesta     │
        │   Muestra "✓ ¡Éxito!"          │
        │   Cierra modal                  │
        └────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```
Pagina-cepse/
│
├── 📄 index.html                    [ACTUALIZADO - incluye nuevos scripts]
│
├── 📁 css/
│   ├── main.css                    (estilos principales)
│   └── modal-forms.css             [NUEVO - estilos de modales]
│
├── 📁 js/
│   ├── config.js                   (config de Tailwind)
│   ├── grid.js                     (fondo interactivo)
│   ├── interactions.js             (interactividad general)
│   ├── forms-config.js             [NUEVO - configuración de formularios]
│   └── forms-handler.js            [NUEVO - manejador de formularios]
│
├── 📁 components/                  (11 componentes HTML)
│   └── [ACTUALIZAR BOTONES con data-form]
│
├── 📄 google-apps-script.gs        [NUEVO - backend serverless]
├── 📄 Google-Sheets-Setup.md       [NUEVO - guía de configuración]
└── 📄 ACTUALIZAR-BOTONES.md        [NUEVO - guía de integración]
```

---

## 🔧 Configuración de Formularios (forms-config.js)

### Estructura de FORMS_CONFIG

```javascript
const FORMS_CONFIG = {
    [tipo]: {
        id: 'modal-id',              // ID único del modal
        title: '📝 Título',          // Título visble
        subtitle: 'Descripción...',  // Subtítulo
        fields: [                    // Array de campos
            {
                name: 'field_name',
                label: 'Etiqueta *',
                type: 'text|email|tel|textarea|select',
                required: true|false,
                placeholder: 'Texto de ayuda',
                options: [] // si type='select'
            }
        ],
        sheetName: 'NombreHoja'      // Donde van los datos en Google Sheets
    }
}
```

### Formularios Implementados

#### 1. **Afiliación** (data-form="affiliation")
- 📊 Google Sheet: `Afiliaciones`
- 📝 Campos: nombre, organización, email, teléfono, tipo de org, sector, ciudad, descripción
- 🎯 Uso: Botón "Unirse ahora", "Registrar Asociación"

#### 2. **Contacto** (data-form="contact")
- 📊 Google Sheet: `Contactos`
- 📝 Campos: nombre, email, teléfono, asunto, mensaje
- 🎯 Uso: Botón "Contáctanos", "Enviar mensaje"

#### 3. **Consultoría** (data-form="consulting")
- 📊 Google Sheet: `Consultorias`
- 📝 Campos: nombre, organización, email, teléfono, tipo consultoría, descripción, rango empleados
- 🎯 Uso: Botón "Solicitar Asesoramiento", "Consultoría Personalizada"

#### 4. **Evento** (data-form="eventRegistration")
- 📊 Google Sheet: `Registros_Eventos`
- 📝 Campos: nombre, organización, email, teléfono, ciudad, cargo, hospedaje, comentarios
- 🎯 Uso: Botón "Registrarse a Evento", "Confirmar asistencia"

#### 5. **Ferias** (data-form="fairRegistration")
- 📊 Google Sheet: `Registros_Ferias`
- 📝 Campos: nombre org, representante, email, teléfono, productos, tipo producto, tamaño stand
- 🎯 Uso: Botón "Participar en Feria", "Registrarse para vender"

---

## 🎯 Clase FormManager (forms-handler.js)

### Métodos Principales

```javascript
class FormManager {
    // Inicializar listeners
    initializeEventListeners()
    
    // Abrir formulario (tipo)
    openForm(formType)
    
    // Crear modal dinámicamente
    createModal(config)
    
    // Crear campo individual
    createField(field)
    
    // Manejar envío
    async handleSubmit(e, formType)
    
    // Validar formulario
    validateForm(form)
    
    // Validar email
    isValidEmail(email)
    
    // Mostrar éxito
    showSuccess(form)
    
    // Mostrar error
    showError(form, message)
    
    // Cambiar estado loading
    setFormLoading(form, loading)
    
    // Cerrar modal
    closeModal(modal)
    
    // Cerrar todos
    closeAllModals()
}
```

### Flujo de handleSubmit

```javascript
async handleSubmit(e, formType) {
    e.preventDefault()
    
    // 1. Validar campos
    if (!validateForm()) return showError()
    
    // 2. Mostrar loading
    setFormLoading(true)
    
    // 3. Agregar metadata
    data.timestamp = fecha
    data.formType = tipo
    
    // 4. Enviar a Google Apps Script
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    
    // 5. Procesar respuesta
    if (response.ok) {
        showSuccess()
        setTimeout(() => closeModal(), 2000)
    } else {
        showError(response.message)
    }
    
    // 6. Quitar loading
    setFormLoading(false)
}
```

---

## 🚀 Google Apps Script Backend

### Función Principal: doPost(e)

```
Recibe → JSON con datos de formulario
                    ↓
            Validar datos
                    ↓
        Determinar hoja (por formType)
                    ↓
        appendDataToSheet(sheetName, data)
                    ↓
        Crear encabezados si no existen
                    ↓
        Convertir datos a fila
                    ↓
        Insertar en Google Sheets
                    ↓
        Formatter nueva fila
                    ↓
        Registrar en Auditoria
                    ↓
        Retornar { success: true, message: '...' }
```

### Funciones Clave

| Función | Propósito |
|---------|-----------|
| `doPost(e)` | Punto de entrada HTTP POST |
| `getSheetNameForForm(formType)` | Mapea formulario a hoja |
| `appendDataToSheet()` | Inserta fila en Sheets |
| `createHeaders()` | Crea encabezados automáticamente |
| `convertDataToRow()` | Convierte JSON a array de fila |
| `formatNewRow()` | Formatea la fila insertada |
| `logSubmission()` | Registra en hoja Auditoria |
| `testConfiguration()` | Verifica que Scripts esté configurado |
| `getDataSummary()` | Muestra total de registros por hoja |

---

## 📊 Estructura de Google Sheets

### Hoja: Afiliaciones
```
| Fecha Recibida | Nombre | Organización | Email | Teléfono | Tipo Org | Sector | Ciudad | Descripción | Estado |
```

### Hoja: Contactos
```
| Fecha Recibida | Nombre | Email | Teléfono | Asunto | Mensaje | Estado |
```

### Hoja: Consultorias
```
| Fecha Recibida | Nombre | Organización | Email | Teléfono | Tipo Consultoría | Descripción | Rango Empleados | Estado |
```

### Hoja: Registros_Eventos
```
| Fecha Recibida | Nombre | Organización | Email | Teléfono | Ciudad | Cargo | Hospedaje | Comentarios | Estado |
```

### Hoja: Registros_Ferias
```
| Fecha Recibida | Nombre Org | Representante | Email | Teléfono | Productos | Tipo Producto | Tamaño Stand | Estado |
```

### Hoja: Auditoria (automática)
```
| Fecha | Tipo Formulario | Contacto |
```

---

## 🔐 Seguridad

### Validaciones Frontend
- ✅ Campos requeridos obligatorios
- ✅ Validación de email (regex)
- ✅ Validación de teléfono (formato)
- ✅ Prevención de XSS (innerText en lugar de innerHTML)

### Validaciones Backend (Google Apps Script)
- ✅ Verificación de estructura JSON
- ✅ Validación de formType
- ✅ Manejo de errores try-catch
- ✅ Logging de auditoría

### Google Sheets Seguridad
- ✅ No es público (acceso privado)
- ✅ Solo el Apps Script tiene acceso
- ✅ Los datos se guardan en servidores de Google
- ✅ Cumple con GDPR/privacidad

---

## 🌐 CORS y Configuración

### Google Apps Script Auto-CORS
Google Apps Script maneja CORS automáticamente cuando se publica como Web App:
- ✅ Acepta solicitudes desde cualquier origen
- ✅ Responde con headers CORS correctos
- ✅ No requiere configuración manual

### Endpoint URL
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/usercontent
```

---

## 📱 Responsividad

### CSS Media Queries en modal-forms.css
```css
@media (max-width: 640px) {
    .modal-content {
        margin: 1rem;
        padding: 1.5rem;
    }
}
```

### Comportamiento Responsive
- 📱 Móvil: Modal ocupa 90% del viewport
- 💻 Desktop: Modal centrado, máx 500px
- 🖥️ Large screens: Máximo 700px

---

## 🎨 Estilos y Temas

### Colores CEPSE (del diseño existente)
```css
--primary: #13ec13 (verde solidario)
--secondary: #10ad4a (verde natural)
--accent: #06d6d0 (cian moderno)
--dark: #1a2332 (gris oscuro)
--light: #ffffff (blanco)
```

### Componentes Estilizados
- ✅ Inputs: Borde slate, foco verde
- ✅ Buttons: Verde primario, hover efecto
- ✅ Modales: Fondo blur, animación slide-up
- ✅ Alerts: Rojo (error), verde (éxito), amarillo (warning)

---

## 📈 Escalabilidad

### Agregar Nuevo Tipo de Formulario

**Paso 1: Agregar config en forms-config.js**
```javascript
FORMS_CONFIG.miFormulario = {
    id: 'mi-formulario-modal',
    title: '📝 Mi Formulario',
    fields: [...],
    sheetName: 'MiHoja'
};
```

**Paso 2: Agregar mapeo en google-apps-script.gs**
```javascript
const mapping = {
    ...
    'mi-formulario-modal': 'MiHoja'
};
```

**Paso 3: Crear hoja en Google Sheets**
- Nombre exacto: `MiHoja`

**Paso 4: Usar en HTML**
```html
<button data-form="miFormulario">Mi botón</button>
```

---

## ✅ Desarrollo Completado

| Componente | Estado |
|----------|--------|
| forms-config.js | ✅ 5 formularios implementados |
| forms-handler.js | ✅ Validación + envío completo |
| modal-forms.css | ✅ Estilos responsivos |
| google-apps-script.gs | ✅ Backend 100% funcional |
| index.html | ✅ Scripts integrados |
| Documentación | ✅ Guías completas |

---

## 📞 Soporte

Consulta estos documentos:
- [Google-Sheets-Setup.md](Google-Sheets-Setup.md) - Guía paso a paso
- [ACTUALIZAR-BOTONES.md](ACTUALIZAR-BOTONES.md) - Cómo actualizar botones
