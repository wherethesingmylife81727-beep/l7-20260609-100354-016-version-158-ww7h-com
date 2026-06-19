(function () {
  var hlsScripts = [
    'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js',
    'https://unpkg.com/hls.js@1.5.18/dist/hls.min.js'
  ];
  var loading = false;
  var loadedCallbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    loadedCallbacks.push(callback);
    if (loading) {
      return;
    }
    loading = true;
    var index = 0;

    function tryNext() {
      if (index >= hlsScripts.length) {
        loadedCallbacks.splice(0).forEach(function (item) {
          item(null);
        });
        return;
      }
      var script = document.createElement('script');
      script.src = hlsScripts[index];
      script.async = true;
      script.onload = function () {
        loadedCallbacks.splice(0).forEach(function (item) {
          item(window.Hls);
        });
      };
      script.onerror = function () {
        index += 1;
        tryNext();
      };
      document.head.appendChild(script);
    }

    tryNext();
  }

  function attachPlayer(panel) {
    var sourceUrl = panel.getAttribute('data-hls-src');
    var shell = panel.querySelector('.video-shell');
    var video = panel.querySelector('video');
    var button = panel.querySelector('.player-start');
    var attached = false;
    var hlsInstance = null;

    if (!sourceUrl || !shell || !video) {
      return;
    }

    function attachSource(callback) {
      if (attached) {
        callback();
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        callback();
        return;
      }
      loadHls(function (HlsConstructor) {
        if (HlsConstructor && HlsConstructor.isSupported()) {
          hlsInstance = new HlsConstructor({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
          callback();
        } else {
          video.src = sourceUrl;
          callback();
        }
      });
    }

    function start() {
      shell.classList.add('is-playing');
      attachSource(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }
      start();
    });

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('[data-hls-src]').forEach(attachPlayer);
    });
  } else {
    document.querySelectorAll('[data-hls-src]').forEach(attachPlayer);
  }
})();
