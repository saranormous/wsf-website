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
