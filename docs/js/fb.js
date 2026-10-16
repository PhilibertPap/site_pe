// Accès à Firebase (authentification et base Firestore), plan gratuit Spark.
// Toutes les pages passent par ces fonctions : rien d'autre ne parle directement à Firebase.
import { firebaseConfig } from './firebase-config.js';
import { estFormateur, titre } from './diplomes.js';

const V = '10.12.2';
const CDN = `https://www.gstatic.com/firebasejs/${V}`;

export const enabled = !!firebaseConfig.apiKey;

let ready = null;
function sdk() {
  if (!ready) {
    ready = Promise.all([
      import(`${CDN}/firebase-app.js`),
      import(`${CDN}/firebase-auth.js`),
      import(`${CDN}/firebase-firestore.js`),
    ]).then(([App, A, F]) => {
      const app = App.initializeApp(firebaseConfig);
      const auth = A.getAuth(app);
      const db = F.getFirestore(app);
      return { A, F, auth, db };
    });
  }
  return ready;
}

const MSG = {
  'auth/invalid-email': 'Adresse e-mail invalide.',
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
  'auth/user-not-found': 'E-mail ou mot de passe incorrect.',
  'auth/email-already-in-use': 'Un compte existe déjà avec cette adresse.',
  'auth/weak-password': 'Mot de passe trop court (6 caractères au moins).',
  'auth/too-many-requests': 'Trop de tentatives : réessayez dans quelques minutes.',
  'auth/network-request-failed': 'Pas de connexion réseau.',
  'permission-denied': 'Action non autorisée.',
};
export function message(e) {
  return MSG[e && e.code] || (e && e.message) || 'Erreur inconnue.';
}

// ------------------------------------------------------------- comptes

export async function onUser(cb) {
  const { A, auth } = await sdk();
  A.onAuthStateChanged(auth, (u) => cb(u ? { uid: u.uid, email: u.email } : null));
}

export async function login(email, password) {
  const { A, auth } = await sdk();
  await A.signInWithEmailAndPassword(auth, email, password);
}

export async function register({ name, unite, email, password }) {
  const { A, F, auth, db } = await sdk();
  const cred = await A.createUserWithEmailAndPassword(auth, email, password);
  await F.setDoc(F.doc(db, 'users', cred.user.uid), {
    name,
    unite,
    email,
    role: 'eleve',
    approved: false,
    createdAt: F.serverTimestamp(),
  });
}

export async function logout() {
  const { A, auth } = await sdk();
  await A.signOut(auth);
}

export async function resetPassword(email) {
  const { A, auth } = await sdk();
  await A.sendPasswordResetEmail(auth, email);
}

export async function getProfile(uid) {
  const { F, db } = await sdk();
  const s = await F.getDoc(F.doc(db, 'users', uid));
  return s.exists() ? { uid, ...s.data() } : null;
}

// Les comptes fusionnés dans un autre (mergedInto) n'apparaissent plus nulle part
export async function listUsers() {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'users'), F.orderBy('createdAt', 'desc')));
  return s.docs.map((d) => ({ uid: d.id, ...d.data() })).filter((u) => !u.mergedInto);
}

export async function updateUser(uid, data) {
  const { F, db } = await sdk();
  await F.updateDoc(F.doc(db, 'users', uid), data);
}

export async function deleteUserDoc(uid) {
  const { F, db } = await sdk();
  await F.deleteDoc(F.doc(db, 'users', uid));
}

// ---------------------------------------------------------- questions

const toDate = (t) => (t && t.toDate ? t.toDate() : t instanceof Date ? t : null);

export async function listQuestions() {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'questions'), F.orderBy('lastAt', 'desc'), F.limit(300)));
  return s.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt), lastAt: toDate(d.data().lastAt) }));
}

export async function getQuestion(id) {
  const { F, db } = await sdk();
  const s = await F.getDoc(F.doc(db, 'questions', id));
  return s.exists() ? { id, ...s.data(), createdAt: toDate(s.data().createdAt), lastAt: toDate(s.data().lastAt) } : null;
}

export async function listAnswers(qid) {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'questions', qid, 'answers'), F.orderBy('createdAt', 'asc')));
  return s.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) }));
}

export async function askQuestion({ title, body, theme }, me) {
  const { F, db } = await sdk();
  const ref = await F.addDoc(F.collection(db, 'questions'), {
    title,
    body,
    theme,
    authorId: me.uid,
    authorName: me.name,
    createdAt: F.serverTimestamp(),
    lastAt: F.serverTimestamp(),
    answers: 0,
    chefAnswered: false,
    resolved: false,
  });
  return ref.id;
}

export async function answer(q, body, me) {
  const { F, db } = await sdk();
  const p = me._vrai || me; // vrai profil, même quand un chef regarde le site « comme » un scout
  const byChef = estFormateur(p); // réponse de formateur : chef, ou titulaire du PE, du CQ ou du CF
  const t = titre(p); // plus haut diplôme confirmé, affiché à côté du nom
  const batch = F.writeBatch(db);
  batch.set(F.doc(F.collection(db, 'questions', q.id, 'answers')), {
    body,
    authorId: me.uid,
    authorName: me.name,
    byChef,
    ...(t ? { titre: t } : {}),
    createdAt: F.serverTimestamp(),
  });
  batch.update(F.doc(db, 'questions', q.id), {
    answers: (q.answers || 0) + 1,
    lastAt: F.serverTimestamp(),
    chefAnswered: !!(q.chefAnswered || byChef),
  });
  await batch.commit();
}

export async function setResolved(qid, resolved) {
  const { F, db } = await sdk();
  await F.updateDoc(F.doc(db, 'questions', qid), { resolved });
}

export async function deleteQuestion(qid) {
  const { F, db } = await sdk();
  const answers = await F.getDocs(F.collection(db, 'questions', qid, 'answers'));
  const batch = F.writeBatch(db);
  answers.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(F.doc(db, 'questions', qid));
  await batch.commit();
}

// Réservé aux chefs (modération)
export async function deleteAnswer(q, aid) {
  const { F, db } = await sdk();
  const batch = F.writeBatch(db);
  batch.delete(F.doc(db, 'questions', q.id, 'answers', aid));
  batch.update(F.doc(db, 'questions', q.id), { answers: Math.max(0, (q.answers || 1) - 1) });
  await batch.commit();
}

// ---------------------------------------------------------- résultats QCM

// Un document par QCM terminé : score, détail par thème, questions réussies et ratées.
export async function saveResult(r, me) {
  const { F, db } = await sdk();
  await F.addDoc(F.collection(db, 'results'), {
    uid: me.uid,
    name: me.name,
    unite: me.unite || '',
    mode: r.mode,
    score: r.score,
    total: r.total,
    dur: r.dur || 0,
    themes: r.themes,
    ok: r.ok,
    ko: r.ko,
    at: F.serverTimestamp(),
  });
}

export async function myResults(uid) {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'results'), F.where('uid', '==', uid)));
  return s.docs.map((d) => ({ id: d.id, ...d.data(), at: toDate(d.data().at) })).sort((a, b) => b.at - a.at);
}

// Réservé aux chefs : tous les résultats depuis une date (ou tous si since est nul)
export async function listResults(since) {
  const { F, db } = await sdk();
  const c = F.collection(db, 'results');
  const q = since ? F.query(c, F.where('at', '>=', since), F.orderBy('at', 'desc')) : F.query(c, F.orderBy('at', 'desc'), F.limit(5000));
  const s = await F.getDocs(q);
  return s.docs.map((d) => ({ id: d.id, ...d.data(), at: toDate(d.data().at) }));
}

export async function deleteResults(ids) {
  const { F, db } = await sdk();
  for (let i = 0; i < ids.length; i += 400) {
    const batch = F.writeBatch(db);
    ids.slice(i, i + 400).forEach((id) => batch.delete(F.doc(db, 'results', id)));
    await batch.commit();
  }
}

// ------------------------------------------------- équipages et saisons

// Registre des équipages (les noms durent d'une année à l'autre)
export async function listEquipages() {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.collection(db, 'equipages'));
  return s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}
export async function saveEquipage(id, data) {
  const { F, db } = await sdk();
  if (id) await F.setDoc(F.doc(db, 'equipages', id), data, { merge: true });
  else await F.addDoc(F.collection(db, 'equipages'), data);
}

// Composition d'une saison : saisons/{s}/equipages/{id} = { nom, membres: [{uid, name}], chefEq, chefEqName }
export async function compositions(saison) {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.collection(db, 'saisons', String(saison), 'equipages'));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function saveComposition(saison, id, data) {
  const { F, db } = await sdk();
  await F.setDoc(F.doc(db, 'saisons', String(saison), 'equipages', id), data);
}
export async function deleteComposition(saison, id) {
  const { F, db } = await sdk();
  await F.deleteDoc(F.doc(db, 'saisons', String(saison), 'equipages', id));
}

// Points bonus donnés par les chefs
export async function listBonus(saison) {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'bonus'), F.where('saison', '==', saison)));
  return s.docs.map((d) => ({ id: d.id, ...d.data(), at: toDate(d.data().at) }));
}
export async function addBonus(b, me) {
  const { F, db } = await sdk();
  await F.addDoc(F.collection(db, 'bonus'), { ...b, by: me.uid, byName: me.name, at: F.serverTimestamp() });
}
export async function deleteBonus(id) {
  const { F, db } = await sdk();
  await F.deleteDoc(F.doc(db, 'bonus', id));
}

// --------------------------------------------- statistiques par saison
// stats/{saison}_{uid} : résumé de saison d'un scout, lisible par lui, les chefs et son chef d'équipage
// { uid, saison, mois: { '2026-10': { best, n, sem: { '2026-W41': 1 }, th: { theme: [ok, n] } } },
//   defis: { '2026-W41': 8 }, epreuves: [{ t: millis, s: score }] }

// Réservé aux chefs : toutes les statistiques d'une saison
export async function statsSaison(saison) {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'stats'), F.where('saison', '==', saison)));
  return s.docs.map((d) => d.data());
}

// Statistiques d'un scout (lui-même, un chef, ou son chef d'équipage : document par document)
export async function getStats(saison, uid) {
  const { F, db } = await sdk();
  const s = await F.getDoc(F.doc(db, 'stats', `${saison}_${uid}`));
  return s.exists() ? s.data() : null;
}

export async function updateStats(saison, uid, fn) {
  const { F, db } = await sdk();
  const ref = F.doc(db, 'stats', `${saison}_${uid}`);
  await F.runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const cur = snap.exists() ? snap.data() : { uid, saison, mois: {}, defis: {}, epreuves: [] };
    const next = fn(structuredClone(cur));
    next.uid = uid;
    next.saison = saison;
    tx.set(ref, next);
  });
}

// ------------------------------------------------- défi de la semaine

export async function getDefi(semaine, uid) {
  const { F, db } = await sdk();
  const s = await F.getDoc(F.doc(db, 'results', `defi_${semaine}_${uid}`));
  return s.exists() ? s.data() : null;
}
export async function saveDefi(r, semaine, me) {
  const { F, db } = await sdk();
  await F.setDoc(F.doc(db, 'results', `defi_${semaine}_${me.uid}`), {
    uid: me.uid,
    name: me.name,
    unite: me.unite || '',
    mode: 'defi',
    semaine,
    score: r.score,
    total: r.total,
    dur: 0,
    themes: r.themes,
    ok: r.ok,
    ko: r.ko,
    at: F.serverTimestamp(),
  });
}

// ------------------------------------------- carnet de progression
// carnets/{uid} = { v: { itemId: { by, byName, at } } }  (PE, CQ et CF ; écrit par les chefs
//   et par le chef d'équipage du scout)
// demandes/{uid}_{itemId} = { uid, name, eq, item, saison, at }  (créée par le scout ; eq = son équipage de la saison)

export async function getCarnet(uid) {
  const { F, db } = await sdk();
  const s = await F.getDoc(F.doc(db, 'carnets', uid));
  return s.exists() ? s.data().v || {} : {};
}
// Réservé aux chefs : tous les carnets, { uid: v }
export async function tousCarnets() {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.collection(db, 'carnets'));
  return Object.fromEntries(s.docs.map((d) => [d.id, d.data().v || {}]));
}
export async function valider(uid, item, me, ok = true) {
  const { F, db } = await sdk();
  const batch = F.writeBatch(db);
  const ref = F.doc(db, 'carnets', uid);
  if (ok) batch.set(ref, { v: { [item]: { by: me.uid, byName: me.name, at: F.serverTimestamp() } } }, { merge: true });
  else batch.set(ref, { v: { [item]: F.deleteField() } }, { merge: true });
  batch.delete(F.doc(db, 'demandes', `${uid}_${item}`));
  await batch.commit();
}
export async function demander(me, item, saison) {
  const { F, db } = await sdk();
  const eq = (me.eq && me.eq[String(saison)]) || '';
  await F.setDoc(F.doc(db, 'demandes', `${me.uid}_${item}`), { uid: me.uid, name: me.name, eq, item, saison, at: F.serverTimestamp() });
}
export async function annulerDemande(uid, item) {
  const { F, db } = await sdk();
  await F.deleteDoc(F.doc(db, 'demandes', `${uid}_${item}`));
}
// Demandes d'un scout (lui-même, un chef, ou son chef d'équipage)
export async function mesDemandes(uid) {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'demandes'), F.where('uid', '==', uid)));
  return s.docs.map((d) => ({ id: d.id, ...d.data(), at: toDate(d.data().at) }));
}
// Chef d'équipage : les demandes de son équipage (requête sur eq, que les règles savent vérifier)
export async function demandesEquipage(eq) {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'demandes'), F.where('eq', '==', eq)));
  return s.docs.map((d) => ({ id: d.id, ...d.data(), at: toDate(d.data().at) }));
}
// Réservé aux chefs
export async function toutesDemandes() {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.collection(db, 'demandes'));
  return s.docs.map((d) => ({ id: d.id, ...d.data(), at: toDate(d.data().at) }));
}

// Affectation d'un inscrit pour une saison, écrite par les chefs avec la composition :
// users/{uid}.eq = { '2026': '<id équipage>' } et, pour le chef d'équipage, users/{uid}.ce = { '2026': '<id>' }
export async function setAffectations(saison, list) {
  const { F, db } = await sdk();
  for (let i = 0; i < list.length; i += 400) {
    const batch = F.writeBatch(db);
    list.slice(i, i + 400).forEach(({ uid, eq, ce }) =>
      batch.update(F.doc(db, 'users', uid), {
        [`eq.${saison}`]: eq || F.deleteField(),
        [`ce.${saison}`]: ce || F.deleteField(),
      })
    );
    await batch.commit();
  }
}

// Chef d'équipage : ajoute un scout sans équipage au sien, ou en retire un, un à la fois.
// La composition et le profil du scout changent dans le même lot : les règles vérifient l'un par l'autre.
// Un chef peut aussi s'en servir (page du tableau de bord, en vue chef d'équipage).
export async function modifierEquipage(saison, eq, m, op) {
  const { F, db } = await sdk();
  const S = String(saison);
  const av = eq.membres || [];
  const ap = op === 'ajout' ? [...av, { uid: m.uid, name: m.name }] : av.filter((x) => x.uid !== m.uid);
  const batch = F.writeBatch(db);
  batch.update(F.doc(db, 'saisons', S, 'equipages', eq.id), { membres: ap, modif: { uid: m.uid, name: m.name, op } });
  batch.update(F.doc(db, 'users', m.uid), { [`eq.${S}`]: op === 'ajout' ? eq.id : F.deleteField() });
  await batch.commit();
  return ap;
}
// Scouts validés qui ne sont dans aucun équipage cette saison (chefs et chefs d'équipage)
export async function scoutsLibres(saison) {
  const { F, db } = await sdk();
  const S = String(saison);
  const s = await F.getDocs(F.query(F.collection(db, 'users'), F.where('role', '==', 'eleve'), F.where('approved', '==', true)));
  return s.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .filter((u) => !u.mergedInto && !(u.eq && u.eq[S]))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

// ---------------------------------------------- classement publié
// classement/{saison}_{eqId} = { saison, eq, nom, membres, mois: { '2026-10': { niveau, regularite, defi,
//   bonus, total } }, total, sem: { w, ep, df }, at }  (agrégats d'équipage, lisibles par tous les inscrits)

export async function listClassement(saison) {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'classement'), F.where('saison', '==', saison)));
  return s.docs.map((d) => ({ ...d.data(), at: toDate(d.data().at) }));
}
export async function saveClassement(saison, eq, data) {
  const { F, db } = await sdk();
  await F.setDoc(F.doc(db, 'classement', `${saison}_${eq}`), { ...data, saison, eq, at: F.serverTimestamp() });
}
export async function deleteClassement(saison, eq) {
  const { F, db } = await sdk();
  await F.deleteDoc(F.doc(db, 'classement', `${saison}_${eq}`));
}

// ---------------------------------------------------------- diplômes
// users/{uid}.dip = { pe: '2025-07', psc1: '2024-03', ... }  (diplômes confirmés, écrits par les chefs)
// diplomes/{uid} = { d: { cq: '2026-04' }, at }  (déclarations en attente, écrites par le scout)

export async function mesDeclarations(uid) {
  const { F, db } = await sdk();
  const s = await F.getDoc(F.doc(db, 'diplomes', uid));
  return s.exists() ? s.data().d || {} : {};
}
export async function declarer(uid, code, mois) {
  const { F, db } = await sdk();
  await F.setDoc(F.doc(db, 'diplomes', uid), { d: { [code]: mois }, at: F.serverTimestamp() }, { merge: true });
}
export async function annulerDeclaration(uid, code) {
  const { F, db } = await sdk();
  await F.setDoc(F.doc(db, 'diplomes', uid), { d: { [code]: F.deleteField() }, at: F.serverTimestamp() }, { merge: true });
}
// Réservé aux chefs : [{ uid, d, at }]
export async function toutesDeclarations() {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.collection(db, 'diplomes'));
  return s.docs.map((d) => ({ uid: d.id, d: d.data().d || {}, at: toDate(d.data().at) })).filter((x) => Object.keys(x.d).length);
}
// Réservé aux chefs : confirmer (inscrit dans le profil) ou refuser une déclaration
export async function confirmerDiplome(uid, code, mois, ok = true) {
  const { F, db } = await sdk();
  const batch = F.writeBatch(db);
  if (ok) batch.update(F.doc(db, 'users', uid), { [`dip.${code}`]: mois });
  batch.set(F.doc(db, 'diplomes', uid), { d: { [code]: F.deleteField() } }, { merge: true });
  await batch.commit();
}
// Réservé aux chefs : inscrire ou retirer directement un diplôme
export async function setDiplome(uid, code, mois) {
  const { F, db } = await sdk();
  await F.updateDoc(F.doc(db, 'users', uid), { [`dip.${code}`]: mois || F.deleteField() });
}

// ---------------------------------------------------------- fusion de comptes
// Une même personne a deux comptes (deux adresses e-mail). Tout ce qui appartient au doublon passe au
// compte gardé : résultats et défis, statistiques, carnet, demandes, déclarations de diplômes, questions
// et réponses, places dans les équipages, diplômes confirmés. Le doublon est ensuite désactivé
// (mergedInto) : s'il se reconnecte, on lui indique l'adresse à utiliser. Son identifiant reste dans
// Firebase Authentication (à supprimer depuis la console si on veut).
// Réservé aux chefs. Chaque étape se refait sans dommage si la fusion est interrompue.

// Écritures par lots de 400 au plus ; ops : fonctions (batch) => nombre d'écritures ajoutées
async function lots(F, db, ops) {
  let batch = F.writeBatch(db);
  let n = 0;
  for (const op of ops) {
    n += op(batch);
    if (n >= 400) {
      await batch.commit();
      batch = F.writeBatch(db);
      n = 0;
    }
  }
  if (n) await batch.commit();
}

// Résumés de saison : meilleure note et défis au plus haut, nombres et thèmes additionnés
function fusionStats(a, b) {
  const out = structuredClone(a);
  Object.entries(b.mois || {}).forEach(([m, x]) => {
    const y = (out.mois[m] = out.mois[m] || {});
    y.best = Math.max(y.best || 0, x.best || 0);
    y.n = (y.n || 0) + (x.n || 0);
    y.sem = { ...(y.sem || {}) };
    Object.entries(x.sem || {}).forEach(([w, k]) => (y.sem[w] = (y.sem[w] || 0) + k));
    y.th = { ...(y.th || {}) };
    Object.entries(x.th || {}).forEach(([t, [ok, n]]) => {
      const z = y.th[t] || [0, 0];
      y.th[t] = [z[0] + ok, z[1] + n];
    });
  });
  Object.entries(b.defis || {}).forEach(([w, k]) => (out.defis[w] = Math.max(out.defis[w] ?? 0, k)));
  out.epreuves = [...(out.epreuves || []), ...(b.epreuves || [])].sort((p, q) => p.t - q.t).slice(-200);
  return out;
}

// Diplômes confirmés : le plus ancien mois quand les deux comptes ont le même
function fusionDip(a = {}, b = {}) {
  const d = { ...b };
  Object.entries(a).forEach(([c, m]) => (d[c] = d[c] && d[c] < m ? d[c] : m));
  return d;
}

export async function fusionner(garde, doublon) {
  const { F, db } = await sdk();
  const A = garde.uid;
  const B = doublon.uid;
  if (!A || !B || A === B) throw { message: 'Choisissez deux comptes différents.' };
  const nom = garde.name;
  const bilan = { resultats: 0, saisons: 0, carnet: 0, demandes: 0, questions: 0, reponses: 0 };
  const parUid = (col, champ, uid) => F.getDocs(F.query(F.collection(db, col), F.where(champ, '==', uid)));

  // équipage et chef d'équipage de chaque saison : ceux du compte gardé, sinon ceux du doublon
  const eq = { ...(doublon.eq || {}), ...(garde.eq || {}) };
  const ce = { ...(doublon.ce || {}), ...(garde.ce || {}) };

  // 1. résultats : copiés sous le compte gardé, puis effacés (un seul défi par semaine)
  const [rB, rA] = await Promise.all([parUid('results', 'uid', B), parUid('results', 'uid', A)]);
  const defisA = new Set(rA.docs.filter((d) => d.data().mode === 'defi').map((d) => d.data().semaine));
  await lots(
    F,
    db,
    rB.docs.map((d) => (batch) => {
      const r = d.data();
      if (r.mode === 'defi' && defisA.has(r.semaine)) {
        batch.delete(d.ref);
        return 1;
      }
      const ref = r.mode === 'defi' ? F.doc(db, 'results', `defi_${r.semaine}_${A}`) : F.doc(F.collection(db, 'results'));
      batch.set(ref, { ...r, uid: A, name: nom });
      batch.delete(d.ref);
      bilan.resultats++;
      return 2;
    })
  );

  // 2. statistiques de chaque saison
  const sB = await parUid('stats', 'uid', B);
  for (const d of sB.docs) {
    const b = d.data();
    const refA = F.doc(db, 'stats', `${b.saison}_${A}`);
    const a = await F.getDoc(refA);
    const st = a.exists() ? fusionStats(a.data(), b) : { ...b };
    const batch = F.writeBatch(db);
    batch.set(refA, { uid: A, saison: b.saison, mois: st.mois || {}, defis: st.defis || {}, epreuves: st.epreuves || [] });
    batch.delete(d.ref);
    await batch.commit();
    bilan.saisons++;
  }

  // 3. carnet : les validations des deux comptes (celle du compte gardé si les deux ont le même point)
  const [cA, cB] = await Promise.all([F.getDoc(F.doc(db, 'carnets', A)), F.getDoc(F.doc(db, 'carnets', B))]);
  const vA = cA.exists() ? cA.data().v || {} : {};
  if (cB.exists()) {
    const vB = cB.data().v || {};
    bilan.carnet = Object.keys(vB).filter((k) => !vA[k]).length;
    const batch = F.writeBatch(db);
    if (bilan.carnet) batch.set(F.doc(db, 'carnets', A), { v: { ...vB, ...vA } });
    batch.delete(cB.ref);
    await batch.commit();
    Object.keys(vB).forEach((k) => vA[k] || (vA[k] = vB[k]));
  }

  // 4. demandes de validation (inutiles si le point est déjà validé)
  const dB = await parUid('demandes', 'uid', B);
  await lots(
    F,
    db,
    dB.docs.map((d) => (batch) => {
      const x = d.data();
      batch.delete(d.ref);
      if (vA[x.item]) return 1;
      batch.set(F.doc(db, 'demandes', `${A}_${x.item}`), { ...x, uid: A, name: nom, eq: eq[String(x.saison)] || x.eq || '' });
      bilan.demandes++;
      return 2;
    })
  );

  // 5. diplômes déclarés en attente (sauf ceux déjà confirmés)
  const dip = fusionDip(garde.dip, doublon.dip);
  const [gA, gB] = await Promise.all([F.getDoc(F.doc(db, 'diplomes', A)), F.getDoc(F.doc(db, 'diplomes', B))]);
  if (gB.exists()) {
    const d = { ...(gB.data().d || {}), ...(gA.exists() ? gA.data().d || {} : {}) };
    Object.keys(d).forEach((c) => dip[c] && delete d[c]);
    const batch = F.writeBatch(db);
    batch.set(F.doc(db, 'diplomes', A), { d, at: F.serverTimestamp() });
    batch.delete(gB.ref);
    await batch.commit();
  }

  // 6. questions posées et réponses données
  const qB = await parUid('questions', 'authorId', B);
  await lots(
    F,
    db,
    qB.docs.map((d) => (batch) => {
      batch.update(d.ref, { authorId: A, authorName: nom });
      bilan.questions++;
      return 1;
    })
  );
  const qs = await F.getDocs(F.query(F.collection(db, 'questions'), F.where('answers', '>', 0)));
  const rep = await Promise.all(qs.docs.map((q) => F.getDocs(F.query(F.collection(db, 'questions', q.id, 'answers'), F.where('authorId', '==', B)))));
  await lots(
    F,
    db,
    rep.flatMap((s) => s.docs).map((d) => (batch) => {
      batch.update(d.ref, { authorId: A, authorName: nom });
      bilan.reponses++;
      return 1;
    })
  );

  // 7. compositions des saisons où l'un des deux comptes apparaît : une seule place, celle de eq
  const saisons = [...new Set([...Object.keys(eq), ...Object.keys(ce)])];
  for (const S of saisons) {
    const compos = await F.getDocs(F.collection(db, 'saisons', S, 'equipages'));
    for (const c of compos.docs) {
      const x = c.data();
      const membres = x.membres || [];
      const touche = membres.some((m) => m.uid === A || m.uid === B) || x.chefEq === A || x.chefEq === B;
      if (!touche) continue;
      const nv = membres.filter((m) => m.uid !== A && m.uid !== B);
      if (eq[S] === c.id) nv.push({ uid: A, name: nom });
      const estCE = (x.chefEq === A || x.chefEq === B) && eq[S] === c.id;
      if (x.chefEq === A || x.chefEq === B) {
        if (estCE) ce[S] = c.id;
        else if (ce[S] === c.id) delete ce[S];
      }
      await F.setDoc(c.ref, {
        nom: x.nom,
        membres: nv,
        chefEq: x.chefEq === A || x.chefEq === B ? (estCE ? A : null) : x.chefEq || null,
        chefEqName: x.chefEq === A || x.chefEq === B ? (estCE ? nom : '') : x.chefEqName || '',
      });
    }
  }
  // un chef d'équipage sans équipage cette saison-là n'en est plus un
  Object.keys(ce).forEach((S) => eq[S] !== ce[S] && delete ce[S]);

  // 8. profils : le compte gardé reçoit ce qui lui manquait, le doublon est désactivé
  const batch = F.writeBatch(db);
  batch.update(F.doc(db, 'users', A), {
    unite: garde.unite || doublon.unite || '',
    role: garde.role === 'chef' || doublon.role === 'chef' ? 'chef' : 'eleve',
    approved: !!(garde.approved || doublon.approved),
    ...(garde.objectif || doublon.objectif ? { objectif: garde.objectif || doublon.objectif } : {}),
    ...(garde.pe === true || doublon.pe === true ? { pe: true } : {}),
    dip,
    eq,
    ce,
  });
  batch.update(F.doc(db, 'users', B), {
    approved: false,
    role: 'eleve',
    mergedInto: A,
    mergedEmail: garde.email || '',
    mergedAt: F.serverTimestamp(),
    eq: F.deleteField(),
    ce: F.deleteField(),
    dip: F.deleteField(),
  });
  await batch.commit();
  return bilan;
}
