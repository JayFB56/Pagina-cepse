# 📝 REFERENCIA: Estructura Detallada de Todos los Formularios

## 1️⃣ FORMULARIO DE AFILIACIÓN (data-form="affiliation")

### Uso
- Botón: "Unirse ahora", "Registrar Asociación"
- Ubicación: Header, Hero, cualquier lugar

### Campos (8 campos)
```
┌─────────────────────────────────┐
│ 📝 SOLICITAR AFILIACIÓN          │
└─────────────────────────────────┤
│ Nombre Completo           [text] │  ← Tu nombre
│ Nombre de Organización    [text] │  ← Ej: "Cooperativa El Oro"
│ Email                    [email] │  ← tu@email.com
│ Teléfono                 [phone] │  ← +593 9 XXXXXXXX
│ Tipo de Organización     [select]│  ← Asociación, Cooperativa, etc.
│ Sector Productivo        [select]│  ← Agricultura, Artesanía, etc.
│ Ciudad                    [text] │  ← Esmeraldas, Atacames, etc.
│ Descripción Actividad   [textarea]│  ← Describe tu organización
│                                  │
│ □ Acepto términos        [check] │
│ [ENVIAR SOLICITUD]       [btn]   │
└─────────────────────────────────┘
```

### Dónde se guarda
📊 **Google Sheet:** Hoja "Afiliaciones"
```
| Fecha | Nombre | Organización | Email | Tel | Tipo | Sector | Ciudad | Desc | Estado |
```

### Validaciones
- ✅ Nombre: Requerido
- ✅ Organización: Requerido
- ✅ Email: Requerido + validación @
- ✅ Teléfono: Requerido (formato válido)
- ✅ Tipo Org: Requerido (dropdown)
- ✅ Sector: Requerido (dropdown)
- ✅ Ciudad: Requerido
- ✅ Descripción: Opcional

---

## 2️⃣ FORMULARIO DE CONTACTO (data-form="contact")

### Uso
- Botón: "Contáctanos", "Enviar mensaje", "Consultar"
- Ubicación: Sección de contacto

### Campos (5 campos)
```
┌──────────────────────────┐
│ 📧 CONTÁCTANOS           │
│ Envía tu mensaje         │
└──────────────────────────┤
│ Nombre Completo   [text] │  ← Tu nombre
│ Email            [email] │  ← tu@email.com
│ Teléfono          [phone] │  ← Opcional
│ Asunto             [text] │  ← Tema del mensaje
│ Mensaje         [textarea]│  ← Por favor cuéntanos...
│                          │
│ □ Acepto términos[check] │
│ [ENVIAR]          [btn]   │
└──────────────────────────┘
```

### Dónde se guarda
📊 **Google Sheet:** Hoja "Contactos"
```
| Fecha | Nombre | Email | Tel | Asunto | Mensaje | Estado |
```

### Validaciones
- ✅ Nombre: Requerido
- ✅ Email: Requerido + validación @
- ✅ Teléfono: Opcional
- ✅ Asunto: Requerido
- ✅ Mensaje: Requerido (mínimo algunos caracteres)

---

## 3️⃣ FORMULARIO DE CONSULTORÍA (data-form="consulting")

### Uso
- Botón: "Solicitar Consultoría", "Asesoramiento", "Solicitar apoyo"
- Ubicación: Servicios, What We Do

### Campos (8 campos)
```
┌────────────────────────────────┐
│ 🎯 CONSULTORÍA PERSONALIZADA   │
└────────────────────────────────┤
│ Nombre Completo         [text] │
│ Organización            [text] │
│ Email                  [email] │
│ Teléfono                [tel]  │
│ Tipo de Consultoría   [select] │ ← Legal, Financiera,
│ Descripción de Necesidad[area] │    Productiva, etc.
│ Rango de Empleados      [text] │ ← Ej: 10-20 personas
│ Contacto Secundario    [email] │ ← Opcional
│                                │
│ □ Acepto términos     [check]  │
│ [SOLICITAR]             [btn]  │
└────────────────────────────────┘
```

### Dónde se guarda
📊 **Google Sheet:** Hoja "Consultorias"
```
| Fecha | Nombre | Org | Email | Tel | Tipo | Desc | Empleados | Estado |
```

### Validaciones
- ✅ Todos los campos requeridos excepto "Rango de Empleados"
- ✅ Email validado

---

## 4️⃣ FORMULARIO DE EVENTO (data-form="eventRegistration")

### Uso
- Botón: "Registrarse al evento", "Confirmar asistencia"
- Ubicación: Sección de eventos o talleres

### Campos (8 campos)
```
┌─────────────────────────────┐
│ 🎫 REGISTRARSE A EVENTO     │
│ Confirma tu asistencia      │
└─────────────────────────────┤
│ Nombre Completo      [text] │
│ Organización         [text] │
│ Email               [email] │
│ Teléfono              [tel] │
│ Ciudad               [text] │
│ Cargo/Rol:           [text] │ ← Ej: "Representante Legal"
│ ¿Requiere hospedaje? [sel] │ ← Sí / No
│ Comentarios         [area]  │ ← Opcional
│                             │
│ □ Acepto términos  [check]  │
│ [CONFIRMAR ASISTENCIA] [btn]│
└─────────────────────────────┘
```

### Dónde se guarda
📊 **Google Sheet:** Hoja "Registros_Eventos"
```
| Fecha | Nombre | Org | Email | Tel | Ciudad | Cargo | Hospedaje | Comentarios | Estado |
```

### Validaciones
- ✅ Nombre, Org, Email, Tel, Ciudad: Requeridos
- ✅ Cargo: Opcional
- ✅ Hospedaje: Dropdown (Sí/No)

---

## 5️⃣ FORMULARIO DE FERIAS (data-form="fairRegistration")

### Uso
- Botón: "Participar en Feria", "Registrarse para vender"
- Ubicación: Sección de comercialización/ferias

### Campos (8 campos)
```
┌──────────────────────────────┐
│ 🎪 REGISTRARSE PARA FERIAS  │
│ Participa en nuestros eventos│
└──────────────────────────────┤
│ Nombre Organización  [text]  │
│ Representante Legal  [text]  │
│ Email               [email]  │
│ Teléfono              [tel]  │
│ Productos a Ofrecer [area]   │ ← Describe qué venderás
│ Tipo de Producto   [select]  │ ← Alimentos, Artesanía, etc
│ Tamaño Stand (m²)   [text]   │ ← Ej: "4", "6", "9"
│ Comentarios        [area]    │ ← Opcional
│                              │
│ □  Acepto términos [check]   │
│ [PARTICIPAR EN FERIA] [btn]  │
└──────────────────────────────┘
```

### Dónde se guarda
📊 **Google Sheet:** Hoja "Registros_Ferias"
```
| Fecha | Nombre Org | Representante | Email | Tel | Productos | Tipo | Stand | Estado |
```

### Validaciones
- ✅ Todos para más información del comerciante
- ✅ Productos y Tipo son obligatorios para determinar stand

---

## 📊 Tabla Comparativa

| Aspecto | Afiliación | Contacto | Consultoría | Evento | Ferias |
|---------|-----------|----------|------------|--------|--------|
| **data-form** | affiliation | contact | consulting | eventRegistration | fairRegistration |
| **Campos** | 8 | 5 | 8 | 8 | 8 |
| **Google Sheet** | Afiliaciones | Contactos | Consultorias | Registros_Eventos | Registros_Ferias |
| **Tipo de datos** | Org + Persona | Consulta | Asesoramiento | Asistencia | Comercio |
| **Complejidad** | Media | Baja | Alta | Media | Media |

---

## 🎯 Casos de Uso por Botón

### Botones en HEADER
```html
<button data-form="affiliation">Unirse ahora</button>
```

### Botones en HERO
```html
<button data-form="affiliation">Registrar Asociación</button>
<button data-form="consulting">Solicitar Apoyo</button>
```

### Botones en SERVICES
```html
<button data-form="consulting">Solicitar Asesoramiento</button>
<button data-form="eventRegistration">Ver Próximos Talleres</button>
```

### Botones en WHAT-WE-DO
```html
<button data-form="consulting">Solicitar Programa</button>
```

### Botones en CONTACT
```html
<button data-form="contact">Enviar Mensaje</button>
<button data-form="consulting">Agendar Consulta</button>
```

### Botones en BENEFICIOS (si existe)
```html
<button data-form="affiliation">Empezar Ahora</button>
```

---

## 🔄 Flujo de Datos

### Para CADA formulario:

```
1. USUARIO
   ↓ Click en botón data-form="tipo"
   ↓
2. MODAL SE ABRE
   ↓ Muestra formulario con campos
   ↓
3. USUARIO LLENA DATOS
   ↓ JavaScript valida en tiempo real
   ↓
4. USUARIO ENVÍA
   ↓ Fetch POST a Google Apps Script
   ↓
5. APPS SCRIPT RECIBE
   ↓ Valida datos
   ↓ Determina hoja correcta
   ↓
6. INSERTA EN SHEETS
   ↓ Agrega fila con datos
   ↓ Formatea la fila
   ↓
7. RESPUESTA AL USUARIO
   ↓ Muestra "✓ ¡Éxito!"
   ↓ Cierra modal
   ↓
8. DATOS EN SHEETS
   ✅ Puedes ver los datos inmediatamente
```

---

## 💾 Qué se guarda automáticamente

Para TODOS los formularios, automáticamente se guarda:

```javascript
{
    "fechaRecibida": "2024-01-15 14:30:00",  // ← Timestamp servidor
    "nombre": "Juan Pérez",                   // ← Campo del formulario
    "email": "juan@email.com",                // ← Campo del formulario
    // ... todos los campos del formulario
    "timestamps": true,                       // ← Hora exacta
    "validated": true                         // ← Fue validado
}
```

---

## ✨ Características Especiales

### Validación en Frontend
- ✅ Campos requeridos: No puedes enviar sin llenar
- ✅ Email: Valida formato @
- ✅ Teléfono: Valida formato válido
- ✅ Mensajes de error inmediatos

### Validación en Backend
- ✅ Segundas chequeo en Google Apps Script
- ✅ Prevención de inyección de datos
- ✅ Log de auditoría de todos los envíos

### UX
- ✅ Modal se centra en pantalla
- ✅ Animaciones suave
- ✅ Botón "loading" durante envío
- ✅ Toast con confirmación
- ✅ Se cierra automáticamente después de éxito
- ✅ Responsive (móvil, tablet, desktop)

---

## 🎨 Styling por Defecto

Todos los formularios usan:
- Color primario: `#13ec13` (verde CEPSE)
- Font: "Inter" (sans-serif)
- Border radius: `0.75rem` (redondeado)
- Focus: Cambio a verde + fondo blanco
- Botón: Verde primario, efecto hover

---

## 📱 Responsividad

### Desktop (> 768px)
- Modal: 500px max-width, centrado
- Grid: 2 columnas en email/phone
- Padding: Generoso

### Tablet (≤ 768px)
- Modal: 90% width
- Grid: 1 columna
- Padding: Reducido

### Mobile (< 640px)
- Modal: Full width menos márgenes
- Scrollable si es muy largo
- Botones: Full width
- Padding: Mínimo

---

## 🔍 Debugging

Si un formulario no aparece:
1. Abre DevTools (F12)
2. Consola
3. Escribe: `console.log(FORMS_CONFIG)` → Debe mostrar los 5 formularios
4. Verifica que el botón tiene `data-form="nombreCorrecto"`

Si no se envía:
1. Abre Network
2. Haz click en enviar
3. Debe ver POST a Google Apps Script
4. Si error 404, el DEPLOYMENT_ID es incorrecto

---

## 📋 Campos Globales Automáticos

Cada envío AUTOMATICAMENTE incluye:
```javascript
{
    timestamp: "2024-01-15 14:30:45",  // Servidor
    userAgent: "Mozilla/5...",          // Browser info
    url: "https://cepse.org.ec",       // De dónde se envió
    formType: "affiliation"             // Tipo de formulario
}
```

---

## ✅ Checklist de Implementación

- [ ] 5 formularios preconstruidos
- [ ] 5 hojas en Google Sheets
- [ ] Backend Google Apps Script funcionando
- [ ] Frontend conectado con endpoint correcto
- [ ] Validación en ambos lados
- [ ] CSS estilos bonitos
- [ ] Responsive en móvil
- [ ] Documentación completa
- [ ] Ejemplos HTML proporcionados

**TODO ESTÁ LISTO** ✨

Solo necesitas:
1. Crear Google Sheet
2. Desplegar Apps Script
3. Actualizar botones en HTML

¡Eso es todo!

---

**Preguntas?** Revisa [ARQUITECTURA.md](ARQUITECTURA.md) o [Google-Sheets-Setup.md](Google-Sheets-Setup.md)
