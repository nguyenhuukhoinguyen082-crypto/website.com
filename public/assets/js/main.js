// Inject shared header/footer partials, wire up nav + config-driven links
async function loadPartials() {
  const headerHost = document.getElementById('header-slot');
  const footerHost = document.getElementById('footer-slot');

  if (headerHost) {
    headerHost.innerHTML = await fetch('partials/header.html').then(r => r.text());
    const current = document.body.dataset.page;
    document.querySelectorAll('.main-nav a').forEach(a => {
      if (a.dataset.page === current) a.classList.add('active');
    });
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => nav.classList.toggle('open'));
    }
  }

  if (footerHost) {
    footerHost.innerHTML = await fetch('partials/footer.html').then(r => r.text());
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    const inviteUrl = (window.VNA_CONFIG && window.VNA_CONFIG.discordInviteUrl) || '#';
    ['discordFooterLink', 'discordSocialIcon'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.href = inviteUrl;
    });
  }
}

document.addEventListener('DOMContentLoaded', loadPartials);

async function checkSession() {
  const slot = document.getElementById('authSlot');
  if (!slot) return;
  try {
    const res = await fetch('/api/session', { credentials: 'include' });
    if (!res.ok) return; // not logged in — leave the Login button as-is
    const data = await res.json();
    slot.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-family:var(--font-display); font-weight:700; font-size:0.85rem; color:var(--color-primary);">
          ${data.username}
        </span>
        <button id="logoutBtn" class="icon-btn-login" style="border:none; cursor:pointer;">Log out</button>
      </div>`;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/index.html';
    });
  } catch (e) {
    console.warn('Session check failed:', e);
  }
}