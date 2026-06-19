(function () {
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function card(item) {
    var tags = [item.region, item.type].concat(item.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function run() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    if (!results || !window.SEARCH_ITEMS) {
      return;
    }
    if (input) {
      input.value = query;
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    function render(value) {
      var key = normalize(value);
      var list = window.SEARCH_ITEMS.filter(function (item) {
        var haystack = normalize([item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(" ")].join(" "));
        return !key || haystack.indexOf(key) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.map(card).join("");
    }
    render(query);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
