// script.js
function setMode(mode) {
    // Remover clases de modo anteriores
    document.body.classList.remove('light-mode', 'dark-mode-1', 'dark-mode-2');
    
    // Añadir la nueva clase de modo
    document.body.classList.add(mode + '-mode');
    
    // Actualizar imágenes de los botones según el modo actual
    updateButtonImages(mode);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('preferred-mode', mode);
}

function updateButtonImages(currentMode) {
    const buttons = document.querySelectorAll('.mode-btn img');
    
    buttons.forEach(btn => {
        const parentBtn = btn.closest('.mode-btn');
        
        if (parentBtn.classList.contains('light-mode-btn')) {
            // Para el botón de light mode
            if (currentMode === 'light') {
                btn.src = btn.dataset.lightHover;
            } else {
                btn.src = btn.dataset.light;
            }
        } else if (parentBtn.classList.contains('dark-mode-1-btn')) {
            // Para el botón de dark mode 1
            if (currentMode === 'dark1') {
                btn.src = btn.dataset.dark1Hover;
            } else {
                btn.src = btn.dataset.dark1;
            }
        } else if (parentBtn.classList.contains('dark-mode-2-btn')) {
            // Para el botón de dark mode 2
            if (currentMode === 'dark2') {
                btn.src = btn.dataset.dark2Hover;
            } else {
                btn.src = btn.dataset.dark2;
            }
        }
    });
}

// Efecto hover para los botones
document.querySelectorAll('.mode-btn').forEach(btn => {
    const img = btn.querySelector('img');
    
    btn.addEventListener('mouseenter', () => {
        const currentMode = document.body.classList.contains('light-mode') ? 'light' :
                           document.body.classList.contains('dark-mode-2') ? 'dark2' : 'dark1';
        
        if (btn.classList.contains('light-mode-btn')) {
            img.src = img.dataset.lightHover;
        } else if (btn.classList.contains('dark-mode-1-btn')) {
            img.src = img.dataset.dark1Hover;
        } else if (btn.classList.contains('dark-mode-2-btn')) {
            img.src = img.dataset.dark2Hover;
        }
    });
    
    btn.addEventListener('mouseleave', () => {
        const currentMode = document.body.classList.contains('light-mode') ? 'light' :
                           document.body.classList.contains('dark-mode-2') ? 'dark2' : 'dark1';
        
        if (btn.classList.contains('light-mode-btn')) {
            img.src = currentMode === 'light' ? img.dataset.lightHover : img.dataset.light;
        } else if (btn.classList.contains('dark-mode-1-btn')) {
            img.src = currentMode === 'dark1' ? img.dataset.dark1Hover : img.dataset.dark1;
        } else if (btn.classList.contains('dark-mode-2-btn')) {
            img.src = currentMode === 'dark2' ? img.dataset.dark2Hover : img.dataset.dark2;
        }
    });
});

// Cargar modo preferido al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const preferredMode = localStorage.getItem('preferred-mode') || 'dark1';
    setMode(preferredMode);
});
