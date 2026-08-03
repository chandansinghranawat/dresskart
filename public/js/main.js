// DressKart India - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const categoryNav = document.getElementById('catNav');
  const scrollTopButton = document.getElementById('scrollTop');
  const currentYear = document.getElementById('currentYear');

  /*
   * Set current footer year
   */
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /*
   * Mobile navigation
   */
  if (hamburger && categoryNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = categoryNav.classList.toggle('mobile-open');

      hamburger.setAttribute('aria-expanded', String(isOpen));

      hamburger.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    categoryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        categoryNav.classList.remove('mobile-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  /*
   * Account dropdown on mobile and touch devices
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

  document.addEventListener('click', () => {
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

    if (window.scrollY > 450) {
      scrollTopButton.classList.add('visible');
    } else {
      scrollTopButton.classList.remove('visible');
    }
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
   * Add loading feedback to submitted forms
   */
  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', () => {
      const submitButton = form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

      if (!submitButton || submitButton.dataset.noLoading === 'true') {
        return;
      }

      submitButton.classList.add('is-loading');
    });
  });
});

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
   * Mobile menu
   */
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('mobile-open');

      hamburger.setAttribute('aria-expanded', String(isOpen));

      hamburger.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';

      if (searchPanel) {
        searchPanel.classList.remove('open');
      }
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('mobile-open');

        hamburger.setAttribute('aria-expanded', 'false');

        hamburger.innerHTML =
          '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  /*
   * Header search
   */
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', () => {
      searchPanel.classList.toggle('open');

      if (mobileNav) {
        mobileNav.classList.remove('mobile-open');
      }

      if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');

        hamburger.innerHTML =
          '<i class="fa-solid fa-bars"></i>';
      }

      if (searchPanel.classList.contains('open')) {
        const searchInput = searchPanel.querySelector('input');

        if (searchInput) {
          window.setTimeout(() => {
            searchInput.focus();
          }, 100);
        }
      }
    });
  }

  /*
   * Account dropdown
   */
  document.querySelectorAll('.dropdown-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const dropdown = trigger.closest('.dropdown');

      document
        .querySelectorAll('.dropdown.open')
        .forEach((openedDropdown) => {
          if (openedDropdown !== dropdown) {
            openedDropdown.classList.remove('open');
          }
        });

      if (dropdown) {
        dropdown.classList.toggle('open');
      }
    });
  });

  document.addEventListener('click', () => {
    document
      .querySelectorAll('.dropdown.open')
      .forEach((dropdown) => {
        dropdown.classList.remove('open');
      });
  });

  /*
   * Alert close and auto remove
   */
  document.querySelectorAll('.alert').forEach((alert) => {
    const closeButton = alert.querySelector('.alert-close');

    const removeAlert = () => {
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
   * Scroll top
   */
  const handleScroll = () => {
    if (!scrollTopButton) {
      return;
    }

    if (window.scrollY > 450) {
      scrollTopButton.classList.add('visible');
    } else {
      scrollTopButton.classList.remove('visible');
    }
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
});