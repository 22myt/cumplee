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
























// ============================================
// SISTEMA DE SONIDOS HOVER - ANTI-SPAM INTELIGENTE
// ============================================

// Configuración de sonidos
const hoverSounds = {
    'bubble': new Audio('sounds/bubble_sound.mp3'),
    'alien': new Audio('sounds/hoveralien.mp3'),
    'tiny': new Audio('sounds/tiny.mp3'),
    'click': new Audio('sounds/sounds_click7.wav')
};

// Estado del sistema de sonidos
const soundSystem = {
    lastSoundKey: null,        // Último sonido reproducido
    lastElementId: null,       // ID único del último elemento (para detectar cambios)
    lastPlayTime: 0,            // Timestamp del último sonido
    spamThreshold: 150          // 150ms para ignorar eventos duplicados en MISMO elemento
};

// Función para generar ID único de elemento (por si no tiene id)
function getElementId(element) {
    return element.id || 
           element.className || 
           element.tagName + '_' + Math.random().toString(36).substr(2, 9);
}

// Función para reproducir sonido con anti-spam
function playHoverSound(soundKey, element) {
    // Si no hay sonido, salir
    if (!soundKey) return;
    
    const now = Date.now();
    const elementId = getElementId(element);
    
    // DETECTAR SPAM EN EL MISMO ELEMENTO
    // Si es el MISMO elemento y el MISMO sonido en menos de 150ms, IGNORAR
    if (soundKey === soundSystem.lastSoundKey && 
        elementId === soundSystem.lastElementId && 
        now - soundSystem.lastPlayTime < soundSystem.spamThreshold) {
        console.log('🚫 Spam detectado en mismo elemento, ignorando');
        return;
    }
    
    // Si es elemento DIFERENTE, reproducir sin restricción (no hay lag)
    // Si pasó suficiente tiempo, reproducir sin restricción
    
    // Intentar reproducir
    const sound = hoverSounds[soundKey];
    if (!sound) return;
    
    // Clonar el audio
    const soundClone = sound.cloneNode();
    soundClone.volume = 0.3;
    
    // Guardar estado para anti-spam
    soundSystem.lastSoundKey = soundKey;
    soundSystem.lastElementId = elementId;
    soundSystem.lastPlayTime = now;
    
    // Reproducir (permitimos superposición natural del navegador)
    soundClone.play().catch(e => {
        console.log('Error al reproducir sonido:', e);
    });
    
    console.log(`🔊 Reproduciendo: ${soundKey} en elemento`, element);
}

// Función para asignar sonidos a elementos
function assignHoverSounds() {
    console.log('🎵 Asignando sonidos hover (anti-spam inteligente)...');

    // 1. Sonido "bubble" para bot-link-gif
    document.querySelectorAll('.bot-link-gif-link').forEach(el => {
        el.addEventListener('mouseenter', () => playHoverSound('bubble', el));
    });

    // 2. Sonido "alien" para profile-icon
    document.querySelectorAll('.profile-icon-container').forEach(el => {
        el.addEventListener('mouseenter', () => playHoverSound('alien', el));
    });

    // 3. Sonido "tiny" para múltiples elementos
    const tinySelectors = [
        '.message-img-container',
        '.decor-sic-container',
        '.top-cuadro1-container',
        '.top-cuadro2-container',
        '.logo-gif-container',
        '.arachnid-group'
    ];
    
    tinySelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('mouseenter', () => playHoverSound('tiny', el));
        });
    });

    // 4. Sonido "click" para los botones
    document.querySelectorAll('#buttons button').forEach(el => {
        el.addEventListener('mouseenter', () => playHoverSound('click', el));
    });

    console.log('✅ Sonidos hover asignados correctamente');
}

// Función para resetear el sistema
function resetSoundSystem() {
    soundSystem.lastSoundKey = null;
    soundSystem.lastElementId = null;
    soundSystem.lastPlayTime = 0;
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', assignHoverSounds);
} else {
    assignHoverSounds();
}

// Modificar setMode para resetear sonidos al cambiar de modo
const originalSetModeWithSounds = setMode;
if (typeof setMode === 'function') {
    setMode = function(mode) {
        // Resetear sistema de sonidos
        resetSoundSystem();
        
        // Llamar a la función original
        originalSetModeWithSounds(mode);
        
        // Re-asignar sonidos después del cambio de modo
        setTimeout(() => {
            assignHoverSounds();
        }, 200);
    };
}






















//RADIOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO//

// ============================================
// RADIO PLAYER CON PERSISTENCIA DE MODO
// ============================================
const radioPlayer = {
    // Elementos del DOM
    playBtn: null,
    pauseBtn: null,
    prevBtn: null,
    nextBtn: null,
    cassetteImg: null,

    // Estado de la radio
    isPlaying: false,
    currentSongIndex: 0,
    songFiles: ['song1.mp3', 'song2.mp3', 'song3.mp3'],

    // Objetos de audio
    audioElement: null,
    radioFreqAudio: null,

    // Inicialización
    init: function() {
        console.log('📻 Inicializando Radio Player...');

        // Obtener referencias a los elementos del DOM
        this.playBtn = document.getElementById('radio-play');
        this.pauseBtn = document.getElementById('radio-pause');
        this.prevBtn = document.getElementById('radio-prev');
        this.nextBtn = document.getElementById('radio-next');
        this.cassetteImg = document.getElementById('radio-cassette-img');

        if (!this.playBtn || !this.pauseBtn || !this.prevBtn || !this.nextBtn || !this.cassetteImg) {
            console.warn('⚠️ No se encontraron todos los elementos de la radio.');
            return;
        }

        // Crear elementos de audio
        this.audioElement = new Audio();
        this.radioFreqAudio = new Audio('sounds/radiofrequency.wav');
        this.radioFreqAudio.loop = true;
        this.radioFreqAudio.volume = 0.2;

        // Configurar evento para cuando la canción termina
        this.audioElement.addEventListener('ended', () => {
            console.log('⏭️ Canción terminada, pasando a la siguiente');
            this.nextSong();
        });

        // Añadir event listeners a los botones
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());

        // Estado inicial: mostramos play, ocultamos pause
        this.showPlayButton();

        console.log('✅ Radio Player inicializado');
    },

    // Mostrar botón de play, ocultar pause
    showPlayButton: function() {
        this.playBtn.style.display = 'block';
        this.pauseBtn.style.display = 'none';
    },

    // Mostrar botón de pause, ocultar play
    showPauseButton: function() {
        this.playBtn.style.display = 'none';
        this.pauseBtn.style.display = 'block';
    },

    // Cargar una canción por su índice
    loadSong: function(index) {
        const safeIndex = (index + this.songFiles.length) % this.songFiles.length;
        this.currentSongIndex = safeIndex;
        const songPath = `jadecassette/${this.songFiles[safeIndex]}`;

        console.log(`📀 Cargando canción: ${songPath}`);
        this.audioElement.src = songPath;
        this.audioElement.load();

        if (this.isPlaying) {
            this.audioElement.play().catch(e => console.log('Error al reproducir:', e));
        }
    },

    // Reproducir
    play: function() {
        console.log('▶️ Play');
        
        // Cargar la primera canción si no hay ninguna
        if (!this.audioElement.src) {
            this.loadSong(0);
        }

        this.isPlaying = true;
        document.body.classList.add('radio-playing');
        this.showPauseButton();

        // Reproducir la canción
        this.audioElement.play().catch(e => console.log('Error al reproducir:', e));

        // Reproducir el sonido de frecuencia
        this.radioFreqAudio.play().catch(e => console.log('Error al reproducir frecuencia:', e));

        // Efecto de sonido
        this.playSoundEffect('sounds/sounds_play.wav');
    },

    // Pausar
    pause: function() {
        console.log('⏸️ Pausa');
        
        this.isPlaying = false;
        document.body.classList.remove('radio-playing');
        this.showPlayButton();

        // Pausar la canción
        this.audioElement.pause();

        // Pausar el sonido de frecuencia
        this.radioFreqAudio.pause();

        // Efecto de sonido
        this.playSoundEffect('sounds/sounds_play.wav');
    },

    // Siguiente canción
    nextSong: function() {
        console.log('⏭️ Siguiente canción');
        this.loadSong(this.currentSongIndex + 1);
        this.playSoundEffect('sounds/sounds_next.wav');
    },

    // Canción anterior
    prevSong: function() {
        console.log('⏮️ Canción anterior');
        this.loadSong(this.currentSongIndex - 1);
        this.playSoundEffect('sounds/sounds_next.wav');
    },

    // Efectos de sonido
    playSoundEffect: function(soundPath) {
        const effect = new Audio(soundPath);
        effect.volume = 0.3;
        effect.play().catch(e => console.log('Error al reproducir efecto:', e));
    },

    // Sincronizar con cambio de modo
    syncWithMode: function() {
        console.log('🔄 Sincronizando radio con nuevo modo');
        // Forzar actualización del cassette si está playing
        if (this.isPlaying && this.cassetteImg) {
            // Pequeño truco para forzar reflow
            this.cassetteImg.style.display = 'none';
            this.cassetteImg.offsetHeight;
            this.cassetteImg.style.display = 'block';
        }
    }
};

// ============================================
// INTEGRAR CON EL SISTEMA EXISTENTE
// ============================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Tu código existente...
    
    setTimeout(() => {
        radioPlayer.init();
    }, 200);
});

// Modificar setMode para sincronizar la radio
const originalSetModeWithRadio = setMode;
setMode = function(mode) {
    originalSetModeWithRadio(mode);
    
    setTimeout(() => {
        if (radioPlayer && typeof radioPlayer.syncWithMode === 'function') {
            radioPlayer.syncWithMode();
        }
        if (typeof updateSunColor === 'function') {
            updateSunColor();
        }
    }, 100);
};




















//* ============================================ */
/* FOOTER INDICATOR - SUPERPOSICIÓN             */
/* ============================================ *//* ============================================ */
/* FOOTER INDICATOR - SUPERPOSICIÓN             */
/* ============================================ */
// ============================================
// ============================================
// ============================================
// INDICADOR SIMPLE - SIN COMPLICACIONES
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const indicator = document.getElementById('indicator-img');
    if (!indicator) return;
    
    // Función para cambiar imagen según el modo actual
    function getImagePath(imageName) {
        if (document.body.classList.contains('light')) {
            return `lightmode/${imageName}`;
        } else if (document.body.classList.contains('dark-night')) {
            return `mytmode/${imageName}`;
        } else {
            return `darkmode/${imageName}`;
        }
    }
    
    // Función para actualizar indicador
    function updateIndicator(type) {
        if (!indicator) return;
        
        let imageName = '3-a-la-vez.gif'; // Default
        
        if (type === 'cargando') {
            imageName = 'cargando.gif';
        } else if (type === 'alterar') {
            imageName = 'alterar.gif';
        }
        
        indicator.src = getImagePath(imageName);
    }
    
    // 1. BOTONES - mouseenter/mouseleave
    document.querySelectorAll('#buttons button').forEach(btn => {
        btn.addEventListener('mouseenter', () => updateIndicator('cargando'));
        btn.addEventListener('mouseleave', () => {
            // Si la radio está encendida, mantener alterar, si no, default
            if (document.body.classList.contains('radio-playing')) {
                updateIndicator('alterar');
            } else {
                updateIndicator('default');
            }
        });
    });
    
    // 2. LINK GIF - mouseenter/mouseleave
    const linkGif = document.querySelector('.bot-link-gif-link');
    if (linkGif) {
        linkGif.addEventListener('mouseenter', () => updateIndicator('cargando'));
        linkGif.addEventListener('mouseleave', () => {
            if (document.body.classList.contains('radio-playing')) {
                updateIndicator('alterar');
            } else {
                updateIndicator('default');
            }
        });
    }
    
    // 3. RADIO - detección simple
    function checkRadioState() {
        if (document.body.classList.contains('radio-playing')) {
            updateIndicator('alterar');
        } else {
            updateIndicator('default');
        }
    }
    
    // Detectar clicks en play/pause
    const radioPlay = document.getElementById('radio-play');
    const radioPause = document.getElementById('radio-pause');
    
    if (radioPlay) {
        radioPlay.addEventListener('click', () => {
            setTimeout(() => checkRadioState(), 50);
        });
    }
    
    if (radioPause) {
        radioPause.addEventListener('click', () => {
            setTimeout(() => checkRadioState(), 50);
        });
    }
    
    // Observar cambios en la clase del body
    const observer = new MutationObserver(checkRadioState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    // Estado inicial
    checkRadioState();
    
    // Actualizar cuando cambia el modo
    const originalSetMode = window.setMode;
    window.setMode = function(mode) {
        if (originalSetMode) originalSetMode(mode);
        setTimeout(() => {
            if (document.body.classList.contains('radio-playing')) {
                updateIndicator('alterar');
            } else {
                updateIndicator('default');
            }
        }, 50);
    };
});
















// ============================================
// PARTICLES.JS - FONDO ANIMADO (AÑADIR AL FINAL)
// ============================================
// Este código debe ir al final de tu script.js
// ============================================
// PARTICLES.JS - VERSIÓN MEJORADA (SIN REINICIOS)
// ============================================
// ============================================
// PARTICLES.JS - VERSIÓN ULTRA ESTABLE (0 REINICIOS)
// ============================================
(function() {
    'use strict';
    
    let particlesInstance = null;
    
    // Configuración base de las partículas (adaptada de tu JSON)
    const particlesConfig = {
        particles: {
            number: {
                value: 61,
                density: {
                    enable: true,
                    value_area: 789.1476416322727
                }
            },
            color: {
                value: "#A94C4C" // Dark-day por defecto
            },
            shape: {
                type: "edge",
                stroke: {
                    width: 0,
                    color: "#b1b1b1"
                },
                polygon: {
                    nb_sides: 3
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 4,
                    size_min: 1,
                    sync: false
                }
            },
            line_linked: {
                enable: false
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: false,
                    mode: "repulse"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    };
    
    // Mapa de colores por modo
    const modeColors = {
        'light': '#27196f',
        'dark-night': '#7b633a',
        'dark-day': '#A94C4C'
    };
    
    // Inicializar particles.js UNA SOLA VEZ
    function initParticles() {
        if (!document.getElementById('particles-js')) {
            console.warn('⚠️ Contenedor #particles-js no encontrado');
            return;
        }
        
        try {
            particlesInstance = particlesJS('particles-js', particlesConfig);
            console.log('✅ Particles.js iniciado con color:', particlesConfig.particles.color.value);
        } catch (error) {
            console.error('❌ Error al inicializar particles.js:', error);
        }
    }
    
    // ACTUALIZAR COLOR SIN REINICIAR - VERSIÓN ULTRA SEGURA
    function updateParticleColor(newColor) {
        if (!particlesInstance) {
            console.log('⏳ Particles.js no está listo aún');
            return;
        }
        
        // MÉTODO DIRECTO: Acceder al canvas y cambiar colores manualmente
        try {
            // Intentar método 1: API interna de particles.js
            if (particlesInstance.particles && particlesInstance.particles.array) {
                const particles = particlesInstance.particles.array;
                for (let i = 0; i < particles.length; i++) {
                    if (particles[i].color) {
                        particles[i].color.value = newColor;
                    }
                }
                console.log('🎨 Color actualizado a:', newColor);
            } 
            // Intentar método 2: Usar el objeto pJSDom global
            else if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
                const pJS = window.pJSDom[0].pJS;
                if (pJS.particles && pJS.particles.array) {
                    const particles = pJS.particles.array;
                    for (let i = 0; i < particles.length; i++) {
                        if (particles[i].color) {
                            particles[i].color.value = newColor;
                        }
                    }
                    console.log('🎨 Color actualizado vía pJSDom:', newColor);
                }
            }
        } catch (e) {
            console.log('Error al actualizar color (no crítico):', e);
        }
    }
    
    // Preservar setMode original
    const originalSetMode = window.setMode || function() {};
    
    // NUEVA setMode que solo cambia color cuando es necesario
    window.setMode = function(mode) {
        console.log('🔄 Cambiando a modo:', mode);
        
        // Llamar a la función original (cambia imágenes, colores de texto, etc.)
        if (typeof originalSetMode === 'function') {
            originalSetMode(mode);
        } else {
            document.body.classList.remove('light', 'dark-day', 'dark-night');
            document.body.classList.add(mode);
        }
        
        // Actualizar color de partículas según el modo
        const newColor = modeColors[mode] || '#A94C4C';
        updateParticleColor(newColor);
    };
    
    // Inicializar partículas UNA VEZ cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticles);
    } else {
        initParticles();
    }
    
    console.log('🚀 Particles.js - MODO ULTRA ESTABLE ACTIVADO');
    console.log('   • Las partículas NUNCA se reinician');
    console.log('   • Solo cambian de color con los botones de modo');
    console.log('   • La radio NO afecta a las partículas');
})();
