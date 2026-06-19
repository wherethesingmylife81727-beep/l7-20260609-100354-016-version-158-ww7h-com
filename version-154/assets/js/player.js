(() => {
  const setup = (player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('.play-cover');
    const src = video?.getAttribute('data-play');
    let ready = false;
    let hls = null;

    const bind = () => {
      if (!video || !src || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      ready = true;
    };

    const play = () => {
      if (!video) {
        return;
      }

      bind();
      player.classList.add('is-playing');
      video.controls = true;
      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          player.classList.remove('is-playing');
        });
      }
    };

    button?.addEventListener('click', play);
    video?.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.querySelectorAll('[data-player]').forEach(setup);
})();
