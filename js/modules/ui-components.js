// ui-components.js - UI component initialization

export function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const sidebarPinBtn = document.getElementById('sidebar-pin');
  const hoverTrigger = document.querySelector('.sidebar-hover-trigger');
  const appLayout = document.querySelector('.app-layout');

  if (!sidebar || !sidebarPinBtn || !hoverTrigger || !appLayout) return;

  // Load pinned state
  const isPinned = localStorage.getItem('sidebarPinned') === 'true';

  // Set initial state
  if (isPinned) {
    sidebar.classList.add('pinned');
    appLayout.classList.add('sidebar-pinned');
    hoverTrigger.style.display = 'none';
  }

  // Pin/unpin handler
  sidebarPinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentlyPinned = sidebar.classList.contains('pinned');

    if (currentlyPinned) {
      sidebar.classList.remove('pinned');
      appLayout.classList.remove('sidebar-pinned');
      hoverTrigger.style.display = '';
      localStorage.setItem('sidebarPinned', 'false');
    } else {
      sidebar.classList.add('pinned');
      appLayout.classList.add('sidebar-pinned');
      hoverTrigger.style.display = 'none';
      localStorage.setItem('sidebarPinned', 'true');
    }
  });

  // Hover behavior - show sidebar on hover of trigger or sidebar itself
  // Delays: time to hover before opening, time to stay open after leaving
  const SHOW_DELAY = 300; // ms - how long to hover before sidebar opens
  const HIDE_DELAY = 750; // ms - how long sidebar stays open after mouse leaves
  
  let showTimeout;
  let hideTimeout;
  
  function showSidebar() {
    if (!sidebar.classList.contains('pinned')) {
      clearTimeout(hideTimeout); // Cancel any pending hide
      clearTimeout(showTimeout); // Cancel any pending show (in case of rapid hover/unhover)
      
      // Delay before showing
      showTimeout = setTimeout(() => {
        sidebar.style.transform = 'translateX(0)';
      }, SHOW_DELAY);
    }
  }

  function hideSidebar() {
    if (!sidebar.classList.contains('pinned')) {
      clearTimeout(showTimeout); // Cancel any pending show
      clearTimeout(hideTimeout); // Cancel any pending hide
      
      // Delay before hiding
      hideTimeout = setTimeout(() => {
        sidebar.style.transform = 'translateX(-100%)';
      }, HIDE_DELAY);
    }
  }

  hoverTrigger.addEventListener('mouseenter', showSidebar);
  sidebar.addEventListener('mouseenter', showSidebar);
  hoverTrigger.addEventListener('mouseleave', hideSidebar);
  sidebar.addEventListener('mouseleave', hideSidebar);
}
