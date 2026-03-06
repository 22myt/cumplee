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

    // Reiniciar partículas con nuevo color (UNA SOLA VEZ)
    if (window.restartParticlesWithColor) {
        const modeColors = {
            'light': '#27196f',
            'dark-night': '#7b633a',
            'dark-day': '#A94C4C'
        };
        window.restartParticlesWithColor(modeColors[mode] || '#A94C4C');
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
// ANIMACIÓN LOTTIE - ICONO DEL SOL
// ============================================
let sunAnimation = null;
let sunInitialized = false;

function updateSunColor() {
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) return;
    
    const svg = sunContainer.querySelector('svg');
    if (!svg) return;
    
    let color = '#ffffff';
    if (body.classList.contains('dark-night')) {
        color = '#7c643a';
    } else if (body.classList.contains('light')) {
        color = '#27196f';
    }
    
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

function initSunIcon() {
    if (sunInitialized) return;
    
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) {
        console.warn('No se encontró el contenedor del sol');
        return;
    }

    if (sunAnimation) {
        sunAnimation.destroy();
    }

    try {
        sunAnimation = lottie.loadAnimation({
            container: sunContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'icons8-sun.json'
        });

        sunAnimation.addEventListener('DOMLoaded', function() {
            updateSunColor();
            sunInitialized = true;
        });
    } catch (e) {
        console.log('Error cargando animación del sol:', e);
    }
}

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
// PARTICLES.JS (OPTIMIZADO)
// ============================================
(function() {
    'use strict';
    
    let particlesInstance = null;
    let particlesInitialized = false;
    
    const particlesConfig = {
        particles: {
            number: {
                value: 41, // Reducido de 61 para mejor rendimiento
                density: {
                    enable: true,
                    value_area: 789.1476416322727
                }
            },
            color: {
                value: "#A94C4C"
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
                value: 0.4, // Reducido ligeramente
                random: true,
                anim: {
                    enable: false
                }
            },
            size: {
                value: 2.5, // Reducido
                random: true,
                anim: {
                    enable: true,
                    speed: 2, // Reducido
                    size_min: 1,
                    sync: false
                }
            },
            line_linked: {
                enable: false
            },
            move: {
                enable: true,
                speed: 1.5, // Reducido
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: false
                },
                onclick: {
                    enable: false // Desactivado para mejor rendimiento
                },
                resize: true
            }
        },
        retina_detect: true
    };
    
    const modeColors = {
        'light': '#27196f',
        'dark-night': '#7b633a',
        'dark-day': '#A94C4C'
    };
    
    function initParticles() {
        if (particlesInitialized) return;
        
        if (!document.getElementById('particles-js')) {
            console.warn('⚠️ Contenedor #particles-js no encontrado');
            return;
        }
        
        try {
            particlesInstance = particlesJS('particles-js', particlesConfig);
            particlesInitialized = true;
            console.log('✅ Particles.js iniciado');
        } catch (error) {
            console.error('❌ Error al inicializar particles.js:', error);
        }
    }
    
    window.restartParticlesWithColor = function(newColor) {
        if (!document.getElementById('particles-js') || !particlesInstance) return;
        
        particlesConfig.particles.color.value = newColor;
        
        try {
            // En lugar de destruir y recrear, solo actualizamos el color si es posible
            if (particlesInstance && particlesInstance.options) {
                particlesInstance.options.particles.color.value = newColor;
                // Forzar actualización
                if (particlesInstance.refresh) {
                    particlesInstance.refresh();
                }
            }
        } catch (e) {
            console.log('Error actualizando color de partículas');
        }
    };
    
    // Inicializar partículas
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
