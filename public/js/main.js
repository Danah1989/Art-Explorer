// global app: mobile nav, alerts, lazy images, and custom event listeners
class App {
  constructor() {
    this.navToggle = document.getElementById('navToggle');
    this.navLinks = document.querySelector('.nav-links');
    this.init();
  }

  init() {
    this.initNavToggle();
    this.initAlerts();
    this.initLazyImages();
    this.initEventListeners();
  }

  // mobile navigation toggle
  initNavToggle() {
    if (!this.navToggle || !this.navLinks) return;

    this.navToggle.addEventListener('click', () => {
      this.navLinks.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!this.navToggle.contains(e.target) && !this.navLinks.contains(e.target)) {
        this.navLinks.classList.remove('open');
      }
    });
  }

  // auto-dismiss flash alerts after 5 seconds
  initAlerts() {
    document.querySelectorAll('.alert').forEach(el => {
      setTimeout(() => {
        el.style.transition = 'opacity 0.4s ease';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
      }, 5000);
    });
  }

  // lazy loading for images using intersectionobserver
  initLazyImages() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }

  // listen for custom events from other classes
  initEventListeners() {
    // when favorites change, update any ui that needs it
    document.addEventListener('favoritesChanged', (e) => {
      console.log(`[app] favorites ${e.detail.action}: ${e.detail.artworkId}`);
      // could update favorite count badge here if needed
    });

    // when filters are applied, you could add loading state
    document.addEventListener('filterApplied', (e) => {
      console.log(`[app] filter applied: ${e.detail.type} = ${e.detail.value}`);
    });
  }
}

// initialize
new App();