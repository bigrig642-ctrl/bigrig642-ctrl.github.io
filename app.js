const STORAGE_KEY = "demoStakeStateV1";

const defaultState = {
  currentUser: null,
  users: [
    { username: "admin", password: "admin123", role: "admin", balance: 100000, lastBonus: null },
    { username: "demo", password: "demo123", role: "player", balance: 1000, lastBonus: null }
  ],
  chances: {
    dice: 49,
    coin: 48,
    gem: 20
  },
  history: []
};

let authMode = "login";
let state = loadState();

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return clone(defaultState);
  }

  try {
    const parsed = JSON.parse(raw);
    return { ...clone(defaultState), ...parsed };
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return clone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
}

function money(n) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

function getCurrentUser() {
  return state.users.find(user => user.username === state.currentUser) || null;
}

function setAuthMode(mode) {
  authMode = mode;
  document.getElementById("loginTab").classList.toggle("active", mode === "login");
  document.getElementById("registerTab").classList.toggle("active", mode === "register");
  document.getElementById("authBtn").textContent = mode === "login" ? "Login" : "Create account";
}

function handleAuth() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    toast("Enter a username and password.");
    return;
  }

  if (authMode === "register") {
    if (username.toLowerCase() === "admin") {
      toast("That username is reserved.");
      return;
    }

    const exists = state.users.some(user => user.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      toast("Username already exists.");
      return;
    }

    state.users.push({
      username,
      password,
      role: "player",
      balance: 1000,
      lastBonus: null
    });

    state.currentUser = username;
    saveState();
    toast("Account created with 1,000 demo credits.");
    return;
  }

  const user = state.users.find(account => account.username === username && account.password === password);

  if (!user) {
    toast("Invalid login details.");
    return;
  }

  state.currentUser = user.username;
  saveState();
  toast(`Welcome back, ${user.username}.`);
}

function logout() {
  state.currentUser = null;
  saveState();
  toast("Logged out.");
}

function fillAdminLogin() {
  setAuthMode("login");
  document.getElementById("username").value = "admin";
  document.getElementById("password").value = "admin123";
  document.getElementById("authCard").scrollIntoView({ behavior: "smooth", block: "center" });
}

function scrollToGames() {
  document.getElementById("gamesSection").scrollIntoView({ behavior: "smooth" });
}

function validateBet(user, bet) {
  if (!user) {
    toast("Login first to play.");
    return false;
  }

  if (!Number.isFinite(bet) || bet <= 0) {
    toast("Enter a valid bet amount.");
    return false;
  }

  if (bet > user.balance) {
    toast("Not enough demo credits.");
    return false;
  }

  return true;
}

function chanceWin(game) {
  const chance = Number(state.chances[game] || 0);
  return Math.random() * 100 < chance;
}

function playGame(game) {
  const user = getCurrentUser();
  const betInput = document.getElementById(`${game}Bet`);
  const resultEl = document.getElementById(`${game}Result`);
  const bet = Number(betInput.value);

  if (!validateBet(user, bet)) return;

  let won = chanceWin(game);
  let payout = 0;
  let detail = "";

  if (game === "dice") {
    const roll = Math.floor(Math.random() * 100) + 1;
    payout = won ? bet * 2 : 0;
    detail = `Rolled ${roll}.`;
  }

  if (game === "coin") {
    const pick = document.getElementById("coinPick").value;
    const side = Math.random() < 0.5 ? "Heads" : "Tails";
    payout = won ? bet * 1.95 : 0;
    detail = `You picked ${pick}. Coin showed ${side}.`;
  }

  if (game === "gem") {
    const pick = Number(document.getElementById("gemPick").value);
    const gemBox = Math.floor(Math.random() * 5) + 1;
    payout = won ? bet * 4 : 0;
    detail = `You picked box ${pick}. Gem was in box ${gemBox}.`;
  }

  user.balance -= bet;
  if (won) user.balance += payout;

  state.history.unshift({
    user: user.username,
    game,
    bet,
    won,
    payout,
    date: new Date().toISOString()
  });

  state.history = state.history.slice(0, 100);

  resultEl.innerHTML = won
    ? `<span class="green">Win!</span> ${detail} Profit: +${money(payout - bet)} credits.`
    : `<span class="red">Loss.</span> ${detail} Lost ${money(bet)} credits.`;

  saveState();
}

function dailyBonus() {
  const user = getCurrentUser();

  if (!user) {
    toast("Login first to claim a bonus.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  if (user.lastBonus === today) {
    toast("Daily bonus already claimed today.");
    return;
  }

  user.balance += 100;
  user.lastBonus = today;
  saveState();
  toast("Added 100 fake credits.");
}

function render() {
  const user = getCurrentUser();
  const userbar = document.getElementById("userbar");
  const authCard = document.getElementById("authCard");
  const admin = document.getElementById("adminDashboard");

  if (user) {
    userbar.innerHTML = `
      <span class="pill">${user.username}</span>
      <span class="pill green">${money(user.balance)} credits</span>
      ${user.role === "admin" ? '<span class="pill gold">Admin</span>' : ""}
      <button class="secondary" onclick="logout()">Logout</button>
    `;
    authCard.classList.add("hidden");
  } else {
    userbar.innerHTML = '<span class="pill muted">Not logged in</span>';
    authCard.classList.remove("hidden");
  }

  admin.classList.toggle("visible", Boolean(user && user.role === "admin"));
  renderAdmin();
  hydrateChanceControls();
}

function renderAdmin() {
  const tbody = document.getElementById("accountsTable");
  if (!tbody) return;

  tbody.innerHTML = state.users.map(user => `
    <tr>
      <td><b>${escapeHtml(user.username)}</b></td>
      <td>${user.role}</td>
      <td>${money(user.balance)}</td>
      <td>
        <div class="inline" style="min-width:220px">
          <input class="balance-input" type="number" id="balance_${cssSafe(user.username)}" value="${Number(user.balance)}" />
          <button class="secondary" onclick="setBalance('${escapeAttr(user.username)}')">Set</button>
        </div>
      </td>
      <td>
        ${
          user.role === "admin"
            ? '<span class="muted small">Protected</span>'
            : `<button class="danger" onclick="deleteUser('${escapeAttr(user.username)}')">Delete</button>`
        }
      </td>
    </tr>
  `).join("");
}

function cssSafe(value) {
  return String(value).replace(/[^a-z0-9_-]/gi, "_");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("`", "&#096;");
}

function setBalance(username) {
  const user = state.users.find(account => account.username === username);
  if (!user) return;

  const input = document.getElementById(`balance_${cssSafe(username)}`);
  const value = Number(input.value);

  if (!Number.isFinite(value) || value < 0) {
    toast("Balance must be zero or higher.");
    return;
  }

  user.balance = value;
  saveState();
  toast(`Updated ${username}'s balance.`);
}

function deleteUser(username) {
  const user = state.users.find(account => account.username === username);

  if (!user || user.role === "admin") return;

  state.users = state.users.filter(account => account.username !== username);

  if (state.currentUser === username) {
    state.currentUser = null;
  }

  saveState();
  toast(`Deleted ${username}.`);
}

function hydrateChanceControls() {
  const dice = document.getElementById("diceChance");
  const coin = document.getElementById("coinChance");
  const gem = document.getElementById("gemChance");

  if (!dice) return;

  const activeElement = document.activeElement;
  const userIsEditingChance = activeElement === dice || activeElement === coin || activeElement === gem;

  if (!userIsEditingChance) {
    dice.value = state.chances.dice;
    coin.value = state.chances.coin;
    gem.value = state.chances.gem;
  }

  updateChanceText();
}

function updateChanceText() {
  ["dice", "coin", "gem"].forEach(game => {
    const slider = document.getElementById(`${game}Chance`);
    const text = document.getElementById(`${game}ChanceText`);

    if (slider && text) {
      text.textContent = slider.value;
    }
  });
}

function saveChances() {
  ["dice", "coin", "gem"].forEach(game => {
    state.chances[game] = Number(document.getElementById(`${game}Chance`).value);
  });

  saveState();
  toast("Game chances saved.");
}

function resetDemoData() {
  state = clone(defaultState);
  saveState();
  toast("Demo data reset.");
}

render();
