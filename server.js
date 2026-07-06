const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Config from environment (set these in Railway's Variables tab) ----
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || '';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || ''; // your community's server ID, for role checks

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Very simple in-memory session store ----
// Fine for a small community site. If you redeploy/restart, sessions clear
// and people just sign in again. For a persistent version, swap this Map
// for a row in your existing Firebase database instead.
const sessions = new Map();

function createSession(data) {
  const id = crypto.randomBytes(24).toString('hex');
  sessions.set(id, data);
  return id;
}

// ---- Step 1: exchange the Discord ?code= for an access token, then fetch
// the user's profile and their roles in your community server. ----
app.get('/api/auth/discord', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/login.html?error=missing_code');

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
    return res.redirect('/login.html?error=not_configured');
  }

  try {
    // Exchange the authorization code for an access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });
    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
    const tokenData = await tokenRes.json();

    // Fetch the signed-in user's profile
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    // Fetch the user's member info (incl. roles) in your community server.
    // Requires the "guilds.members.read" scope (already set in config.js).
    let roles = [];
    if (DISCORD_GUILD_ID) {
      const memberRes = await fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (memberRes.ok) {
        const member = await memberRes.json();
        roles = member.roles || [];
      }
    }

    const sessionId = createSession({
      discordId: user.id,
      username: user.username,
      avatar: user.avatar,
      roles,
      createdAt: Date.now(),
    });

    res.cookie('vna_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    res.redirect('/?login=success');
  } catch (err) {
    console.error('Discord OAuth error:', err);
    res.redirect('/login.html?error=oauth_failed');
  }
});

// ---- Check current session (used by pages to show signed-in state) ----
app.get('/api/session', (req, res) => {
  const session = sessions.get(req.cookies.vna_session);
  if (!session) return res.status(401).json({ loggedIn: false });
  res.json({ loggedIn: true, username: session.username, roles: session.roles });
});

app.post('/api/logout', (req, res) => {
  sessions.delete(req.cookies.vna_session);
  res.clearCookie('vna_session');
  res.json({ ok: true });
});

// Fallback so direct links to any page still resolve
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Vietnam Airlines Group site running on port ${PORT}`);
});
