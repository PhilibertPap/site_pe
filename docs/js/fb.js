// Accès à Firebase (authentification et base Firestore), plan gratuit Spark.
// Toutes les pages passent par ces fonctions : rien d'autre ne parle directement à Firebase.
import { firebaseConfig } from './firebase-config.js';

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
  const byChef = me.role === 'chef';
  const batch = F.writeBatch(db);
  batch.set(F.doc(F.collection(db, 'questions', q.id, 'answers')), {
    body,
    authorId: me.uid,
    authorName: me.name,
    byChef,
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
