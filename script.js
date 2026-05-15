(function(){
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Hero load animation
  const hero = document.querySelector('.hero');
  if (hero) {
    // Stagger the word reveals
    const words = hero.querySelectorAll('.hero__headline .word > span');
    words.forEach((w, i) => { w.style.transitionDelay = (80 + i*90) + 'ms'; });
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-loaded')));
  }

  // ---- Header scroll state
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  // ---- Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }));
  }

  // ---- IntersectionObserver reveals
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-img').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-img').forEach(el => el.classList.add('is-in'));
  }

  // ---- Counter animation
  const counters = document.querySelectorAll('[data-count]');
  if (!reduced && counters.length && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 1600;
        const start = performance.now();
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const v = Math.round(easeOut(t) * target);
          el.textContent = v.toString();
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => co.observe(c));
  } else {
    counters.forEach(c => c.textContent = c.getAttribute('data-count'));
  }

  // ---- Hero parallax
  const heroBg = document.getElementById('hero-bg');
  if (heroBg && !reduced) {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      // limit so we don't reveal edges
      const t = Math.min(y * 0.35, 240);
      heroBg.style.transform = 'translate3d(0,' + t + 'px,0) scale(1.08)';
      ticking = false;
    };
    heroBg.style.transform = 'scale(1.08)';
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive:true });
  }

  // ---- Smooth anchor offset for fixed header
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  // ---- Year in footer
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();



// ---- FAQ accordion
document.querySelectorAll('.faq__item').forEach(item => {
  const q = item.querySelector('.faq__q');
  const body = item.querySelector('.faq__body');
  if (!q || !body) return;
  q.setAttribute('aria-expanded', 'false');
  q.addEventListener('click', () => {
    const open = item.classList.toggle('is-open');
    q.setAttribute('aria-expanded', String(open));
    if (open){
      body.style.maxHeight = body.scrollHeight + 'px';
    } else {
      body.style.maxHeight = '0px';
    }
  });
});

// ---- Portfolio filters
const filterBtns = document.querySelectorAll('.filter-btn');
const filterTargets = document.querySelectorAll('[data-cat]');
if (filterBtns.length && filterTargets.length){
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-filter');
      filterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      filterTargets.forEach(el => {
        const cats = (el.getAttribute('data-cat') || '').split(/\s+/);
        if (cat === 'all' || cats.includes(cat)){
          el.removeAttribute('data-hidden');
        } else {
          el.setAttribute('data-hidden', '');
        }
      });
    });
  });
}

// ---- Form: client-side validation + success state (Netlify-compatible)
const quoteForm = document.querySelector('form[data-form="quote"]');
if (quoteForm){
  quoteForm.addEventListener('submit', (e) => {
    // Honeypot
    const hp = quoteForm.querySelector('[name="bot-field"]');
    if (hp && hp.value){ e.preventDefault(); return; }
    // Let Netlify handle it natively; show success after a short delay
    // (in real deploy: Netlify redirects to /grazie or the form posts AJAX)
    // For local preview, prevent default and show success state
    if (!quoteForm.hasAttribute('data-real-submit')){
      e.preventDefault();
      const success = document.querySelector('.form__success');
      if (success){
        quoteForm.style.display = 'none';
        success.classList.add('is-shown');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

// ---- Set active nav item based on current path
(() => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const file = path.split('/').pop() || '';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const hrefFile = href.replace(/^\//, '').split('/').pop();
    if (
      (href === '/' && (path === '/' || file === 'index.html')) ||
      (hrefFile && hrefFile === file && hrefFile !== '')
    ){
      a.classList.add('is-active');
    }
  });
})();

})();
