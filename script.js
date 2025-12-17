// ====================
// DARK / LIGHT THEME
// ====================

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const body = document.body;
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  };

  const updateToggleUI = (theme) => {
    if (!toggle) return;
    const nextTheme = theme === "dark" ? "light" : "dark";
    toggle.textContent = theme === "dark" ? "☀️" : "🌙";
    toggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    toggle.setAttribute("aria-pressed", theme === "light");
  };

  const applyTheme = (theme) => {
    body.classList.remove("dark", "light");
    body.classList.add(theme);
    localStorage.setItem("theme", theme);
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#0b1220" : "#f8fafc");
    }
    updateToggleUI(theme);
  };

  applyTheme(getPreferredTheme());

  toggle?.addEventListener("click", () => {
    const nextTheme = body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
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
