// Espace chefs, page Inscrits : comptes à valider, diplômes à confirmer, et pour chaque inscrit son objectif,
// son équipage, ses diplômes et son carnet ; nommer ou retirer un chef, suspendre un compte.
import * as fb from './fb.js';
import { aFaire } from './afaire.js';
import { toast, deuxClics, allerAncre } from './ui.js';
import { TOTAUX, valides } from './attendus.js';
import { DIPLOMES, CODES, MOIS_RE, badges, diplomesDe, objectifDe, ceDe } from './diplomes.js';
import { saisonDe, saisonLabel, moisDe, moisLabel } from './saison.js';

const box = document.getElementById('chefs');
const ROOT = document.body.dataset.root || '../';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const filtre = { eq: '', obj: '' };
const dire = (m) => toast(m);

async function show(me) {
  const saison = saisonDe();
  let users, qs, compos, carnets, decls;
  try {
    [users, qs, compos, carnets, decls] = await Promise.all([
      fb.listUsers(),
      fb.listQuestions(),
      fb.compositions(saison),
      fb.tousCarnets(),
      fb.toutesDeclarations(),
    ]);
  } catch (err) {
    box.innerHTML = `<p>${esc(fb.message(err))}</p>`;
    return;
  }
  const byUid = Object.fromEntries(users.map((u) => [u.uid, u]));
  const pending = users.filter((u) => !u.approved);
  const ok = users.filter((u) => u.approved).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const eqDe = {};
  compos.forEach((c) => (c.membres || []).forEach((m) => (eqDe[m.uid] = c)));
  const aConfirmer = decls.flatMap((x) => Object.entries(x.d).map(([code, mois]) => ({ uid: x.uid, code, mois, at: x.at }))).filter((x) => byUid[x.uid] && DIPLOMES[x.code]);

  const shown = ok.filter(
    (u) =>
      (!filtre.obj || objectifDe(u) === filtre.obj) &&
      (!filtre.eq || (filtre.eq === '-' ? !eqDe[u.uid] : eqDe[u.uid] && eqDe[u.uid].id === filtre.eq))
  );
  const rowPending = (u) => `<tr data-uid="${u.uid}"><td>${esc(u.name)}</td><td>${esc(u.unite)}</td><td class="small">${esc(u.email)}</td>
    <td class="acts"><button class="btn small" data-a="approve">Valider</button> <button class="btn small ghost" data-a="refuse">Refuser</button></td></tr>`;
  const row = (u) => {
    const obj = objectifDe(u);
    const nv = valides(carnets[u.uid], obj);
    const N = TOTAUX[obj];
    const eq = eqDe[u.uid];
    return `<tr data-uid="${u.uid}">
    <td class="nowrap"><b>${esc(u.name)}</b>${u.role === 'chef' ? ' <span class="tag tag-chef">chef</span>' : ''}${ceDe(u, saison) ? ' <span class="tag">CE</span>' : ''}<br><span class="small muted">${esc(u.unite)}</span></td>
    <td>${u.objectif ? obj : `<span class="muted">${obj}</span>`}</td>
    <td>${eq ? esc(eq.nom) : '<span class="muted">—</span>'}</td>
    <td class="dips-cell">${badges(u, true) || '<span class="muted small">—</span>'}${u.pe === true && !(u.dip && u.dip.pe) ? ' <span class="small muted">(PE sans date)</span>' : ''}</td>
    <td class="nowrap"><span class="bar"><span style="width:${Math.round((100 * nv) / N)}%"></span></span> ${nv}/${N}</td>
    <td class="small liens"><a href="${ROOT}carnet/index.html?uid=${u.uid}">carnet</a> · <a href="resultats.html?uid=${u.uid}">résultats</a> · <button class="linkish" type="button" data-a="dips">diplômes</button></td>
    <td class="small liens">${
      u.uid === me.uid
        ? '<span class="muted">vous</span>'
        : `<button class="linkish" type="button" data-a="${u.role === 'chef' ? 'demote' : 'promote'}">${u.role === 'chef' ? 'retirer chef' : 'nommer chef'}</button> · <button class="linkish" type="button" data-a="suspend">suspendre</button>`
    }</td></tr>`;
  };

  const nomDe = (uid) => (byUid[uid] ? byUid[uid].name : '');
  box.innerHTML = `
    <h2 id="attente">Comptes à valider (${pending.length})</h2>
    ${pending.length ? `<p class="small muted">Validez seulement les personnes que vous connaissez. « Refuser » supprime la fiche : la personne ne peut plus entrer sur le site.</p><div class="tbl-wrap"><table><thead><tr><th>Nom</th><th>Unité</th><th>E-mail</th><th></th></tr></thead><tbody>${pending.map(rowPending).join('')}</tbody></table></div>` : '<p class="muted">Aucune inscription à valider.</p>'}
    <h2 id="diplomes">Diplômes à confirmer (${aConfirmer.length})</h2>
    ${
      aConfirmer.length
        ? `<ul class="demandes dip-conf">${aConfirmer
            .sort((a, b) => (a.at || 0) - (b.at || 0))
            .map(
              (x) => `<li data-uid="${x.uid}" data-code="${x.code}" data-mois="${x.mois}"><div><b>${esc(byUid[x.uid].name)}</b> ${badges(byUid[x.uid])}<br>${DIPLOMES[x.code].nom}, obtenu en ${moisLabel(x.mois)}</div>
              <div class="btns"><button class="btn small" type="button" data-a="confirmer">Confirmer</button><button class="btn small ghost" type="button" data-a="refuser">Refuser</button></div></li>`
            )
            .join('')}</ul><p class="small muted">Confirmer après avoir vu le diplôme ou sa trace sur Céphée. Le diplôme s’affiche alors à côté du nom ; le PE, le CQ et le CF font de l’inscrit un formateur.</p>`
        : '<p class="muted">Aucune déclaration en attente. Les scouts déclarent leurs diplômes dans Mon espace.</p>'
    }
    <h2 id="inscrits">Inscrits (${ok.length})</h2>
    <div class="res-tools">
      <select id="f-eq" aria-label="Équipage"><option value="">Tous les équipages</option>${compos
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
        .map((c) => `<option value="${c.id}"${filtre.eq === c.id ? ' selected' : ''}>${esc(c.nom)}</option>`)
        .join('')}<option value="-"${filtre.eq === '-' ? ' selected' : ''}>Sans équipage</option></select>
      <select id="f-obj" aria-label="Objectif"><option value="">Tous les objectifs</option>${['PE', 'CQ', 'CF']
        .map((o) => `<option${filtre.obj === o ? ' selected' : ''}>${o}</option>`)
        .join('')}</select>
      <span class="small muted">Saison ${saisonLabel(saison)}</span>
    </div>
    <div class="tbl-wrap"><table class="overview"><thead><tr><th>Inscrit</th><th>Objectif</th><th>Équipage</th><th>Diplômes</th><th>Carnet</th><th>Suivi</th><th>Compte</th></tr></thead><tbody>${
      shown.map(row).join('') || '<tr><td colspan="7" class="muted">Personne pour ces critères.</td></tr>'
    }</tbody></table></div>
    <p class="small muted">Objectif en gris : pas encore choisi par l’inscrit (PE par défaut). Carnet : points validés de la liste de son objectif. CE : chef d’équipage de la saison, nommé sur la page <a href="equipages.html#composition">Équipages</a>. Diplômes : « diplômes » permet d’inscrire ou de retirer directement un diplôme (correction, ancien diplôme).</p>
    <p class="small muted">« Suspendre » bloque l’accès sans rien effacer (on revalide le compte plus haut). Pour supprimer définitivement l’identifiant d’une personne, passer par la console Firebase (Authentication).</p>`;

  box.querySelector('#f-eq').onchange = (e) => ((filtre.eq = e.target.value), show(me));
  box.querySelector('#f-obj').onchange = (e) => ((filtre.obj = e.target.value), show(me));

  box.querySelectorAll('.dip-conf [data-a]').forEach((b) => {
    b.onclick = async () => {
      const li = b.closest('li');
      b.disabled = true;
      try {
        const ok = b.dataset.a === 'confirmer';
        await fb.confirmerDiplome(li.dataset.uid, li.dataset.code, li.dataset.mois, ok);
        dire(`${DIPLOMES[li.dataset.code].nom} de ${nomDe(li.dataset.uid)} : ${ok ? 'confirmé' : 'déclaration refusée'}.`);
        show(me);
      } catch (err) {
        b.disabled = false;
        toast(fb.message(err), true);
      }
    };
  });

  box.querySelectorAll('table [data-a]').forEach((b) => {
    b.onclick = async () => {
      const tr = b.closest('tr');
      const uid = tr.dataset.uid;
      const a = b.dataset.a;
      if (a === 'dips') return editDips(me, tr, byUid[uid]);
      const CONF = { refuse: 'Confirmer le refus', suspend: 'confirmer la suspension', promote: 'confirmer : nommer chef', demote: 'confirmer : retirer chef' };
      if (CONF[a] && !deuxClics(b, CONF[a])) return;
      b.disabled = true;
      const nom = nomDe(uid);
      try {
        if (a === 'approve') await fb.updateUser(uid, { approved: true });
        if (a === 'promote') await fb.updateUser(uid, { role: 'chef' });
        if (a === 'demote') await fb.updateUser(uid, { role: 'eleve' });
        if (a === 'suspend') await fb.updateUser(uid, { approved: false });
        if (a === 'refuse') await fb.deleteUserDoc(uid);
        dire(
          {
            approve: `Compte de ${nom} validé : il peut maintenant entrer sur le site.`,
            promote: `${nom} est maintenant chef : il a accès à l’espace chefs.`,
            demote: `${nom} n’est plus chef.`,
            suspend: `Compte de ${nom} suspendu : il réapparaît dans « Comptes à valider ».`,
            refuse: `Inscription de ${nom} refusée.`,
          }[a]
        );
        show(me);
      } catch (err) {
        b.disabled = false;
        toast(fb.message(err), true);
      }
    };
  });

  allerAncre();
  // compteur « à faire » de la barre du haut, avec les données déjà lues
  aFaire(me, { users, qs, compos, decls }).catch(() => {});
}

// Inscrire ou retirer directement un diplôme (correction, reprise d'un ancien « A le PE »)
function editDips(me, tr, u) {
  const next = tr.nextElementSibling;
  if (next && next.classList.contains('dip-edit')) return next.remove();
  const d = diplomesDe(u);
  const ed = document.createElement('tr');
  ed.className = 'dip-edit';
  ed.innerHTML = `<td colspan="7"><ul class="decl-list">${CODES.filter((c) => d[c])
    .map((c) => `<li data-c="${c}">${DIPLOMES[c].nom}, ${d[c] === '?' ? 'sans date' : moisLabel(d[c])} <button class="linkish" type="button" data-x="del">retirer</button></li>`)
    .join('')}</ul>
    <form class="inline-form"><select name="code" aria-label="Diplôme">${CODES.map((c) => `<option value="${c}">${DIPLOMES[c].nom}</option>`).join('')}</select>
    <input name="mois" type="month" max="${moisDe()}" required aria-label="Mois d’obtention"><button class="btn small" type="submit">Inscrire</button> <span class="small"></span></form></td>`;
  tr.after(ed);
  const fin = async (code, mois) => {
    try {
      await fb.setDiplome(u.uid, code, mois);
      // un ancien « A le PE » est remplacé par le diplôme daté (ou retiré avec lui)
      if (code === 'pe' && u.pe === true) await fb.updateUser(u.uid, { pe: false });
      dire(`${DIPLOMES[code].nom} de ${u.name} : ${mois ? 'inscrit (' + moisLabel(mois) + ')' : 'retiré'}.`);
      show(me);
    } catch (err) {
      ed.querySelector('form span').textContent = fb.message(err);
    }
  };
  ed.querySelectorAll('[data-x=del]').forEach((b) => (b.onclick = () => fin(b.closest('li').dataset.c, null)));
  ed.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (!MOIS_RE.test(f.mois || '')) return (ed.querySelector('form span').textContent = 'Mois invalide.');
    fin(f.code, f.mois);
  };
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me || me.role !== 'chef') {
    box.innerHTML = `<p>Cette page est réservée aux chefs. <a href="${ROOT}compte/index.html">Mon espace</a></p>`;
    return;
  }
  show(me);
});
