# 🔗 GUÍA: Conectar Botones a Formularios

Esta guía te muestra EXACTAMENTE cómo actualizar los botones de tus componentes para que abran formularios con Google Sheets integration.

## Cambio Simple: Agregar `data-form="tipo"`

### ANTES (sin funcionalidad)
```html
<button class="btn-primary">Unirse ahora</button>
```

### DESPUÉS (abre formulario + Google Sheets)
```html
<button data-form="affiliation" class="btn-primary">Unirse ahora</button>
```

---

## 5 Tipos de Formularios Disponibles

| Tipo | data-form | Descripción |
|------|-----------|-------------|
| 📝 Afiliación | `affiliation` | Solicitar afiliación a CEPSE |
| 📧 Contacto | `contact` | Enviar consulta general |
| 🎯 Consultoría | `consulting` | Solicitar asesoramiento personalizado |
| 🎫 Evento | `eventRegistration` | Registrarse a un evento/taller |
| 🎪 Feria | `fairRegistration` | Registrarse para participar en ferias |

---

## Ejemplos por Componente

### 1️⃣ header.html - Botón "Unirse ahora"

**Busca:**
```html
<button id="open-register-modal" class="btn-primary">
    Unirse ahora
</button>
```

**Reemplaza con:**
```html
<button data-form="affiliation" class="btn-primary">
    Unirse ahora
</button>
```

---

### 2️⃣ hero.html - Botón "Registrar Asociación"

**Busca:**
```html
<button id="open-register-modal" class="btn-primary">
    Registrar Asociación
</button>
```

**Reemplaza con:**
```html
<button data-form="affiliation" class="btn-primary">
    Registrar Asociación
</button>
```

---

### 3️⃣ contact.html - Botón "Enviar Solicitud"

**Busca:**
```html
<button type="submit" class="btn-primary">
    Enviar Solicitud
</button>
```

**Reemplaza con:**
```html
<button type="button" data-form="contact" class="btn-primary">
    Enviar Solicitud
</button>
```

**O si quieres mantener el formulario existente (alternativa):**
Puedes dejar el formulario de contact.html como está y solo agregar un botón adicional:
```html
<button data-form="contact" class="btn-secondary">
    O envía una consulta rápida
</button>
```

---

### 4️⃣ services.html - Botón "Solicitar Asesoramiento"

Si tienes un botón en cada servicio:

**Busca:**
```html
<button class="btn-primary">
    Solicitar Asesoramiento
</button>
```

**Reemplaza con:**
```html
<button data-form="consulting" class="btn-primary">
    Solicitar Asesoramiento
</button>
```

---

### 5️⃣ what-we-do.html - Botones varios

Si tienes botones para solicitar más información:

**Busca:**
```html
<button class="btn-secondary">
    Más información
</button>
```

**Reemplaza con:**
```html
<button data-form="consulting" class="btn-secondary">
    Más información
</button>
```

---

### 6️⃣ Para Eventos (si existe section)

**Nuevo:**
```html
<button data-form="eventRegistration" class="btn-primary">
    Registrarme al evento
</button>
```

---

### 7️⃣ Para Ferias (si existe section)

**Nuevo:**
```html
<button data-form="fairRegistration" class="btn-primary">
    Participar en Feria
</button>
```

---

## ¿Qué pasa al agregar `data-form`?

El JavaScript automáticamente:

1. ✅ **Atrapa el click** del botón
2. ✅ **Crea un modal** con el formulario correcto
3. ✅ **Valida los datos** cuando el usuario los envía
4. ✅ **Envía a Google Sheets** vía Google Apps Script
5. ✅ **Muestra confirmación** al usuario
6. ✅ **Cierra el modal** automáticamente

Todo esto sucede sin tocar nada más de tu código HTML.

---

## Ejemplo Completo: hero.html

**ANTES:**
```html
<section class="py-16 md:py-24">
    <div class="container">
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Economía Popular y Solidaria
        </h1>
        <p class="text-xl text-slate-600 mb-8">
            Apoyamos a organizaciones de la economía solidaria
        </p>
        
        <div class="flex gap-4">
            <button id="open-register-modal" class="btn-primary">
                Registrar Asociación
            </button>
            <button class="btn-secondary">
                Descubrir nuestro trabajo
            </button>
        </div>
    </div>
</section>
```

**DESPUÉS:**
```html
<section class="py-16 md:py-24">
    <div class="container">
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Economía Popular y Solidaria
        </h1>
        <p class="text-xl text-slate-600 mb-8">
            Apoyamos a organizaciones de la economía solidaria
        </p>
        
        <div class="flex gap-4">
            <button data-form="affiliation" class="btn-primary">
                Registrar Asociación
            </button>
            <button class="btn-secondary">
                Descubrir nuestro trabajo
            </button>
        </div>
    </div>
</section>
```

**Cambio:** Solo reemplazamos `id="open-register-modal"` con `data-form="affiliation"`

---

## Checklist de Actualización

- [ ] header.html - "Unirse ahora" → data-form="affiliation"
- [ ] hero.html - "Registrar Asociación" → data-form="affiliation"
- [ ] contact.html - Actualizar botón de contacto
- [ ] services.html - Botones de asesoramiento
- [ ] what-we-do.html - Botones varios
- [ ] (Opcional) about.html - Si hay botones
- [ ] (Opcional) benefits.html - Si hay botones
- [ ] (Opcional) impact.html - Si hay botones

---

## Preguntas Frecuentes

**P: ¿Puedo usar el mismo data-form en múltiples botones?**
✅ Sí, absolutamente. Múltiples botones pueden abrir el mismo formulario.

**P: ¿Qué pasa si tengo un formulario ya existente en HTML?**
✅ Puedes dejarlo como está. Los formularios HTML nativos y los data-form coexisten.

**P: ¿Cómo cambio el estilo del modal?**
✅ Edita `css/modal-forms.css` - tiene todos los estilos de apariencia.

**P: ¿Qué datos se envían a Google Sheets?**
✅ Todos los campos del formulario + fecha/hora + dirección IP (si aplica).

**P: ¿Dónde veo los datos?**
✅ En tu Google Sheet, en las pestañas: Afiliaciones, Contactos, Consultorias, etc.

---

## Resultado Final

Una vez actualizado, el flujo será:

```
Usuario → Click en "Unirse ahora"
                        ↓
        Modal se abre con formulario bonito
                        ↓
        Usuario llena 8 campos
                        ↓
        Click "Enviar Solicitud"
                        ↓
        JavaScript valida
                        ↓
        Se envía a Google Apps Script
                        ↓
        Google Apps Script lo inserta en Sheets
                        ↓
        Se muestra "✓ ¡Éxito!" al usuario
                        ↓
        Modal se cierra automáticamente
```

Fácil, limpio, profesional.

---

**¿Necesitas ayuda?** 
Abre [Google-Sheets-Setup.md](Google-Sheets-Setup.md) para la guía completa de configuración.
