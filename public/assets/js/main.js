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
