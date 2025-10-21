import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onValue, onChildAdded, set, onDisconnect } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

class Chat {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyCmKS915zbGQSuWcB0Ww_AfJarsEitCWGs",
            authDomain: "classhub-7fcb1.firebaseapp.com",
            databaseURL: "https://classhub-7fcb1-default-rtdb.firebaseio.com",
            projectId: "classhub-7fcb1",
            storageBucket: "classhub-7fcb1.firebasestorage.app",
            messagingSenderId: "900567668775",
            appId: "1:900567668775:web:40b5af38f8a85113d75602",
            measurementId: "G-VG4Y7LDZF6"
        };

        this.init();
        this.presences
    }

    init() {
        // Initialize Firebase
        const app = initializeApp(this.firebaseConfig);
        this.analytics = getAnalytics(app);
        this.db = getDatabase(app);

        // Check user authentication
        this.usuarioActual = JSON.parse(localStorage.getItem("usuario"));
        if (!this.usuarioActual) {
            alert("Debes iniciar sesión primero.");
            window.location.href = "index.html";
            return;
        }

        this.initializeRefs();
        this.initializeDOM();
        this.setupEventListeners();
        this.setupPresence();
        this.listenToMessages();
    }

    initializeRefs() {
        this.mensajesRef = ref(this.db, "grupos/grupo1/mensajes");
        this.presRef = ref(this.db, `presences/${this.usuarioActual.uid}`);
        this.connectedRef = ref(this.db, ".info/connected");
    }

    initializeDOM() {
        this.chatBox = document.querySelector(".chat-container");
        this.chatInput = document.getElementById("chatText");
        this.sendBtn = document.querySelector(".send-btn");
    }

    setupEventListeners() {
        this.sendBtn.addEventListener("click", () => this.enviarMensaje());
        this.chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.enviarMensaje();
        });

        document.addEventListener("visibilitychange", () => {
            const status = document.visibilityState === "hidden" ? "offline" : "online";
            this.updatePresence(status);
        });

        window.addEventListener("beforeunload", () => this.handleBeforeUnload());

        // Añadir listener para el botón de ubicación
        document.getElementById('locationBtn').addEventListener('click', () => {
            this.enviarUbicacion();
            // Cerrar el dropdown después de clickear
            document.getElementById('optionsDropdown').classList.remove('open');
        });
    }

    enviarUbicacion() {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

                push(this.mensajesRef, {
                    uid: this.usuarioActual.uid,
                    usuario: this.usuarioActual.nombre,
                    mensaje: `📍 <a href="${googleMapsUrl}" target="_blank">Ver ubicación en Google Maps</a>`,
                    isLocation: true,
                    coords: { latitude, longitude },
                    avatar: this.usuarioActual.foto,
                    timestamp: Date.now()
                });
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('No se pudo obtener la ubicación');
            }
        );
    }

    renderMessage(msg, esPropio, msgUid) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", esPropio ? "right" : "left");

        const dataUidAttr = msgUid || msg.usuario || '';
        const avatar = msg.avatar || 'src/img/default-avatar.png';
        const presence = this.presences[dataUidAttr];
        const status = presence?.status || 'offline';

        // El mensaje puede ser HTML si es una ubicación
        const messageContent = msg.isLocation ? msg.mensaje : this.escapeHtml(msg.mensaje);

        if (esPropio) {
            msgDiv.innerHTML = `
                <div class="bubble propio">${messageContent}</div>
                <div class="avatar-container" data-uid="${dataUidAttr}">
                    <img src="${avatar}" class="avatar">
                    <span class="status ${status}"></span>
                </div>`;
        } else {
            msgDiv.innerHTML = `
                <div class="avatar-container" data-uid="${dataUidAttr}">
                    <img src="${avatar}" class="avatar">
                    <span class="status ${status}"></span>
                </div>
                <div class="bubble"><b>${msg.usuario || 'Usuario'}:</b> ${messageContent}</div>`;
        }

        this.chatBox.appendChild(msgDiv);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    // Método auxiliar para escapar HTML y prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }


    setupPresence() {
        // Escuchar el estado de conexión
        onValue(this.connectedRef, (snap) => {
            if (snap.val() === true) {
                // Configurar la desconexión primero
                onDisconnect(this.presRef).set({
                    status: "offline",
                    lastSeen: Date.now(),
                    nombre: this.usuarioActual.nombre
                });

                // Marcar como online
                this.updatePresence("online");
            }
        });

        // Escuchar cambios en presences
        const allPresRef = ref(this.db, "presences");
        onValue(allPresRef, (snap) => {
            this.presences = snap.val() || {};
            this.updateAllPresenceStates();
        });
    }
    updateAllPresenceStates() {
        document.querySelectorAll('.avatar-container').forEach(container => {
            const uid = container.getAttribute('data-uid');
            const statusEl = container.querySelector('.status');
            if (uid && statusEl) {
                const presence = this.presences[uid];
                const status = presence?.status || 'offline';
                statusEl.className = `status ${status}`;
            }
        });
    }


    updatePresence(status) {
        return set(this.presRef, {
            status,
            lastSeen: Date.now(),
            nombre: this.usuarioActual.nombre
        }).catch(error => {
            console.warn("Error updating presence:", error);
        });
    }

    handleBeforeUnload() {
        // Intentar actualizar el estado antes de cerrar
        navigator.sendBeacon &&
            this.updatePresence("offline");
    }

    enviarMensaje() {
        const texto = this.chatInput.value.trim();
        if (texto === "") return;

        push(this.mensajesRef, {
            uid: this.usuarioActual.uid,
            usuario: this.usuarioActual.nombre,
            mensaje: texto,
            avatar: this.usuarioActual.foto,
            timestamp: Date.now()
        });

        this.chatInput.value = "";
    }

    listenToMessages() {
        onChildAdded(this.mensajesRef, (snapshot) => {
            const msg = snapshot.val();
            if (!msg) return;

            const msgUid = msg.uid || msg.userId || msg.usuarioId || null;
            const currentUid = this.usuarioActual.uid;
            const esPropio = String(msgUid) === String(currentUid);

            this.renderMessage(msg, esPropio, msgUid);
        });
    }

    renderMessage(msg, esPropio, msgUid) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", esPropio ? "right" : "left");

        const dataUidAttr = msgUid || msg.usuario || '';
        const avatar = msg.avatar || 'src/img/default-avatar.png';
        const presence = this.presences[dataUidAttr];
        const status = presence?.status || 'offline';

        if (esPropio) {
            msgDiv.innerHTML = `
                <div class="bubble propio">${msg.mensaje}</div>
                <div class="avatar-container" data-uid="${dataUidAttr}">
                    <img src="${avatar}" class="avatar">
                    <span class="status ${status}"></span>
                </div>`;
        } else {
            msgDiv.innerHTML = `
                <div class="avatar-container" data-uid="${dataUidAttr}">
                    <img src="${avatar}" class="avatar">
                    <span class="status ${status}"></span>
                </div>
                <div class="bubble"><b>${msg.usuario || 'Usuario'}:</b> ${msg.mensaje}</div>`;
        }

        this.chatBox.appendChild(msgDiv);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }
}

// Iniciar la aplicación
const chat = new Chat();