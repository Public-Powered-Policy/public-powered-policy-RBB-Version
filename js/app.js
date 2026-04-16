/* =============================================================
   PUBLIC POWERED POLICY — App JS
   Theme picker · Mobile nav · Contact form
   ============================================================= */

'use strict';

/* ── THEME PICKER ────────────────────────────────────────── */
(function initTheme() {
  const html = document.documentElement;
  const stored = localStorage.getItem('ppp-mode') || 'system';

  function applyMode(mode) {
    html.classList.remove('light', 'dark');
    if (mode === 'light') html.classList.add('light');
    if (mode === 'dark')  html.classList.add('dark');
    localStorage.setItem('ppp-mode', mode);

    // Update ARIA checked states
    document.querySelectorAll('[data-theme-mode]').forEach(btn => {
      btn.setAttribute('aria-checked', btn.dataset.themeMode === mode ? 'true' : 'false');
    });

    // Update button label
    const label = document.getElementById('theme-current');
    if (label) label.textContent = mode;
  }

  // Apply on page load (before paint to avoid flash)
  applyMode(stored);

  document.addEventListener('DOMContentLoaded', () => {
    const themeBtn  = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');

    if (!themeBtn || !themeMenu) return;

    // Open/close menu
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = themeMenu.classList.toggle('open');
      themeBtn.setAttribute('aria-expanded', open);
    });

    // Close on outside click
    document.addEventListener('click', () => {
      themeMenu.classList.remove('open');
      themeBtn.setAttribute('aria-expanded', 'false');
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        themeMenu.classList.remove('open');
        themeBtn.setAttribute('aria-expanded', 'false');
        themeBtn.focus();
      }
    });

    // Mode buttons
    document.querySelectorAll('[data-theme-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        applyMode(btn.dataset.themeMode);
        themeMenu.classList.remove('open');
        themeBtn.setAttribute('aria-expanded', 'false');
        themeBtn.focus();
      });
    });

    // Set initial ARIA states
    applyMode(stored);
  });
})();

/* ── MOBILE NAV ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn   = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    mobileNav.setAttribute('aria-hidden', !open);
    menuBtn.textContent = open ? 'Close' : 'Menu';
  });

  // Close on nav link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      menuBtn.textContent = 'Menu';
    });
  });
});

/* ── BRUSH STROKE ANIMATION ──────────────────────────────── */
/*
   Watches .brush-divider elements with IntersectionObserver.
   When they scroll into view, adds .is-visible to trigger the
   CSS clip-path reveal. Respects prefers-reduced-motion:
   if the user has requested reduced motion, we skip the
   animation and show the brush immediately.
*/
document.addEventListener('DOMContentLoaded', () => {
  const brushEls = document.querySelectorAll('.brush-divider');
  if (!brushEls.length) return;

  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Show all brush strokes immediately — no animation
    brushEls.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate once only
        }
      });
    },
    { threshold: 0.15 }
  );

  brushEls.forEach(el => observer.observe(el));
});

/* ── CONTACT FORM ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const success   = document.getElementById('form-success');
    const error     = document.getElementById('form-error');

    // Hide any previous messages
    if (success) success.style.display = 'none';
    if (error)   error.style.display   = 'none';

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const res  = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });

      if (res.ok) {
        form.reset();
        if (success) {
          success.style.display = 'block';
          success.focus();
        }
      } else {
        throw new Error('Server error');
      }
    } catch {
      if (error) {
        error.style.display = 'block';
        error.focus();
      }
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send message';
    }
  });
});
