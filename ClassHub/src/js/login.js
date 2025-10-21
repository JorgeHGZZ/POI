// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCmKS915zbGQSuWcB0Ww_AfJarsEitCWGs",
    authDomain: "classhub-7fcb1.firebaseapp.com",
    databaseURL: "https://classhub-7fcb1-default-rtdb.firebaseio.com",
    projectId: "classhub-7fcb1",
    storageBucket: "classhub-7fcb1.firebasestorage.app",
    messagingSenderId: "900567668775",
    appId: "1:900567668775:web:40b5af38f8a85113d75602",
    measurementId: "G-VG4Y7LDZF6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🟢 Botón login
const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Guardar usuario en localStorage
        const userData = {
            uid: user.uid,
            nombre: user.displayName,
            email: user.email,
            foto: user.photoURL
        };
        localStorage.setItem("usuario", JSON.stringify(userData));

        // Redirigir al chat
        window.location.href = "chatGrupal.html";
    } catch (error) {
        console.error("❌ Error al iniciar sesión:", error);
        alert("Error al iniciar sesión con Google");
    }
});
