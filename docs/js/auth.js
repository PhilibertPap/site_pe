// Accès réservé : connexion, inscription, compte en attente de validation.
// Chargé sur toutes les pages quand Firebase est configuré.
import * as fb from './fb.js';

const html = document.documentElement;
const ROOT = document.body.dataset.root || '';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const store = {
  get() {
    try { return localStorage.getItem('pe-ok'); } catch (e) { return null; }
  },
  set(v) {
    try { v ? localStorage.setItem('pe-ok', v) : localStorage.removeItem('pe-ok'); } catch (e) {}
  },
};

const cache = {
  get() {
    try { return JSON.parse(localStorage.getItem('pe-profile') || 'null'); } catch (e) { return null; }
  },
  set(p) {
    try {
      if (!p) return localStorage.removeItem('pe-profile');
      // ce qui sert hors réseau : rôle, objectif, diplômes confirmés, équipage et chef d'équipage par saison
      const { uid, name, unite, role, approved, pe, objectif, dip, eq, ce } = p;
      localStorage.setItem(
        'pe-profile',
        JSON.stringify({ uid, name, unite, role, approved, pe: !!pe, objectif: objectif || '', dip: dip || {}, eq: eq || {}, ce: ce || {} })
      );
    } catch (e) {}
  },
};

window.PE = window.PE || {};
window.PE.saveProfile = (p) => cache.set(p);
let resolveUser;
window.PE.userReady = new Promise((r) => (resolveUser = r));

function lock() {
  html.classList.add('gate');
}
function unlock() {
  html.classList.remove('gate');
  const g = document.getElementById('gate');
  if (g) g.remove();
}

function panel(inner) {
  let g = document.getElementById('gate');
  if (!g) {
    g = document.createElement('div');
    g.id = 'gate';
    document.body.insertBefore(g, document.querySelector('main'));
  }
  g.innerHTML = `<div class="gate-box">${inner}</div>`;
  return g;
}

function loginPanel(tab = 'login', msg = '') {
  lock();
  const g = panel(`
    <p class="kicker">Accès réservé</p>
    <h1>Patron d'embarcation</h1>
    <p class="muted">Ce site est réservé aux scouts marins du groupe et à leurs chefs. Connectez-vous, ou créez un compte : un chef le validera.</p>
    <div class="gate-tabs" role="tablist">
      <button type="button" data-tab="login" aria-selected="${tab === 'login'}">Connexion</button>
      <button type="button" data-tab="register" aria-selected="${tab === 'register'}">Créer un compte</button>
      <button type="button" data-tab="reset" aria-selected="${tab === 'reset'}">Mot de passe oublié</button>
    </div>
    ${tab === 'login' ? `<form data-f="login">
      <label>E-mail<input type="email" name="email" autocomplete="email" required></label>
      <label>Mot de passe<input type="password" name="password" autocomplete="current-password" required></label>
      <button class="btn" type="submit">Se connecter</button>
    </form>` : ''}
    ${tab === 'register' ? `<form data-f="register">
      <label>Prénom et nom<input name="name" autocomplete="name" maxlength="80" required></label>
      <label>Unité (troupe, équipage, ou « chef »)<input name="unite" maxlength="80"></label>
      <label>E-mail<input type="email" name="email" autocomplete="email" required></label>
      <label>Mot de passe (6 caractères au moins)<input type="password" name="password" autocomplete="new-password" minlength="6" required></label>
      <label>Confirmer le mot de passe<input type="password" name="password2" autocomplete="new-password" minlength="6" required></label>
      <button class="btn" type="submit">Créer mon compte</button>
    </form>` : ''}
    ${tab === 'reset' ? `<form data-f="reset">
      <label>E-mail<input type="email" name="email" autocomplete="email" required></label>
      <button class="btn" type="submit">Recevoir un lien de réinitialisation</button>
    </form>` : ''}
    <p class="gate-msg" role="status">${esc(msg)}</p>`);
  g.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => loginPanel(b.dataset.tab)));
  const form = g.querySelector('form');
  const out = g.querySelector('.gate-msg');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const btn = form.querySelector('button');
    btn.disabled = true;
    out.textContent = '';
    try {
      if (form.dataset.f === 'login') await fb.login(d.email.trim(), d.password);
      if (form.dataset.f === 'register') {
        if (d.password !== d.password2) throw { message: 'Les deux mots de passe ne correspondent pas.' };
        await fb.register({ name: d.name.trim(), unite: d.unite.trim(), email: d.email.trim(), password: d.password });
      }
      if (form.dataset.f === 'reset') {
        await fb.resetPassword(d.email.trim());
        out.textContent = 'Si un compte existe pour cette adresse, un e-mail vient d’être envoyé.';
      }
    } catch (err) {
      out.textContent = fb.message(err);
    }
    btn.disabled = false;
  };
}

function waitingPanel(profile) {
  lock();
  const g = panel(`
    <p class="kicker">Compte en attente</p>
    <h1>Bonjour ${esc(profile ? profile.name : '')}</h1>
    <p>Votre compte est créé. Un chef doit maintenant le valider ; vous pourrez alors accéder au site. Prévenez votre chef si c'est urgent.</p>
    <div class="btns"><button class="btn ghost" type="button" data-a="reload">J'ai été validé, réessayer</button><button class="btn ghost" type="button" data-a="logout">Se déconnecter</button></div>`);
  g.querySelector('[data-a=reload]').onclick = () => location.reload();
  g.querySelector('[data-a=logout]').onclick = () => fb.logout();
}

function header(profile) {
  const slot = document.getElementById('acct');
  if (!slot) return;
  slot.innerHTML = `<a class="acct-name" href="${ROOT}compte/index.html" title="Mon espace">${esc(profile.name)}${profile.role === 'chef' ? ' <span class="tag">chef</span>' : ''}</a>
    <button type="button" class="linkish">Déconnexion</button>`;
  slot.querySelector('button').onclick = async () => {
    store.set(null);
    await fb.logout();
  };
}

if (!fb.enabled) {
  unlock();
  resolveUser(null);
} else {
  // si la page vient d'un compte déjà validé sur cet appareil, on l'affiche tout de suite
  if (!store.get()) lock();
  fb.onUser(async (u) => {
    if (!u) {
      store.set(null);
      cache.set(null);
      loginPanel();
      return;
    }
    let profile = null;
    try {
      profile = await fb.getProfile(u.uid);
      if (profile && profile.approved) cache.set(profile);
    } catch (e) {
      // pas de réseau (en mer) : on reprend le profil validé mémorisé sur cet appareil
      const c = cache.get();
      profile = c && c.uid === u.uid ? c : null;
    }
    if (!profile || !profile.approved) {
      store.set(null);
      cache.set(null);
      waitingPanel(profile);
      return;
    }
    store.set(u.uid);
    unlock();
    header(profile);
    window.PE.user = profile;
    resolveUser(profile);
  });
}
