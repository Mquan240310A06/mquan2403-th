// Script for Lenis smooth scroll, GSAP ScrollTrigger animations, and Modal logic

// --------- Lenis init (smooth scroll) ---------
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easing
  smooth: true,
  direction: 'vertical'
});

// GSAP + ScrollTrigger integration with Lenis
gsap.registerPlugin(ScrollTrigger);

// Let ScrollTrigger use Lenis as the scroller proxy
ScrollTrigger.scrollerProxy(document.documentElement, {
  scrollTop(value) {
    if (arguments.length) {
      lenis.scrollTo(value);
    }
    return lenis.scroll;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
  // pinType: if transform is used on documentElement by Lenis, use 'transform' else 'fixed'
  pinType: document.documentElement.style.transform ? "transform" : "fixed"
});

// RAF loop for Lenis and to update ScrollTrigger
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Update ScrollTrigger on scroll events from Lenis
lenis.on('scroll', ScrollTrigger.update);

// Ensure ScrollTrigger recalculates sizes after load/resize
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

// --------- GSAP Animations ---------
// Hero reveal
gsap.from(".hero-card", {
  y: 30,
  opacity: 0,
  duration: 1,
  ease: "power3.out"
});

// Cards stagger when they enter viewport
gsap.from(".card", {
  scrollTrigger: {
    trigger: ".cards-grid",
    start: "top 80%",
    end: "bottom 10%",
    scrub: false
  },
  y: 30,
  opacity: 0,
  stagger: 0.12,
  duration: 0.7,
  ease: "power3.out"
});

// Slight parallax background scale for hero as user scrolls
gsap.to(".hero-bg", {
  scale: 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});

// Buttons/hover scale subtle interaction handled by CSS; add micro-interactions on focus via JS if needed

// --------- Modal Logic ---------
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalDetail = document.getElementById('modal-detail');
const modalMedia = document.getElementById('modal-media');
const yearEl = document.getElementById('year');

// Set current year
if (yearEl) yearEl.textContent = new Date().getFullYear();

// helper to open modal with content
function openModal({title, detail, img}) {
  modalTitle.textContent = title || '';
  modalDetail.textContent = detail || '';
  // media
  if (img) {
    modalMedia.innerHTML = `<img src="${img}" alt="${title}">`;
    modalMedia.style.display = 'block';
  } else {
    modalMedia.innerHTML = '';
    modalMedia.style.display = 'none';
  }

  modal.setAttribute('aria-hidden', 'false');
  // animate in
  gsap.fromTo(".modal-panel", {y: 20, opacity: 0, scale: 0.98}, {y:0, opacity:1, scale:1, duration:0.36, ease:"power3.out"});
  // lock scroll via Lenis
  lenis.stop(); // stop smooth scrolling input while modal open
}

// helper to close modal
function closeModal() {
  gsap.to(".modal-panel", {y: 10, opacity: 0, scale: 0.98, duration:0.22, ease:"power2.in", onComplete: () => {
    modal.setAttribute('aria-hidden', 'true');
    modalMedia.innerHTML = '';
    // resume lenis
    lenis.start();
  }});
}

// attach click handlers for cards
document.querySelectorAll('.card').forEach(card => {
  const btn = card.querySelector('.card-btn') || card;
  const title = card.dataset.title || card.querySelector('.card-title')?.innerText || 'Chi tiết';
  const detail = card.dataset.detail || '';
  const img = card.dataset.img || null;

  function handler(e){
    e.preventDefault();
    openModal({title, detail, img});
  }

  btn.addEventListener('click', handler);
  // allow entire card click to open
  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      handler(ev);
    }
  });
});

// close on overlay or close button
document.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });
});

// close on Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});

// smooth scroll for CTA button (using lenis)
document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = document.querySelector(btn.dataset.goto);
    if (target) {
      e.preventDefault();
      lenis.scrollTo(target, {offset: -20, duration: 1.1});
    }
  });
});
