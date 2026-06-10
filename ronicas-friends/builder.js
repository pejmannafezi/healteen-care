/* ===== Ronica's friends — Create Your Own drink builder =====
   Opens a modal when a [data-build] base card is clicked, lets the user
   toggle flavors / fruits / creams, shows a live price, and adds the
   composed drink to the bag via window.RFBag. Menu page only. */
(function () {
  "use strict";

  var OPTIONS = {
    Flavors: { price: 0.5, items: ["Coconut", "Vanilla", "Raspberry", "Peach", "Strawberry", "Lime", "Cherry", "Dragon Fruit"] },
    Fruits: { price: 0.75, items: ["Fresh Lime", "Strawberry", "Pineapple", "Blackberry"] },
    Creams: { price: 0.75, items: ["Coconut Cream", "Vanilla Cream", "Sweet Cream", "Half & Half"] },
  };

  var triggers = document.querySelectorAll("[data-build]");
  if (!triggers.length) return; // only on the menu page

  /* ---- Build modal markup ---- */
  var overlay = document.createElement("div");
  overlay.className = "build-overlay";

  var modal = document.createElement("div");
  modal.className = "build-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "build-title");

  var groupsHTML = Object.keys(OPTIONS).map(function (group) {
    var chips = OPTIONS[group].items.map(function (name) {
      return '<button type="button" class="build-chip" data-group="' + group + '" data-name="' + name + '">' + name + "</button>";
    }).join("");
    return (
      '<div class="build-group">' +
      "<h3>" + group + ' <span class="build-addprice">+$' + OPTIONS[group].price.toFixed(2) + " each</span></h3>" +
      '<div class="build-chips">' + chips + "</div>" +
      "</div>"
    );
  }).join("");

  modal.innerHTML =
    '<div class="build-head">' +
    '<h2 id="build-title">Create Your Own</h2>' +
    '<button class="build-close" aria-label="Close builder">&times;</button>' +
    "</div>" +
    '<div class="build-body">' + groupsHTML + "</div>" +
    '<div class="build-foot">' +
    '<div class="build-total"><span id="build-total-label">Total</span><span id="build-total">$0.00</span></div>' +
    '<button class="btn btn-red build-add" id="build-add">Add to Bag</button>' +
    "</div>";

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  var titleEl = modal.querySelector("#build-title");
  var totalEl = modal.querySelector("#build-total");
  var bodyEl = modal.querySelector(".build-body");

  var current = { base: "", basePrice: 0 };

  function selected() {
    return Array.prototype.slice.call(modal.querySelectorAll(".build-chip.selected"));
  }

  function recalc() {
    var sum = current.basePrice;
    selected().forEach(function (chip) {
      sum += OPTIONS[chip.getAttribute("data-group")].price;
    });
    totalEl.textContent = "$" + sum.toFixed(2);
    return sum;
  }

  function openBuilder(base, basePrice) {
    current.base = base;
    current.basePrice = basePrice;
    titleEl.textContent = "Create Your Own " + base;
    modal.querySelectorAll(".build-chip.selected").forEach(function (c) { c.classList.remove("selected"); });
    recalc();
    overlay.classList.add("open");
    modal.classList.add("open");
  }
  function closeBuilder() {
    overlay.classList.remove("open");
    modal.classList.remove("open");
  }

  triggers.forEach(function (card) {
    card.addEventListener("click", function () {
      openBuilder(card.getAttribute("data-base"), parseFloat(card.getAttribute("data-price")) || 0);
    });
  });

  overlay.addEventListener("click", closeBuilder);
  modal.querySelector(".build-close").addEventListener("click", closeBuilder);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBuilder(); });

  bodyEl.addEventListener("click", function (e) {
    var chip = e.target.closest(".build-chip");
    if (!chip) return;
    chip.classList.toggle("selected");
    recalc();
  });

  modal.querySelector("#build-add").addEventListener("click", function () {
    var total = recalc();
    var picks = selected().map(function (c) { return c.getAttribute("data-name"); });
    var label = "Custom " + current.base + (picks.length ? " (" + picks.join(", ") + ")" : " (Classic)");
    closeBuilder();
    if (window.RFBag) window.RFBag.add(label, total);
  });
})();
