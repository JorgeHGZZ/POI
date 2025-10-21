// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";


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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

const usuarioActual = JSON.parse(localStorage.getItem("usuario"));

if (!usuarioActual) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "login.html";
}

// Ruta del grupo (puede hacerse dinámico más adelante)
const mensajesRef = ref(db, "grupos/grupo1/mensajes");

// Elementos del DOM
const chatBox = document.querySelector(".chat-container");
const chatInput = document.getElementById("chatText");
const sendBtn = document.querySelector(".send-btn");

// Enviar mensaje
sendBtn.addEventListener("click", enviarMensaje);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") enviarMensaje();
});

function enviarMensaje() {
    const texto = chatInput.value.trim();
    if (texto === "") return;

    push(mensajesRef, {
        usuario: usuarioActual.nombre,
        mensaje: texto,
        avatar: usuarioActual.foto,
        timestamp: Date.now()
    });

    chatInput.value = "";
}

// Escuchar mensajes
onValue(mensajesRef, (snapshot) => {
    chatBox.innerHTML = "";
    const data = snapshot.val();
    if (!data) return;

    Object.values(data).forEach(msg => {
        const esPropio = msg.usuario === usuarioActual.nombre;
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", esPropio ? "right" : "left");

        if (esPropio) {
            msgDiv.innerHTML = `
        <div class="bubble propio">${msg.mensaje}</div>
        <div class="avatar-container">
          <img src="${msg.avatar}" class="avatar">
        </div>`;
        } else {
            msgDiv.innerHTML = `
        <div class="avatar-container">
          <img src="${msg.avatar}" class="avatar">
        </div>
        <div class="bubble"><b>${msg.usuario}:</b> ${msg.mensaje}</div>`;
        }

        chatBox.appendChild(msgDiv);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
});



// /**
//  * Función para enviar un mensaje
//  * @param {string} text - El texto del mensaje
//  * @param {string} side - El lado del mensaje ("left" o "right")
//  */
// function sendMessage(text, side) {
//     if (text !== "") {
//         const msg = document.createElement("div");
//         msg.classList.add("message", side);

//         // Crear el contenido del mensaje
//         const bubble = document.createElement("div");
//         bubble.classList.add("bubble");
//         bubble.textContent = text;

//         // Crear el contenedor del avatar (solo para mensajes de la izquierda)
//         if (side === "left") {
//             const avatarContainer = document.createElement("div");
//             avatarContainer.classList.add("avatar-container");

//             const avatar = document.createElement("img");
//             avatar.src = "src/img/tanjiro.jpg"; // Cambia la imagen según el usuario
//             avatar.classList.add("avatar");

//             const status = document.createElement("span");
//             status.classList.add("status", "online"); // Cambia el estado según sea necesario

//             avatarContainer.appendChild(avatar);
//             avatarContainer.appendChild(status);

//             msg.appendChild(avatarContainer);
//         }

//         // Agregar la burbuja al mensaje
//         msg.appendChild(bubble);

//         // Agregar el avatar al final si el mensaje es de la derecha
//         if (side === "right") {
//             const avatarContainer = document.createElement("div");
//             avatarContainer.classList.add("avatar-container");

//             const avatar = document.createElement("img");
//             avatar.src = "src/img/turboruca.webp"; // Cambia la imagen según el usuario
//             avatar.classList.add("avatar");

//             const status = document.createElement("span");
//             status.classList.add("status", "online");

//             avatarContainer.appendChild(avatar);
//             avatarContainer.appendChild(status);

//             msg.appendChild(avatarContainer);
//         }

//         // Agregar el mensaje al contenedor de mensajes
//         messages.appendChild(msg);

//         // Limpiar el campo de texto
//         chatText.value = "";

//         // Hacer scroll automático hacia el último mensaje
//         messages.scrollTop = messages.scrollHeight;
//     } else {
//         alert("El mensaje no puede estar vacío.");
//     }
// }


