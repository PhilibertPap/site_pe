// Accueil de l'espace chefs : ce qui attend (avec un lien vers l'endroit exact où agir),
// puis les outils, chacun avec ce à quoi il sert.
import * as fb from './fb.js';
import { aFaire } from './afaire.js';
import { publier, lire, majLe } from './agregats.js';
import { saisonLabel } from './saison.js';

const box = document.getElementById('chefs-accueil');
const ROOT = document.body.dataset.root || '../';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const quand = (d) =>
  d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

const OUTILS = [
  ['chefs/inscrits.html', 'Inscrits', 'Valider les comptes, confirmer les diplômes déclarés, nommer les chefs. L’objectif, l’équipage, les diplômes et le carnet de chacun.'],
  ['chefs/equipages.html', 'Équipages', 'Créer, renommer ou fermer les équipages ; les composer pour la saison et nommer leur chef d’équipage ; donner des points bonus.'],
  ['chefs/resultats.html', 'Résultats aux QCM', 'Réussite par thème, questions les plus ratées, détail par scout : de quoi choisir quoi reprendre en séance.'],
  ['equipage/index.html', 'Tableaux de bord d’équipage', 'Pour chaque équipage : qui s’entraîne, le défi, les thèmes faibles, les carnets, les demandes de validation.'],
  ['equipages/index.html', 'Classement', 'Le classement du mois et de la saison, tel que les scouts le voient.'],
  ['questions/index.html', 'Questions', 'Répondre aux scouts ; supprimer une question ou une réponse qui n’a pas sa place.'],
  ['chefs/guide.html', 'Guide des chefs', 'Le mode d’emploi : la rentrée, l’année, avant un examen, qui peut faire quoi, questions fréquentes.'],
];

async function show(me) {
  let r, tab;
  try {
    r = await aFaire(me);
    tab = await lire(r.saison, r.compos).catch(() => null);
  } catch (e) {
    box.innerHTML = `<p>${esc(fb.message(e))}</p>`;
    return;
  }
  const faire = r.items.filter((x) => x.compte);
  const rappels = r.items.filter((x) => !x.compte);
  const mois = new Date().getMonth();
  if (mois === 8) rappels.unshift({ n: '', texte: 'C’est la rentrée : créer la saison, composer les équipages, nommer les chefs d’équipage, rappeler aux scouts de choisir leur objectif.', action: 'La marche à suivre', href: 'chefs/guide.html#rentree' });
  const ligne = (x) => `<li${x.compte ? '' : ' class="rappel"'}><span class="af-n">${x.n}</span><span class="af-t">${esc(x.texte)}${x.note ? `<span class="small muted"> ${esc(x.note)}</span>` : ''}</span><a class="btn small${x.compte ? '' : ' ghost'}" href="${ROOT}${x.href}">${esc(x.action)}</a></li>`;
  const scouts = r.users.filter((u) => u.approved && u.role !== 'chef').length;
  const maj = tab ? majLe(tab) : null;

  box.innerHTML = `
  <p class="lede">Saison ${saisonLabel(r.saison)} · ${scouts} scout${scouts > 1 ? 's' : ''} inscrit${scouts > 1 ? 's' : ''}, ${r.compos.length} équipage${r.compos.length > 1 ? 's' : ''} composé${r.compos.length > 1 ? 's' : ''}.</p>
  <section class="afaire" aria-labelledby="afaire-h">
    <h2 id="afaire-h">À faire${faire.length ? ` <span class="acct-n">${r.total}</span>` : ''}</h2>
    ${faire.length ? `<ul class="af-list">${faire.map(ligne).join('')}</ul>` : '<p class="af-vide">Rien en attente : comptes, diplômes, demandes et questions sont à jour.</p>'}
    ${rappels.length ? `<h3>Rappels</h3><ul class="af-list">${rappels.map(ligne).join('')}</ul>` : ''}
  </section>

  <h2 id="outils">Les outils</h2>
  <ul class="outils">${OUTILS.map(([h, t, d]) => `<li><a href="${ROOT}${h}"><span class="pt">${t}</span><span class="pd">${d}</span></a></li>`).join('')}</ul>

  <h2 id="classement">Classement des équipages</h2>
  <p>Les scouts ne voient que le classement publié. Il est recalculé automatiquement quand un chef consulte le site (au plus toutes les 30 minutes), et à chaque enregistrement de la composition.</p>
  <p class="small muted" id="pub-etat">${maj ? `Dernière mise à jour : ${quand(maj)}.` : r.compos.length ? 'Pas encore calculé.' : 'Rien à calculer tant que les équipages ne sont pas composés.'}</p>
  ${r.compos.length ? '<div class="btns"><button class="btn small ghost" type="button" id="pub-go">Recalculer maintenant</button></div>' : ''}`;

  const go = box.querySelector('#pub-go');
  if (go)
    go.onclick = async () => {
      go.disabled = true;
      go.textContent = 'Calcul…';
      try {
        await publier(me, r.saison, { compos: r.compos });
        box.querySelector('#pub-etat').textContent = `Classement recalculé et publié le ${quand(new Date())}.`;
        go.textContent = 'Recalculer maintenant';
      } catch (e) {
        go.textContent = fb.message(e);
      }
      go.disabled = false;
    };
}

(window.PE && window.PE.userReady ? window.PE.userReady : Promise.resolve(null)).then((me) => {
  if (!me || me.role !== 'chef') {
    box.innerHTML = `<p>Cette page est réservée aux chefs. <a href="${ROOT}compte/index.html">Mon espace</a></p>`;
    return;
  }
  show(me);
});
