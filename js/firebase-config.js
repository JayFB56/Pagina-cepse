import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRDUmqbURpLWU6ydAPtksl7H1N9JmkQmI",
  authDomain: "lechefacil-db12e.firebaseapp.com",
  projectId: "lechefacil-db12e",
  storageBucket: "lechefacil-db12e.firebasestorage.app",
  messagingSenderId: "464807946806",
  appId: "1:464807946806:web:ac1b919a344e56ae11c697",
  measurementId: "G-P4TX4NLHJT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addFormSubmission(formData) {
  try {
    const docRef = await addDoc(collection(db, "form_submissions"), {
      ...formData,
      timestamp: serverTimestamp(),
      submittedAt: new Date().toLocaleString('es-EC')
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al guardar:", error);
    throw error;
  }
}

window.firebaseSubmit = addFormSubmission;
