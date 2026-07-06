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

1. Push this folder to a GitHub repo (or use `railway up` from the CLI to skip GitHub entirely).
2. In Railway, create a new project from that repo.
3. Railway detects `package.json` and runs `npm start` automatically.
4. Set a custom domain — you'll need it for the two steps below.

## 1. Connect your live Firebase data (fleet, routes, flights, news, deals)

Edit **`public/assets/js/config.js`**:

```js
firebase: {
  enabled: true,
  apiKey: "...",
  authDomain: "...",
  databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "...",
},
```

Use the same Firebase project your Discord bot already writes to. Once `enabled: true` is set,
every page automatically reads live data instead of the mock JSON in `public/assets/data/`
— no other code changes needed.

**Field names:** `public/assets/js/data.js` assumes your bot's nodes look roughly like:
- `/fleet` — records with `name`, `role`/`description`, `count`, `seats.economy/premiumEconomy/business`, `range`, `image`
- `/flights` — records with `flightNumber`, `from`, `to`, `aircraft`, `departure`, `arrival`, `status`, `gate`
- `/routes`, `/news`, `/deals` — plain arrays/objects

If your bot uses different key names, open `data.js` and adjust the `mapFleet` / `mapFlight`
functions near the top — that's the only place field names are translated.

## 2. Turn on Discord login

The login button now talks to a real backend endpoint (`server.js`), not just a placeholder.

**In `public/assets/js/config.js`** (safe to be public):
```js
discordOAuth: {
  clientId: "YOUR_DISCORD_CLIENT_ID",
  redirectUri: "https://your-domain.up.railway.app/login-callback.html",
  scope: "identify guilds.members.read",
},
```

**In Railway → your project → Variables tab** (kept secret, server-side only):
| Variable | Value |
|---|---|
| `DISCORD_CLIENT_ID` | Same as `clientId` above |
| `DISCORD_CLIENT_SECRET` | From your Discord app's OAuth2 page |
| `DISCORD_REDIRECT_URI` | Same as `redirectUri` above, exactly |
| `DISCORD_GUILD_ID` | Your community Discord server's ID (for checking roles) |

**In the Discord Developer Portal** (https://discord.com/developers/applications → your app → OAuth2):
- Add the same redirect URI under **Redirects**.

Once all three places match, clicking "Continue with Discord" will:
1. Send the person to Discord to approve
2. Redirect back to `login-callback.html`, which hands the code to `/api/auth/discord`
3. The server exchanges it for a token, fetches the person's roles in your server, and sets a
   session cookie
4. Redirects them back to the homepage, signed in

This currently uses a simple in-memory session (clears on redeploy/restart). If you want sessions
to persist, swap the `Map` in `server.js` for a small table in your existing Firebase database.

### Booking and role-gated seat classes

`book.html` now mirrors a bot-style flow: search → pick a flight → choose a cabin → confirm.
Premium Economy and Business are flagged as requiring a pass. Once login is wired in, update the
"Continue" logic in `book.html` to check `fetch('/api/session')` for the roles Discord returned,
and gate cabin selection the same way your bot's `/book` command already does — then write the
confirmed booking to your `bookings` node in Firebase so it shows up wherever your bot reads from.

## Structure

```
public/
  index.html, about.html, fleet.html, routes.html, book.html,
  loyalty.html, deals.html, news.html, status.html, checkin.html,
  careers.html, login.html, login-callback.html
  partials/header.html, partials/footer.html
  assets/css/style.css
  assets/js/config.js   ← Discord client ID/redirect + Firebase project config
  assets/js/data.js     ← reads live Firebase data, falls back to mock JSON
  assets/js/main.js
  assets/data/*.json    ← mock data, used until Firebase is enabled
server.js               ← Express server + Discord OAuth backend, for Railway
package.json
```
