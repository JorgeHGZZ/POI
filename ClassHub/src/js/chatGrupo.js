const attachBtn = document.getElementById("attachBtn");
const dropdown = document.getElementById("optionsDropdown");
const sendBtn = document.querySelector(".send-btn");
const chatText = document.getElementById("chatText");
const messages = document.querySelector(".chat-container");

attachBtn.addEventListener("click", () => {
    dropdown.style.display = (dropdown.style.display === "flex") ? "none" : "flex";
});

// Cierra el dropdown si clicas fuera
document.addEventListener("click", (e) => {
    if (!attachBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
    }
});



// Mostrar/ocultar el dropdown de opciones
attachBtn.addEventListener("click", () => {
    dropdown.style.display = (dropdown.style.display === "flex") ? "none" : "flex";
});

// Cierra el dropdown si clicas fuera
document.addEventListener("click", (e) => {
    if (!attachBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
    }
});

// Enviar mensaje al hacer clic en el botón de enviar
sendBtn.addEventListener("click", () => {
    sendMessage(chatText.value.trim(), "right");
});

// Enviar mensaje al presionar Enter
chatText.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage(chatText.value.trim(), "right");
    }
});

/**
 * Función para enviar un mensaje
 * @param {string} text - El texto del mensaje
 * @param {string} side - El lado del mensaje ("left" o "right")
 */
function sendMessage(text, side) {
    if (text !== "") {
        const msg = document.createElement("div");
        msg.classList.add("message", side);

        // Crear el contenido del mensaje
        const bubble = document.createElement("div");
        bubble.classList.add("bubble");
        bubble.textContent = text;

        // Crear el contenedor del avatar (solo para mensajes de la izquierda)
        if (side === "left") {
            const avatarContainer = document.createElement("div");
            avatarContainer.classList.add("avatar-container");

            const avatar = document.createElement("img");
            avatar.src = "src/img/tanjiro.jpg"; // Cambia la imagen según el usuario
            avatar.classList.add("avatar");

            const status = document.createElement("span");
            status.classList.add("status", "online"); // Cambia el estado según sea necesario

            avatarContainer.appendChild(avatar);
            avatarContainer.appendChild(status);

            msg.appendChild(avatarContainer);
        }

        // Agregar la burbuja al mensaje
        msg.appendChild(bubble);

        // Agregar el avatar al final si el mensaje es de la derecha
        if (side === "right") {
            const avatarContainer = document.createElement("div");
            avatarContainer.classList.add("avatar-container");

            const avatar = document.createElement("img");
            avatar.src = "src/img/turboruca.webp"; // Cambia la imagen según el usuario
            avatar.classList.add("avatar");

            const status = document.createElement("span");
            status.classList.add("status", "online");

            avatarContainer.appendChild(avatar);
            avatarContainer.appendChild(status);

            msg.appendChild(avatarContainer);
        }

        // Agregar el mensaje al contenedor de mensajes
        messages.appendChild(msg);

        // Limpiar el campo de texto
        chatText.value = "";

        // Hacer scroll automático hacia el último mensaje
        messages.scrollTop = messages.scrollHeight;
    } else {
        alert("El mensaje no puede estar vacío.");
    }
}


