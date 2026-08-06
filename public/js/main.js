// DressKart India - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('catNav');

  const searchToggle = document.getElementById('headerSearchToggle');
  const searchPanel = document.getElementById('headerSearchPanel');

  const scrollTopButton = document.getElementById('scrollTop');
  const currentYear = document.getElementById('currentYear');

  /*
   * Current footer year
   */
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /*
   * Close mobile menu
   */
  const closeMobileNav = () => {
    if (!mobileNav || !hamburger) {
      return;
    }

    mobileNav.classList.remove('mobile-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
  };

  /*
   * Close search panel
   */
  const closeSearch = () => {
    if (searchPanel) {
      searchPanel.classList.remove('open');
    }
  };

  /*
   * Mobile navigation
   */
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', (event) => {
      event.stopPropagation();

      const isOpen = mobileNav.classList.toggle('mobile-open');

      hamburger.setAttribute('aria-expanded', String(isOpen));

      hamburger.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';

      closeSearch();
    });

    mobileNav.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });
  }

  /*
   * Header search
   */
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = searchPanel.classList.toggle('open');

      closeMobileNav();

      if (isOpen) {
        const searchInput = searchPanel.querySelector('input');

        if (searchInput) {
          window.setTimeout(() => {
            searchInput.focus();
          }, 100);
        }
      }
    });

    searchPanel.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  /*
   * Account dropdowns
   */
  document.querySelectorAll('.dropdown-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const dropdown = trigger.closest('.dropdown');

      document.querySelectorAll('.dropdown.open').forEach((openedDropdown) => {
        if (openedDropdown !== dropdown) {
          openedDropdown.classList.remove('open');
        }
      });

      if (dropdown) {
        dropdown.classList.toggle('open');
      }
    });
  });

  /*
   * Close dropdowns, search and menu on outside click
   */
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.open').forEach((dropdown) => {
      dropdown.classList.remove('open');
    });

    closeSearch();
    closeMobileNav();
  });

  /*
   * Escape key handling
   */
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    closeMobileNav();
    closeSearch();

    document.querySelectorAll('.dropdown.open').forEach((dropdown) => {
      dropdown.classList.remove('open');
    });
  });

  /*
   * Flash alerts
   */
  document.querySelectorAll('.alert').forEach((alert) => {
    const closeButton = alert.querySelector('.alert-close');

    const removeAlert = () => {
      if (!alert.isConnected) {
        return;
      }

      alert.classList.add('alert-hiding');

      window.setTimeout(() => {
        alert.remove();
      }, 300);
    };

    if (closeButton) {
      closeButton.addEventListener('click', removeAlert);
    }

    window.setTimeout(removeAlert, 4500);
  });

  /*
   * Scroll-to-top button
   */
  const handleScroll = () => {
    if (!scrollTopButton) {
      return;
    }

    scrollTopButton.classList.toggle(
      'visible',
      window.scrollY > 450
    );
  };

  window.addEventListener('scroll', handleScroll, {
    passive: true
  });

  handleScroll();

  if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /*
   * Loading feedback for forms
   */
  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', () => {
      const submitButton = form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

      if (
        !submitButton ||
        submitButton.dataset.noLoading === 'true'
      ) {
        return;
      }

      submitButton.classList.add('is-loading');
      submitButton.setAttribute('aria-busy', 'true');

      if (submitButton.tagName === 'BUTTON') {
        submitButton.dataset.originalText =
          submitButton.innerHTML;

        submitButton.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Please wait...';
      }
    });
  });

  /*
   * Quantity controls
   */
  document.querySelectorAll('[data-qty-control]').forEach((control) => {
    const minusButton = control.querySelector('[data-qty-minus]');
    const plusButton = control.querySelector('[data-qty-plus]');
    const quantityInput = control.querySelector('[data-qty-input]');

    if (!quantityInput) {
      return;
    }

    const getMinimum = () => {
      const value = Number(quantityInput.min);

      return Number.isFinite(value) ? value : 1;
    };

    const getMaximum = () => {
      const value = Number(quantityInput.max);

      return Number.isFinite(value) && value > 0
        ? value
        : Infinity;
    };

    const updateQuantity = (nextValue) => {
      const minimum = getMinimum();
      const maximum = getMaximum();

      const safeValue = Math.min(
        maximum,
        Math.max(minimum, nextValue)
      );

      quantityInput.value = safeValue;

      quantityInput.dispatchEvent(
        new Event('change', {
          bubbles: true
        })
      );
    };

    if (minusButton) {
      minusButton.addEventListener('click', () => {
        const currentValue =
          Number(quantityInput.value) || getMinimum();

        updateQuantity(currentValue - 1);
      });
    }

    if (plusButton) {
      plusButton.addEventListener('click', () => {
        const currentValue =
          Number(quantityInput.value) || getMinimum();

        updateQuantity(currentValue + 1);
      });
    }

    quantityInput.addEventListener('change', () => {
      const currentValue =
        Number(quantityInput.value) || getMinimum();

      updateQuantity(currentValue);
    });
  });

  /*
   * Smooth scrolling for internal links
   */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');

      if (!href || href === '#') {
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      closeMobileNav();
    });
  });

  /*
   * Add shadow to sticky navbar on scroll
   */
  const navbar = document.querySelector('.navbar');

  const updateNavbar = () => {
    if (!navbar) {
      return;
    }

    navbar.classList.toggle(
      'navbar-scrolled',
      window.scrollY > 15
    );
  };

  window.addEventListener('scroll', updateNavbar, {
    passive: true
  });

  updateNavbar();
});