import { createHash } from 'node:crypto';
// Build du site : src/ -> docs/
// Aucune dépendance. Lancer avec : node build.mjs
//
// Chaque page de src/pages commence par un commentaire de métadonnées :
//   <!--meta {"title": "...", "part": "cours", "num": 3, "desc": "..."} -->
// Les pages de la partie "cours" sont numérotées automatiquement
// (sections, encadrés, figures) et reçoivent une table des matières.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as F from './src/js/figures.js';
import { etapesHTML } from './src/js/diplomes.js';
import { firebaseConfig } from './src/js/firebase-config.js';

// Accès réservé et questions-réponses : actifs dès que Firebase est configuré
const AUTH = !!firebaseConfig.apiKey;

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'docs');

// Affiche tout de suite le compte mémorisé, pour que la barre ne bouge pas au chargement.
// Même rendu que header() dans src/js/auth.js.
const INLINE_ACCT = `<script>
try {
  var pp = JSON.parse(localStorage.getItem('pe-profile') || 'null');
  if (pp && pp.approved && localStorage.getItem('pe-ok') === pp.uid) {
    var e = function (x) { return String(x || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var cur = function (d) { return location.pathname.indexOf('/' + d + '/') >= 0 ? ' aria-current="page"' : ''; };
    var dt = new Date(), sa = String(dt.getMonth() >= 8 ? dt.getFullYear() : dt.getFullYear() - 1);
    var h = '';
    if (pp.role === 'chef') {
      document.documentElement.classList.add('is-chef');
      var n = 0;
      try { var c = JSON.parse(sessionStorage.getItem('pe-afaire') || 'null'); if (c && c.uid === pp.uid) n = c.n; } catch (err) {}
      h = '<a class="acct-chefs" href="{{root}}chefs/index.html"' + cur('chefs') + '>Espace chefs' + (n ? '<span class="acct-n">' + (n > 99 ? '99+' : n) + '</span>' : '') + '</a>';
    } else if (pp.ce && typeof pp.ce[sa] === 'string' && pp.ce[sa]) {
      h = '<a class="acct-ce" href="{{root}}equipage/index.html"' + cur('equipage') + '>Mon équipage</a>';
    }
    document.getElementById('acct').innerHTML = h + '<a class="acct-name" href="{{root}}compte/index.html" title="Mon espace : ' + e(pp.name) + '"' + cur('compte') + '><span class="acct-lbl">Mon espace · </span>' + e(pp.name) + '</a>' +
      '<button type="button" class="linkish acct-out">Déconnexion</button>';
  }
} catch (err) {}
</script>`;

const PARTS = {
  cours: { label: 'Cours', href: 'cours/index.html' },
  qcm: { label: 'QCM', href: 'qcm/index.html' },
  exercices: { label: 'Exercices', href: 'exercices/index.html' },
  pratique: { label: 'Pratique', href: 'pratique/index.html' },
  cqcf: { label: 'CQ / CF', href: 'cqcf/index.html' },
  annales: { label: 'Annales', href: 'annales/index.html' },
};
// Parties sans place dans la barre de navigation
const HORS_NAV = { parcours: { label: 'Je prépare' } };
if (AUTH) {
  PARTS.questions = { label: 'Questions', href: 'questions/index.html' };
  PARTS.equipages = { label: 'Équipages', href: 'equipages/index.html' };
}

// Onglets de l'espace chefs (meta "chefs": clé de l'onglet courant). Sur le tableau de bord
// d'équipage, ouvert aussi aux chefs d'équipage, ils ne s'affichent que pour un chef (html.is-chef).
const CHEFS_TABS = [
  ['accueil', 'Accueil', 'chefs/index.html'],
  ['inscrits', 'Inscrits', 'chefs/inscrits.html'],
  ['equipages', 'Équipages', 'chefs/equipages.html'],
  ['resultats', 'Résultats', 'chefs/resultats.html'],
  ['tableaux', 'Tableaux de bord', 'equipage/index.html'],
  ['guide', 'Guide', 'chefs/guide.html'],
];
function chefsTabs(cur, root, seulementChefs) {
  return `<nav class="chefs-tabs${seulementChefs ? ' chefs-only' : ''}" aria-label="Espace chefs"><span class="chefs-tabs-h">Espace chefs</span>${CHEFS_TABS.map(
    ([k, l, h]) => `<a href="${root}${h}"${k === cur ? ' aria-current="page"' : ''}>${l}</a>`
  ).join('')}</nav>`;
}

const BOX_LABELS = {
  def: 'Définition',
  prop: 'Règle',
  meth: 'Méthode',
  ex: 'Exemple',
  warn: 'Attention',
  retenir: 'À retenir',
  scout: 'Scoutisme marin',
  maj: 'Mise à jour',
  rem: 'Remarque',
};
const NUMBERED_BOXES = new Set(['def', 'prop', 'meth', 'ex']);

// ---------------------------------------------------------------- utils

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

function slug(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function attrs(str) {
  const o = {};
  str.replace(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g, (_, k, v) => {
    o[k] = v;
  });
  return o;
}

// ---------------------------------------------------------- shortcodes
// <x-balise type="cardinale-n" />, <x-marques seq="boule,bicone" />, etc.

function expandShortcodes(html) {
  return html.replace(/<x-([a-z]+)([^>]*?)\/>/g, (m, name, a) => {
    const at = attrs(a);
    switch (name) {
      case 'balise':
        return F.balise(at.type, at);
      case 'marques':
        return F.marques(at.seq.split(','), at);
      case 'nuit':
        return F.nuit(at.preset, at);
      case 'pavillon':
        return F.pavillon(at.code, at);
      case 'port':
        return F.port(at.seq.split(','), at);
      case 'feu':
        return F.feuHTML(at);
      case 'son':
        return F.sonHTML(at);
      default:
        throw new Error('Shortcode inconnu : ' + m);
    }
  });
}

// ---------------------------------------------------------- typographie
// Espaces insécables : avant ; : ! ? », après «, dans les nombres (25 000),
// entre un nombre et son unité. Ne touche pas le contenu des balises
// svg, script, style, code.

function typo(html) {
  const parts = html.split(/(<[^>]+>)/);
  let skip = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.startsWith('<')) {
      const m = p.match(/^<\/?(svg|script|style|code|pre|textarea)\b/i);
      if (m) skip += p.startsWith('</') ? -1 : p.endsWith('/>') ? 0 : 1;
      continue;
    }
    if (skip > 0 || !p.trim()) continue;
    parts[i] = p
      .replace(/\b(1) : (\d)/g, '$1\u202f:\u202f$2')
      .replace(/ ([;:!?»])/g, '\u202f$1')
      .replace(/« /g, '«\u202f')
      .replace(/(\d) (\d{3})(?!\d)/g, '$1\u00a0$2')
      .replace(/(\d) (\d{3})(?!\d)/g, '$1\u00a0$2')
      .replace(/(\d) (m|cm|km|M|nd|h|min|s|hPa|N|W|kg|mm|°|%|kW)(?=[\s,.;:)]|$)/g, '$1\u00a0$2')
      .replace(/(\d) (milles?|nœuds?|heures?|minutes?|mètres?)/g, '$1\u00a0$2');
  }
  return parts.join('');
}

// ----------------------------------------------------------- numbering

function numberChapter(html, num) {
  const toc = [];
  let h2 = 0;
  let h3 = 0;
  let box = 0;
  let fig = 0;
  const used = new Set();
  const uid = (s) => {
    let id = s || 'sec';
    let k = 2;
    while (used.has(id)) id = `${s}-${k++}`;
    used.add(id);
    return id;
  };

  html = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (m, lvl, a, inner) => {
    const at = attrs(a);
    const id = uid(at.id || slug(inner));
    let n;
    if (lvl === '2') {
      h2++;
      h3 = 0;
      n = `${num}.${h2}`;
    } else {
      h3++;
      n = `${num}.${h2}.${h3}`;
    }
    toc.push({ lvl: +lvl, id, n, text: stripTags(inner) });
    return `<h${lvl} id="${id}"><span class="secnum">${n}</span>${inner}</h${lvl}>`;
  });

  html = html.replace(/<div class="box ([a-z]+)"([^>]*)>/g, (m, type, a) => {
    const at = attrs(a);
    let label = BOX_LABELS[type] || type;
    if (NUMBERED_BOXES.has(type)) {
      box++;
      label += ` ${num}.${box}`;
    }
    const title = at['data-title'] ? ` <span class="box-title">(${at['data-title']})</span>` : '';
    const id = at.id ? ` id="${at.id}"` : '';
    return `<div class="box ${type}"${id}><p class="box-label">${label}${title}.</p>`;
  });

  html = html.replace(/<figcaption>/g, () => {
    fig++;
    return `<figcaption><span class="fignum">Figure ${num}.${fig}.</span> `;
  });

  return { html, toc };
}

function boxesOnly(html) {
  // Encadrés non numérotés pour les autres parties
  return html.replace(/<div class="box ([a-z]+)"([^>]*)>/g, (m, type, a) => {
    const at = attrs(a);
    const label = BOX_LABELS[type] || type;
    const title = at['data-title'] ? ` <span class="box-title">(${at['data-title']})</span>` : '';
    const id = at.id ? ` id="${at.id}"` : '';
    return `<div class="box ${type}"${id}><p class="box-label">${label}${title}.</p>`;
  });
}

function sectionIds(html) {
  const toc = [];
  const used = new Set();
  html = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, a, inner) => {
    const at = attrs(a);
    let id = at.id || slug(inner);
    while (used.has(id)) id += '-b';
    used.add(id);
    toc.push({ lvl: 2, id, text: stripTags(inner) });
    const rest = a.replace(/\s*id="[^"]*"/, '');
    return `<h2 id="${id}"${rest}>${inner}</h2>`;
  });
  return { html, toc };
}

// --------------------------------------------------------------- pages

const layout = fs.readFileSync(path.join(SRC, 'layout.html'), 'utf8');
const pagesDir = path.join(SRC, 'pages');
const files = walk(pagesDir).filter((f) => f.endsWith('.html'));

const pages = files
  .filter((file) => AUTH || !/[\\/](questions|chefs|equipages|equipage|carnet|compte)[\\/]/.test(file))
  .map((file) => {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error('Métadonnées manquantes : ' + file);
  const meta = JSON.parse(m[1]);
  const rel = path.relative(pagesDir, file).split(path.sep).join('/');
  return { file, rel, meta, body: raw.slice(m[0].length) };
});

// Chapitres de cours, dans l'ordre
const chapters = pages
  .filter((p) => p.meta.part === 'cours' && p.meta.num)
  .sort((a, b) => a.meta.num - b.meta.num);

const pratiques = pages
  .filter((p) => p.meta.part === 'pratique' && p.meta.order)
  .sort((a, b) => a.meta.order - b.meta.order);

const exos = pages
  .filter((p) => p.meta.part === 'exercices' && p.meta.order)
  .sort((a, b) => a.meta.order - b.meta.order);

const cqcf = pages
  .filter((p) => p.meta.part === 'cqcf' && p.meta.order)
  .sort((a, b) => a.meta.order - b.meta.order);

// Parcours par diplôme (PE, CQ, CF) : pages publiques, hors de la barre de navigation
const parcours = pages
  .filter((p) => p.meta.part === 'parcours' && p.meta.order)
  .sort((a, b) => a.meta.order - b.meta.order);

// Tableau des annales, construit d'après les noms de fichiers de docs/fichiers/annales :
// épreuve-année[-session]-type.ext (épreuve : qcm, carto, maree ; type : sujet, corrige)
function annalesHTML(root) {
  const dir = path.join(OUT, 'fichiers', 'annales');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const RE = /^(qcm|carto|maree)-(\d{4})(?:-([a-z]+))?-(sujet|corrige)\.([a-z0-9]+)$/;
  const rows = {};
  for (const f of files) {
    const m = f.match(RE);
    if (!m) continue;
    const [, ep, an, ses, type, ext] = m;
    const key = an + (ses ? '-' + ses : '');
    rows[key] = rows[key] || { an, ses, qcm: {}, carto: {}, maree: {} };
    rows[key][ep][type] = { f, ext };
  }
  const keys = Object.keys(rows).sort((a, b) => b.localeCompare(a));
  if (!keys.length) return '<p class="vide">Aucune annale pour l’instant. Les chefs les ajoutent en déposant les PDF dans le dossier <code>docs/fichiers/annales</code> du dépôt GitHub (voir le README).</p>';
  const cell = (c) => {
    const parts = ['sujet', 'corrige']
      .filter((t) => c[t])
      .map((t) => `<a href="${root}fichiers/annales/${c[t].f}">${t === 'sujet' ? 'sujet' : 'corrigé'}</a>${c[t].ext !== 'pdf' ? ` <span class="muted small">(${c[t].ext})</span>` : ''}`);
    return parts.length ? parts.join(' · ') : '<span class="muted">—</span>';
  };
  return `<div class="tbl-wrap"><table>
<thead><tr><th>Session</th><th>QCM</th><th>Navigation sur carte</th><th>Marée</th></tr></thead>
<tbody>${keys
    .map((k) => {
      const r = rows[k];
      return `<tr><td><strong>${r.an}</strong>${r.ses ? ` <span class="muted">(${r.ses})</span>` : ''}</td><td>${cell(r.qcm)}</td><td>${cell(r.carto)}</td><td>${cell(r.maree)}</td></tr>`;
    })
    .join('')}</tbody></table></div>`;
}

function rootOf(rel) {
  const depth = rel.split('/').length - 1;
  return depth === 0 ? '' : '../'.repeat(depth);
}

function navHTML(root, part) {
  return Object.entries(PARTS)
    .map(([k, v]) => {
      const cur = k === part ? ' aria-current="page"' : '';
      return `<a href="${root}${v.href}"${cur}>${v.label}</a>`;
    })
    .join('');
}

function tocHTML(toc) {
  let s = '<ol class="toc">';
  let open3 = false;
  for (const t of toc) {
    if (t.lvl === 2) {
      if (open3) {
        s += '</ol></li>';
        open3 = false;
      } else if (s.endsWith('</a>')) s += '</li>';
      s += `<li><a href="#${t.id}">${t.n ? `<span class="tocnum">${t.n}</span>` : ''}${t.text}</a>`;
    } else {
      if (!open3) {
        s += '<ol>';
        open3 = true;
      }
      s += `<li><a href="#${t.id}"><span class="tocnum">${t.n}</span>${t.text}</a></li>`;
    }
  }
  if (open3) s += '</ol></li>';
  else if (s.endsWith('</a>')) s += '</li>';
  return s + '</ol>';
}

function seriesNav(list, page, root, label) {
  const i = list.indexOf(page);
  if (i < 0) return '';
  const prev = list[i - 1];
  const next = list[i + 1];
  const href = (p) => root + p.rel;
  const name = (p) => (p.meta.num ? `${label} ${p.meta.num} · ` : '') + p.meta.title;
  return `<nav class="pager">${
    prev ? `<a class="prev" href="${href(prev)}"><span>Précédent</span>${name(prev)}</a>` : '<span></span>'
  }${next ? `<a class="next" href="${href(next)}"><span>Suivant</span>${name(next)}</a>` : '<span></span>'}</nav>`;
}

function sideList(list, page, root, label) {
  return (
    '<ol class="chapters">' +
    list
      .map((p) => {
        const cur = p === page ? ' aria-current="page"' : '';
        const n = p.meta.num ? `<span class="tocnum">${p.meta.num}</span>` : '';
        return `<li><a href="${root}${p.rel}"${cur}>${n}${p.meta.short || p.meta.title}</a></li>`;
      })
      .join('') +
    '</ol>'
  );
}

// On vide docs/ sauf docs/fichiers (annales et documents, non générés)
fs.mkdirSync(OUT, { recursive: true });
for (const e of fs.readdirSync(OUT)) {
  if (e === 'fichiers') continue;
  fs.rmSync(path.join(OUT, e), { recursive: true, force: true });
}

for (const page of pages) {
  const { meta, rel } = page;
  const root = rootOf(rel);
  // blocs réservés aux sites avec comptes : retirés avant la table des matières (ancres)
  let body = typo(expandShortcodes(page.body)).replace(/<!--IF_AUTH-->([\s\S]*?)<!--END_IF_AUTH-->/g, (m, inner) => (AUTH ? inner : ''));
  let toc = [];
  let main;

  if (meta.part === 'cours' && meta.num) {
    const r = numberChapter(body, meta.num);
    body = r.html;
    toc = r.toc;
    main = `
<div class="doc">
  <aside class="side">
    <p class="side-h">Cours</p>
    ${sideList(chapters, page, root, 'Chapitre')}
  </aside>
  <article class="chapter">
    <header class="chap-head">
      <p class="kicker">Chapitre ${meta.num}</p>
      <h1>${meta.title}</h1>
      ${meta.desc ? `<p class="chap-desc">${meta.desc}</p>` : ''}
    </header>
    <details class="toc-box" open><summary>Sommaire du chapitre</summary>${tocHTML(toc)}</details>
    ${body}
    ${seriesNav(chapters, page, root, 'Chapitre')}
  </article>
</div>`;
  } else if (['pratique', 'exercices', 'cqcf', 'parcours'].includes(meta.part) && meta.order) {
    const list = { pratique: pratiques, exercices: exos, cqcf, parcours }[meta.part];
    const label = (PARTS[meta.part] || HORS_NAV[meta.part]).label;
    body = boxesOnly(body);
    const r = sectionIds(body);
    body = r.html;
    toc = r.toc;
    main = `
<div class="doc">
  <aside class="side">
    <p class="side-h">${label}</p>
    ${sideList(list, page, root, '')}
  </aside>
  <article class="chapter">
    <header class="chap-head">
      <p class="kicker">${label}</p>
      <h1>${meta.title}</h1>
      ${meta.desc ? `<p class="chap-desc">${meta.desc}</p>` : ''}
    </header>
    ${toc.length > 2 ? `<details class="toc-box"><summary>Sur cette page</summary>${tocHTML(toc)}</details>` : ''}
    ${body}
    ${seriesNav(list, page, root, '')}
  </article>
</div>`;
  } else {
    body = boxesOnly(body);
    const tabs = meta.chefs ? chefsTabs(meta.chefs, root, meta.part !== 'chefs') : '';
    main = `<div class="page${meta.wide ? ' wide' : ''}${meta.part === 'home' ? ' home' : ''}">${tabs}${body}</div>`;
  }

  // Listes automatiques
  main = main
    .replace('<!--CHAPTERS-->', () =>
      '<ol class="index-list">' +
      chapters
        .map(
          (p) =>
            `<li><a href="${root}${p.rel}"><span class="idx-num">${p.meta.num}</span><span class="idx-t">${p.meta.title}</span><span class="idx-d">${p.meta.desc || ''}</span></a></li>`
        )
        .join('') +
      '</ol>'
    )
    .replace('<!--PRATIQUE-->', () =>
      '<ol class="index-list">' +
      pratiques
        .map(
          (p, i) =>
            `<li><a href="${root}${p.rel}"><span class="idx-num">${String.fromCharCode(65 + i)}</span><span class="idx-t">${p.meta.title}</span><span class="idx-d">${p.meta.desc || ''}</span></a></li>`
        )
        .join('') +
      '</ol>'
    )
    .replace('<!--CQCF-->', () =>
      '<ol class="index-list">' +
      cqcf
        .map(
          (p, i) =>
            `<li><a href="${root}${p.rel}"><span class="idx-num">${i + 1}</span><span class="idx-t">${p.meta.title}</span><span class="idx-d">${p.meta.desc || ''}</span></a></li>`
        )
        .join('') +
      '</ol>'
    )
    .replace('<!--ANNALES-->', () => annalesHTML(root))
    .replace(/<!--ETAPES:(PE|CQ|CF)-->/g, (m, obj) => typo(etapesHTML(obj, root)))
    .replace('<!--EXERCICES-->', () =>
      '<ol class="index-list">' +
      exos
        .map(
          (p, i) =>
            `<li><a href="${root}${p.rel}"><span class="idx-num">${i + 1}</span><span class="idx-t">${p.meta.title}</span><span class="idx-d">${p.meta.desc || ''}</span></a></li>`
        )
        .join('') +
      '</ol>'
    );

  const title = meta.part === 'home' ? meta.title : `${meta.title} · Patron d'embarcation`;
  const scripts = (meta.scripts || [])
    .map((s) => `<script type="module" src="${root}js/${s}"></script>`)
    .join('\n');

  main = main.replace(/<!--IF_AUTH-->([\s\S]*?)<!--END_IF_AUTH-->/g, (m, inner) => (AUTH ? inner : ''));

  let html = layout
    .replaceAll('{{title}}', title)
    .replaceAll('{{desc}}', (meta.desc || '').replace(/"/g, '&quot;').replace(/<[^>]+>/g, ''))
    .replaceAll('{{root}}', root)
    .replace('{{nav}}', navHTML(root, meta.part))
    .replace('{{main}}', main)
    .replace('{{scripts}}', scripts)
    .replace('{{gatehead}}', AUTH ? "  try { if (!localStorage.getItem('pe-ok')) document.documentElement.classList.add('gate'); } catch (e) { document.documentElement.classList.add('gate'); }\n" : '')
    .replace('{{acctinline}}', AUTH ? INLINE_ACCT : '')
    .replace('{{authscript}}', AUTH ? `<script type="module" src="${root}js/auth.js"></script>` : '');
  html = html.replaceAll('{{root}}', root);

  const out = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

// --------------------------------------------------------------- assets

copyDir(path.join(SRC, 'css'), path.join(OUT, 'css'));
copyDir(path.join(SRC, 'js'), path.join(OUT, 'js'));
copyDir(path.join(SRC, 'img'), path.join(OUT, 'img'));
copyDir(path.join(SRC, 'files'), path.join(OUT, 'files'));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

// ------------------------------------------- application installable (PWA)

fs.writeFileSync(
  path.join(OUT, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: "Patron d'embarcation",
      short_name: "Patron d'emb.",
      description: 'Cours de navigation, QCM, exercices et pratique de la voile pour les scouts marins.',
      lang: 'fr',
      start_url: './index.html',
      scope: './',
      display: 'standalone',
      background_color: '#f5f1e6',
      theme_color: '#11304d',
      icons: [
        { src: 'img/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: 'img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        { src: 'img/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2
  )
);

// Service worker : tout le site (sauf les PDF d'annales) est mis en cache à l'installation,
// pour fonctionner sans réseau. La version change à chaque build : l'ancien cache est remplacé.
function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'fichiers' ? [] : listFiles(f, base);
    return [path.relative(base, f).split(path.sep).join('/')];
  });
}
const precache = listFiles(OUT).filter((f) => !f.startsWith('.') && !f.endsWith('.webmanifest') && f !== 'sw.js');
const version = createHash('sha1')
  .update(precache.map((f) => f + fs.readFileSync(path.join(OUT, f)).length + ':' + createHash('sha1').update(fs.readFileSync(path.join(OUT, f))).digest('hex')).join('|'))
  .digest('hex')
  .slice(0, 10);
fs.writeFileSync(
  path.join(OUT, 'sw.js'),
  fs.readFileSync(path.join(SRC, 'sw.js'), 'utf8').replace('__VERSION__', version).replace('__FILES__', JSON.stringify(precache))
);

console.log(`${pages.length} pages générées dans docs/`);
