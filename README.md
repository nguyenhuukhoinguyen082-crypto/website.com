# Vietnam Airlines Group | PTFS — Website

A multi-page public website for the Vietnam Airlines Group PTFS community: home, about, fleet,
routes, booking, LotusMiles, deals, flight status, check-in, careers, news, and Discord login.

## Run locally

```
npm install
npm start
```

Then open http://localhost:3000

## Deploy to Railway

1. Push this folder to a GitHub repo.
2. In Railway, create a new project from that repo.
3. Railway will detect `package.json` and run `npm start` automatically.
4. Set a custom domain once deployed (used later as your Discord OAuth redirect URI).

## Wiring this into your existing systems

Everything you need to edit lives in **`public/assets/js/config.js`**:

- **Discord invite link** — used in the footer and About page.
- **Discord OAuth** — client ID + redirect URI for your existing Discord app. The login flow
  posts to `login-callback.html`, which is a placeholder for exchanging the auth code on your
  backend (the same way your bot already checks roles/guild membership).
- **Firebase** — fill in your existing `vietjet-ptfs`-style project config and flip `enabled: true`.

### Connecting live data (fleet, routes, flights, news, deals)

All data currently comes from mock JSON files in `public/assets/data/`, loaded through
**`public/assets/js/data.js`**. That file is the single place to change: swap each function's body
to read from your Firebase Realtime Database instead of the local JSON, for example:

```js
async getFleet() {
  return firebase.database().ref('fleet').once('value')
    .then(snap => Object.values(snap.val() || {}));
}
```

No page templates need to change — they all call `VNA_DATA.getX()`, so once `data.js` reads from
Firebase, every page updates automatically. This means your Discord bot's existing writes to
Firebase (fleet, flights, loyalty tiers, etc.) can become the live source of truth for the site
without touching the front-end code.

### Booking, check-in, and role-gated seat classes

The `book.html` and `checkin.html` pages are built as UI shells — they currently link out to
`login.html` rather than writing bookings themselves. Once Discord OAuth + Firebase are wired in,
have the submit handlers write directly to the same `bookings` node your bot already manages, and
check the signed-in user's Discord roles before allowing Business/Premium Economy selection,
mirroring the role-gated logic you already built into the bot.

## Structure

```
public/
  index.html, about.html, fleet.html, routes.html, book.html,
  loyalty.html, deals.html, news.html, status.html, checkin.html,
  careers.html, login.html, login-callback.html
  partials/header.html, partials/footer.html
  assets/css/style.css
  assets/js/config.js   ← edit this to connect Discord + Firebase
  assets/js/data.js     ← edit this to read live Firebase data
  assets/js/main.js
  assets/data/*.json    ← mock data, shaped like your Firebase nodes
server.js               ← Express static server for Railway
package.json
```
