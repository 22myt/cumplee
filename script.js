// ============================================
// SISTEMA DE CAMBIO DE MODOS
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
    
    // Pequeño retraso para que las imágenes nuevas se carguen
    setTimeout(checkContainerScaling, 150);
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
// SISTEMA DE SCALING (adaptado de la referencia)
// ============================================

let scalingInterval = null;

function checkContainerScaling() {
    const contentWrapper = document.getElementById('content-wrapper');
    const mainContainer = document.getElementById('main-container');
    
    if (!contentWrapper || !mainContainer) return;
    
    // Medir alturas considerando el padding del mainContainer
    const wrapperHeight = contentWrapper.scrollHeight;
    const availableHeight = window.innerHeight - 40; // Restamos 40px (20px arriba + 20px abajo)
    
    // Verificar si el wrapper es más alto que el espacio disponible
    const isOverflowing = wrapperHeight > availableHeight;
    
    console.log(`Wrapper: ${wrapperHeight}px, Disponible: ${availableHeight}px, Overflow: ${isOverflowing}`);
    
    if (isOverflowing) {
        // Calcular factor de escala basado en el espacio disponible
        const scaleFactor = availableHeight / wrapperHeight;
        
        // Aplicar transform scale
        contentWrapper.style.transform = `scale(${scaleFactor})`;
        
        console.log(`Scaling wrapper to: ${scaleFactor}`);
    } else {
        // Restaurar escala normal
        contentWrapper.style.transform = 'none';
    }
}

function initScaling() {
    const contentWrapper = document.getElementById('content-wrapper');
    
    if (!contentWrapper) {
        console.warn('No se encontró #content-wrapper');
        return;
    }
    
    console.log('Inicializando sistema de scaling...');
    
    // Verificaciones múltiples como en la referencia
    setTimeout(checkContainerScaling, 100);
    setTimeout(checkContainerScaling, 300);
    setTimeout(checkContainerScaling, 500);
    setTimeout(checkContainerScaling, 1000);
    
    // Evento resize con debounce
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(checkContainerScaling, 50);
    });
    
    // Evento orientationchange
    window.addEventListener('orientationchange', function() {
        setTimeout(checkContainerScaling, 100);
    });
    
    // Verificación periódica
    if (scalingInterval) {
        clearInterval(scalingInterval);
    }
    scalingInterval = setInterval(checkContainerScaling, 500);
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Asegurar que no haya scroll
document.documentElement.style.overflow = 'hidden';
document.body.style.overflow = 'hidden';

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado, inicializando...');
    initScaling();
});

window.addEventListener('load', function() {
    console.log('✅ Página completamente cargada');
    checkContainerScaling();
});

console.log("✅ Perfil cargado. Modos disponibles: light, dark-day, dark-night");
