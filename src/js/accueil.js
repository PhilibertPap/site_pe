// Page d'accueil, pour un inscrit connecté : un bandeau « Mon espace » avec son objectif, son carnet,
// le défi de la semaine, son équipage, et ses outils de chef ou de chef d'équipage.
import * as fb from './fb.js';
import { TOTAUX, valides } from './attendus.js';
import { objectifDe, ceDe } from './diplomes.js';
import { saisonDe, semaineDe } from './saison.js';

const box = document.getElementById('moi');
const ROOT = document.body.dataset.root || '';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

async function show(me) {
  const saison = saisonDe();
  const sem = semaineDe();
  const [carnet, defi, compos] = await Promise.all([
    fb.getCarnet(me.uid).catch(() => ({})),
    fb.getDefi(sem, me.uid).catch(() => null),
    fb.compositions(saison).catch(() => []),
  ]);
  const obj = objectifDe(me);
  const nv = valides(carnet, obj);
  const mien = compos.find((c) => (c.membres || []).some((x) => x.uid === me.uid));
  const ce = ceDe(me, saison);
  const items = [
    `<a href="${ROOT}carnet/index.html"><span class="moi-k">Carnet ${obj}</span><span class="moi-v">${nv} / ${TOTAUX[obj]}</span></a>`,
    defi
      ? `<a href="${ROOT}qcm/index.html"><span class="moi-k">Défi de la semaine</span><span class="moi-v">${defi.score}/10, relevé</span></a>`
      : `<a href="${ROOT}qcm/index.html#defi-box" class="moi-todo"><span class="moi-k">Défi de la semaine</span><span class="moi-v">à relever</span></a>`,
    mien ? `<a href="${ROOT}equipages/index.html"><span class="moi-k">Équipage</span><span class="moi-v">${esc(mien.nom)}</span></a>` : '',
    me.role === 'chef'
      ? `<a href="${ROOT}chefs/index.html" class="moi-chef"><span class="moi-k">Chefs</span><span class="moi-v">Espace chefs</span></a>`
      : ce
      ? `<a href="${ROOT}equipage/index.html" class="moi-chef"><span class="moi-k">Chef d’équipage</span><span class="moi-v">Mon équipage</span></a>`
      : '',
  ].filter(Boolean);
  box.innerHTML = `<p class="moi-h"><a href="${ROOT}compte/index.html">Mon espace</a>${me.objectif ? '' : ` <span class="moi-note">· choisissez votre objectif (PE, CQ ou CF) <a href="${ROOT}compte/index.html#objectif">ici</a></span>`}</p><div class="moi-row">${items.join('')}</div>`;
  box.hidden = false;
}

if (box)
  (window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
    if (me) show(me);
  });
