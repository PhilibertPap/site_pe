// Questions-réponses : liste, nouvelle question, fil d'une question.
import * as fb from './fb.js';
import { estFormateur } from './diplomes.js';

const THEMES = {
  carte: 'Carte et compas',
  estime: 'Estime et courant',
  maree: 'Marée',
  balisage: 'Balisage',
  ripam: 'Règles de barre, feux, signaux',
  meteo: 'Météo',
  securite: 'Sécurité, VHF, réglementation',
  pratique: 'Pratique : voiles, manœuvres',
  examen: 'L’examen',
  autre: 'Autre',
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmt = (s) =>
  esc(s)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" rel="noopener" target="_blank">$1</a>')}</p>`)
    .join('');
const date = (d) =>
  d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'à l’instant';

const list = document.getElementById('q-list');
const detail = document.getElementById('q-detail');

// ------------------------------------------------------------------ liste

async function showList(me) {
  list.innerHTML = `
  <div class="q-tools">
    <button class="btn" type="button" id="q-new-btn">Poser une question</button>
    <input type="search" id="q-search" placeholder="Chercher dans les questions" aria-label="Chercher">
    <select id="q-theme" aria-label="Thème"><option value="">Tous les thèmes</option>${Object.entries(THEMES)
      .map(([k, v]) => `<option value="${k}">${v}</option>`)
      .join('')}</select>
    <label class="small"><input type="checkbox" id="q-open"> sans réponse d’un formateur</label>
  </div>
  <form id="q-new" class="q-form" hidden>
    <label>Thème<select name="theme" required>${Object.entries(THEMES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    <label>Question, en une phrase<input name="title" maxlength="200" required></label>
    <label>Détails (ce que vous avez compris, où vous bloquez, la référence d’un exercice…)<textarea name="body" rows="6" maxlength="5000" required></textarea></label>
    <div class="btns"><button class="btn" type="submit">Publier</button><button class="btn ghost" type="button" data-a="cancel">Annuler</button></div>
    <p class="small muted">Tous les inscrits verront la question et les réponses. Avant de poser une question, cherchez si elle n’a pas déjà été posée.</p>
  </form>
  <ol class="q-items"><li class="muted">Chargement…</li></ol>`;
  const form = list.querySelector('#q-new');
  list.querySelector('#q-new-btn').onclick = () => {
    form.hidden = false;
    form.querySelector('[name=title]').focus();
  };
  form.querySelector('[data-a=cancel]').onclick = () => (form.hidden = true);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    form.querySelector('button').disabled = true;
    try {
      const id = await fb.askQuestion({ title: d.title.trim(), body: d.body.trim(), theme: d.theme }, me);
      location.href = `question.html?id=${id}`;
    } catch (err) {
      form.querySelector('button').disabled = false;
      alertIn(form, fb.message(err));
    }
  };

  let qs = [];
  try {
    qs = await fb.listQuestions();
  } catch (err) {
    list.querySelector('.q-items').innerHTML = `<li>${esc(fb.message(err))}</li>`;
    return;
  }
  const render = () => {
    const t = list.querySelector('#q-theme').value;
    const open = list.querySelector('#q-open').checked;
    const words = list
      .querySelector('#q-search')
      .value.toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/\s+/)
      .filter(Boolean);
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const shown = qs.filter(
      (q) =>
        (!t || q.theme === t) &&
        (!open || !q.chefAnswered) &&
        words.every((w) => norm(q.title + ' ' + q.body).includes(w))
    );
    list.querySelector('.q-items').innerHTML = shown.length
      ? shown
          .map(
            (q) => `<li><a href="question.html?id=${q.id}">
          <span class="q-title">${esc(q.title)}</span>
          <span class="q-meta">${THEMES[q.theme] || ''} · ${esc(q.authorName)} · ${date(q.lastAt)}</span>
          <span class="q-badges">${q.answers ? `<span class="tag">${q.answers} réponse${q.answers > 1 ? 's' : ''}</span>` : '<span class="tag tag-open">sans réponse</span>'}${
              q.chefAnswered ? '<span class="tag tag-chef">réponse d’un formateur</span>' : ''
            }${q.resolved ? '<span class="tag tag-ok">résolue</span>' : ''}</span>
        </a></li>`
          )
          .join('')
      : '<li class="muted">Aucune question pour l’instant.</li>';
  };
  list.addEventListener('input', render);
  render();
}

// -------------------------------------------------------------- fil

async function showDetail(me, id) {
  detail.innerHTML = '<p class="muted">Chargement…</p>';
  let q, answers;
  try {
    [q, answers] = await Promise.all([fb.getQuestion(id), fb.listAnswers(id)]);
  } catch (err) {
    detail.innerHTML = `<p>${esc(fb.message(err))}</p>`;
    return;
  }
  if (!q) {
    detail.innerHTML = '<p>Cette question n’existe pas ou a été supprimée. <a href="index.html">Retour aux questions</a></p>';
    return;
  }
  const chef = me.role === 'chef';
  const mine = q.authorId === me.uid;
  document.title = q.title + ' · Questions';
  detail.innerHTML = `
  <p class="small"><a href="index.html">← Toutes les questions</a></p>
  <p class="kicker">${THEMES[q.theme] || ''}${q.resolved ? ' · résolue' : ''}</p>
  <h1>${esc(q.title)}</h1>
  <p class="q-meta">${esc(q.authorName)} · ${date(q.createdAt)}</p>
  <div class="q-body">${fmt(q.body)}</div>
  <div class="btns">
    ${mine || chef ? `<button class="btn small ghost" type="button" data-a="resolve">${q.resolved ? 'Rouvrir la question' : 'Marquer comme résolue'}</button>` : ''}
    ${chef || (mine && !q.answers) ? '<button class="btn small ghost" type="button" data-a="delq">Supprimer la question</button>' : ''}
  </div>
  <h2>${answers.length ? `${answers.length} réponse${answers.length > 1 ? 's' : ''}` : 'Pas encore de réponse'}</h2>
  <ol class="answers">${answers
    .map(
      (a) => `<li class="answer${a.byChef ? ' by-chef' : ''}">
      <p class="q-meta"><strong>${esc(a.authorName)}</strong>${a.titre ? ` <span class="tag tag-dip main" title="Diplôme confirmé">${esc(a.titre)}</span>` : ''}${a.byChef ? ' <span class="tag tag-chef">formateur</span>' : ''} · ${date(a.createdAt)}${
        chef ? ` · <button type="button" class="linkish" data-del="${a.id}">supprimer</button>` : ''
      }</p>
      ${fmt(a.body)}</li>`
    )
    .join('')}</ol>
  <form class="q-form" id="a-form">
    <label>${estFormateur(me) ? 'Votre réponse (elle sera signalée comme réponse d’un formateur)' : 'Votre réponse ou un complément'}<textarea name="body" rows="5" maxlength="5000" required></textarea></label>
    <div class="btns"><button class="btn" type="submit">Répondre</button></div>
  </form>`;

  const act = (sel, fn) => {
    const b = detail.querySelector(sel);
    if (b) b.onclick = fn;
  };
  act('[data-a=resolve]', async () => {
    await fb.setResolved(q.id, !q.resolved).catch((e) => alertIn(detail.querySelector('.btns'), fb.message(e)));
    showDetail(me, id);
  });
  act('[data-a=delq]', async (e) => {
    const b = e.currentTarget;
    if (!b.dataset.confirm) {
      b.dataset.confirm = '1';
      b.textContent = 'Confirmer la suppression';
      return;
    }
    try {
      await fb.deleteQuestion(q.id);
      location.href = 'index.html';
    } catch (err) {
      alertIn(detail.querySelector('.btns'), fb.message(err));
    }
  });
  detail.querySelectorAll('[data-del]').forEach(
    (b) =>
      (b.onclick = async () => {
        if (!b.dataset.confirm) {
          b.dataset.confirm = '1';
          b.textContent = 'confirmer';
          return;
        }
        await fb.deleteAnswer(q, b.dataset.del).catch((e) => alertIn(b.parentNode, fb.message(e)));
        showDetail(me, id);
      })
  );
  const form = detail.querySelector('#a-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const body = new FormData(form).get('body').trim();
    if (!body) return;
    form.querySelector('button').disabled = true;
    try {
      await fb.answer(q, body, me);
      showDetail(me, id);
    } catch (err) {
      form.querySelector('button').disabled = false;
      alertIn(form, fb.message(err));
    }
  };
}

function alertIn(el, msg) {
  let p = el.querySelector('.err');
  if (!p) {
    p = document.createElement('p');
    p.className = 'err small';
    el.appendChild(p);
  }
  p.textContent = msg;
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me) {
    (list || detail).innerHTML = '<p>Les questions-réponses ne sont pas encore activées sur ce site.</p>';
    return;
  }
  if (list) showList(me);
  if (detail) {
    const id = new URLSearchParams(location.search).get('id');
    if (id) showDetail(me, id);
    else location.href = 'index.html';
  }
});
