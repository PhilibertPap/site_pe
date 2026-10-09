// Tableau de bord d'un équipage (chef d'équipage, chefs) et demandes de validation du carnet.
import * as fb from './fb.js';
import { classement, scoreMois, BAREME } from './classement.js';
import { saisonDe, saisonLabel, moisDe, moisLabel, moisCourt, semaineDe } from './saison.js';
import { THEMES } from './qcm/index.js';
import { ITEMS, TOTAL } from './attendus.js';
import { courbe } from './courbe.js';

const box = document.getElementById('equipage');
const ROOT = document.body.dataset.root || '../';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString('fr-FR');
const pct = (a, n) => (n ? Math.round((100 * a) / n) : 0);
const date = (d) => (d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '');

export const estFormateur = (p) => !!p && (p.role === 'chef' || p.pe === true);
export const estChefEq = (p) => !!(p && p.ce && p.ce[String(saisonDe())]);

async function show(me, eqId) {
  box.innerHTML = '<p class="muted">Chargement…</p>';
  const saison = saisonDe();
  let compos, stats, bonus, demandes;
  try {
    [compos, stats, bonus, demandes] = await Promise.all([fb.compositions(saison), fb.statsSaison(saison), fb.listBonus(saison), fb.toutesDemandes()]);
  } catch (e) {
    box.innerHTML = `<p>${esc(fb.message(e))}</p>`;
    return;
  }
  const chef = me.role === 'chef';
  const visibles = chef ? compos : compos.filter((c) => c.chefEq === me.uid);
  const eq = visibles.find((c) => c.id === eqId) || visibles.find((c) => c.chefEq === me.uid) || visibles[0];
  const sel =
    visibles.length > 1
      ? `<label class="small">Équipage <select id="eq-sel">${visibles
          .map((c) => `<option value="${c.id}"${eq && c.id === eq.id ? ' selected' : ''}>${esc(c.nom)}</option>`)
          .join('')}</select></label>`
      : '';
  const now = new Date();
  const m = moisDe(now);
  const sem = semaineDe(now);
  const st = Object.fromEntries(stats.map((s) => [s.uid, s]));

  let html = `<div class="res-tools">${sel}<span class="small muted">Saison ${saisonLabel(saison)}</span></div>`;
  if (eq) {
    const membres = eq.membres || [];
    const carnets = await Promise.all(membres.map((x) => fb.getCarnet(x.uid).catch(() => ({}))));
    const tab = classement(compos, stats, bonus, saison, now);
    const rang = tab.map((e) => ({ id: e.id, t: e.parMois[m].total })).sort((a, b) => b.t - a.t).findIndex((e) => e.id === eq.id) + 1;
    const s = scoreMois(eq, st, m, bonus, now);
    const moi = tab.find((e) => e.id === eq.id);
    const mois = Object.keys(moi.parMois);
    const rows = membres.map((x, i) => {
      const u = st[x.uid] || {};
      const mo = (u.mois || {})[m] || {};
      const fait = Object.values(u.mois || {}).some((z) => z.sem && z.sem[sem]);
      const th = {};
      Object.values(u.mois || {}).forEach((z) =>
        Object.entries(z.th || {}).forEach(([t, [a, n]]) => {
          th[t] = th[t] || [0, 0];
          th[t][0] += a;
          th[t][1] += n;
        })
      );
      const faibles = Object.entries(th)
        .filter(([, [a, n]]) => n >= 5 && pct(a, n) < 70)
        .sort((p, q) => p[1][0] / p[1][1] - q[1][0] / q[1][1])
        .slice(0, 2)
        .map(([t]) => `<span class="tag tag-open">${THEMES[t] || t}</span>`)
        .join('');
      const nv = Object.keys(carnets[i] || {}).length;
      const dernier = (u.epreuves || []).slice(-1)[0];
      return `<tr${fait ? '' : ' class="idle"'}><td class="nowrap"><a href="${ROOT}carnet/index.html?uid=${x.uid}">${esc(x.name)}</a>${x.uid === eq.chefEq ? ' <span class="tag">CE</span>' : ''}</td>
        <td class="num">${fait ? 'oui' : '<span class="err-t">non</span>'}</td>
        <td class="num">${u.defis && u.defis[sem] != null ? u.defis[sem] + '/10' : '–'}</td>
        <td class="num">${mo.n || 0}</td><td class="num">${mo.best ? mo.best + '/30' : '–'}</td>
        <td class="num">${dernier ? dernier.s + '/30' : '–'}</td>
        <td>${faibles || '<span class="muted small">–</span>'}</td>
        <td class="num">${nv}/${TOTAL}</td></tr>`;
    });
    html += `
    <h2 id="tableau">${esc(eq.nom)}</h2>
    <p>${rang ? `<b>${rang}<sup>${rang === 1 ? 'er' : 'e'}</sup></b> en ${moisLabel(m)} avec <b>${f1(s.total)}</b> points` : ''} (niveau ${f1(s.niveau)}/${BAREME.niveau}, régularité ${f1(s.regularite)}/${BAREME.regularite}, défi ${f1(s.defi)}/${BAREME.defi}${s.bonus ? `, bonus ${s.bonus}` : ''}). <a href="${ROOT}equipages/index.html#points">Le calcul des points</a>.</p>
    <div class="tbl-wrap"><table class="dash"><thead><tr><th>Membre</th><th class="num">Épreuve cette semaine</th><th class="num">Défi</th><th class="num">Épreuves du mois</th><th class="num">Meilleure du mois</th><th class="num">Dernière</th><th>Thèmes faibles</th><th class="num">Carnet</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>
    <p class="small muted">Thèmes faibles : moins de 70 % de bonnes réponses sur la saison (5 réponses au moins), tous QCM confondus. Cliquer sur un nom ouvre son carnet de progression.</p>
    ${
      mois.length >= 2
        ? `<figure class="courbe-fig">${courbe([{ nom: eq.nom, pts: mois.map((x, i) => ({ x: i, y: moi.parMois[x].total })) }], { labels: mois.map(moisCourt), ymax: 100 })}<figcaption>Points de l’équipage, mois par mois.</figcaption></figure>`
        : ''
    }`;
  } else if (!chef) {
    html += estChefEq(me) ? '<p class="muted">Votre équipage n’a pas encore été composé.</p>' : '';
  } else {
    html += `<p class="muted">Aucun équipage composé pour cette saison. <a href="${ROOT}chefs/equipages.html">Composer les équipages</a>.</p>`;
  }

  // demandes de validation : celles de l'équipage pour un chef d'équipage, toutes pour un formateur
  const uidsEq = new Set(((eq && eq.membres) || []).map((x) => x.uid));
  const dem = (estFormateur(me) ? demandes : demandes.filter((d) => uidsEq.has(d.uid))).sort((a, b) => (a.at || 0) - (b.at || 0));
  const nomEq = (uid) => (compos.find((c) => (c.membres || []).some((x) => x.uid === uid)) || {}).nom || '';
  html += `<h2 id="demandes">Demandes de validation (${dem.length})</h2>
  <p class="small muted">Le scout demande qu’on valide un point de son carnet de progression. On signe son carnet papier, puis on valide ici : il sait ainsi ce qui lui reste à travailler.</p>
  ${
    dem.length
      ? `<ul class="demandes">${dem
          .map(
            (d) => `<li data-uid="${d.uid}" data-item="${d.item}"><div><b>${esc(d.name)}</b> <span class="muted small">${esc(nomEq(d.uid))} · ${date(d.at)}</span><br>${esc((ITEMS[d.item] || {}).texte || d.item)}</div>
            <div class="btns"><button class="btn small" type="button" data-a="ok">Validé (signé)</button><button class="btn small ghost" type="button" data-a="non">Pas encore</button></div></li>`
          )
          .join('')}</ul>`
      : '<p class="muted">Aucune demande en attente.</p>'
  }`;
  box.innerHTML = html;
  const s2 = box.querySelector('#eq-sel');
  if (s2) s2.onchange = () => show(me, s2.value);
  box.querySelectorAll('.demandes [data-a]').forEach((b) => {
    b.onclick = async () => {
      const li = b.closest('li');
      b.disabled = true;
      try {
        if (b.dataset.a === 'ok') await fb.valider(li.dataset.uid, li.dataset.item, me, true);
        else await fb.annulerDemande(li.dataset.uid, li.dataset.item);
        li.remove();
      } catch (e) {
        b.disabled = false;
        b.textContent = fb.message(e);
      }
    };
  });
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me) {
    box.innerHTML = '<p>Cette page n’est pas encore activée sur ce site.</p>';
    return;
  }
  if (!(me.role === 'chef' || estFormateur(me) || estChefEq(me))) {
    box.innerHTML = '<p>Cette page est réservée aux chefs d’équipage, aux formateurs et aux chefs.</p>';
    return;
  }
  show(me, new URLSearchParams(location.search).get('eq'));
});
