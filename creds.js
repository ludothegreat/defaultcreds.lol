// creds.js - handles faux address bar, credential randomization, and dropdown history

let defaultCreds = [];
let currentHistoryOrder = []; // Track the current shuffled order

async function fetchCreds() {
  try {
    const response = await fetch('creds.json');
    if (!response.ok) {
      throw new Error('Failed to fetch credentials');
    }
    defaultCreds = await response.json();
    if (!Array.isArray(defaultCreds) || defaultCreds.length === 0) {
      throw new Error('Invalid credentials data');
    }
    return defaultCreds;
  } catch (error) {
    console.warn('Failed to load creds.json, using fallback:', error);
    // Fallback credentials
    defaultCreds = [
      { user: "admin", pass: "admin" },
      { user: "admin", pass: "password" },
      { user: "admin", pass: "1234" },
      { user: "root", pass: "root" },
      { user: "root", pass: "admin" },
      { user: "user", pass: "user" },
      { user: "guest", pass: "guest" }
    ];
    return defaultCreds;
  }
}

function randomCred() {
  if (!defaultCreds || defaultCreds.length === 0) {
    return { user: "admin", pass: "password" };
  }
  return defaultCreds[Math.floor(Math.random() * defaultCreds.length)];
}

function getRandomTime() {
  // Generate random "visit time" - within last 30 days
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  if (daysAgo === 0) {
    if (hoursAgo === 0) {
      return `${minutesAgo}m ago`;
    }
    return `${hoursAgo}h ago`;
  }
  return `${daysAgo}d ago`;
}

function renderCredsHistory() {
  const historyDiv = document.getElementById('creds-history');
  if (!historyDiv) return;

  if (!defaultCreds || defaultCreds.length === 0) {
    console.error('No credentials available to render');
    return;
  }

  historyDiv.innerHTML = '';
  
  // Shuffle credentials for random "history" order
  currentHistoryOrder = [...defaultCreds].filter(c => c && c.user && c.pass).sort(() => Math.random() - 0.5);
  
  if (currentHistoryOrder.length === 0) {
    console.error('No valid credentials after filtering');
    return;
  }
  
  currentHistoryOrder.forEach((cred, index) => {
    if (!cred || !cred.user || !cred.pass) return;
    
    const item = document.createElement('div');
    item.className = 'history-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('data-index', index);
    
    const time = getRandomTime();
    
    item.innerHTML = `
      <svg class="history-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <div class="history-item-content">
        <span class="url-protocol">https://</span>
        <span class="url-creds">${cred.user}:<span class="url-password">${cred.pass}</span>@</span>
        <span class="url-host">defaultcreds.lol</span>
      </div>
      <span class="history-item-time">${time}</span>
    `;
    
    historyDiv.appendChild(item);
  });
}

function setFauxUrlCred(cred) {
  if (!cred || !cred.user || !cred.pass) {
    console.error('Invalid credential:', cred);
    return;
  }
  const credsSpan = document.querySelector('.faux-url .url-creds');
  if (credsSpan) {
    credsSpan.innerHTML = `${cred.user}:<span class="url-password">${cred.pass}</span>@`;
  }
  const fauxUrl = document.getElementById('faux-url');
  if (fauxUrl) {
    const desc = `Address bar: ${cred.user}:${cred.pass}@defaultcreds.lol`;
    fauxUrl.setAttribute('aria-label', desc);
    fauxUrl.setAttribute('title', desc);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await fetchCreds();

  // Randomize main header on load
  const cred = randomCred();
  if (cred && cred.user && cred.pass) {
    setFauxUrlCred(cred);
  } else {
    // Ultimate fallback
    setFauxUrlCred({ user: "admin", pass: "password" });
  }

  // Dropdown interaction
  const fauxUrl = document.getElementById('faux-url');
  const credsHistory = document.getElementById('creds-history');

  if (!fauxUrl || !credsHistory) return;

  fauxUrl.style.cursor = 'pointer';
  let open = false;

  function closeDropdown() {
    credsHistory.setAttribute('hidden', '');
    credsHistory.style.display = 'none';
    credsHistory.style.visibility = 'hidden';
    fauxUrl.setAttribute('aria-expanded', 'false');
    open = false;
  }

  function openDropdown() {
    console.log('openDropdown called');
    renderCredsHistory();
    credsHistory.removeAttribute('hidden');
    credsHistory.style.display = 'block';
    credsHistory.style.visibility = 'visible';
    fauxUrl.setAttribute('aria-expanded', 'true');
    open = true;
    console.log('Dropdown state - hidden attr:', credsHistory.hasAttribute('hidden'), 'display:', credsHistory.style.display, 'computed:', window.getComputedStyle(credsHistory).display);
  }

  // Click handler - test if it fires
  fauxUrl.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Address bar clicked, current state open:', open);
    if (open) {
      console.log('Closing dropdown');
      closeDropdown();
    } else {
      console.log('Opening dropdown');
      openDropdown();
      console.log('After openDropdown - hidden:', credsHistory.hidden, 'display:', credsHistory.style.display, 'computed display:', window.getComputedStyle(credsHistory).display);
    }
  }, false);

  // Also handle Enter/Space keys for accessibility
  fauxUrl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }
  });

  // Event delegation: handle clicks on history items
  credsHistory.addEventListener('click', function(e) {
    const item = e.target.closest('.history-item');
    if (item) {
      const dataIndex = parseInt(item.getAttribute('data-index'), 10);
      if (!isNaN(dataIndex) && dataIndex >= 0 && dataIndex < currentHistoryOrder.length) {
        const cred = currentHistoryOrder[dataIndex];
        setFauxUrlCred(cred);
      }
      closeDropdown();
    }
  });

  // Handle keyboard navigation in history
  credsHistory.addEventListener('keydown', function(e) {
    const item = e.target.closest('.history-item');
    if (item && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      item.click();
    }
  });

  // Hide on click outside - use setTimeout to avoid immediate close
  document.addEventListener('click', function(e) {
    if (open && !fauxUrl.contains(e.target) && !credsHistory.contains(e.target)) {
      setTimeout(function() {
        if (open && !fauxUrl.contains(e.target) && !credsHistory.contains(e.target)) {
          closeDropdown();
        }
      }, 10);
    }
  });

  // Hide on escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && open) {
      closeDropdown();
    }
  });
});
