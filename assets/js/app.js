(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;

            function show(next) {
                if (!slides.length) {
                    return;
                }
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function restart(next) {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(next);
                start();
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    restart(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                });
            });

            show(0);
            start();
        }

        var filterRoot = document.querySelector("[data-filter-root]");
        if (filterRoot) {
            var input = filterRoot.querySelector("[data-filter-input]");
            var typeSelect = filterRoot.querySelector("[data-filter-type]");
            var regionSelect = filterRoot.querySelector("[data-filter-region]");
            var yearSelect = filterRoot.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
            var empty = filterRoot.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";

            if (input && q) {
                input.value = q;
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var region = normalize(regionSelect ? regionSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var title = normalize(card.getAttribute("data-title"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var tags = normalize(card.getAttribute("data-tags"));
                    var haystack = [title, cardType, cardRegion, cardYear, tags].join(" ");
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchType = !type || cardType === type;
                    var matchRegion = !region || cardRegion === region;
                    var matchYear = !year || cardYear === year;
                    var showCard = matchKeyword && matchType && matchRegion && matchYear;
                    card.style.display = showCard ? "" : "none";
                    if (showCard) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        }
    });
})();
