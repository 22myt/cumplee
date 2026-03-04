document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const lightModeBtn = document.getElementById('mode-light');
    const darkMode1Btn = document.getElementById('mode-dark1');
    const darkMode2Btn = document.getElementById('mode-dark2');

    function setMode(mode) {
        body.classList.remove('light-mode', 'dark-mode-1', 'dark-mode-2');
        body.classList.add(mode);
        console.log('Modo activado:', mode);
    }

    lightModeBtn.addEventListener('click', () => setMode('light-mode'));
    darkMode1Btn.addEventListener('click', () => setMode('dark-mode-1'));
    darkMode2Btn.addEventListener('click', () => setMode('dark-mode-2'));
});
