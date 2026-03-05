# ✅ TESTING & VERIFICACIÓN: Checklist Completo

## 🧪 PRUEBAS LOCALES (Antes de Publicar)

### Test 1: Verificar Archivos Creados
```
✅ Archivos que DEBEN existir:

/Pagina-cepse/
├── js/
│   ├── forms-config.js                  ← Existencia
│   └── forms-handler.js                 ← Existencia
├── css/
│   └── modal-forms.css                  ← Existencia
├── google-apps-script.gs                ← Referencia (copiar a Apps Script)
├── Google-Sheets-Setup.md               ← Documentación
├── ACTUALIZAR-BOTONES.md                ← Documentación
├── ARQUITECTURA.md                      ← Documentación
├── FORMULARIOS-DETALLE.md               ← Documentación
├── RESUMEN.md                           ← Documentación
├── EJEMPLO-header.html                  ← Ejemplo
├── EJEMPLO-contact.html                 ← Ejemplo
└── TESTING.md                           ← Este archivo
```

**Comando para verificar:**
```bash
# En tu terminal
ls -la Pagina-cepse/js/forms-*.js
ls -la Pagina-cepse/css/modal-forms.css
```

---

### Test 2: Verificar index.html

**Abre:** `index.html`

**Busca que contenga:**
```html
<!-- Estilos para modales de formularios -->
<link rel="stylesheet" href="css/modal-forms.css">

<!-- Scripts de Interacción -->
<script src="js/interactions.js"></script>

<!-- Configuración de Formularios -->
<script src="js/forms-config.js"></script>
<script src="js/forms-handler.js"></script>
```

✅ **Orden importante:**
1. `modal-forms.css` en `<head>`
2. `interactions.js` antes de `forms-config.js`
3. `forms-config.js` antes de `forms-handler.js`

---

### Test 3: Verificar Consola (Sin Errores)

1. Abre tu sitio en navegador
2. Presiona F12 (DevTools)
3. Ve a la pestaña "Consola"
4. Debería verse limpia (sin errores rojo)
5. Debería ver: `undefined` o `[object Object]` (normal)

**Comando en Consola:**
```javascript
// Debería listar 5 tipos de formulario
Object.keys(FORMS_CONFIG)

// Resultado esperado:
// ['affiliation', 'contact', 'consulting', 'eventRegistration', 'fairRegistration']
```

---

## 🔗 Conexión Google Sheet + Google Apps Script

### Test 4: Crear Google Sheet

**Instrucciones:**
1. Ve a https://sheets.google.com
2. Click "Crear"
3. Título: `CEPSE - Base de Datos`
4. Copia el ID de la URL: `https://docs.google.com/spreadsheets/d/**AQUI**/edit`
5. Guarda el ID para más tarde

**Verifica:**
- [ ] Google Sheet creado
- [ ] 5 pestañas renombradas (Afiliaciones, Contactos, Consultorias, Registros_Eventos, Registros_Ferias)
- [ ] ID copiado

---

### Test 5: Desplegar Google Apps Script

**Instrucciones:**
1. Ve a https://script.google.com
2. Click "Nuevo Proyecto"
3. Nombre: `CEPSE-FormHandler`
4. En el editor, selecciona TODO el código default
5. Bórraloyuga y copia TODO de `google-apps-script.gs`
6. En Apps Script línea 9, reemplaza:
   ```javascript
   const SHEET_ID = 'TU_GOOGLE_SHEET_ID';
   ```
   Con tu ID de Google Sheets
7. Ctrl+S para guardar

**Verifica:**
- [ ] Código copiado sin errores
- [ ] SHEET_ID reemplazado
- [ ] Guardado

---

### Test 6: Publicar Google Apps Script como Web App

**Instrucciones:**
1. En Google Apps Script, click "Desplegar" (botón azul arriba)
2. Selecciona "Nueva implementación"
3. Tipo: "Aplicación web"
4. Ejecutar como: Tu cuenta
5. Quién tiene acceso: "Cualquiera" o "En tu organización"
6. Click "Desplegar"
7. Copia la URL que aparece:
   ```
   https://script.google.com/macros/s/AKfycby...XXXX/usercontent
   ```

**Verifica:**
- [ ] Web App publicada
- [ ] URL copiada

---

### Test 7: Actualizar Endpoint en forms-handler.js

**Archivo:** `js/forms-handler.js`

**Línea ~160:**
```javascript
// ENCONTRAR:
const API_ENDPOINT = 'https://script.google.com/macros/s/TU_DEPLOYMENT_ID/usercontent';

// REEMPLAZAR CON:
const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycby...XXXX/usercontent';
```

**Verifica:**
- [ ] URL reemplazada
- [ ] Guardado
- [ ] No tiene espacios al inicio/final

---

## 🎯 Testing de Funcionalidad

### Test 8: Verificar FormManager Inicializado

1. Abre el sitio en navegador
2. Abre DevTools (F12)
3. Consola
4. Escribe:
```javascript
window.formManager
```

**Resultado esperado:**
```javascript
FormManager {
    apiEndpoint: "https://script.google.com/macros/s/...",
    currentForm: null,
    isLoading: false,
    ...
}
```

✅ Si ves esto → FormManager cargado correctamente

---

### Test 9: Abrir Modal Manualmente

**En la Consola:**
```javascript
// Abrir modal de afiliación
window.formManager.openForm('affiliation')

// Abrir modal de contacto
window.formManager.openForm('contact')
```

**Verifica:**
- [ ] Modal aparece
- [ ] Tiene título y campos
- [ ] Botón "X" para cerrar
- [ ] Fondo oscuro detrás

---

### Test 10: Agregar data-form a Botón de Prueba

**En tu HTML (cualquier componente):**
```html
<!-- Abrir inspector y encuentra un botón, modifica temporalmente: -->
<button data-form="affiliation" class="btn-primary">
    TEST: Click para abrir formulario
</button>
```

**Test:**
1. Recarga el sitio
2. Click en el botón
3. Modal debe abrirse
4. Verifica que tiene los campos correctos

✅ Si funciona → Los listeners están bien implementados

---

### Test 11: Enviar Formulario de Prueba

1. Click en botón modal
2. Llena TODOS los campos obligatorios:
   - Nombre: `Juan Pérez`
   - Email: `juan@prueba.com`
   - Teléfono: `0987654321`
   - etc.
3. Acepta términos (checkbox)
4. Click "Enviar Solicitud"

**Debería:**
- [ ] Botón cambiar a "⏳ Enviando..."
- [ ] Desaparecer después de 1-2 segundos
- [ ] Mostrar Toast "✓ ¡Solicitud enviada con éxito!"
- [ ] Modal cerrarse automáticamente
- [ ] NO mostrar error rojo

---

### Test 12: Verificar Datos en Google Sheets

1. Abre tu Google Sheet `CEPSE - Base de Datos`
2. Ve a la hoja `Afiliaciones`
3. Busca la fila que acabas de enviar
4. Debería ver:
   - Fecha en la primera columna
   - Tu nombre "Juan Pérez"
   - Tu email "juan@prueba.com"
   - etc.

✅ Si ves los datos → **FUNCIONANDO PERFECTAMENTE**

---

## 🚨 Debugging si Algo Falla

### Error: Modal no Aparece

**Solución:**
1. Abre DevTools Consola
2. Verifica que no hay errores rojo
3. Escribe: `FORMS_CONFIG` → debe mostrar los 5 formularios
4. Verifica que el botón tiene `data-form="affiliation"` (no otro valor)
5. Recarga la página

---

### Error: Botón dice "Enviando..." pero no termina

**Solución:**
1. En DevTools → Network
2. Click en enviar
3. Busca la solicitud POST
4. Si ves error 404 → El DEPLOYMENT_ID es incorrecto
5. Si ves error 403 → Permisos de Google insuficientes

**Revisar:**
- [ ] DEPLOYMENT_ID correcto en forms-handler.js
- [ ] SHEET_ID correcto en google-apps-script.gs
- [ ] Google Sheet compartido (si aplica)

---

### Error: "No se pudo conectar con el servidor"

**Solución:**
1. Verifica que el Apps Script está publicado
2. Verifica que la URL es pública o tu organización tiene acceso
3. En Google Apps Script, ve a "Implementaciones" y verifica que hay una activa

---

### Datos no aparecen en Sheets

**Solución:**
1. Abre Google Apps Script
2. Ve a "Ejecuciones"
3. Busca errores en el log
4. Verifica que el Sheet ID es correcto
5. Verifica que la hoja "Afiliaciones" existe

---

## 📊 Test de Performance

### Test 13: Velocidad de Modal

**Proceso:**
1. Click en botón
2. Modal debe aparecer en < 500ms
3. Animación suave (no lag)
4. Campos se cargan al mismo tiempo

✅ Si es rápido → Optimizatión OK

---

### Test 14: Submit Performance

**Proceso:**
1. Llena forma
2. Click enviar
3. Debería tardar 1-3 segundos en máximo
4. No debe freezear el navegador

---

## 🔐 Test de Seguridad

### Test 15: Validación de Email

**Intenta:**
```
Campo email: "noesunmail"
Resultado: ❌ No debe permitir, debe mostrar error
```

**Intenta:**
```
Campo email: "test@test.com"
Resultado: ✅ Debe ser aceptado
```

---

### Test 16: Campos Requeridos

**Intenta enviar sin llenar un campo obligatorio:**
```
Resultado esperado:
- ❌ Campo se pone rojo/celeste
- Mensaje: "Por favor completa todos los campos obligatorios"
- Formulario NO se envía
```

---

## 📱 Test de Responsividad

### Test 17: Mobile

1. Abre el sitio en móvil (o DevTools Device
2. Click en botón para abrir modal
3. Modal debe:
   - [ ] Ocupar el 90% del ancho
   - [ ] Tener márgenes
   - [ ] Ser scrollable si es muy largo
   - [ ] Botones full-width
   - [ ] Texto legible
   - [ ] X para cerrar visible

---

### Test 18: Tablet

1. Resize navegador a 768px
2. Modal debe:
   - [ ] Estar centrado
   - [ ] Ser legible
   - [ ] Inputs no deben ser microscópicos

---

## 🎨 Test de UI/UX

### Test 19: Colores

Modal debe:
- [ ] Botón principal: Verde `#13ec13`
- [ ] Texto: Oscuro (legible)
- [ ] Campos: Borde gris claro
- [ ] Foco: Borde verde
- [ ] Fondo modal: Blanco
- [ ] Overlay: Negro semi-transparente

---

### Test 20: Animaciones

- [ ] Modal se abre suavemente (slide-up)
- [ ] Hover en botón: cambio sutil
- [ ] Loading: icono rota
- [ ] Toast: fade-in suave
- [ ] Cierre: suave

---

## ✨ Formularios Adicionales

### Test 21: Todos los 5 Tipos

**Prueba cada uno:**
```javascript
window.formManager.openForm('affiliation')   // Debe tener 8 campos
window.formManager.openForm('contact')       // Debe tener 5 campos
window.formManager.openForm('consulting')    // Debe tener 8 campos
window.formManager.openForm('eventRegistration') // 8 campos
window.formManager.openForm('fairRegistration')  // 8 campos
```

✅ Si todos abren → Configuración correcta

---

## 🏁 CHECKLIST FINAL PRE-PRODUCCIÓN

Antes de poner el sitio en producción:

### Backend
- [ ] Google Sheet creado
- [ ] 5 hojas renombradas
- [ ] Google Apps Script publicado
- [ ] DEPLOYMENT_ID correcto
- [ ] SHEET_ID correcto

### Frontend
- [ ] CSS modal incluido en index.html
- [ ] Scripts en orden correcto
- [ ] Endpoint actualizado
- [ ] Botones tienen data-form correcto

### Testing
- [ ] Modales abren correctamente
- [ ] Todos los 5 tipos funcionsn
- [ ] Formulario de prueba se envía
- [ ] Datos aparecen en Google Sheets
- [ ] Validaciones funcionan
- [ ] Responsive en móvil
- [ ] Sin errores en consola

### Documentación
- [ ] Equipo entiende ARQUITECTURA.md
- [ ] Equipo entiende Google-Sheets-Setup.md
- [ ] Equipo sabe cómo agregar data-form
- [ ] Existe contacto para soporte

---

## 🎉 Resultado de Testing Exitoso

Si pasaste TODO, deberías tener:

✅ 5 formularios funcionales  
✅ Google Sheets recopilando datos  
✅ Validación en frontend  
✅ Validación en backend  
✅ UI bonita y responsive  
✅ Auditoría automática  
✅ Sin dependencias externas  

**¡FELICIDADES!** 🚀

---

**Última prueba de humo:**

```javascript
// En consola, ejecuta esto:
() => {
  console.log('✅ FORMS_CONFIG cargado:', Object.keys(FORMS_CONFIG).length, 'formularios');
  console.log('✅ FormManager existe:', !!window.formManager);
  console.log('✅ Modal CSS cargado:', !!document.querySelector('[data-form]'));
  console.log('✅ LISTO PARA PRODUCCIÓN');
}()
```

Debería ver:
```
✅ FORMS_CONFIG cargado: 5 formularios
✅ FormManager existe: true
✅ Modal CSS cargado: true
✅ LISTO PARA PRODUCCIÓN
```

---

**¡Vamos!** Empieza a testear 🧪
