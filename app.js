// Mock Login - demo app for testing a REAL login flow with Playwright
// (fill the form, click the button, follow the real page redirect) as an
// alternative to dom_capture.py's existing sessionStorage-seeding
// shortcut (see capture_dom.py's module docstring). Plain JS, no backend,
// no framework - same build style as this project's other demo sites
// (single script, data-testid on every interactive element).
//
// One script shared across every page of this site - index.html (sign
// in) plus the 3-step signup flow added 2026-10-05 (signup.html,
// signup-name.html, signup-complete.html). Each block below is guarded
// by checking its own page's elements exist first, same pattern
// demo-shopping-nav's app.js uses for its multiple pages, rather than
// splitting into one script per page. (dashboard.html keeps its own
// tiny inline script for its cosmetic ?user= welcome - unchanged.)

const ACCOUNTS = [{ username: "demo", password: "Demo@123" }];

// Signup-only "already registered" list, for testing the duplicate-email
// negative case - same idea as ACCOUNTS above, just for the signup flow
// instead of the login flow.
const EXISTING_EMAILS = ["demo@example.com"];

function showFieldError(el, text) {
  el.textContent = text;
  el.classList.add("show");
}

function hideFieldError(el) {
  el.textContent = "";
  el.classList.remove("show");
}

// --- index.html: sign in ---

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const loginButton = document.getElementById("loginButton");

if (usernameInput && passwordInput && loginError && loginButton) {
  const attemptLogin = () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password.trim()) {
      showFieldError(loginError, "Enter a username and password.");
      return;
    }

    const account = ACCOUNTS.find(
      (a) => a.username.toLowerCase() === username.toLowerCase()
    );

    if (!account || account.password !== password) {
      // Deliberately non-specific about which part was wrong, matching
      // demo-signin-popup's own rule for this.
      showFieldError(loginError, "Incorrect username or password.");
      passwordInput.value = "";
      return;
    }

    // Happy path: a REAL page navigation, not an in-page swap - this is
    // the whole reason this fixture exists (see dom_capture.py's
    // real-login mode).
    hideFieldError(loginError);
    window.location.href = "dashboard.html?user=" + encodeURIComponent(username);
  };

  loginButton.addEventListener("click", attemptLogin);
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
  });
}

// --- signup.html: step 1, email ---

const signupEmailInput = document.getElementById("signupEmail");
const signupEmailError = document.getElementById("signupEmailError");
const signupEmailContinue = document.getElementById("signupEmailContinue");

if (signupEmailInput && signupEmailError && signupEmailContinue) {
  const attemptSignupEmail = () => {
    const email = signupEmailInput.value.trim();

    // Deliberately loose "shaped like an email" check, not full RFC
    // validation - this is a UI-automation fixture, not an email
    // validator under test.
    if (!email || !email.includes("@") || !email.includes(".")) {
      showFieldError(signupEmailError, "Enter a valid email address.");
      return;
    }

    if (EXISTING_EMAILS.includes(email.toLowerCase())) {
      showFieldError(signupEmailError, "That email is already registered.");
      return;
    }

    hideFieldError(signupEmailError);
    window.location.href = "signup-name.html?email=" + encodeURIComponent(email);
  };

  signupEmailContinue.addEventListener("click", attemptSignupEmail);
  signupEmailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptSignupEmail();
  });
}

// --- signup-name.html: step 2, name ---

const signupNameInput = document.getElementById("signupName");
const signupNameError = document.getElementById("signupNameError");
const signupNameContinue = document.getElementById("signupNameContinue");

if (signupNameInput && signupNameError && signupNameContinue) {
  // Carried forward from step 1's redirect - see signup.html's own note.
  const email = new URLSearchParams(window.location.search).get("email") || "";

  const attemptSignupName = () => {
    const name = signupNameInput.value.trim();

    if (!name) {
      showFieldError(signupNameError, "Enter your name.");
      return;
    }

    hideFieldError(signupNameError);
    window.location.href =
      "signup-complete.html?email=" + encodeURIComponent(email) +
      "&name=" + encodeURIComponent(name);
  };

  signupNameContinue.addEventListener("click", attemptSignupName);
  signupNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptSignupName();
  });
}

// --- signup-complete.html: step 3, cosmetic summary ---
// Same ?param trick as dashboard.html's own inline script - purely
// cosmetic, not read by anything else.

const signupWelcomeName = document.getElementById("signupWelcomeName");
const signupCompleteEmail = document.getElementById("signupCompleteEmail");

if (signupWelcomeName && signupCompleteEmail) {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const email = params.get("email");
  if (name) signupWelcomeName.textContent = ", " + name;
  if (email) signupCompleteEmail.textContent = email;
}
