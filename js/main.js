/* ==========================================================================
   Woodside School Foundation — Main JS
   ========================================================================== */

'use strict';

// --------------------------------------------------------------------------
// Mobile nav toggle
// --------------------------------------------------------------------------

const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when a link is clicked (mobile)
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// --------------------------------------------------------------------------
// Dropdown: keyboard support
// --------------------------------------------------------------------------

document.querySelectorAll('.nav-has-dropdown > button').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    // Close all others
    document.querySelectorAll('.nav-has-dropdown > button').forEach(t => {
      if (t !== trigger) {
        t.setAttribute('aria-expanded', 'false');
      }
    });
    trigger.setAttribute('aria-expanded', String(!isExpanded));
  });
});

// Close dropdowns when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-has-dropdown')) {
    document.querySelectorAll('.nav-has-dropdown > button').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
    });
  }
});

// --------------------------------------------------------------------------
// Accordion
// --------------------------------------------------------------------------

function setPanelOpen(panel, open) {
  if (!panel) return;
  // Support both hidden attribute (semantic) and is-open class (CSS-driven)
  if (open) {
    panel.removeAttribute('hidden');
    panel.classList.add('is-open');
  } else {
    panel.setAttribute('hidden', '');
    panel.classList.remove('is-open');
  }
}

document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    const panel    = document.getElementById(trigger.getAttribute('aria-controls'));

    // Close siblings within the same accordion
    const accordion = trigger.closest('.accordion');
    if (accordion) {
      accordion.querySelectorAll('.accordion-trigger').forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          setPanelOpen(document.getElementById(t.getAttribute('aria-controls')), false);
        }
      });
    }

    trigger.setAttribute('aria-expanded', String(!expanded));
    setPanelOpen(panel, !expanded);
  });
});

// --------------------------------------------------------------------------
// Mark current-page nav link
// --------------------------------------------------------------------------

const currentPath = window.location.pathname.replace(/\/$/, '');

document.querySelectorAll('.nav-menu a, .footer-nav a').forEach(link => {
  const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '');
  if (linkPath === currentPath) {
    link.setAttribute('aria-current', 'page');
  }
});

// --------------------------------------------------------------------------
// Board Login — AES-256-GCM encrypted content
// --------------------------------------------------------------------------

const boardForm      = document.getElementById('board-password-form');
const boardInput     = document.getElementById('board-password');
const boardError     = document.getElementById('board-login-error');
const boardLogin     = document.getElementById('board-login-form');
const boardContent   = document.getElementById('board-content');
const boardEncrypted = document.getElementById('board-encrypted-data');

/**
 * Decrypt the encrypted board content using a password.
 * Format: base64( salt[16] + iv[12] + ciphertextWithTag )
 * Key derivation: PBKDF2 with 100,000 iterations, SHA-256
 * Encryption: AES-256-GCM (Web Crypto appends auth tag to ciphertext)
 */
function decryptBoardContent(password) {
  var json       = JSON.parse(boardEncrypted.textContent);
  var raw        = Uint8Array.from(atob(json.data), function (c) { return c.charCodeAt(0); });
  var salt       = raw.slice(0, 16);
  var iv         = raw.slice(16, 28);
  var ciphertext = raw.slice(28); // includes auth tag (Web Crypto handles this)

  var encoder   = new TextEncoder();
  var passBytes = encoder.encode(password);

  return crypto.subtle.importKey('raw', passBytes, 'PBKDF2', false, ['deriveKey'])
    .then(function (baseKey) {
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
    })
    .then(function (aesKey) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, aesKey, ciphertext);
    })
    .then(function (plainBuffer) {
      return new TextDecoder().decode(plainBuffer);
    });
}

function showBoardContent(html) {
  boardContent.innerHTML = html;
  boardContent.hidden    = false;
  boardLogin.hidden      = true;
  boardError.hidden      = true;
}

if (boardForm && boardEncrypted) {
  // Check if already authenticated this session — re-decrypt with stored password
  var savedPw = sessionStorage.getItem('wsf-board-pw');
  if (savedPw) {
    decryptBoardContent(savedPw)
      .then(function (html) { showBoardContent(html); })
      .catch(function () {
        // Stored password no longer valid — clear and show login
        sessionStorage.removeItem('wsf-board-pw');
      });
  }

  boardForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = boardInput.value;

    decryptBoardContent(pw)
      .then(function (html) {
        sessionStorage.setItem('wsf-board-pw', pw);
        showBoardContent(html);
      })
      .catch(function () {
        boardError.hidden = false;
        boardInput.value  = '';
        boardInput.focus();
      });
  });
}

// --------------------------------------------------------------------------
// Back-to-top button
// --------------------------------------------------------------------------

const backToTop = document.getElementById('back-to-top');

if (backToTop) {
  // Show/hide based on scroll position
  const toggleVisibility = () => {
    backToTop.classList.toggle('is-visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility(); // Set initial state

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
