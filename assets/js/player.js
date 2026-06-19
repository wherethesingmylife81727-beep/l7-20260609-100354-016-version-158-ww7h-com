(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var panel = document.querySelector(".player-panel[data-stream]");
        if (!panel) {
            return;
        }

        var video = panel.querySelector("video");
        var button = panel.querySelector(".play-cover");
        var stream = panel.getAttribute("data-stream");
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !video || !stream) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            attached = true;
        }

        function start() {
            attach();
            panel.classList.add("is-playing");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    panel.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                panel.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    panel.classList.remove("is-playing");
                }
            });
            video.addEventListener("ended", function () {
                panel.classList.remove("is-playing");
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    });
})();
