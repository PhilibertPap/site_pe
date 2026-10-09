// Classement des équipages : statistiques par scout, score mensuel, défi de la semaine.
import { saisonDe, semaineDe, moisDe, semainesDuMois, moisDeSaison, rng } from './saison.js';

// ------------------------------------------------- statistiques d'un scout

// Ajoute un QCM terminé au résumé de saison d'un scout (voir fb.updateStats).
export function appliquer(st, r, now = new Date()) {
  const m = moisDe(now);
  st.mois = st.mois || {};
  st.defis = st.defis || {};
  st.epreuves = st.epreuves || [];
  const mo = (st.mois[m] = st.mois[m] || { best: 0, n: 0, sem: {}, th: {} });
  for (const [t, [a, n]] of Object.entries(r.themes || {})) {
    mo.th[t] = mo.th[t] || [0, 0];
    mo.th[t][0] += a;
    mo.th[t][1] += n;
  }
  if (r.mode === 'examen') {
    mo.best = Math.max(mo.best || 0, r.score);
    mo.n = (mo.n || 0) + 1;
    mo.sem[semaineDe(now)] = 1;
    st.epreuves.push({ t: now.getTime(), s: r.score });
    if (st.epreuves.length > 200) st.epreuves = st.epreuves.slice(-200);
  }
  if (r.mode === 'defi') st.defis[r.semaine] = r.score;
  return st;
}

const aFaitLaSemaine = (st, w) => !!st && Object.values(st.mois || {}).some((mo) => mo.sem && mo.sem[w]);
const moyenne = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// ---------------------------------------------------------- les points

export const BAREME = { niveau: 50, regularite: 30, defi: 20 };

/**
 * Score d'un équipage pour un mois.
 * eq : { membres: [{uid}] } ; stats : { uid: stats } ; bonus : [{ eq, mois, pts }]
 */
export function scoreMois(eq, stats, m, bonus = [], now = new Date()) {
  const uids = (eq.membres || []).map((x) => x.uid);
  const sem = semainesDuMois(m, now);
  const pts = (bonus || []).filter((b) => b.eq === eq.id && b.mois === m).reduce((a, b) => a + (+b.pts || 0), 0);
  if (!uids.length) return { niveau: 0, regularite: 0, defi: 0, bonus: pts, base: 0, total: pts };
  const niveau = BAREME.niveau * moyenne(uids.map((u) => ((stats[u] && stats[u].mois && stats[u].mois[m] && stats[u].mois[m].best) || 0) / 30));
  const regularite = BAREME.regularite * moyenne(sem.map((w) => moyenne(uids.map((u) => (aFaitLaSemaine(stats[u], w) ? 1 : 0)))));
  const defi = BAREME.defi * moyenne(sem.map((w) => moyenne(uids.map((u) => ((stats[u] && stats[u].defis && stats[u].defis[w]) || 0) / 10))));
  const base = niveau + regularite + defi;
  return { niveau, regularite, defi, bonus: pts, base, total: base + pts };
}

// Tableau complet : pour chaque équipage, ses scores mois par mois et le total de la saison.
export function classement(compos, statsList, bonus, saison, now = new Date()) {
  const stats = Object.fromEntries(statsList.map((s) => [s.uid, s]));
  const mois = moisDeSaison(saison, now);
  return compos
    .map((eq) => {
      const parMois = Object.fromEntries(mois.map((m) => [m, scoreMois(eq, stats, m, bonus, now)]));
      return { ...eq, parMois, saison: mois.reduce((a, m) => a + parMois[m].total, 0) };
    })
    .sort((a, b) => b.saison - a.saison);
}

// ---------------------------------------------------- défi de la semaine

const PLAN_DEFI = { balisage: 2, ripam: 2, feux: 2, signaux: 1, securite: 1, vhf: 1, meteo: 1 };

export function questionsDuDefi(QUESTIONS, semaine = semaineDe()) {
  const r = rng('defi-' + semaine);
  const out = [];
  for (const [t, n] of Object.entries(PLAN_DEFI)) {
    const pool = QUESTIONS.filter((q) => q.t === t);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    out.push(...pool.slice(0, n));
  }
  return out;
}

export { saisonDe, semaineDe, moisDe };
