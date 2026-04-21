// navbar dropdown and mobile menu functionality
(function () {
  document.addEventListener('DOMContentLoaded', function () {

    // user dropdown menu
    const dropdownBtn = document.getElementById('userDropdownBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const userDropdown = document.getElementById('userDropdown');

    if (dropdownBtn && dropdownMenu) {
      dropdownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dropdownMenu.classList.contains('open');
        dropdownMenu.classList.toggle('open', !isOpen);
        dropdownBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      // close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (userDropdown && !userDropdown.contains(e.target)) {
          dropdownMenu.classList.remove('open');
          dropdownBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // close dropdown on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('open')) {
          dropdownMenu.classList.remove('open');
          dropdownBtn.setAttribute('aria-expanded', 'false');
          dropdownBtn.focus();
        }
      });
    }

    // mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navLinks.classList.toggle('open');
      });

      // close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
          navLinks.classList.remove('open');
        }
      });
    }
  });
})();