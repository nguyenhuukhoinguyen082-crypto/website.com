/* ============================================================
   SITE CONFIG — the only file you should need to edit to wire
   this website up to your existing Discord bot + Firebase setup.
   ============================================================ */

window.VNA_CONFIG = {
  // Your community Discord invite (used in footer + nav "Discord Server" link)
  discordInviteUrl: "https://discord.gg/pFgPqSKwFp",

  // Discord OAuth2 app details — create an app at https://discord.com/developers/applications
  // and set its redirect URI to this site's /login-callback.html route.
  // clientId and redirectUri are safe to keep here (public, client-side values).
  // The CLIENT SECRET, the GUILD ID for role checks, and this same redirect URI
  // must ALSO be set as environment variables on Railway (server-side, never
  // in this file): DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET,
  // DISCORD_REDIRECT_URI, DISCORD_GUILD_ID. See README.md for details.
  discordOAuth: {
    clientId: "1498634996729122897",
    redirectUri: "https://vietnamairlines.up.railway.app/login-callback.html",
    scope: "identify guilds.members.read",
  },

  // Firebase Realtime Database — same project your bot already writes to.
  // Once filled in, data.js will automatically read live data instead of
  // the local mock JSON files in /assets/data/.
  firebase: {
    enabled: true, // flip to true once the config below is filled in
    apiKey: "AIzaSyCNZybuiufFOKbRl7T1H0pS_I6rnHhp_JI",
    authDomain: "vietnam-airlines-ptfs.firebaseapp.com",
    databaseURL: "https://vietnam-airlines-ptfs-default-rtdb.asia-southeast1.firebasedatabase.app", // e.g. https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app
    projectId: "vietnam-airlines-ptfs",
  },
};
