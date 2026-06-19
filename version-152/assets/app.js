(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  function setupPageFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-filter-list]');

    if (!panel || !list) {
      return;
    }

    var search = panel.querySelector('[data-page-search]');
    var typeButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]'));
    var yearButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-year]'));
    var count = panel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var activeType = 'all';
    var activeYear = 'all';

    function activate(buttons, currentButton) {
      buttons.forEach(function (button) {
        button.classList.toggle('active', button === currentButton);
      });
    }

    function apply() {
      var query = normalize(search ? search.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var region = normalize(card.getAttribute('data-region'));
        var genre = normalize(card.getAttribute('data-genre'));
        var haystack = [title, type, year, region, genre].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = activeType === 'all' || type === activeType;
        var matchesYear = activeYear === 'all' || year === activeYear;
        var isVisible = matchesQuery && matchesType && matchesYear;

        card.classList.toggle('hidden-by-filter', !isVisible);

        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部，共 ' + cards.length + ' 部。';
      }
    }

    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type') || 'all';
        activate(typeButtons, button);
        apply();
      });
    });

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || 'all';
        activate(yearButtons, button);
        apply();
      });
    });

    if (search) {
      search.addEventListener('input', apply);
    }

    apply();
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-url]'));

    players.forEach(function (player) {
      var button = player.querySelector('.play-overlay');
      var video = player.querySelector('video');
      var status = player.querySelector('[data-player-status]');
      var url = player.getAttribute('data-video-url');
      var hasStarted = false;

      if (!button || !video || !url) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function startVideo() {
        if (hasStarted) {
          video.play();
          return;
        }

        hasStarted = true;
        setStatus('正在初始化播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          player.classList.add('is-playing');
          video.play().catch(function () {
            player.classList.remove('is-playing');
            setStatus('浏览器阻止自动播放，请再次点击播放按钮。');
          });
          return;
        }

        loadHlsLibrary(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              player.classList.add('is-playing');
              video.play().catch(function () {
                player.classList.remove('is-playing');
                setStatus('浏览器阻止自动播放，请再次点击播放按钮。');
              });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus('播放源初始化失败，可刷新页面后重试。');
              }
            });
          } else {
            video.src = url;
            player.classList.add('is-playing');
            video.play().catch(function () {
              player.classList.remove('is-playing');
              setStatus('当前浏览器不支持 HLS 播放，请更换浏览器或打开播放源。');
            });
          }
        });
      }

      button.addEventListener('click', startVideo);
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-movie-card>',
      '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="play-chip">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');

    if (!results || !window.SEARCH_INDEX) {
      return;
    }

    var input = document.querySelector('[data-site-search-input]');
    var title = document.querySelector('[data-search-title]');
    var count = document.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    function runSearch(value) {
      var keyword = normalize(value);
      var matches = window.SEARCH_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.category
        ].join(' ').toLowerCase();

        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = keyword ? '搜索结果：' + value : '全部影片';
      }

      if (count) {
        count.textContent = '显示 ' + matches.length + ' 条结果；如需浏览全部影片，请进入“全部片库”。';
      }

      results.innerHTML = matches.map(movieCardTemplate).join('');
    }

    if (input) {
      input.addEventListener('input', function () {
        runSearch(input.value);
      });
    }

    runSearch(query);
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupPageFilters();
    setupPlayers();
    setupSearchPage();
  });
})();
