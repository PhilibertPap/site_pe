// Tableau de bord d'un équipage et demandes de validation du carnet.
// Chefs : tous les équipages, au choix. Chef d'équipage : le sien seulement (les règles Firestore l'imposent).
// Lecture seule pour le classement : seuls les chefs le publient (en arrière-plan, voir auth.js).
import * as fb from './fb.js';
import { classement, scoreMois, BAREME } from './classement.js';
import { statsEquipage, lire, pts } from './agregats.js';
import { toast, allerAncre } from './ui.js';
import { saisonDe, saisonLabel, moisDe, moisLabel, moisCourt, semaineDe, moisDeSaison } from './saison.js';
import { THEMES } from './qcm/index.js';
import { ITEMS, TOTAUX, valides } from './attendus.js';
import { badges, ceDe, estChefEq, objectifDe } from './diplomes.js';
import { courbe } from './courbe.js';

const box = document.getElementById('equipage');
const ROOT = document.body.dataset.root || '../';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString('fr-FR');
const pct = (a, n) => (n ? Math.round((100 * a) / n) : 0);
const date = (d) => (d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '');

async function show(me, eqId) {
  const saison = saisonDe();
  const chef = me.role === 'chef';
  let compos, stats, bonus, demandes, profils, tabPub;
  let visibles, eq;
  try {
    [compos, bonus] = await Promise.all([fb.compositions(saison), fb.listBonus(saison)]);
    visibles = chef ? compos : compos.filter((c) => c.id === ceDe(me, saison));
    eq = visibles.find((c) => c.id === eqId) || visibles.find((c) => c.chefEq === me.uid) || visibles[0];
    const uids = ((eq && eq.membres) || []).map((x) => x.uid);
    if (chef) {
      let users;
      [stats, demandes, users] = await Promise.all([fb.statsSaison(saison), fb.toutesDemandes(), fb.listUsers()]);
      profils = Object.fromEntries(users.map((u) => [u.uid, u]));
    } else {
      // chef d'équipage : uniquement ses équipiers, document par document
      const [st, dem, pr] = await Promise.all([
        eq ? statsEquipage(saison, eq) : [],
        eq ? fb.demandesEquipage(eq.id).catch(() => []) : [],
        Promise.all(uids.map((u) => fb.getProfile(u).catch(() => null))),
      ]);
      stats = st;
      demandes = dem.filter((d) => uids.includes(d.uid));
      profils = Object.fromEntries(pr.filter(Boolean).map((u) => [u.uid, u]));
    }
    tabPub = await lire(saison, compos).catch(() => null);
  } catch (e) {
    box.innerHTML = `<p>${esc(fb.message(e))}</p>`;
    return;
  }
  // chef : choix de l'équipage, bien visible
  const sel =
    chef && visibles.length
      ? `<div class="eq-pick" role="group" aria-label="Choisir l’équipage"><span class="eq-pick-h">Équipage</span>${visibles
          .slice()
          .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
          .map((c) => `<button type="button" data-eq="${c.id}" aria-pressed="${eq && c.id === eq.id}">${esc(c.nom)}</button>`)
          .join('')}</div>`
      : '';
  const now = new Date();
  const m = moisDe(now);
  const sem = semaineDe(now);
  const st = Object.fromEntries(stats.map((s) => [s.uid, s]));

  let html = `${sel}<p class="small muted">Saison ${saisonLabel(saison)}${chef ? ' · vous voyez tous les équipages ; un chef d’équipage ne voit que le sien' : ''}</p>`;
  if (eq) {
    const membres = eq.membres || [];
    const carnets = await Promise.all(membres.map((x) => fb.getCarnet(x.uid).catch(() => ({}))));
    const moi = classement([eq], stats, bonus, saison, now)[0];
    const s = scoreMois(eq, st, m, bonus, now);
    // rang d'après les agrégats publiés des autres équipages
    const rang = tabPub
      ? tabPub.map((e) => ({ id: e.id, t: e.id === eq.id ? s.total : pts(e, m).total })).sort((a, b) => b.t - a.t).findIndex((e) => e.id === eq.id) + 1
      : 0;
    const mois = moisDeSaison(saison, now);
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
      const p = profils[x.uid] || {};
      const obj = objectifDe(p);
      const nv = valides(carnets[i], obj);
      const dernier = (u.epreuves || []).slice(-1)[0];
      return `<tr${fait ? '' : ' class="idle"'}><td class="nowrap"><a href="${ROOT}carnet/index.html?uid=${x.uid}">${esc(x.name)}</a>${x.uid === eq.chefEq ? ' <span class="tag">CE</span>' : ''}${badges(p)}</td>
        <td class="num">${fait ? 'oui' : '<span class="err-t">non</span>'}</td>
        <td class="num">${u.defis && u.defis[sem] != null ? u.defis[sem] + '/10' : '–'}</td>
        <td class="num">${mo.n || 0}</td><td class="num">${mo.best ? mo.best + '/30' : '–'}</td>
        <td class="num">${dernier ? dernier.s + '/30' : '–'}</td>
        <td>${faibles || '<span class="muted small">–</span>'}</td>
        <td class="num nowrap"><span class="small muted">${obj}</span> ${nv}/${TOTAUX[obj]}</td></tr>`;
    });
    html += `
    <h2 id="tableau">${chef ? '' : 'Mon équipage : '}${esc(eq.nom)}${eq.chefEqName ? ` <span class="small muted">· chef d’équipage ${esc(eq.chefEqName)}</span>` : chef ? ' <span class="small err-t">· pas de chef d’équipage</span>' : ''}</h2>
    <p>${rang ? `<b>${rang}<sup>${rang === 1 ? 'er' : 'e'}</sup></b> en ${moisLabel(m)} avec <b>${f1(s.total)}</b> points` : `<b>${f1(s.total)}</b> points en ${moisLabel(m)}`} (niveau ${f1(s.niveau)}/${BAREME.niveau}, régularité ${f1(s.regularite)}/${BAREME.regularite}, défi ${f1(s.defi)}/${BAREME.defi}${s.bonus ? `, bonus ${s.bonus}` : ''}). <a href="${ROOT}equipages/index.html#points">Le calcul des points</a>.</p>
    <div class="tbl-wrap"><table class="dash"><thead><tr><th>Membre</th><th class="num">Épreuve cette semaine</th><th class="num">Défi</th><th class="num">Épreuves du mois</th><th class="num">Meilleure du mois</th><th class="num">Dernière</th><th>Thèmes faibles</th><th class="num">Carnet</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>
    <p class="small muted">Thèmes faibles : moins de 70 % de bonnes réponses sur la saison (5 réponses au moins), tous QCM confondus. Cliquer sur un nom ouvre son carnet de progression.</p>
    ${
      mois.length >= 2
        ? `<figure class="courbe-fig">${courbe([{ nom: eq.nom, pts: mois.map((x, i) => ({ x: i, y: moi.parMois[x].total })) }], { labels: mois.map(moisCourt), ymax: 100 })}<figcaption>Points de l’équipage, mois par mois.</figcaption></figure>`
        : ''
    }`;
  } else if (!chef) {
    html += '<p class="vide">Votre équipage n’a pas encore été composé pour cette saison. Les chefs s’en occupent.</p>';
  } else {
    html += `<p class="vide">Aucun équipage composé pour ${saisonLabel(saison)} : <a href="${ROOT}chefs/equipages.html#composition">composez-les ici</a>.</p>`;
  }

  // demandes de validation : toutes pour un chef, celles de l'équipage pour un chef d'équipage
  const uidsEq = new Set(((eq && eq.membres) || []).map((x) => x.uid));
  const dem = (chef ? demandes : demandes.filter((d) => uidsEq.has(d.uid))).filter((d) => d.uid !== me.uid).sort((a, b) => (a.at || 0) - (b.at || 0));
  const nomEq = (uid) => (compos.find((c) => (c.membres || []).some((x) => x.uid === uid)) || {}).nom || '';
  html += `<h2 id="demandes">${chef ? 'Demandes de validation, tous équipages' : 'Demandes de vos équipiers'} (${dem.length})</h2>
  <p class="small muted">Le scout demande qu’on valide un point de son carnet de progression. Vérifiez avec lui, signez son carnet papier, puis cliquez « Validé ». « Pas encore » retire la demande : il pourra la refaire quand il sera prêt.</p>
  ${
    dem.length
      ? `<ul class="demandes">${dem
          .map(
            (d) => `<li data-uid="${d.uid}" data-item="${d.item}"><div><b>${esc(d.name)}</b> <span class="muted small">${esc(nomEq(d.uid))} · ${date(d.at)}${ITEMS[d.item] ? ' · carnet ' + ITEMS[d.item].liste : ''}</span><br>${esc((ITEMS[d.item] || {}).texte || d.item)}</div>
            <div class="btns"><button class="btn small" type="button" data-a="ok">Validé (signé)</button><button class="btn small ghost" type="button" data-a="non">Pas encore</button></div></li>`
          )
          .join('')}</ul>`
      : '<p class="muted">Aucune demande en attente.</p>'
  }`;
  box.innerHTML = html;
  box.querySelectorAll('[data-eq]').forEach(
    (b) =>
      (b.onclick = () => {
        history.replaceState(null, '', `?eq=${encodeURIComponent(b.dataset.eq)}`);
        show(me, b.dataset.eq);
      })
  );
  allerAncre();
  box.querySelectorAll('.demandes [data-a]').forEach((b) => {
    b.onclick = async () => {
      const li = b.closest('li');
      b.disabled = true;
      const nom = li.querySelector('b').textContent;
      try {
        if (b.dataset.a === 'ok') await fb.valider(li.dataset.uid, li.dataset.item, me, true);
        else await fb.annulerDemande(li.dataset.uid, li.dataset.item);
        li.remove();
        toast(b.dataset.a === 'ok' ? `Point validé dans le carnet de ${nom}.` : `Demande de ${nom} retirée : il pourra la refaire.`);
        const h = box.querySelector('#demandes');
        const n = box.querySelectorAll('.demandes li').length;
        if (h) h.textContent = h.textContent.replace(/\(\d+\)$/, `(${n})`);
        if (!n) box.querySelector('.demandes').outerHTML = '<p class="muted">Aucune demande en attente.</p>';
      } catch (e) {
        b.disabled = false;
        toast(fb.message(e), true);
      }
    };
  });
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me) {
    box.innerHTML = '<p>Cette page n’est pas encore activée sur ce site.</p>';
    return;
  }
  if (!(me.role === 'chef' || estChefEq(me))) {
    box.innerHTML = `<p>Cette page est réservée aux chefs d’équipage et aux chefs. Vos propres résultats et votre carnet sont dans <a href="${ROOT}compte/index.html">Mon espace</a>.</p>`;
    return;
  }
  show(me, new URLSearchParams(location.search).get('eq'));
});
