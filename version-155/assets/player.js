(function () {
  function attach(video, source) {
    if (video.__movieReady) {
      return;
    }
    video.__movieReady = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.__hls = hls;
    } else {
      video.src = source;
    }
  }

  window.MoviePlayer = {
    start: function (source) {
      var video = document.querySelector("[data-movie-player]");
      var shell = document.querySelector("[data-player-shell]");
      var mask = document.querySelector("[data-play-mask]");
      if (!video || !shell || !source) {
        return;
      }
      function play() {
        attach(video, source);
        shell.classList.add("is-playing");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
      if (mask) {
        mask.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
    }
  };
})();
