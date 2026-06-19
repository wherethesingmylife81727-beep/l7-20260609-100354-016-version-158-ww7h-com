(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var form = document.querySelector("[data-filter-form]");
    var list = document.querySelector("[data-card-list]");
    if (!form || !list) {
      return;
    }
    var searchBox = form.querySelector("[data-search-box]");
    var yearFilter = form.querySelector("[data-year-filter]");
    var sortSelect = form.querySelector("[data-sort-select]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (initial && searchBox) {
      searchBox.value = initial;
    }

    function apply() {
      var keyword = normalize(searchBox ? searchBox.value : "");
      var year = yearFilter ? yearFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var keep = matchKeyword && matchYear;
        card.style.display = keep ? "" : "none";
        if (keep) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : "default";
      var sorted = cards.slice();
      if (mode === "rating") {
        sorted.sort(function (a, b) {
          return parseFloat(b.getAttribute("data-rating")) - parseFloat(a.getAttribute("data-rating"));
        });
      } else if (mode === "year") {
        sorted.sort(function (a, b) {
          return parseInt(b.getAttribute("data-year") || "0", 10) - parseInt(a.getAttribute("data-year") || "0", 10);
        });
      } else if (mode === "title") {
        sorted.sort(function (a, b) {
          return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-CN");
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      apply();
    }

    if (searchBox) {
      searchBox.addEventListener("input", apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }
    apply();
  }

  ready(function () {
    setupImages();
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
