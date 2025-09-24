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

// Optional: smooth scroll for same-page anchors in older browsers
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
}
