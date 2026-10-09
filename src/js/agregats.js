// Classement publié : agrégats par équipage (classement/{saison}_{eqId}), recalculés à partir des
// statistiques individuelles par un chef (tous les équipages) ou par un chef d'équipage (le sien).
// Les autres inscrits ne lisent que ces agrégats : les notes individuelles ne leur sont pas exposées.
import * as fb from './fb.js';
import { classement } from './classement.js';
import { saisonDe, semaineDe } from './saison.js';
import { ceDe } from './diplomes.js';

const r2 = (x) => Math.round(x * 100) / 100;
export const finDeSaison = (saison) => (saison === saisonDe() ? new Date() : new Date(saison + 1, 7, 31));

// Statistiques des membres d'un équipage, lues document par document
export async function statsEquipage(saison, eq) {
  const l = await Promise.all((eq.membres || []).map((m) => fb.getStats(saison, m.uid).catch(() => null)));
  return l.filter(Boolean);
}

// Recalcule et publie. Renvoie { stats, compos, bonus } pour éviter de relire.
export async function publier(me, saison = saisonDe(), pre = {}) {
  const compos = pre.compos || (await fb.compositions(saison));
  const bonus = pre.bonus || (await fb.listBonus(saison));
  let cibles;
  let stats = pre.stats;
  if (me.role === 'chef') {
    cibles = compos;
    stats = stats || (await fb.statsSaison(saison));
  } else {
    const id = ceDe(me, saison);
    cibles = compos.filter((c) => c.id === id);
    if (!cibles.length) return { compos, bonus, stats: stats || [] };
    stats = stats || (await statsEquipage(saison, cibles[0]));
  }
  const now = finDeSaison(saison);
  const sem = semaineDe(now);
  const st = Object.fromEntries(stats.map((s) => [s.uid, s]));
  const tab = classement(cibles, stats, bonus, saison, now);
  await Promise.all(
    tab.map((e) => {
      const u = (e.membres || []).map((x) => x.uid);
      const ep = u.filter((x) => st[x] && Object.values(st[x].mois || {}).some((mo) => mo.sem && mo.sem[sem])).length;
      const df = u.filter((x) => st[x] && st[x].defis && st[x].defis[sem] != null).length;
      const mois = Object.fromEntries(
        Object.entries(e.parMois).map(([m, s]) => [m, { niveau: r2(s.niveau), regularite: r2(s.regularite), defi: r2(s.defi), bonus: s.bonus, total: r2(s.total) }])
      );
      return fb.saveClassement(saison, e.id, { nom: e.nom, membres: u.length, mois, total: r2(e.saison), sem: { w: sem, ep, df } });
    })
  );
  // un chef retire les agrégats des équipages qui n'existent plus cette saison
  if (me.role === 'chef') {
    const pub = await fb.listClassement(saison).catch(() => []);
    await Promise.all(pub.filter((p) => !compos.some((c) => c.id === p.eq)).map((p) => fb.deleteClassement(saison, p.eq).catch(() => {})));
  }
  return { compos, bonus, stats };
}

// Classement lu depuis les agrégats publiés : [{ ...composition, pub, mois, saison, sem, at }],
// trié par total de la saison. Un équipage sans agrégat a des points nuls.
export async function lire(saison, compos) {
  const pub = await fb.listClassement(saison);
  const par = Object.fromEntries(pub.map((p) => [p.eq, p]));
  return compos
    .map((c) => {
      const p = par[c.id];
      return { ...c, pub: !!p, mois: (p && p.mois) || {}, saison: (p && p.total) || 0, sem: (p && p.sem) || null, at: p ? p.at : null };
    })
    .sort((a, b) => b.saison - a.saison);
}
const VIDE = { niveau: 0, regularite: 0, defi: 0, bonus: 0, total: 0 };
// Points d'un équipage pour un mois (nuls si le mois n'a pas encore été publié)
export const pts = (e, m) => e.mois[m] || VIDE;
// Date de la plus ancienne publication (le classement est au moins à jour à cette date)
export const majLe = (tab) => tab.filter((e) => e.at).reduce((d, e) => (!d || e.at < d ? e.at : d), null);
