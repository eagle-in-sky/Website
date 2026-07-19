/* ================================================================
   ADYVANCE — Interactive Scripts
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Preloader ──
  const preloader = document.querySelector('.preloader');
  const finishLoading = () => {
    if (preloader) preloader.classList.add('hidden');
    document.body.classList.add('is-loaded');
  };
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(finishLoading, 500);
    });
    // Fallback — hide after 3s max
    setTimeout(finishLoading, 3000);
  } else {
    finishLoading();
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
  const floatingContact = document.querySelector('.floating-contact');
  const handleScroll = () => {
    if (!header) return;
    const isScrolled = window.scrollY > 40;
    header.classList.toggle('scrolled', isScrolled);
    if (floatingContact) floatingContact.classList.toggle('scrolled', isScrolled);
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
    } else {
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
  }

  // ── Marquee Badges (scrolling word strips) ──
  document.querySelectorAll('.badge[data-marquee]').forEach(badge => {
    const word = badge.getAttribute('data-marquee');
    if (!word) return;

    badge.setAttribute('aria-label', word);
    badge.textContent = '';

    const track = document.createElement('span');
    track.className = 'badge-track';
    track.setAttribute('aria-hidden', 'true');

    // Each half of the track must be wider than the badge for a seamless
    // -50% loop; short phrases repeat, long strips fit in one pass.
    const phrase = word + ' • ';
    const reps = Math.max(1, Math.ceil(36 / phrase.length));

    for (let i = 0; i < 2; i += 1) {
      const seg = document.createElement('span');
      seg.className = 'badge-seg';
      seg.textContent = phrase.repeat(reps);
      track.appendChild(seg);
    }

    track.style.animationDuration = (phrase.length * reps * 0.45).toFixed(1) + 's';
    badge.appendChild(track);
  });

  // ── Animated Counters ──
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length > 0) {
    const finalText = el => el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');

    if (prefersReducedMotion()) {
      counters.forEach(el => { el.textContent = finalText(el); });
    } else {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          counterObserver.unobserve(entry.target);

          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-count'));
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1500;
          let startTime = null;

          if (!isFinite(target)) {
            el.textContent = finalText(el);
            return;
          }

          const step = (now) => {
            if (startTime === null) startTime = now;
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
        });
      }, { threshold: 0.5 });

      counters.forEach(el => {
        el.textContent = '0' + (el.getAttribute('data-suffix') || '');
        counterObserver.observe(el);
      });
    }
  }

  // ── In-View Gate for Process Chart ──
  const processVisual = document.querySelector('.process-visual');
  if (processVisual) {
    if (prefersReducedMotion()) {
      processVisual.classList.add('in-view');
    } else {
      const processObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            processVisual.classList.add('in-view');
            processObserver.disconnect();
          }
        });
      }, { threshold: 0.35 });
      processObserver.observe(processVisual);
    }
  }

  // ── 3D Tilt + Scroll Parallax on Service Visuals ──
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const tiltTargets = Array.from(document.querySelectorAll('.service-visual-wrapper'));

  if (tiltTargets.length > 0 && !prefersReducedMotion()) {
    const tiltStates = new Map();
    tiltTargets.forEach(el => tiltStates.set(el, {
      rx: 0, ry: 0, targetRx: 0, targetRy: 0,
      py: 0, targetPy: 0, active: false
    }));

    const tiltVisibility = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const state = tiltStates.get(entry.target);
        if (state) state.active = entry.isIntersecting;
      });
    }, { rootMargin: '100px 0px' });

    tiltTargets.forEach(el => {
      tiltVisibility.observe(el);

      if (finePointer.matches) {
        el.addEventListener('mousemove', (e) => {
          const state = tiltStates.get(el);
          const rect = el.getBoundingClientRect();
          state.targetRy = ((e.clientX - rect.left) / rect.width - 0.5) * 9;
          state.targetRx = (0.5 - (e.clientY - rect.top) / rect.height) * 7;
        });
        el.addEventListener('mouseleave', () => {
          const state = tiltStates.get(el);
          state.targetRx = 0;
          state.targetRy = 0;
        });
      }
    });

    const tiltFrame = () => {
      const viewCenter = window.innerHeight / 2;
      tiltStates.forEach((state, el) => {
        if (!state.active) return;
        const rect = el.getBoundingClientRect();
        state.targetPy = ((rect.top + rect.height / 2) - viewCenter) * -0.055;
        state.rx += (state.targetRx - state.rx) * 0.12;
        state.ry += (state.targetRy - state.ry) * 0.12;
        state.py += (state.targetPy - state.py) * 0.12;
        el.style.transform =
          `perspective(900px) translate3d(0, ${state.py.toFixed(2)}px, 0) ` +
          `rotateX(${state.rx.toFixed(2)}deg) rotateY(${state.ry.toFixed(2)}deg)`;
      });
      requestAnimationFrame(tiltFrame);
    };
    requestAnimationFrame(tiltFrame);
  }

  // ── Hero Blob Mouse Parallax ──
  const heroSection = document.querySelector('.hero');
  const heroBlobs = Array.from(document.querySelectorAll('.hero-blob'));

  if (heroSection && heroBlobs.length > 0 && finePointer.matches && !prefersReducedMotion()) {
    let pointerX = 0;
    let pointerY = 0;
    const blobPositions = heroBlobs.map(() => ({ x: 0, y: 0 }));

    heroSection.addEventListener('mousemove', (e) => {
      pointerX = e.clientX / window.innerWidth - 0.5;
      pointerY = e.clientY / window.innerHeight - 0.5;
    });

    const blobFrame = () => {
      heroBlobs.forEach((blob, i) => {
        const factor = parseFloat(blob.getAttribute('data-drift') || '20');
        const pos = blobPositions[i];
        pos.x += (pointerX * factor - pos.x) * 0.05;
        pos.y += (pointerY * factor - pos.y) * 0.05;
        blob.style.setProperty('--mx', pos.x.toFixed(2) + 'px');
        blob.style.setProperty('--my', pos.y.toFixed(2) + 'px');
      });
      requestAnimationFrame(blobFrame);
    };
    requestAnimationFrame(blobFrame);
  }

  // ── Magnetic Buttons ──
  if (finePointer.matches && !prefersReducedMotion()) {
    document.querySelectorAll('.btn-primary, .btn-outline, .form-submit').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
        btn.style.transform = `translate(${(dx * 10).toFixed(1)}px, ${(dy * 8 - 2).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
});
