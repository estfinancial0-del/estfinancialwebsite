/* ============================================================
   EST FINANCIAL - PREMIUM INTERACTIONS
   ============================================================ */

// ---- SCROLL PROGRESS BAR ----
const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total    = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrolled / total * 100) + '%';
}, { passive: true });


// ---- NAVBAR: transparent → solid on scroll ----
const navbar = document.querySelector('.navbar');
const onScroll = () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


// ---- MOBILE NAV TOGGLE ----
const toggle   = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.innerHTML = isOpen ? '✕' : '&#9776;';
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.innerHTML = '&#9776;';
      document.body.style.overflow = '';
    });
  });
}


// ---- ACTIVE NAV LINK ----
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = (link.getAttribute('href') || '').split('#')[0];
  if (href === currentPage) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});


// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

const revealSelectors = [
  '.service-card', '.testimonial-card', '.team-card', '.ss-card',
  '.blog-card', '.video-card', '.case-card', '.value-card',
  '.why-list li', '.contact-detail', '.outcome-item',
  '.section-header', '.about-intro-text', '.about-intro-inner .image-placeholder',
  '.stat-inline', '.disclaimer-box'
];

document.querySelectorAll(revealSelectors.join(', ')).forEach((el, i) => {
  el.classList.add('reveal');
  // Stagger siblings
  const parent  = el.parentElement;
  const siblings = parent ? [...parent.children] : [];
  const idx = siblings.indexOf(el);
  if (idx > 0 && idx <= 4) {
    el.style.transitionDelay = (idx * 70) + 'ms';
  }
  revealObserver.observe(el);
});


// ---- ANIMATED STAT COUNTERS ----
function animateCounter(el, target, suffix = '', prefix = '', useComma = false) {
  const duration = 1800;
  const start    = performance.now();
  const isFloat  = target % 1 !== 0;

  const fmt = (n) => {
    const v = isFloat ? n.toFixed(1) : Math.round(n);
    if (useComma) return Number(v).toLocaleString('en-AU');
    return v;
  };

  const step = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 4);
    el.textContent = prefix + fmt(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const raw    = el.dataset.count;
    if (!raw) return;
    const target = parseFloat(raw);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const format = el.dataset.format === 'comma';
    animateCounter(el, target, suffix, prefix, format);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

// Tag stat numbers for counter animation
// Handles formats: "3,000+", "$200M+", "10+", "5★"
document.querySelectorAll('.stat-number, .stat-inline strong').forEach(el => {
  const text   = el.textContent.trim();
  // Match optional prefix (like $), then digits (with optional comma/dot), then suffix
  const match  = text.match(/^([^0-9]*)([\d,]+\.?\d*)(.*)$/);
  if (!match) return;
  const [, prefix, rawNum, suffix] = match;
  const num = parseFloat(rawNum.replace(/,/g, ''));
  if (isNaN(num)) return;
  el.dataset.prefix = prefix;
  el.dataset.count  = num;
  el.dataset.suffix = suffix;
  // Format large numbers with commas
  el.dataset.format = rawNum.includes(',') ? 'comma' : 'plain';
  counterObserver.observe(el);
});


// ---- HERO PARALLAX (subtle) ----
const heroContent = document.querySelector('.hero-content');
const heroBg      = document.querySelector('.hero-bg');
if (heroContent && heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroContent.style.transform = `translateY(${y * 0.18}px)`;
    heroBg.style.transform      = `translateY(${y * 0.08}px)`;
  }, { passive: true });
}


// ---- BUTTON MAGNETIC EFFECT ----
document.querySelectorAll('.btn-primary, .btn-nav').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect   = btn.getBoundingClientRect();
    const x      = e.clientX - rect.left - rect.width  / 2;
    const y      = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px) translateY(-2px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});


// ---- NAVBAR HIDE/SHOW ON SCROLL DIRECTION ----
let lastScrollY = 0;
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      if (currentY > 200) {
        if (currentY > lastScrollY + 10) {
          // Scrolling down fast - keep visible (don't hide on finance site)
        }
      }
      lastScrollY = currentY;
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });


// ---- SMOOTH ANCHOR SCROLLING ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ---- PUZZLE: SCROLL-TRIGGERED FLY-IN + MOUSE TILT ----
const puzzleSvg     = document.getElementById('est-puzzle');
const puzzleWrapper = document.querySelector('.puzzle-wrapper');

if (puzzleSvg && puzzleWrapper) {
  // Trigger fly-in when puzzle scrolls into view
  const puzzleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        puzzleSvg.classList.add('animated');
        puzzleObserver.unobserve(puzzleSvg);
      }
    });
  }, { threshold: 0.15 });
  puzzleObserver.observe(puzzleSvg);

  // 3-D tilt on mouse move
  puzzleWrapper.addEventListener('mousemove', e => {
    const rect   = puzzleWrapper.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);   // -1 … 1
    const dy     = (e.clientY - cy) / (rect.height / 2);   // -1 … 1
    const rotX   = -dy * 6;   // max ±6°
    const rotY   =  dx * 6;
    puzzleSvg.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });
  puzzleWrapper.addEventListener('mouseleave', () => {
    puzzleSvg.style.transform = '';
  });
}


// ---- FORM INPUT LABEL ANIMATION ----
document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(input => {
  input.addEventListener('focus', () => {
    input.closest('.form-group')?.classList.add('focused');
  });
  input.addEventListener('blur', () => {
    input.closest('.form-group')?.classList.remove('focused');
  });
});


// ---- SERVICE CARD CURSOR SPOTLIGHT ----
// Sets --mx/--my so the CSS radial glow follows the cursor. No DOM injection.
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
  }, { passive: true });
});


// ---- SUCCESS STORIES GALLERY: filter tabs + lightbox + prev/next ----
// Vanilla, no libs. No persistent DOM injection - only class/attr/src mutations,
// and the lightbox iframe src is cleared on close, so the inline editor's
// DOM serialisation stays clean.
(function () {
  const grid = document.getElementById('ssGrid');
  if (!grid) return;
  const tabs    = [...document.querySelectorAll('.ss-tab')];
  const cards   = [...grid.querySelectorAll('.ss-card')];   // <article> elements
  const opens   = [...grid.querySelectorAll('.ss-open')];   // trigger buttons
  const countEl = document.querySelector('.ss-count strong');
  const lb       = document.getElementById('ssLightbox');
  const frame    = document.getElementById('ssLbFrame');
  const lbTitle  = document.getElementById('ssLbTitle');
  const lbQuote  = document.getElementById('ssLbQuote');
  const player   = lb.querySelector('.ss-lightbox__player');
  const prevBtn  = document.getElementById('ssLbPrev');
  const nextBtn  = document.getElementById('ssLbNext');
  let lastTrigger = null, queue = [], qi = -1;

  // --- Filter (roving-tabindex tablist) ---
  function applyFilter(f) {
    let n = 0;
    cards.forEach(c => { const show = f === 'all' || c.dataset.category === f; c.hidden = !show; if (show) n++; });
    if (countEl) countEl.textContent = n;
  }
  function selectTab(i) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    applyFilter(tabs[i].dataset.filter);
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const nx = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        selectTab(nx); tabs[nx].focus();
      }
    });
  });

  // --- Cursor spotlight on video cards ---
  cards.forEach(c => {
    if (!c.classList.contains('ss-card--video')) return;
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
      c.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
    }, { passive: true });
  });

  // --- Lightbox ---
  const visibleVideoTriggers = () => opens.filter(b => b.dataset.ytid && !b.closest('.ss-card').hidden);
  function showVideo(btn) {
    player.hidden = false; lbQuote.hidden = true; prevBtn.hidden = false; nextBtn.hidden = false;
    lbTitle.textContent = btn.dataset.title || '';
    frame.src = 'https://www.youtube.com/embed/' + btn.dataset.ytid + '?autoplay=1&rel=0&modestbranding=1';
  }
  function showQuote(btn) {
    player.hidden = true; frame.src = ''; prevBtn.hidden = true; nextBtn.hidden = true; lbQuote.hidden = false;
    lbTitle.textContent = btn.dataset.client || '';
    lbQuote.textContent = btn.dataset.quote || '';
  }
  function openLb(btn) {
    lastTrigger = btn;
    if (btn.dataset.ytid) { queue = visibleVideoTriggers(); qi = queue.indexOf(btn); showVideo(btn); }
    else { queue = []; qi = -1; showQuote(btn); }
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('ss-lock');
    lb.querySelector('.ss-lightbox__close').focus();
    document.addEventListener('keydown', onKey);
  }
  function closeLb() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('ss-lock');
    frame.src = '';                       // stop playback + keep serialised DOM clean
    document.removeEventListener('keydown', onKey);
    if (lastTrigger) lastTrigger.focus();
  }
  function step(d) { if (!queue.length) return; qi = (qi + d + queue.length) % queue.length; showVideo(queue[qi]); }
  function onKey(e) {
    if (e.key === 'Escape') return closeLb();
    if (e.key === 'ArrowRight' && !nextBtn.hidden) return step(1);
    if (e.key === 'ArrowLeft'  && !prevBtn.hidden) return step(-1);
    if (e.key === 'Tab') {
      const f = [...lb.querySelectorAll('button, iframe, [href], [tabindex]:not([tabindex="-1"])')]
        .filter(el => !el.hidden && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  opens.forEach(b => b.addEventListener('click', () => openLb(b)));
  lb.querySelectorAll('[data-ss-close]').forEach(el => el.addEventListener('click', closeLb));
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
})();
