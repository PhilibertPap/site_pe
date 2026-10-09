// Dessins vectoriels partagés : balises, marques de jour, feux de navires,
// pavillons, signaux de port. Utilisé au build (Node) et dans le navigateur.
// Chaque fonction renvoie une chaîne SVG.

const C = {
  R: '#cf3a2e',
  G: '#1f8a4c',
  Y: '#f0c22b',
  K: '#1e1e1e',
  W: '#f8f7f2',
  Bu: '#2a62a8',
  sky: '#e3e9ee',
  sea: '#a9bdcb',
  sea2: '#93abbb',
  float: '#4a4f55',
  line: '#1e1e1e',
};

const NIGHT = {
  W: '#fff6d8',
  R: '#ff4b3a',
  G: '#3fe08a',
  Y: '#ffd338',
  Bu: '#5aa8ff',
};

let uid = 0;
const nid = (p) => `${p}${++uid}`;

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

// ---------------------------------------------------------------- balises

// Description des marques du système AISM, région A
const MARKS = {
  babord: { shape: 'can', bands: ['R'], top: 'cyl', topC: 'R', name: 'Marque latérale bâbord' },
  tribord: { shape: 'cone', bands: ['G'], top: 'cone', topC: 'G', name: 'Marque latérale tribord' },
  'chenal-pref-tribord': {
    shape: 'can',
    bands: ['R', 'G', 'R'],
    top: 'cyl',
    topC: 'R',
    name: 'Bifurcation, chenal préféré à tribord',
  },
  'chenal-pref-babord': {
    shape: 'cone',
    bands: ['G', 'R', 'G'],
    top: 'cone',
    topC: 'G',
    name: 'Bifurcation, chenal préféré à bâbord',
  },
  'cardinale-n': { shape: 'pillar', bands: ['K', 'Y'], top: 'NN', name: 'Cardinale Nord' },
  'cardinale-e': { shape: 'pillar', bands: ['K', 'Y', 'K'], top: 'EE', name: 'Cardinale Est' },
  'cardinale-s': { shape: 'pillar', bands: ['Y', 'K'], top: 'SS', name: 'Cardinale Sud' },
  'cardinale-w': { shape: 'pillar', bands: ['Y', 'K', 'Y'], top: 'WW', name: 'Cardinale Ouest' },
  'danger-isole': { shape: 'pillar', bands: ['K', 'R', 'K'], top: 'balls2', name: 'Danger isolé' },
  'eaux-saines': { shape: 'pillar', vstripes: ['R', 'W'], top: 'ball', topC: 'R', name: 'Eaux saines' },
  speciale: { shape: 'pillar', bands: ['Y'], top: 'x', topC: 'Y', name: 'Marque spéciale' },
  'danger-nouveau': {
    shape: 'pillar',
    vstripes: ['Bu', 'Y'],
    top: 'plus',
    topC: 'Y',
    name: 'Danger nouveau (bouée d’urgence d’épave)',
  },
  'plage-babord': { shape: 'can', bands: ['Y'], top: 'cyl', topC: 'R', name: 'Chenal traversier, côté bâbord' },
  'plage-tribord': { shape: 'cone', bands: ['Y'], top: 'cone', topC: 'G', name: 'Chenal traversier, côté tribord' },
  'plage-limite': { shape: 'sphere', bands: ['Y'], top: null, name: 'Limite de zone (bande des 300 m, baignade)' },
};

export const MARK_NAMES = Object.fromEntries(Object.entries(MARKS).map(([k, v]) => [k, v.name]));

function topmark(kind, col, x) {
  // Voyant dessiné dans la bande y = 6..44 du dessin.
  const k = C.K;
  const s = `stroke="${C.line}" stroke-width="1"`;
  const cone = (cx, cy, up, fill) => {
    const h = 14;
    const w = 10;
    return up
      ? `<path d="M${cx} ${cy - h / 2} L${cx + w} ${cy + h / 2} L${cx - w} ${cy + h / 2} Z" fill="${fill}" ${s}/>`
      : `<path d="M${cx} ${cy + h / 2} L${cx + w} ${cy - h / 2} L${cx - w} ${cy - h / 2} Z" fill="${fill}" ${s}/>`;
  };
  switch (kind) {
    case 'cyl':
      return `<rect x="${x - 9}" y="14" width="18" height="20" fill="${C[col]}" ${s}/>`;
    case 'cone':
      return cone(x, 24, true, C[col]);
    case 'NN':
      return cone(x, 16, true, k) + cone(x, 34, true, k);
    case 'SS':
      return cone(x, 16, false, k) + cone(x, 34, false, k);
    case 'EE':
      return cone(x, 16, true, k) + cone(x, 32, false, k);
    case 'WW':
      return cone(x, 17, false, k) + cone(x, 33, true, k);
    case 'balls2':
      return `<circle cx="${x}" cy="16" r="7.5" fill="${k}"/><circle cx="${x}" cy="33" r="7.5" fill="${k}"/>`;
    case 'ball':
      return `<circle cx="${x}" cy="24" r="8.5" fill="${C[col]}" ${s}/>`;
    case 'x':
      return `<g stroke="${C.line}" stroke-width="6"><path d="M${x - 9} 14 L${x + 9} 34 M${x + 9} 14 L${x - 9} 34"/></g><g stroke="${C[col]}" stroke-width="4"><path d="M${x - 8.4} 14.7 L${x + 8.4} 33.3 M${x + 8.4} 14.7 L${x - 8.4} 33.3"/></g>`;
    case 'plus':
      return `<g stroke="${C.line}" stroke-width="6"><path d="M${x} 12 V36 M${x - 11} 24 H${x + 11}"/></g><g stroke="${C[col]}" stroke-width="4"><path d="M${x} 12.8 V35.2 M${x - 10.2} 24 H${x + 10.2}"/></g>`;
    default:
      return '';
  }
}

/**
 * Dessine une marque de balisage.
 * @param {string} type clé de MARKS
 * @param {object} o  { w: largeur px, notop: bool, aria }
 */
export function balise(type, o = {}) {
  const m = MARKS[type];
  if (!m) throw new Error('Balise inconnue : ' + type);
  const VH = 165;
  const w = +(o.w || 92);
  const h = Math.round((w * VH) / 100);
  const id = nid('b');
  const cx = 50;
  const water = 141;
  let body = '';
  let clip = '';
  let yTopBody;

  if (m.shape === 'pillar') {
    yTopBody = 74;
    clip = `M${cx - 13} ${yTopBody} L${cx + 13} ${yTopBody} L${cx + 19} 131 L${cx - 19} 131 Z`;
    body += `<rect x="${cx - 28}" y="129" width="56" height="16" fill="${C.float}"/>`;
  } else if (m.shape === 'can') {
    yTopBody = 80;
    clip = `M${cx - 19} ${yTopBody} H${cx + 19} V${water} H${cx - 19} Z`;
  } else if (m.shape === 'cone') {
    yTopBody = 72;
    clip = `M${cx - 6} ${yTopBody} H${cx + 6} L${cx + 23} ${water} H${cx - 23} Z`;
  } else if (m.shape === 'sphere') {
    yTopBody = 105;
    clip = `M${cx - 22} 127 A22 22 0 1 1 ${cx + 22} 127 L${cx + 22} ${water} L${cx - 22} ${water} Z`;
  }
  const yBot = m.shape === 'pillar' ? 131 : water;

  let fills = '';
  const bodyH = yBot - yTopBody;
  if (m.bands) {
    const n = m.bands.length;
    let ys;
    if (n === 1) ys = [[yTopBody, yBot]];
    else if (n === 2) ys = [[yTopBody, yTopBody + bodyH / 2], [yTopBody + bodyH / 2, yBot]];
    else {
      const a = yTopBody + bodyH * 0.32;
      const b = yTopBody + bodyH * 0.66;
      ys = [[yTopBody, a], [a, b], [b, yBot]];
    }
    m.bands.forEach((c, i) => {
      fills += `<rect x="0" y="${ys[i][0]}" width="100" height="${ys[i][1] - ys[i][0] + 0.5}" fill="${C[c]}"/>`;
    });
  } else if (m.vstripes) {
    const sw = 6.5;
    for (let x = cx - 26, i = 0; x < cx + 26; x += sw, i++) {
      fills += `<rect x="${x}" y="${yTopBody}" width="${sw + 0.3}" height="${bodyH}" fill="${C[m.vstripes[i % 2]]}"/>`;
    }
  }

  const hasTop = m.top && !o.notop;
  const mast = hasTop ? `<line x1="${cx}" y1="22" x2="${cx}" y2="${yTopBody}" stroke="${C.line}" stroke-width="2"/>` : '';
  const tm = hasTop ? topmark(m.top, m.topC, cx) : '';

  return `<svg class="balise" viewBox="0 0 100 ${VH}" width="${w}" height="${h}" role="img" aria-label="${esc(
    o.aria || m.name
  )}" xmlns="http://www.w3.org/2000/svg"><title>${esc(o.aria || m.name)}</title>
<defs><clipPath id="${id}"><path d="${clip}"/></clipPath></defs>
<rect width="100" height="${VH}" fill="${C.sky}"/>
<rect y="${water}" width="100" height="${VH - water}" fill="${C.sea}"/>
${body}
<g clip-path="url(#${id})">${fills}</g>
<path d="${clip}" fill="none" stroke="${C.line}" stroke-width="1.2"/>
${mast}${tm}
<path d="M0 ${water + 1} q8 -3 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="${C.sea2}" stroke-width="2"/>
</svg>`;
}

// Petit symbole de balise tel qu'il apparaît sur la carte SHOM (simplifié)
export function baliseCarte(type, o = {}) {
  return balise(type, { ...o, w: o.w || 46 });
}

// --------------------------------------------------- marques de jour (navires)

/**
 * Marques de jour hissées dans la mâture, de haut en bas.
 * seq : boule | cylindre | cone-haut | cone-bas | losange | sablier
 */
export function marques(seq, o = {}) {
  const w = +(o.w || 70);
  const gap = 8;
  const size = 22;
  const n = seq.length;
  const H = 30 + n * size + (n - 1) * gap + 30;
  const cx = 35;
  let y = 30;
  let g = '';
  for (const s0 of seq) {
    const s = s0.trim();
    const cy = y + size / 2;
    switch (s) {
      case 'boule':
        g += `<circle cx="${cx}" cy="${cy}" r="${size / 2}" class="fill-ink"/>`;
        break;
      case 'cylindre':
        g += `<rect x="${cx - 7}" y="${y}" width="14" height="${size}" class="fill-ink"/>`;
        break;
      case 'cone-haut':
        g += `<path d="M${cx} ${y} L${cx + 11} ${y + size} L${cx - 11} ${y + size} Z" class="fill-ink"/>`;
        break;
      case 'cone-bas':
        g += `<path d="M${cx} ${y + size} L${cx + 11} ${y} L${cx - 11} ${y} Z" class="fill-ink"/>`;
        break;
      case 'losange':
        g += `<path d="M${cx} ${y} L${cx + 11} ${cy} L${cx} ${y + size} L${cx - 11} ${cy} Z" class="fill-ink"/>`;
        break;
      case 'sablier':
        g += `<path d="M${cx - 11} ${y} L${cx + 11} ${y} L${cx} ${cy} Z M${cx} ${cy} L${cx + 11} ${y + size} L${cx - 11} ${y + size} Z" class="fill-ink"/>`;
        break;
      default:
        throw new Error('Marque inconnue : ' + s);
    }
    y += size + gap;
  }
  const h = Math.round((w * H) / 70);
  return `<svg class="marques" viewBox="0 0 70 ${H}" width="${w}" height="${h}" role="img" aria-label="${esc(
    o.aria || 'Marques : ' + seq.join(', ')
  )}" xmlns="http://www.w3.org/2000/svg">
<line x1="${cx}" y1="4" x2="${cx}" y2="${H - 4}" class="ln2" stroke-width="1.5"/>
<line x1="${cx}" y1="18" x2="${cx}" y2="${H - 22}" class="ln" stroke-width="1"/>
${g}
</svg>`;
}

// ------------------------------------------------------ feux de navires

// Positions dans un cadre 200 x 120. Chaque feu : [x, y, couleur]
const NIGHT_PRESETS = {
  // Navire à moteur < 50 m vu de face : feu de mât + deux feux de côté
  'moteur-face': [[100, 38, 'W'], [88, 84, 'G'], [112, 84, 'R']],
  // > 50 m, de face : deux feux de mât, l'arrière plus haut
  'moteur50-face': [[100, 52, 'W'], [101, 28, 'W'], [88, 86, 'G'], [112, 86, 'R']],
  // vu par son travers tribord : je vois son feu vert, il va vers ma droite
  // (l'avant est à droite ; au-delà de 50 m, le feu de mât avant est le plus bas)
  'moteur-tribord': [[120, 40, 'W'], [100, 84, 'G']],
  'moteur50-tribord': [[138, 50, 'W'], [72, 28, 'W'], [108, 86, 'G']],
  // vu par son travers bâbord : feu rouge, il va vers ma gauche
  'moteur-babord': [[80, 40, 'W'], [100, 84, 'R']],
  'moteur50-babord': [[62, 50, 'W'], [128, 28, 'W'], [92, 86, 'R']],
  arriere: [[100, 76, 'W']],
  // voilier faisant route, vu de face
  'voilier-face': [[90, 84, 'G'], [110, 84, 'R']],
  'voilier-tricolore-face': [[97, 24, 'G'], [103, 24, 'R']],
  'voilier-tribord': [[100, 84, 'G']],
  'voilier-babord': [[100, 84, 'R']],
  // voilier pouvant porter en plus deux feux 360° rouge sur vert
  'voilier-rv-face': [[100, 22, 'R'], [100, 38, 'G'], [90, 84, 'G'], [110, 84, 'R']],
  // petit navire < 7 m et < 7 nd : un feu blanc visible sur tout l'horizon
  petit: [[100, 60, 'W']],
  mouillage: [[100, 50, 'W']],
  'mouillage50': [[70, 44, 'W'], [134, 62, 'W']],
  // navire non maître de sa manœuvre, sans erre
  nuc: [[100, 34, 'R'], [100, 56, 'R']],
  // NUC faisant route, vu de face
  'nuc-face': [[100, 30, 'R'], [100, 50, 'R'], [88, 86, 'G'], [112, 86, 'R']],
  // échoué (< 50 m) : deux rouges superposés + feu de mouillage
  echoue: [[100, 34, 'R'], [100, 56, 'R'], [146, 62, 'W']],
  // handicapé par son tirant d'eau, vu de face
  'tirant-eau': [[100, 22, 'R'], [100, 38, 'R'], [100, 54, 'R'], [120, 34, 'W'], [88, 88, 'G'], [112, 88, 'R']],
  // capacité de manœuvre restreinte, faisant route, de face
  'ram-face': [[100, 22, 'R'], [100, 38, 'W'], [100, 54, 'R'], [120, 34, 'W'], [88, 88, 'G'], [112, 88, 'R']],
  ram: [[100, 30, 'R'], [100, 46, 'W'], [100, 62, 'R']],
  // chalutier en pêche, sans erre
  chalutier: [[100, 36, 'G'], [100, 56, 'W']],
  'chalutier-face': [[100, 30, 'G'], [100, 48, 'W'], [88, 86, 'G'], [112, 86, 'R']],
  peche: [[100, 36, 'R'], [100, 56, 'W']],
  'peche-face': [[100, 30, 'R'], [100, 48, 'W'], [88, 86, 'G'], [112, 86, 'R']],
  pilote: [[100, 36, 'W'], [100, 56, 'R']],
  'pilote-face': [[100, 30, 'W'], [100, 48, 'R'], [88, 86, 'G'], [112, 86, 'R']],
  // remorqueur (remorque < 200 m), de face : deux feux de mât superposés
  'remorqueur-face': [[100, 24, 'W'], [100, 42, 'W'], [88, 86, 'G'], [112, 86, 'R']],
  'remorqueur200-face': [[100, 18, 'W'], [100, 34, 'W'], [100, 50, 'W'], [88, 86, 'G'], [112, 86, 'R']],
  // remorqueur vu de l'arrière : feu de poupe + feu de remorquage jaune au-dessus
  'remorqueur-arriere': [[100, 62, 'Y'], [100, 78, 'W']],
  // dragueur de mines : 3 feux verts en triangle + feux de route
  'deminage-face': [[100, 20, 'W'], [100, 36, 'G'], [80, 46, 'G'], [120, 46, 'G'], [88, 88, 'G'], [112, 88, 'R']],
  // matières dangereuses (usage, pas RIPAM) : rouge 360°
  dangereux: [[100, 40, 'R']],
};

export const NIGHT_LIST = Object.keys(NIGHT_PRESETS);

/**
 * Ce que l'on voit de nuit. preset : clé de NIGHT_PRESETS, ou liste de feux.
 */
export function nuit(preset, o = {}) {
  const lights = Array.isArray(preset) ? preset : NIGHT_PRESETS[preset];
  if (!lights) throw new Error('Feux inconnus : ' + preset);
  const w = +(o.w || 220);
  const h = Math.round((w * 120) / 200);
  const id = nid('g');
  const dots = lights
    .map(
      ([x, y, c]) =>
        `<circle cx="${x}" cy="${y}" r="10" fill="${NIGHT[c]}" opacity=".18" filter="url(#${id})"/><circle cx="${x}" cy="${y}" r="3.6" fill="${NIGHT[c]}"/>`
    )
    .join('');
  return `<svg class="nuit" viewBox="0 0 200 120" width="${w}" height="${h}" role="img" aria-label="${esc(
    o.aria || 'Feux observés de nuit'
  )}" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>
<rect width="200" height="120" fill="#0b1118"/>
<rect y="96" width="200" height="24" fill="#0e1822"/>
<line x1="0" y1="96" x2="200" y2="96" stroke="#1c2a38" stroke-width="1"/>
${dots}
</svg>`;
}

// ------------------------------------------------------------- pavillons

export function pavillon(code, o = {}) {
  const w = +(o.w || 66);
  const h = Math.round((w * 44) / 66);
  const S = `stroke="${C.line}" stroke-width="1"`;
  const body = {
    A: `<rect x="3" y="3" width="30" height="38" fill="${C.W}"/><path d="M33 3 H63 L50 22 L63 41 H33 Z" fill="${C.Bu}"/><path d="M3 3 H63 L50 22 L63 41 H3 Z" fill="none" ${S}/>`,
    B: `<path d="M3 3 H63 L50 22 L63 41 H3 Z" fill="${C.R}" ${S}/>`,
    C: [C.Bu, C.W, C.R, C.W, C.Bu]
      .map((c, i) => `<rect x="3" y="${3 + i * 7.6}" width="60" height="7.7" fill="${c}"/>`)
      .join('') + `<rect x="3" y="3" width="60" height="38" fill="none" ${S}/>`,
    D: `<rect x="3" y="3" width="60" height="38" fill="${C.Y}"/><rect x="3" y="12.5" width="60" height="19" fill="${C.Bu}"/><rect x="3" y="3" width="60" height="38" fill="none" ${S}/>`,
    E: `<rect x="3" y="3" width="60" height="19" fill="${C.Bu}"/><rect x="3" y="22" width="60" height="19" fill="${C.R}"/><rect x="3" y="3" width="60" height="38" fill="none" ${S}/>`,
    T: `<rect x="3" y="3" width="20" height="38" fill="${C.R}"/><rect x="23" y="3" width="20" height="38" fill="${C.W}"/><rect x="43" y="3" width="20" height="38" fill="${C.Bu}"/><rect x="3" y="3" width="60" height="38" fill="none" ${S}/>`,
    H: `<rect x="3" y="3" width="30" height="38" fill="${C.W}"/><rect x="33" y="3" width="30" height="38" fill="${C.R}"/><rect x="3" y="3" width="60" height="38" fill="none" ${S}/>`,
    N: (() => {
      let s = '';
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
          s += `<rect x="${3 + i * 15}" y="${3 + j * 9.5}" width="15.2" height="9.7" fill="${(i + j) % 2 ? C.W : C.Bu}"/>`;
      return s + `<rect x="3" y="3" width="60" height="38" fill="none" ${S}/>`;
    })(),
    O: `<path d="M3 3 L63 41 H3 Z" fill="${C.Y}"/><path d="M3 3 H63 V41 Z" fill="${C.R}"/><rect x="3" y="3" width="60" height="38" fill="none" ${S}/>`,
    P: `<rect x="3" y="3" width="60" height="38" fill="${C.Bu}"/><rect x="23" y="15" width="20" height="14" fill="${C.W}"/><rect x="3" y="3" width="60" height="38" fill="none" ${S}/>`,
    Q: `<rect x="3" y="3" width="60" height="38" fill="${C.Y}" ${S}/>`,
    V: `<rect x="3" y="3" width="60" height="38" fill="${C.W}"/><path d="M3 3 L63 41 M63 3 L3 41" stroke="${C.R}" stroke-width="7"/><rect x="3" y="3" width="60" height="38" fill="none" ${S}/>`,
  };
  if (code === 'NC') {
    const ww = +(o.w || 66);
    return `<svg viewBox="0 0 66 88" width="${ww}" height="${Math.round(ww * 88 / 66)}" role="img" aria-label="Pavillons N sur C" xmlns="http://www.w3.org/2000/svg">${body.N}<g transform="translate(0 44)">${body.C}</g></svg>`;
  }
  if (!body[code]) throw new Error('Pavillon inconnu : ' + code);
  return `<svg class="pavillon" viewBox="0 0 66 44" width="${w}" height="${h}" role="img" aria-label="Pavillon ${code}" xmlns="http://www.w3.org/2000/svg">${body[code]}</svg>`;
}

// --------------------------------------------------------- signaux de port

/** seq : couleurs de haut en bas, ex. ['G','G','W']. o.exempt = 'Y' ajoute le feu d'exemption. o.flash = true */
export function port(seq, o = {}) {
  const w = +(o.w || 64);
  const H = 120;
  const h = Math.round((w * H) / 64);
  const ex = o.exempt ? `<circle cx="14" cy="28" r="8" fill="${NIGHT[o.exempt]}"/>` : '';
  const dots = seq
    .map((c, i) => {
      const y = 28 + i * 32;
      return `<circle cx="40" cy="${y}" r="14" fill="${NIGHT[c]}" opacity=".18"/><circle cx="40" cy="${y}" r="9" fill="${NIGHT[c]}"/>`;
    })
    .join('');
  return `<svg class="portsig" viewBox="0 0 64 ${H}" width="${w}" height="${h}" role="img" aria-label="${esc(
    o.aria || 'Signal de port ' + seq.join(' ')
  )}" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="${H}" fill="#0b1118"/>${ex}${dots}${
    o.flash ? '<text x="32" y="114" text-anchor="middle" font-size="9" fill="#cfd6dd">à éclats</text>' : ''
  }</svg>`;
}

// -------------------------------------------------------- feux et sons (HTML)

export function feuHTML(o) {
  const big = o.big ? ' big' : '';
  const label = o.label ?? `${o.r}${o.c && o.c !== 'W' ? ' ' + o.c : o.c === 'W' && o.showw ? ' W' : ''}${o.p ? ' ' + o.p + 's' : ''}`;
  return `<span class="feu${big}" data-r="${esc(o.r)}" data-c="${esc(o.c || 'W')}" data-p="${esc(o.p || '')}"><span class="lamp" aria-hidden="true"><i></i></span>${
    o.nolabel ? '' : `<span class="lbl">${esc(label)}</span>`
  }</span>`;
}

export function sonHTML(o) {
  const glyph = String(o.s)
    .split('')
    .map((c) => (c === '.' ? '•' : c === '-' ? '▬' : c === 'b' ? 'cloche' : c === 'g' ? 'gong' : ' '))
    .join(' ');
  return `<span class="son" data-s="${esc(o.s)}"><button type="button" aria-label="Écouter le signal">${glyph}</button>${
    o.label ? `<span>${esc(o.label)}</span>` : ''
  }</span>`;
}
