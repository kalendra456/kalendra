// Theme toggle
const themeBtn = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const saved = localStorage.getItem('theme');
function applyTheme(mode){
  document.body.classList.toggle('dark', mode !== 'light');
  document.body.classList.toggle('light', mode === 'light');
  localStorage.setItem('theme', mode);
}
applyTheme(saved || (prefersDark.matches ? 'dark' : 'light'));
themeBtn?.addEventListener('click', ()=>{
  const now = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(now);
});

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll reveal
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
},{ threshold:.12 });
document.querySelectorAll('.section, .card, .item, .proj').forEach(el=>{
  el.classList.add('reveal'); observer.observe(el);
});

// Smooth nav close on hash click (placeholder for mobile)
document.querySelectorAll('.nav a[href^="#"]').forEach(a=>{
  a.addEventListener('click', ()=>{/* close mobile menu if you add one */});
});
