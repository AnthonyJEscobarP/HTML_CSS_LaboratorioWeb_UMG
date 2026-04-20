var formularioContacto = document.getElementById('formularioContacto');
var campoNombre = document.getElementById('campoNombre');
var campoCorreo = document.getElementById('campoCorreo');
var campoMensaje = document.getElementById('campoMensaje');
var confirmarEnvio = document.getElementById('confirmarEnvio');
var panelBienvenida = document.getElementById('panelBienvenida');
var textoBienvenida = document.getElementById('textoBienvenida');
var cerrarBienvenida = document.getElementById('cerrarBienvenida');
var botonBorrarDatos = document.getElementById('botonBorrarDatos');
var botonCerrarSesionCabecera = document.getElementById('botonCerrarSesionCabecera');

window.onload = function () {
    var usuarioGuardado = localStorage.getItem('nombreUsuario');
    
    if (!usuarioGuardado) {
        window.location.href = 'login.html';
        return;
    }
    
    textoBienvenida.textContent = 'Hola de nuevo, ' + usuarioGuardado;
    panelBienvenida.classList.remove('oculto');

    var correoGuardado = localStorage.getItem('correoUsuario');
    var mensajeGuardado = localStorage.getItem('mensajeUsuario');

    campoNombre.value = usuarioGuardado;
    
    if (correoGuardado) {
        campoCorreo.value = correoGuardado;
    }
    if (mensajeGuardado) {
        campoMensaje.value = mensajeGuardado;
    }
};

cerrarBienvenida.addEventListener('click', function () {
    panelBienvenida.classList.add('oculto');
});

formularioContacto.addEventListener('submit', function (evento) {
    evento.preventDefault();

    localStorage.setItem('nombreUsuario', campoNombre.value);
    localStorage.setItem('correoUsuario', campoCorreo.value);
    localStorage.setItem('mensajeUsuario', campoMensaje.value);

    confirmarEnvio.classList.remove('oculto');

    setTimeout(function () {
        confirmarEnvio.classList.add('oculto');
    }, 4000);
});

function cerrarSesion(evento) {
    if (evento) evento.preventDefault();
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('correoUsuario');
    localStorage.removeItem('mensajeUsuario');

    campoNombre.value = '';
    campoCorreo.value = '';
    campoMensaje.value = '';

    window.location.href = 'login.html';
}

botonBorrarDatos.addEventListener('click', cerrarSesion);
botonCerrarSesionCabecera.addEventListener('click', cerrarSesion);

campoNombre.addEventListener('input', function () {
    localStorage.setItem('nombreUsuario', campoNombre.value);
});

campoCorreo.addEventListener('input', function () {
    localStorage.setItem('correoUsuario', campoCorreo.value);
});

campoMensaje.addEventListener('input', function () {
    localStorage.setItem('mensajeUsuario', campoMensaje.value);
});
