document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.querySelector('form');
    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');

    function validarFormulario(e) {
        e.preventDefault();

        const usuario = usuarioInput.value.trim();
        const password = passwordInput.value.trim();

        if (usuario === '') {
            mostrarError('Por favor ingresa tu usuario');
            usuarioInput.focus();
            return false;
        }

        if (password === '') {
            mostrarError('Por favor ingresa tu contraseña');
            passwordInput.focus();
            return false;
        }

        if (password.length < 6) {
            mostrarError('La contraseña debe tener al menos 6 caracteres');
            passwordInput.focus();
            return false;
        }

        iniciarSesion(usuario, password);
    }

    function iniciarSesion(usuario, password) {
        
        const usuariosValidos = {
            'admin': '123456',
            'usuario1': 'password123',
            'test': 'test123'
        };

        if (usuariosValidos[usuario] && usuariosValidos[usuario] === password) {
            mostrarExito('¡Login exitoso! Redirigiendo...');
            
            localStorage.setItem('usuarioLogueado', usuario);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            mostrarError('Usuario o contraseña incorrectos');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    function mostrarError(mensaje) {
        const mensajeAnterior = document.querySelector('.mensaje-error');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'mensaje-error';
        mensajeDiv.textContent = mensaje;
        
        form.parentNode.insertBefore(mensajeDiv, form);

        setTimeout(() => {
            mensajeDiv.remove();
        }, 3000);
    }

    function mostrarExito(mensaje) {
        const mensajeAnterior = document.querySelector('.mensaje-exito');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'mensaje-exito';
        mensajeDiv.textContent = mensaje;
        
        form.parentNode.insertBefore(mensajeDiv, form);
    }

    form.addEventListener('submit', validarFormulario);

    usuarioInput.addEventListener('input', function() {
        this.value = this.value.replace(/\s/g, '');
    });

    passwordInput.addEventListener('dblclick', function() {
        if (this.type === 'password') {
            this.type = 'text';
            setTimeout(() => {
                this.type = 'password';
            }, 1000);
        }
    });

    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    if (usuarioLogueado) {
        window.location.href = 'index.html';
    }
});

function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('loginTime');
    window.location.href = 'login.html';
}

function verificarSesion() {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    if (!usuarioLogueado) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}