// Mon espace : objectif et parcours, diplômes, équipage, progression, carnet, liens utiles.
import * as fb from './fb.js';
import { lire, pts } from './agregats.js';
import { saisonDe, saisonLabel, moisDe, moisLabel } from './saison.js';
import { LISTES, TOTAUX, valides } from './attendus.js';
import { DIPLOMES, CODES, OBJECTIFS, MOIS_RE, objectifDe, diplomesDe, estFormateur, estChefEq, badges, etapesHTML, plusMois, moisRestants, VALIDITE_MODULE } from './diplomes.js';
import { courbe } from './courbe.js';

const box = document.getElementById('compte');
const ROOT = document.body.dataset.root || '../';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString('fr-FR');
const barre = (n, t) => `<span class="bar"><span style="width:${t ? Math.round((100 * n) / t) : 0}%"></span></span>`;
const dateDip = (m) => (m === '?' ? 'date non renseignée' : moisLabel(m));

// Prérequis d'un objectif : [{ code, etat: 'ok' | 'decl' | 'manque', texte }]
function prerequis(me, decl, obj) {
  const o = OBJECTIFS[obj];
  const d = diplomesDe(me);
  // type : 'requis' (prérequis), 'conseil', 'vise' (diplôme à obtenir)
  const ligne = (c, type) => {
    const nom = DIPLOMES[c].nom + (type === 'conseil' ? ' (fortement conseillé)' : '');
    if (d[c]) return `<li class="ok"><span class="pr-e">✓</span> ${nom} <span class="small muted">${dateDip(d[c])}</span></li>`;
    if (d.pe && c.startsWith('pe_')) return `<li class="ok"><span class="pr-e">✓</span> ${nom} <span class="small muted">PE obtenu</span></li>`;
    if (decl[c]) return `<li class="decl"><span class="pr-e">…</span> ${nom} <span class="small muted">déclaré (${moisLabel(decl[c])}), en attente de confirmation par un chef</span></li>`;
    if (type === 'requis') return `<li class="manque"><span class="pr-e">✗</span> ${nom} <span class="small muted">manquant</span></li>`;
    return `<li class="todo"><span class="pr-e">○</span> ${nom} <span class="small muted">${type === 'vise' ? 'à obtenir' : 'pas encore'}</span></li>`;
  };
  const pre = [...o.requis.map((c) => ligne(c, 'requis')), ...(o.conseil || []).map((c) => ligne(c, 'conseil')), ...o.autres.map((t) => `<li class="info"><span class="pr-e">·</span> ${t}</li>`)];
  return `<h3>Prérequis</h3><ul class="prereq">${pre.join('')}</ul>
  <h3>Diplôme visé</h3><ul class="prereq">${o.vise.map((c) => ligne(c, 'vise')).join('')}</ul>`;
}

// Modules du PE : validité 18 mois tant que le PE complet n'est pas obtenu
function modulesPE(me, now = new Date()) {
  const d = diplomesDe(me);
  if (d.pe) return '';
  const l = ['pe_theo', 'pe_prat']
    .filter((c) => d[c] && d[c] !== '?')
    .map((c) => {
      const r = moisRestants(d[c], now);
      const fin = moisLabel(plusMois(d[c], VALIDITE_MODULE));
      const alerte = r < 0 ? `<b class="err-t">expiré depuis ${fin}</b> : à repasser` : r < 3 ? `<b class="err-t">expire en ${fin}</b>, dans moins de 3 mois` : `valable jusqu’en ${fin}`;
      return `<li>${DIPLOMES[c].nom}, ${moisLabel(d[c])} : ${alerte}</li>`;
    });
  if (!l.length) return '';
  const deux = d.pe_theo && d.pe_prat;
  return `<div class="box warn modules"><p class="box-label">Modules du PE.</p><ul>${l.join('')}</ul><p class="small">Chaque module expire ${VALIDITE_MODULE} mois après sa validation ; le PE est délivré quand les deux sont validés.${
    deux ? ' Vos deux modules sont validés : déclarez le PE complet ci-dessous.' : ''
  }</p></div>`;
}

function diplomesHTML(me, decl) {
  const d = diplomesDe(me);
  const conf = CODES.filter((c) => d[c]);
  const att = CODES.filter((c) => decl[c] && !d[c]);
  const libres = CODES.filter((c) => !d[c] && !decl[c]);
  return `
  ${
    conf.length
      ? `<div class="tbl-wrap"><table class="dips"><tbody>${conf
          .map((c) => `<tr><td>${DIPLOMES[c].nom}</td><td class="nowrap">${dateDip(d[c])}</td><td><span class="tag tag-ok">confirmé</span></td></tr>`)
          .join('')}</tbody></table></div>`
      : '<p class="muted">Aucun diplôme confirmé pour l’instant.</p>'
  }
  ${modulesPE(me)}
  ${
    att.length
      ? `<h3>En attente de confirmation</h3><ul class="decl-list">${att
          .map((c) => `<li data-c="${c}">${DIPLOMES[c].nom}, ${moisLabel(decl[c])} <button class="linkish" type="button" data-a="annuler-dip">annuler</button></li>`)
          .join('')}</ul>`
      : ''
  }
  ${
    libres.length
      ? `<form id="dip-form" class="inline-form">
    <select name="code" aria-label="Diplôme">${libres.map((c) => `<option value="${c}">${DIPLOMES[c].nom}</option>`).join('')}</select>
    <input name="mois" type="month" max="${moisDe()}" required aria-label="Mois d’obtention" placeholder="AAAA-MM">
    <button class="btn small" type="submit">Déclarer</button> <span class="small" id="dip-msg"></span>
  </form>
  <p class="small muted">Indiquez le mois d’obtention. Un chef confirme la déclaration, sur présentation du diplôme ou de Céphée ; le diplôme apparaît alors à côté de votre nom.</p>`
      : ''
  }`;
}

async function show(me) {
  const saison = saisonDe();
  const chef = me.role === 'chef';
  const chefEq = estChefEq(me, saison);
  const formateur = estFormateur(me);
  const obj = objectifDe(me);
  const [rs, carnet, compos, decl] = await Promise.all([
    fb.myResults(me.uid).catch(() => []),
    fb.getCarnet(me.uid).catch(() => ({})),
    fb.compositions(saison).catch(() => []),
    fb.mesDeclarations(me.uid).catch(() => ({})),
  ]);
  const mien = compos.find((c) => (c.membres || []).some((x) => x.uid === me.uid));
  const m = moisDe();
  let eqTxt = '<p class="muted">Vous n’êtes dans aucun équipage pour cette saison.</p>';
  if (mien) {
    const tab = await lire(saison, compos).catch(() => null);
    if (tab) {
      const t = tab.map((e) => ({ id: e.id, t: pts(e, m).total })).sort((x, y) => y.t - x.t);
      const r = t.findIndex((e) => e.id === mien.id) + 1;
      eqTxt = `<p>Équipage <b>${esc(mien.nom)}</b>${mien.chefEqName ? `, chef d’équipage ${esc(mien.chefEqName)}` : ''} : <b>${r}<sup>${r === 1 ? 'er' : 'e'}</sup></b> sur ${t.length} en ${moisLabel(m)}, ${f1(t[r - 1].t)} points. <a href="${ROOT}equipages/index.html">Classement</a></p>`;
    } else eqTxt = `<p>Équipage <b>${esc(mien.nom)}</b>. <a href="${ROOT}equipages/index.html">Classement</a></p>`;
  }
  const exams = rs.filter((r) => r.mode === 'examen').reverse();
  const nv = valides(carnet, obj);
  const N = TOTAUX[obj];
  const statuts = [chef && 'chef', chefEq && 'chef d’équipage', formateur && 'formateur'].filter(Boolean);
  const secs = LISTES[obj]
    .map((s) => {
      const n = s.items.filter(([id]) => carnet[id]).length;
      return `<li><a href="${ROOT}carnet/index.html?liste=${obj}#${s.id}">${esc(s.titre.replace(/^\d+\.\s*/, ''))}</a> <span class="small muted">${n}/${s.items.length}</span></li>`;
    })
    .join('');

  box.innerHTML = `
  <p class="kicker">Mon espace · ${saisonLabel(saison)}</p>
  <h1>${esc(me.name)}</h1>
  <p class="lede">${esc(me.unite || '')}${statuts.length ? ` · ${statuts.join(', ')}` : ''} ${badges(me, true)}</p>

  <h2 id="objectif">Je prépare</h2>
  <div class="gate-tabs obj-tabs" role="tablist" aria-label="Objectif">${Object.keys(OBJECTIFS)
    .map((k) => `<button type="button" role="tab" data-obj="${k}" aria-selected="${k === obj}">${k}<span class="obj-n"> · ${OBJECTIFS[k].nom}</span></button>`)
    .join('')}</div>
  <p class="small muted" id="obj-msg">${me.objectif ? '' : 'Choisissez votre objectif : le carnet et le parcours s’y adaptent. Par défaut, le PE.'}</p>

  ${prerequis(me, decl, obj)}
  <h3>Carnet de progression ${obj}</h3>
  <p class="carnet-total">${barre(nv, N)} <b>${nv}</b> sur ${N} points validés. <a href="${ROOT}carnet/index.html?liste=${obj}">Ouvrir mon carnet</a></p>
  <ul class="carnet-secs">${secs}</ul>
  <details class="toc-box parcours-box"><summary>Les étapes du parcours ${obj}</summary>${etapesHTML(obj, ROOT)}<p class="small"><a href="${ROOT}${OBJECTIFS[obj].page}">Le parcours ${obj} en entier</a> : prérequis, examen, étapes.</p></details>

  <h2 id="diplomes">Mes diplômes</h2>
  <div id="dips">${diplomesHTML(me, decl)}</div>

  <h2 id="equipage">Mon équipage</h2>
  ${eqTxt}
  <h2 id="progression">Ma progression au QCM</h2>
  ${
    exams.length >= 2
      ? `<figure class="courbe-fig">${courbe([{ nom: 'Épreuves blanches', pts: exams.map((r) => ({ x: 0, y: r.score })) }], { ymax: 30, seuil: 25, seuilLabel: 'reçu (25)' })}<figcaption>Vos ${exams.length} épreuves blanches, dans l’ordre. Au-dessus de la ligne : reçu.</figcaption></figure>`
      : `<p class="muted">Votre courbe apparaîtra après deux épreuves blanches. <a href="${ROOT}qcm/index.html">Faire une épreuve blanche</a></p>`
  }
  ${
    chefEq || chef || formateur
      ? `<h2 id="encadrer">Encadrer</h2><ul>
      ${chefEq || chef ? `<li><a href="${ROOT}equipage/index.html">Tableau de bord d’équipage</a> : qui s’entraîne, thèmes faibles, carnets, demandes de validation.</li>` : ''}
      ${formateur ? `<li><a href="${ROOT}questions/index.html">Questions des scouts</a> : vos réponses sont signalées comme réponses de formateur.</li>` : ''}
      </ul>`
      : ''
  }
  ${
    chef
      ? `<h2 id="chefs">Espace chefs</h2><ul>
      <li><a href="${ROOT}chefs/index.html">Vue d’ensemble</a> : inscrits, objectifs, diplômes à confirmer, carnets, comptes en attente.</li>
      <li><a href="${ROOT}chefs/equipages.html">Équipages</a> : composer les équipages de la saison, points bonus.</li>
      <li><a href="${ROOT}chefs/resultats.html">Résultats aux QCM</a> : thèmes faibles et questions les plus ratées.</li></ul>`
      : ''
  }`;

  box.querySelectorAll('[data-obj]').forEach((b) => {
    b.onclick = async () => {
      if (b.dataset.obj === me.objectif) return;
      b.disabled = true;
      try {
        await fb.updateUser(me.uid, { objectif: b.dataset.obj });
        me.objectif = b.dataset.obj;
        if (window.PE.saveProfile) window.PE.saveProfile(me);
        show(me);
      } catch (e) {
        b.disabled = false;
        box.querySelector('#obj-msg').textContent = fb.message(e);
      }
    };
  });
  wireDips(me);
}

function wireDips(me) {
  const form = box.querySelector('#dip-form');
  if (form)
    form.onsubmit = async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const msg = form.querySelector('#dip-msg');
      if (!MOIS_RE.test(d.mois || '') || d.mois > moisDe()) {
        msg.textContent = 'Mois invalide (AAAA-MM, pas dans le futur).';
        return;
      }
      form.querySelector('button').disabled = true;
      try {
        await fb.declarer(me.uid, d.code, d.mois);
        show(me);
      } catch (err) {
        form.querySelector('button').disabled = false;
        msg.textContent = fb.message(err);
      }
    };
  box.querySelectorAll('[data-a=annuler-dip]').forEach((b) => {
    b.onclick = async () => {
      b.disabled = true;
      try {
        await fb.annulerDeclaration(me.uid, b.closest('li').dataset.c);
        show(me);
      } catch (err) {
        b.textContent = fb.message(err);
      }
    };
  });
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me) {
    box.innerHTML = '<p>Les comptes ne sont pas encore activés sur ce site.</p>';
    return;
  }
  show(me);
});
