/* =====================================================================
   KENSINGTON REALTY — script.js
   Foundation behavior shared by every page:
   - sticky navbar scroll state
   - mobile menu
   - smooth scroll for in-page anchors
   - scroll-reveal + stagger
   - number counter animation
   - back-to-top button
   - generic modal open/close (used by properties.html / projects.html)
   - generic form validation + toast (used by contact.html)
   - quick-search demo redirect (home page)
===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     Navbar: scrolled state
  --------------------------------------------------------------- */
  const header = document.querySelector('header');
  if(header){
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* ---------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if(menuToggle && navLinks){
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.textContent = isOpen ? '✕' : '☰';
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.textContent = '☰';
    }));
  }

  /* ---------------------------------------------------------------
     Smooth scroll for in-page anchors (href="#id")
  --------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const targetId = link.getAttribute('href');
    if(targetId.length > 1){
      link.addEventListener('click', (e) => {
        const target = document.querySelector(targetId);
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth', block:'start'});
        }
      });
    }
  });

  /* ---------------------------------------------------------------
     Scroll reveal + stagger
  --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revealEls.length){
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------------------------------------------------------------
     Number counter animation
  --------------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  if(counters.length && 'IntersectionObserver' in window){
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1400;
          const start = performance.now();
          function tick(now){
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
            if(progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString() + suffix;
          }
          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        }
      });
    }, {threshold:0.4});
    counters.forEach(el => counterObserver.observe(el));
  }

  /* ---------------------------------------------------------------
     Back to top button
  --------------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  if(backToTop){
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 500);
    }, {passive:true});
    backToTop.addEventListener('click', () => {
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }

  /* ---------------------------------------------------------------
     FAQ accordion (used on later pages)
  --------------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if(!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!isOpen){
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------------------------------------------------------------
     Quick property search (home page) — demo only, no backend.
     Submits as a real GET navigation to properties.html so the
     button is never a dead end; properties.html reads the query
     string and pre-fills/filters (wired in Part 2).
  --------------------------------------------------------------- */
  const quickSearch = document.getElementById('quickSearchForm');
  if(quickSearch){
    quickSearch.addEventListener('submit', (e) => {
      e.preventDefault();
      const params = new URLSearchParams();
      quickSearch.querySelectorAll('select, input').forEach(field => {
        if(field.value) params.set(field.name, field.value);
      });
      window.location.href = 'properties.html?' + params.toString();
    });
  }

  /* ---------------------------------------------------------------
     Generic modal open/close (property + project detail modals)
     Usage:
       <button data-modal-open="modal-id">View Details</button>
       <div class="modal-overlay" id="modal-id">...<button data-modal-close>×</button></div>
  --------------------------------------------------------------- */
  function openModal(id){
    const modal = document.getElementById(id);
    if(!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal){
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-modal-open')));
  });
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if(e.target === modal) closeModal(modal);
    });
    modal.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(modal));
    });
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      document.querySelectorAll('.modal-overlay.open').forEach(modal => closeModal(modal));
    }
  });
  // Exposed for later pages that build modal content dynamically
  window.KR = window.KR || {};
  window.KR.openModal = openModal;
  window.KR.closeModal = (id) => { const m = document.getElementById(id); if(m) closeModal(m); };

  /* ---------------------------------------------------------------
     Toast helper (used by contact form on submit)
  --------------------------------------------------------------- */
  function showToast(title, message){
    let toast = document.getElementById('appToast');
    if(!toast){
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast';
      toast.innerHTML = '<span class="check">✓</span><div class="msg"><b></b><span></span></div>';
      document.body.appendChild(toast);
    }
    toast.querySelector('b').textContent = title;
    toast.querySelector('.msg span').textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 4200);
  }
  window.KR.showToast = showToast;

  /* ---------------------------------------------------------------
     Generic form validation (contact form, enquiry forms)
     Usage: <form data-validate data-success-title="..." data-success-msg="...">
  --------------------------------------------------------------- */
  document.querySelectorAll('form[data-validate]').forEach(form => {
    function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      let allValid = true;
      form.querySelectorAll('[required]').forEach(input => {
        const field = input.closest('.form-field');
        let valid = input.value.trim().length > 1;
        if(input.type === 'email') valid = isValidEmail(input.value.trim());
        if(input.type === 'tel') valid = input.value.trim().length >= 7;
        if(field){
          field.classList.toggle('invalid', !valid);
        }
        if(!valid) allValid = false;
      });

      if(!allValid) return;

      const title = form.dataset.successTitle || 'Message sent';
      const msg = form.dataset.successMsg || "We'll be in touch within one business day.";
      showToast(title, msg);
      form.reset();
      form.querySelectorAll('.form-field').forEach(f => f.classList.remove('invalid'));
    });
  });

});
