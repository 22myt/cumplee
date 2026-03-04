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
