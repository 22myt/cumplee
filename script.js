// ============================================
// SISTEMA DE CAMBIO DE MODOS
// ============================================
const body = document.body;

// Función principal de cambio de modo (UNA SOLA VEZ)
function setMode(mode) {
    // Remueve todas las clases de modo
    body.classList.remove("light", "dark-day", "dark-night");
    // Añade la nueva clase
    body.classList.add(mode);
    console.log("Modo activado:", mode);

    // Actualizar color del sol si existe
    if (typeof updateSunColor === 'function') {
        updateSunColor();
    }

    // Actualizar indicador del footer
    if (typeof updateFooterIndicator === 'function') {
        updateFooterIndicator();
    }

    // Reiniciar partículas con nuevo color
    if (typeof restartParticlesWithColor === 'function') {
        const modeColors = {
            'light': '#27196f',
            'dark-night': '#7b633a',
            'dark-day': '#A94C4C'
        };
        restartParticlesWithColor(modeColors[mode] || '#A94C4C');
    }

    // Resetear sistema de sonidos y reasignar
    resetSoundSystem();
    setTimeout(() => {
        assignHoverSounds();
    }, 200);

    // Sincronizar radio
    if (radioPlayer && typeof radioPlayer.syncWithMode === 'function') {
        radioPlayer.syncWithMode();
    }

    // Pequeño retraso para que las imágenes nuevas se carguen
    setTimeout(checkContainerScaling, 150);
}

// ============================================
// SISTEMA DE SCALING
// ============================================
let scalingInterval = null;

function checkContainerScaling() {
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
    
    setTimeout(checkContainerScaling, 100);
    setTimeout(checkContainerScaling, 300);
    setTimeout(checkContainerScaling, 500);
    setTimeout(checkContainerScaling, 1000);
    
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(checkContainerScaling, 50);
    });
    
    window.addEventListener('orientationchange', function() {
        setTimeout(checkContainerScaling, 100);
    });
    
    if (scalingInterval) {
        clearInterval(scalingInterval);
    }
    scalingInterval = setInterval(checkContainerScaling, 500);
}

// ============================================
// MARQUEE - TEXTO ANIMADO EN LATERAL
// ============================================
let marqueeAnimation = null;
let marqueePosition = 0;

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
    
    let lastTime = 0;
    const pixelsPerSecond = 60; 
    
    function animate(currentTime) {
        if (!lastTime) {
            lastTime = currentTime;
            marqueeAnimation = requestAnimationFrame(animate);
            return;
        }
        
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        marqueePosition -= pixelsPerSecond * deltaTime;
        
        if (marqueePosition <= -content.scrollWidth / 2) {
            marqueePosition = 0;
        }
        
        content.style.transform = `translateX(${marqueePosition}px)`;
        marqueeAnimation = requestAnimationFrame(animate);
    }
    
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

    console.log(`Hora actual en GMT-3 (calculada): ${hourGMT3}`);

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

function updateSunColor() {
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) return;
    
    const svg = sunContainer.querySelector('svg');
    if (!svg) return;
    
    let color = '#ffffff';
    if (body.classList.contains('dark-night')) {
        color = '#7c643a';
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
    const sunContainer = document.getElementById('sun-icon');
    if (!sunContainer) {
        console.warn('No se encontró el contenedor del sol');
        return;
    }

    if (sunAnimation) {
        sunAnimation.destroy();
    }

    sunAnimation = lottie.loadAnimation({
        container: sunContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'icons8-sun.json'
    });

    sunAnimation.addEventListener('DOMLoaded', function() {
        updateSunColor();
    });
}

// ============================================
// SISTEMA DE SONIDOS HOVER
// ============================================
const hoverSounds = {
    'bubble': new Audio('sounds/bubble_sound.mp3'),
    'alien': new Audio('sounds/hoveralien.mp3'),
    'tiny': new Audio('sounds/tiny.mp3'),
    'click': new Audio('sounds/sounds_click7.wav')
};

const soundSystem = {
    lastSoundKey: null,
    lastElementId: null,
    lastPlayTime: 0,
    spamThreshold: 150
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
    
    const soundClone = sound.cloneNode();
    soundClone.volume = 0.3;
    
    soundSystem.lastSoundKey = soundKey;
    soundSystem.lastElementId = elementId;
    soundSystem.lastPlayTime = now;
    
    soundClone.play().catch(e => {
        console.log('Error al reproducir sonido:', e);
    });
}

function assignHoverSounds() {
    document.querySelectorAll('.bot-link-gif-link').forEach(el => {
        el.addEventListener('mouseenter', () => playHoverSound('bubble', el));
    });

    document.querySelectorAll('.profile-icon-container').forEach(el => {
        el.addEventListener('mouseenter', () => playHoverSound('alien', el));
    });

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

    document.querySelectorAll('#buttons button').forEach(el => {
        el.addEventListener('mouseenter', () => playHoverSound('click', el));
    });
}

function resetSoundSystem() {
    soundSystem.lastSoundKey = null;
    soundSystem.lastElementId = null;
    soundSystem.lastPlayTime = 0;
}

// ============================================
// RADIO PLAYER
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

    init: function() {
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

        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());

        this.showPlayButton();
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

        if (this.isPlaying) {
            this.audioElement.play().catch(e => console.log('Error al reproducir:', e));
        }
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
        
        // Actualizar indicador
        if (typeof updateFooterIndicator === 'function') {
            setTimeout(updateFooterIndicator, 50);
        }
    },

    pause: function() {
        this.isPlaying = false;
        document.body.classList.remove('radio-playing');
        this.showPlayButton();

        this.audioElement.pause();
        this.radioFreqAudio.pause();
        this.playSoundEffect('sounds/sounds_play.wav');
        
        // Actualizar indicador
        if (typeof updateFooterIndicator === 'function') {
            setTimeout(updateFooterIndicator, 50);
        }
    },

    nextSong: function() {
        this.loadSong(this.currentSongIndex + 1);
        this.playSoundEffect('sounds/sounds_next.wav');
    },

    prevSong: function() {
        this.loadSong(this.currentSongIndex - 1);
        this.playSoundEffect('sounds/sounds_next.wav');
    },

    playSoundEffect: function(soundPath) {
        const effect = new Audio(soundPath);
        effect.volume = 0.3;
        effect.play().catch(e => console.log('Error al reproducir efecto:', e));
    },

    syncWithMode: function() {
        if (this.isPlaying && this.cassetteImg) {
            this.cassetteImg.style.display = 'none';
            this.cassetteImg.offsetHeight;
            this.cassetteImg.style.display = 'block';
        }
    }
};

// ============================================
// INDICADOR DEL FOOTER
// ============================================
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
    
    // Detectar si debe mostrar cargando o alterar
    // Por ahora solo manejamos el estado de la radio
    if (document.body.classList.contains('radio-playing')) {
        imageName = 'alterar.gif';
    }
    
    indicator.src = getImagePath(imageName);
}

// ============================================
// PARTICLES.JS
// ============================================
(function() {
    'use strict';
    
    let particlesInstance = null;
    
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
                value: 0.5,
                random: true,
                anim: {
                    enable: false
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
    
    const modeColors = {
        'light': '#27196f',
        'dark-night': '#7b633a',
        'dark-day': '#A94C4C'
    };
    
    function initParticles() {
        if (!document.getElementById('particles-js')) {
            console.warn('⚠️ Contenedor #particles-js no encontrado');
            return;
        }
        
        try {
            particlesInstance = particlesJS('particles-js', particlesConfig);
            console.log('✅ Particles.js iniciado');
        } catch (error) {
            console.error('❌ Error al inicializar particles.js:', error);
        }
    }
    
    window.restartParticlesWithColor = function(newColor) {
        if (!document.getElementById('particles-js')) return;
        
        particlesConfig.particles.color.value = newColor;
        
        if (particlesInstance && typeof particlesInstance.destroy === 'function') {
            try {
                particlesInstance.destroy();
            } catch (e) {
                console.log('Error al destruir instancia anterior');
            }
        }
        
        try {
            particlesInstance = particlesJS('particles-js', particlesConfig);
            console.log('🔄 Partículas reiniciadas con color:', newColor);
        } catch (error) {
            console.error('Error al reiniciar particles.js:', error);
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
// INICIALIZACIÓN PRINCIPAL (UNA SOLA VEZ)
// ============================================
document.documentElement.style.overflow = 'hidden';
document.body.style.overflow = 'hidden';

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado, inicializando todo...');
    
    // --- MODO INICIAL SEGÚN HORA Y ALEATORIO ---
    const initialDualMode = getCurrentDualMode();
    const modes = ['light', initialDualMode];
    const randomIndex = Math.random() < 0.5 ? 0 : 1;
    const initialMode = modes[randomIndex];

    console.log(`Modo inicial elegido: ${initialMode}`);
    setMode(initialMode);

    // --- CONFIGURAR BOTONES (SOLO 2) ---
    const lightBtn = document.getElementById("light-btn");
    const darkDayBtn = document.getElementById("dark-day-btn");

    if (lightBtn) {
        lightBtn.addEventListener("click", () => {
            setMode("light");
        });
    }

    if (darkDayBtn) {
        darkDayBtn.addEventListener("click", () => {
            const modeToSet = getCurrentDualMode();
            setMode(modeToSet);
        });
    }

    // --- INICIALIZAR COMPONENTES ---
    createMarqueeText();
    initScaling();
    setTimeout(initSunIcon, 100);
    setTimeout(() => radioPlayer.init(), 200);
    assignHoverSounds();
    
    // Configurar indicador
    updateFooterIndicator();
    
    // Observar cambios en la clase del body para el indicador
    const observer = new MutationObserver(updateFooterIndicator);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
});

window.addEventListener('load', function() {
    console.log('✅ Página completamente cargada');
    checkContainerScaling();
    
    setTimeout(() => {
        restartMarqueeAnimation();
    }, 500);
});

// Pausar animaciones cuando la pestaña no está visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopMarqueeAnimation();
    } else {
        startMarqueeAnimation();
    }
});

console.log("✅ Perfil cargado. Modos disponibles: light y dual (dark-day/dark-night según hora)");
