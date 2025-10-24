document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.querySelector('form');
    const usuarioInput = document.getElementById('fname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm');
    const uploadBtn = document.querySelector('.upload-btn');
    const profilePic = document.querySelector('.profile-pic');

    function validarFormulario(e) {
        e.preventDefault();

        const usuario = usuarioInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirm = confirmInput.value.trim();

        if (usuario === '') {
            mostrarError('Por favor ingresa un nombre de usuario');
            usuarioInput.focus();
            return false;
        }

        if (usuario.length < 3) {
            mostrarError('El usuario debe tener al menos 3 caracteres');
            usuarioInput.focus();
            return false;
        }

        if (email === '') {
            mostrarError('Por favor ingresa tu correo electrónico');
            emailInput.focus();
            return false;
        }

        if (!validarEmail(email)) {
            mostrarError('Por favor ingresa un correo válido');
            emailInput.focus();
            return false;
        }

        if (password === '') {
            mostrarError('Por favor ingresa una contraseña');
            passwordInput.focus();
            return false;
        }

        if (password.length < 6) {
            mostrarError('La contraseña debe tener al menos 6 caracteres');
            passwordInput.focus();
            return false;
        }

        if (confirm === '') {
            mostrarError('Por favor confirma tu contraseña');
            confirmInput.focus();
            return false;
        }

        if (password !== confirm) {
            mostrarError('Las contraseñas no coinciden');
            confirmInput.focus();
            return false;
        }

        registrarUsuario(usuario, email, password);
    }

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function registrarUsuario(usuario, email, password) {
        
        const usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios') || '{}');

        if (usuariosRegistrados[usuario]) {
            mostrarError('Este usuario ya existe');
            usuarioInput.focus();
            return;
        }

        const imagenPerfil = localStorage.getItem('imagenPerfil') || '';

        usuariosRegistrados[usuario] = {
            email: email,
            password: password,
            imagen: imagenPerfil,
            fechaRegistro: new Date().toISOString()
        };

        localStorage.setItem('usuarios', JSON.stringify(usuariosRegistrados));

        mostrarExito('¡Registro exitoso! Redirigiendo al login...');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }

    function mostrarError(mensaje) {
        const mensajeAnterior = document.querySelector('.mensaje-error');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'mensaje-error';
        mensajeDiv.textContent = mensaje;
        
        const container = document.querySelector('.container');
        container.insertBefore(mensajeDiv, container.firstChild);

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
        
        const container = document.querySelector('.container');
        container.insertBefore(mensajeDiv, container.firstChild);
    }

    form.addEventListener('submit', validarFormulario);

    usuarioInput.addEventListener('input', function() {
        this.value = this.value.replace(/\s/g, '');
    });

    uploadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    mostrarError('La imagen debe ser menor a 2MB');
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const imagenBase64 = event.target.result;
                    
                    profilePic.style.backgroundImage = `url(${imagenBase64})`;
                    profilePic.style.backgroundSize = 'cover';
                    profilePic.style.backgroundPosition = 'center';
                    
                    localStorage.setItem('imagenPerfil', imagenBase64);
                    
                    mostrarExito('Imagen cargada correctamente');
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        input.click();
    });

    const imagenGuardada = localStorage.getItem('imagenPerfil');
    if (imagenGuardada) {
        profilePic.style.backgroundImage = `url(${imagenGuardada})`;
        profilePic.style.backgroundSize = 'cover';
        profilePic.style.backgroundPosition = 'center';
    }

    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    if (usuarioLogueado) {
        window.location.href = 'index.html';
    }
});