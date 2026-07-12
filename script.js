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
  const header = document.querySelector('.header');
  const handleScroll = () => {
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
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('visible');
    mobileOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(() => { mobileOverlay.style.display = 'none'; }, 400);
  }

  if (hamburger) {
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
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
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
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => i.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ── Contact Modal ──
  const modalOverlay = document.querySelector('.modal-overlay');
  const modal = document.querySelector('.modal');
  const modalClose = document.querySelector('.modal-close');
  const modalTriggers = document.querySelectorAll('[data-modal="contact"]');

  function openModal() {
    modalOverlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
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
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
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
  let marqueeState = {};

  function initMarquee(container, itemSelector, gap, speed, mobileOnly = true) {
    const key = container === testimonialsGrid ? 'testimonials' : 'clients';
    const state = marqueeState[key] || {};
    if (state.animId) cancelAnimationFrame(state.animId);

    const items = container.querySelectorAll(itemSelector);
    if (items.length === 0) return;

    container.style.overflow = 'hidden';
    container.style.display = 'block';

    const track = document.createElement('div');
    track.style.cssText = `display:flex;gap:${gap}px;width:max-content;align-items:center`;

    const addItems = (src) => {
      src.forEach(el => {
        const clone = el.cloneNode(true);
        clone.classList.add('visible');
        track.appendChild(clone);
      });
    };
    addItems(items);
    addItems(items);

    container.innerHTML = '';
    container.appendChild(track);

    let pos = 0;
    const totalItems = items.length;

    function tick() {
      if (!mobileOnly || window.innerWidth <= 768) {
        if (!state.paused) {
          pos -= speed;
          const itemWidth = track.children[0].offsetWidth + gap;
          const total = itemWidth * totalItems;
          if (pos <= -total) pos += total;
          track.style.transform = `translateX(${pos}px)`;
        }
        state.animId = requestAnimationFrame(tick);
      }
    }

    const pause = () => { state.paused = true; };
    const resume = () => { state.paused = false; };
    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);
    container.addEventListener('touchstart', pause);
    container.addEventListener('touchend', resume);

    marqueeState[key] = { animId: null, paused: false };
    state.animId = null;
    state.paused = false;
    tick();
  }

  if (testimonialsGrid) {
    initMarquee(testimonialsGrid, '.testimonial-card', 16, 1.2, false);
  }

  const clientsGrid = document.querySelector('.clients-grid');
  if (clientsGrid) {
    initMarquee(clientsGrid, '.client-logo', 20, 1);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (testimonialsGrid) initMarquee(testimonialsGrid, '.testimonial-card', 16, 1.2, false);
      if (clientsGrid) initMarquee(clientsGrid, '.client-logo', 20, 1);
    }, 300);
  });

  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
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
