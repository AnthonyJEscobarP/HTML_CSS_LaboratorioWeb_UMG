document.addEventListener('DOMContentLoaded', function() {
    var formularioRegistro = document.getElementById('formularioRegistro');
    var registroNombre = document.getElementById('registroNombre');

    // Si ya hay una sesion activa, redirigir al portafolio
    if (localStorage.getItem('nombreUsuario')) {
        window.location.href = 'index.html';
    }

    formularioRegistro.addEventListener('submit', function(evento) {
        evento.preventDefault();
        
        // Guardar las credenciales creadas en LocalStorage
        localStorage.setItem('usuarioRegistrado', registroNombre.value);
        
        // Iniciar sesion automaticamente despues de registrarse
        localStorage.setItem('nombreUsuario', registroNombre.value);
        
        // Redirigir a la pagina principal
        window.location.href = 'index.html';
    });
});
