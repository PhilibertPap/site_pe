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

export async function listUsers() {
  const { F, db } = await sdk();
  const s = await F.getDocs(F.query(F.collection(db, 'users'), F.orderBy('createdAt', 'desc')));
  return s.docs.map((d) => ({ uid: d.id, ...d.data() }));
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
  const byChef = estFormateur(me); // réponse de formateur : chef, ou titulaire du PE, du CQ ou du CF
  const t = titre(me); // plus haut diplôme confirmé, affiché à côté du nom
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
