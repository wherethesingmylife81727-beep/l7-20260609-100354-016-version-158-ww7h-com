(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('[data-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-error');
      }, { once: true });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          play();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          play();
        });
      });

      show(0);
      play();
    });

    var searchInput = document.querySelector('[data-search-input]');
    var searchList = document.querySelector('[data-search-list]');
    var searchStatus = document.querySelector('[data-search-status]');
    if (searchInput && searchList) {
      var cards = Array.prototype.slice.call(searchList.querySelectorAll('[data-search-text]'));
      var update = function () {
        var keyword = searchInput.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search-text') || '').toLowerCase();
          var matched = keyword === '' || text.indexOf(keyword) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (searchStatus) {
          searchStatus.textContent = '当前显示 ' + visible + ' 部影片';
        }
      };
      searchInput.addEventListener('input', update);
      update();
    }
  });
})();
