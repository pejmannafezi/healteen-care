/* ===== Ronica's friends — Menu page ===== */
(function () {
  "use strict";

  /* Mini soda cup SVG (recolored per drink) */
  function cup(fill, foam) {
    return (
      '<svg viewBox="0 0 100 150" role="img" aria-label="Soda cup">' +
      '<defs><clipPath id="m' + foam.replace("#", "") + fill.replace("#", "") +
      '"><path d="M22 38 H78 L72 140 Q71 146 65 146 H35 Q29 146 28 140 Z"/></clipPath></defs>' +
      '<path d="M22 38 H78 L72 140 Q71 146 65 146 H35 Q29 146 28 140 Z" fill="' + fill + '"/>' +
      '<ellipse cx="50" cy="38" rx="29" ry="7" fill="' + foam + '"/>' +
      '<rect x="46" y="6" width="8" height="40" rx="4" fill="#fffdf8" transform="rotate(12 50 26)"/>' +
      "</svg>"
    );
  }

  var MENU = {
    dirty: [
      { name: "Dirty Dr. Ronica", ing: "Dr Pepper • Coconut Cream • Fresh Lime • Vanilla", price: "$4.49", art: cup("#7a4a2b", "#e8c9a8") },
      { name: "Cookie Dough Cola", ing: "Coca-Cola • Vanilla Cream • Toasted Coconut • Caramel Drizzle", price: "$4.49", art: cup("#5c3a23", "#e3cbb0") },
      { name: "The Founder", ing: "Diet Coke • Coconut • Cream • Fresh Lime Squeeze", price: "$4.29", art: cup("#3f2a1a", "#d8bfa3") },
      { name: "Raspberry Dream", ing: "Coca-Cola • Raspberry Purée • Sweet Cream", price: "$4.49", art: cup("#9b2d4a", "#f0c2d0") },
      { name: "Vanilla Bean Pepper", ing: "Dr Pepper • Vanilla • Half & Half", price: "$4.29", art: cup("#6e4327", "#ecd6bc") },
      { name: "Coconut Lime Fizz", ing: "Sprite • Coconut • Fresh Lime", price: "$4.29", art: cup("#bfe3c7", "#eafaee") },
    ],
    refreshers: [
      { name: "Tiger's Blood", ing: "Watermelon • Strawberry • Coconut • Frozen Slush", price: "$4.99", art: cup("#ff4d6d", "#ffd0da") },
      { name: "Blue Lagoon", ing: "Lemonade • Blue Raspberry • Coconut", price: "$4.99", art: cup("#3fa9f5", "#cfe9ff") },
      { name: "Mango Tango", ing: "Mango • Passionfruit • Lime • Sparkling Water", price: "$4.99", art: cup("#ffb02e", "#ffe6b8") },
      { name: "Strawberry Sunrise", ing: "Strawberry • Peach • Lemonade", price: "$4.99", art: cup("#ff7a8a", "#ffd6dc") },
    ],
    summer: [
      { name: "Dragonada", ing: "Roasted Sprite • Pineapple • Dragon Fruit • Coconut Cream", price: "$5.49", art: cup("#ffd34d", "#fff3c9") },
      { name: "Dragon Dew", ing: "Mountain Dew • Lemonade • Dragon Fruit • Raspberry • Vanilla Cream", price: "$5.49", art: cup("#ff5d8f", "#ffd6e4") },
      { name: "Flame Kissed", ing: "Sprite • Strawberry • Peach • Dragon Fruit Purée", price: "$5.49", art: cup("#ff3b3b", "#ffd0c2") },
    ],
    treats: [
      { name: "Sugar Friend Cookie", ing: "Soft Sugar Cookie • Signature Pink Frosting • Sprinkles", price: "$2.99", art: cup("#f6d6a8", "#fff0d6") },
      { name: "Cinnamon Roll", ing: "Fresh-Baked Roll • Cream Cheese Glaze", price: "$3.49", art: cup("#c98a4b", "#f3dcc0") },
      { name: "Brownie Bite Box", ing: "Fudge Brownies • Sea Salt • Caramel Drizzle", price: "$4.99", art: cup("#4a2c19", "#cdb097") },
      { name: "Cookie Flight (4)", ing: "Four Assorted Sugar Cookies — Pick Your Frostings", price: "$9.99", art: cup("#f6d6a8", "#ffe9c9") },
    ],
  };

  Object.keys(MENU).forEach(function (key) {
    var grid = document.querySelector('.menu-grid[data-fill="' + key + '"]');
    if (!grid) return;
    MENU[key].forEach(function (item) {
      var el = document.createElement("article");
      el.className = "menu-item";
      var priceNum = parseFloat(item.price.replace("$", ""));
      el.innerHTML =
        '<div class="menu-thumb">' + item.art + "</div>" +
        '<div class="menu-item-body">' +
        '<p class="menu-item-name">' + item.name + "</p>" +
        '<p class="menu-item-ing">' + item.ing + "</p>" +
        "</div>" +
        '<div class="price-col">' +
        '<span class="price">' + item.price + "</span>" +
        '<button class="btn btn-red add-btn" data-add-to-bag data-name="' + item.name +
        '" data-price="' + priceNum + '">Add to Bag</button>' +
        "</div>";
      grid.appendChild(el);
    });
  });

  /* Mobile nav toggle (same pattern as homepage) */
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

  /* Footer year */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
