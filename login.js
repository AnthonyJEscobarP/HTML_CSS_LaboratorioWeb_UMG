document.addEventListener('DOMContentLoaded', function() {
    var formularioLogin = document.getElementById('formularioLogin');
    var inputNombre = document.getElementById('inputNombre');
    var mensajeError = document.getElementById('mensajeError');

    // Si ya hay una sesion activa, redirigir automaticamente al portafolio
    if (localStorage.getItem('nombreUsuario')) {
        window.location.href = 'index.html';
    }

    formularioLogin.addEventListener('submit', function(evento) {
        evento.preventDefault();
        
        var usuarioRegistrado = localStorage.getItem('usuarioRegistrado');
        
        // Verificar credenciales
        if (usuarioRegistrado && inputNombre.value === usuarioRegistrado) {
            // Credenciales correctas: Iniciar sesion (guardar nombre de sesion)
            localStorage.setItem('nombreUsuario', inputNombre.value);
            window.location.href = 'index.html';
        } else {
            // Credenciales incorrectas
            mensajeError.style.display = 'block';
        }
    });
});
