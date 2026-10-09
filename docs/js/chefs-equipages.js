// Espace chefs : registre des équipages, composition de chaque saison, points bonus.
import * as fb from './fb.js';
import { saisonDe, saisonLabel, moisDeSaison, moisDe, moisLabel } from './saison.js';
import { badges } from './diplomes.js';
import { publier } from './agregats.js';

const box = document.getElementById('chefs-equipages');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

async function show(me, saison) {
  box.innerHTML = '<p class="muted">Chargement…</p>';
  let eqs, users, compos, prev, bonus;
  try {
    [eqs, users, compos, prev, bonus] = await Promise.all([
      fb.listEquipages(),
      fb.listUsers(),
      fb.compositions(saison),
      fb.compositions(saison - 1),
      fb.listBonus(saison),
    ]);
  } catch (e) {
    box.innerHTML = `<p>${esc(fb.message(e))}</p>`;
    return;
  }
  users = users.filter((u) => u.approved).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const actifs = eqs.filter((e) => e.actif !== false);
  // affectation actuelle de chaque scout
  const aff = {};
  const ce = new Set();
  compos.forEach((c) => (c.membres || []).forEach((m) => (aff[m.uid] = c.id)));
  compos.forEach((c) => c.chefEq && ce.add(c.chefEq));
  const cur = saisonDe();

  box.innerHTML = `
  <div class="res-tools"><label class="small">Saison <select id="s-saison">${[cur + 1, cur, cur - 1]
    .map((s) => `<option value="${s}"${s === saison ? ' selected' : ''}>${saisonLabel(s)}</option>`)
    .join('')}</select></label></div>

  <h2 id="registre">Les équipages</h2>
  <p class="small muted">Les noms durent d’une année à l’autre. Un équipage fermé n’apparaît plus dans les compositions, mais son historique reste.</p>
  <ul class="eq-reg">${eqs
    .map(
      (e) => `<li data-id="${e.id}"><b>${esc(e.nom)}</b> ${e.actif === false ? '<span class="tag">fermé</span>' : ''} <button class="linkish" type="button" data-a="toggle">${e.actif === false ? 'rouvrir' : 'fermer'}</button> <button class="linkish" type="button" data-a="rename">renommer</button></li>`
    )
    .join('')}</ul>
  <form id="eq-new" class="inline-form"><input name="nom" placeholder="Nom d’un nouvel équipage" maxlength="40" required><button class="btn small" type="submit">Créer</button></form>

  <h2 id="composition">Composition ${saisonLabel(saison)}</h2>
  ${
    actifs.length
      ? `<p class="small muted">Choisissez l’équipage de chaque inscrit, et cochez son chef d’équipage (un par équipage). Les chefs qui ne sont dans aucun équipage restent sur « — ».${prev.length ? ' <button class="linkish" type="button" id="reprendre">Reprendre la composition de la saison précédente</button>' : ''}</p>
  <div class="tbl-wrap"><table class="compo"><thead><tr><th>Inscrit</th><th>Unité</th><th>Équipage</th><th>Chef d’équipage</th></tr></thead><tbody>${users
    .map(
      (u) => `<tr data-uid="${u.uid}" data-name="${esc(u.name)}"><td>${esc(u.name)}${u.role === 'chef' ? ' <span class="tag tag-chef">chef</span>' : ''} ${badges(u)}</td><td class="small">${esc(u.unite)}</td>
      <td><select>${['<option value="">—</option>', ...actifs.map((e) => `<option value="${e.id}"${aff[u.uid] === e.id ? ' selected' : ''}>${esc(e.nom)}</option>`)].join('')}</select></td>
      <td><input type="checkbox"${ce.has(u.uid) ? ' checked' : ''} aria-label="Chef d’équipage"></td></tr>`
    )
    .join('')}</tbody></table></div>
  <div class="btns"><button class="btn" type="button" id="save-compo">Enregistrer la composition</button> <span class="small" id="compo-msg"></span></div>`
      : '<p class="muted">Créez d’abord les équipages ci-dessus.</p>'
  }

  <h2 id="bonus">Points bonus</h2>
  <p class="small muted">Visibles de tous sur la page Équipages, avec leur motif. Entre −20 et +20 points.</p>
  <form id="bonus-new" class="inline-form">
    <select name="eq">${compos.map((c) => `<option value="${c.id}">${esc(c.nom)}</option>`).join('')}</select>
    <select name="mois">${moisDeSaison(saison, saison === cur ? new Date() : new Date(saison + 1, 7, 31))
      .reverse()
      .map((m) => `<option value="${m}"${m === moisDe() ? ' selected' : ''}>${moisLabel(m)}</option>`)
      .join('')}</select>
    <input name="pts" type="number" min="-20" max="20" step="1" value="5" required style="width:5rem">
    <input name="motif" placeholder="Motif" maxlength="120" required>
    <button class="btn small" type="submit">Ajouter</button>
  </form>
  <ul class="small">${bonus
    .map((b) => `<li data-id="${b.id}">${esc((compos.find((c) => c.id === b.eq) || {}).nom || '?')} : ${b.pts > 0 ? '+' : ''}${b.pts}, ${moisLabel(b.mois)} — ${esc(b.motif)} <span class="muted">(${esc(b.byName)})</span> <button class="linkish" type="button" data-a="delbonus">supprimer</button></li>`)
    .join('')}</ul>`;

  box.querySelector('#s-saison').onchange = (e) => show(me, +e.target.value);
  // le classement publié est recalculé à chaque ouverture de l'espace chefs
  if (saison <= cur) publier(me, saison, { compos, bonus }).catch(() => {});
  box.querySelector('#eq-new').onsubmit = async (e) => {
    e.preventDefault();
    const nom = new FormData(e.target).get('nom').trim();
    if (!nom) return;
    await fb.saveEquipage(null, { nom, actif: true });
    show(me, saison);
  };
  box.querySelectorAll('.eq-reg [data-a]').forEach((b) => {
    b.onclick = async () => {
      const id = b.closest('li').dataset.id;
      const e = eqs.find((x) => x.id === id);
      if (b.dataset.a === 'toggle') await fb.saveEquipage(id, { actif: e.actif === false });
      if (b.dataset.a === 'rename') {
        const li = b.closest('li');
        li.innerHTML = `<form class="inline-form"><input value="${esc(e.nom)}" maxlength="40"><button class="btn small" type="submit">OK</button></form>`;
        li.querySelector('form').onsubmit = async (ev) => {
          ev.preventDefault();
          const nom = li.querySelector('input').value.trim();
          if (nom) await fb.saveEquipage(id, { nom });
          show(me, saison);
        };
        return;
      }
      show(me, saison);
    };
  });
  const rep = box.querySelector('#reprendre');
  if (rep)
    rep.onclick = () => {
      const pa = {};
      const pce = new Set();
      prev.forEach((c) => (c.membres || []).forEach((m) => (pa[m.uid] = c.id)));
      prev.forEach((c) => c.chefEq && pce.add(c.chefEq));
      box.querySelectorAll('.compo tbody tr').forEach((tr) => {
        const id = pa[tr.dataset.uid];
        if (id && actifs.some((e) => e.id === id)) tr.querySelector('select').value = id;
        tr.querySelector('input').checked = pce.has(tr.dataset.uid);
      });
      box.querySelector('#compo-msg').textContent = 'Composition reprise : vérifiez puis enregistrez.';
    };
  const save = box.querySelector('#save-compo');
  if (save)
    save.onclick = async () => {
      const msg = box.querySelector('#compo-msg');
      const par = Object.fromEntries(actifs.map((e) => [e.id, { nom: e.nom, membres: [], chefEq: null, chefEqName: '' }]));
      let erreur = '';
      box.querySelectorAll('.compo tbody tr').forEach((tr) => {
        const id = tr.querySelector('select').value;
        const isCe = tr.querySelector('input').checked;
        if (!id) {
          if (isCe) erreur = `${tr.dataset.name} est coché chef d’équipage sans équipage.`;
          return;
        }
        par[id].membres.push({ uid: tr.dataset.uid, name: tr.dataset.name });
        if (isCe) {
          if (par[id].chefEq) erreur = `Deux chefs d’équipage pour ${par[id].nom}.`;
          par[id].chefEq = tr.dataset.uid;
          par[id].chefEqName = tr.dataset.name;
        }
      });
      if (erreur) {
        msg.textContent = erreur;
        return;
      }
      save.disabled = true;
      msg.textContent = 'Enregistrement…';
      try {
        for (const [id, c] of Object.entries(par)) {
          if (c.membres.length) await fb.saveComposition(saison, id, c);
          else if (compos.some((x) => x.id === id)) await fb.deleteComposition(saison, id);
        }
        // affectations recopiées sur les profils (users/{uid}.eq et .ce), pour les règles d'accès
        const eqDe = {};
        const ceDe = {};
        Object.entries(par).forEach(([id, c]) => {
          c.membres.forEach((m) => (eqDe[m.uid] = id));
          if (c.chefEq) ceDe[c.chefEq] = id;
        });
        const S = String(saison);
        const changes = users
          .filter((u) => ((u.eq || {})[S] || '') !== (eqDe[u.uid] || '') || ((u.ce || {})[S] || '') !== (ceDe[u.uid] || ''))
          .map((u) => ({ uid: u.uid, eq: eqDe[u.uid] || null, ce: ceDe[u.uid] || null }));
        await fb.setAffectations(saison, changes);
        await publier(me, saison).catch(() => {});
        await show(me, saison);
        const m2 = box.querySelector('#compo-msg');
        if (m2) m2.textContent = 'Composition enregistrée.';
        return;
      } catch (e) {
        msg.textContent = fb.message(e);
      }
      save.disabled = false;
    };
  box.querySelector('#bonus-new').onsubmit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const pts = Math.max(-20, Math.min(20, Math.round(+d.pts)));
    if (!d.eq || !pts) return;
    await fb.addBonus({ saison, eq: d.eq, mois: d.mois, pts, motif: d.motif.trim() }, me);
    show(me, saison);
  };
  box.querySelectorAll('[data-a=delbonus]').forEach((b) => {
    b.onclick = async () => {
      if (!b.dataset.confirm) {
        b.dataset.confirm = '1';
        b.textContent = 'confirmer';
        return;
      }
      await fb.deleteBonus(b.closest('li').dataset.id);
      show(me, saison);
    };
  });
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me || me.role !== 'chef') {
    box.innerHTML = '<p>Cette page est réservée aux chefs.</p>';
    return;
  }
  show(me, saisonDe());
});
