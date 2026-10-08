// Petits dessins pour les questions : situations entre voiliers, symboles de carte.

const HULL = 'M0 -16 C 7 -7, 7 9, 4.5 15 L -4.5 15 C -7 9, -7 -7, 0 -16 Z';

/**
 * Situation de route. boats : [{x, y, h (cap en degrés), amure: 'b'|'t'|null, label}]
 * wind : direction d'où vient le vent, en degrés (0 = du Nord, vers le bas du dessin).
 */
export function situ(boats, wind = 0, o = {}) {
  const W = o.w || 300;
  const H = o.h || 200;
  const wx = 30;
  const wy = 30;
  const rad = (wind * Math.PI) / 180;
  // flèche du vent : elle vient de la direction "wind" et souffle vers l'opposé
  const x1 = wx + 18 * Math.sin(rad);
  const y1 = wy - 18 * Math.cos(rad);
  const x2 = wx - 18 * Math.sin(rad);
  const y2 = wy + 18 * Math.cos(rad);
  const head = `<g transform="translate(${x2} ${y2}) rotate(${wind + 180})"><path d="M0 -6 L-5 4 L5 4 Z" class="fill-ink"/></g>`;
  const b = boats
    .map((bt) => {
      let boom = '';
      if (bt.amure === 't') boom = `<line x1="0" y1="-3" x2="-9" y2="12" class="ln st-navy" stroke-width="2.4"/>`;
      if (bt.amure === 'b') boom = `<line x1="0" y1="-3" x2="9" y2="12" class="ln st-navy" stroke-width="2.4"/>`;
      if (bt.moteur) boom = `<rect x="-3" y="2" width="6" height="8" class="fill-ink"/>`;
      const r = (bt.h * Math.PI) / 180;
      const tx = bt.x + 34 * Math.sin(r);
      const ty = bt.y - 34 * Math.cos(r);
      return `<line x1="${bt.x}" y1="${bt.y}" x2="${tx}" y2="${ty}" class="ln2" stroke-dasharray="3 3"/>
<g transform="translate(${bt.x} ${bt.y}) rotate(${bt.h})"><path d="${HULL}" class="fill-card ln" stroke-width="1.3"/>${boom}</g>
<text x="${bt.x + (bt.lx ?? 14)}" y="${bt.y + (bt.ly ?? 22)}" font-size="13" font-weight="600">${bt.label}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Situation entre navires" xmlns="http://www.w3.org/2000/svg">
<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ln" stroke-width="1.8"/>${head}
<text x="${wx + 16}" y="${wy - 12}" font-size="11">vent</text>
${b}
</svg>`;
}

// Symboles de la carte marine (simplifiés)
const MAG = '#a3307a';
export const SYMBOLES = {
  rocheDecouvrante: `<svg viewBox="0 0 60 50" width="90" height="75"><g class="ln" stroke-width="1.6"><path d="M30 13 V37 M18 25 H42 M21.5 16.5 L38.5 33.5 M38.5 16.5 L21.5 33.5"/></g></svg>`,
  rocheFleur: `<svg viewBox="0 0 60 50" width="90" height="75"><g class="ln" stroke-width="1.6"><path d="M30 14 V36 M19 25 H41"/></g><g class="fill-ink"><circle cx="23" cy="18" r="1.8"/><circle cx="37" cy="18" r="1.8"/><circle cx="23" cy="32" r="1.8"/><circle cx="37" cy="32" r="1.8"/></g></svg>`,
  rocheCouverte: `<svg viewBox="0 0 60 50" width="90" height="75"><circle cx="30" cy="25" r="15" class="ln" stroke-dasharray="2 2.4"/><g class="ln" stroke-width="1.6"><path d="M30 17 V33 M22 25 H38"/></g></svg>`,
  epaveDecouvrante: `<svg viewBox="0 0 60 50" width="90" height="75"><g class="fill-ink"><path d="M12 28 Q30 20 48 28 L44 32 H16 Z"/><rect x="26" y="20" width="4" height="6"/></g></svg>`,
  epaveDangereuse: `<svg viewBox="0 0 60 50" width="90" height="75"><ellipse cx="30" cy="25" rx="22" ry="12" class="ln" stroke-dasharray="2 2.4"/><g class="ln" stroke-width="1.6"><path d="M15 25 H45 M22 19 V31 M30 17 V33 M38 19 V31"/></g></svg>`,
  mouillage: `<svg viewBox="0 0 60 50" width="90" height="75"><g stroke="${MAG}" fill="none" stroke-width="1.8"><circle cx="30" cy="12" r="3"/><path d="M30 15 V38 M22 22 H38 M17 30 Q20 39 30 39 Q40 39 43 30"/></g></svg>`,
  mouillageInterdit: `<svg viewBox="0 0 60 50" width="90" height="75"><g stroke="${MAG}" fill="none" stroke-width="1.8"><circle cx="30" cy="12" r="3"/><path d="M30 15 V38 M22 22 H38 M17 30 Q20 39 30 39 Q40 39 43 30"/><path d="M14 8 L46 42" stroke-width="2.2"/></g></svg>`,
  cable: `<svg viewBox="0 0 60 50" width="90" height="75"><path d="M4 25 q7 -9 13 0 t13 0 t13 0 t13 0" stroke="${MAG}" fill="none" stroke-width="1.8"/></svg>`,
  sondeSoulignee: `<svg viewBox="0 0 60 50" width="90" height="75"><text x="20" y="30" font-size="20" class="it">2</text><text x="31" y="35" font-size="13" class="it">7</text><line x1="18" y1="37" x2="40" y2="37" class="ln" stroke-width="1.4"/></svg>`,
};
