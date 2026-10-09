// Carnet de progression (PE, CQ ou CF) : ce que le scout sait faire, validé par un chef ou son chef d'équipage.
import * as fb from './fb.js';
import { LISTES, TOTAUX, valides } from './attendus.js';
import { OBJECTIFS, objectifDe, estChefEq, ceDe } from './diplomes.js';
import { saisonDe } from './saison.js';

const box = document.getElementById('carnet');
const ROOT = document.body.dataset.root || '../';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const date = (d) => (d && d.toDate ? d.toDate() : d instanceof Date ? d : typeof d === 'number' ? new Date(d) : null);
const jour = (d) => (date(d) ? date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
// chef, ou chef d'équipage de la saison (les règles vérifient que le scout est dans son équipage)
const validateur = (p) => !!p && (p.role === 'chef' || estChefEq(p));

async function show(me, uid, liste) {
  box.innerHTML = '<p class="muted">Chargement…</p>';
  const self = uid === me.uid;
  let v, dem, nom = me.name, profil = me;
  try {
    [v, dem] = await Promise.all([
      fb.getCarnet(uid),
      self || me.role === 'chef' ? fb.mesDemandes(uid) : fb.demandesEquipage(ceDe(me)).then((l) => l.filter((d) => d.uid === uid)),
    ]);
    if (!self) {
      profil = await fb.getProfile(uid).catch(() => null);
      if (profil) nom = profil.name;
      else {
        const c = await fb.compositions(saisonDe()).catch(() => []);
        const x = c.flatMap((e) => e.membres || []).find((m) => m.uid === uid);
        nom = x ? x.name : 'ce scout';
      }
    }
  } catch (e) {
    box.innerHTML = `<p>${e && e.code === 'permission-denied' ? 'Vous n’avez pas accès au carnet de ce scout : seuls les chefs et son chef d’équipage le voient.' : esc(fb.message(e))}</p>`;
    return;
  }
  const obj = objectifDe(profil);
  liste = liste || obj;
  const SECTIONS = LISTES[liste];
  const TOTAL = TOTAUX[liste];
  const demandes = new Set(dem.map((d) => d.item));
  const nv = valides(v, liste);
  const nd = SECTIONS.flatMap((s) => s.items).filter(([id]) => demandes.has(id) && !v[id]).length;
  const peutValider = !self && validateur(me);
  const barre = (a, n) => `<span class="bar"><span style="width:${n ? Math.round((100 * a) / n) : 0}%"></span></span>`;

  box.innerHTML = `
  ${self ? '' : `<p class="small"><a href="${ROOT}${me.role === 'chef' ? 'chefs/index.html#inscrits' : 'equipage/index.html'}">← ${me.role === 'chef' ? 'Vue d’ensemble' : 'Tableau de bord'}</a></p><h2 class="carnet-nom">Carnet de ${esc(nom)}</h2>`}
  <div class="gate-tabs carnet-tabs" role="tablist" aria-label="Liste">${Object.keys(LISTES)
    .map(
      (k) => `<button type="button" role="tab" data-l="${k}" aria-selected="${k === liste}">${k}${k === obj ? ' <span class="small muted">(objectif)</span>' : ''}</button>`
    )
    .join('')}</div>
  <p class="small muted">${liste === 'PE' ? 'Liste « Avant de me présenter au PE » de la Passerelle SUF.' : `Liste établie d’après le manuel de formation du ${OBJECTIFS[liste].nom.toLowerCase()} de la Passerelle SUF.`} <a href="${ROOT}${OBJECTIFS[liste].page}">Le parcours ${liste}</a></p>
  <p class="carnet-total">${barre(nv, TOTAL)} <b>${nv}</b> point${nv > 1 ? 's' : ''} validé${nv > 1 ? 's' : ''} sur ${TOTAL}${nd ? ` · ${nd} demande${nd > 1 ? 's' : ''} en attente` : ''}</p>
  ${SECTIONS.map((s) => {
    const n = s.items.filter(([id]) => v[id]).length;
    return `<section class="carnet-sec"><h2 id="${s.id}">${esc(s.titre)} <span class="small muted">${n}/${s.items.length}</span></h2>
    <ul class="carnet">${s.items
      .map(([id, texte, ref]) => {
        const ok = v[id];
        const d = demandes.has(id);
        let etat = ok
          ? `<span class="tag tag-ok">validé</span> <span class="small muted">${esc(ok.byName)}, ${jour(ok.at)}</span>`
          : d
          ? '<span class="tag tag-chef">demande envoyée</span>'
          : '';
        let act = '';
        if (self && !ok) act = d ? `<button class="linkish" type="button" data-a="annuler">annuler la demande</button>` : `<button class="btn small ghost" type="button" data-a="demander">Demander une validation</button>`;
        if (peutValider) act = ok ? `<button class="linkish" type="button" data-a="retirer">retirer la validation</button>` : `<button class="btn small" type="button" data-a="valider">Valider (signé)</button>`;
        return `<li data-item="${id}" class="${ok ? 'ok' : d ? 'dem' : ''}"><span class="carnet-t">${esc(texte)} <a class="small" href="${ROOT}${ref}">réviser</a></span><span class="carnet-e">${etat}</span><span class="carnet-a">${act}</span></li>`;
      })
      .join('')}</ul></section>`;
  }).join('')}`;

  box.querySelectorAll('[data-l]').forEach((b) => (b.onclick = () => show(me, uid, b.dataset.l)));
  box.querySelectorAll('[data-a]').forEach((b) => {
    b.onclick = async () => {
      const item = b.closest('li').dataset.item;
      b.disabled = true;
      try {
        if (b.dataset.a === 'demander') await fb.demander(me, item, saisonDe());
        if (b.dataset.a === 'annuler') await fb.annulerDemande(me.uid, item);
        if (b.dataset.a === 'valider') await fb.valider(uid, item, me, true);
        if (b.dataset.a === 'retirer') await fb.valider(uid, item, me, false);
        show(me, uid, liste);
      } catch (e) {
        b.disabled = false;
        b.textContent = fb.message(e);
      }
    };
  });
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me) {
    box.innerHTML = '<p>Le carnet de progression n’est pas encore activé sur ce site.</p>';
    return;
  }
  const q = new URLSearchParams(location.search);
  const uid = q.get('uid') || me.uid;
  const liste = LISTES[q.get('liste')] ? q.get('liste') : null;
  if (uid !== me.uid && !validateur(me)) {
    box.innerHTML = '<p>Seuls les chefs et le chef d’équipage d’un scout peuvent voir son carnet.</p>';
    return;
  }
  show(me, uid, liste);
});
