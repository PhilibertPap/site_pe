// Diplômes du scoutisme marin suivis sur le site, objectifs (PE, CQ, CF) et parcours de préparation.
// Module sans accès à Firebase : utilisé par les pages et par build.mjs (pages statiques des parcours).
import { saisonDe, moisLabel } from './saison.js';

// Diplômes et prérequis suivis. Date : mois d'obtention 'AAAA-MM'.
export const DIPLOMES = {
  pe_theo: { court: 'PE théorie', nom: 'Module théorique du PE' },
  pe_prat: { court: 'PE pratique', nom: 'Module oral et pratique du PE' },
  pe: { court: 'PE', nom: 'Patron d’embarcation' },
  cq: { court: 'CQ', nom: 'Chef de quart' },
  cf: { court: 'CF', nom: 'Chef de flottille' },
  permis: { court: 'Permis côtier', nom: 'Permis plaisance, option côtière' },
  psc1: { court: 'PSC1', nom: 'PSC1 (premiers secours)' },
  cep1: { court: 'CEP1', nom: 'CEP1' },
};
export const CODES = Object.keys(DIPLOMES);
export const MOIS_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// Diplômes confirmés d'un profil ; un ancien « A le PE » (pe: true, sans date) compte comme PE.
export function diplomesDe(p) {
  const d = { ...((p && p.dip) || {}) };
  if (p && p.pe === true && !d.pe) d.pe = '?';
  return d;
}
export const a = (p, code) => !!diplomesDe(p)[code];
// Formateur (réponses mises en avant dans les questions) : chef, ou titulaire du PE, du CQ ou du CF
export const estFormateur = (p) => !!p && (p.role === 'chef' || a(p, 'pe') || a(p, 'cq') || a(p, 'cf'));
// Plus haut diplôme confirmé, affiché à côté du nom dans les réponses
export const titre = (p) => (['cf', 'cq', 'pe'].find((c) => a(p, c)) || '').toUpperCase();

// Chef d'équipage d'une saison : users/{uid}.ce = { '2026': '<id équipage>' }
export const ceDe = (p, s = saisonDe()) => (p && p.ce && typeof p.ce[String(s)] === 'string' ? p.ce[String(s)] : '');
export const estChefEq = (p, s = saisonDe()) => !!ceDe(p, s);

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Badges des diplômes confirmés. tous : aussi les modules du PE et les prérequis.
export function badges(p, tous = false) {
  const d = diplomesDe(p);
  const codes = tous ? CODES.filter((c) => !(d.pe && (c === 'pe_theo' || c === 'pe_prat'))) : ['pe', 'cq', 'cf'];
  return codes
    .filter((c) => d[c])
    .map((c) => {
      const t = d[c] === '?' ? 'sans date' : moisLabel(d[c]);
      return `<span class="tag tag-dip${['pe', 'cq', 'cf'].includes(c) ? ' main' : ''}" title="${esc(DIPLOMES[c].nom)}, ${t}">${DIPLOMES[c].court}</span>`;
    })
    .join('');
}

// ------------------------------------------------ modules du PE : 18 mois

export const VALIDITE_MODULE = 18;
export function plusMois(m, n) {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
// Mois restants avant l'expiration d'un module validé le mois m (négatif : expiré)
export function moisRestants(m, now = new Date()) {
  const [y, mo] = plusMois(m, VALIDITE_MODULE).split('-').map(Number);
  return (y - now.getFullYear()) * 12 + (mo - 1 - now.getMonth());
}

// ------------------------------------------------------- objectifs

export const OBJECTIFS = {
  PE: {
    nom: 'Patron d’embarcation',
    page: 'parcours/pe.html',
    requis: [],
    vise: ['pe_theo', 'pe_prat', 'pe'],
    autres: ['14 ans pour se présenter (en pratique 15 ou 16 ans) ; brevet valable à 16 ans', 'Test d’aisance aquatique pour le module oral et pratique'],
  },
  CQ: {
    nom: 'Chef de quart',
    page: 'parcours/cq.html',
    requis: ['pe', 'permis', 'psc1'],
    vise: ['cq'],
    autres: ['Année des 18 ans', 'Test préalable de navigation à la voile, à organiser avec la Passerelle', 'CV scout et marin'],
  },
  CF: {
    nom: 'Chef de flottille',
    page: 'parcours/cf.html',
    requis: ['pe', 'permis', 'psc1', 'cep1'],
    conseil: ['cq'],
    vise: ['cf'],
    autres: ['Année des 20 ans', 'Expérience de chef de bord et d’encadrement de flottille (normalement le CQ)', 'CV nautique, avec des navigations hors du cadre scout'],
  },
};
export const objectifDe = (p) => (p && OBJECTIFS[p.objectif] ? p.objectif : 'PE');

// Étapes de chaque parcours : [titre, texte, [[libellé, lien], ...]]
const CH = [
  ['Carte', 'cours/01-carte.html'],
  ['Compas', 'cours/02-compas.html'],
  ['Estime et courant', 'cours/03-estime.html'],
  ['Marée', 'cours/04-maree.html'],
  ['Balisage', 'cours/05-balisage.html'],
  ['Règles de barre', 'cours/06-ripam.html'],
  ['Feux et signaux', 'cours/07-signaux.html'],
  ['Météo', 'cours/08-meteo.html'],
  ['Sécurité', 'cours/09-securite.html'],
  ['VHF', 'cours/10-vhf.html'],
];
export const ETAPES = {
  PE: [
    ['Lire le cours, dans l’ordre', 'Chaque chapitre s’appuie sur les précédents. Le chapitre Sécurité contient le cadre du scoutisme marin et les prérogatives du PE.', CH],
    ['S’exercer sur la carte et la marée', 'Des énoncés générés à volonté, avec corrigé, dès qu’un chapitre est lu.', [['Compas', 'exercices/compas.html'], ['Estime et courant', 'exercices/estime.html'], ['Marée', 'exercices/maree.html']]],
    ['Travailler le QCM', 'Par thème d’abord, en épreuve blanche ensuite (30 questions, 5 fautes admises). Le défi de la semaine compte pour l’équipage.', [['QCM', 'qcm/index.html']]],
    ['Passer aux problèmes d’examen', 'Problèmes de navigation sur carte et de marée, puis sujets d’annales en temps limité (1 h).', [['Problèmes type examen', 'exercices/problemes.html'], ['Annales', 'annales/index.html']]],
    ['Connaître son bateau', 'Le Loup de mer et le Maxus 26, le croiseur de l’examen ; le gréement, les réglages.', [['Le voilier', 'pratique/voilier.html'], ['Les bateaux des scouts marins', 'pratique/bateaux.html'], ['Allures et réglages', 'pratique/reglages.html']]],
    ['Manœuvrer', 'Ce que le jury fait faire sur l’eau : virements, empannages, ris, homme à la mer, port et mouillage.', [['Manœuvres sous voiles', 'pratique/manoeuvres.html'], ['Manœuvres de port', 'pratique/port.html'], ['Le mouillage', 'pratique/mouillage.html'], ['Homme à la mer', 'pratique/hlm.html'], ['Avaries', 'pratique/avaries.html'], ['Nœuds', 'pratique/noeuds.html']]],
    ['Conduire une navigation', 'Préparer, vérifier le bateau, briefer et commander l’équipage, tenir le journal. Puis s’entraîner sur l’eau, étape par étape.', [['Conduire une navigation', 'pratique/chef-de-bord.html'], ['S’entraîner sur l’eau', 'pratique/entrainement.html']]],
    ['Préparer l’oral', 'Préparer une navigation en 30 minutes, la présenter, gérer une avarie devant le jury.', [['L’oral et la navigation du PE', 'pratique/oral-pe.html']]],
  ],
  CQ: [
    ['Maîtriser le PE', 'Le jury peut interroger sur tout le programme du PE, et le CQ doit pouvoir l’enseigner.', [['Cours', 'cours/index.html'], ['Sécurité et réglementation', 'cours/09-securite.html'], ['Conduire une navigation', 'pratique/chef-de-bord.html'], ['Oral du PE', 'pratique/oral-pe.html']]],
    ['Connaître le diplôme', 'Prérogatives, responsabilités, prérequis, examen en trois actes, inscription.', [['Les diplômes et l’examen', 'cqcf/diplomes.html']]],
    ['Préparer la navigation', 'Bateaux et zone, visa marin, météo et marée, correspondant à terre, journée type, briefing.', [['Préparer la navigation', 'cqcf/preparer.html']]],
    ['Rédiger le dossier', 'Une fiche par jour, des horaires larges, des replis réels, une carte résumé.', [['Le dossier de navigation', 'cqcf/dossier.html']]],
    ['Conduire la flottille', 'Se placer, passer les consignes par VHF, sortir et rentrer au port, mouiller, débriefer.', [['Conduire une flottille', 'cqcf/flottille.html']]],
    ['Mener le bateau de sécurité', 'Prise en main, conduite dans le clapot, approche, remorquage, pannes simples.', [['Le bateau de sécurité', 'cqcf/bateau-secu.html']]],
    ['Gérer les avaries', 'De l’extérieur : état des lieux, alerte, mise en sécurité de la flottille.', [['Avaries et secours', 'cqcf/avaries.html']]],
    ['Faire vivre la dimension scoute', 'Les cinq buts en mer, l’équipage, le jeu et l’imaginaire.', [['La dimension scoute', 'cqcf/pedagogie.html']]],
    ['S’entraîner à l’oral', 'Présenter son dossier en 15 à 20 minutes, répondre aux mises en situation.', [['Questions d’oral', 'cqcf/oral.html']]],
  ],
  CF: [
    ['Maîtriser le PE et la conduite d’un habitable', 'Le CF mène son propre voilier en encadrant : manœuvres en autonomie, homme à la mer, port.', [['Les bateaux des scouts marins', 'pratique/bateaux.html'], ['Manœuvres sous voiles', 'pratique/manoeuvres.html'], ['Manœuvres de port', 'pratique/port.html'], ['Homme à la mer', 'pratique/hlm.html']]],
    ['Connaître le diplôme', 'Prérogatives du CF et du CQ, responsabilités, prérequis, sujet et examen.', [['Les diplômes et l’examen', 'cqcf/diplomes.html']]],
    ['Préparer une navigation de plusieurs jours', 'Météo et marée, correspondant à terre, briefing des chefs de bord.', [['Préparer la navigation', 'cqcf/preparer.html']]],
    ['Répondre au sujet par un dossier', 'Visa marin technique, fiches journalières, carte A4 des étapes.', [['Le dossier de navigation', 'cqcf/dossier.html']]],
    ['Encadrer une flottille d’habitables', 'Bateaux, chefs de bord, escales, départ, en mer, arrivée, mouillage de nuit, documents.', [['La flottille d’habitables', 'cqcf/habitables.html'], ['Conduire une flottille', 'cqcf/flottille.html']]],
    ['Gérer les avaries', 'Depuis un habitable : état des lieux, alerte, sécurité de la flottille, compte rendu.', [['Avaries et secours', 'cqcf/avaries.html']]],
    ['Former les jeunes', 'Le CF est un formateur : journées complètes, vie à bord, jeu, progression de chacun.', [['La dimension scoute', 'cqcf/pedagogie.html']]],
    ['S’entraîner à l’oral', 'Présenter le dossier au jury, répondre aux questions propres au CF.', [['Questions d’oral', 'cqcf/oral.html']]],
  ],
};

// Liste HTML des étapes (pages de parcours et Mon espace)
export function etapesHTML(obj, root = '') {
  return `<ol class="etapes">${ETAPES[obj]
    .map(
      ([t, txt, liens]) => `<li><p class="etape-t">${t}</p><p class="etape-d">${txt}</p><p class="etape-l">${liens
        .map(([l, h]) => `<a href="${root}${h}">${l}</a>`)
        .join(' · ')}</p></li>`
    )
    .join('')}</ol>`;
}
