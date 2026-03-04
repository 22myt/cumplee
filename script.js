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
            btn.src = currentMode === 'light' ? 
                btn.dataset.lightHover : btn.dataset.light;
        } else if (parentBtn.classList.contains('dark-mode-1-btn')) {
            btn.src = currentMode === 'dark1' ? 
                btn.dataset.dark1Hover : btn.dataset.dark1;
        } else if (parentBtn.classList.contains('dark-mode-2-btn')) {
            btn.src = currentMode === 'dark2' ? 
                btn.dataset.dark2Hover : btn.dataset.dark2;
        }
    });
}

// Efecto hover para los botones
document.querySelectorAll('.mode-btn').forEach(btn => {
    const img = btn.querySelector('img');
    const btnClass = btn.classList[1]; // light-mode-btn, dark-mode-1-btn, etc.
    
    btn.addEventListener('mouseenter', () => {
        if (btnClass === 'light-mode-btn' && img.dataset.lightHover) {
            img.src = img.dataset.lightHover;
        } else if (btnClass === 'dark-mode-1-btn' && img.dataset.dark1Hover) {
            img.src = img.dataset.dark1Hover;
        } else if (btnClass === 'dark-mode-2-btn' && img.dataset.dark2Hover) {
            img.src = img.dataset.dark2Hover;
        }
    });
    
    btn.addEventListener('mouseleave', () => {
        const currentMode = document.body.classList.contains('light-mode') ? 'light' :
                           document.body.classList.contains('dark-mode-2') ? 'dark2' : 'dark1';
        
        if (btnClass === 'light-mode-btn') {
            img.src = currentMode === 'light' ? img.dataset.lightHover : img.dataset.light;
        } else if (btnClass === 'dark-mode-1-btn') {
            img.src = currentMode === 'dark1' ? img.dataset.dark1Hover : img.dataset.dark1;
        } else if (btnClass === 'dark-mode-2-btn') {
            img.src = currentMode === 'dark2' ? img.dataset.dark2Hover : img.dataset.dark2;
        }
    });
});

// Cargar modo preferido al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const preferredMode = localStorage.getItem('preferred-mode') || 'dark1';
    setMode(preferredMode);
});
