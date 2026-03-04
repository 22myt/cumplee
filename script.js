document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const lightModeBtn = document.getElementById('mode-light');
    const darkMode1Btn = document.getElementById('mode-dark1');
    const darkMode2Btn = document.getElementById('mode-dark2');

    // Función para cambiar el modo
    function setMode(mode) {
        // Remueve todas las clases de modo existentes
        body.classList.remove('light-mode', 'dark-mode-1', 'dark-mode-2');
        // Añade la nueva clase
        body.classList.add(mode);

        // Aquí es donde, en el futuro, cambiarías las rutas de las imágenes de los botones
        // para que coincidan con el modo activo (opcional).
        // Por ahora, mantenemos las mismas imágenes para los botones en todos los modos.
        console.log('Modo cambiado a:', mode);
    }

    // Event Listeners para los botones
    lightModeBtn.addEventListener('click', function() {
        setMode('light-mode');
    });

    darkMode1Btn.addEventListener('click', function() {
        setMode('dark-mode-1');
    });

    darkMode2Btn.addEventListener('click', function() {
        setMode('dark-mode-2');
    });

    // Establecer modo inicial (asegurar que la clase del body es 'dark-mode-1')
    // Esto ya lo tienes en el HTML, pero por si acaso:
    // setMode('dark-mode-1');
});
