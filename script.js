// ============================================
// SISTEMA DE CAMBIO DE MODOS
// ============================================
const body = document.body;
let modeChangeTimeout = null;

// Función principal de cambio de modo (OPTIMIZADA)
function setMode(mode) {
    // Si ya hay un cambio en progreso, cancelarlo
    if (modeChangeTimeout) {
        clearTimeout(modeChangeTimeout);
    }
    
    // Remueve todas las clases de modo
    body.classList.remove("light", "dark-day", "dark-night");
    // Añade la nueva clase
    body.classList.add(mode);
    console.log("Modo activado:", mode);

    // Actualizar color del sol si existe (SOLO UNA VEZ)
    if (typeof updateSunColor === 'function') {
        updateSunColor();
    }

    // Actualizar indicador del footer
    if (typeof updateFooterIndicator === 'function') {
        updateFooterIndicator();
    }

// Cambiar color de partículas SIN REINICIAR
if (window.changeParticlesColor) {
    const modeColors = {
        'light': '#27196f',
        'dark-night': '#7b633a',
        'dark-day': '#A94C4C'
    };
    window.changeParticlesColor(modeColors[mode] || '#A94C4C');
}

    // Resetear sistema de sonidos (pero NO reasignar inmediatamente)
    resetSoundSystem();
    
    // Reasignar sonidos solo después de un retraso, y SOLO UNA VEZ
    modeChangeTimeout = setTimeout(() => {
        assignHoverSounds();
        modeChangeTimeout = null;
    }, 300);

    // Sincronizar radio (solo si es necesario)
    if (radioPlayer && typeof radioPlayer.syncWithMode === 'function') {
        radioPlayer.syncWithMode();
    }

    // Un SOLO retraso para scaling
    setTimeout(checkContainerScaling, 150);
}

// ============================================
// SISTEMA DE SCALING (OPTIMIZADO)
// ============================================
let scalingInterval = null;
let scalingTimeout = null;
let lastScaleCheck = 0;

function checkContainerScaling() {
    // Throttle: no ejecutar más de una vez cada 100ms
    const now = Date.now();
    if (now - lastScaleCheck < 100) return;
    lastScaleCheck = now;
    
    const contentWrapper = document.getElementById('content-wrapper');
    const mainContainer = document.getElementById('main-container');
    
    if (!contentWrapper || !mainContainer) return;
    
    const wrapperHeight = contentWrapper.scrollHeight;
    const availableHeight = window.innerHeight - 40;
    const isOverflowing = wrapperHeight > availableHeight;
    
    if (isOverflowing) {
        const scaleFactor = availableHeight / wrapperHeight;
        contentWrapper.style.transform = `scale(${scaleFactor})`;
    } else {
        contentWrapper.style.transform = 'none';
    }
}

function initScaling() {
    const contentWrapper = document.getElementById('content-wrapper');
    if (!contentWrapper) {
        console.warn('No se encontró #content-wrapper');
        return;
    }
    
    // Una sola verificación inicial
    setTimeout(checkContainerScaling, 100);
    
    // Evento resize con debounce MEJORADO
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(checkContainerScaling, 100);
    });
    
    // Verificación periódica MENOS FRECUENTE (cada 2 segundos en lugar de 500ms)
    if (scalingInterval) {
        clearInterval(scalingInterval);
    }
    scalingInterval = setInterval(checkContainerScaling, 2000);
}

// ============================================
// MARQUEE - TEXTO ANIMADO EN LATERAL (OPTIMIZADO)
// ============================================
let marqueeAnimation = null;
let marqueePosition = 0;
let lastMarqueeTime = 0;

function createMarqueeText() {
    const lateral = document.getElementById('lateral');
    if (!lateral) {
        console.warn('No se encontró el elemento #lateral');
        return;
    }
    
    if (document.querySelector('.marquee-vertical-container')) {
        console.log('El marquee ya existe');
        return;
    }
    
    const marqueeText = "© All illustrations are the intellectual property of Neon Genesis Evangelion, created by Hideaki Anno. | Coded & designed by Myt";
    
    const container = document.createElement('div');
    container.className = 'marquee-vertical-container';
    
    const content = document.createElement('div');
    content.className = 'marquee-vertical-content';
    
    let htmlContent = '';
    for (let i = 0; i < 10; i++) {
        htmlContent += `<span>${marqueeText}</span>`;
    }
    content.innerHTML = htmlContent;
    
    container.appendChild(content);
    lateral.appendChild(container);
    
    startMarqueeAnimation();
}

function startMarqueeAnimation() {
    if (marqueeAnimation) {
        cancelAnimationFrame(marqueeAnimation);
    }
    
    const content = document.querySelector('.marquee-vertical-content');
    if (!content) return;
    
    let lastTime = performance.now();
    const pixelsPerSecond = 60; 
    
    function animate(currentTime) {
        // Calcular delta time
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        // Limitar deltaTime para evitar saltos grandes
        const safeDelta = Math.min(deltaTime, 0.1);
        
        marqueePosition -= pixelsPerSecond * safeDelta;
        
        if (marqueePosition <= -content.scrollWidth / 2) {
            marqueePosition = 0;
        }
        
        content.style.transform = `translateX(${marqueePosition}px)`;
        marqueeAnimation = requestAnimationFrame(animate);
    }
    
    lastTime = performance.now();
    marqueeAnimation = requestAnimationFrame(animate);
}

function stopMarqueeAnimation() {
    if (marqueeAnimation) {
        cancelAnimationFrame(marqueeAnimation);
        marqueeAnimation = null;
    }
}

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
// LÓGICA HORARIA PARA MODO DUAL
// ============================================
function getCurrentDualMode() {
    const now = new Date();
    const hourGMT3 = (now.getUTCHours() - 3 + 24) % 24;
    
    if (hourGMT3 >= 7 && hourGMT3 < 19) {
        return 'dark-day';
    } else {
        return 'dark-night';
    }
}

// ============================================
// ANIMACIÓN LOTTIE - ICONO DEL SOL (CORREGIDO)
// ============================================
let sunAnimation = null;
let sunInitialized = false;
let sunColorUpdateQueued = false;

// Función para actualizar el color del sol (MEJORADA)
function updateSunColor() {
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) {
        console.warn('⚠️ Contenedor del sol no encontrado');
        return;
    }
    
    // Determinar color según el modo actual
    let color = '#ffffff'; // Default dark-day
    
    if (document.body.classList.contains('dark-night')) {
        color = '#7c643a'; // Marrón para mytmode
    } else if (document.body.classList.contains('light')) {
        color = '#27196f'; // Azul oscuro para lightmode
    }
    // Si es dark-day, se queda blanco (#ffffff)
    
    console.log('☀️ Actualizando color del sol a:', color, 'Modo:', document.body.classList);
    
    // Si la animación Lottie ya está cargada, actualizar sus colores
    if (sunAnimation && sunAnimation.renderer) {
        try {
            // Método 1: Buscar el SVG y actualizar colores directamente
            const svg = sunContainer.querySelector('svg');
            if (svg) {
                const elements = svg.querySelectorAll('path, circle, rect, polygon, line, g');
                elements.forEach(el => {
                    // Actualizar fill (color de relleno)
                    if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none') {
                        el.setAttribute('fill', color);
                    }
                    // Actualizar stroke (color de borde)
                    if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
                        el.setAttribute('stroke', color);
                    }
                });
                console.log('✅ SVG actualizado manualmente');
            }
            
            // Método 2: Usar el método de Lottie si está disponible
            if (sunAnimation.renderer && sunAnimation.renderer.canvasContext) {
                // No aplica para SVG, pero lo dejamos como respaldo
            }
        } catch (e) {
            console.log('Error actualizando SVG manualmente:', e);
        }
    } else {
        // Si la animación no está lista, guardar el color para cuando lo esté
        window.pendingSunColor = color;
        console.log('⏳ Color pendiente para cuando el sol esté listo:', color);
    }
}

// Función para inicializar el sol (MEJORADA)
function initSunIcon() {
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) {
        console.warn('⚠️ No se encontró el contenedor del sol');
        return;
    }

    // Si ya está inicializado y tenemos animación, no reiniciar
    if (sunInitialized && sunAnimation) {
        console.log('☀️ Sol ya inicializado');
        updateSunColor(); // Solo actualizar color
        return;
    }

    console.log('☀️ Inicializando animación del sol...');

    // Limpiar contenedor por si acaso
    sunContainer.innerHTML = '';
    
    // Si hay una animación anterior, destruirla
    if (sunAnimation) {
        try {
            sunAnimation.destroy();
        } catch (e) {}
        sunAnimation = null;
    }

    try {
        // Cargar la animación Lottie
        sunAnimation = lottie.loadAnimation({
            container: sunContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'icons8-sun.json'
        });

        // Cuando la animación esté completamente cargada
        sunAnimation.addEventListener('DOMLoaded', function() {
            console.log('☀️ Animación del sol cargada');
            sunInitialized = true;
            
            // Aplicar color pendiente si existe
            if (window.pendingSunColor) {
                setTimeout(() => {
                    updateSunColor();
                    window.pendingSunColor = null;
                }, 50);
            } else {
                updateSunColor();
            }
        });

        // También escuchar el evento 'data_ready' por si acaso
        sunAnimation.addEventListener('data_ready', function() {
            console.log('☀️ Datos del sol listos');
        });

    } catch (e) {
        console.error('❌ Error cargando animación del sol:', e);
        
        // FALLBACK: Si Lottie falla, crear un SVG manual
        createFallbackSunIcon(sunContainer);
    }
}

// Función de respaldo por si Lottie falla
function createFallbackSunIcon(container) {
    console.log('☀️ Creando sol de respaldo (SVG manual)');
    
    // Determinar color según modo actual
    let color = '#ffffff';
    if (document.body.classList.contains('dark-night')) {
        color = '#7c643a';
    } else if (document.body.classList.contains('light')) {
        color = '#27196f';
    }
    
    // Crear SVG simple pero animado con CSS
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    
    // Añadir estilo de animación
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
        @keyframes sunRotate {
            from { transform: rotate(0deg); transform-origin: 50px 50px; }
            to { transform: rotate(360deg); transform-origin: 50px 50px; }
        }
        .sun-ray { animation: sunRotate 10s linear infinite; }
    `;
    svg.appendChild(style);
    
    // Círculo central
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', '20');
    circle.setAttribute('fill', color);
    svg.appendChild(circle);
    
    // Rayos del sol (en un grupo que rota)
    const raysGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    raysGroup.setAttribute('class', 'sun-ray');
    
    for (let i = 0; i < 8; i++) {
        const angle = (i * 45) * Math.PI / 180;
        const x1 = 50 + 30 * Math.cos(angle);
        const y1 = 50 + 30 * Math.sin(angle);
        const x2 = 50 + 45 * Math.cos(angle);
        const y2 = 50 + 45 * Math.sin(angle);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-linecap', 'round');
        raysGroup.appendChild(line);
    }
    
    svg.appendChild(raysGroup);
    
    // Limpiar y añadir el nuevo SVG
    container.innerHTML = '';
    container.appendChild(svg);
    
    sunInitialized = true;
    console.log('✅ Sol de respaldo creado');
}

// Asegurar que el contenedor del sol sea visible
function ensureSunVisibility() {
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) return;
    
    // Verificar que el contenedor padre tenga posición relativa
    const parent = sunContainer.parentElement;
    if (parent) {
        // Asegurar que el contenedor del sol sea visible
        sunContainer.style.display = 'inline-block';
        sunContainer.style.width = '15px';
        sunContainer.style.height = '9.5px';
        sunContainer.style.position = 'relative';
        sunContainer.style.top = '63.5px';
        sunContainer.style.left = '-5px';
        sunContainer.style.zIndex = '48';
        
        // Debug: bordes temporales para ver el contenedor (opcional, quitar después)
        // sunContainer.style.border = '1px solid red';
    }
}

// Modificar la función setMode para asegurar que el sol se actualice
const originalSetMode = setMode;
setMode = function(mode) {
    // Llamar a la función original
    originalSetMode(mode);
    
    // Forzar actualización del sol después del cambio de modo
    setTimeout(() => {
        updateSunColor();
        ensureSunVisibility();
    }, 100);
};

// ============================================
// SISTEMA DE SONIDOS HOVER (OPTIMIZADO)
// ============================================
const hoverSounds = {
    'bubble': new Audio('sounds/bubble_sound.mp3'),
    'alien': new Audio('sounds/hoveralien.mp3'),
    'tiny': new Audio('sounds/tiny.mp3'),
    'click': new Audio('sounds/sounds_click7.wav')
};

// Precargar sonidos (opcional, mejora rendimiento)
Object.values(hoverSounds).forEach(sound => {
    sound.load();
    sound.volume = 0.3;
});

const soundSystem = {
    lastSoundKey: null,
    lastElementId: null,
    lastPlayTime: 0,
    spamThreshold: 200 // Aumentado a 200ms
};

function getElementId(element) {
    return element.id || 
           element.className || 
           element.tagName + '_' + Math.random().toString(36).substr(2, 9);
}

function playHoverSound(soundKey, element) {
    if (!soundKey) return;
    
    const now = Date.now();
    const elementId = getElementId(element);
    
    if (soundKey === soundSystem.lastSoundKey && 
        elementId === soundSystem.lastElementId && 
        now - soundSystem.lastPlayTime < soundSystem.spamThreshold) {
        return;
    }
    
    const sound = hoverSounds[soundKey];
    if (!sound) return;
    
    soundSystem.lastSoundKey = soundKey;
    soundSystem.lastElementId = elementId;
    soundSystem.lastPlayTime = now;
    
    // Usar el sonido directamente en lugar de clonar (mejor rendimiento)
    sound.currentTime = 0;
    sound.play().catch(e => {
        // Ignorar errores de reproducción
    });
}

let soundsAssigned = false;

function assignHoverSounds() {
    if (soundsAssigned) return;
    
    // Usar delegación de eventos para mejor rendimiento
    document.body.addEventListener('mouseenter', (e) => {
        const target = e.target;
        
        // Bubble sound
        if (target.closest('.bot-link-gif-link')) {
            playHoverSound('bubble', target.closest('.bot-link-gif-link'));
        }
        // Alien sound
        else if (target.closest('.profile-icon-container')) {
            playHoverSound('alien', target.closest('.profile-icon-container'));
        }
        // Tiny sounds
        else if (target.closest('.message-img-container') ||
                 target.closest('.decor-sic-container') ||
                 target.closest('.top-cuadro1-container') ||
                 target.closest('.top-cuadro2-container') ||
                 target.closest('.logo-gif-container') ||
                 target.closest('.arachnid-group')) {
            playHoverSound('tiny', target.closest('.message-img-container, .decor-sic-container, .top-cuadro1-container, .top-cuadro2-container, .logo-gif-container, .arachnid-group'));
        }
        // Click sound for buttons
        else if (target.closest('#buttons button')) {
            playHoverSound('click', target.closest('#buttons button'));
        }
    }, true); // Usar captura para mejor respuesta
    
    soundsAssigned = true;
    console.log('✅ Sonidos hover asignados (delegación)');
}

function resetSoundSystem() {
    soundSystem.lastSoundKey = null;
    soundSystem.lastElementId = null;
    soundSystem.lastPlayTime = 0;
}

// ============================================
// RADIO PLAYER (OPTIMIZADO)
// ============================================
const radioPlayer = {
    playBtn: null,
    pauseBtn: null,
    prevBtn: null,
    nextBtn: null,
    cassetteImg: null,
    isPlaying: false,
    currentSongIndex: 0,
    songFiles: ['song1.mp3', 'song2.mp3', 'song3.mp3'],
    audioElement: null,
    radioFreqAudio: null,
    initialized: false,

    init: function() {
        if (this.initialized) return;
        
        console.log('📻 Inicializando Radio Player...');

        this.playBtn = document.getElementById('radio-play');
        this.pauseBtn = document.getElementById('radio-pause');
        this.prevBtn = document.getElementById('radio-prev');
        this.nextBtn = document.getElementById('radio-next');
        this.cassetteImg = document.getElementById('radio-cassette-img');

        if (!this.playBtn || !this.pauseBtn || !this.prevBtn || !this.nextBtn || !this.cassetteImg) {
            console.warn('⚠️ No se encontraron todos los elementos de la radio.');
            return;
        }

        this.audioElement = new Audio();
        this.radioFreqAudio = new Audio('sounds/radiofrequency.wav');
        this.radioFreqAudio.loop = true;
        this.radioFreqAudio.volume = 0.2;

        this.audioElement.addEventListener('ended', () => {
            this.nextSong();
        });

        // Usar event listeners con debounce para evitar múltiples disparos
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());

        this.showPlayButton();
        this.initialized = true;
        console.log('✅ Radio Player inicializado');
    },

    showPlayButton: function() {
        this.playBtn.style.display = 'block';
        this.pauseBtn.style.display = 'none';
    },

    showPauseButton: function() {
        this.playBtn.style.display = 'none';
        this.pauseBtn.style.display = 'block';
    },

    loadSong: function(index) {
        const safeIndex = (index + this.songFiles.length) % this.songFiles.length;
        this.currentSongIndex = safeIndex;
        const songPath = `jadecassette/${this.songFiles[safeIndex]}`;

        this.audioElement.src = songPath;
        this.audioElement.load();
    },

    play: function() {
        if (!this.audioElement.src) {
            this.loadSong(0);
        }

        this.isPlaying = true;
        document.body.classList.add('radio-playing');
        this.showPauseButton();

        this.audioElement.play().catch(e => console.log('Error al reproducir:', e));
        this.radioFreqAudio.play().catch(e => console.log('Error al reproducir frecuencia:', e));
        this.playSoundEffect('sounds/sounds_play.wav');
        
        if (typeof updateFooterIndicator === 'function') {
            updateFooterIndicator();
        }
    },

    pause: function() {
        this.isPlaying = false;
        document.body.classList.remove('radio-playing');
        this.showPlayButton();

        this.audioElement.pause();
        this.radioFreqAudio.pause();
        this.playSoundEffect('sounds/sounds_play.wav');
        
        if (typeof updateFooterIndicator === 'function') {
            updateFooterIndicator();
        }
    },

    nextSong: function() {
        this.loadSong(this.currentSongIndex + 1);
        if (this.isPlaying) {
            this.audioElement.play().catch(e => console.log('Error al reproducir:', e));
        }
        this.playSoundEffect('sounds/sounds_next.wav');
    },

    prevSong: function() {
        this.loadSong(this.currentSongIndex - 1);
        if (this.isPlaying) {
            this.audioElement.play().catch(e => console.log('Error al reproducir:', e));
        }
        this.playSoundEffect('sounds/sounds_next.wav');
    },

    playSoundEffect: function(soundPath) {
        const effect = new Audio(soundPath);
        effect.volume = 0.3;
        effect.play().catch(e => {});
    },

    syncWithMode: function() {
        // No hacer nada pesado aquí
    }
};

// ============================================
// INDICADOR DEL FOOTER
// ============================================
let currentIndicatorType = 'default';

function updateFooterIndicator() {
    const indicator = document.getElementById('indicator-img');
    if (!indicator) return;
    
    function getImagePath(imageName) {
        if (document.body.classList.contains('light')) {
            return `lightmode/${imageName}`;
        } else if (document.body.classList.contains('dark-night')) {
            return `mytmode/${imageName}`;
        } else {
            return `darkmode/${imageName}`;
        }
    }
    
    let imageName = '3-a-la-vez.gif';
    
    if (currentIndicatorType === 'cargando') {
        imageName = 'cargando.gif';
    } else if (currentIndicatorType === 'alterar' || document.body.classList.contains('radio-playing')) {
        imageName = 'alterar.gif';
    }
    
    indicator.src = getImagePath(imageName);
}

// ============================================
// EVENTOS DE HOVER PARA EL INDICADOR
// ============================================
function setupIndicatorHovers() {
    // Usar delegación de eventos para mejor rendimiento
    document.body.addEventListener('mouseenter', (e) => {
        const target = e.target;
        
        if (target.closest('#buttons button') || target.closest('.bot-link-gif-link')) {
            currentIndicatorType = 'cargando';
            updateFooterIndicator();
        }
    }, true);
    
    document.body.addEventListener('mouseleave', (e) => {
        const target = e.target;
        
        if (target.closest('#buttons button') || target.closest('.bot-link-gif-link')) {
            currentIndicatorType = 'default';
            updateFooterIndicator();
        }
    }, true);
}

// ============================================
// PARTICLES.JS - VERSIÓN QUE SOLO CAMBIA COLOR (CORREGIDA)
// ============================================
// ============================================
// ============================================
// PARTICLES.JS - VERSIÓN EFICIENTE (SIN REINICIOS)
// ============================================
(function() {
    'use strict';
    
    // Mapa de colores por modo
    const modeColors = {
        'light': '#27196f',
        'dark-night': '#7b633a',
        'dark-day': '#A94C4C'
    };
    
    // Variable para guardar la instancia de particles.js
    let particlesInstance = null;
    let initAttempts = 0;
    const MAX_INIT_ATTEMPTS = 10;

    // Inicializar particles.js
    function initParticles() {
        if (!document.getElementById('particles-js')) {
            console.warn('⚠️ Contenedor #particles-js no encontrado');
            return;
        }
        
        console.log('🎨 Inicializando particles.js...');
        
        // Configuración
        const config = {
            particles: {
                number: { value: 61, density: { enable: true, value_area: 789.1476416322727 } },
                color: { value: "#A94C4C" }, // Color inicial
                shape: { type: "edge", stroke: { width: 0, color: "#b1b1b1" }, polygon: { nb_sides: 3 } },
                opacity: { value: 0.5, random: true, anim: { enable: false } },
                size: { value: 3, random: true, anim: { enable: true, speed: 4, size_min: 1, sync: false } },
                line_linked: { enable: false },
                move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false, attract: { enable: false } }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: false }, onclick: { enable: true, mode: "push" }, resize: true },
                modes: { push: { particles_nb: 4 } }
            },
            retina_detect: true
        };
        
        // Inicializar particles.js
        particlesJS('particles-js', config);
        
        // Intentar capturar la instancia de forma más fiable
        captureParticlesInstance();
    }
    
    // Función para capturar la instancia de particles.js (con reintentos)
    function captureParticlesInstance() {
        if (window.pJSDom && window.pJSDom.length > 0) {
            particlesInstance = window.pJSDom[0];
            console.log('✅ Particles.js instancia capturada correctamente');
            
            // Aplicar el color inicial basado en el modo actual
            const currentMode = document.body.classList.contains('light') ? 'light' : 
                               (document.body.classList.contains('dark-night') ? 'dark-night' : 'dark-day');
            changeParticlesColor(modeColors[currentMode]);
        } else if (initAttempts < MAX_INIT_ATTEMPTS) {
            initAttempts++;
            console.log(`⏳ Esperando a que particles.js esté listo... (intento ${initAttempts}/${MAX_INIT_ATTEMPTS})`);
            setTimeout(captureParticlesInstance, 200);
        } else {
            console.warn('⚠️ No se pudo capturar la instancia de particles.js después de varios intentos');
        }
    }
    
    // Función para cambiar color de forma eficiente (SIN REINICIAR)
    window.changeParticlesColor = function(newColor) {
        // Validar que tenemos un color
        if (!newColor) {
            console.warn('⚠️ No se proporcionó un color para las partículas');
            return;
        }
        
        // Si no tenemos la instancia, intentamos capturarla
        if (!particlesInstance && window.pJSDom && window.pJSDom.length > 0) {
            particlesInstance = window.pJSDom[0];
        }
        
        if (!particlesInstance) {
            console.log('⏳ Partículas no listas, reintentando cambio de color en 200ms...');
            setTimeout(() => window.changeParticlesColor(newColor), 200);
            return;
        }
        
        try {
            // MÉTODO MEJORADO: Acceder a la configuración de las partículas
            if (particlesInstance.pJS && particlesInstance.pJS.particles) {
                // 1. Cambiar el color en la configuración (para nuevas partículas)
                particlesInstance.pJS.particles.color.value = newColor;
                
                // 2. Cambiar el color de TODAS las partículas existentes
                if (particlesInstance.pJS.particles.array && particlesInstance.pJS.particles.array.length > 0) {
                    particlesInstance.pJS.particles.array.forEach(p => {
                        if (p.color) {
                            p.color.value = newColor;
                        }
                    });
                }
                
                // 3. REFRESCAR suavemente (esto actualiza el canvas sin reiniciar)
                // Este es el método clave: refresh actualiza la visualización sin reiniciar el motor
                particlesInstance.pJS.fn.particlesRefresh();
                
                console.log('🎨 Color de partículas cambiado a:', newColor, 'sin reiniciar la animación');
            } else {
                console.warn('⚠️ Estructura de particles.js no reconocida');
            }
        } catch (e) {
            console.error('❌ Error cambiando color de partículas:', e);
        }
    };
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticles);
    } else {
        initParticles();
    }
})();

// ============================================
// INICIALIZACIÓN PRINCIPAL (OPTIMIZADA)
// ============================================
document.documentElement.style.overflow = 'hidden';
document.body.style.overflow = 'hidden';

// Solo un event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado, inicializando...');
    
    // --- MODO INICIAL ---
    const initialDualMode = getCurrentDualMode();
    const modes = ['light', initialDualMode];
    const randomIndex = Math.random() < 0.5 ? 0 : 1;
    const initialMode = modes[randomIndex];

    setMode(initialMode);

    // --- CONFIGURAR BOTONES ---
    const lightBtn = document.getElementById("light-btn");
    const darkDayBtn = document.getElementById("dark-day-btn");

    if (lightBtn) {
        lightBtn.addEventListener("click", () => setMode("light"));
    }

    if (darkDayBtn) {
        darkDayBtn.addEventListener("click", () => setMode(getCurrentDualMode()));
    }

    // --- INICIALIZAR COMPONENTES (con retrasos escalonados) ---
    createMarqueeText();
    initScaling();
    
    setTimeout(() => initSunIcon(), 200);
    setTimeout(() => radioPlayer.init(), 400);
    setTimeout(() => {
        assignHoverSounds();
        setupIndicatorHovers();
    }, 600);
    
    // Estado inicial del indicador
    updateFooterIndicator();
});

window.addEventListener('load', function() {
    console.log('✅ Página cargada');
    checkContainerScaling();
    restartMarqueeAnimation();
});

// Pausar animaciones SOLO cuando la pestaña no está visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopMarqueeAnimation();
    } else {
        startMarqueeAnimation();
    }
});

console.log("✅ Sistema listo");
