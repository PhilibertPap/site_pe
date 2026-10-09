// Mon espace : statuts, équipage, progression, carnet, liens utiles.
import * as fb from './fb.js';
import { classement } from './classement.js';
import { saisonDe, saisonLabel, moisDe, moisLabel } from './saison.js';
import { TOTAL } from './attendus.js';
import { courbe } from './courbe.js';

const box = document.getElementById('compte');
const ROOT = document.body.dataset.root || '../';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString('fr-FR');

async function show(me) {
  const saison = saisonDe();
  const chef = me.role === 'chef';
  const chefEq = !!(me.ce && me.ce[String(saison)]);
  const formateur = chef || me.pe === true;
  const [rs, carnet, compos, stats, bonus] = await Promise.all([
    fb.myResults(me.uid).catch(() => []),
    fb.getCarnet(me.uid).catch(() => ({})),
    fb.compositions(saison).catch(() => []),
    fb.statsSaison(saison).catch(() => []),
    fb.listBonus(saison).catch(() => []),
  ]);
  const mien = compos.find((c) => (c.membres || []).some((x) => x.uid === me.uid));
  const m = moisDe();
  let eqTxt = '<p class="muted">Vous n’êtes dans aucun équipage pour cette saison.</p>';
  if (mien) {
    const tab = classement(compos, stats, bonus, saison).map((e) => ({ id: e.id, t: e.parMois[m].total })).sort((a, b) => b.t - a.t);
    const r = tab.findIndex((e) => e.id === mien.id) + 1;
    eqTxt = `<p>Équipage <b>${esc(mien.nom)}</b>${mien.chefEqName ? `, chef d’équipage ${esc(mien.chefEqName)}` : ''} : <b>${r}<sup>${r === 1 ? 'er' : 'e'}</sup></b> sur ${tab.length} en ${moisLabel(m)}, ${f1(tab[r - 1].t)} points. <a href="${ROOT}equipages/index.html">Classement</a></p>`;
  }
  const exams = rs.filter((r) => r.mode === 'examen').reverse();
  const nv = Object.keys(carnet).length;
  const statuts = [chef && 'chef', me.pe && 'titulaire du PE', chefEq && 'chef d’équipage', formateur && 'formateur'].filter(Boolean);
  box.innerHTML = `
  <p class="kicker">Mon espace · ${saisonLabel(saison)}</p>
  <h1>${esc(me.name)}</h1>
  <p class="lede">${esc(me.unite || '')}${statuts.length ? ` · ${statuts.join(', ')}` : ''}</p>
  <h2 id="equipage">Mon équipage</h2>
  ${eqTxt}
  <h2 id="progression">Ma progression</h2>
  ${
    exams.length >= 2
      ? `<figure class="courbe-fig">${courbe([{ nom: 'Épreuves blanches', pts: exams.map((r) => ({ x: 0, y: r.score })) }], { ymax: 30, seuil: 25, seuilLabel: 'reçu (25)' })}<figcaption>Vos ${exams.length} épreuves blanches, dans l’ordre. Au-dessus de la ligne : reçu.</figcaption></figure>`
      : `<p class="muted">Votre courbe apparaîtra après deux épreuves blanches. <a href="${ROOT}qcm/index.html">Faire une épreuve blanche</a></p>`
  }
  <h2 id="carnet">Carnet de progression</h2>
  <p><span class="bar"><span style="width:${Math.round((100 * nv) / TOTAL)}%"></span></span> <b>${nv}</b> sur ${TOTAL} points validés. <a href="${ROOT}carnet/index.html">Ouvrir mon carnet</a></p>
  ${
    chefEq || formateur
      ? `<h2 id="encadrer">Encadrer</h2><ul>
      ${chefEq || chef ? `<li><a href="${ROOT}equipage/index.html">Tableau de bord d’équipage</a> : qui s’entraîne, thèmes faibles, carnets.</li>` : ''}
      <li><a href="${ROOT}equipage/index.html#demandes">Demandes de validation du carnet</a></li>
      ${formateur ? `<li><a href="${ROOT}questions/index.html">Questions des scouts</a> : vos réponses sont signalées comme réponses de formateur.</li>` : ''}
      </ul>`
      : ''
  }
  ${
    chef
      ? `<h2 id="chefs">Espace chefs</h2><ul>
      <li><a href="${ROOT}chefs/index.html">Comptes</a> : valider les inscriptions, nommer les chefs, indiquer qui a le PE.</li>
      <li><a href="${ROOT}chefs/equipages.html">Équipages</a> : composer les équipages de la saison, points bonus.</li>
      <li><a href="${ROOT}chefs/resultats.html">Résultats aux QCM</a> : thèmes faibles et questions les plus ratées.</li></ul>`
      : ''
  }`;
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me) {
    box.innerHTML = '<p>Les comptes ne sont pas encore activés sur ce site.</p>';
    return;
  }
  show(me);
});
