// Ce qui attend un chef : comptes à valider, diplômes à confirmer, demandes de validation de carnet,
// questions sans réponse d'un formateur, équipages de la saison à composer.
// Sert à l'accueil de l'espace chefs et au compteur de la barre du haut (auth.js), mis en cache
// en sessionStorage pour ne pas relire Firestore à chaque page (10 minutes au plus).
import * as fb from './fb.js';
import { DIPLOMES } from './diplomes.js';
import { saisonDe, saisonLabel } from './saison.js';

const CLE = 'pe-afaire';
export const DUREE_CACHE = 10 * 60 * 1000;

export function lireCache(uid) {
  try {
    const c = JSON.parse(sessionStorage.getItem(CLE) || 'null');
    return c && c.uid === uid ? c : null;
  } catch (e) {
    return null;
  }
}
export function ecrireCache(uid, n) {
  try {
    sessionStorage.setItem(CLE, JSON.stringify({ uid, n, t: Date.now() }));
  } catch (e) {}
}
export function viderCache() {
  try {
    sessionStorage.removeItem(CLE);
  } catch (e) {}
}

// Compteur de la barre du haut (lien « Espace chefs »)
export function majBadge(n) {
  document.querySelectorAll('.acct-chefs').forEach((a) => {
    let b = a.querySelector('.acct-n');
    if (!n) {
      if (b) b.remove();
      return;
    }
    if (!b) {
      b = document.createElement('span');
      b.className = 'acct-n';
      a.appendChild(b);
    }
    b.textContent = n > 99 ? '99+' : String(n);
    b.title = `${n} chose${n > 1 ? 's' : ''} à faire`;
  });
}

// Liste des choses à faire. Liens relatifs à la racine du site.
// compte : true si l'élément entre dans le compteur ; sinon c'est un simple rappel.
// pre : données déjà lues par la page (users, qs, decls, demandes, compos), pour éviter de relire.
export async function aFaire(me, pre = {}, now = new Date()) {
  const saison = saisonDe(now);
  const [users, decls, demandes, qs, compos, suivante] = await Promise.all([
    pre.users || fb.listUsers(),
    pre.decls || fb.toutesDeclarations(),
    pre.demandes || fb.toutesDemandes(),
    pre.qs || fb.listQuestions(),
    pre.compos || fb.compositions(saison),
    // en août, on prépare la saison qui commence en septembre
    now.getMonth() === 7 ? fb.compositions(saison + 1).catch(() => []) : Promise.resolve(null),
  ]);
  const byUid = Object.fromEntries(users.map((u) => [u.uid, u]));
  const actifs = users.filter((u) => u.approved);
  const scouts = actifs.filter((u) => u.role !== 'chef');
  const enEquipage = new Set(compos.flatMap((c) => (c.membres || []).map((m) => m.uid)));

  const comptes = users.filter((u) => !u.approved);
  const dips = decls.flatMap((x) => Object.keys(x.d).filter((c) => DIPLOMES[c] && byUid[x.uid]));
  const dem = demandes.filter((d) => d.uid !== me.uid && byUid[d.uid]);
  const ouvertes = qs.filter((q) => !q.chefAnswered && !q.resolved);
  const sansCE = compos.filter((c) => !c.chefEq && (c.membres || []).length);
  const sansEq = compos.length ? scouts.filter((u) => !enEquipage.has(u.uid)) : [];
  const sansObjectif = scouts.filter((u) => !u.objectif);
  const pl = (n, s, p) => (n > 1 ? p : s);

  const items = [
    comptes.length && {
      cle: 'comptes',
      n: comptes.length,
      compte: true,
      texte: `${pl(comptes.length, 'compte', 'comptes')} à valider`,
      action: 'Valider ou refuser',
      href: 'chefs/inscrits.html#attente',
    },
    dips.length && {
      cle: 'diplomes',
      n: dips.length,
      compte: true,
      texte: `${pl(dips.length, 'diplôme déclaré', 'diplômes déclarés')} à confirmer`,
      action: 'Confirmer',
      href: 'chefs/inscrits.html#diplomes',
    },
    dem.length && {
      cle: 'demandes',
      n: dem.length,
      compte: true,
      texte: `${pl(dem.length, 'demande', 'demandes')} de validation de carnet en attente`,
      action: 'Traiter',
      href: 'equipage/index.html#demandes',
      note: 'Normalement traitées par le chef d’équipage du scout.',
    },
    ouvertes.length && {
      cle: 'questions',
      n: ouvertes.length,
      compte: true,
      texte: `${pl(ouvertes.length, 'question', 'questions')} sans réponse d’un formateur`,
      action: 'Répondre',
      href: 'questions/index.html?ouvertes=1',
    },
    !compos.length && {
      cle: 'saison',
      n: 1,
      compte: true,
      texte: `Équipages de la saison ${saisonLabel(saison)} pas encore composés`,
      action: 'Composer les équipages',
      href: 'chefs/equipages.html#composition',
    },
    sansCE.length && {
      cle: 'sansce',
      n: sansCE.length,
      compte: true,
      texte: `${pl(sansCE.length, 'équipage', 'équipages')} sans chef d’équipage (${sansCE.map((c) => c.nom).join(', ')})`,
      action: 'Nommer',
      href: 'chefs/equipages.html#composition',
    },
    suivante && !suivante.length && {
      cle: 'suivante',
      n: 1,
      compte: true,
      texte: `Saison ${saisonLabel(saison + 1)} à préparer : elle commence en septembre`,
      action: 'Préparer',
      href: `chefs/equipages.html?saison=${saison + 1}#composition`,
    },
    sansEq.length && {
      cle: 'sanseq',
      n: sansEq.length,
      compte: false,
      texte: `${pl(sansEq.length, 'scout', 'scouts')} dans aucun équipage cette saison`,
      action: 'Placer',
      href: 'chefs/equipages.html#composition',
    },
    sansObjectif.length && {
      cle: 'objectif',
      n: sansObjectif.length,
      compte: false,
      texte: `${pl(sansObjectif.length, 'scout n’a', 'scouts n’ont')} pas encore choisi d’objectif (PE, CQ ou CF)`,
      action: 'Voir qui',
      href: 'chefs/inscrits.html#inscrits',
      note: 'À leur rappeler : Mon espace, « Je prépare ».',
    },
  ].filter(Boolean);
  const total = items.filter((x) => x.compte).reduce((a, x) => a + x.n, 0);
  ecrireCache(me.uid, total);
  majBadge(total);
  return { items, total, users, decls, demandes, qs, compos, saison };
}

// Compteur seul, avec le cache (barre du haut)
export async function compteur(me) {
  const c = lireCache(me.uid);
  if (c && Date.now() - c.t < DUREE_CACHE) {
    majBadge(c.n);
    return c.n;
  }
  const r = await aFaire(me);
  return r.total;
}
