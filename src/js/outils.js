// Outils interactifs de la partie Pratique : vent apparent.
(function () {
  const box = document.getElementById('outil-vent-apparent');
  if (!box) return;
  box.innerHTML = `
  <div class="two">
    <div>
      <label>Vent réel : <output id="o-vr"></output> nd<input type="range" id="i-vr" min="4" max="25" step="1" value="12"></label>
      <label>Vitesse du bateau : <output id="o-vb"></output> nd<input type="range" id="i-vb" min="0" max="8" step="0.5" value="5"></label>
      <label>Angle du vent réel avec l'axe du bateau : <output id="o-th"></output>°<input type="range" id="i-th" min="30" max="180" step="5" value="45"></label>
      <div class="readout">
        <div>Angle du vent apparent<b id="r-ang"></b></div>
        <div>Vent apparent<b id="r-va"></b></div>
        <div>Allure (vent réel)<b id="r-all" style="font-family:var(--sans);font-size:.95rem"></b></div>
      </div>
    </div>
    <div><svg id="va-svg" viewBox="0 0 300 300" width="300" role="img" aria-label="Triangle du vent apparent"></svg></div>
  </div>`;
  const $ = (id) => box.querySelector('#' + id);
  const R = Math.PI / 180;
  function allure(t) {
    if (t < 40) return 'face au vent';
    if (t < 55) return 'près';
    if (t < 75) return 'bon plein';
    if (t < 105) return 'travers';
    if (t < 140) return 'largue';
    if (t < 165) return 'grand largue';
    return 'vent arrière';
  }
  function arrow(x1, y1, x2, y2, cls, label, side) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const h = `M${x2} ${y2} L${x2 - 10 * Math.cos(a - 0.4)} ${y2 - 10 * Math.sin(a - 0.4)} L${x2 - 10 * Math.cos(a + 0.4)} ${y2 - 10 * Math.sin(a + 0.4)} Z`;
    const L = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = (-(y2 - y1) / L) * side;
    const ny = ((x2 - x1) / L) * side;
    const tx = (x1 + x2) / 2 + nx * 16;
    const ty = (y1 + y2) / 2 + ny * 16 + 4;
    const anchor = nx > 0.3 ? 'start' : nx < -0.3 ? 'end' : 'middle';
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ln ${cls}" stroke-width="2.4"/><path d="${h}" class="${cls.replace('st-', 'fill-')}"/><text x="${tx}" y="${ty}" font-size="11" text-anchor="${anchor}">${label}</text>`;
  }
  function draw() {
    const Vr = +$('i-vr').value;
    const Vb = +$('i-vb').value;
    const th = +$('i-th').value;
    $('o-vr').textContent = Vr;
    $('o-vb').textContent = Vb;
    $('o-th').textContent = th;
    // repère bateau : x vers tribord, y vers l'avant ; vitesses du vent (vers où il souffle)
    const vt = [-Vr * Math.sin(th * R), -Vr * Math.cos(th * R)];
    const vb = [0, -Vb];
    const va = [vt[0] + vb[0], vt[1] + vb[1]];
    const Va = Math.hypot(va[0], va[1]);
    const beta = Math.atan2(Vr * Math.sin(th * R), Vr * Math.cos(th * R) + Vb) / R;
    $('r-ang').textContent = Math.round(beta) + '°';
    $('r-va').textContent = Va.toFixed(1).replace('.', ',') + ' nd';
    $('r-all').textContent = allure(th);
    const k = 125 / Math.max(Vr + Vb, 10);
    const B = [150, 150]; // position du bateau à l'écran
    const toS = (v) => [v[0] * k, -v[1] * k];
    const A = toS(va);
    const S = [B[0] - A[0], B[1] - A[1]];
    const T = toS(vt);
    const P = [S[0] + T[0], S[1] + T[1]];
    const hull = `<g transform="translate(${B[0]} ${B[1] + 28})"><path d="M0 -26 C 10 -12, 10 14, 7 24 L -7 24 C -10 14, -10 -12, 0 -26 Z" class="fill-card ln" stroke-width="1.4"/></g>`;
    $('va-svg').innerHTML = `${hull}
      ${arrow(S[0], S[1], P[0], P[1], 'st-navy', 'vent réel', 1)}
      ${Vb > 0 ? arrow(P[0], P[1], B[0], B[1], 'st-ok', 'vent vitesse', 1) : ''}
      ${arrow(S[0], S[1], B[0], B[1], 'st-signal', 'vent apparent', -1)}`;
  }
  box.addEventListener('input', draw);
  draw();
})();
