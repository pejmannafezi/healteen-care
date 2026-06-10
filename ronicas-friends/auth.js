/* ===== Ronica's friends — Sign In / Create Account (demo) =====
   Injects a "Sign In" button into the header and a phone-based sign-in
   modal styled after the reference. Fully client-side and for DEMO only:
   no real SMS is sent and no real account is created. A faux "signed in"
   flag is kept in localStorage so the header can reflect state. */
(function () {
  "use strict";

  var KEY = "rf_user";

  function getUser() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function setUser(u) {
    try { u ? localStorage.setItem(KEY, JSON.stringify(u)) : localStorage.removeItem(KEY); } catch (e) {}
  }

  var headerInner = document.querySelector(".header-inner");
  if (!headerInner) return;

  /* ---- Header auth button ---- */
  var authBtn = document.createElement("button");
  authBtn.className = "auth-btn";
  headerInner.appendChild(authBtn);

  function renderAuthBtn() {
    var u = getUser();
    if (u) {
      authBtn.innerHTML = '<span class="auth-avatar">' + (u.initial || "🙂") + "</span><span>Account</span>";
      authBtn.setAttribute("aria-label", "Your account");
    } else {
      authBtn.textContent = "Sign In";
      authBtn.setAttribute("aria-label", "Sign in or create account");
    }
  }

  /* ---- Modal markup ---- */
  var overlay = document.createElement("div");
  overlay.className = "auth-overlay";

  var modal = document.createElement("div");
  modal.className = "auth-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "auth-title");
  modal.innerHTML =
    '<div class="auth-head">' +
    '<h2 id="auth-title">Sign In / Create Account</h2>' +
    '<button class="auth-close" aria-label="Close">&times;</button>' +
    "</div>" +
    '<div class="auth-body">' +
    '<div class="auth-logo" aria-hidden="true"><span>Ronica\'s</span><small>friends</small></div>' +

    // Step 1: phone
    '<form class="auth-step" id="auth-step-phone" novalidate>' +
    '<div class="auth-phone-row">' +
    '<select class="auth-cc" aria-label="Country code">' +
    '<option value="+1">US (+1)</option>' +
    '<option value="+44">UK (+44)</option>' +
    '<option value="+61">AU (+61)</option>' +
    '<option value="+91">IN (+91)</option>' +
    "</select>" +
    '<div class="auth-field"><label for="auth-phone">Phone Number</label>' +
    '<input id="auth-phone" type="tel" inputmode="tel" placeholder="(___) ___-____" autocomplete="tel" /></div>' +
    "</div>" +
    '<p class="auth-error" id="auth-phone-error" hidden>Please enter a valid phone number.</p>' +
    '<div class="auth-actions">' +
    '<button type="button" class="auth-link auth-back">Back</button>' +
    '<button type="submit" class="btn btn-red auth-primary">Send code</button>' +
    "</div>" +
    "</form>" +

    // Step 2: code
    '<form class="auth-step" id="auth-step-code" hidden novalidate>' +
    '<p class="auth-sent">We texted a 6-digit code to <strong id="auth-sent-to"></strong>.<br><span class="auth-demo">Demo: enter any 6 digits.</span></p>' +
    '<div class="auth-field"><label for="auth-code">Verification code</label>' +
    '<input id="auth-code" type="text" inputmode="numeric" maxlength="6" placeholder="______" /></div>' +
    '<p class="auth-error" id="auth-code-error" hidden>Enter the 6-digit code.</p>' +
    '<div class="auth-actions">' +
    '<button type="button" class="auth-link auth-code-back">Back</button>' +
    '<button type="submit" class="btn btn-red auth-primary">Verify &amp; sign in</button>' +
    "</div>" +
    "</form>" +

    // Step 3: success
    '<div class="auth-step auth-success" id="auth-step-done" hidden>' +
    '<p class="auth-done-msg">🎉 You\'re signed in!</p>' +
    '<p class="auth-done-sub">Welcome to the Good Neighbors Club. (Demo account — no real sign-in.)</p>' +
    '<button type="button" class="btn btn-red auth-finish">Start sipping</button>' +
    "</div>" +

    '<p class="auth-powered">Powered by Ronica\'s friends · demo</p>' +
    "</div>";

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  var stepPhone = modal.querySelector("#auth-step-phone");
  var stepCode = modal.querySelector("#auth-step-code");
  var stepDone = modal.querySelector("#auth-step-done");
  var phoneInput = modal.querySelector("#auth-phone");
  var codeInput = modal.querySelector("#auth-code");
  var ccSelect = modal.querySelector(".auth-cc");

  function showStep(which) {
    stepPhone.hidden = which !== "phone";
    stepCode.hidden = which !== "code";
    stepDone.hidden = which !== "done";
  }

  function openAuth() {
    var u = getUser();
    if (u) {
      // already signed in -> show signed-in state with sign-out
      showStep("done");
      modal.querySelector(".auth-done-msg").textContent = "👋 You're signed in";
      modal.querySelector(".auth-done-sub").textContent = "Signed in as " + u.phone + ".";
      modal.querySelector(".auth-finish").textContent = "Sign out";
    } else {
      showStep("phone");
      modal.querySelector(".auth-done-msg").textContent = "🎉 You're signed in!";
      modal.querySelector(".auth-done-sub").textContent = "Welcome to the Good Neighbors Club. (Demo account — no real sign-in.)";
      modal.querySelector(".auth-finish").textContent = "Start sipping";
    }
    overlay.classList.add("open");
    modal.classList.add("open");
  }
  function closeAuth() {
    overlay.classList.remove("open");
    modal.classList.remove("open");
  }

  authBtn.addEventListener("click", openAuth);
  overlay.addEventListener("click", closeAuth);
  modal.querySelector(".auth-close").addEventListener("click", closeAuth);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAuth(); });
  modal.querySelector(".auth-back").addEventListener("click", closeAuth);
  modal.querySelector(".auth-code-back").addEventListener("click", function () { showStep("phone"); });

  // Step 1 submit -> validate phone, go to code
  stepPhone.addEventListener("submit", function (e) {
    e.preventDefault();
    var digits = (phoneInput.value.match(/\d/g) || []).length;
    var err = modal.querySelector("#auth-phone-error");
    if (digits < 7) { err.hidden = false; phoneInput.focus(); return; }
    err.hidden = true;
    modal.querySelector("#auth-sent-to").textContent = ccSelect.value + " " + phoneInput.value.trim();
    showStep("code");
    codeInput.focus();
  });

  // Step 2 submit -> validate code, sign in
  stepCode.addEventListener("submit", function (e) {
    e.preventDefault();
    var code = (codeInput.value.match(/\d/g) || []).join("");
    var err = modal.querySelector("#auth-code-error");
    if (code.length < 6) { err.hidden = false; codeInput.focus(); return; }
    err.hidden = true;
    var phone = ccSelect.value + " " + phoneInput.value.trim();
    setUser({ phone: phone, initial: "🙂" });
    renderAuthBtn();
    showStep("done");
  });

  // Finish / sign-out
  modal.querySelector(".auth-finish").addEventListener("click", function () {
    if (getUser()) {
      // this button doubles as sign-out when already signed in
      if (this.textContent.indexOf("Sign out") > -1) {
        setUser(null);
        renderAuthBtn();
        phoneInput.value = "";
        codeInput.value = "";
        closeAuth();
        return;
      }
    }
    closeAuth();
  });

  renderAuthBtn();
})();
