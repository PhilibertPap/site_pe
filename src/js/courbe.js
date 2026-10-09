// Petite courbe SVG, sans bibliothèque : progression d'un scout ou des équipages.
// series : [{ nom, pts: [{ x, y }] }] ; o.labels : étiquettes de l'axe horizontal (x = indice)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function courbe(series, o = {}) {
  const W = 640;
  const H = o.h || 220;
  const L = 36;
  const R = 12;
  const T = 12;
  const B = 28;
  const all = series.flatMap((s) => s.pts);
  if (!all.length) return '';
  const ymax = o.ymax ?? Math.max(10, ...all.map((p) => p.y)) * 1.1;
  const ymin = o.ymin ?? 0;
  const byIndex = !!o.labels;
  const n = byIndex ? o.labels.length : Math.max(...series.map((s) => s.pts.length));
  // sans étiquettes, les points sont espacés régulièrement (épreuves successives)
  const X = (i) => L + (n <= 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (n - 1));
  const Y = (v) => T + (1 - (v - ymin) / (ymax - ymin)) * (H - T - B);
  const ticks = [];
  const step = o.ystep || (ymax - ymin > 60 ? 20 : ymax - ymin > 30 ? 10 : 5);
  for (let v = ymin; v <= ymax + 1e-9; v += step) ticks.push(v);
  const grid = ticks
    .map((v) => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="cb-grid"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" class="cb-t">${Math.round(v)}</text>`)
    .join('');
  const seuil =
    o.seuil != null
      ? `<line x1="${L}" x2="${W - R}" y1="${Y(o.seuil)}" y2="${Y(o.seuil)}" class="cb-seuil"/><text x="${W - R}" y="${Y(o.seuil) - 5}" text-anchor="end" class="cb-t cb-seuil-t">${esc(o.seuilLabel || '')}</text>`
      : '';
  const xl = byIndex
    ? o.labels.map((t, i) => `<text x="${X(i)}" y="${H - 8}" text-anchor="middle" class="cb-t">${esc(t)}</text>`).join('')
    : '';
  const lines = series
    .map((s, k) => {
      const pts = s.pts.map((p, i) => [X(byIndex ? p.x : i), Y(p.y)]);
      if (!pts.length) return '';
      const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
      return `<g class="cb-s cb-c${k % 6}"><path d="${d}" fill="none"/>${pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3"/>`).join('')}</g>`;
    })
    .join('');
  const legend =
    series.length > 1
      ? `<div class="cb-leg">${series.map((s, k) => `<span class="cb-c${k % 6}"><i></i>${esc(s.nom)}</span>`).join('')}</div>`
      : '';
  return `<svg class="courbe" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'Courbe de progression')}">${grid}${seuil}${xl}${lines}</svg>${legend}`;
}
