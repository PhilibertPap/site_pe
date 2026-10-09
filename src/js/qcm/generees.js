// Questions générées à partir des figures : la figure est tirée de la liste, les mauvaises
// réponses sont prises parmi les cas qu'on confond le plus souvent. Chaque variante a un id
// stable (le suivi des chefs peut donc la retrouver), seuls les distracteurs changent.

import { situ } from './dessins.js';

const B = 'cours/05-balisage.html';
const S = 'cours/07-signaux.html';

function pick(list, n, avoid) {
  const pool = list.filter((x) => x !== avoid);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

// Construit une question : bonne réponse en premier (les choix sont mélangés à l'affichage).
function mk(id, t, q, good, wrong, e, ref, fig) {
  return { id, t, q, c: [good, ...wrong], a: 0, e, ref, fig, gen: true };
}

// ------------------------------------------------------------- balisage

const MARK = {
  babord: ['Marque latérale bâbord', 'laterales'],
  tribord: ['Marque latérale tribord', 'laterales'],
  'chenal-pref-tribord': ['Bifurcation, chenal préféré à tribord', 'laterales'],
  'chenal-pref-babord': ['Bifurcation, chenal préféré à bâbord', 'laterales'],
  'cardinale-n': ['Cardinale Nord', 'cardinales'],
  'cardinale-e': ['Cardinale Est', 'cardinales'],
  'cardinale-s': ['Cardinale Sud', 'cardinales'],
  'cardinale-w': ['Cardinale Ouest', 'cardinales'],
  'danger-isole': ['Marque de danger isolé', 'danger-isole'],
  'eaux-saines': ['Marque d’eaux saines', 'eaux-saines'],
  speciale: ['Marque spéciale', 'speciales'],
  'danger-nouveau': ['Bouée d’urgence d’épave (danger nouveau)', 'danger-nouveau'],
  'plage-babord': ['Chenal d’accès à la plage, côté bâbord', 'plages'],
  'plage-tribord': ['Chenal d’accès à la plage, côté tribord', 'plages'],
  'plage-limite': ['Limite de la zone de baignade ou de la bande des 300 m', 'plages'],
};
const MARK_E = {
  babord: 'Rouge, forme cylindrique, voyant cylindre rouge : on la laisse à bâbord en entrant au port (sens conventionnel du balisage).',
  tribord: 'Verte, forme conique, voyant cône vert pointe en haut : on la laisse à tribord en entrant au port.',
  'chenal-pref-tribord': 'Rouge avec une large bande verte : marque bâbord modifiée. Le chenal principal (préféré) est à tribord.',
  'chenal-pref-babord': 'Verte avec une large bande rouge : marque tribord modifiée. Le chenal principal (préféré) est à bâbord.',
  'cardinale-n': 'Deux cônes pointes en haut, noir au-dessus du jaune : le noir est du côté des pointes. On passe au nord.',
  'cardinale-e': 'Deux cônes opposés par la base (« œuf »), noir avec une bande jaune : on passe à l’est.',
  'cardinale-s': 'Deux cônes pointes en bas, noir sous le jaune : on passe au sud.',
  'cardinale-w': 'Deux cônes opposés par la pointe (« sablier », W comme « wasp »), jaune avec une bande noire : on passe à l’ouest.',
  'danger-isole': 'Noire à bandes rouges, deux boules noires : danger d’étendue limitée, eaux saines tout autour.',
  'eaux-saines': 'Bandes verticales rouges et blanches, une boule rouge : eaux saines tout autour, souvent l’atterrissage d’un chenal.',
  speciale: 'Jaune, voyant croix de Saint-André jaune : zone ou ouvrage particulier (zone militaire, câble, ferme aquacole…).',
  'danger-nouveau': 'Bandes verticales bleues et jaunes, croix droite jaune : danger nouveau, pas encore porté sur les cartes.',
  'plage-babord': 'Jaune, cylindrique, voyant rouge : côté bâbord du chenal traversier qui coupe la bande des 300 m.',
  'plage-tribord': 'Jaune, conique, voyant vert : côté tribord du chenal traversier qui coupe la bande des 300 m.',
  'plage-limite': 'Petite bouée sphérique jaune : limite de la zone réservée à la baignade ou de la bande des 300 m.',
};
// groupes de confusion pour les distracteurs
const MARK_NEAR = {
  babord: ['tribord', 'chenal-pref-tribord', 'plage-babord', 'danger-isole'],
  tribord: ['babord', 'chenal-pref-babord', 'plage-tribord', 'speciale'],
  'chenal-pref-tribord': ['chenal-pref-babord', 'babord', 'danger-isole', 'eaux-saines'],
  'chenal-pref-babord': ['chenal-pref-tribord', 'tribord', 'danger-isole', 'eaux-saines'],
  'cardinale-n': ['cardinale-s', 'cardinale-e', 'cardinale-w'],
  'cardinale-e': ['cardinale-w', 'cardinale-n', 'cardinale-s'],
  'cardinale-s': ['cardinale-n', 'cardinale-e', 'cardinale-w'],
  'cardinale-w': ['cardinale-e', 'cardinale-n', 'cardinale-s'],
  'danger-isole': ['eaux-saines', 'cardinale-e', 'speciale'],
  'eaux-saines': ['danger-isole', 'speciale', 'danger-nouveau'],
  speciale: ['plage-limite', 'danger-nouveau', 'eaux-saines', 'cardinale-s'],
  'danger-nouveau': ['speciale', 'eaux-saines', 'danger-isole'],
  'plage-babord': ['babord', 'plage-tribord', 'speciale'],
  'plage-tribord': ['tribord', 'plage-babord', 'speciale'],
  'plage-limite': ['speciale', 'plage-babord', 'danger-nouveau'],
};

const marks = Object.keys(MARK).map((k) =>
  mk(
    'g-mq-' + k,
    'balisage',
    'Quelle est cette marque ?',
    MARK[k][0],
    pick(MARK_NEAR[k], 3).map((x) => MARK[x][0]),
    MARK_E[k],
    B + '#' + MARK[k][1],
    { k: 'balise', v: k }
  )
);

// De nuit : rythme et couleur d'un feu de balisage
const NIGHT_MARK = [
  ['cardinale-n', 'Q', 'W', '', 'Feu blanc scintillant continu : cardinale Nord.'],
  ['cardinale-e', 'Q(3)', 'W', 10, 'Trois scintillements groupés (3 heures sur un cadran) : cardinale Est.'],
  ['cardinale-s', 'Q(6)+LFl', 'W', 15, 'Six scintillements et un éclat long (6 heures) : cardinale Sud. L’éclat long évite de confondre 6 et 9.'],
  ['cardinale-w', 'Q(9)', 'W', 15, 'Neuf scintillements groupés (9 heures) : cardinale Ouest.'],
  ['danger-isole', 'Fl(2)', 'W', 5, 'Deux éclats blancs groupés : danger isolé (comme ses deux boules).'],
  ['eaux-saines', 'LFl', 'W', 10, 'Feu blanc à éclat long toutes les 10 s : eaux saines (on trouve aussi isophase, occultations ou Mo(A)).'],
  ['eaux-saines', 'Iso', 'W', 4, 'Feu blanc isophase : eaux saines.'],
  ['speciale', 'Fl', 'Y', 5, 'Feu jaune : marque spéciale. Le jaune est réservé aux marques spéciales (et aux plages).'],
  ['babord', 'Fl(2)', 'R', 6, 'Feu rouge (rythme quelconque, hors Fl(2+1)) : marque latérale bâbord.'],
  ['tribord', 'Fl(3)', 'G', 10, 'Feu vert (rythme quelconque, hors Fl(2+1)) : marque latérale tribord.'],
  ['chenal-pref-tribord', 'Fl(2+1)', 'R', 10, 'Rouge à éclats groupés 2 + 1 : bifurcation, chenal préféré à tribord.'],
  ['chenal-pref-babord', 'Fl(2+1)', 'G', 10, 'Vert à éclats groupés 2 + 1 : bifurcation, chenal préféré à bâbord.'],
  ['danger-nouveau', 'Al', 'Bu,Y', 4, 'Feu alternativement bleu et jaune : bouée d’urgence d’épave.'],
];
const nightMarks = NIGHT_MARK.map(([k, r, c, p, e], i) =>
  mk(
    'g-fb-' + k + '-' + i,
    'balisage',
    'De nuit, vous observez ce feu (observez son rythme). Quelle marque le porte ?',
    MARK[k][0],
    pick(MARK_NEAR[k], 3).map((x) => MARK[x][0]),
    e,
    B + '#feux',
    { k: 'feu', r, c, p }
  )
);

// Passer une cardinale, où est le danger
const CARD = { n: 'nord', e: 'est', s: 'sud', w: 'ouest' };
const cardPass = Object.entries(CARD).map(([k, v]) =>
  mk(
    'g-cp-' + k,
    'balisage',
    'Vous voyez cette marque devant vous. Pour passer en sécurité :',
    `Je passe au ${v} de la marque`,
    Object.values(CARD)
      .filter((x) => x !== v)
      .map((x) => `Je passe au ${x} de la marque`),
    `C’est une cardinale ${v[0].toUpperCase() + v.slice(1)} : les eaux saines sont au ${v} de la marque, le danger de l’autre côté. Les pointes des cônes indiquent où passer.`,
    B + '#cardinales',
    { k: 'balise', v: 'cardinale-' + k }
  )
);
const OPP = { n: 'sud', e: 'ouest', s: 'nord', w: 'est' };
const cardDanger = Object.entries(OPP).map(([k, v]) =>
  mk(
    'g-cd-' + k,
    'balisage',
    'Par rapport à cette marque, où se trouve le danger ?',
    `Au ${v} de la marque`,
    Object.values(OPP)
      .filter((x) => x !== v)
      .map((x) => `Au ${x} de la marque`),
    `Cardinale ${CARD[k][0].toUpperCase() + CARD[k].slice(1)} : on passe au ${CARD[k]}, le danger est donc au ${v}.`,
    B + '#cardinales',
    { k: 'balise', v: 'cardinale-' + k }
  )
);

// Lire une caractéristique de feu sur la carte
const RHYTHM = [
  ['Iso 4s', 'Isophase : durées de lumière et d’obscurité égales', 'Iso : lumière et obscurité de durées égales (ici 2 s + 2 s).'],
  ['Oc(2) 6s', 'À occultations groupées : la lumière domine, coupée par deux brèves obscurités', 'Oc : la durée de lumière est plus longue que celle d’obscurité ; (2) : deux occultations groupées.'],
  ['Fl(3) 12s', 'À éclats groupés : trois brefs éclats, puis une longue obscurité', 'Fl : l’obscurité domine, coupée par des éclats ; (3) : trois éclats groupés par période de 12 s.'],
  ['Q', 'Scintillant : 50 à 80 éclats par minute, en continu', 'Q (quick) : feu scintillant, 50 à 80 éclats par minute.'],
  ['VQ', 'Scintillant rapide : 80 à 160 éclats par minute', 'VQ (very quick) : scintillant rapide, 80 à 160 éclats par minute.'],
  ['LFl 10s', 'À éclat long : un éclat d’au moins 2 s, toutes les 10 s', 'LFl : éclat long, d’au moins 2 secondes.'],
  ['Al WR 4s', 'Alternatif : il change de couleur (blanc, puis rouge)', 'Al : feu alternatif, qui change de couleur au cours de sa période.'],
  ['F R', 'Fixe rouge : lumière continue, sans variation', 'F : feu fixe, allumé en permanence.'],
];
const rhythms = RHYTHM.map(([code, good, e], i) =>
  mk(
    'g-rf-' + i,
    'balisage',
    `Sur la carte, un feu porte l’indication <span class="mono">${code}</span>. C’est un feu :`,
    good,
    pick(
      RHYTHM.map((r) => r[1]),
      3,
      good
    ),
    e,
    B + '#feux'
  )
);

// ------------------------------------------------------ feux des navires

const LIGHTS = {
  'moteur-face': ['Un navire à moteur de moins de 50 m, qui vient vers moi', 'Feu de mât blanc et les deux feux de côté : navire à propulsion mécanique vu de l’avant ; un seul feu de mât, donc moins de 50 m.'],
  'moteur50-face': ['Un navire à moteur de plus de 50 m, qui vient vers moi', 'Deux feux de mât (l’arrière plus haut) et les deux feux de côté : navire à moteur de 50 m ou plus, vu de l’avant.'],
  'moteur-tribord': ['Un navire à moteur qui me montre son flanc tribord', 'Feu de mât et feu vert seul : je vois son côté tribord, il croise de ma gauche vers ma droite.'],
  'moteur-babord': ['Un navire à moteur qui me montre son flanc bâbord', 'Feu de mât et feu rouge seul : je vois son côté bâbord, il croise de ma droite vers ma gauche.'],
  'moteur50-tribord': ['Un navire à moteur de plus de 50 m qui me montre son flanc tribord', 'Deux feux de mât décalés et un feu vert : grand navire à moteur vu par tribord. Le feu de mât avant est le plus bas : il va vers la droite.'],
  'voilier-face': ['Un voilier faisant route, qui vient vers moi', 'Vert et rouge sans feu de mât : navire à voile faisant route, vu de l’avant.'],
  'voilier-tricolore-face': ['Un voilier faisant route, qui vient vers moi (feu tricolore en tête de mât)', 'Moins de 20 m, un voilier peut regrouper ses feux de côté et de poupe dans un feu tricolore en tête de mât.'],
  'voilier-rv-face': ['Un voilier faisant route, qui vient vers moi (feux rouge sur vert en tête de mât)', 'Rouge sur vert visibles sur tout l’horizon, en plus des feux de côté : feux facultatifs d’un navire à voile (règle 25).'],
  nuc: ['Un navire non maître de sa manœuvre, sans erre', 'Deux feux rouges superposés visibles sur tout l’horizon, sans feux de côté : non maître de sa manœuvre et stoppé.'],
  'nuc-face': ['Un navire non maître de sa manœuvre, qui fait route vers moi', 'Deux rouges superposés et les feux de côté : non maître de sa manœuvre, avec de l’erre. Pas de feu de mât.'],
  echoue: ['Un navire échoué', 'Deux rouges superposés et un feu de mouillage blanc : navire échoué.'],
  'tirant-eau': ['Un navire handicapé par son tirant d’eau, qui vient vers moi', 'Trois feux rouges superposés en plus des feux de route : handicapé par son tirant d’eau.'],
  'ram-face': ['Un navire à capacité de manœuvre restreinte, qui vient vers moi', 'Rouge, blanc, rouge superposés et feux de route : capacité de manœuvre restreinte (travaux, câblier, ravitaillement…).'],
  ram: ['Un navire à capacité de manœuvre restreinte, sans erre', 'Rouge, blanc, rouge superposés, sans feux de côté : capacité de manœuvre restreinte, stoppé.'],
  chalutier: ['Un chalutier en pêche, sans erre', 'Vert sur blanc : chalutier en pêche (« vert sur blanc, chalutier en pêche »). Sans feux de côté, il n’a pas d’erre.'],
  'chalutier-face': ['Un chalutier en pêche, qui vient vers moi', 'Vert sur blanc et feux de côté : chalutier en pêche faisant route.'],
  peche: ['Un navire en pêche, autre qu’un chalutier, sans erre', 'Rouge sur blanc : navire en pêche autre que chalutier (filets, lignes).'],
  'peche-face': ['Un navire en pêche, autre qu’un chalutier, qui vient vers moi', 'Rouge sur blanc et feux de côté : pêcheur (non chalutier) faisant route.'],
  pilote: ['Un bateau pilote en service, sans erre', 'Blanc sur rouge : bateau pilote en service (« blanc sur rouge, pilote à bord »).'],
  'pilote-face': ['Un bateau pilote en service, qui vient vers moi', 'Blanc sur rouge et feux de côté : bateau pilote en service faisant route.'],
  'remorqueur-face': ['Un remorqueur dont la remorque fait moins de 200 m, qui vient vers moi', 'Deux feux de mât superposés : remorque de moins de 200 m (trois au-delà).'],
  'remorqueur200-face': ['Un remorqueur dont la remorque dépasse 200 m, qui vient vers moi', 'Trois feux de mât superposés : la remorque dépasse 200 m.'],
  'remorqueur-arriere': ['Un remorqueur, vu de l’arrière', 'Feu jaune de remorquage au-dessus du feu de poupe blanc : remorqueur vu de l’arrière.'],
  'deminage-face': ['Un navire en opération de déminage, qui vient vers moi', 'Trois feux verts en triangle : déminage, ne pas s’approcher à moins de 1 000 m.'],
  mouillage50: ['Un navire de plus de 50 m au mouillage', 'Deux feux blancs, celui de l’avant plus haut que celui de l’arrière : navire de 50 m ou plus au mouillage.'],
};
const LIGHT_NEAR = {
  'moteur-face': ['moteur50-face', 'voilier-face', 'pilote-face', 'remorqueur-face'],
  'moteur50-face': ['moteur-face', 'remorqueur-face', 'remorqueur200-face', 'tirant-eau'],
  'moteur-tribord': ['moteur-babord', 'moteur50-tribord', 'moteur-face'],
  'moteur-babord': ['moteur-tribord', 'moteur-face', 'moteur50-tribord'],
  'moteur50-tribord': ['moteur-tribord', 'moteur-babord', 'moteur50-face'],
  'voilier-face': ['moteur-face', 'voilier-rv-face', 'nuc-face'],
  'voilier-tricolore-face': ['voilier-face', 'moteur-face', 'voilier-rv-face'],
  'voilier-rv-face': ['peche-face', 'chalutier-face', 'nuc-face'],
  nuc: ['echoue', 'ram', 'peche'],
  'nuc-face': ['tirant-eau', 'ram-face', 'voilier-rv-face'],
  echoue: ['nuc', 'mouillage50', 'ram'],
  'tirant-eau': ['nuc-face', 'ram-face', 'remorqueur200-face'],
  'ram-face': ['tirant-eau', 'nuc-face', 'pilote-face'],
  ram: ['nuc', 'echoue', 'pilote'],
  chalutier: ['peche', 'pilote', 'nuc'],
  'chalutier-face': ['peche-face', 'pilote-face', 'voilier-rv-face'],
  peche: ['chalutier', 'pilote', 'nuc'],
  'peche-face': ['chalutier-face', 'pilote-face', 'voilier-rv-face'],
  pilote: ['peche', 'chalutier', 'ram'],
  'pilote-face': ['peche-face', 'chalutier-face', 'ram-face'],
  'remorqueur-face': ['remorqueur200-face', 'moteur50-face', 'moteur-face'],
  'remorqueur200-face': ['remorqueur-face', 'tirant-eau', 'moteur50-face'],
  'remorqueur-arriere': ['pilote', 'mouillage50', 'chalutier'],
  'deminage-face': ['chalutier-face', 'remorqueur-face', 'ram-face'],
  mouillage50: ['echoue', 'moteur50-tribord', 'remorqueur-face'],
};
const shipLights = Object.keys(LIGHTS).map((k) =>
  mk(
    'g-fn-' + k,
    'feux',
    'De nuit, vous apercevez ces feux. Il s’agit :',
    LIGHTS[k][0].replace(/^Un /, 'd’un '),
    pick(LIGHT_NEAR[k], 3).map((x) => LIGHTS[x][0].replace(/^Un /, 'd’un ')),
    LIGHTS[k][1],
    S + '#speciaux',
    { k: 'nuit', v: k }
  )
);

// Marques de jour
const DAY = {
  boule: ['Un navire au mouillage', 'Une boule noire à l’avant : navire au mouillage.'],
  'boule,boule': ['Un navire non maître de sa manœuvre', 'Deux boules superposées : non maître de sa manœuvre.'],
  'boule,boule,boule': ['Un navire échoué', 'Trois boules superposées : navire échoué.'],
  'boule,losange,boule': ['Un navire à capacité de manœuvre restreinte', 'Boule, bipyramide (losange), boule : capacité de manœuvre restreinte.'],
  cylindre: ['Un navire handicapé par son tirant d’eau', 'Un cylindre : handicapé par son tirant d’eau.'],
  'cone-bas': ['Un voilier qui fait route au moteur', 'Un cône pointe en bas : navire à voile qui utilise aussi son moteur. Il est alors considéré comme un navire à moteur.'],
  sablier: ['Un navire en pêche', 'Deux cônes réunis par la pointe : navire en train de pêcher.'],
  losange: ['Un remorqueur dont la remorque dépasse 200 m', 'Une bipyramide (losange) : remorquage de plus de 200 m, portée par le remorqueur et le remorqué.'],
};
const dayKeys = Object.keys(DAY);
const dayMarks = dayKeys.map((k) =>
  mk(
    'g-mj-' + k.replace(/,/g, '-'),
    'feux',
    'De jour, un navire arbore cette marque. C’est :',
    DAY[k][0].replace(/^Un /, 'un '),
    pick(dayKeys, 3, k).map((x) => DAY[x][0].replace(/^Un /, 'un ')),
    DAY[k][1],
    S + '#speciaux',
    { k: 'marques', v: k.split(',') }
  )
);

// --------------------------------------------------------------- signaux

const FLAG = {
  A: 'J’ai un plongeur en immersion : tenez-vous à distance et ralentissez',
  B: 'Je charge, décharge ou transporte des matières dangereuses',
  C: 'Oui (affirmatif)',
  D: 'Écartez-vous de moi, je manœuvre avec difficulté',
  H: 'J’ai un pilote à bord',
  N: 'Non (négatif)',
  O: 'Un homme à la mer',
  P: 'Au port : tout le monde à bord, le navire va appareiller',
  Q: 'Mon navire est indemne, je demande la libre pratique',
  V: 'Je demande assistance',
  NC: 'Je suis en détresse et demande une assistance immédiate',
};
const flagKeys = Object.keys(FLAG);
const flags = flagKeys.map((k) =>
  mk(
    'g-pv-' + k,
    'signaux',
    k === 'NC' ? 'Un navire hisse ces deux pavillons. Ils signifient :' : 'Un navire hisse ce pavillon seul. Il signifie :',
    FLAG[k],
    pick(flagKeys, 3, k).map((x) => FLAG[x]),
    k === 'NC'
      ? 'N au-dessus de C : signal de détresse (annexe IV du RIPAM). N seul veut dire « non », C seul « oui ».'
      : `Pavillon ${k} du code international des signaux : « ${FLAG[k].toLowerCase()} ».`,
    S + '#pavillons',
    { k: 'pavillon', v: k }
  )
);

const SOUND_CLEAR = {
  '.': 'Je viens sur tribord',
  '..': 'Je viens sur bâbord',
  '...': 'Ma machine bat en arrière',
  '.....': 'Je ne comprends pas vos intentions, ou je doute que vous manœuvriez suffisamment',
  '--.': 'J’ai l’intention de vous rattraper par votre tribord',
  '--..': 'J’ai l’intention de vous rattraper par votre bâbord',
  '-.-.': 'Je suis d’accord pour être rattrapé',
};
const clearKeys = Object.keys(SOUND_CLEAR);
const soundsClear = clearKeys.map((k, i) =>
  mk(
    'g-sc-' + i,
    'signaux',
    'Par bonne visibilité, un navire en vue émet ce signal (écoutez-le). Il signifie :',
    SOUND_CLEAR[k],
    pick(clearKeys, 3, k).map((x) => SOUND_CLEAR[x]),
    'Signaux de manœuvre et d’avertissement de la règle 34 : un bref, tribord ; deux brefs, bâbord ; trois brefs, en arrière ; cinq brefs ou plus, doute. Les signaux qui commencent par deux sons prolongés concernent les dépassements dans un chenal.',
    S + '#sonores',
    { k: 'son', v: k }
  )
);
const SOUND_FOG = {
  '-': 'Un navire à moteur qui fait route avec de l’erre',
  '--': 'Un navire à moteur qui fait route mais est stoppé, sans erre',
  '-..': 'Un voilier, un pêcheur ou un navire gêné dans sa manœuvre',
  '-...': 'Un navire remorqué',
};
const fogKeys = Object.keys(SOUND_FOG);
const soundsFog = fogKeys.map((k, i) =>
  mk(
    'g-sb-' + i,
    'signaux',
    'Par brume, vous entendez ce signal toutes les deux minutes environ (écoutez-le). Il vient :',
    SOUND_FOG[k].replace(/^Un /, 'd’un '),
    pick(fogKeys, 3, k).map((x) => SOUND_FOG[x].replace(/^Un /, 'd’un ')),
    'Règle 35 : un prolongé, moteur avec de l’erre ; deux prolongés, moteur stoppé ; un prolongé et deux brefs, voilier, pêcheur, non maître de sa manœuvre, capacité restreinte, tirant d’eau, remorqueur ; un prolongé et trois brefs, le remorqué.',
    S + '#sonores',
    { k: 'son', v: k }
  )
);

const PORT = [
  [['R', 'R', 'R'], true, 'Danger grave : tous les navires s’arrêtent ou se déroutent selon les instructions'],
  [['R', 'R', 'R'], false, 'Entrée et sortie interdites'],
  [['G', 'G', 'G'], false, 'Passage autorisé, trafic à sens unique'],
  [['G', 'G', 'W'], false, 'Passage autorisé, trafic à double sens'],
  [['G', 'W', 'G'], false, 'Passage autorisé seulement après avoir reçu des instructions'],
];
const portSignals = PORT.map(([v, flash, good], i) =>
  mk(
    'g-sp-' + i,
    'signaux',
    'À l’entrée d’un port, vous voyez ce signal. Il signifie :',
    good,
    pick(
      PORT.map((p) => p[2]),
      3,
      good
    ),
    'Signaux de trafic portuaire (AISM) : trois rouges, interdit (à éclats : urgence) ; trois verts, sens unique ; vert, vert, blanc, double sens ; vert, blanc, vert, sur instructions.',
    S + '#port',
    { k: 'port', v, flash }
  )
);


// --------------------------------------------- règles de barre : situations
// Situations tirées avec une graine fixe : chaque variante garde le même dessin (id stable).


const R = 'cours/06-ripam.html';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const norm = (a) => ((((a + 180) % 360) + 360) % 360) - 180; // dans ]-180, 180]
const dir = (h) => [Math.sin((h * Math.PI) / 180), -Math.cos((h * Math.PI) / 180)];
// gisement de Q vu de P (cap hP), en degrés dans [0, 360[
function gisement(P, hP, Q) {
  const b = (Math.atan2(Q.x - P.x, -(Q.y - P.y)) * 180) / Math.PI;
  return (((b - hP) % 360) + 360) % 360;
}
const rattrape = (g) => g > 112.5 && g < 247.5; // vient de plus de 22,5° sur l'arrière du travers
const amureDe = (h, w) => (norm(w - h) > 0 ? 't' : 'b');
const AM = { t: 'tribord amures', b: 'bâbord amures' };
const COTE = { t: 'tribord', b: 'bâbord' };
const BOMME = { t: 'bâbord', b: 'tribord' };
const auVent = (P, w) => P.x * dir(w)[0] + P.y * dir(w)[1]; // plus grand = plus au vent

function inside(...bs) {
  return bs.every((b) => b.x > 25 && b.x < 265 && b.y > 45 && b.y < 162 && Math.hypot(b.x - 30, b.y - 30) > 70);
}
function voileOk(h, w) {
  const t = Math.abs(norm(w - h));
  return t >= 55 && t <= 155;
}
const P0 = { x: 160, y: 118 };
const place = (h, d) => ({ x: Math.round(P0.x - d * dir(h)[0]), y: Math.round(P0.y - d * dir(h)[1]) });

function tirage(kind, seed) {
  const r = rng(seed);
  for (let essai = 0; essai < 4000; essai++) {
    const w = Math.round(r() * 8) * 45;
    const hA = Math.round(r() * 72) * 5;
    const hB = Math.round(r() * 72) * 5;
    const dA = 80 + r() * 30;
    const dB = 80 + r() * 30;
    let A = place(hA, dA);
    let B = place(hB, dB);
    const diff = Math.abs(norm(hA - hB));
    const gAB = gisement(A, hA, B); // B vu de A
    const gBA = gisement(B, hB, A); // A vu de B
    if (kind === 'amures' || kind === 'meme') {
      if (!voileOk(hA, w) || !voileOk(hB, w) || diff < 40) continue;
      if (rattrape(gAB) || rattrape(gBA)) continue;
      const aA = amureDe(hA, w);
      const aB = amureDe(hB, w);
      if (kind === 'amures' && aA === aB) continue;
      if (kind === 'meme' && aA !== aB) continue;
      if (kind === 'meme' && Math.abs(auVent(A, w) - auVent(B, w)) < 45) continue;
      if (!inside(A, B)) continue;
      return { w, A: { ...A, h: hA, amure: aA }, B: { ...B, h: hB, amure: aB } };
    }
    if (kind === 'moteur') {
      if (!voileOk(hA, w) || diff < 40 || rattrape(gAB) || rattrape(gBA) || !inside(A, B)) continue;
      return { w, A: { ...A, h: hA, amure: amureDe(hA, w) }, B: { ...B, h: hB, moteur: true } };
    }
    if (kind === 'croisement') {
      if (diff < 50 || diff > 130 || rattrape(gAB) || rattrape(gBA) || !inside(A, B)) continue;
      return { w, A: { ...A, h: hA, moteur: true }, B: { ...B, h: hB, moteur: true } };
    }
    if (kind === 'face') {
      const h2 = hA + 180;
      A = place(hA, 85);
      B = place(h2, 85);
      if (!inside(A, B)) continue;
      return { w, A: { ...A, h: hA, moteur: true }, B: { ...B, h: h2, moteur: true } };
    }
    if (kind === 'rattrapant') {
      const hR = hB + Math.round((r() - 0.5) * 30);
      B = place(hB, 45 + r() * 15);
      A = place(hR, 115 + r() * 15);
      const g = gisement(B, hB, A);
      if (!rattrape(g) || g < 125 || g > 235) continue;
      const voileA = r() < 0.6;
      const voileB = r() < 0.5;
      if (voileA && !voileOk(hR, w)) continue;
      if (voileB && !voileOk(hB, w)) continue;
      if (!inside(A, B)) continue;
      return {
        w,
        A: { ...A, h: hR, ...(voileA ? { amure: amureDe(hR, w) } : { moteur: true }) },
        B: { ...B, h: hB, ...(voileB ? { amure: amureDe(hB, w) } : { moteur: true }) },
      };
    }
  }
  return null;
}

const nature = (b) => (b.moteur ? 'à moteur' : `à voile, ${AM[b.amure]}`);
const CHOIX = ['Le navire A', 'Le navire B', 'Les deux, en venant chacun sur tribord', 'Aucun : chacun garde son cap'];

function situation(kind, seed, n) {
  const s = tirage(kind, seed);
  if (!s) return null;
  const { w, A, B } = s;
  // A et B échangés une fois sur deux pour que la réponse ne soit pas toujours A
  const swap = seed % 2 === 1;
  const [X, Y] = swap ? [B, A] : [A, B];
  const boats = [
    { ...X, label: 'A' },
    { ...Y, label: 'B' },
  ];
  let q = 'Les deux navires font route de collision. Lequel doit s’écarter ?';
  let a;
  let e;
  if (kind === 'amures') {
    const pA = X.amure === 'b';
    a = pA ? 0 : 1;
    e = `A reçoit le vent par ${COTE[X.amure]} (bôme sur ${BOMME[X.amure]}) : il est ${AM[X.amure]} ; B est ${AM[Y.amure]}. Amures différentes : le voilier bâbord amures s’écarte (règle 12 a) i).`;
  } else if (kind === 'meme') {
    const xVent = auVent(X, w) > auVent(Y, w);
    a = xVent ? 0 : 1;
    e = `Les deux voiliers sont ${AM[X.amure]}. ${xVent ? 'A' : 'B'} est le plus près de la direction d’où vient le vent : il est au vent de l’autre. Même amure : le voilier au vent s’écarte (règle 12 a) ii).`;
  } else if (kind === 'moteur') {
    a = X.moteur ? 0 : 1;
    e = `${X.moteur ? 'A' : 'B'} est un navire à moteur, ${X.moteur ? 'B' : 'A'} un voilier faisant route à la voile, et aucun ne rattrape l’autre : le navire à moteur s’écarte du voilier (règle 18).`;
  } else if (kind === 'croisement') {
    const gX = gisement(X, X.h, Y);
    a = gX < 180 ? 0 : 1;
    e = `Deux navires à moteur dont les routes se croisent : celui qui voit l’autre sur son tribord s’écarte (règle 15). ${a === 0 ? 'A voit B sur son tribord' : 'B voit A sur son tribord'}. Il manœuvre de préférence en venant sur tribord pour passer derrière l’autre.`;
  } else if (kind === 'face') {
    a = 2;
    q = 'Les deux navires à moteur font des routes directement opposées. Que doivent-ils faire ?';
    e = 'Deux navires à moteur qui se rencontrent à contre-bord : chacun vient sur tribord, pour se croiser bâbord sur bâbord (règle 14).';
  } else {
    a = swap ? 1 : 0;
    q = `${swap ? 'B' : 'A'} va plus vite que ${swap ? 'A' : 'B'} et se rapproche par l’arrière. Lequel doit s’écarter ?`;
    e = `${swap ? 'B' : 'A'} vient de plus de 22,5° sur l’arrière du travers de l’autre : c’est un navire rattrapant. Le rattrapant s’écarte toujours, quel que soit le type des deux navires : un voilier qui rattrape un navire à moteur doit lui aussi s’écarter (règle 13).`;
  }
  const desc = `A : ${nature(X)} ; B : ${nature(Y)}.`;
  const ref = { amures: '#voiliers', meme: '#voiliers', moteur: '#hierarchie', croisement: '#moteur', face: '#moteur', rattrapant: '#rattrapant' }[kind];
  return {
    id: `g-rp-${kind}-${n}`,
    t: 'ripam',
    q: `${q} <span class="small muted">(${desc})</span>`,
    c: kind === 'face' ? CHOIX : CHOIX.slice(0, 3),
    a,
    fixed: true,
    e,
    ref: R + ref,
    fig: { k: 'svg', v: situ(boats, w) },
    gen: true,
  };
}

export const SITUATIONS = [
  ...Array.from({ length: 12 }, (_, i) => situation('amures', 1000 + i, i)),
  ...Array.from({ length: 10 }, (_, i) => situation('meme', 2000 + i, i)),
  ...Array.from({ length: 8 }, (_, i) => situation('moteur', 3000 + i, i)),
  ...Array.from({ length: 8 }, (_, i) => situation('croisement', 4000 + i, i)),
  ...Array.from({ length: 3 }, (_, i) => situation('face', 5000 + i, i)),
  ...Array.from({ length: 8 }, (_, i) => situation('rattrapant', 6000 + i, i)),
].filter(Boolean);

export default [
  ...marks,
  ...nightMarks,
  ...cardPass,
  ...cardDanger,
  ...rhythms,
  ...shipLights,
  ...dayMarks,
  ...flags,
  ...soundsClear,
  ...soundsFog,
  ...portSignals,
  ...SITUATIONS,
];
