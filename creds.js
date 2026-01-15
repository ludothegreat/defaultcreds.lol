// creds.js - handles faux address bar, credential randomization, and dropdown history

let defaultCreds = [];

async function fetchCreds() {
  try {
    const response = await fetch('creds.json');
    if (!response.ok) {
      throw new Error('Failed to fetch credentials');
    }
    defaultCreds = await response.json();
    return defaultCreds;
  } catch (error) {
    console.error(error);
    return [{ user: "admin", pass: "password" }];
  }
}

function randomCred() {
  return defaultCreds[Math.floor(Math.random() * defaultCreds.length)];
}

function renderCredsHistory() {
  const historyDiv = document.getElementById('creds-history');
  if (!historyDiv) return;

  historyDiv.innerHTML = '';
  defaultCreds.forEach(cred => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.tabIndex = 0;
    item.innerHTML = `<span class="url-protocol">https://</span>` +
      `<span class="url-creds">${cred.user}:<span class="url-password">${cred.pass}</span>@</span>` +
      `<span class="url-host">defaultcreds.lol</span>`;
    historyDiv.appendChild(item);
  });
}

function setFauxUrlCred(cred) {
  const credsSpan = document.querySelector('.faux-url .url-creds');
  if (credsSpan) {
    credsSpan.innerHTML = `${cred.user}:<span class="url-password">${cred.pass}</span>@`;
  }
  const fauxUrl = document.getElementById('faux-url');
  if (fauxUrl) {
    const desc = `Site logo: ${cred.user}:${cred.pass}@defaultcreds.lol`;
    fauxUrl.setAttribute('aria-label', desc);
    fauxUrl.setAttribute('title', desc);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await fetchCreds();

  // Randomize main header on load
  const cred = randomCred();
  setFauxUrlCred(cred);

  // Dropdown interaction
  const fauxUrl = document.getElementById('faux-url');
  const credsHistory = document.getElementById('creds-history');

  if (fauxUrl && credsHistory) {
    fauxUrl.style.cursor = 'pointer';
    let open = false;

    function closeDropdown() {
      credsHistory.hidden = true;
      open = false;
    }

    function openDropdown() {
      credsHistory.hidden = false;
      renderCredsHistory();

      // Sync dropdown position with faux-url
      const rect = fauxUrl.getBoundingClientRect();
      const header = fauxUrl.closest('.site-header');
      if (header) {
        const headerRect = header.getBoundingClientRect();
        credsHistory.style.width = `${rect.width}px`;
        credsHistory.style.left = `${rect.left}px`;
        credsHistory.style.transform = 'none';
      }
      open = true;
    }

    fauxUrl.addEventListener('click', e => {
      e.stopPropagation();
      if (open) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    // Event delegation: handle clicks on history items
    credsHistory.addEventListener('click', (e) => {
      const item = e.target.closest('.history-item');
      if (item) {
        const idx = Array.from(credsHistory.children).indexOf(item);
        if (idx >= 0) {
          setFauxUrlCred(defaultCreds[idx]);
        }
        closeDropdown();
      }
    });

    // Hide on click outside
    document.addEventListener('click', (e) => {
      if (open && !fauxUrl.contains(e.target) && !credsHistory.contains(e.target)) {
        closeDropdown();
      }
    });

    // Hide on escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) {
        closeDropdown();
      }
    });
  }
});
