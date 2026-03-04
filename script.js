// ============================================
// SISTEMA DE CAMBIO DE MODOS (tu código original)
// ============================================
const body = document.body;
const lightBtn = document.getElementById("light-btn");
const darkDayBtn = document.getElementById("dark-day-btn");
const darkNightBtn = document.getElementById("dark-night-btn");

// Función para cambiar modo
function setMode(mode) {
    // Remueve todas las clases de modo
    body.classList.remove("light", "dark-day", "dark-night");
    // Añade la nueva clase
    body.classList.add(mode);
    console.log("Modo activado:", mode);
    
    // Después de cambiar el modo, verificamos el scaling
    // porque las nuevas imágenes pueden tener diferentes dimensiones
    setTimeout(checkContainerScaling, 100);
}

// Event listeners
lightBtn.addEventListener("click", () => {
    setMode("light");
});

darkDayBtn.addEventListener("click", () => {
    setMode("dark-day");
});

darkNightBtn.addEventListener("click", () => {
    setMode("dark-night");
});



// ============================================
// SISTEMA DE SCALING 
// SISTEMA DE SCALING 
// SISTEMA DE SCALING 
// SISTEMA DE SCALING 
// SISTEMA DE SCALING 
// SISTEMA DE SCALING 

// ============================================

// Variable para el intervalo de verificación
let scalingInterval = null;

// Función principal que verifica y aplica el scaling
function checkContainerScaling() {
    const container = document.getElementById('space');
    const wrapper = document.getElementById('layout');
    
    if (!container || !wrapper) return;
    
    // Medir alturas
    const containerHeight = container.scrollHeight;
    const viewportHeight = window.innerHeight;
    
    // Verificar si el contenedor es más alto que el viewport
    const isOverflowing = containerHeight > viewportHeight;
    
    console.log(`Container: ${containerHeight}px, Viewport: ${viewportHeight}px, Overflow: ${isOverflowing}`);
    
    if (isOverflowing) {
        // Calcular factor de escala para que entre en el viewport
        // Dejamos un pequeño margen de seguridad (0.98) para evitar scroll
        const scaleFactor = (viewportHeight / containerHeight) * 0.98;
        
        // Aplicar transform scale para limitar el tamaño
        container.style.transform = `scale(${scaleFactor})`;
        container.classList.add('scaled');
        
        console.log(`Scaling container to: ${scaleFactor}`);
    } else {
        // Restaurar escala normal si no hay overflow
        container.style.transform = 'none';
        container.classList.remove('scaled');
    }
}

// Función para inicializar el sistema de scaling
function initScaling() {
    const container = document.getElementById('space');
    
    if (!container) {
        console.warn('No se encontró el elemento #space');
        return;
    }
    
    console.log('Inicializando sistema de scaling...');
    
    // Suavizar las transiciones
    container.style.transition = 'transform 0.1s ease';
    
    // Verificación inicial (varias veces para asegurar)
    setTimeout(checkContainerScaling, 100);
    setTimeout(checkContainerScaling, 300);
    setTimeout(checkContainerScaling, 500);
    setTimeout(checkContainerScaling, 1000); // Cuando todo debería estar cargado
    
    // Verificar en resize con debounce para evitar saltos
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(checkContainerScaling, 50);
    });
    
    // Verificar en cambio de orientación (móviles)
    window.addEventListener('orientationchange', function() {
        setTimeout(checkContainerScaling, 100);
    });
    
    // Verificación periódica por si cambia el contenido (cada 2 segundos)
    if (scalingInterval) {
        clearInterval(scalingInterval);
    }
    scalingInterval = setInterval(checkContainerScaling, 2000);
    
    console.log('Sistema de scaling inicializado correctamente');
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado, inicializando sistemas...');
    initScaling();
});

// También cuando la página termine de cargar (imágenes, etc)
window.addEventListener('load', function() {
    console.log('✅ Página completamente cargada, verificando scaling...');
    checkContainerScaling();
});

// Mensaje de confirmación original
console.log("✅ Perfil cargado. Modos disponibles: light, dark-day, dark-night");
