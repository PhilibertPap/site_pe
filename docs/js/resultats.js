// Suivi des QCM, réservé aux chefs : réussite par thème, questions les plus ratées, détail par scout.
import * as fb from './fb.js';
import { THEMES, QUESTIONS } from './qcm/index.js';
import { figure } from './qcm/figure.js';

const box = document.getElementById('resultats');
const ROOT = document.body.dataset.root || '../';
const BYID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pct = (a, n) => (n ? Math.round((100 * a) / n) : 0);
const day = (d) => (d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '');
const WEAK = 70; // en dessous de ce taux de réussite, un thème est signalé

const PERIODS = { 30: '30 derniers jours', 90: '3 derniers mois', 365: '12 derniers mois', 0: 'Depuis le début' };

let all = [];
let users = {};
let me = null;
// ?uid= (lien depuis la vue d'ensemble) : ouvre le détail de ce scout, sur toute la période
let ouvrir = new URLSearchParams(location.search).get('uid');

async function load(days) {
  box.querySelector('.res-body').innerHTML = '<p class="muted">Chargement…</p>';
  const since = +days ? new Date(Date.now() - days * 864e5) : null;
  try {
    const [rs, us] = await Promise.all([fb.listResults(since), fb.listUsers()]);
    all = rs;
    users = Object.fromEntries(us.map((u) => [u.uid, u]));
  } catch (err) {
    box.querySelector('.res-body').innerHTML = `<p>${esc(fb.message(err))}</p>`;
    return;
  }
  fillUnites();
  render();
}

function fillUnites() {
  const sel = box.querySelector('#f-unite');
  const cur = sel.value;
  const unites = [...new Set(all.map((r) => (users[r.uid] ? users[r.uid].unite : r.unite) || '').filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Toutes les unités</option>' + unites.map((u) => `<option${u === cur ? ' selected' : ''}>${esc(u)}</option>`).join('');
}

function filtered() {
  const unite = box.querySelector('#f-unite').value;
  const mode = box.querySelector('#f-mode').value;
  const chefs = box.querySelector('#f-chefs').checked;
  return all.filter((r) => {
    const u = users[r.uid];
    if (!chefs && u && u.role === 'chef') return false;
    if (unite && ((u ? u.unite : r.unite) || '') !== unite) return false;
    if (mode && r.mode !== mode) return false;
    return true;
  });
}

function addThemes(acc, r) {
  Object.entries(r.themes || {}).forEach(([t, [a, n]]) => {
    acc[t] = acc[t] || [0, 0];
    acc[t][0] += a;
    acc[t][1] += n;
  });
  return acc;
}

function bar(p) {
  return `<span class="bar"><span style="width:${p}%"${p < WEAK ? ' class="weak"' : ''}></span></span>`;
}

function render() {
  const rs = filtered();
  const body = box.querySelector('.res-body');
  if (!rs.length) {
    body.innerHTML = '<p class="muted">Aucun QCM enregistré pour ces critères. Les résultats apparaissent dès qu’un scout connecté termine une épreuve blanche ou un entraînement.</p>';
    return;
  }

  // par scout
  const by = {};
  rs.forEach((r) => (by[r.uid] = by[r.uid] || []).push(r));
  const scouts = Object.entries(by).map(([uid, list]) => {
    const u = users[uid] || {};
    const th = list.reduce(addThemes, {});
    const exams = list.filter((r) => r.mode === 'examen');
    const train = list.filter((r) => r.mode === 'entrainement');
    const tq = train.reduce((s, r) => s + r.total, 0);
    const ta = train.reduce((s, r) => s + r.score, 0);
    const weak = Object.entries(th)
      .filter(([, [a, n]]) => n >= 3 && pct(a, n) < WEAK)
      .sort((x, y) => x[1][0] / x[1][1] - y[1][0] / y[1][1])
      .map(([t]) => t)
      .slice(0, 3);
    return { uid, name: u.name || list[0].name, unite: (u.unite ?? list[0].unite) || '', list, th, exams, tq, ta, weak };
  });
  scouts.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  // par thème
  const th = rs.reduce(addThemes, {});
  const themeRows = Object.entries(th)
    .map(([t, [a, n]]) => ({ t, a, n, p: pct(a, n), below: scouts.filter((s) => s.th[t] && s.th[t][1] >= 3 && pct(...s.th[t]) < WEAK).length }))
    .sort((x, y) => x.p - y.p);

  // par question
  const qs = {};
  rs.forEach((r) => {
    (r.ok || []).forEach((id) => ((qs[id] = qs[id] || { ok: 0, ko: 0, who: new Set() }).ok++));
    (r.ko || []).forEach((id) => {
      qs[id] = qs[id] || { ok: 0, ko: 0, who: new Set() };
      qs[id].ko++;
      qs[id].who.add(r.uid);
    });
  });
  const missed = Object.entries(qs)
    .filter(([id, v]) => BYID[id] && v.ko > 0 && v.ok + v.ko >= 2)
    .map(([id, v]) => ({ q: BYID[id], ...v, n: v.ok + v.ko, p: pct(v.ko, v.ok + v.ko) }))
    .sort((x, y) => y.p - x.p || y.who.size - x.who.size || y.n - x.n)
    .slice(0, 15);

  const nExam = rs.filter((r) => r.mode === 'examen').length;
  const nAns = rs.reduce((s, r) => s + r.total, 0);

  body.innerHTML = `
  <p class="res-sum">${scouts.length} scout${scouts.length > 1 ? 's' : ''} · ${nExam} épreuve${nExam > 1 ? 's' : ''} blanche${nExam > 1 ? 's' : ''} · ${rs.length - nExam} entraînement${rs.length - nExam > 1 ? 's' : ''} · ${nAns} réponses</p>

  <h2 id="themes">Réussite par thème</h2>
  <p class="small muted">Du plus faible au plus solide. Un thème est signalé sous ${WEAK} % de bonnes réponses (au moins 3 questions répondues).</p>
  <div class="tbl-wrap"><table class="res-themes"><thead><tr><th>Thème</th><th>Réussite</th><th class="num">Réponses</th><th class="num">Scouts en difficulté</th></tr></thead><tbody>${themeRows
    .map((r) => `<tr><td>${THEMES[r.t] || r.t}</td><td>${bar(r.p)} ${r.p} %</td><td class="num">${r.n}</td><td class="num">${r.below || ''}</td></tr>`)
    .join('')}</tbody></table></div>

  <h2 id="questions">Questions les plus ratées</h2>
  ${missed.length ? `<p class="small muted">Questions posées au moins deux fois, classées par taux d’échec. De quoi choisir les points à reprendre en séance.</p>
  <ol class="res-missed">${missed
    .map(
      (m) => `<li>
      <p class="q-meta"><b>${m.p} % d’échec</b> (${m.ko} sur ${m.n}) · ${m.who.size} scout${m.who.size > 1 ? 's' : ''} · ${THEMES[m.q.t]}</p>
      <div class="q-text">${m.q.q}</div>
      <details><summary>Figure, réponse et explication</summary>
        ${m.q.fig ? `<div class="q-fig">${figure(m.q.fig)}</div>` : ''}
        <p><b>Bonne réponse :</b> ${m.q.c[m.q.a]}</p>
        <div class="expl">${m.q.e}${m.q.ref ? ` <a class="ref" href="${ROOT}${m.q.ref}">Section du cours</a>` : ''}</div>
      </details></li>`
    )
    .join('')}</ol>` : '<p class="muted">Pas encore assez de réponses.</p>'}

  <h2 id="scouts">Par scout</h2>
  <p class="small muted">Cliquer sur un nom pour le détail. Points faibles : les trois thèmes les plus bas sous ${WEAK} %.</p>
  <div class="tbl-wrap"><table class="res-scouts"><thead><tr><th>Nom</th><th>Unité</th><th class="num">Épreuves</th><th class="num">Dernière</th><th class="num">Meilleure</th><th class="num">Entraînement</th><th>Points faibles</th></tr></thead><tbody>${scouts
    .map(
      (s) => `<tr data-uid="${s.uid}" class="res-row">
      <td class="nowrap"><button type="button" class="linkish">${esc(s.name)}</button></td><td>${esc(s.unite)}</td>
      <td class="num">${s.exams.length || ''}</td>
      <td class="num">${s.exams.length ? `${s.exams[0].score}/${s.exams[0].total}` : ''}</td>
      <td class="num">${s.exams.length ? ((b) => `${b.score}/${b.total}`)(s.exams.reduce((x, y) => (y.score > x.score ? y : x))) : ''}</td>
      <td class="num">${s.tq ? `${pct(s.ta, s.tq)} % <span class="muted">(${s.tq})</span>` : ''}</td>
      <td>${s.weak.map((t) => `<span class="tag tag-open">${THEMES[t] || t}</span>`).join('') || (Object.keys(s.th).length ? '<span class="muted small">aucun</span>' : '')}</td></tr>`
    )
    .join('')}</tbody></table></div>`;

  body.querySelectorAll('.res-row button').forEach((b) => {
    b.onclick = () => {
      const tr = b.closest('tr');
      const next = tr.nextElementSibling;
      if (next && next.classList.contains('res-detail')) {
        next.remove();
        return;
      }
      const s = scouts.find((x) => x.uid === tr.dataset.uid);
      const d = document.createElement('tr');
      d.className = 'res-detail';
      d.innerHTML = `<td colspan="7">${detail(s)}</td>`;
      tr.after(d);
      wireDelete(d, s);
    };
  });
  if (ouvrir) {
    const b = body.querySelector(`.res-row[data-uid="${CSS.escape(ouvrir)}"] button`);
    ouvrir = null;
    if (b) {
      b.click();
      b.closest('tr').scrollIntoView({ block: 'start' });
    } else body.insertAdjacentHTML('afterbegin', '<p class="muted">Ce scout n’a encore enregistré aucun QCM.</p>');
  }
}

function detail(s) {
  const ko = {};
  s.list.forEach((r) => (r.ko || []).forEach((id) => (ko[id] = (ko[id] || 0) + 1)));
  const top = Object.entries(ko)
    .filter(([id]) => BYID[id])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const strip = (h) => h.replace(/<[^>]+>/g, '').slice(0, 140);
  return `<div class="res-grid">
    <div><h4>Par thème</h4><table><tbody>${Object.entries(THEMES)
      .filter(([t]) => s.th[t])
      .map(([t, v]) => {
        const p = pct(...s.th[t]);
        return `<tr><td>${v}</td><td>${bar(p)} ${p} %</td><td class="num muted">${s.th[t][1]}</td></tr>`;
      })
      .join('')}</tbody></table></div>
    <div><h4>Derniers QCM</h4><table><tbody>${s.list
      .slice(0, 10)
      .map((r) => `<tr><td>${day(r.at)}</td><td>${r.mode === 'examen' ? 'Épreuve blanche' : 'Entraînement'}</td><td class="num">${r.score}/${r.total}</td></tr>`)
      .join('')}</tbody></table></div>
  </div>
  ${top.length ? `<h4>Questions ratées le plus souvent</h4><ul class="small">${top.map(([id, n]) => `<li>${esc(strip(BYID[id].q))}${n > 1 ? ` <span class="muted">(${n} fois)</span>` : ''}</li>`).join('')}</ul>` : ''}
  <p class="small"><button type="button" class="linkish" data-a="del">Effacer les résultats de ${esc(s.name)} sur la période</button></p>`;
}

function wireDelete(d, s) {
  const b = d.querySelector('[data-a=del]');
  b.onclick = async () => {
    if (!b.dataset.confirm) {
      b.dataset.confirm = '1';
      b.textContent = `Confirmer : effacer ${s.list.length} QCM`;
      return;
    }
    b.disabled = true;
    try {
      await fb.deleteResults(s.list.map((r) => r.id));
      const ids = new Set(s.list.map((r) => r.id));
      all = all.filter((r) => !ids.has(r.id));
      render();
    } catch (err) {
      b.textContent = fb.message(err);
    }
  };
}

function start() {
  box.innerHTML = `
  <div class="res-tools">
    <select id="f-period" aria-label="Période">${Object.entries(PERIODS)
      .map(([k, v]) => `<option value="${k}"${k === (ouvrir ? '0' : '90') ? ' selected' : ''}>${v}</option>`)
      .join('')}</select>
    <select id="f-unite" aria-label="Unité"><option value="">Toutes les unités</option></select>
    <select id="f-mode" aria-label="Type"><option value="">Épreuves et entraînements</option><option value="examen">Épreuves blanches</option><option value="entrainement">Entraînements</option></select>
    <label class="small"><input type="checkbox" id="f-chefs"> inclure les chefs</label>
  </div>
  <div class="res-body"></div>`;
  box.querySelector('#f-period').onchange = (e) => load(e.target.value);
  ['#f-unite', '#f-mode', '#f-chefs'].forEach((s) => (box.querySelector(s).onchange = render));
  load(ouvrir ? 0 : 90);
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((u) => {
  me = u;
  if (!me || me.role !== 'chef') {
    box.innerHTML = '<p>Cette page est réservée aux chefs.</p>';
    return;
  }
  start();
});
