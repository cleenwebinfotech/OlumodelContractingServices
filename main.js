/* ============================================
   OLUMODEL CONTRACTING SERVICES
   Shared JavaScript
   ============================================ */

// ===== Supabase client =====
import { createClient } from '@supabase/supabase-js';

const NOTIFY_EMAIL = 'Olumodel1@gmail.com';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// ===== Header scroll effect =====
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  });
}

// ===== Mobile nav toggle =====
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is tapped
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ===== Highlight active nav link =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ===== Scroll reveal =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ===== Hero slider =====
function initSlider() {
  const slides = document.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__dot');
  const prevBtn = document.querySelector('.hero__arrow--prev');
  const nextBtn = document.querySelector('.hero__arrow--next');

  if (slides.length === 0) return;

  let current = 0;
  let interval = null;

  function show(index) {
    slides.forEach((s) => s.classList.remove('active'));
    dots.forEach((d) => d.classList.remove('active'));
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    current = index;
  }

  function next() {
    show((current + 1) % slides.length);
  }

  function prev() {
    show((current - 1 + slides.length) % slides.length);
  }

  function startAuto() {
    stopAuto();
    interval = setInterval(next, 6000);
  }

  function stopAuto() {
    if (interval) clearInterval(interval);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      startAuto();
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      next();
      startAuto();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prev();
      startAuto();
    });
  }

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
  }

  startAuto();
}

initSlider();

// ===== Lightbox (gallery) =====
function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox img');
  const closeBtn = document.querySelector('.lightbox__close');

  if (items.length === 0 || !lightbox) return;

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

initLightbox();

// ===== Form submission =====
async function handleFormSubmit(form) {
  const alertBox = form.querySelector('.form-alert');
  const submitBtn = form.querySelector('[type="submit"]');
  const source = form.dataset.source || 'contact';

  const data = {
    name: form.querySelector('[name="name"]').value.trim(),
    email: form.querySelector('[name="email"]').value.trim(),
    phone: form.querySelector('[name="phone"]')?.value.trim() || null,
    service: form.querySelector('[name="service"]')?.value || null,
    message: form.querySelector('[name="message"]').value.trim(),
    source,
  };

  if (!data.name || !data.email || !data.message) {
    if (alertBox) {
      alertBox.className = 'form-alert form-alert--error show';
      alertBox.textContent = 'Please fill in all required fields.';
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }

  try {
    if (!supabase) throw new Error('Database not configured');

    const { error: dbError } = await supabase.from('enquiries').insert([data]);
    if (dbError) throw dbError;

    const emailResponse = await fetch(`https://formsubmit.co/ajax/${NOTIFY_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `New ${source === 'quote' ? 'quote request' : 'contact message'} from ${data.name}`,
        _template: 'table',
        _captcha: 'false',
        ...data,
      }),
    });
    if (!emailResponse.ok) throw new Error(`Email failed (${emailResponse.status})`);

    if (alertBox) {
      alertBox.className = 'form-alert form-alert--success show';
      alertBox.textContent =
        "Thank you! Your enquiry has been submitted. We'll get back to you soon.";
    }
    form.reset();
  } catch (err) {
    if (alertBox) {
      alertBox.className = 'form-alert form-alert--error show';
      alertBox.textContent =
        'Sorry, something went wrong. Please try again or call us at 902-574-8724.';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.label || 'Submit';
    }
  }
}

document.querySelectorAll('form[data-submit]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(form);
  });
});
