// Classement des équipages (visible par tous les inscrits), lu dans les agrégats publiés.
// Un chef recalcule et publie tous les équipages en ouvrant la page, un chef d'équipage le sien.
import * as fb from './fb.js';
import { BAREME } from './classement.js';
import { publier, lire, pts, majLe } from './agregats.js';
import { estChefEq } from './diplomes.js';
import { saisonDe, saisonLabel, moisDe, moisLabel, moisCourt, semaineDe, moisDeSaison } from './saison.js';
import { courbe } from './courbe.js';

const box = document.getElementById('equipages');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString('fr-FR');
const quand = (d) =>
  d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

async function show(me, saison) {
  box.innerHTML = '<p class="muted">Chargement…</p>';
  const cur = saisonDe();
  let compos, bonus, tab;
  try {
    [compos, bonus] = await Promise.all([fb.compositions(saison), fb.listBonus(saison)]);
    // un chef publie tous les équipages, un chef d'équipage le sien (saison en cours)
    if (me.role === 'chef' || (saison === cur && estChefEq(me, saison))) await publier(me, saison, { compos, bonus }).catch(() => {});
    tab = await lire(saison, compos);
  } catch (e) {
    box.innerHTML = `<p>${esc(fb.message(e))}</p>`;
    return;
  }
  const sel = `<label class="small">Saison <select id="eq-saison">${[cur, cur - 1, cur - 2]
    .map((s) => `<option value="${s}"${s === saison ? ' selected' : ''}>${saisonLabel(s)}</option>`)
    .join('')}</select></label>`;
  if (!compos.length) {
    box.innerHTML = `<div class="res-tools">${sel}</div><p class="muted">Les équipages de cette saison n’ont pas encore été composés par les chefs.</p>`;
    wire(me);
    return;
  }
  const now = saison === cur ? new Date() : new Date(saison + 1, 7, 31);
  const mois = moisDeSaison(saison, now);
  const m = saison === cur ? moisDe(now) : mois[mois.length - 1];
  const mien = compos.find((c) => (c.membres || []).some((x) => x.uid === me.uid));
  const parMois = tab.map((e) => ({ ...e, s: pts(e, m) })).sort((a, b) => b.s.total - a.s.total);
  const sem = semaineDe(now);
  const semaine = (e) => {
    const n = (e.membres || []).length;
    if (!n || !e.sem || e.sem.w !== sem) return null;
    return [`${e.sem.ep}/${n}`, `${e.sem.df}/${n}`];
  };
  const maj = majLe(tab);
  const jamais = tab.filter((e) => !e.pub).length;

  box.innerHTML = `
  <div class="res-tools">${sel}<span class="small muted">${
    maj ? `Classement mis à jour le ${quand(maj)}` : 'Classement pas encore calculé'
  }${maj && jamais ? ` (${jamais} équipage${jamais > 1 ? 's' : ''} pas encore calculé${jamais > 1 ? 's' : ''})` : ''}</span></div>
  <h2 id="mois">${moisLabel(m)}</h2>
  <div class="tbl-wrap"><table class="classement"><thead><tr><th class="num">#</th><th>Équipage</th><th class="num">Niveau /${BAREME.niveau}</th><th class="num">Régularité /${BAREME.regularite}</th><th class="num">Défi /${BAREME.defi}</th><th class="num">Bonus</th><th class="num">Total</th></tr></thead><tbody>${parMois
    .map(
      (e, i) => `<tr${mien && mien.id === e.id ? ' class="hl"' : ''}><td class="num">${i + 1}</td><td><b>${esc(e.nom)}</b></td><td class="num">${f1(e.s.niveau)}</td><td class="num">${f1(e.s.regularite)}</td><td class="num">${f1(e.s.defi)}</td><td class="num">${e.s.bonus ? (e.s.bonus > 0 ? '+' : '') + e.s.bonus : ''}</td><td class="num"><b>${f1(e.s.total)}</b></td></tr>`
    )
    .join('')}</tbody></table></div>
  ${
    saison === cur
      ? `<p class="small muted">Cette semaine : ${tab
          .map((e) => {
            const x = semaine(e);
            return `<b>${esc(e.nom)}</b> ${x ? `${x[0]} en épreuve blanche, ${x[1]} au défi` : 'pas encore de données'}`;
          })
          .join(' · ')}.</p>
        <p class="small muted">Le classement est recalculé quand un chef ou un chef d’équipage ouvre cette page : les points du jour peuvent ne pas encore y figurer.</p>`
      : ''
  }

  <h2 id="saison">Saison ${saisonLabel(saison)}</h2>
  <div class="tbl-wrap"><table class="classement"><thead><tr><th class="num">#</th><th>Équipage</th>${mois.map((x) => `<th class="num">${moisCourt(x)}</th>`).join('')}<th class="num">Total</th></tr></thead><tbody>${tab
    .map(
      (e, i) => `<tr${mien && mien.id === e.id ? ' class="hl"' : ''}><td class="num">${i + 1}</td><td><b>${esc(e.nom)}</b></td>${mois.map((x) => `<td class="num">${f1(pts(e, x).total)}</td>`).join('')}<td class="num"><b>${f1(e.saison)}</b></td></tr>`
    )
    .join('')}</tbody></table></div>
  ${
    mois.length >= 2
      ? `<figure class="courbe-fig">${courbe(
          tab.map((e) => ({ nom: e.nom, pts: mois.map((x, i) => ({ x: i, y: pts(e, x).total })) })),
          { labels: mois.map(moisCourt), ymax: 100, aria: 'Points de chaque équipage, mois par mois' }
        )}<figcaption>Points de chaque équipage, mois par mois.</figcaption></figure>`
      : ''
  }
  ${
    bonus.length
      ? `<h3>Points bonus</h3><ul class="small">${bonus
          .sort((a, b) => (b.at || 0) - (a.at || 0))
          .map((b) => `<li>${esc((compos.find((c) => c.id === b.eq) || {}).nom || '')} : ${b.pts > 0 ? '+' : ''}${b.pts} (${moisLabel(b.mois)}) — ${esc(b.motif)}</li>`)
          .join('')}</ul>`
      : ''
  }
  <h2 id="equipages-liste">Les équipages</h2>
  <div class="eq-cards">${compos
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    .map(
      (c) => `<div class="eq-card${mien && mien.id === c.id ? ' mine' : ''}"><b>${esc(c.nom)}</b><span class="small muted">${(c.membres || []).length} membre${(c.membres || []).length > 1 ? 's' : ''}${c.chefEqName ? ' · chef d’équipage : ' + esc(c.chefEqName) : ''}</span><span class="small">${(c.membres || []).map((x) => esc(x.name)).join(', ')}</span></div>`
    )
    .join('')}</div>`;
  wire(me);
}

function wire(me) {
  const s = box.querySelector('#eq-saison');
  if (s) s.onchange = () => show(me, +s.value);
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me) {
    box.innerHTML = '<p>Le classement des équipages n’est pas encore activé sur ce site.</p>';
    return;
  }
  show(me, saisonDe());
});
