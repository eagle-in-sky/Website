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
  if (testimonialsGrid) {
    let animId = null;
    let isPaused = false;
    const speed = 1.2;

    function initMarquee() {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
      const cards = testimonialsGrid.querySelectorAll('.testimonial-card');
      if (cards.length === 0) return;

      testimonialsGrid.style.overflow = 'hidden';
      const track = document.createElement('div');
      track.style.cssText = 'display:flex;gap:16px;width:max-content';
      cards.forEach(c => {
        const clone = c.cloneNode(true);
        clone.classList.add('visible');
        track.appendChild(clone);
      });
      cards.forEach(c => {
        const clone = c.cloneNode(true);
        clone.classList.add('visible');
        track.appendChild(clone);
      });
      testimonialsGrid.innerHTML = '';
      testimonialsGrid.appendChild(track);

      let pos = 0;
      function tick() {
        if (window.innerWidth <= 768) {
          if (!isPaused) {
            pos -= speed;
            const cardWidth = track.children[0].offsetWidth + 16;
            const total = cardWidth * cards.length;
            if (pos <= -total) pos += total;
            track.style.transform = `translateX(${pos}px)`;
          }
          animId = requestAnimationFrame(tick);
        }
      }

      testimonialsGrid.addEventListener('mouseenter', () => { isPaused = true; });
      testimonialsGrid.addEventListener('mouseleave', () => { isPaused = false; });
      testimonialsGrid.addEventListener('touchstart', () => { isPaused = true; });
      testimonialsGrid.addEventListener('touchend', () => { isPaused = false; });

      tick();
    }

    initMarquee();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initMarquee, 300);
    });
  }

  // ── Clients Auto-Scroll (mobile only) ──
  const clientsGrid = document.querySelector('.clients-grid');
  if (clientsGrid) {
    let animId = null;
    let isPaused = false;
    const speed = 1;

    function initClientsMarquee() {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
      const logos = clientsGrid.querySelectorAll('.client-logo');
      if (logos.length === 0) return;

      clientsGrid.style.overflow = 'hidden';
      const track = document.createElement('div');
      track.style.cssText = 'display:flex;gap:20px;width:max-content;align-items:center';
      logos.forEach(l => {
        const clone = l.cloneNode(true);
        clone.classList.add('visible');
        track.appendChild(clone);
      });
      logos.forEach(l => {
        const clone = l.cloneNode(true);
        clone.classList.add('visible');
        track.appendChild(clone);
      });
      clientsGrid.innerHTML = '';
      clientsGrid.appendChild(track);

      let pos = 0;
      function tick() {
        if (window.innerWidth <= 768) {
          if (!isPaused) {
            pos -= speed;
            const itemWidth = track.children[0].offsetWidth + 20;
            const total = itemWidth * logos.length;
            if (pos <= -total) pos += total;
            track.style.transform = `translateX(${pos}px)`;
          }
          animId = requestAnimationFrame(tick);
        }
      }

      clientsGrid.addEventListener('mouseenter', () => { isPaused = true; });
      clientsGrid.addEventListener('mouseleave', () => { isPaused = false; });
      clientsGrid.addEventListener('touchstart', () => { isPaused = true; });
      clientsGrid.addEventListener('touchend', () => { isPaused = false; });

      tick();
    }

    initClientsMarquee();
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initClientsMarquee, 300);
    });
  }

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
