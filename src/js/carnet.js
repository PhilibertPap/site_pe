// Carnet de progression du PE : ce que le scout sait faire, validé par un formateur ou son chef d'équipage.
import * as fb from './fb.js';
import { SECTIONS, TOTAL } from './attendus.js';
import { saisonDe } from './saison.js';

const box = document.getElementById('carnet');
const ROOT = document.body.dataset.root || '../';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const date = (d) => (d && d.toDate ? d.toDate() : d instanceof Date ? d : null);
const jour = (d) => (date(d) ? date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const validateur = (p) => !!p && (p.role === 'chef' || p.pe === true || !!(p.ce && p.ce[String(saisonDe())]));

async function show(me, uid) {
  box.innerHTML = '<p class="muted">Chargement…</p>';
  const self = uid === me.uid;
  let v, dem, nom = me.name;
  try {
    [v, dem] = await Promise.all([fb.getCarnet(uid), fb.mesDemandes(uid)]);
    if (!self) {
      const p = await fb.getProfile(uid).catch(() => null);
      if (p) nom = p.name;
      else {
        const c = await fb.compositions(saisonDe()).catch(() => []);
        const x = c.flatMap((e) => e.membres || []).find((m) => m.uid === uid);
        nom = x ? x.name : 'ce scout';
      }
    }
  } catch (e) {
    box.innerHTML = `<p>${esc(fb.message(e))}</p>`;
    return;
  }
  const demandes = new Set(dem.map((d) => d.item));
  const nv = Object.keys(v).length;
  const peutValider = !self && validateur(me);
  const barre = (a, n) => `<span class="bar"><span style="width:${n ? Math.round((100 * a) / n) : 0}%"></span></span>`;

  box.innerHTML = `
  ${self ? '' : `<p class="small"><a href="${ROOT}equipage/index.html">← Tableau de bord</a></p><h2 class="carnet-nom">Carnet de ${esc(nom)}</h2>`}
  <p class="carnet-total">${barre(nv, TOTAL)} <b>${nv}</b> point${nv > 1 ? 's' : ''} validé${nv > 1 ? 's' : ''} sur ${TOTAL}${demandes.size ? ` · ${demandes.size} demande${demandes.size > 1 ? 's' : ''} en attente` : ''}</p>
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

  box.querySelectorAll('[data-a]').forEach((b) => {
    b.onclick = async () => {
      const item = b.closest('li').dataset.item;
      b.disabled = true;
      try {
        if (b.dataset.a === 'demander') await fb.demander(me, item, saisonDe());
        if (b.dataset.a === 'annuler') await fb.annulerDemande(me.uid, item);
        if (b.dataset.a === 'valider') await fb.valider(uid, item, me, true);
        if (b.dataset.a === 'retirer') await fb.valider(uid, item, me, false);
        show(me, uid);
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
  const uid = new URLSearchParams(location.search).get('uid') || me.uid;
  if (uid !== me.uid && !validateur(me)) {
    box.innerHTML = '<p>Seuls les formateurs et les chefs d’équipage peuvent voir le carnet d’un autre scout.</p>';
    return;
  }
  show(me, uid);
});
