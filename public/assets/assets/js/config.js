/* ============================================================
   SITE CONFIG — the only file you should need to edit to wire
   this website up to your existing Discord bot + Firebase setup.
   ============================================================ */

window.VNA_CONFIG = {
  // Your community Discord invite (used in footer + nav "Discord Server" link)
  discordInviteUrl: "https://discord.gg/YOUR_INVITE_CODE",

  // Discord OAuth2 app details — create an app at https://discord.com/developers/applications
  // and set its redirect URI to this site's /login-callback route.
  discordOAuth: {
    clientId: "YOUR_DISCORD_CLIENT_ID",
    redirectUri: "https://YOUR-DOMAIN.up.railway.app/login-callback.html",
    scope: "identify guilds.members.read",
  },

  // Firebase Realtime Database — same project your bot already writes to.
  // Once filled in, data.js will automatically read live data instead of
  // the local mock JSON files in /assets/data/.
  firebase: {
    enabled: false, // flip to true once the config below is filled in
    apiKey: "",
    authDomain: "",
    databaseURL: "", // e.g. https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app
    projectId: "",
  },
};
