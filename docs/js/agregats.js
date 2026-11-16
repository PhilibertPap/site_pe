// Classement publié : agrégats par équipage (classement/{saison}_{eqId}), recalculés à partir des
// statistiques individuelles et publiés par les chefs seulement (règles Firestore). Un chef les
// republie en ouvrant les pages Équipages ou l'espace chefs, et en arrière-plan quand il consulte
// n'importe quelle page du site, au plus une fois toutes les 30 minutes (voir auth.js).
// Les autres inscrits ne lisent que ces agrégats : les notes individuelles ne leur sont pas exposées.
// La page Équipages garde en localStorage le dernier classement lu (compositions, bonus et agrégats,
// tous visibles par tous les inscrits) pour l'afficher sans attendre, puis le rafraîchit.
import * as fb from './fb.js';
import { classement } from './classement.js';
import { saisonDe, semaineDe } from './saison.js';

const r2 = (x) => Math.round(x * 100) / 100;
export const finDeSaison = (saison) => (saison === saisonDe() ? new Date() : new Date(saison + 1, 7, 31));

// Statistiques des membres d'un équipage, lues document par document
export async function statsEquipage(saison, eq) {
  const l = await Promise.all((eq.membres || []).map((m) => fb.getStats(saison, m.uid).catch(() => null)));
  return l.filter(Boolean);
}

// Date de la dernière publication faite depuis cet appareil (localStorage, peut manquer)
const CLE = 'pe-classement-pub';
export const INTERVALLE = 30 * 60 * 1000;
function marquer(t) {
  try {
    if (t) localStorage.setItem(CLE, String(t));
    else localStorage.removeItem(CLE);
  } catch (e) {}
}
function derniere() {
  try {
    return +localStorage.getItem(CLE) || 0;
  } catch (e) {
    return 0;
  }
}

// Recalcule et publie tous les équipages de la saison (chefs seulement).
// Renvoie { stats, compos, bonus } pour éviter de relire. Si une publication de la même saison est
// déjà en cours (page Équipages et tâche d'arrière-plan d'auth.js, par exemple), on s'y joint.
const enCours = {};
export function publier(me, saison = saisonDe(), pre = {}) {
  if (enCours[saison]) return enCours[saison];
  const p = publierVraiment(me, saison, pre).finally(() => delete enCours[saison]);
  enCours[saison] = p;
  return p;
}
async function publierVraiment(me, saison, pre) {
  const compos = pre.compos || (await fb.compositions(saison));
  const bonus = pre.bonus || (await fb.listBonus(saison));
  if (!me || me.role !== 'chef') return { compos, bonus, stats: pre.stats || [] };
  const courante = saison === saisonDe();
  if (courante) marquer(Date.now());
  try {
    const stats = pre.stats || (await fb.statsSaison(saison));
    const now = finDeSaison(saison);
    const sem = semaineDe(now);
    const st = Object.fromEntries(stats.map((s) => [s.uid, s]));
    const tab = classement(compos, stats, bonus, saison, now);
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
    // retirer les agrégats des équipages qui n'existent plus cette saison
    const pub = await fb.listClassement(saison).catch(() => []);
    await Promise.all(pub.filter((p) => !compos.some((c) => c.id === p.eq)).map((p) => fb.deleteClassement(saison, p.eq).catch(() => {})));
    return { compos, bonus, stats };
  } catch (e) {
    if (courante) marquer(0);
    throw e;
  }
}

// Publication en arrière-plan : seulement si la dernière date de plus de 30 minutes
export async function publierSiBesoin(me) {
  if (!me || me.role !== 'chef') return false;
  if (Date.now() - derniere() < INTERVALLE) return false;
  await publier(me, saisonDe());
  return true;
}

// Classement lu depuis les agrégats publiés : [{ ...composition, pub, mois, saison, sem, at }],
// trié par total de la saison. Un équipage sans agrégat a des points nuls.
export async function lire(saison, compos) {
  return assembler(compos, await fb.listClassement(saison));
}
// Même chose à partir d'agrégats déjà lus (fb.listClassement)
export function assembler(compos, pub) {
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
// Le classement mérite-t-il d'être recalculé ? (jamais publié, ou plus vieux que l'intervalle)
export const aRepublier = (tab) => tab.length > 0 && Date.now() - (majLe(tab) || 0) > INTERVALLE;

// ------------------------------------------------- dernier classement lu, par saison (localStorage)
// { compos, bonus, pub, t } : ce que la page Équipages affiche, tel que tous les inscrits le voient.
const cleCache = (saison) => 'pe-classement-' + saison;
export function cacheLire(saison) {
  try {
    const c = JSON.parse(localStorage.getItem(cleCache(saison)) || 'null');
    if (!c || !Array.isArray(c.compos) || !Array.isArray(c.bonus) || !Array.isArray(c.pub)) return null;
    const date = (x) => (x ? new Date(x) : null);
    return { ...c, bonus: c.bonus.map((b) => ({ ...b, at: date(b.at) })), pub: c.pub.map((p) => ({ ...p, at: date(p.at) })) };
  } catch (e) {
    return null;
  }
}
export function cacheEcrire(saison, d) {
  try {
    const ms = (x) => (x instanceof Date ? x.getTime() : x || null);
    localStorage.setItem(
      cleCache(saison),
      JSON.stringify({ compos: d.compos, bonus: d.bonus.map((b) => ({ ...b, at: ms(b.at) })), pub: d.pub.map((p) => ({ ...p, at: ms(p.at) })), t: Date.now() })
    );
  } catch (e) {}
}
