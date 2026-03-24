# 🧪 VERIFICAR QUE FIREBASE FUNCIONA

Sigue estos pasos para confirmar que todo está funcionando:

---

## Paso 1: Prueba la Página Web

1. Abre tu página web en tu navegador
2. Haz clic en cualquier botón que abra un formulario (Afiliación, Contacto, etc.)
3. Completa con datos de prueba:
   - **Nombre:** Tu nombre
   - **Email:** tu@email.com
   - **Otros campos:** Llena como prefieras

4. Haz clic en **"Enviar Solicitud"**
5. Deberías ver un mensaje verde que dice: **"¡Solicitud enviada con éxito!"**

Si ves el mensaje verde = ✅ **Funciona**

---

## Paso 2: Verifica en Firebase Console

1. Ve a: **https://console.firebase.google.com**
2. Inicia sesión con Google
3. Selecciona proyecto: **lechefacil-db12e**
4. Haz clic en: **Firestore Database** (izquierda)
5. Abre colección: **form_submissions**
6. Busca tu solicitud de prueba (con el nombre que usaste)

Si la ves aquí = ✅ **Firebase funciona**

---

## Paso 3: Comprueba los Datos

Haz clic en tu solicitud para abrirla. Deberías ver:
- ✅ Tu nombre
- ✅ Tu email
- ✅ Otros datos que completaste
- ✅ Timestamp (fecha y hora)
- ✅ formType (tipo de formulario)

Si todo esto aparece = ✅ **Todo funciona perfectamente**

---

## ❌ Si Algo No Funciona

### Problema: El mensaje verde no aparece
- Recarga la página web
- Verifica que completaste todos los campos requeridos
- Intenta nuevamente

### Problema: El mensaje aparece pero NO veo la solicitud en Firebase
- Espera 5-10 segundos (a veces tarda)
- Recarga la página de Firebase (F5)
- Verifica que estés en la colección correcta: **form_submissions**
- Asegúrate de estar en el proyecto: **lechefacil-db12e**

### Problema: No puedo acceder a Firebase Console
- Verifica que inicies sesión con la cuenta Google correcta
- Intenta en modo incógnito (Ctrl+Mayús+N)
- Limpia el caché del navegador

---

## ✅ Checklist de Verificación

- [ ] La página web carga sin errores
- [ ] Puedo hacer clic en un botón de formulario
- [ ] Se abre un modal/ventana con el formulario
- [ ] Los campos del formulario son editables
- [ ] Puedo hacer clic en "Enviar Solicitud"
- [ ] Aparece mensaje verde de éxito
- [ ] Puedo acceder a Firebase Console
- [ ] Veo la colección "form_submissions"
- [ ] Mi solicitud de prueba aparece en Firebase
- [ ] Los datos están correctos en Firebase

Si todas las casillas están ✅ = **¡Sistema configurado correctamente!**

---

## 📝 Borrar Solicitud de Prueba (Opcional)

Si quieres borrar la solicitud que usaste para probar:

1. Abre tu solicitud en Firebase
2. Haz clic en el botón **"Eliminar"** (papelera)
3. Confirma que sí quieres eliminar
4. Listo, desaparece de la base de datos

---

**Después de verificar, tu sistema está listo para recibir solicitudes reales.**
