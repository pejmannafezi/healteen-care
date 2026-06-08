/* ===== Ronica's friends — client-side Bag/Cart =====
   Shared by index.html and menu.html. Injects a bag button into the
   header and a slide-out drawer into the body, persists to localStorage,
   and listens for clicks on any [data-add-to-bag] element. */
(function () {
  "use strict";

  var KEY = "rf_bag";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
  }
  function money(n) { return "$" + n.toFixed(2); }

  var bag = load();

  /* ---- Inject bag button into header ---- */
  var headerInner = document.querySelector(".header-inner");
  var bagBtn = document.createElement("button");
  bagBtn.className = "bag-btn";
  bagBtn.setAttribute("aria-label", "Open bag");
  bagBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
    '<path d="M6 8h12l-1 12H7L6 8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    "</svg>" +
    '<span class="bag-count" aria-hidden="true">0</span>';
  if (headerInner) headerInner.appendChild(bagBtn);

  /* ---- Inject drawer + overlay ---- */
  var overlay = document.createElement("div");
  overlay.className = "cart-overlay";

  var drawer = document.createElement("aside");
  drawer.className = "cart-drawer";
  drawer.setAttribute("aria-label", "Your bag");
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.hidden = false;
  drawer.innerHTML =
    '<div class="cart-head">' +
    '<h2>Your Bag</h2>' +
    '<button class="cart-close" aria-label="Close bag">&times;</button>' +
    "</div>" +
    '<div class="cart-items" id="cart-items"></div>' +
    '<div class="cart-foot">' +
    '<div class="cart-total"><span>Subtotal</span><span id="cart-subtotal">$0.00</span></div>' +
    '<button class="btn btn-red cart-checkout" id="cart-checkout">Checkout</button>' +
    '<p class="cart-msg" id="cart-msg" role="status" hidden></p>' +
    "</div>";

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  var itemsEl = drawer.querySelector("#cart-items");
  var subtotalEl = drawer.querySelector("#cart-subtotal");
  var countEl = bagBtn.querySelector(".bag-count");
  var msgEl = drawer.querySelector("#cart-msg");

  /* ---- Rendering ---- */
  function totals() {
    var count = 0, sum = 0;
    bag.forEach(function (it) { count += it.qty; sum += it.qty * it.price; });
    return { count: count, sum: sum };
  }

  function render() {
    var t = totals();
    countEl.textContent = String(t.count);
    countEl.classList.toggle("show", t.count > 0);
    subtotalEl.textContent = money(t.sum);

    if (!bag.length) {
      itemsEl.innerHTML = '<p class="cart-empty">Your bag is empty.<br>Add a sip to get started! 🥤</p>';
      drawer.querySelector("#cart-checkout").disabled = true;
      return;
    }
    drawer.querySelector("#cart-checkout").disabled = false;
    itemsEl.innerHTML = "";
    bag.forEach(function (it, i) {
      var row = document.createElement("div");
      row.className = "cart-line";
      row.innerHTML =
        '<div class="cart-line-info">' +
        '<span class="cart-line-name">' + it.name + "</span>" +
        '<span class="cart-line-price">' + money(it.price) + "</span>" +
        "</div>" +
        '<div class="cart-qty">' +
        '<button class="qty-btn" data-act="dec" data-i="' + i + '" aria-label="Decrease quantity">−</button>' +
        '<span class="qty-num">' + it.qty + "</span>" +
        '<button class="qty-btn" data-act="inc" data-i="' + i + '" aria-label="Increase quantity">+</button>' +
        '<button class="qty-remove" data-act="rm" data-i="' + i + '" aria-label="Remove ' + it.name + '">Remove</button>' +
        "</div>";
      itemsEl.appendChild(row);
    });
  }

  /* ---- Open / close ---- */
  function open() {
    drawer.classList.add("open");
    overlay.classList.add("open");
    msgEl.hidden = true;
  }
  function close() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
  }

  bagBtn.addEventListener("click", open);
  overlay.addEventListener("click", close);
  drawer.querySelector(".cart-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  /* ---- Add to bag (event delegation) ---- */
  function add(name, price) {
    var existing = bag.filter(function (it) { return it.name === name; })[0];
    if (existing) existing.qty += 1;
    else bag.push({ name: name, price: price, qty: 1 });
    save(bag);
    render();
    open();
  }

  /* Expose a tiny API so other scripts (e.g. the drink builder) can add items */
  window.RFBag = { add: add, open: open };

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-add-to-bag]");
    if (trigger) {
      e.preventDefault();
      var name = trigger.getAttribute("data-name");
      var price = parseFloat(trigger.getAttribute("data-price")) || 0;
      add(name, price);
      // brief "added!" feedback on the button
      var label = trigger.textContent;
      trigger.textContent = "Added ✓";
      trigger.classList.add("added");
      setTimeout(function () {
        trigger.textContent = label;
        trigger.classList.remove("added");
      }, 900);
    }
  });

  /* ---- Qty / remove inside drawer ---- */
  itemsEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var i = parseInt(btn.getAttribute("data-i"), 10);
    var act = btn.getAttribute("data-act");
    if (isNaN(i) || !bag[i]) return;
    if (act === "inc") bag[i].qty += 1;
    else if (act === "dec") { bag[i].qty -= 1; if (bag[i].qty <= 0) bag.splice(i, 1); }
    else if (act === "rm") bag.splice(i, 1);
    save(bag);
    render();
  });

  /* ---- Checkout (demo, no real payment) ---- */
  drawer.querySelector("#cart-checkout").addEventListener("click", function () {
    if (!bag.length) return;
    var t = totals();
    bag = [];
    save(bag);
    render();
    msgEl.hidden = false;
    msgEl.textContent = "🎉 Order placed! " + t.count + " item" + (t.count === 1 ? "" : "s") +
      " for " + money(t.sum) + ". A friend will have it ready. (Demo — no payment taken.)";
  });

  render();
})();
