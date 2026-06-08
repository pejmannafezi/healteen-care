/* ===== Ronica's friends — homepage interactions ===== */
(function () {
  "use strict";

  /* Inline SVG soda cup, recolored per drink */
  function cupSVG(fill, foam) {
    return (
      '<svg viewBox="0 0 100 150" role="img" aria-label="Soda cup">' +
      '<defs><clipPath id="c"><path d="M22 38 H78 L72 140 Q71 146 65 146 H35 Q29 146 28 140 Z"/></clipPath></defs>' +
      '<path d="M22 38 H78 L72 140 Q71 146 65 146 H35 Q29 146 28 140 Z" fill="' + fill + '"/>' +
      '<g clip-path="url(#c)"><rect x="20" y="38" width="60" height="26" fill="' + foam + '"/>' +
      '<circle cx="40" cy="58" r="7" fill="' + foam + '"/><circle cx="60" cy="62" r="9" fill="' + foam + '"/></g>' +
      '<ellipse cx="50" cy="38" rx="29" ry="7" fill="' + foam + '"/>' +
      '<rect x="46" y="6" width="8" height="40" rx="4" fill="#fffdf8" transform="rotate(12 50 26)"/>' +
      '</svg>'
    );
  }

  var DRINKS = {
    summer: {
      blurb: "Dragon Fruit Summer is back. Our biggest menu of the year.",
      cards: [
        { name: "Dragonada", price: 5.49, art: cupSVG("#ffd34d", "#fff3c9"), ingredients: "Roasted Sprite • Pineapple • Dragon Fruit • Pineapple Purée • Frozen Pineapple • Coconut Cream" },
        { name: "Dragon Dew", price: 5.49, art: cupSVG("#ff5d8f", "#ffd6e4"), ingredients: "Mountain Dew • Lemonade • Dragon Fruit • Raspberry Purée • Vanilla Cream • Frozen Dragon Fruit" },
        { name: "Flame Kissed", price: 5.49, art: cupSVG("#ff3b3b", "#ffd0c2"), ingredients: "Sprite • Strawberry • Peach • Dragon Fruit Purée • Frozen Dragon Fruit" },
      ],
    },
    dirty: {
      blurb: "The originals. Soda + cream + a little magic.",
      cards: [
        { name: "Dirty Dr. Ronica", price: 4.49, art: cupSVG("#7a4a2b", "#e8c9a8"), ingredients: "Dr Pepper • Coconut Cream • Fresh Lime • Vanilla" },
        { name: "Cookie Dough Cola", price: 4.49, art: cupSVG("#5c3a23", "#e3cbb0"), ingredients: "Coca-Cola • Vanilla Cream • Toasted Coconut • Caramel Drizzle" },
        { name: "The Founder", price: 4.29, art: cupSVG("#3f2a1a", "#d8bfa3"), ingredients: "Diet Coke • Coconut • Cream • Fresh Lime Squeeze" },
      ],
    },
    refreshers: {
      blurb: "Light, fizzy & frozen — built for hot days.",
      cards: [
        { name: "Tiger's Blood", price: 4.99, art: cupSVG("#ff4d6d", "#ffd0da"), ingredients: "Watermelon • Strawberry • Coconut • Frozen Slush" },
        { name: "Blue Lagoon", price: 4.99, art: cupSVG("#3fa9f5", "#cfe9ff"), ingredients: "Lemonade • Blue Raspberry • Coconut • Frozen" },
        { name: "Mango Tango", price: 4.99, art: cupSVG("#ffb02e", "#ffe6b8"), ingredients: "Mango • Passionfruit • Lime • Sparkling Water" },
      ],
    },
    treats: {
      blurb: "Warm, gooey & made to share.",
      cards: [
        { name: "Sugar Friend Cookie", price: 2.99, art: cupSVG("#f6d6a8", "#fff0d6"), ingredients: "Soft Sugar Cookie • Signature Pink Frosting • Sprinkles" },
        { name: "Cinnamon Roll", price: 3.49, art: cupSVG("#c98a4b", "#f3dcc0"), ingredients: "Fresh-Baked Roll • Cream Cheese Glaze" },
        { name: "Brownie Bite Box", price: 4.99, art: cupSVG("#4a2c19", "#cdb097"), ingredients: "Fudge Brownies • Sea Salt • Caramel Drizzle" },
      ],
    },
    reviews: {
      blurb: "Don't take our word for it — neighbors say it best.",
      reviews: [
        { stars: "★★★★★", text: "The Dragonada changed my whole summer. I'm here three times a week and the staff know my order.", author: "— Maya R." },
        { stars: "★★★★★", text: "Ronica's friends really do treat you like family. Best dirty soda I've ever had, hands down.", author: "— Devon T." },
        { stars: "★★★★★", text: "Joined the Good Neighbors Club and the perks pay for themselves. Flame Kissed is unreal.", author: "— Priya K." },
      ],
    },
  };

  var grid = document.getElementById("sips-grid");
  var blurb = document.getElementById("sips-blurb");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));

  function tabKey(tab) {
    return tab.id.replace("tab-", "");
  }

  function render(key) {
    var data = DRINKS[key];
    if (!data || !grid) return;
    blurb.textContent = data.blurb;
    grid.innerHTML = "";

    if (data.reviews) {
      data.reviews.forEach(function (r) {
        var el = document.createElement("article");
        el.className = "review-card";
        el.innerHTML =
          '<div class="review-stars" aria-hidden="true">' + r.stars + "</div>" +
          '<p class="review-text">' + r.text + "</p>" +
          '<p class="review-author">' + r.author + "</p>";
        grid.appendChild(el);
      });
      return;
    }

    data.cards.forEach(function (c) {
      var el = document.createElement("article");
      el.className = "drink-card";
      el.innerHTML =
        '<div class="drink-art">' + c.art + "</div>" +
        '<div class="drink-body">' +
        '<h3 class="drink-name">' + c.name + "</h3>" +
        '<p class="drink-ingredients">' + c.ingredients + "</p>" +
        '<button class="btn btn-cream add-btn" data-add-to-bag data-name="' + c.name +
        '" data-price="' + c.price + '">Add to Bag · $' + c.price.toFixed(2) + "</button>" +
        "</div>";
      grid.appendChild(el);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
      tab.setAttribute("aria-selected", "true");
      grid.setAttribute("aria-labelledby", tab.id);
      render(tabKey(tab));
    });
  });

  // Initial render
  render("summer");

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Signup form */
  var form = document.getElementById("signup-form");
  var thanks = document.getElementById("signup-thanks");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var phone = document.getElementById("phone");
      if (!phone.value.trim()) {
        phone.focus();
        phone.setAttribute("aria-invalid", "true");
        return;
      }
      phone.removeAttribute("aria-invalid");
      form.querySelector(".signup-btn").hidden = true;
      thanks.hidden = false;
    });
  }

  /* Footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
