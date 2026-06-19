(function () {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const searchInput = document.querySelector(".site-search");
  const cards = Array.from(document.querySelectorAll(".searchable-card"));

  if (searchInput && cards.length) {
    searchInput.addEventListener("input", function () {
      const words = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);

      cards.forEach(function (card) {
        const content = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        const matched = words.every(function (word) {
          return content.indexOf(word) !== -1;
        });

        card.classList.toggle("is-hidden", !matched);
      });
    });
  }
}());
