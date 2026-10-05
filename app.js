// Mock Login - demo app for testing a REAL login flow with Playwright
// (fill the form, click the button, follow the real page redirect) as an
// alternative to dom_capture.py's existing sessionStorage-seeding
// shortcut (see capture_dom.py's module docstring). Plain JS, no backend,
// no framework - same build style as this project's other demo sites
// (single script, data-testid on every interactive element).

const ACCOUNTS = [{ username: "demo", password: "Demo@123" }];

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorEl = document.getElementById("loginError");
const loginButton = document.getElementById("loginButton");

function showError(text) {
  errorEl.textContent = text;
  errorEl.classList.add("show");
}

function hideError() {
  errorEl.textContent = "";
  errorEl.classList.remove("show");
}

function attemptLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password.trim()) {
    showError("Enter a username and password.");
    return;
  }

  const account = ACCOUNTS.find(
    (a) => a.username.toLowerCase() === username.toLowerCase()
  );

  if (!account || account.password !== password) {
    // Deliberately non-specific about which part was wrong, matching
    // demo-signin-popup's own rule for this.
    showError("Incorrect username or password.");
    passwordInput.value = "";
    return;
  }

  // Happy path: a REAL page navigation, not an in-page swap - this is the
  // whole reason this fixture exists (see dom_capture.py's real-login mode).
  hideError();
  window.location.href = "dashboard.html?user=" + encodeURIComponent(username);
}

loginButton.addEventListener("click", attemptLogin);

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") attemptLogin();
});
