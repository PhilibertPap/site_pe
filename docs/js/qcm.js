// Moteur de QCM : épreuve blanche (30 questions, 30 minutes) et entraînement par thème.
import * as F from './figures.js';
import { THEMES, QUESTIONS, EXAM_PLAN } from './qcm/index.js';

const root = document.getElementById('qcm');
const ROOT_URL = root.dataset.root || '../';
const LETTERS = 'ABCDE';

// ------------------------------------------------------------- utilitaires

function shuffle(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function el(tag, attrs = {}, html = '') {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else e.setAttribute(k, v);
  }
  if (html) e.innerHTML = html;
  return e;
}

function store(key, val) {
  try {
    if (val === undefined) return JSON.parse(localStorage.getItem('pe-qcm-' + key) || 'null');
    localStorage.setItem('pe-qcm-' + key, JSON.stringify(val));
  } catch (e) {
    return null;
  }
}

function figure(f) {
  if (!f) return '';
  switch (f.k) {
    case 'balise':
      return F.balise(f.v, { w: f.w || 96, aria: 'Marque à identifier' });
    case 'balises':
      return `<div class="figrow" style="justify-content:flex-start">${f.v
        .map((v, i) => `<div>${F.balise(v, { w: 80, aria: 'Marque ' + (f.labels ? f.labels[i] : i + 1) })}${f.labels ? f.labels[i] : ''}</div>`)
        .join('')}</div>`;
    case 'marques':
      return F.marques(f.v, { w: f.w || 52, aria: 'Marques à identifier' });
    case 'nuit':
      return F.nuit(f.v, { w: f.w || 220, aria: 'Feux observés' });
    case 'pavillon':
      return F.pavillon(f.v, { w: f.w || 80 });
    case 'port':
      return F.port(f.v, { w: 56, exempt: f.exempt, flash: f.flash, aria: 'Signal de port' });
    case 'feu':
      return F.feuHTML({ r: f.r, c: f.c || 'W', p: f.p, big: 1, nolabel: 1 });
    case 'son':
      return F.sonHTML({ s: f.v, label: 'écouter' });
    case 'svg':
      return f.v;
    default:
      return '';
  }
}

function prepare(q) {
  const order = q.fixed ? q.c.map((_, i) => i) : shuffle(q.c.map((_, i) => i));
  return { ...q, order };
}

function questionBlock(q, n, mode) {
  const box = el('div', { class: 'q', id: 'q-' + q.id });
  const theme = THEMES[q.t];
  box.innerHTML = `<div class="q-head"><span>Question ${n}</span><span>·</span><span>${theme}</span>${
    q.src ? `<span>·</span><span>d'après ${q.src}</span>` : ''
  }</div>
  <div class="q-text">${q.q}</div>
  ${q.fig ? `<div class="q-fig">${figure(q.fig)}</div>` : ''}`;
  const ul = el('ul', { class: 'choices' });
  q.order.forEach((ci, k) => {
    const li = el('li');
    li.innerHTML = `<label><input type="radio" name="r-${q.id}" value="${ci}"><span class="letter">${LETTERS[k]}</span><span>${q.c[ci]}</span></label>`;
    ul.appendChild(li);
  });
  box.appendChild(ul);
  box.appendChild(el('div', { class: 'expl-slot' }));
  return box;
}

function reveal(box, q, chosen) {
  box.classList.add('done');
  box.querySelectorAll('input').forEach((i) => (i.disabled = true));
  box.querySelectorAll('label').forEach((lab) => {
    const v = +lab.querySelector('input').value;
    if (v === q.a) lab.classList.add('good');
    else if (v === chosen) lab.classList.add('bad');
  });
  const ok = chosen === q.a;
  const verdict =
    chosen === null || chosen === undefined
      ? '<span class="verdict ko">Sans réponse.</span>'
      : ok
      ? '<span class="verdict ok">Bonne réponse.</span>'
      : '<span class="verdict ko">Mauvaise réponse.</span>';
  const ref = q.ref ? ` <a class="ref" href="${ROOT_URL}${q.ref}">Revoir le cours</a>` : '';
  box.querySelector('.expl-slot').innerHTML = `<div class="expl">${verdict} ${q.e}${ref}</div>`;
  return ok;
}

// ----------------------------------------------------------------- accueil

function home() {
  const best = store('best');
  const nb = QUESTIONS.length;
  const counts = {};
  QUESTIONS.forEach((q) => (counts[q.t] = (counts[q.t] || 0) + 1));
  root.innerHTML = `
  <h2 id="epreuve">Épreuve blanche</h2>
  <p>30 questions tirées au sort dans la banque, réparties par thème comme à l'examen, en 30 minutes. Une seule bonne réponse par question. La correction détaillée s'affiche quand vous rendez la copie (ou à la fin du temps).</p>
  ${best ? `<p class="small muted">Meilleur score sur cet appareil : ${best.s}/30, le ${new Date(best.d).toLocaleDateString('fr-FR')}.</p>` : ''}
  <div class="btns"><button class="btn" id="go-exam" type="button">Commencer une épreuve blanche</button></div>

  <h2 id="entrainement">Entraînement par thème</h2>
  <p>Choisissez un ou plusieurs thèmes. Chaque réponse est corrigée immédiatement, avec l'explication et un lien vers la section du cours.</p>
  <div class="theme-pick">${Object.entries(THEMES)
    .map(
      ([k, v]) =>
        `<label><input type="checkbox" value="${k}" checked> ${v} <span class="muted">(${counts[k] || 0})</span></label>`
    )
    .join('')}</div>
  <div class="btns">
    <button class="btn" id="go-train" type="button">10 questions</button>
    <button class="btn ghost" id="go-train-20" type="button">20 questions</button>
    <button class="btn ghost" id="go-train-all" type="button">Toutes les questions des thèmes choisis</button>
  </div>
  ${(store('wrong') || []).length ? `<div class="btns"><button class="btn ghost" id="go-wrong" type="button">Reprendre mes ${store('wrong').length} erreurs enregistrées</button></div>` : ''}
  <p class="small muted">La banque contient ${nb} questions. Les questions marquées « d'après » reprennent le sujet d'une épreuve passée, avec une correction rédigée pour ce site.</p>`;

  root.querySelector('#go-exam').onclick = exam;
  const picked = () => [...root.querySelectorAll('.theme-pick input:checked')].map((i) => i.value);
  root.querySelector('#go-train').onclick = () => train(picked(), 10);
  root.querySelector('#go-train-20').onclick = () => train(picked(), 20);
  root.querySelector('#go-train-all').onclick = () => train(picked(), 9999);
  const w = root.querySelector('#go-wrong');
  if (w) w.onclick = () => train(null, 9999, store('wrong'));
}

// ----------------------------------------------------------------- épreuve

function drawExam() {
  const picked = [];
  for (const [t, n] of Object.entries(EXAM_PLAN)) {
    picked.push(...shuffle(QUESTIONS.filter((q) => q.t === t)).slice(0, n));
  }
  // compléter si un thème manque de questions
  if (picked.length < 30) {
    const rest = shuffle(QUESTIONS.filter((q) => !picked.includes(q)));
    picked.push(...rest.slice(0, 30 - picked.length));
  }
  return shuffle(picked).slice(0, 30).map(prepare);
}

function exam() {
  const qs = drawExam();
  const end = Date.now() + 30 * 60 * 1000;
  root.innerHTML = '';
  const bar = el(
    'div',
    { class: 'qcm-bar' },
    `<span class="timer">30:00</span><span class="grow"><span class="answered">0</span>/30 répondues</span><button class="btn small" type="button">Rendre la copie</button>`
  );
  root.appendChild(bar);
  const list = el('div');
  qs.forEach((q, i) => list.appendChild(questionBlock(q, i + 1, 'exam')));
  root.appendChild(list);
  window.PE.animateFeux(root);
  window.scrollTo(0, 0);

  list.addEventListener('change', () => {
    bar.querySelector('.answered').textContent = list.querySelectorAll('input:checked').length;
  });

  let done = false;
  const timerEl = bar.querySelector('.timer');
  const tick = setInterval(() => {
    const left = Math.max(0, end - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    timerEl.classList.toggle('low', left < 5 * 60000);
    if (left <= 0) finish();
  }, 500);

  function finish() {
    if (done) return;
    done = true;
    clearInterval(tick);
    let score = 0;
    const byTheme = {};
    const wrong = [];
    qs.forEach((q) => {
      const box = list.querySelector('#q-' + q.id);
      const c = box.querySelector('input:checked');
      const chosen = c ? +c.value : null;
      const ok = reveal(box, q, chosen);
      if (ok) score++;
      else wrong.push(q.id);
      byTheme[q.t] = byTheme[q.t] || [0, 0];
      byTheme[q.t][1]++;
      if (ok) byTheme[q.t][0]++;
    });
    const prevWrong = new Set(store('wrong') || []);
    wrong.forEach((w) => prevWrong.add(w));
    store('wrong', [...prevWrong]);
    const best = store('best');
    if (!best || score > best.s) store('best', { s: score, d: Date.now() });
    const errors = 30 - score;
    const sc = el(
      'div',
      { class: 'score' },
      `<b>${score}/30</b> <span class="muted">· ${errors} erreur${errors > 1 ? 's' : ''}</span>
      <div class="stat-row" style="margin-top:.6rem">${Object.entries(byTheme)
        .map(([t, [a, n]]) => `<span>${THEMES[t]}</span><span>${a}/${n}</span>`)
        .join('')}</div>
      <p class="small" style="margin:.8rem 0 0">Les erreurs sont enregistrées sur cet appareil ; vous pourrez les reprendre depuis la page du QCM.</p>
      <div class="btns"><button class="btn small" type="button" data-a="again">Nouvelle épreuve</button><button class="btn small ghost" type="button" data-a="home">Retour</button></div>`
    );
    root.insertBefore(sc, list);
    bar.remove();
    sc.querySelector('[data-a=again]').onclick = exam;
    sc.querySelector('[data-a=home]').onclick = home;
    window.scrollTo(0, root.offsetTop - 80);
  }
  bar.querySelector('button').onclick = () => {
    const n = list.querySelectorAll('input:checked').length;
    if (n < 30 && !confirmInline(bar, n)) return;
    finish();
  };
  function confirmInline(bar, n) {
    // pas de boîte de dialogue : un second clic confirme
    const b = bar.querySelector('button');
    if (b.dataset.confirm) return true;
    b.dataset.confirm = '1';
    b.textContent = `${30 - n} sans réponse : confirmer`;
    return false;
  }
}

// ------------------------------------------------------------- entraînement

function train(themes, n, ids) {
  let pool = ids ? QUESTIONS.filter((q) => ids.includes(q.id)) : QUESTIONS.filter((q) => themes.includes(q.t));
  if (!pool.length) {
    alertInline('Choisissez au moins un thème.');
    return;
  }
  const qs = shuffle(pool).slice(0, n).map(prepare);
  let i = 0;
  let good = 0;
  let answered = 0;
  const wrongSet = new Set(store('wrong') || []);
  root.innerHTML = '';
  const bar = el('div', { class: 'qcm-bar' }, `<span class="grow">Question <b class="cur">1</b>/${qs.length} · <span class="sc">0</span> bonne(s)</span><button class="btn small ghost" type="button">Arrêter</button>`);
  root.appendChild(bar);
  bar.querySelector('button').onclick = summary;
  const zone = el('div');
  root.appendChild(zone);

  function show() {
    zone.innerHTML = '';
    const q = qs[i];
    const box = questionBlock(q, i + 1, 'train');
    zone.appendChild(box);
    window.PE.animateFeux(zone);
    bar.querySelector('.cur').textContent = i + 1;
    box.addEventListener('change', (e) => {
      const chosen = +e.target.value;
      const ok = reveal(box, q, chosen);
      answered++;
      if (ok) {
        good++;
        wrongSet.delete(q.id);
      } else wrongSet.add(q.id);
      store('wrong', [...wrongSet]);
      bar.querySelector('.sc').textContent = good;
      const next = el('div', { class: 'btns' });
      next.innerHTML = `<button class="btn" type="button">${i + 1 < qs.length ? 'Question suivante' : 'Voir le bilan'}</button>`;
      next.querySelector('button').onclick = () => {
        i++;
        if (i < qs.length) show();
        else summary();
      };
      box.appendChild(next);
      next.querySelector('button').focus({ preventScroll: true });
    });
  }

  function summary() {
    root.innerHTML = `<div class="score"><b>${good}/${answered}</b> <span class="muted">bonnes réponses</span>
      <p class="small" style="margin:.6rem 0 0">${wrongSet.size} question(s) à revoir enregistrée(s) sur cet appareil.</p>
      <div class="btns"><button class="btn small" type="button" data-a="again">Recommencer</button><button class="btn small ghost" type="button" data-a="home">Retour</button></div></div>`;
    root.querySelector('[data-a=again]').onclick = () => train(themes, n, ids && [...wrongSet]);
    root.querySelector('[data-a=home]').onclick = home;
  }
  show();
  window.scrollTo(0, root.offsetTop - 80);
}

function alertInline(msg) {
  let m = root.querySelector('.inline-msg');
  if (!m) {
    m = el('p', { class: 'inline-msg small', style: 'color:var(--signal)' });
    root.appendChild(m);
  }
  m.textContent = msg;
}

home();
