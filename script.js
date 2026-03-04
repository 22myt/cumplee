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

// Mensaje de confirmación
console.log("✅ Perfil cargado. Modos disponibles: light, dark-day, dark-night");
