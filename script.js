/* ================================================================
   ADYVANCE — Interactive Scripts
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Preloader ──
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hidden'), 600);
    });
    // Fallback — hide after 3s max
    setTimeout(() => preloader.classList.add('hidden'), 3000);
  }

  // ── Sticky Header ──
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  const scrollProgress = document.getElementById('scroll-progress');
  let scrollTicking = false;

  function updateScrollProgress() {
    if (!scrollProgress) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    scrollTicking = false;
  }

  function requestScrollProgress() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollProgress);
    }
  }

  window.addEventListener('scroll', requestScrollProgress, { passive: true });
  window.addEventListener('resize', requestScrollProgress);
  updateScrollProgress();

  const header = document.querySelector('.header');
  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── Mobile Menu ──
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  function openMobile() {
    if (!hamburger || !mobileMenu || !mobileOverlay) return;
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileOverlay.style.display = 'block';
    requestAnimationFrame(() => mobileOverlay.classList.add('visible'));
    document.body.classList.add('menu-open');
  }

  function closeMobile() {
    if (!hamburger || !mobileMenu || !mobileOverlay) return;
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileOverlay.classList.remove('visible');
    document.body.classList.remove('menu-open');
    setTimeout(() => { mobileOverlay.style.display = 'none'; }, 400);
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        closeMobile();
      } else {
        openMobile();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobile);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobile);
  });

  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '#contact-modal') return;

      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({ top: targetPos, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    });
  });

  // ── Dot Navigation — Active State with IntersectionObserver ──
  const dotNav = document.querySelector('.dot-nav');
  const sections = document.querySelectorAll('section[id]');
  const dotLinks = dotNav ? dotNav.querySelectorAll('a') : [];

  if (sections.length > 0 && dotLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          dotLinks.forEach(dot => {
            dot.classList.toggle('active', dot.getAttribute('href') === `#${id}`);
          });
          // Also update desktop nav active state
          document.querySelectorAll('.nav-links a').forEach(navLink => {
            navLink.classList.toggle('active', navLink.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // ── FAQ Accordion ──
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.setAttribute('aria-expanded', 'false');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('active');
        const itemQuestion = i.querySelector('.faq-question');
        if (itemQuestion) itemQuestion.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── Contact Modal ──
  const modalOverlay = document.querySelector('.modal-overlay');
  const modal = document.querySelector('.modal');
  const modalClose = document.querySelector('.modal-close');
  const modalTriggers = document.querySelectorAll('[data-modal="contact"]');

  function openModal() {
    if (!modalOverlay || !modal) return;
    modalOverlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay || !modal) return;
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (modal && modal.classList.contains('active')) {
      closeModal();
    }
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      closeMobile();
    }
  });

  // ── Contact Form Handling ──
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Basic validation
      if (!data.name || !data.email) {
        alert('Please fill in your name and email.');
        return;
      }

      // Format the WhatsApp message
      let message = `*New Strategy Call Request*\n\n`;
      message += `*Name:* ${data.name}\n`;
      message += `*Email:* ${data.email}\n`;
      if (data.phone) message += `*Phone:* ${data.phone}\n`;
      if (data.budget) message += `*Budget:* ${data.budget}\n`;
      if (data.website) message += `*Website:* ${data.website}\n`;
      if (data.project) message += `*Project Details:*\n${data.project}\n`;

      const whatsappNumber = '9779851425150';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');

      // Show success feedback
      const submitBtn = contactForm.querySelector('.form-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'MESSAGE SENT ✓';
      submitBtn.style.background = 'linear-gradient(135deg, #29B473, #1B97B0)';

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        contactForm.reset();
        closeModal();
      }, 2000);
    });
  }

  // ── Testimonials Auto-Scroll (mobile only) ──
  const testimonialsGrid = document.querySelector('.testimonials-grid');
  const clientsGrid = document.querySelector('.clients-grid');
  const marqueeState = {};

  function initMarquee(container, itemSelector, gap, speed, mobileOnly = true) {
    const key = container === testimonialsGrid ? 'testimonials' : 'clients';
    const shouldRun = !prefersReducedMotion() && (!mobileOnly || window.innerWidth <= 768);
    let state = marqueeState[key];

    if (!state) {
      state = marqueeState[key] = {
        animId: null,
        paused: false,
        pos: 0,
        originalStyle: container.getAttribute('style') || '',
        sourceNodes: Array.from(container.querySelectorAll(itemSelector)).map(item => item.cloneNode(true)),
        handlersAttached: false
      };
    }

    if (state.animId) {
      cancelAnimationFrame(state.animId);
      state.animId = null;
    }

    if (state.sourceNodes.length === 0) return;

    if (!shouldRun) {
      container.innerHTML = '';
      state.sourceNodes.forEach(item => {
        const restored = item.cloneNode(true);
        restored.classList.add('visible');
        container.appendChild(restored);
      });
      if (state.originalStyle) {
        container.setAttribute('style', state.originalStyle);
      } else {
        container.removeAttribute('style');
      }
      return;
    }

    container.style.overflow = 'hidden';
    container.style.display = 'block';
    container.innerHTML = '';

    const track = document.createElement('div');
    track.className = 'marquee-track';
    track.style.cssText = `display:flex;gap:${gap}px;width:max-content;align-items:stretch`;

    for (let i = 0; i < 2; i += 1) {
      state.sourceNodes.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('visible');
        track.appendChild(clone);
      });
    }

    container.appendChild(track);

    function tick() {
      if (!state.paused && track.children.length) {
        state.pos -= speed;
        const firstItemWidth = track.children[0].offsetWidth + gap;
        const loopWidth = firstItemWidth * state.sourceNodes.length;
        if (loopWidth > 0 && state.pos <= -loopWidth) state.pos += loopWidth;
        track.style.transform = `translateX(${state.pos}px)`;
      }
      state.animId = requestAnimationFrame(tick);
    }

    if (!state.handlersAttached) {
      const pause = () => { state.paused = true; };
      const resume = () => { state.paused = false; };
      container.addEventListener('mouseenter', pause);
      container.addEventListener('mouseleave', resume);
      container.addEventListener('touchstart', pause, { passive: true });
      container.addEventListener('touchend', resume);
      state.handlersAttached = true;
    }

    state.paused = false;
    state.pos = 0;
    tick();
  }

  function refreshMarquees() {
    if (testimonialsGrid) {
      initMarquee(testimonialsGrid, '.testimonial-card', 16, 0.8, false);
    }
    if (clientsGrid) {
      initMarquee(clientsGrid, '.client-logo', 20, 0.7);
    }
  }

  refreshMarquees();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      refreshMarquees();
      updateScrollProgress();
    }, 300);
  });

  reducedMotionQuery.addEventListener('change', refreshMarquees);

  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    if (prefersReducedMotion()) {
      revealElements.forEach(el => el.classList.add('visible'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }
});
