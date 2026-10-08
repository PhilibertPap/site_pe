// Figure d'une question de QCM (partagée par le QCM et le suivi des chefs).
import * as F from '../figures.js';

export function figure(f) {
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
