const body = document.body;
const lightBtn = document.getElementById("light-btn");
const darkDayBtn = document.getElementById("dark-day-btn");
const darkNightBtn = document.getElementById("dark-night-btn");

lightBtn.addEventListener("click", () => {
  body.className = "light";
});

darkDayBtn.addEventListener("click", () => {
  body.className = "dark-day";
});

darkNightBtn.addEventListener("click", () => {
  body.className = "dark-night";
});


///ssssssssssssssssssssssssssssssssssssssss///

function handleContainerScaling() {
    const container = document.querySelector('.container');
    const body = document.body;
    
    let wrapper = document.querySelector('.container-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'container-wrapper';
        container.parentNode.insertBefore(wrapper, container);
        wrapper.appendChild(container);
        
        const style = document.createElement('style');
        style.textContent = `
            .container-wrapper {
                width: 100%;
                height: 100vh;
                overflow: hidden;
                position: relative;
            }
            .container.scaled {
                transform-origin: top center;
                margin: 0 auto;
            }
        `;
        document.head.appendChild(style);
    }
    
    function checkAndFreezeScaling() {
        const containerHeight = container.scrollHeight;
        const viewportHeight = window.innerHeight;
        const isOverflowing = containerHeight > viewportHeight;
        
        console.log(`Container: ${containerHeight}px, Viewport: ${viewportHeight}px, Overflow: ${isOverflowing}`);
        
        if (isOverflowing) {
            // Congelar el tamaño - calcular la escala máxima permitida
            const scaleFactor = viewportHeight / containerHeight;
            
            // Aplicar transform scale para limitar el tamaño
            container.style.zoom = 'unset';
            container.style.transform = `scale(${scaleFactor})`;
            container.classList.add('scaled');
            
            console.log(`Scaling container to: ${scaleFactor}`);
        } else {
            // Restaurar zoom normal si no hay overflow
            container.style.transform = 'none';
            container.style.zoom = '1.0';
            container.classList.remove('scaled');
        }
    }
    
    // Suavizar las transiciones
    container.style.transition = 'transform 0.1s ease';
    
    // Verificar en resize con debounce para evitar saltos
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(checkAndFreezeScaling, 50);
    });
    
    window.addEventListener('orientationchange', function() {
        setTimeout(checkAndFreezeScaling, 100);
    });
    
    setTimeout(checkAndFreezeScaling, 100);
    
    setInterval(checkAndFreezeScaling, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    
    setTimeout(handleContainerScaling, 200);
});

window.addEventListener('load', handleContainerScaling);
