// ====================
// DARK / LIGHT THEME
// ====================

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const body = document.body;

  // Load saved theme if any
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    body.classList.remove("dark", "light");
    body.classList.add(savedTheme);
  }

  // Toggle event
  toggle.addEventListener("click", () => {
    const isDark = body.classList.contains("dark");
    body.classList.toggle("dark", !isDark);
    body.classList.toggle("light", isDark);

    // Save preference
    localStorage.setItem("theme", isDark ? "light" : "dark");
  });
});

// ====================
// Dynamic Year in Footer
// ====================
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

// ====================
// Smooth scrolling (optional enhancement)
// ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
