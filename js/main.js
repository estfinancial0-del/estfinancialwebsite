/* ============================================================
   EST FINANCIAL — PREMIUM INTERACTIONS
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
  '.service-card', '.testimonial-card', '.team-card',
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
          // Scrolling down fast — keep visible (don't hide on finance site)
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
