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
// ---- Cookie / GDPR banner
  (() => {
    const storageKey = 'gds_cookie_consent_v1';

    if (localStorage.getItem(storageKey)) return;

    const banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Informativa cookie');

    banner.innerHTML = `
      <div class="cookie-banner__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="3"/>
          <circle cx="18" cy="18" r="2.5" fill="currentColor"/>
          <circle cx="29" cy="16" r="2.2" fill="currentColor"/>
          <circle cx="30" cy="29" r="2.7" fill="currentColor"/>
          <circle cx="19" cy="31" r="2" fill="currentColor"/>
          <path d="M35.5 10.5c-2.5 1.2-4.2 3.7-4.2 6.6 0 4.1 3.3 7.4 7.4 7.4.7 0 1.4-.1 2.1-.3" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <div class="cookie-banner__content">
        <h2 class="cookie-banner__title">Cookie e privacy</h2>
        <p class="cookie-banner__text">
          Usiamo cookie tecnici necessari al funzionamento del sito e, se attivati, strumenti di miglioramento solo previo consenso.
          Puoi accettare oppure continuare con i soli cookie necessari.
        </p>

        <div class="cookie-banner__links">
          <a href="privacy-policy.html">Privacy Policy</a>
          <a href="cookie-policy.html">Cookie Policy</a>
        </div>

        <div class="cookie-banner__actions">
          <button class="cookie-btn cookie-btn--primary" type="button" data-cookie-accept>
            Accetta
          </button>
          <button class="cookie-btn cookie-btn--secondary" type="button" data-cookie-essential>
            Solo necessari
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    requestAnimationFrame(() => {
      banner.classList.add('is-visible');
    });

    const saveChoice = (choice) => {
      localStorage.setItem(storageKey, JSON.stringify({
        choice,
        date: new Date().toISOString()
      }));

      banner.classList.remove('is-visible');

      setTimeout(() => {
        banner.remove();
      }, 300);
    };

    banner.querySelector('[data-cookie-accept]').addEventListener('click', () => {
      saveChoice('accepted');
    });

    banner.querySelector('[data-cookie-essential]').addEventListener('click', () => {
      saveChoice('essential');
    });
  })();
})();
// ================================================================
// PORTFOLIO v2 — Modale progetto + lightbox single-foto
// Da inserire DENTRO la IIFE di script.js, prima della "})();" finale.
// ================================================================
(() => {
  const modal = document.getElementById('pmodal');
  if (!modal) return;

  const projects = document.querySelectorAll('.portfolio-all .project');
  if (!projects.length) return;

  const photoEl   = modal.querySelector('.pmodal__photo');
  const counterEl = modal.querySelector('.pmodal__counter');
  const thumbsEl  = modal.querySelector('.pmodal__thumbs');
  const prevBtn   = modal.querySelector('.pmodal__nav--prev');
  const nextBtn   = modal.querySelector('.pmodal__nav--next');
  const closeBtn  = modal.querySelector('.pmodal__close');
  const catEl     = modal.querySelector('.pmodal__cat');
  const titleEl   = modal.querySelector('.pmodal__title');
  const metaEl    = modal.querySelector('.pmodal__meta');
  const descEl    = modal.querySelector('.pmodal__desc');

  let currentPhotos = [];
  let currentIndex  = 0;
  let lastFocused   = null;

  const CAT_LABELS = {
    'residenziale':   'Residenziale',
    'industriale':    'Industriale & commerciale',
    'tinteggiature':  'Tinteggiature'
  };

  function openModal(project) {
    lastFocused = document.activeElement;
    const isSingle = project.dataset.photos === '1';
    const projectId = project.dataset.project;
    const cat = (project.dataset.cat || '').split(/\s+/)[0];

    if (isSingle) {
      // Lightbox singola: prendiamo solo l'immagine della card
      const cardImg = project.querySelector('.project__img img');
      currentPhotos = [{
        src: cardImg ? cardImg.src : '',
        alt: cardImg ? cardImg.alt : ''
      }];
      modal.classList.add('pmodal--single');
    } else {
      // Modale completa: cerchiamo il template dati
      const tpl = document.querySelector(`template.project-data[data-for="${projectId}"]`);
      modal.classList.remove('pmodal--single');

      if (tpl) {
        const content = tpl.content;
        // Foto
        currentPhotos = Array.from(content.querySelectorAll('.pd-photos img')).map(img => ({
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt') || ''
        }));
        // Testo
        const titleNode = content.querySelector('.pd-title');
        const metaNode  = content.querySelector('.pd-meta');
        const descNode  = content.querySelector('.pd-desc');

        titleEl.textContent = titleNode ? titleNode.textContent : '';
        metaEl.textContent  = metaNode  ? metaNode.textContent  : '';
        descEl.innerHTML    = descNode  ? `<p>${descNode.textContent}</p>` : '';
        catEl.textContent   = CAT_LABELS[cat] || '';
      } else {
        // Fallback se manca il template: usiamo la foto della card
        const cardImg = project.querySelector('.project__img img');
        currentPhotos = [{
          src: cardImg ? cardImg.src : '',
          alt: cardImg ? cardImg.alt : ''
        }];
        const t = project.querySelector('.project__title');
        const z = project.querySelector('.project__zone');
        titleEl.textContent = t ? t.textContent : '';
        metaEl.textContent  = z ? z.textContent : '';
        descEl.innerHTML    = '';
        catEl.textContent   = CAT_LABELS[cat] || '';
      }
    }

    // Render thumbs
    thumbsEl.innerHTML = '';
    if (currentPhotos.length > 1) {
      currentPhotos.forEach((p, i) => {
        const t = document.createElement('button');
        t.type = 'button';
        t.className = 'pmodal__thumb' + (i === 0 ? ' is-active' : '');
        t.setAttribute('aria-label', `Mostra foto ${i + 1}`);
        const im = document.createElement('img');
        im.src = p.src;
        im.alt = '';
        im.loading = 'lazy';
        t.appendChild(im);
        t.addEventListener('click', () => goTo(i));
        thumbsEl.appendChild(t);
      });
    }

    currentIndex = 0;
    showPhoto(0);

    // Open
    modal.classList.add('is-open');
    document.body.classList.add('pmodal-lock');
    requestAnimationFrame(() => modal.classList.add('is-visible'));
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
  }

  function showPhoto(i) {
    if (!currentPhotos.length) return;
    currentIndex = (i + currentPhotos.length) % currentPhotos.length;
    const p = currentPhotos[currentIndex];
    photoEl.src = p.src;
    photoEl.alt = p.alt;
    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${currentPhotos.length}`;
    // update thumb states
    thumbsEl.querySelectorAll('.pmodal__thumb').forEach((th, idx) => {
      th.classList.toggle('is-active', idx === currentIndex);
    });
  }

  function goTo(i)   { showPhoto(i); }
  function next()    { showPhoto(currentIndex + 1); }
  function prev()    { showPhoto(currentIndex - 1); }

  function closeModal() {
    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      modal.classList.remove('is-open', 'pmodal--single');
      document.body.classList.remove('pmodal-lock');
      photoEl.src = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }, 300);
  }

  // --- Wire up clicks on projects ---
  projects.forEach(project => {
    project.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(project);
    });
  });

  // --- Controls ---
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);
  closeBtn.addEventListener('click', closeModal);

  // Click sul backdrop (fuori da .pmodal__inner) chiude
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Tastiera
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight' && !modal.classList.contains('pmodal--single')) next();
    if (e.key === 'ArrowLeft'  && !modal.classList.contains('pmodal--single')) prev();
  });

  // Swipe touch su mobile
  let touchStartX = null;
  modal.addEventListener('touchstart', (e) => {
    if (modal.classList.contains('pmodal--single')) return;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  modal.addEventListener('touchend', (e) => {
    if (touchStartX === null || modal.classList.contains('pmodal--single')) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next(); else prev();
    }
    touchStartX = null;
  });
})();
