(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };

    var start = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var clearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-clear-search]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  var filterCards = function (value) {
    var keyword = String(value || '').trim().toLowerCase();
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.textContent
      ].join(' ').toLowerCase();
      card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
    });
  };

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = input.value;
        }
      });
      filterCards(input.value);
    });
  });

  clearButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      searchInputs.forEach(function (input) {
        input.value = '';
      });
      filterCards('');
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var button = player.querySelector('.play-button');

    if (!video || !cover || !button) {
      return;
    }

    var bind = function () {
      var stream = video.getAttribute('data-stream');
      if (!stream || video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', '1');
    };

    var play = function () {
      bind();
      cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    cover.addEventListener('click', play);
    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  });
})();
