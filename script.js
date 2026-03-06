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
// VARIABLES GLOBALES PARA EL MARQUEE
// ============================================
let marqueeAnimation = null;
let marqueePosition = 0;

// ============================================
// CREAR TEXTO ANIMADO EN LATERAL
// ============================================
function createMarqueeText() {
    const lateral = document.getElementById('lateral');
    if (!lateral) {
        console.warn('No se encontró el elemento #lateral');
        return;
    }
    
    console.log('Creando marquee en lateral');
    
    // Verificar si ya existe el contenedor
    if (document.querySelector('.marquee-vertical-container')) {
        console.log('El marquee ya existe');
        return;
    }
    
    const marqueeText = "© All illustrations are the intellectual property of Neon Genesis Evangelion, created by Hideaki Anno. | Coded & designed by Myt";
    
    // Crear contenedor
    const container = document.createElement('div');
    container.className = 'marquee-vertical-container';
    
    // Crear contenido
    const content = document.createElement('div');
    content.className = 'marquee-vertical-content';
    
    // Generar 10 repeticiones del texto con ESPACIOS usando SPANS
    let htmlContent = '';
    const spaces = ' '; // Los espacios ya no son necesarios aquí porque usaremos padding en CSS
    for (let i = 0; i < 10; i++) {
        // Cada repetición va dentro de un SPAN
        htmlContent += `<span>${marqueeText}</span>`;
    }
    content.innerHTML = htmlContent; // CAMBIADO: innerHTML en lugar de textContent
    
    container.appendChild(content);
    lateral.appendChild(container);
    
    console.log('Marquee creado correctamente con 10 repeticiones usando spans');
    
    // Iniciar animación manual
    startMarqueeAnimation();
}

// ============================================
// INICIAR ANIMACIÓN DEL MARQUEE
// ============================================
function startMarqueeAnimation() {
    // Detener animación anterior si existe
    if (marqueeAnimation) {
        cancelAnimationFrame(marqueeAnimation);
    }
    
    const content = document.querySelector('.marquee-vertical-content');
    if (!content) return;
    
    // Velocidad basada en tiempo real
    let lastTime = 0;
    const pixelsPerSecond = 60; 
    
    function animate(currentTime) {
        if (!lastTime) {
            lastTime = currentTime;
            marqueeAnimation = requestAnimationFrame(animate);
            return;
        }
        
        // Calcular el tiempo transcurrido en segundos
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        // Mover basado en el tiempo real
        marqueePosition -= pixelsPerSecond * deltaTime;
        
        // Cuando hemos movido la mitad del contenido, resetear posición
        if (marqueePosition <= -content.scrollWidth / 2) {
            marqueePosition = 0;
        }
        
        content.style.transform = `translateX(${marqueePosition}px)`;
        
        // Continuar la animación
        marqueeAnimation = requestAnimationFrame(animate);
    }
    
    // Iniciar animación
    marqueeAnimation = requestAnimationFrame(animate);
}

// ============================================
// DETENER ANIMACIÓN DEL MARQUEE
// ============================================
function stopMarqueeAnimation() {
    if (marqueeAnimation) {
        cancelAnimationFrame(marqueeAnimation);
        marqueeAnimation = null;
    }
}

// ============================================
// REINICIAR ANIMACIÓN DEL MARQUEE
// ============================================
function restartMarqueeAnimation() {
    stopMarqueeAnimation();
    marqueePosition = 0;
    
    const content = document.querySelector('.marquee-vertical-content');
    if (content) {
        content.style.transform = 'translateX(0)';
    }
    
    startMarqueeAnimation();
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Asegurar que no haya scroll
document.documentElement.style.overflow = 'hidden';
document.body.style.overflow = 'hidden';

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado, inicializando...');
    
    // Crear marquee
    createMarqueeText();
    
    initScaling();
});

window.addEventListener('load', function() {
    console.log('✅ Página completamente cargada');
    checkContainerScaling();
    
    // Reiniciar marquee después de carga completa (por si acaso)
    setTimeout(() => {
        restartMarqueeAnimation();
    }, 500);
});

// Pausar animación cuando la pestaña no está visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopMarqueeAnimation();
    } else {
        startMarqueeAnimation();
    }
});

console.log("✅ Perfil cargado. Modos disponibles: light, dark-day, dark-night");




















// ============================================
// ANIMACIÓN LOTTIE PARA EL ICONO DEL SOL
// ============================================
let sunAnimation = null;

// Función para actualizar color del sol
function updateSunColor() {
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) return;
    
    // Buscar el SVG dentro del contenedor
    const svg = sunContainer.querySelector('svg');
    if (!svg) return;
    
    // Determinar color según el modo actual
    let color = '#ffffff'; // Por defecto blanco
    
    if (body.classList.contains('dark-night')) {
        color = '#7c643a'; // Mytmode: marrón claro
    }
    
    // Aplicar color a todos los elementos del SVG
    const elements = svg.querySelectorAll('path, circle, rect, polygon, line');
    elements.forEach(el => {
        if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none') {
            el.setAttribute('fill', color);
        }
        if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
            el.setAttribute('stroke', color);
        }
    });
}

// Función para inicializar el sol
function initSunIcon() {
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) {
        console.warn('No se encontró el contenedor del sol');
        return;
    }

    // Verificar si ya existe una animación
    if (sunAnimation) {
        sunAnimation.destroy();
    }

    // Cargar la animación Lottie
    sunAnimation = lottie.loadAnimation({
        container: sunContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'icons8-sun.json' // Cambia esta ruta si es necesario
    });

    // Cuando la animación esté lista, aplicar el color inicial
    sunAnimation.addEventListener('DOMLoaded', function() {
        updateSunColor();
    });
}

// Sobrescribir la función setMode para incluir updateSunColor
const originalSetMode = setMode;
setMode = function(mode) {
    // Remueve todas las clases de modo
    body.classList.remove("light", "dark-day", "dark-night");
    // Añade la nueva clase
    body.classList.add(mode);
    console.log("Modo activado:", mode);
    
    // Actualizar color del sol
    setTimeout(() => {
        updateSunColor();
    }, 50);
    
    // Pequeño retraso para que las imágenes nuevas se carguen
    setTimeout(checkContainerScaling, 150);
};

// Añadir inicialización al DOMContentLoaded existente
const originalDOMContentLoaded = document.addEventListener('DOMContentLoaded', function() {
    // Este código se ejecutará además del existente
    setTimeout(initSunIcon, 100);
}, false);

// También inicializar cuando la página termine de cargar
window.addEventListener('load', function() {
    setTimeout(initSunIcon, 200);
});
