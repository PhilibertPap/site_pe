// Saisons scoutes (septembre à août), semaines ISO et mois : outils communs.

// Saison d'une date : année de septembre (2026 pour 2026-2027).
export function saisonDe(d = new Date()) {
  return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
}
export const saisonLabel = (s) => `${s}-${s + 1}`;

// Semaine ISO : '2026-W41'
export function semaineDe(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day); // jeudi de la semaine
  const y = t.getUTCFullYear();
  const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${String(w).padStart(2, '0')}`;
}
// Jeudi d'une semaine ISO (sert à ranger la semaine dans un mois)
export function jeudiDe(sem) {
  const [y, w] = sem.split('-W').map(Number);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const mon = new Date(jan4);
  mon.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() || 7) - 1) + (w - 1) * 7);
  const thu = new Date(mon);
  thu.setUTCDate(mon.getUTCDate() + 3);
  return thu;
}
export const moisDe = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const moisDeSemaine = (sem) => {
  const t = jeudiDe(sem);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}`;
};
const NOMS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const moisLabel = (m) => NOMS[+m.slice(5) - 1] + ' ' + m.slice(0, 4);
export const moisCourt = (m) => NOMS[+m.slice(5) - 1].slice(0, 4).replace(/\.$/, '') + '.';

// Mois de la saison écoulés jusqu'à aujourd'hui (ou toute la saison si elle est finie)
export function moisDeSaison(s, now = new Date()) {
  const out = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(s, 8 + i, 1);
    if (d > now) break;
    out.push(moisDe(d));
  }
  return out;
}
// Semaines d'un mois (une semaine appartient au mois de son jeudi), jusqu'à la semaine en cours
export function semainesDuMois(m, now = new Date()) {
  const [y, mo] = m.split('-').map(Number);
  const cur = semaineDe(now);
  const out = [];
  for (let d = new Date(y, mo - 1, 1); d.getMonth() === mo - 1; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 4) {
      const s = semaineDe(d);
      if (s <= cur) out.push(s);
    }
  }
  return out;
}

// Générateur pseudo-aléatoire reproductible (défi de la semaine)
export function rng(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
