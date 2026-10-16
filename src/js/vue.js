// « Voir comme » : un chef parcourt le site comme un scout, ou comme le chef d'équipage d'un équipage.
// C'est l'affichage qui change, pas les droits : lectures et écritures se font toujours avec son compte
// de chef (une validation faite en vue chef d'équipage compte vraiment). Choix mémorisé sur l'appareil.
import { saisonDe } from './saison.js';

const CLE = 'pe-vue';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// { mode: 'scout' } ou { mode: 'ce', eq: '<id>', nom: 'Albatros' }, ou null (vue chef)
export function lireVue() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || 'null');
    return v && (v.mode === 'scout' || (v.mode === 'ce' && v.eq)) ? v : null;
  } catch (e) {
    return null;
  }
}

export function choisirVue(v) {
  try {
    if (v) localStorage.setItem(CLE, JSON.stringify(v));
    else localStorage.removeItem(CLE);
    sessionStorage.removeItem('pe-afaire');
  } catch (e) {}
  location.reload();
}

// Profil vu par les pages : rôle de scout, chef d'équipage de l'équipage choisi ou de rien.
// Le vrai profil reste dans _vrai (réponses aux questions, voir fb.answer).
export function simuler(p, v) {
  const s = String(saisonDe());
  const ce = { ...(p.ce || {}) };
  delete ce[s];
  if (v.mode === 'ce') ce[s] = v.eq;
  return { ...p, role: 'eleve', ce, _vrai: p, _vue: v };
}

export const libelle = (v) => (!v ? 'chef' : v.mode === 'scout' ? 'scout' : `chef d’équipage${v.nom ? ' (' + v.nom + ')' : ''}`);

// Liste déroulante : « chef », « scout », « chef d'équipage de … » pour chaque équipage de la saison
export function vueSelect(compos, v = lireVue()) {
  const cur = !v ? 'chef' : v.mode === 'scout' ? 'scout' : 'ce:' + v.eq;
  const opts = [
    ['chef', 'Chef (normal)'],
    ['scout', 'Scout'],
    ...compos
      .slice()
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
      .map((c) => ['ce:' + c.id, `Chef d’équipage, ${c.nom}`]),
  ];
  if (v && v.mode === 'ce' && !compos.some((c) => c.id === v.eq)) opts.push([cur, `Chef d’équipage, ${v.nom || '?'}`]);
  return `<select class="vue-sel" aria-label="Voir le site comme">${opts
    .map(([k, l]) => `<option value="${esc(k)}"${k === cur ? ' selected' : ''}>${esc(l)}</option>`)
    .join('')}</select>`;
}

export function brancher(root) {
  root.querySelectorAll('.vue-sel').forEach((sel) => {
    sel.onchange = () => {
      const x = sel.value;
      const nom = sel.options[sel.selectedIndex].textContent.replace(/^Chef d’équipage, /, '');
      choisirVue(x === 'chef' ? null : x === 'scout' ? { mode: 'scout' } : { mode: 'ce', eq: x.slice(3), nom });
    };
  });
}
