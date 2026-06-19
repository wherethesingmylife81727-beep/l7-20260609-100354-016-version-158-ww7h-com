(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-filter-root]').forEach((root) => {
    const input = root.querySelector('[data-search-input]');
    const typeSelect = root.querySelector('[data-type-filter]');
    const yearSelect = root.querySelector('[data-year-filter]');
    const scope = root.parentElement || document;
    const cards = Array.from(scope.querySelectorAll('[data-card]'));

    const apply = () => {
      const query = (input?.value || '').trim().toLowerCase();
      const type = typeSelect?.value || '';
      const year = yearSelect?.value || '';

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title || '',
          card.dataset.type || '',
          card.dataset.year || '',
          card.dataset.keywords || ''
        ].join(' ').toLowerCase();
        const typeOk = !type || (card.dataset.type || '').includes(type);
        const yearOk = !year || (card.dataset.year || '') === year;
        const queryOk = !query || haystack.includes(query);
        card.classList.toggle('is-hidden', !(typeOk && yearOk && queryOk));
      });
    };

    input?.addEventListener('input', apply);
    typeSelect?.addEventListener('change', apply);
    yearSelect?.addEventListener('change', apply);
  });

  document.querySelectorAll('[data-hero]').forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    prev?.addEventListener('click', () => {
      show(index - 1);
      restart();
    });

    next?.addEventListener('click', () => {
      show(index + 1);
      restart();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        restart();
      });
    });

    if (slides.length > 1) {
      start();
    }
  });
})();
