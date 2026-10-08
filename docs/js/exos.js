// Exercices générés : compas, estime, courant, marée.
// Chaque bloc <div class="gen" data-gen="nom"></div> reçoit un énoncé tiré au sort,
// des cases de réponse vérifiées avec une tolérance, et un corrigé détaillé.

// ------------------------------------------------------------------ outils

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const norm = (a) => ((Math.round(a) % 360) + 360) % 360;
const deg3 = (a) => String(norm(a)).padStart(3, '0');
const sgn = (x) => (x > 0 ? '+' + x : x < 0 ? '−' + Math.abs(x) : '0');
const dec = (x, n = 2) => x.toFixed(n).replace('.', ',').replace('-', '−');
const angDiff = (a, b) => Math.abs((((a - b) % 360) + 540) % 360 - 180);
const rad = (d) => (d * Math.PI) / 180;

function hm(min) {
  min = ((Math.round(min) % 1440) + 1440) % 1440;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')}`;
}
function dur(min) {
  min = Math.round(min);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
}
function parseHM(s) {
  const m = String(s).trim().match(/^(\d{1,2})\s*(?:h|:|\s)\s*(\d{1,2})?\s*(?:min)?$/i);
  if (!m) return NaN;
  return +m[1] * 60 + (m[2] ? +m[2] : 0);
}
function parseNum(s) {
  return parseFloat(String(s).replace(',', '.').replace('−', '-').replace(/\s/g, ''));
}
function parseDM(s) {
  // « −1°36 », « 1°36′ W », « 1 36 W », « -1.6 »
  s = String(s).trim();
  let neg = /[-−]|W|O\b|ouest/i.test(s);
  const nums = s.match(/\d+(?:[.,]\d+)?/g);
  if (!nums) return NaN;
  const d = parseFloat(nums[0].replace(',', '.'));
  const m = nums[1] ? parseFloat(nums[1].replace(',', '.')) / 60 : 0;
  const v = d + m;
  return neg ? -v : v;
}
function dm(x) {
  // degrés décimaux → « 1°36′ W »
  const a = Math.abs(x);
  let d = Math.floor(a + 1e-9);
  let m = Math.round((a - d) * 60);
  if (m === 60) {
    d++;
    m = 0;
  }
  if (d === 0 && m === 0) return '0°';
  return `${d}°${String(m).padStart(2, '0')}′ ${x < 0 ? 'W' : 'E'}`;
}

// ---------------------------------------------------------------- rendu

function mount(box, gen) {
  const title = box.dataset.title || gen.title;
  box.innerHTML = `<div class="gen-head"><span>${title}</span><button type="button" class="btn small ghost">Nouvel énoncé</button></div><div class="gen-body"></div>`;
  const body = box.querySelector('.gen-body');
  const draw = () => {
    const ex = gen.make();
    body.innerHTML = `${ex.text}
      ${ex.data ? `<div class="data">${ex.data}</div>` : ''}
      ${ex.answers
        .map(
          (a, i) =>
            `<div class="answer-row"><label for="${box.id}-a${i}">${a.label}</label><input id="${box.id}-a${i}" type="text" inputmode="${a.kind === 'time' || a.kind === 'dm' ? 'text' : 'decimal'}" autocomplete="off" placeholder="${a.ph || ''}"><span class="unit">${a.unit || ''}</span><span class="fb" aria-live="polite"></span></div>`
        )
        .join('')}
      <div class="btns"><button type="button" class="btn small chk">Vérifier</button></div>
      <details class="corr"><summary>Corrigé</summary><div>${ex.corr}</div></details>`;
    body.querySelector('.chk').onclick = () => {
      ex.answers.forEach((a, i) => {
        const inp = body.querySelector(`#${box.id}-a${i}`);
        const fb = inp.parentNode.querySelector('.fb');
        if (!inp.value.trim()) {
          fb.textContent = '';
          return;
        }
        let ok;
        if (a.kind === 'angle') ok = angDiff(parseNum(inp.value), a.v) <= (a.tol ?? 0.5);
        else if (a.kind === 'time') ok = Math.abs(angDiffMin(parseHM(inp.value), a.v)) <= (a.tol ?? 2);
        else if (a.kind === 'dur') {
          const raw = inp.value;
          const v = /h|:/i.test(raw) ? parseHM(raw) : parseNum(raw);
          ok = Math.abs(v - a.v) <= (a.tol ?? 2);
        } else if (a.kind === 'dm') ok = Math.abs(parseDM(inp.value) - a.v) <= (a.tol ?? 1 / 60 + 1e-6);
        else ok = Math.abs(parseNum(inp.value) - a.v) <= (a.tol ?? 0.01);
        fb.textContent = ok ? 'juste' : 'non';
        fb.className = 'fb ' + (ok ? 'ok' : 'ko');
      });
    };
    if (ex.after) ex.after(body);
  };
  box.querySelector('.gen-head button').onclick = draw;
  draw();
}
function angDiffMin(a, b) {
  return ((((a - b) % 1440) + 2160) % 1440) - 720;
}

// ------------------------------------------------------------ dessins

function triangle(o) {
  // o: { A: [x,y] en milles, vecteurs : [{d, v, cls, label}] } — dessin à l'échelle
  const pts = [[0, 0]];
  const segs = [];
  for (const s of o.chain) {
    const [x, y] = s.from ? s.from : pts[pts.length - 1];
    const nx = x + s.v * Math.sin(rad(s.d));
    const ny = y + s.v * Math.cos(rad(s.d));
    pts.push([nx, ny]);
    segs.push({ x1: x, y1: y, x2: nx, y2: ny, ...s });
  }
  const all = segs.flatMap((s) => [[s.x1, s.y1], [s.x2, s.y2]]);
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const W = 300, H = 220, pad = 30;
  const k = Math.min((W - 2 * pad) / Math.max(maxx - minx, 0.5), (H - 2 * pad) / Math.max(maxy - miny, 0.5));
  const X = (x) => pad + (x - minx) * k + ((W - 2 * pad) - (maxx - minx) * k) / 2;
  const Y = (y) => H - pad - (y - miny) * k - ((H - 2 * pad) - (maxy - miny) * k) / 2;
  const cx = segs.reduce((t, s) => t + X(s.x1) + X(s.x2), 0) / (2 * segs.length);
  const cy = segs.reduce((t, s) => t + Y(s.y1) + Y(s.y2), 0) / (2 * segs.length);
  const arrow = (s) => {
    const x2 = X(s.x2), y2 = Y(s.y2), x1 = X(s.x1), y1 = Y(s.y1);
    const a = Math.atan2(y2 - y1, x2 - x1);
    const h = `M${x2} ${y2} L${x2 - 9 * Math.cos(a - 0.4)} ${y2 - 9 * Math.sin(a - 0.4)} L${x2 - 9 * Math.cos(a + 0.4)} ${y2 - 9 * Math.sin(a + 0.4)} Z`;
    // étiquette décalée vers l'extérieur du triangle
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const L = Math.hypot(x2 - x1, y2 - y1) || 1;
    let nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
    if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
    const tx = mx + nx * 14, ty = my + ny * 14 + 4;
    const end = s.end ? `<text x="${x2 + nx * 10}" y="${y2 + ny * 10 + 4}" font-size="11" text-anchor="middle">${s.end}</text>` : '';
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ln ${s.cls}" stroke-width="2"/><path d="${h}" class="${s.cls.replace('st-', 'fill-')}"/>
      <text x="${tx}" y="${ty}" font-size="11" text-anchor="middle">${s.label}</text>${end}`;
  };
  return `<figure><svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Triangle des vitesses">
    <line x1="18" y1="14" x2="18" y2="40" class="ln2"/><text x="14" y="11" font-size="10">N</text>
    ${segs.map(arrow).join('')}
    <circle cx="${X(0)}" cy="${Y(0)}" r="3" class="fill-ink"/><text x="${X(0) - 14}" y="${Y(0) + 14}" font-size="11">A</text>
  </svg><figcaption>Construction à l'échelle, pour une heure.</figcaption></figure>`;
}

// ------------------------------------------------------------ générateurs

const GEN = {};

GEN['cap-vrai'] = {
  title: 'Du cap compas au cap vrai',
  make() {
    const Cc = rnd(0, 359);
    const d = rnd(-6, 6);
    const D = rnd(-4, 2);
    const Cm = norm(Cc + d);
    const Cv = norm(Cc + d + D);
    return {
      text: `<p>Le barreur tient le cap compas indiqué. La courbe de déviation donne <var>d</var> pour ce cap, la carte donne la déclinaison <var>D</var>. Calculer le cap magnétique et le cap vrai.</p>`,
      data: `Cc = ${deg3(Cc)}    d = ${sgn(d)}°    D = ${sgn(D)}°`,
      answers: [
        { label: 'Cm =', v: Cm, kind: 'angle', unit: '°' },
        { label: 'Cv =', v: Cv, kind: 'angle', unit: '°' },
      ],
      corr: `<p>Du compas vers le vrai, on ajoute les corrections avec leur signe.</p>
      <table class="calc"><thead><tr><th>Cc</th><th>+ d</th><th>= Cm</th><th>+ D</th><th>= Cv</th></tr></thead>
      <tbody><tr><td>${deg3(Cc)}</td><td>${sgn(d)}</td><td>${deg3(Cm)}</td><td>${sgn(D)}</td><td>${deg3(Cv)}</td></tr></tbody></table>
      <p>Variation <var>W</var> = <var>D</var> + <var>d</var> = ${sgn(D + d)}°, et <var>Cv</var> = <var>Cc</var> + <var>W</var> = ${deg3(Cv)}.${
        Cc + d + D < 0 || Cc + d + D >= 360 ? ' On a ramené le résultat entre 000 et 359.' : ''
      }</p>`,
    };
  },
};

GEN['cap-compas'] = {
  title: 'Du cap vrai au cap compas',
  make() {
    const Cv = rnd(0, 359);
    const D = rnd(-4, 2);
    const d = rnd(-6, 6);
    const W = D + d;
    const Cc = norm(Cv - W);
    return {
      text: `<p>La route tracée sur la carte donne le cap vrai à suivre (pas de dérive, pas de courant). Quel cap compas donner au barreur ?</p>`,
      data: `Cv = ${deg3(Cv)}    D = ${sgn(D)}°    d (pour ce cap) = ${sgn(d)}°`,
      answers: [{ label: 'Cc =', v: Cc, kind: 'angle', unit: '°' }],
      corr: `<p><var>W</var> = <var>D</var> + <var>d</var> = ${sgn(D)} ${d >= 0 ? '+' : '−'} ${Math.abs(d)} = ${sgn(W)}°.</p>
      <p>Du vrai vers le compas, on retranche : <var>Cc</var> = <var>Cv</var> − <var>W</var> = ${deg3(Cv)} − (${sgn(W)}) = <strong>${deg3(Cc)}</strong>.</p>
      <p>Contrôle : si <var>W</var> est négative (le compas « pointe » à l'Ouest du vrai), le cap compas est plus grand que le cap vrai.</p>`,
    };
  },
};

GEN['releve'] = {
  title: 'Relèvements compas → relèvements vrais',
  make() {
    const D = rnd(-4, 2);
    const amers = ['clocher', 'phare', 'tourelle', 'château d’eau', 'sémaphore', 'pointe'];
    const names = [];
    while (names.length < 3) {
      const n = pick(amers);
      if (!names.includes(n)) names.push(n);
    }
    const base = rnd(0, 359);
    const Zc = [base, norm(base + rnd(50, 70)), norm(base + rnd(110, 140))];
    const Zv = Zc.map((z) => norm(z + D));
    return {
      text: `<p>On relève trois amers au compas de relèvement à main, tenu loin de toute masse métallique (déviation nulle). La carte donne la déclinaison de l'année. Calculer les relèvements vrais à tracer.</p>`,
      data: names.map((n, i) => `${n.padEnd(14)} Zc = ${deg3(Zc[i])}`).join('\n') + `\nD = ${sgn(D)}°    d = 0`,
      answers: names.map((n, i) => ({ label: `Zv ${n} =`, v: Zv[i], kind: 'angle', unit: '°' })),
      corr: `<p>Compas de relèvement à main : <var>d</var> = 0, donc <var>W</var> = <var>D</var> = ${sgn(D)}° et <var>Zv</var> = <var>Zc</var> + <var>W</var>.</p>
      <table class="calc"><thead><tr><th>Amer</th><th>Zc</th><th>W</th><th>Zv</th></tr></thead><tbody>${names
        .map((n, i) => `<tr><td class="lbl">${n}</td><td>${deg3(Zc[i])}</td><td>${sgn(D)}</td><td>${deg3(Zv[i])}</td></tr>`)
        .join('')}</tbody></table>
      <p>On trace chaque droite passant par l'amer, orientée au <var>Zv</var> ; le bateau est du côté opposé à l'amer. Les trois droites forment le chapeau.</p>`,
    };
  },
};

GEN['alignement'] = {
  title: 'Contrôler le compas sur un alignement',
  make() {
    const Zv = rnd(0, 359);
    const D = rnd(-4, 2);
    const d = rnd(-5, 5);
    const Zc = norm(Zv - D - d);
    return {
      text: `<p>On suit un alignement porté sur la carte, et on le relève au compas de route. Calculer la variation, puis la déviation au cap suivi.</p>`,
      data: `Alignement vrai Zv = ${deg3(Zv)}    relevé au compas Zc = ${deg3(Zc)}    D = ${sgn(D)}°`,
      answers: [
        { label: 'W =', v: D + d, kind: 'num', tol: 0.01, unit: '°', ph: 'avec son signe' },
        { label: 'd =', v: d, kind: 'num', tol: 0.01, unit: '°', ph: 'avec son signe' },
      ],
      corr: `<p><var>Zv</var> = <var>Zc</var> + <var>W</var>, donc <var>W</var> = <var>Zv</var> − <var>Zc</var> = ${deg3(Zv)} − ${deg3(Zc)} = <strong>${sgn(D + d)}°</strong> (en ramenant l'écart entre −180 et +180).</p>
      <p><var>W</var> = <var>D</var> + <var>d</var>, donc <var>d</var> = <var>W</var> − <var>D</var> = ${sgn(D + d)} − (${sgn(D)}) = <strong>${sgn(d)}°</strong>.</p>`,
    };
  },
};

GEN['declinaison'] = {
  title: 'Déclinaison de l’année',
  make() {
    const y0 = pick([2005, 2010, 2012, 2015, 2018, 2020]);
    const deg = rnd(0, 3);
    const min = rnd(0, 11) * 5;
    const D0 = -(deg + min / 60);
    const varMin = pick([4, 5, 6, 7, 8, 9, 10]);
    const y = 2026;
    const D = D0 + ((y - y0) * varMin) / 60;
    return {
      text: `<p>La rose des vents de la carte porte l'indication ci-dessous. Calculer la déclinaison pour ${y}.</p>`,
      data: `${deg}°${String(min).padStart(2, '0')}′ W ${y0} (${varMin}′ E)`,
      answers: [{ label: `D (${y}) =`, v: D, kind: 'dm', unit: '', ph: 'ex. 1°36 W' }],
      corr: `<p>En ${y0}, <var>D</var> = −${deg}°${String(min).padStart(2, '0')}′ (Ouest, donc négative). Elle augmente de ${varMin}′ vers l'Est par an.</p>
      <p>De ${y0} à ${y} : ${y - y0} ans × ${varMin}′ = ${(y - y0) * varMin}′ = ${dm(((y - y0) * varMin) / 60).replace(' E', '')} vers l'Est.</p>
      <p><var>D</var>(${y}) = −${deg}°${String(min).padStart(2, '0')}′ + ${(y - y0) * varMin}′ = <strong>${dm(D)}</strong>${
        D > 0 ? ' : la déclinaison est passée à l’Est' : ''
      }.</p>`,
    };
  },
};

GEN['derive'] = {
  title: 'Dérive et route surface',
  make() {
    const Cc = rnd(0, 359);
    const W = rnd(-6, 4);
    const Cv = norm(Cc + W);
    // vent venant d'un côté, entre 40 et 140° de l'axe
    const side = pick([1, -1]); // 1 : tribord, -1 : bâbord
    const rel = rnd(40, 140);
    const windFrom = norm(Cv + side * rel);
    const amp = rel < 70 ? rnd(6, 12) : rel < 110 ? rnd(3, 6) : rnd(1, 3);
    const der = side === 1 ? -amp : amp;
    const Rs = norm(Cv + der);
    const rose = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return {
      text: `<p>Le vent vient du ${deg3(windFrom)} (environ ${rose[Math.round(windFrom / 22.5) % 16]}). On estime la dérive à ${amp}°. Calculer le cap vrai et la route surface.</p>`,
      data: `Cc = ${deg3(Cc)}    W = ${sgn(W)}°    vent du ${deg3(windFrom)}    dérive ${amp}°`,
      answers: [
        { label: 'Cv =', v: Cv, kind: 'angle', unit: '°' },
        { label: 'Rs =', v: Rs, kind: 'angle', unit: '°' },
      ],
      corr: `<p><var>Cv</var> = <var>Cc</var> + <var>W</var> = ${deg3(Cc)} ${W >= 0 ? '+' : '−'} ${Math.abs(W)} = ${deg3(Cv)}.</p>
      <p>Le vent vient du ${deg3(windFrom)}, soit ${rel}° ${side === 1 ? 'à droite' : 'à gauche'} de l'axe du bateau : il vient de <strong>${
        side === 1 ? 'tribord' : 'bâbord'
      }</strong> et pousse le bateau vers ${side === 1 ? 'bâbord' : 'tribord'}. La dérive est donc ${side === 1 ? 'négative' : 'positive'} : <var>dér</var> = ${sgn(der)}°.</p>
      <p><var>Rs</var> = <var>Cv</var> + <var>dér</var> = <strong>${deg3(Rs)}</strong>.</p>`,
    };
  },
};

GEN['dvt'] = {
  title: 'Distance, vitesse, durée',
  make() {
    const kind = pick(['d', 'V', 't']);
    const V = rnd(6, 14) / 2; // 3 à 7 nd par demi-nœuds
    const t = rnd(4, 36) * 5; // 20 min à 3 h
    const d = Math.round(((V * t) / 60) * 10) / 10;
    if (kind === 'd')
      return {
        text: `<p>Quelle distance parcourt-on en ${dur(t)} à ${dec(V, 1)} nd ?</p>`,
        answers: [{ label: 'd =', v: (V * t) / 60, tol: 0.06, unit: 'M' }],
        corr: `<p><var>d</var> = <var>V</var> × <var>t</var> = ${dec(V, 1)} × ${t}/60 = <strong>${dec((V * t) / 60, 2)} M</strong>.</p>`,
      };
    if (kind === 'V')
      return {
        text: `<p>On a parcouru ${dec(d, 1)} M en ${dur(t)}. Quelle est la vitesse moyenne ?</p>`,
        answers: [{ label: 'V =', v: (d * 60) / t, tol: 0.06, unit: 'nd' }],
        corr: `<p><var>V</var> = <var>d</var> / <var>t</var> = ${dec(d, 1)} / (${t}/60) = <strong>${dec((d * 60) / t, 2)} nd</strong>.</p>`,
      };
    const dep = rnd(6 * 12, 16 * 12) * 5;
    const tt = (d / V) * 60;
    return {
      text: `<p>Départ à ${hm(dep)}, ${dec(d, 1)} M à parcourir à ${dec(V, 1)} nd. Combien de temps, et à quelle heure arrive-t-on ?</p>`,
      answers: [
        { label: 'durée =', v: tt, kind: 'dur', tol: 1.5, ph: 'min ou h mm' },
        { label: 'arrivée =', v: dep + tt, kind: 'time', tol: 2, ph: 'hh h mm' },
      ],
      corr: `<p><var>t</var> = <var>d</var> / <var>V</var> = ${dec(d, 1)} / ${dec(V, 1)} = ${dec(d / V, 3)} h = ${dec(tt, 1)} min, soit ${dur(tt)}.</p>
      <p>Arrivée : ${hm(dep)} + ${dur(tt)} = <strong>${hm(dep + tt)}</strong>.</p>`,
    };
  },
};

function vadd(d1, v1, d2, v2) {
  const x = v1 * Math.sin(rad(d1)) + v2 * Math.sin(rad(d2));
  const y = v1 * Math.cos(rad(d1)) + v2 * Math.cos(rad(d2));
  return { d: norm((Math.atan2(x, y) * 180) / Math.PI), v: Math.hypot(x, y), dx: (Math.atan2(x, y) * 180) / Math.PI };
}

GEN['courant-direct'] = {
  title: 'Route fond avec courant',
  make() {
    const Rs = rnd(0, 359);
    const Vs = rnd(8, 14) / 2;
    const Dc = norm(Rs + pick([1, -1]) * rnd(40, 140));
    const Vc = rnd(4, 20) / 10;
    const r = vadd(Rs, Vs, Dc, Vc);
    const exact = (Math.atan2(Vs * Math.sin(rad(Rs)) + Vc * Math.sin(rad(Dc)), Vs * Math.cos(rad(Rs)) + Vc * Math.cos(rad(Dc))) * 180) / Math.PI;
    return {
      text: `<p>Le bateau fait route surface au ${deg3(Rs)} à ${dec(Vs, 1)} nd. Le courant porte au ${deg3(Dc)} à ${dec(Vc, 1)} nd. Déterminer la route fond et la vitesse fond (construction sur papier quadrillé, ou par le calcul).</p>`,
      answers: [
        { label: 'Rf =', v: (exact + 360) % 360, kind: 'angle', tol: 2, unit: '°' },
        { label: 'Vf =', v: r.v, tol: 0.15, unit: 'nd' },
      ],
      corr: `${triangle({ chain: [{ d: Rs, v: Vs, cls: 'st-navy', label: 'Rs' }, { d: Dc, v: Vc, cls: 'st-ok', label: 'courant' }, { from: [0, 0], d: (exact + 360) % 360, v: r.v, cls: 'st-signal', label: 'Rf' }] })}
      <p>Depuis A, on trace la route surface sur ${dec(Vs, 1)} M (une heure), puis le courant sur ${dec(Vc, 1)} M. Le segment qui joint A à l'extrémité donne <strong><var>Rf</var> ≈ ${deg3((exact + 360) % 360)}</strong> et <strong><var>Vf</var> ≈ ${dec(r.v, 2)} nd</strong>.</p>
      <p>Par le calcul : composantes Est = ${dec(Vs, 1)} sin ${deg3(Rs)} + ${dec(Vc, 1)} sin ${deg3(Dc)} = ${dec(Vs * Math.sin(rad(Rs)) + Vc * Math.sin(rad(Dc)), 2)} ; Nord = ${dec(Vs, 1)} cos ${deg3(Rs)} + ${dec(Vc, 1)} cos ${deg3(Dc)} = ${dec(Vs * Math.cos(rad(Rs)) + Vc * Math.cos(rad(Dc)), 2)}. D'où la direction et la norme ci-dessus.</p>`,
    };
  },
};

GEN['courant-inverse'] = {
  title: 'Quelle route surface pour compenser le courant ?',
  make() {
    let Rf, Vs, Dc, Vc, Rs, Vf, dist;
    for (;;) {
      Rf = rnd(0, 359);
      Vs = rnd(8, 12) / 2;
      Dc = norm(Rf + pick([1, -1]) * rnd(50, 130));
      Vc = rnd(5, 20) / 10;
      // composante du courant perpendiculaire à Rf
      const cross = Vc * Math.sin(rad(Dc - Rf));
      const s = -cross / Vs;
      if (Math.abs(s) > 0.8) continue;
      const a = (Math.asin(s) * 180) / Math.PI;
      Rs = Rf + a;
      Vf = Vs * Math.cos(rad(a)) + Vc * Math.cos(rad(Dc - Rf));
      if (Vf < 1.5) continue;
      dist = rnd(6, 20) / 2;
      break;
    }
    const t = (dist / Vf) * 60;
    return {
      text: `<p>On veut rejoindre un point situé à ${dec(dist, 1)} M dans le ${deg3(Rf)}. Le bateau marche à ${dec(Vs, 1)} nd ; le courant porte au ${deg3(Dc)} à ${dec(Vc, 1)} nd. Quelle route surface suivre, à quelle vitesse fond, et combien de temps faut-il ?</p>`,
      answers: [
        { label: 'Rs =', v: norm(Rs), kind: 'angle', tol: 2, unit: '°' },
        { label: 'Vf =', v: Vf, tol: 0.15, unit: 'nd' },
        { label: 'durée =', v: t, kind: 'dur', tol: Math.max(2, t * 0.04), ph: 'min ou h mm' },
      ],
      corr: `${triangle({ chain: [{ d: Dc, v: Vc, cls: 'st-ok', label: 'courant', end: 'C' }, { d: Rs, v: Vs, cls: 'st-navy', label: 'Rs', end: 'D' }, { from: [0, 0], d: Rf, v: Vf, cls: 'st-signal', label: 'Rf' }] })}
      <ol><li>Depuis A, tracer le courant d'une heure : ${dec(Vc, 1)} M au ${deg3(Dc)} (point C).</li>
      <li>Tracer la route fond voulue, au ${deg3(Rf)} depuis A.</li>
      <li>Depuis C, couper la route fond avec un arc de rayon ${dec(Vs, 1)} M (point D).</li>
      <li>CD donne la route surface : <strong><var>Rs</var> ≈ ${deg3(Rs)}</strong>. AD donne la vitesse fond : <strong><var>Vf</var> ≈ ${dec(Vf, 2)} nd</strong>.</li>
      <li>Durée : ${dec(dist, 1)} / ${dec(Vf, 2)} = ${dec(dist / Vf, 3)} h ≈ <strong>${dur(t)}</strong>.</li></ol>
      <p>Il reste à corriger de la dérive (<var>Cv</var> = <var>Rs</var> − <var>dér</var>) puis du compas (<var>Cc</var> = <var>Cv</var> − <var>W</var>).</p>`,
    };
  },
};

GEN['courant-subi'] = {
  title: 'Courant subi',
  make() {
    const dir = rnd(0, 359);
    const dist = rnd(3, 15) / 10;
    const t = rnd(6, 24) * 5;
    const v = (dist * 60) / t;
    return {
      text: `<p>Le point observé est à ${dec(dist, 1)} M dans le ${deg3(dir)} du point estimé (calculé sans courant), ${dur(t)} après le dernier point sûr. Quel courant a-t-on subi ?</p>`,
      answers: [
        { label: 'porte au', v: dir, kind: 'angle', tol: 0.5, unit: '°' },
        { label: 'vitesse =', v: v, tol: 0.06, unit: 'nd' },
      ],
      corr: `<p>Le courant a déplacé le bateau du point estimé vers le point observé : il porte au <strong>${deg3(dir)}</strong>. Il l'a déplacé de ${dec(dist, 1)} M en ${t} min, soit ${dec(dist, 1)} × 60 / ${t} = <strong>${dec(v, 2)} nd</strong>.</p>`,
    };
  },
};

// ---------------------------------------------------------------- marée

function tideSetup(opts = {}) {
  // Renvoie une marée : de t0 (h0) à t1 (h1), montante ou descendante.
  const rising = opts.rising ?? pick([true, false]);
  const D = rnd(345, 395); // durée en minutes
  const t0 = rnd(0, 18 * 60);
  const low = rnd(3, 18) / 10;
  const range = rnd(18, 50) / 10;
  const high = Math.round((low + range) * 100) / 100;
  const h0 = rising ? low : high;
  const h1 = rising ? high : low;
  const HM = Math.round(D / 6);
  const marnage = Math.round((high - low) * 1000) / 1000;
  const dz = marnage / 12;
  const twelfths = [1, 2, 3, 3, 2, 1];
  const rows = [{ t: t0, h: h0, var: null }];
  let h = h0;
  let t = t0;
  twelfths.forEach((k) => {
    t += HM;
    h += (rising ? 1 : -1) * k * dz;
    rows.push({ t, h, var: (rising ? 1 : -1) * k * dz, k });
  });
  return { rising, D, t0, t1: t0 + D, h0, h1, HM, marnage, dz, rows, low, high };
}

function tideTable(T, hlRows = []) {
  return `<table class="calc"><thead><tr><th>Heure</th><th>Variation</th><th>Hauteur (m)</th></tr></thead><tbody>${T.rows
    .map(
      (r, i) =>
        `<tr${hlRows.includes(i) ? ' class="hl"' : ''}><td>${hm(r.t)}</td><td>${r.var === null ? (T.rising ? 'BM' : 'PM') : `${r.var > 0 ? '+' : '−'}${r.k}/12 = ${r.var > 0 ? '+' : '−'}${dec(Math.abs(r.var), 3)}`}</td><td>${dec(r.h, 3)}</td></tr>`
    )
    .join('')}</tbody></table>`;
}

function heightAt(T, t) {
  for (let i = 1; i < T.rows.length; i++) {
    if (t <= T.rows[i].t) {
      const a = T.rows[i - 1];
      const b = T.rows[i];
      return { h: a.h + ((b.h - a.h) * (t - a.t)) / (b.t - a.t), i };
    }
  }
  return { h: T.rows[6].h, i: 6 };
}
function timeAt(T, h) {
  for (let i = 1; i < T.rows.length; i++) {
    const a = T.rows[i - 1];
    const b = T.rows[i];
    if ((h - a.h) * (h - b.h) <= 0) return { t: a.t + ((b.t - a.t) * (h - a.h)) / (b.h - a.h), i };
  }
  return null;
}

GEN['maree-hauteur'] = {
  title: 'Hauteur d’eau à une heure donnée',
  make() {
    const T = tideSetup();
    const t = T.t0 + rnd(Math.round(T.D * 0.15), Math.round(T.D * 0.85));
    const { h, i } = heightAt(T, t);
    const a = T.rows[i - 1];
    const b = T.rows[i];
    return {
      text: `<p>Calculer la hauteur de marée à ${hm(t)} par la règle des douzièmes. Les heures sont déjà en heure légale.</p>`,
      data: `${T.rising ? 'BM' : 'PM'}  ${hm(T.t0)}   ${dec(T.h0, 2)} m\n${T.rising ? 'PM' : 'BM'}  ${hm(T.t1)}   ${dec(T.h1, 2)} m`,
      answers: [
        { label: 'heure-marée =', v: T.HM, tol: 1, unit: 'min' },
        { label: 'douzième =', v: T.dz, tol: 0.006, unit: 'm' },
        { label: `hauteur à ${hm(t)} =`, v: h, tol: 0.03, unit: 'm' },
      ],
      corr: `<p>Durée : ${dur(T.D)} = ${T.D} min ; HM = ${T.D}/6 ≈ <strong>${T.HM} min</strong>. Marnage : ${dec(T.marnage, 2)} m ; douzième = <strong>${dec(T.dz, 3)} m</strong>. La mer ${T.rising ? 'monte' : 'descend'}.</p>
      ${tideTable(T, [i - 1, i])}
      <p>${hm(t)} se trouve entre ${hm(a.t)} et ${hm(b.t)}, dans la ${i}<sup>e</sup> heure-marée, où la mer ${T.rising ? 'monte' : 'descend'} de ${dec(Math.abs(b.h - a.h), 3)} m en ${b.t - a.t} min. En ${t - a.t} min : ${dec(Math.abs(b.h - a.h), 3)} × ${t - a.t}/${b.t - a.t} = ${dec(Math.abs(h - a.h), 3)} m.</p>
      <p>Hauteur : ${dec(a.h, 3)} ${T.rising ? '+' : '−'} ${dec(Math.abs(h - a.h), 3)} = <strong>${dec(h, 2)} m</strong>.</p>`,
    };
  },
};

GEN['maree-passage'] = {
  title: 'Passer sur un haut-fond',
  make() {
    let T, need, res, s, TE, pp;
    for (;;) {
      T = tideSetup();
      TE = pick([0.8, 1.0, 1.2, 1.4, 1.5, 1.6, 1.8]);
      pp = pick([0.3, 0.5, 0.5]);
      s = pick([-0.6, -0.4, -0.2, 0.2, 0.4, 0.6, 0.9, 1.2]);
      need = Math.round((TE + pp - s) * 100) / 100;
      res = timeAt(T, need);
      if (res && res.i >= 2 && res.i <= 5) break;
    }
    const soul = s < 0;
    const a = T.rows[res.i - 1];
    const b = T.rows[res.i];
    const what = T.rising ? 'À partir de quelle heure' : 'Jusqu’à quelle heure';
    return {
      text: `<p>Un voilier de tirant d'eau ${dec(TE, 2)} m doit passer sur un haut-fond de sonde ${soul ? `soulignée <u>${dec(-s, 1)}</u> (le fond découvre de ${dec(-s, 1)} m)` : dec(s, 1) + ' m'}. Le chef de bord prend ${dec(pp, 2)} m de pied de pilote. ${what} peut-il passer ?</p>`,
      data: `${T.rising ? 'BM' : 'PM'}  ${hm(T.t0)}   ${dec(T.h0, 2)} m\n${T.rising ? 'PM' : 'BM'}  ${hm(T.t1)}   ${dec(T.h1, 2)} m`,
      answers: [
        { label: 'hauteur de marée nécessaire =', v: need, tol: 0.011, unit: 'm' },
        { label: 'heure =', v: res.t, kind: 'time', tol: 2, ph: 'hh h mm' },
      ],
      corr: `<p>Il faut <var>h</var> ≥ <var>TE</var> + <var>pp</var> − <var>s</var> = ${dec(TE, 2)} + ${dec(pp, 2)} ${s < 0 ? '+ ' + dec(-s, 2) : '− ' + dec(s, 2)} = <strong>${dec(need, 2)} m</strong>${
        soul ? ' (la sonde soulignée compte négativement : il faut en plus couvrir le banc)' : ''
      }.</p>
      <p>HM = ${T.HM} min, douzième = ${dec(T.dz, 3)} m. La mer ${T.rising ? 'monte' : 'descend'}.</p>
      ${tideTable(T, [res.i - 1, res.i])}
      <p>${dec(need, 2)} m est atteint dans la ${res.i}<sup>e</sup> heure-marée, entre ${dec(a.h, 3)} et ${dec(b.h, 3)} m. Il faut ${T.rising ? 'monter' : 'descendre'} de ${dec(Math.abs(need - a.h), 3)} m sur ${dec(Math.abs(b.h - a.h), 3)} m, ce qui prend ${b.t - a.t} × ${dec(Math.abs(need - a.h), 3)} / ${dec(Math.abs(b.h - a.h), 3)} = ${dec(res.t - a.t, 1)} min.</p>
      <p>${what.replace('À partir de', 'On peut passer à partir de').replace('Jusqu’à quelle heure', 'On peut passer jusqu’à')} : ${hm(a.t)} + ${Math.round(res.t - a.t)} min = <strong>${hm(res.t)}</strong>.</p>`,
    };
  },
};

GEN['maree-mouillage'] = {
  title: 'Mouillage de nuit',
  make() {
    const s = pick([0.8, 1.2, 1.5, 1.8, 2.1, 2.4, 3.0, 3.5]);
    const TE = pick([0.9, 1.2, 1.5, 1.7]);
    const pp = 0.5;
    const BM = rnd(4, 16) / 10;
    const PM = Math.round((BM + rnd(25, 45) / 10) * 10) / 10;
    const minW = s + BM;
    const maxW = s + PM;
    const ok = minW >= TE + pp;
    return {
      text: `<p>On veut passer la nuit au mouillage sur un fond de sonde ${dec(s, 1)} m (fond de sable). Tirant d'eau ${dec(TE, 1)} m, pied de pilote ${dec(pp, 1)} m. Ligne de mouillage tout chaîne.</p>`,
      data: `BM de la nuit  ${dec(BM, 1)} m\nPM suivante    ${dec(PM, 1)} m`,
      answers: [
        { label: 'hauteur d’eau à la BM =', v: minW, tol: 0.011, unit: 'm' },
        { label: 'hauteur d’eau à la PM =', v: maxW, tol: 0.011, unit: 'm' },
        { label: 'chaîne (3 × PM) ≈', v: 3 * maxW, tol: Math.max(1.5, 0.1 * maxW), unit: 'm' },
      ],
      corr: `<p>À basse mer : ${dec(s, 1)} + ${dec(BM, 1)} = <strong>${dec(minW, 1)} m</strong> d'eau. Il faut ${dec(TE, 1)} + ${dec(pp, 1)} = ${dec(TE + pp, 1)} m : ${
        ok ? 'le mouillage est sûr.' : '<strong>ce n’est pas suffisant</strong>, il faut chercher un fond plus profond.'
      }</p>
      <p>À pleine mer : ${dec(s, 1)} + ${dec(PM, 1)} = <strong>${dec(maxW, 1)} m</strong>. On mouille environ 3 × ${dec(maxW, 1)} ≈ <strong>${Math.ceil(3 * maxW)} m</strong> de chaîne (davantage si le vent doit forcir).</p>
      <p>À basse mer, la chaîne en excès agrandit le cercle d'évitage : vérifier qu'il n'y a ni autre bateau ni haut-fond dans ce cercle.</p>`,
    };
  },
};

GEN['port-rattache'] = {
  title: 'Port rattaché et heure légale',
  make() {
    const coef = rnd(35, 110);
    const ve = coef >= 70;
    const tPM = rnd(0, 23 * 60);
    const hPM = rnd(38, 56) / 10;
    const tBM = tPM + rnd(360, 380);
    const hBM = rnd(4, 16) / 10;
    const corr = {
      pmT: [rnd(-6, 6) * 5, rnd(-6, 6) * 5],
      bmT: [rnd(-6, 6) * 5, rnd(-6, 6) * 5],
      pmH: [rnd(-6, 6) / 10, rnd(-6, 6) / 10],
      bmH: [rnd(-3, 3) / 10, rnd(-3, 3) / 10],
    };
    const k = ve ? 0 : 1;
    const ete = pick([true, false]);
    const add = ete ? 60 : 0;
    const PMt = tPM + corr.pmT[k] + add;
    const PMh = hPM + corr.pmH[k];
    const BMt = tBM + corr.bmT[k] + add;
    const BMh = hBM + corr.bmH[k];
    const f = (m) => (m >= 0 ? '+' : '−') + Math.floor(Math.abs(m) / 60) + ' h ' + String(Math.abs(m) % 60).padStart(2, '0');
    const fh = (x) => (x >= 0 ? '+' : '−') + dec(Math.abs(x), 2);
    return {
      text: `<p>Annuaire du port de référence (heure UTC+1), coefficient ${coef}. Nous sommes en ${ete ? 'été (heure légale UTC+2)' : 'hiver (heure légale UTC+1)'}. Calculer l'heure légale et la hauteur de la PM et de la BM au port rattaché. On applique les corrections de vives eaux si le coefficient est d'au moins 70, de mortes eaux sinon.</p>`,
      data: `Port de référence : PM ${hm(tPM)}  ${dec(hPM, 2)} m    BM ${hm(tBM)}  ${dec(hBM, 2)} m
Corrections        PM heure  VE ${f(corr.pmT[0])}  ME ${f(corr.pmT[1])}    BM heure  VE ${f(corr.bmT[0])}  ME ${f(corr.bmT[1])}
                   PM haut.  VE ${fh(corr.pmH[0])}  ME ${fh(corr.pmH[1])}    BM haut.  VE ${fh(corr.bmH[0])}  ME ${fh(corr.bmH[1])}`,
      answers: [
        { label: 'PM (heure légale) =', v: PMt, kind: 'time', tol: 1, ph: 'hh h mm' },
        { label: 'hauteur PM =', v: PMh, tol: 0.011, unit: 'm' },
        { label: 'BM (heure légale) =', v: BMt, kind: 'time', tol: 1, ph: 'hh h mm' },
        { label: 'hauteur BM =', v: BMh, tol: 0.011, unit: 'm' },
      ],
      corr: `<p>Coefficient ${coef} : ${ve ? 'vives eaux (≥ 70)' : 'mortes eaux (< 70)'}, on prend les corrections ${ve ? 'VE' : 'ME'}. ${
        ete ? 'En été, on ajoute 1 h pour passer en heure légale.' : 'En hiver, l’heure de l’annuaire est déjà l’heure légale.'
      }</p>
      <table class="calc"><thead><tr><th></th><th>Annuaire</th><th>Correction</th>${ete ? '<th>Été</th>' : ''}<th>Port rattaché</th></tr></thead><tbody>
      <tr><td class="lbl">PM heure</td><td>${hm(tPM)}</td><td>${f(corr.pmT[k])}</td>${ete ? '<td>+1 h</td>' : ''}<td>${hm(PMt)}</td></tr>
      <tr><td class="lbl">PM hauteur</td><td>${dec(hPM, 2)}</td><td>${fh(corr.pmH[k])}</td>${ete ? '<td></td>' : ''}<td>${dec(PMh, 2)}</td></tr>
      <tr><td class="lbl">BM heure</td><td>${hm(tBM)}</td><td>${f(corr.bmT[k])}</td>${ete ? '<td>+1 h</td>' : ''}<td>${hm(BMt)}</td></tr>
      <tr><td class="lbl">BM hauteur</td><td>${dec(hBM, 2)}</td><td>${fh(corr.bmH[k])}</td>${ete ? '<td></td>' : ''}<td>${dec(BMh, 2)}</td></tr>
      </tbody></table>`,
    };
  },
};

// ------------------------------------------------------------- démarrage

let n = 0;
document.querySelectorAll('.gen[data-gen]').forEach((box) => {
  const g = GEN[box.dataset.gen];
  if (!g) {
    box.textContent = 'Exercice inconnu : ' + box.dataset.gen;
    return;
  }
  box.id = box.id || 'gen' + ++n;
  mount(box, g);
});
