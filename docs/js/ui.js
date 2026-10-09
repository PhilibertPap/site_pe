// Petits outils d'interface communs : message de confirmation (toast) et confirmation par un second clic.

// Message bref en bas de l'écran, visible quel que soit l'endroit où l'on a cliqué.
let timer = 0;
export function toast(msg, err = false) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast show' + (err ? ' err' : '');
  clearTimeout(timer);
  timer = setTimeout(() => t.classList.remove('show'), err ? 8000 : 5000);
}

// Action destructrice : le premier clic change le libellé (« confirmer… »), le second agit.
// Sans clic dans les 6 secondes, le bouton revient à son état initial. Renvoie true au second clic.
export function deuxClics(b, libelle) {
  if (b.dataset.confirm) return true;
  b.dataset.confirm = '1';
  const avant = b.textContent;
  b.textContent = libelle;
  b.classList.add('confirm');
  setTimeout(() => {
    if (b.isConnected && b.dataset.confirm && !b.disabled) {
      delete b.dataset.confirm;
      b.textContent = avant;
      b.classList.remove('confirm');
    }
  }, 6000);
  return false;
}

// Après le premier affichage d'un contenu chargé en différé : aller à l'ancre de l'adresse (#demandes…),
// que le navigateur n'a pas pu trouver au chargement de la page.
let ancreFaite = false;
export function allerAncre() {
  if (ancreFaite || !location.hash) return;
  ancreFaite = true;
  let t = null;
  try {
    t = document.querySelector(decodeURIComponent(location.hash));
  } catch (e) {}
  if (t) t.scrollIntoView();
}
