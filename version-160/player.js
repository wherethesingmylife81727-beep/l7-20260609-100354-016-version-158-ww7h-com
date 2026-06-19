(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(root) {
    var video = root.querySelector("video");
    var playButton = root.querySelector("[data-play-button]");
    var muteButton = root.querySelector("[data-mute-button]");
    var fullscreenButton = root.querySelector("[data-fullscreen-button]");
    var status = root.querySelector("[data-player-status]");
    var streamUrl = root.getAttribute("data-stream");
    var poster = root.getAttribute("data-poster");
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    if (poster) {
      video.setAttribute("poster", poster);
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function attachStream() {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("");
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus("网络波动，正在重新连接");
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus("播放恢复中");
            hlsInstance.recoverMediaError();
          } else {
            setStatus("视频加载失败，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        setStatus("视频加载失败，请更换浏览器重试");
      }
    }

    function togglePlay() {
      if (video.paused) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            setStatus("请再次点击播放");
          });
        }
      } else {
        video.pause();
      }
    }

    function updateLayer() {
      if (playButton) {
        playButton.classList.toggle("is-hidden", !video.paused);
      }
    }

    if (playButton) {
      playButton.addEventListener("click", togglePlay);
    }

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", function () {
      setStatus("");
      updateLayer();
    });
    video.addEventListener("pause", updateLayer);
    video.addEventListener("ended", updateLayer);

    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", function () {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });
    }

    attachStream();
    updateLayer();

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
}());
