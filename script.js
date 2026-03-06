// ============================================
// SISTEMA DE CAMBIO DE MODOS
// ============================================
const body = document.body;
const lightBtn = document.getElementById("light-btn");
const darkDayBtn = document.getElementById("dark-day-btn");
const darkNightBtn = document.getElementById("dark-night-btn");

let sunAnimation = null;

// Función para cambiar modo
function setMode(mode) {
    // Remueve todas las clases de modo
    body.classList.remove("light", "dark-day", "dark-night");
    // Añade la nueva clase
    body.classList.add(mode);
    console.log("Modo activado:", mode);

    updateSunIconColor(mode);
    
    // Pequeño retraso para que las imágenes nuevas se carguen
    setTimeout(checkContainerScaling, 150);
}

// === NUEVO: Función para actualizar el color del sun icon ===
// AGREGAR DESPUÉS de la función setMode (antes de los event listeners)
function updateSunIconColor(mode) {
    if (!sunAnimation) return;
    
    let color;
    switch(mode) {
        case 'light':
            color = '#27196f'; // Azul oscuro para light
            break;
        case 'dark-night':
            color = '#7c643a'; // Marrón claro para mytmode
            break;
        case 'dark-day':
        default:
            color = '#ffffff'; // Blanco para dark-day
            break;
    }
    
    // Actualizar color de todos los shapes en la animación
    if (sunAnimation.renderer && sunAnimation.renderer.elements) {
        // Para Lottie web player
        sunAnimation.renderer.elements.forEach(element => {
            if (element.type === 'gr' || element.type === 'sh') {
                // Cambiar color de rellenos y trazos
                if (element.shapes) {
                    element.shapes.forEach(shape => {
                        if (shape.ty === 'st' || shape.ty === 'fl') {
                            if (shape.ks && shape.ks.c && shape.ks.c.k) {
                                // Convertir color hex a RGB array
                                const r = parseInt(color.slice(1,3), 16) / 255;
                                const g = parseInt(color.slice(3,5), 16) / 255;
                                const b = parseInt(color.slice(5,7), 16) / 255;
                                shape.ks.c.k = [r, g, b, 1];
                            }
                        }
                    });
                }
            }
        });
        sunAnimation.renderer.renderFrame(sunAnimation.currentFrame);
    }
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


// === NUEVO: INICIALIZAR LOTTE (SUN ICON) ===
// AGREGAR DESPUÉS de los event listeners (antes del sistema de scaling)
function initLottie() {
    // Verificar si lottie está disponible (debes incluir la librería en tu HTML)
    if (typeof lottie === 'undefined') {
        console.warn('Lottie no está cargado. El icono de sol no funcionará.');
        return;
    }
    
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) return;
    
    sunAnimation = lottie.loadAnimation({
        container: sunContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'icons8-sun.json' // Ruta al archivo JSON
    });
    
    sunAnimation.addEventListener('DOMLoaded', () => {
        // Aplicar color inicial según el modo actual
        const currentMode = body.classList.contains('light') ? 'light' : 
                           (body.classList.contains('dark-night') ? 'dark-night' : 'dark-day');
        updateSunIconColor(currentMode);
    });
}

// === NUEVO: CREAR TEXTO ANIMADO EN LATERAL ===
// AGREGAR DESPUÉS de initLottie
function createMarqueeText() {
    const lateral = document.getElementById('lateral');
    if (!lateral) return;
    
    // Verificar si ya existe el contenedor
    if (document.querySelector('.marquee-vertical-container')) return;
    
    const marqueeText = "© All illustrations are the intellectual property of Neon Genesis Evangelion, created by Hideaki Anno. | Coded & designed by Myt";
    
    // Crear contenedor
    const container = document.createElement('div');
    container.className = 'marquee-vertical-container';
    
    // Crear contenido con duplicado para efecto continuo
    const content = document.createElement('div');
    content.className = 'marquee-vertical-content';
    
    // Repetir el texto varias veces para asegurar continuidad
    content.innerHTML = `
        <span>${marqueeText}</span>
        <span>${marqueeText}</span>
        <span>${marqueeText}</span>
    `;
    
    container.appendChild(content);
    lateral.appendChild(container);
}


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
    
    // === MODIFICADO: AGREGAR ESTAS DOS LÍNEAS AQUÍ ===
    // Crear texto animado en lateral
    createMarqueeText();
    
    // Inicializar Lottie para el icono de sol
    setTimeout(() => {
        initLottie();
    }, 100); // Pequeño retraso para asegurar que el DOM esté listo
    
    initScaling();
});

window.addEventListener('load', function() {
    console.log('✅ Página completamente cargada');
    checkContainerScaling();
    
    // === NUEVO: Re-aplicar color al sun icon después de carga completa ===
    // AGREGAR DESPUÉS de checkContainerScaling()
    if (sunAnimation) {
        const currentMode = body.classList.contains('light') ? 'light' : 
                           (body.classList.contains('dark-night') ? 'dark-night' : 'dark-day');
        updateSunIconColor(currentMode);
    }
});

console.log("✅ Perfil cargado. Modos disponibles: light, dark-day, dark-night");
