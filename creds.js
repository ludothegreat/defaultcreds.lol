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
    // Fallback to a default credential if fetch fails
    return [{ user: "admin", pass: "password" }];
  }
}

function randomCred() {
  return defaultCreds[Math.floor(Math.random() * defaultCreds.length)];
}

function renderCredsHistory() {
  const historyDiv = document.getElementById('creds-history');
  historyDiv.innerHTML = '';
  defaultCreds.forEach(cred => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.tabIndex = 0;
    item.innerHTML = `<span class="protocol">https://</span>` +
      `<span class="creds">${cred.user}:<span class="password">${cred.pass}</span>@</span>` +
      `<span class="host">defaultcreds.lol</span>`;
    historyDiv.appendChild(item);
  });
}

function setFauxUrlCred(cred) {
  const credsSpan = document.querySelector('.faux-url .creds');
  if (credsSpan) {
    credsSpan.innerHTML = `${cred.user}:<span class="password">${cred.pass}</span>@`;
  }
  const fauxUrl = document.getElementById('faux-url');
  if (fauxUrl) {
    const desc = `Site logo: example of default credentials in a URL bar, ${cred.user}:${cred.pass}@defaultcreds.lol`;
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
      // Sync dropdown width and position with faux-url
      const fauxUrl = document.getElementById('faux-url');
      if (fauxUrl && credsHistory) {
        const rect = fauxUrl.getBoundingClientRect();
        const parentRect = credsHistory.offsetParent
          ? credsHistory.offsetParent.getBoundingClientRect()
          : { left: 0 };
        const matchMobile = window.matchMedia('(max-width: 600px)').matches;
        const widthAdjustment = matchMobile ? 0 : -2;
        credsHistory.style.width = `${rect.width + widthAdjustment}px`;
        const offsetAdjustment = matchMobile ? 0 : 4;
        const relativeLeft = rect.left - parentRect.left + offsetAdjustment;
        credsHistory.style.left = `${relativeLeft}px`;
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
        // Find which credential this is by index
        const idx = Array.from(credsHistory.children).indexOf(item);
        if (idx >= 0) {
          setFauxUrlCred(defaultCreds[idx]);
        }
        closeDropdown();
      }
    });

    // Hide on click outside
    document.addEventListener('click', (e) => {
      if (
        open &&
        !fauxUrl.contains(e.target) &&
        !credsHistory.contains(e.target)
      ) {
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
