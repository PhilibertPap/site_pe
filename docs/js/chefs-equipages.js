// Espace chefs, page Équipages : registre des équipages, composition de chaque saison (membres et chef
// d'équipage), points bonus. Réservé aux chefs (règles Firestore).
import * as fb from './fb.js';
import { saisonDe, saisonLabel, moisDeSaison, moisDe, moisLabel } from './saison.js';
import { badges } from './diplomes.js';
import { publier } from './agregats.js';
import { toast, deuxClics, allerAncre } from './ui.js';

const box = document.getElementById('chefs-equipages');
const ROOT = document.body.dataset.root || '../';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pl = (n, s, p) => `${n} ${n > 1 ? p : s}`;

// Republie le classement après un changement (composition, bonus) d'une saison commencée
const republier = (me, saison) => (saison <= saisonDe() ? publier(me, saison).catch(() => {}) : Promise.resolve());

async function show(me, saison) {
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
  // affectation actuelle de chaque inscrit
  const aff = {};
  const ce = new Set();
  compos.forEach((c) => (c.membres || []).forEach((m) => (aff[m.uid] = c.id)));
  compos.forEach((c) => c.chefEq && ce.add(c.chefEq));
  const cur = saisonDe();
  const L = saisonLabel(saison);

  const resume = compos.length
    ? `<ul class="compo-sum">${compos
        .slice()
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
        .map(
          (c) => `<li><b>${esc(c.nom)}</b> ${pl((c.membres || []).length, 'membre', 'membres')} · ${
            c.chefEqName ? `chef d’équipage : ${esc(c.chefEqName)}` : '<span class="err-t">pas de chef d’équipage</span>'
          }</li>`
        )
        .join('')}</ul>`
    : `<p class="vide">Aucun équipage composé pour ${L}. Choisissez l’équipage de chaque inscrit ci-dessous, cochez les chefs d’équipage, puis enregistrez.</p>`;

  box.innerHTML = `
  <div class="res-tools"><label class="small">Saison affichée <select id="s-saison">${[cur + 1, cur, cur - 1]
    .map((s) => `<option value="${s}"${s === saison ? ' selected' : ''}>${saisonLabel(s)}${s === cur ? ' (en cours)' : s > cur ? ' (à venir)' : ''}</option>`)
    .join('')}</select></label></div>

  <h2 id="registre">Les équipages</h2>
  <p class="small muted">Les noms durent d’une année à l’autre. Un équipage fermé n’apparaît plus dans les compositions, mais son historique reste.</p>
  ${
    eqs.length
      ? `<ul class="eq-reg">${eqs
          .map(
            (e) => `<li data-id="${e.id}"><b>${esc(e.nom)}</b> ${e.actif === false ? '<span class="tag">fermé</span>' : ''} <button class="linkish" type="button" data-a="rename">renommer</button> · <button class="linkish" type="button" data-a="toggle">${e.actif === false ? 'rouvrir' : 'fermer'}</button></li>`
          )
          .join('')}</ul>`
      : '<p class="vide">Aucun équipage pour l’instant : créez le premier ci-dessous (Albatros, Cormoran…).</p>'
  }
  <form id="eq-new" class="inline-form"><input name="nom" placeholder="Nom du nouvel équipage" maxlength="40" required aria-label="Nom du nouvel équipage"><button class="btn small" type="submit">Créer l’équipage</button></form>

  <h2 id="composition">Composition ${L}</h2>
  ${resume}
  ${
    actifs.length
      ? `<p class="small muted">Choisissez l’équipage de chaque inscrit et cochez son chef d’équipage (un par équipage). Les chefs qui n’encadrent pas un équipage restent sur « aucun ». Rien n’est pris en compte avant « Enregistrer ».${
          prev.length ? ' <button class="linkish" type="button" id="reprendre">Reprendre la composition de la saison précédente</button>' : ''
        }</p>
  <div class="compo-wrap"><div class="tbl-wrap"><table class="compo"><thead><tr><th>Inscrit</th><th>Unité</th><th>Équipage</th><th>Chef d’équipage</th></tr></thead><tbody>${users
    .map(
      (u) => `<tr data-uid="${u.uid}" data-name="${esc(u.name)}"><td>${esc(u.name)}${u.role === 'chef' ? ' <span class="tag tag-chef">chef</span>' : ''} ${badges(u)}</td><td class="small">${esc(u.unite)}</td>
      <td><select aria-label="Équipage de ${esc(u.name)}">${['<option value="">aucun</option>', ...actifs.map((e) => `<option value="${e.id}"${aff[u.uid] === e.id ? ' selected' : ''}>${esc(e.nom)}</option>`)].join('')}</select></td>
      <td><label class="ce-box"><input type="checkbox"${ce.has(u.uid) ? ' checked' : ''}> <span class="small">CE</span></label></td></tr>`
    )
    .join('')}</tbody></table></div>
  <div class="btns save-bar"><button class="btn" type="button" id="save-compo">Enregistrer la composition</button> <span class="small" id="compo-msg" role="status"></span></div></div>
  <p class="small muted">L’enregistrement recopie l’équipage et le rôle de chef d’équipage sur chaque profil : c’est ce qui ouvre au chef d’équipage le tableau de bord et les demandes de ses équipiers.</p>`
      : '<p class="vide">Aucun équipage ouvert : créez-les ci-dessus, la composition se fait ensuite ici.</p>'
  }

  <h2 id="bonus">Points bonus</h2>
  <p class="small muted">Pour une belle sortie, un carnet de bord bien tenu, l’aide apportée aux autres… Entre −20 et +20 points, comptés dans le mois choisi. Visibles de tous sur la page Classement, avec leur motif.</p>
  ${
    compos.length
      ? `<form id="bonus-new" class="inline-form">
    <select name="eq" aria-label="Équipage">${compos.map((c) => `<option value="${c.id}">${esc(c.nom)}</option>`).join('')}</select>
    <select name="mois" aria-label="Mois">${moisDeSaison(saison, saison === cur ? new Date() : new Date(saison + 1, 7, 31))
      .reverse()
      .map((m) => `<option value="${m}"${m === moisDe() ? ' selected' : ''}>${moisLabel(m)}</option>`)
      .join('')}</select>
    <input name="pts" type="number" min="-20" max="20" step="1" value="5" required style="width:5rem" aria-label="Points">
    <input name="motif" placeholder="Motif (visible de tous)" maxlength="120" required aria-label="Motif">
    <button class="btn small" type="submit">Donner le bonus</button>
  </form>
  ${
    bonus.length
      ? `<ul class="small bonus-list">${bonus
          .sort((a, b) => (b.at || 0) - (a.at || 0))
          .map(
            (b) =>
              `<li data-id="${b.id}"><b>${esc((compos.find((c) => c.id === b.eq) || {}).nom || '?')}</b> : ${b.pts > 0 ? '+' : ''}${b.pts}, ${moisLabel(b.mois)} — ${esc(b.motif)} <span class="muted">(${esc(b.byName)})</span> <button class="linkish" type="button" data-a="delbonus">supprimer</button></li>`
          )
          .join('')}</ul>`
      : `<p class="muted small">Aucun bonus donné en ${L}.</p>`
  }`
      : `<p class="vide">Les bonus vont à un équipage composé : composez d’abord les équipages de ${L}.</p>`
  }`;

  box.querySelector('#s-saison').onchange = (e) => {
    const s = +e.target.value;
    history.replaceState(null, '', s === cur ? location.pathname : `?saison=${s}`);
    show(me, s);
  };
  box.querySelector('#eq-new').onsubmit = async (e) => {
    e.preventDefault();
    const nom = new FormData(e.target).get('nom').trim();
    if (!nom) return;
    if (eqs.some((x) => x.nom.toLowerCase() === nom.toLowerCase())) return toast(`L’équipage ${nom} existe déjà.`, true);
    try {
      await fb.saveEquipage(null, { nom, actif: true });
      toast(`Équipage ${nom} créé. Placez maintenant ses membres dans la composition.`);
      await show(me, saison);
    } catch (err) {
      toast(fb.message(err), true);
    }
  };
  box.querySelectorAll('.eq-reg [data-a]').forEach((b) => {
    b.onclick = async () => {
      const li = b.closest('li');
      const id = li.dataset.id;
      const e = eqs.find((x) => x.id === id);
      if (b.dataset.a === 'rename') {
        li.innerHTML = `<form class="inline-form"><input value="${esc(e.nom)}" maxlength="40" aria-label="Nouveau nom"><button class="btn small" type="submit">Renommer</button> <button class="linkish" type="button">annuler</button></form>`;
        li.querySelector('input').focus();
        li.querySelector('button[type=button]').onclick = () => show(me, saison);
        li.querySelector('form').onsubmit = async (ev) => {
          ev.preventDefault();
          const nom = li.querySelector('input').value.trim();
          try {
            if (nom && nom !== e.nom) {
              await fb.saveEquipage(id, { nom });
              toast(`${e.nom} s’appelle maintenant ${nom}.`);
            }
          } catch (err) {
            toast(fb.message(err), true);
          }
          show(me, saison);
        };
        return;
      }
      // fermer : second clic ; rouvrir : direct
      if (e.actif !== false && !deuxClics(b, `confirmer : fermer ${e.nom}`)) return;
      b.disabled = true;
      try {
        await fb.saveEquipage(id, { actif: e.actif === false });
        toast(e.actif === false ? `${e.nom} est rouvert.` : `${e.nom} est fermé : il n’apparaît plus dans les compositions.`);
      } catch (err) {
        toast(fb.message(err), true);
      }
      show(me, saison);
    };
  });

  const msg = box.querySelector('#compo-msg');
  const table = box.querySelector('.compo');
  if (table)
    table.addEventListener('change', () => {
      msg.textContent = 'Modifications non enregistrées.';
      msg.className = 'small err-t';
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
      msg.textContent = 'Composition de la saison précédente reprise : vérifiez, puis enregistrez.';
      msg.className = 'small err-t';
    };
  const save = box.querySelector('#save-compo');
  if (save)
    save.onclick = async () => {
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
          if (par[id].chefEq) erreur = `Deux chefs d’équipage pour ${par[id].nom} : n’en cochez qu’un.`;
          par[id].chefEq = tr.dataset.uid;
          par[id].chefEqName = tr.dataset.name;
        }
      });
      if (erreur) {
        msg.textContent = erreur;
        msg.className = 'small err-t';
        return;
      }
      save.disabled = true;
      msg.textContent = 'Enregistrement…';
      msg.className = 'small';
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
        await republier(me, saison);
        const n = Object.values(par).filter((c) => c.membres.length).length;
        toast(`Composition ${L} enregistrée : ${pl(n, 'équipage', 'équipages')}.`);
        await show(me, saison);
        const m2 = box.querySelector('#compo-msg');
        if (m2) m2.textContent = 'Composition enregistrée.';
        return;
      } catch (e) {
        msg.textContent = fb.message(e);
        msg.className = 'small err-t';
      }
      save.disabled = false;
    };
  const bf = box.querySelector('#bonus-new');
  if (bf)
    bf.onsubmit = async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(bf));
      const pts = Math.max(-20, Math.min(20, Math.round(+d.pts)));
      if (!d.eq || !pts) return toast('Indiquez un nombre de points entre −20 et +20, différent de 0.', true);
      bf.querySelector('button').disabled = true;
      try {
        await fb.addBonus({ saison, eq: d.eq, mois: d.mois, pts, motif: d.motif.trim() }, me);
        await republier(me, saison);
        toast(`Bonus de ${pts > 0 ? '+' : ''}${pts} donné à ${(compos.find((c) => c.id === d.eq) || {}).nom}.`);
      } catch (err) {
        toast(fb.message(err), true);
      }
      show(me, saison);
    };
  box.querySelectorAll('[data-a=delbonus]').forEach((b) => {
    b.onclick = async () => {
      if (!deuxClics(b, 'confirmer la suppression')) return;
      b.disabled = true;
      try {
        await fb.deleteBonus(b.closest('li').dataset.id);
        await republier(me, saison);
        toast('Bonus supprimé.');
      } catch (err) {
        toast(fb.message(err), true);
      }
      show(me, saison);
    };
  });
  allerAncre();
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me || me.role !== 'chef') {
    box.innerHTML = `<p>Cette page est réservée aux chefs. <a href="${ROOT}compte/index.html">Mon espace</a></p>`;
    return;
  }
  const q = +new URLSearchParams(location.search).get('saison');
  const cur = saisonDe();
  show(me, q && q >= cur - 1 && q <= cur + 1 ? q : cur);
});
