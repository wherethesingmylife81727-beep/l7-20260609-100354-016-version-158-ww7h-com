(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var textInput = panel.querySelector(".js-filter-input");
      var yearSelect = panel.querySelector(".js-year-filter");
      var typeSelect = panel.querySelector(".js-type-filter");
      var clearButton = panel.querySelector(".js-clear-filter");
      function matchYear(cardYear, target) {
        if (!target) {
          return true;
        }
        if (target === "older") {
          return Number(cardYear) < 2020;
        }
        return String(cardYear) === target;
      }
      function apply() {
        var query = normalize(textInput ? textInput.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var type = normalize(typeSelect ? typeSelect.value : "");
        cards.forEach(function (card) {
          var search = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = card.getAttribute("data-year") || "";
          var visible = (!query || search.indexOf(query) !== -1) && matchYear(cardYear, year) && (!type || cardType.indexOf(type) !== -1);
          card.classList.toggle("is-hidden", !visible);
        });
      }
      [textInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (textInput) {
            textInput.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          apply();
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
