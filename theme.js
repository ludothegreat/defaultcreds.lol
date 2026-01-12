// theme.js - handles dark/light mode toggle for defaultcreds.lol

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Set initial button icon based on current state
  const isDark = document.documentElement.classList.contains('dark');
  btn.textContent = isDark ? '☀️' : '🌙';

  // On click, flip theme + icon + store choice:
  btn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    btn.textContent = dark ? '☀️' : '🌙';
  });
});
