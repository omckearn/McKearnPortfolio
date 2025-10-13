// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Share button (title bar)
const shareBtn = document.getElementById('share-btn');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const shareData = { title: document.title, text: 'Owen McKearn – Data Visualization and Mapping Portfolio', url: location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(location.href);
        const orig = shareBtn.textContent; shareBtn.textContent = '✓';
        setTimeout(() => shareBtn.textContent = orig, 1200);
      }
    } catch { /* ignore */ }
  });
}

// Theme toggle (light/dark)
const themeToggle = document.getElementById('theme-toggle');
const THEME_KEY = 'theme';

function applyTheme(mode){
  const body = document.body;
  if (mode === 'light') {
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
    mode = 'dark';
  }
  if (themeToggle){
    themeToggle.textContent = mode === 'light' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-pressed', String(mode === 'light'));
  }
}

// Initialize theme from saved pref or system
(() => {
  try{
    const saved = localStorage.getItem(THEME_KEY);
    const initial = saved ? saved : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(initial);
  } catch {
    applyTheme('dark');
  }
})();

if (themeToggle){
  themeToggle.addEventListener('click', () => {
    const next = document.body.classList.contains('light-theme') ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
  });
}

// IntersectionObserver for active nav state
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.site-nav a, .section-tabs a');

const setActive = (id) => {
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const match = href && href.startsWith('#') && href.slice(1) === id;
    link.classList.toggle('active', Boolean(match));
  });
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) setActive(entry.target.id);
  });
}, { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0.2 });

sections.forEach(sec => observer.observe(sec));

// Reveal-on-scroll
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObs.observe(el));

// Back to top button
const toTop = document.getElementById('to-top');
const toggleTop = () => {
  const scrolled = window.scrollY || document.documentElement.scrollTop;
  toTop.style.display = scrolled > 500 ? 'block' : 'none';
};
window.addEventListener('scroll', toggleTop);
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
toggleTop();

// Hero parallax background using rAF for smooth performance
const hero = document.querySelector('.hero');
if (hero) {
  let latestY = 0; let ticking = false;
  const update = () => {
    const offset = Math.round(latestY * 0.25); // parallax factor
    // Keep first three gradient layers centered; move the image layer only
    hero.style.backgroundPosition = `center center, center center, center center, 50% calc(50% + ${offset}px)`;
    ticking = false;
  };
  const onScroll = () => {
    latestY = window.scrollY || document.documentElement.scrollTop || 0;
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// (Parallax removed)

// Optional: smooth scroll for same-page anchors in older browsers
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      // Compute offset for sticky title bar + sticky tabs
      const root = document.documentElement;
      const varH = parseInt(getComputedStyle(root).getPropertyValue('--titlebar-h')) || 56;
      const tabsEl = document.querySelector('.section-tabs');
      const tabsH = tabsEl ? Math.ceil(tabsEl.getBoundingClientRect().height) : 0;
      const extraGap = 8; // small breathing room below bars
      const y = window.scrollY + target.getBoundingClientRect().top - (varH + tabsH + extraGap);
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  });
});

// Click-to-interact overlays for embedded maps
document.querySelectorAll('.embed.interact').forEach(wrap => {
  const guard = wrap.querySelector('.embed-guard');
  const iframe = wrap.querySelector('iframe');
  if (!guard || !iframe) return;

  const activate = () => {
    wrap.classList.add('is-active');
    // Give focus to iframe if possible for keyboard navigation
    setTimeout(() => iframe.focus && iframe.focus(), 0);
  };
  const deactivate = () => {
    wrap.classList.remove('is-active');
  };

  guard.addEventListener('click', activate);
  wrap.addEventListener('mouseleave', deactivate);
  wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') deactivate(); });
});

// Simple slider for certifications
document.querySelectorAll('.slider').forEach(slider => {
  const track = slider.querySelector('.slider-track');
  const slides = slider.querySelectorAll('.slide');
  const prev = slider.querySelector('.slider-btn.prev');
  const next = slider.querySelector('.slider-btn.next');
  let index = 0;

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  prev.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  });
  next.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    update();
  });

  // Keyboard navigation
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next.click(); }
    if (e.key === 'ArrowLeft') { prev.click(); }
  });

  // Click slide to open its PDF link
  slides.forEach(slide => {
    const link = slide.querySelector('a[href$=".pdf"]');
    if (!link) return;
    // Add a transparent cover link spanning the slide for reliable clicks
    const cover = document.createElement('a');
    cover.className = 'slide-cover';
    cover.href = link.getAttribute('href');
    cover.target = '_blank';
    cover.rel = 'noopener';
    cover.setAttribute('aria-label', 'Open certificate PDF');
    slide.appendChild(cover);
  });
});

// Section tabs horizontal scroll with arrows
const tabs = document.querySelector('.section-tabs');
if (tabs) {
  const viewport = tabs.querySelector('.tabs-viewport');
  const prev = tabs.querySelector('.tabs-arrow.prev');
  const next = tabs.querySelector('.tabs-arrow.next');
  const amount = () => Math.max(220, Math.floor(window.innerWidth * 0.6));
  const scrollLeft = () => viewport && viewport.scrollBy({ left: -amount(), behavior: 'smooth' });
  const scrollRight = () => viewport && viewport.scrollBy({ left: amount(), behavior: 'smooth' });
  prev && prev.addEventListener('click', scrollLeft);
  next && next.addEventListener('click', scrollRight);

  // Auto-hide arrows at ends and on resize/scroll
  const updateArrows = () => {
    if (!viewport || !prev || !next) return;
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const atStart = viewport.scrollLeft <= 1;
    const atEnd = viewport.scrollLeft >= (max - 1);
    prev.classList.toggle('is-disabled', atStart);
    next.classList.toggle('is-disabled', atEnd);
    prev.setAttribute('aria-disabled', String(atStart));
    next.setAttribute('aria-disabled', String(atEnd));
  };
  viewport && viewport.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  // Initial state after layout
  setTimeout(updateArrows, 0);

  // Expose tabs height as CSS var for spacer
  const setTabsHeightVar = () => {
    const h = Math.ceil(tabs.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--tabs-h', h + 'px');
  };
  window.addEventListener('resize', setTabsHeightVar);
  setTimeout(setTabsHeightVar, 0);
}

// Click-to-zoom lightbox for images
(function setupLightbox(){
  // Create overlay once
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Expanded image');
  overlay.innerHTML = '<button class="lightbox-close" aria-label="Close image">×</button><img class="lightbox-img" alt="">';
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('.lightbox-img');
  const closeBtn = overlay.querySelector('.lightbox-close');

  const open = (src, alt) => {
    imgEl.src = src;
    imgEl.alt = alt || '';
    overlay.classList.add('open');
  };
  const close = () => {
    overlay.classList.remove('open');
    imgEl.src = '';
    imgEl.alt = '';
  };

  // Close interactions
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (overlay.classList.contains('open') && e.key === 'Escape') close(); });

  // Make any .zoomable images open in lightbox
  document.querySelectorAll('img.zoomable').forEach(img => {
    img.addEventListener('click', () => open(img.src, img.alt));
  });
})();

// Drawer open/close
(function setupDrawer(){
  const toggle = document.getElementById('drawer-toggle');
  const drawer = document.getElementById('drawer');
  if (!toggle || !drawer) return;
  const open = () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    isOpen ? close() : open();
  });
  document.addEventListener('click', (e) => {
    if (!drawer.classList.contains('open')) return;
    const withinDrawer = drawer.contains(e.target);
    const onToggle = toggle.contains(e.target);
    if (!withinDrawer && !onToggle) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) close();
  });
  // Close drawer when clicking a link inside
  drawer.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', close));
})();

// (Drawer removed)
