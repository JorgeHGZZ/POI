document.addEventListener('DOMContentLoaded', function() {
    cargarDatosPerfil();
    configurarEventos();
});

function cargarDatosPerfil() {
    const datosEjemplo = {
        nombreUsuario: 'Usuario123',
        correo: 'usuario@ejemplo.com',
        fechaRegistro: '15/01/2024',
        equipoFavorito: 'Real Madrid',
        seleccion: 'México',
        puntos: '1,250',
        nivel: 'Nivel 5 - Experto',
        grupos: '8 grupos'
    };

    document.getElementById('nombre-usuario').value = datosEjemplo.nombreUsuario;
    document.getElementById('correo').value = datosEjemplo.correo;
    document.getElementById('fecha-registro').value = datosEjemplo.fechaRegistro;
    document.getElementById('equipo-favorito').value = datosEjemplo.equipoFavorito;
    document.getElementById('seleccion').value = datosEjemplo.seleccion;
    document.getElementById('puntos').value = datosEjemplo.puntos;
    document.getElementById('nivel').value = datosEjemplo.nivel;
    document.getElementById('grupos').value = datosEjemplo.grupos;
}

function configurarEventos() {
    const btnEditar = document.getElementById('btn-editar');
    const btnGuardar = document.getElementById('btn-guardar');
    const uploadFoto = document.getElementById('upload-foto');

    btnEditar.addEventListener('click', function() {
        habilitarCampos();
        this.style.display = 'none';
        btnGuardar.style.display = 'inline-block';
    });

    btnGuardar.addEventListener('click', function() {
        if (validarFormulario()) {
            guardarCambios();
            deshabilitarCampos();
            this.style.display = 'none';
            btnEditar.style.display = 'inline-block';
        }
    });

    uploadFoto.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const avatarDiv = document.querySelector('.imagen-avatar');
                avatarDiv.innerHTML = `<img src="${event.target.result}" alt="Foto de perfil">`;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
}

function habilitarCampos() {
    const camposEditables = ['nombre-usuario', 'correo', 'equipo-favorito', 'seleccion', 'contrasena'];
    
    camposEditables.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.removeAttribute('disabled');
        }
    });
}

function deshabilitarCampos() {
    const camposEditables = ['nombre-usuario', 'correo', 'equipo-favorito', 'seleccion', 'contrasena'];
    
    camposEditables.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.setAttribute('disabled', 'true');
        }
    });
}

function guardarCambios() {
    const datosActualizados = {
        nombreUsuario: document.getElementById('nombre-usuario').value,
        correo: document.getElementById('correo').value,
        equipoFavorito: document.getElementById('equipo-favorito').value,
        seleccion: document.getElementById('seleccion').value,
        contrasena: document.getElementById('contrasena').value
    };

    console.log('Datos actualizados:', datosActualizados);

    mostrarMensaje('¡Perfil actualizado correctamente!', 'success');
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje-notificacion ${tipo}`;
    mensaje.textContent = texto;
    mensaje.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background-color: ${tipo === 'success' ? '#3cac3b' : '#F44336'};
        color: #f0f0f0;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-weight: bold;
        animation: slideIn 0.3s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(mensaje);

    setTimeout(() => {
        mensaje.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => mensaje.remove(), 300);
    }, 3000);
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarFormulario() {
    const correo = document.getElementById('correo').value;
    const nombreUsuario = document.getElementById('nombre-usuario').value;

    if (!nombreUsuario.trim()) {
        mostrarMensaje('El nombre de usuario no puede estar vacío', 'error');
        return false;
    }

    if (!validarEmail(correo)) {
        mostrarMensaje('Por favor ingresa un correo electrónico válido', 'error');
        return false;
    }

    return true;
}