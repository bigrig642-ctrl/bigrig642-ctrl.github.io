# DemoStake — Fake Money Only

A static, GitHub Pages-ready casino-style demo using fake local credits.

## Files

- `index.html` — page markup
- `styles.css` — styling
- `app.js` — login, fake balances, games, admin dashboard

## Demo accounts

Admin:

```txt
username: admin
password: admin123
```

Player:

```txt
username: demo
password: demo123
```

## How to run locally

Open `index.html` in your browser.

## How to publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the root of the repo.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/root**
5. Save.
6. Your site will appear at the GitHub Pages URL GitHub gives you.

## Important

This is a browser-only demo. Accounts and balances are stored in `localStorage`, so every visitor has their own local copy of the data.

This project has no real authentication, no server, no database, no real money, no deposits, and no withdrawals.
