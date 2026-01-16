// animations.js - Loading skeleton animations and glitch effects

import { getMessageData, loadMessageData } from './rss-fetcher.js';

export function glitchText(text, intensity = 0.1) {
  const glitchChars = '█▓▒░▄▀▌▐║╗╝╚╔╩╦╠═╬0123456789!@#$%^&*';
  let glitched = '';
  for (let i = 0; i < text.length; i++) {
    if (Math.random() < intensity) {
      glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
    } else {
      glitched += text[i];
    }
  }
  return glitched;
}

export function animateSkeletonPassword(passwordInput, messageType, delay = 0) {
  if (!passwordInput) return;
  
  // Get the data list for this message type
  const dataList = getMessageData(messageType);
  
  if (!dataList || dataList.length === 0) {
    // If data not loaded yet, try to load it and retry
    loadMessageData(messageType).then(() => {
      animateSkeletonPassword(passwordInput, messageType, delay);
    });
    return;
  }
  
  // Each skeleton gets completely different timing
  let i = Math.floor(Math.random() * dataList.length);
  const baseSpeed = 120 + Math.random() * 180; // 120-300ms per password (wider range)
  let currentSpeed = baseSpeed;
  
  // Random initial delay - much more varied
  const initialDelay = delay + Math.random() * 800;
  
  setTimeout(() => {
    const updatePassword = () => {
      if (passwordInput.parentElement && passwordInput.parentElement.closest('.skeleton-article')) {
        passwordInput.value = dataList[i];
        i = (i + 1) % dataList.length;
        
        // Occasionally vary the speed for more independence
        if (Math.random() < 0.1) {
          currentSpeed = baseSpeed + (Math.random() * 100 - 50); // ±50ms variation
        }
        
        setTimeout(updatePassword, currentSpeed);
      }
    };
    
    updatePassword();
  }, initialDelay);
}

export function applyGlitchEffects(section) {
  const skeletons = section.querySelectorAll('.skeleton-article');
  skeletons.forEach((skeleton, index) => {
    const commandEl = skeleton.querySelector('.skeleton-command');
    const progressTextEl = skeleton.querySelector('.skeleton-progress-text');
    const metaTextEl = skeleton.querySelector('.skeleton-meta-text');
    const passwordInput = skeleton.querySelector('.skeleton-password-input');
    const progressBar = skeleton.querySelector('.skeleton-progress-bar');
    
    // Each skeleton gets completely independent timing - use index-based randomization
    // This ensures each skeleton has different behavior
    const baseRandom = () => Math.random();
    const indexOffset = index * 0.3; // Offset based on index
    
    // Animation timing constants (extracted from magic numbers)
    const ANIMATION_DELAYS = {
      COMMAND_MAX_DELAY: 600,           // Max initial delay for command glitch (ms)
      COMMAND_GLITCH_MIN: 30,           // Min timeout for command glitch reset (ms)
      COMMAND_GLITCH_MAX: 170,          // Max timeout for command glitch reset (ms)
      PROGRESS_TEXT_DELAY_MAX: 800,     // Max delay for progress text animation (ms)
      PROGRESS_TEXT_RESET_MIN: 40,      // Min timeout for progress text reset (ms)
      PROGRESS_TEXT_RESET_MAX: 140      // Max timeout for progress text reset (ms)
    };
    
    const ANIMATION_PROBABILITIES = {
      COMMAND_BASE: 0.25,               // Base probability for command glitch
      COMMAND_INDEX_MULTIPLIER: 0.1,    // Probability increase per index
      PROGRESS_BASE: 0.2,               // Base probability for progress text glitch
      PROGRESS_INDEX_MULTIPLIER: 0.08   // Probability increase per index
    };
    
    const GLITCH_INTENSITY = {
      COMMAND_MIN: 0.1,                 // Min glitch intensity for commands
      COMMAND_MAX: 0.2,                 // Max glitch intensity for commands
      PROGRESS_MIN: 0.15,               // Min glitch intensity for progress text
      PROGRESS_MAX: 0.2                 // Max glitch intensity for progress text
    };
    
    // Animate password for this skeleton with much more varied delay
    if (passwordInput) {
      const messageType = skeleton.dataset.messageType || '[>] Cracking password...';
      const passwordDelay = index * 400 + baseRandom() * 1200; // Much wider range: 0-3600ms
      animateSkeletonPassword(passwordInput, messageType, passwordDelay);
    }
    
    // Independent progress bar animation - each progresses at different rate
    if (progressBar) {
      const initialWidth = parseFloat(progressBar.style.width) || (10 + baseRandom() * 40);
      let currentWidth = initialWidth;
      const progressSpeed = 600 + baseRandom() * 2400; // 600-3000ms per update (very varied)
      const progressIncrement = 0.3 + baseRandom() * 2.7; // 0.3-3% per update
      
      const animateProgress = () => {
        if (skeleton.parentElement && currentWidth < 100) {
          currentWidth += progressIncrement;
          if (currentWidth > 100) currentWidth = 100;
          progressBar.style.width = currentWidth + '%';
          
          // Update progress text
          if (progressTextEl) {
            progressTextEl.textContent = Math.floor(currentWidth) + '%';
            progressTextEl.dataset.original = Math.floor(currentWidth) + '%';
          }
          
          // Variable delay for next update
          const nextDelay = progressSpeed + (baseRandom() * 600 - 300); // ±300ms variation
          setTimeout(animateProgress, nextDelay);
        }
      };
      
      // Start at different times
      setTimeout(animateProgress, baseRandom() * 800);
    }
    
    // Add random screen flicker to entire skeleton - independent timing
    const flickerInterval = 200 + baseRandom() * 1800; // 200-2000ms (very varied)
    const flickerDelay = baseRandom() * 1000; // Initial delay 0-1000ms
    setTimeout(() => {
      setInterval(() => {
        if (baseRandom() < 0.1 + indexOffset * 0.05) { // 10-25% chance (varies by index)
          skeleton.style.filter = 'brightness(' + (1.2 + baseRandom() * 0.5) + ') contrast(' + (1.1 + baseRandom() * 0.4) + ')';
          skeleton.style.transform = 'translateX(' + ((baseRandom() * 5 - 2.5)) + 'px) translateY(' + ((baseRandom() * 3 - 1.5)) + 'px)';
          setTimeout(() => {
            skeleton.style.filter = '';
            skeleton.style.transform = '';
          }, 20 + baseRandom() * 150);
        }
      }, flickerInterval);
    }, flickerDelay);
    
    if (commandEl) {
      const original = commandEl.dataset.original || commandEl.textContent;
      const commandInterval = 250 + baseRandom() * 1500; // 250-1750ms
      const commandDelay = baseRandom() * ANIMATION_DELAYS.COMMAND_MAX_DELAY;
      setTimeout(() => {
        setInterval(() => {
          const glitchProbability = ANIMATION_PROBABILITIES.COMMAND_BASE + indexOffset * ANIMATION_PROBABILITIES.COMMAND_INDEX_MULTIPLIER;
          if (baseRandom() < glitchProbability) {
            const glitchIntensity = GLITCH_INTENSITY.COMMAND_MIN + baseRandom() * (GLITCH_INTENSITY.COMMAND_MAX - GLITCH_INTENSITY.COMMAND_MIN);
            commandEl.textContent = glitchText(original, glitchIntensity);
            commandEl.style.color = ['var(--color-error)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-success)'][Math.floor(baseRandom() * 4)];
            const resetDelay = ANIMATION_DELAYS.COMMAND_GLITCH_MIN + baseRandom() * (ANIMATION_DELAYS.COMMAND_GLITCH_MAX - ANIMATION_DELAYS.COMMAND_GLITCH_MIN);
            setTimeout(() => {
              commandEl.textContent = original;
              commandEl.style.color = '';
            }, resetDelay);
          }
        }, commandInterval);
      }, commandDelay);
    }
    
    if (progressTextEl) {
      const original = progressTextEl.dataset.original || progressTextEl.textContent;
      const progressTextInterval = 400 + baseRandom() * 2000; // 400-2400ms
      const progressTextDelay = baseRandom() * ANIMATION_DELAYS.PROGRESS_TEXT_DELAY_MAX;
      setTimeout(() => {
        setInterval(() => {
          const glitchProbability = ANIMATION_PROBABILITIES.PROGRESS_BASE + indexOffset * ANIMATION_PROBABILITIES.PROGRESS_INDEX_MULTIPLIER;
          if (baseRandom() < glitchProbability) {
            const glitchIntensity = GLITCH_INTENSITY.PROGRESS_MIN + baseRandom() * (GLITCH_INTENSITY.PROGRESS_MAX - GLITCH_INTENSITY.PROGRESS_MIN);
            progressTextEl.textContent = glitchText(original, glitchIntensity);
            progressTextEl.style.transform = 'translateX(' + ((baseRandom() * 4 - 2)) + 'px)';
            const resetDelay = ANIMATION_DELAYS.PROGRESS_TEXT_RESET_MIN + baseRandom() * (ANIMATION_DELAYS.PROGRESS_TEXT_RESET_MAX - ANIMATION_DELAYS.PROGRESS_TEXT_RESET_MIN);
            setTimeout(() => {
              progressTextEl.textContent = original;
              progressTextEl.style.transform = '';
            }, resetDelay);
          }
        }, progressTextInterval);
      }, progressTextDelay);
    }
    
    if (metaTextEl) {
      const original = metaTextEl.dataset.original || metaTextEl.textContent;
      const metaInterval = 500 + baseRandom() * 2200; // 500-2700ms
      const metaDelay = baseRandom() * 1000;
      setTimeout(() => {
        setInterval(() => {
          if (baseRandom() < 0.15 + indexOffset * 0.1) { // 15-45% chance
            metaTextEl.textContent = glitchText(original, 0.08 + baseRandom() * 0.15);
            metaTextEl.style.filter = 'hue-rotate(' + ((baseRandom() * 90 - 45)) + 'deg)';
            setTimeout(() => {
              metaTextEl.textContent = original;
              metaTextEl.style.filter = '';
            }, 50 + baseRandom() * 180);
          }
        }, metaInterval);
      }, metaDelay);
    }
    
    // Random color flash on progress bar - independent timing
    if (progressBar) {
      const flashInterval = 600 + baseRandom() * 2400; // 600-3000ms
      const flashDelay = baseRandom() * 1200;
      setTimeout(() => {
        setInterval(() => {
          if (baseRandom() < 0.12 + indexOffset * 0.06) { // 12-30% chance
            const colors = [
              '0 0 12px var(--color-error), 0 0 20px var(--color-warning)',
              '0 0 8px var(--color-accent), 0 0 16px var(--color-success)',
              '0 0 10px var(--color-warning), 0 0 18px var(--color-error)',
              '0 0 6px var(--color-success), 0 0 14px var(--color-accent)'
            ];
            progressBar.style.boxShadow = colors[Math.floor(baseRandom() * colors.length)];
            progressBar.style.filter = 'brightness(' + (1.2 + baseRandom() * 0.5) + ')';
            setTimeout(() => {
              progressBar.style.boxShadow = '';
              progressBar.style.filter = '';
            }, 60 + baseRandom() * 240);
          }
        }, flashInterval);
      }, flashDelay);
    }
    
    // Glitch the password input occasionally - independent timing
    if (passwordInput) {
      const passwordGlitchInterval = 400 + baseRandom() * 2000; // 400-2400ms
      const passwordGlitchDelay = baseRandom() * 900;
      setTimeout(() => {
        setInterval(() => {
          if (baseRandom() < 0.15 + indexOffset * 0.08) { // 15-39% chance
            const original = passwordInput.value;
            passwordInput.value = glitchText(original, 0.2 + baseRandom() * 0.2);
            passwordInput.style.color = ['var(--color-error)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-success)'][Math.floor(baseRandom() * 4)];
            setTimeout(() => {
              passwordInput.value = original;
              passwordInput.style.color = '';
            }, 50 + baseRandom() * 150);
          }
        }, passwordGlitchInterval);
      }, passwordGlitchDelay);
    }
  });
}

export function createSkeletonArticles(count = 3) {
  const fragment = document.createDocumentFragment();

  const hackMessages = [
    '[>] Cracking password...',
    '[>] Brute forcing credentials...',
    '[>] Testing password hash...',
    '[>] Decrypting credentials...',
    '[>] Bypassing authentication...',
    '[>] Exploiting default creds...',
    '[>] Scanning for weak passwords...',
    '[>] Injecting credential payload...'
  ];

  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-article';
    // Each skeleton gets a different message
    const messageIndex = (i + Math.floor(Math.random() * hackMessages.length)) % hackMessages.length;
    const message = hackMessages[messageIndex];
    // More varied starting progress - some start very low, some higher
    const progressWidth = 5 + Math.random() * 75; // Random progress 5-80% (wider range)
    const glitchIntensity = Math.random() * 0.3 + 0.1; // 0.1 to 0.4
    const skeletonId = 'skeleton-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 5);
    
    skeleton.innerHTML = `
      <div class="skeleton-header">
        <span class="skeleton-prompt">$</span>
        <span class="skeleton-command" data-original="${message}">${message}</span>
        <span class="skeleton-glitch-overlay"></span>
      </div>
      <div class="skeleton-progress">
        <div class="skeleton-progress-bar" style="width: ${progressWidth}%">
          <span class="skeleton-progress-glitch"></span>
        </div>
        <span class="skeleton-progress-text" data-original="${Math.floor(progressWidth)}%">${Math.floor(progressWidth)}%</span>
      </div>
      <div class="skeleton-password-line">
        <span class="skeleton-password-label">Trying:</span>
        <input type="text" class="skeleton-password-input" id="${skeletonId}-password" readonly tabindex="-1" />
      </div>
      <div class="skeleton-meta-line">
        <span class="skeleton-meta-text" data-original="[${String.fromCharCode(65 + i)}] Processing...">[${String.fromCharCode(65 + i)}] Processing...</span>
      </div>
    `;
    
    // Add glitch animation to this specific skeleton
    skeleton.dataset.glitchIntensity = glitchIntensity;
    skeleton.dataset.skeletonId = skeletonId;
    skeleton.dataset.messageType = message; // Store message type for data loading
    fragment.appendChild(skeleton);
  }

  return fragment;
}
