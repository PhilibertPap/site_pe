// Gestion des comptes, réservée aux chefs : valider les inscriptions, nommer d'autres chefs.
import * as fb from './fb.js';

const box = document.getElementById('chefs');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

async function show(me) {
  box.innerHTML = '<p class="muted">Chargement…</p>';
  let users, qs;
  try {
    [users, qs] = await Promise.all([fb.listUsers(), fb.listQuestions()]);
  } catch (err) {
    box.innerHTML = `<p>${esc(fb.message(err))}</p>`;
    return;
  }
  const pending = users.filter((u) => !u.approved);
  const ok = users.filter((u) => u.approved);
  const open = qs.filter((q) => !q.chefAnswered && !q.resolved);
  const row = (u) => `<tr data-uid="${u.uid}">
    <td>${esc(u.name)}</td><td>${esc(u.unite)}</td><td class="small">${esc(u.email)}</td>
    <td>${u.role === 'chef' ? '<span class="tag tag-chef">chef</span>' : 'élève'}</td>
    <td class="acts">${
      !u.approved
        ? '<button class="btn small" data-a="approve">Valider</button> <button class="btn small ghost" data-a="refuse">Refuser</button>'
        : u.uid === me.uid
        ? '<span class="muted small">vous</span>'
        : `<button class="btn small ghost" data-a="${u.role === 'chef' ? 'demote' : 'promote'}">${u.role === 'chef' ? 'Retirer chef' : 'Nommer chef'}</button> <button class="btn small ghost" data-a="suspend">Suspendre</button>`
    }</td></tr>`;
  box.innerHTML = `
    <h2 id="attente">Comptes en attente (${pending.length})</h2>
    ${pending.length ? `<div class="tbl-wrap"><table><thead><tr><th>Nom</th><th>Unité</th><th>E-mail</th><th>Rôle</th><th></th></tr></thead><tbody>${pending.map(row).join('')}</tbody></table></div>` : '<p class="muted">Aucune inscription à valider.</p>'}
    <h2 id="questions-ouvertes">Questions sans réponse d'un chef (${open.length})</h2>
    ${open.length ? `<ul>${open.map((q) => `<li><a href="../questions/question.html?id=${q.id}">${esc(q.title)}</a> <span class="muted small">· ${esc(q.authorName)}</span></li>`).join('')}</ul>` : '<p class="muted">Rien en attente.</p>'}
    <h2 id="comptes">Comptes validés (${ok.length})</h2>
    <div class="tbl-wrap"><table><thead><tr><th>Nom</th><th>Unité</th><th>E-mail</th><th>Rôle</th><th></th></tr></thead><tbody>${ok.map(row).join('')}</tbody></table></div>
    <p class="small muted">« Refuser » supprime la fiche de l'inscrit ; il ne peut plus entrer sur le site. Pour supprimer définitivement son identifiant, passer par la console Firebase (Authentication).</p>`;
  box.querySelectorAll('[data-a]').forEach((b) => {
    b.onclick = async () => {
      const uid = b.closest('tr').dataset.uid;
      const a = b.dataset.a;
      if ((a === 'refuse' || a === 'suspend') && !b.dataset.confirm) {
        b.dataset.confirm = '1';
        b.textContent = 'Confirmer';
        return;
      }
      b.disabled = true;
      try {
        if (a === 'approve') await fb.updateUser(uid, { approved: true });
        if (a === 'promote') await fb.updateUser(uid, { role: 'chef' });
        if (a === 'demote') await fb.updateUser(uid, { role: 'eleve' });
        if (a === 'suspend') await fb.updateUser(uid, { approved: false });
        if (a === 'refuse') await fb.deleteUserDoc(uid);
        show(me);
      } catch (err) {
        b.disabled = false;
        b.textContent = fb.message(err);
      }
    };
  });
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me || me.role !== 'chef') {
    box.innerHTML = '<p>Cette page est réservée aux chefs.</p>';
    return;
  }
  show(me);
});
