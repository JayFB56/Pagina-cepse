# Guía: Ver y Gestionar Solicitudes de la Página Web

Los formularios de tu página web ahora se guardan automáticamente en **Firebase** (una nube de almacenamiento segura). Esta guía te explica cómo acceder a todas las solicitudes.

---

## 📱 Paso 1: Acceder a Firebase Console

1. Ve a este enlace: **https://console.firebase.google.com**
2. Inicia sesión con tu cuenta de Google
3. Busca y selecciona el proyecto llamado: **"lechefacil-db12e"**

---

## 📋 Paso 2: Ver todas las Solicitudes

1. En el menú izquierdo, busca **"Firestore Database"** (base de datos)
2. Haz clic en eso
3. Verás una colección llamada **"form_submissions"**
4. Haz clic en ella para ver todas las solicitudes recibidas

### ¿Qué información ves?
Cada solicitud contiene:
- **Nombre** de la persona
- **Email** de contacto
- **Organización** a la que pertenece
- **Tipo de organización** (Asociación, Cooperativa, etc.)
- **Teléfono** (si lo proporcionó)
- **Mensaje** o consulta
- **Tipo de formulario** (Afiliación, Contacto, Consultoría, etc.)
- **Fecha y hora** exacta en que se envió

---

## 🔍 Paso 3: Filtrar y Buscar Solicitudes

### Por tipo de formulario:
1. Haz clic en el icono de **filtro** (embudo)
2. Selecciona "formType"
3. Elige el tipo: "affiliation", "contact", "consulting", etc.

### Por fecha:
1. Usa el mismo filtro
2. Selecciona "submittedAt" para ver solicitudes de un rango de fechas

### Buscar por palabra:
- Abre una solicitud específica haciendo clic en ella
- Busca con Ctrl+F (en Windows) o Cmd+F (en Mac)

---

## 📊 Paso 4: Exportar Datos a Excel o CSV

Si necesitas los datos en una hoja de cálculo (Excel, Google Sheets):

### Opción A: Descargar como JSON (más fácil)
1. En Firestore, haz clic en los 3 puntos (**...**)
2. Selecciona **"Exportar colección"**
3. Se descargará un archivo con todos los datos
4. Puedes abrirlo en Excel después

### Opción B: Copiar manualmente
1. Abre cada solicitud
2. Copia y pega la información en una hoja de Excel
3. Guarda cuando termines

---

## 💻 Paso 5: Ver Solicitudes Desde tu Teléfono

### Opción 1: Firebase App (Recomendado)
1. Descarga la app **"Firebase"** desde Google Play (Android) o App Store (iPhone)
2. Abre la app
3. Inicia sesión con tu cuenta de Google
4. Selecciona el proyecto "lechefacil-db12e"
5. Podrás ver las solicitudes en tiempo real

### Opción 2: Web en el teléfono
1. Abre Safari (iPhone) o Chrome (Android)
2. Ve a **https://console.firebase.google.com**
3. Sigue los mismos pasos que arriba

---

## 🔔 Paso 6: Recibir Notificaciones (Opcional)

Para recibir alertas cuando alguien envíe un formulario:

1. En tu teléfono, instala la app **Firebase**
2. En Firestore, el botón de **notificaciones** (campana) se activará automáticamente
3. Recibirás alertas en tiempo real

---

## ⚙️ Paso 7: Crear otra App para Ver Solicitudes

Si quieres que otros miembros de tu equipo vean las solicitudes:

### Opción 1: Darle acceso a Firebase
1. Abre **https://console.firebase.google.com**
2. Selecciona el proyecto
3. Haz clic en **"Configuración del proyecto"** (engranaje)
4. Ve a **"Usuarios y permisos"**
5. Haz clic en **"Agregar miembro"**
6. Escribe el email de la persona
7. Dale permisos: **"Editor"** (para que vea todo)

### Opción 2: Crearle una cuenta de usuario en una app
1. Contacta al desarrollador para crear una app personalizada
2. La app mostrará las solicitudes de forma más visual
3. No necesita acceso a Firebase directamente

---

## 🔐 Medidas de Seguridad

✅ **Tus datos están protegidos:**
- Firebase cifra toda la información
- Solo tú y personas autorizadas pueden acceder
- Las contraseñas no se guardan (solo emails)
- Google hace backup automático

---

## 🆘 Solución de Problemas

### "No veo Firestore"
- Recarga la página (F5)
- Asegúrate de estar en el proyecto correcto
- Cierra sesión y vuelve a iniciar

### "La solicitud no se guardó"
- Verifica que la página cargó completamente
- Intenta enviar otro formulario
- Contacta al desarrollador si el problema persiste

### "¿En qué colección se guardan?"
- Todas en: **form_submissions**
- Cada solicitud tiene un ID único automático

---

## 📞 ¿Necesitas Ayuda?

Si tienes dudas:
1. Intenta seguir de nuevo los pasos
2. Recarga la página si algo no funciona
3. Contacta al desarrollador de tu página web

---

## 📌 Resumen Rápido

| Lo que quieres | Cómo hacerlo |
|---|---|
| **Ver solicitudes** | Firebase Console → Firestore → form_submissions |
| **Descargar datos** | Firestore → Exportar colección |
| **Ver en el teléfono** | Descarga la app Firebase |
| **Dar acceso a otros** | Proyecto → Configuración → Agregar miembro |
| **Buscar una solicitud** | Usa filtros en Firestore |

---

**Última actualización:** Marzo 2026  
**Proyecto:** lechefacil-db12e
