// Navbar dropdown and mobile menu functionality

class Navbar {
  constructor() {
    this.dropdownBtn = document.getElementById('userDropdownBtn');
    this.dropdownMenu = document.getElementById('dropdownMenu');
    this.userDropdown = document.getElementById('userDropdown');
    this.navToggle = document.getElementById('navToggle');
    this.navLinks = document.getElementById('navLinks');
    this.init();
  }

  init() {
    this.initDropdown();
    this.initMobileMenu();
  }

  // user dropdown menu
  initDropdown() {
    if (!this.dropdownBtn || !this.dropdownMenu) return;

    this.dropdownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = this.dropdownMenu.classList.contains('open');
      this.dropdownMenu.classList.toggle('open', !isOpen);
      this.dropdownBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    // close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (this.userDropdown && !this.userDropdown.contains(e.target)) {
        this.dropdownMenu.classList.remove('open');
        this.dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dropdownMenu.classList.contains('open')) {
        this.dropdownMenu.classList.remove('open');
        this.dropdownBtn.setAttribute('aria-expanded', 'false');
        this.dropdownBtn.focus();
      }
    });
  }

  // mobile navigation toggle
  initMobileMenu() {
    if (!this.navToggle || !this.navLinks) return;

    this.navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.navLinks.classList.toggle('open');
    });

    // close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.navLinks.contains(e.target) && !this.navToggle.contains(e.target)) {
        this.navLinks.classList.remove('open');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new Navbar());