import { SYMBOLES as S } from './dessins.js';

const R = 'cours/05-balisage.html';
const C1 = 'cours/01-carte.html';

export default [
  {
    id: 'b01', q: 'Que signale cette marque ?', fig: { k: 'balise', v: 'cardinale-n' },
    c: ['Une cardinale Nord : je passe au Nord de la marque', 'Une cardinale Sud : je passe au Sud de la marque', 'Un danger isolé', 'Une marque spéciale'], a: 0,
    e: 'Deux cônes pointe en haut, noir en haut et jaune en bas : cardinale Nord. Les eaux saines sont au Nord, le danger au Sud.', ref: R + '#cardinales',
  },
  {
    id: 'b02', q: 'Cette marque est une cardinale :', fig: { k: 'balise', v: 'cardinale-e' },
    c: ['Nord', 'Est', 'Sud', 'Ouest'], a: 1, fixed: true,
    e: 'Cônes opposés par la base (en losange), noir-jaune-noir : cardinale Est. Les pointes indiquent où est le noir : en haut et en bas.', ref: R + '#cardinales',
  },
  {
    id: 'b03', q: 'Où se trouve le danger par rapport à cette marque ?', fig: { k: 'balise', v: 'cardinale-s' },
    c: ['Au Nord', 'Au Sud', 'À l’Est', 'À l’Ouest'], a: 0,
    e: 'Cardinale Sud (cônes pointe en bas, jaune sur noir) : elle est au Sud du danger. Le danger est donc au Nord de la marque.', ref: R + '#cardinales',
  },
  {
    id: 'b04', q: 'Où se trouve le danger par rapport à cette marque ?', fig: { k: 'balise', v: 'cardinale-w' }, src: 'annale 2023',
    c: ['Au Nord', 'Au Sud', 'À l’Est', 'À l’Ouest'], a: 2, fixed: true,
    e: 'Cônes pointe à pointe, jaune-noir-jaune : cardinale Ouest. Elle est à l’Ouest du danger, qui se trouve donc à l’Est.', ref: R + '#cardinales',
  },
  {
    id: 'b05', q: 'Faisant route au Nord, je vois droit devant une cardinale Est :', src: 'annale 2024',
    c: ['Je la laisse à bâbord', 'Je la laisse à tribord', 'Je passe indifféremment à droite ou à gauche', 'Je fais demi-tour de toute urgence'], a: 0,
    e: 'Il faut passer à l’Est de la marque, donc à sa droite quand on monte vers le Nord : la marque reste à gauche, à bâbord.', ref: R + '#cardinales',
  },
  {
    id: 'b06', q: 'Faisant route à l’Est, je vois devant moi une bouée jaune et noire surmontée de deux cônes noirs pointes en bas. Je la laisse :', src: 'annale 2023',
    c: ['Sur tribord', 'Sur bâbord', 'Indifféremment sur bâbord ou sur tribord'], a: 1,
    e: 'Deux cônes pointes en bas : cardinale Sud, je dois passer au Sud. En allant vers l’Est, le Sud est à ma droite : la marque reste sur ma gauche, à bâbord.', ref: R + '#cardinales',
  },
  {
    id: 'b07', q: 'De nuit, vous observez ce feu blanc. Il s’agit :', fig: { k: 'feu', r: 'Q(6)+LFl', p: 15 },
    c: ['D’une cardinale Sud', 'D’une cardinale Ouest', 'D’une cardinale Est', 'D’un danger isolé'], a: 0,
    e: 'Six scintillements suivis d’un éclat long : cardinale Sud (6 heures sur le cadran). L’éclat long évite de la confondre avec la Est ou la Ouest.', ref: R + '#cardinales',
  },
  {
    id: 'b08', q: 'Ce feu blanc est celui :', fig: { k: 'feu', r: 'Q(3)', p: 10 },
    c: ['D’une cardinale Est', 'D’une cardinale Ouest', 'D’une cardinale Nord', 'D’une marque d’eaux saines'], a: 0,
    e: 'Trois scintillements toutes les 10 secondes : cardinale Est (3 heures sur le cadran d’une montre).', ref: R + '#cardinales',
  },
  {
    id: 'b09', q: 'Un feu blanc scintillant sans interruption est celui :', fig: { k: 'feu', r: 'Q' },
    c: ['D’une cardinale Nord', 'D’une marque d’eaux saines', 'D’un danger isolé', 'D’une marque spéciale'], a: 0,
    e: 'La cardinale Nord scintille en continu (Q ou VQ), comme l’aiguille sur midi.', ref: R + '#cardinales',
  },
  {
    id: 'b10', q: 'Ce feu blanc est celui :', fig: { k: 'feu', r: 'Q(9)', p: 15 },
    c: ['D’une cardinale Ouest', 'D’une cardinale Est', 'D’une cardinale Sud', 'D’un danger isolé'], a: 0,
    e: 'Neuf scintillements, période 15 s : cardinale Ouest (9 heures).', ref: R + '#cardinales',
  },
  {
    id: 'b11', q: 'De nuit, vous observez ce feu blanc. Quelle est cette marque ?', fig: { k: 'feu', r: 'Fl(2)', p: 5 }, src: 'annale 2021',
    c: ['Un danger isolé', 'Une cardinale Est', 'Une marque d’eaux saines', 'Une marque spéciale'], a: 0,
    e: 'Deux éclats blancs groupés, Fl(2) : danger isolé (le « i » d’isolé en morse).', ref: R + '#danger-isole',
  },
  {
    id: 'b12', q: 'De nuit, je vois un feu blanc qui reste allumé en continu. Il s’agit :', src: 'annale 2024',
    c: ['D’un navire au mouillage', 'D’une cardinale Nord', 'D’un danger isolé', 'D’une bouée d’eaux saines'], a: 0,
    e: 'Les marques citées ont toutes un feu rythmé (scintillant, à éclats, isophase…). Un feu blanc fixe visible de partout est le feu de mouillage d’un navire.', ref: 'cours/07-signaux.html#speciaux',
  },
  {
    id: 'b13', q: 'Que signale cette marque ?', fig: { k: 'balise', v: 'danger-isole' },
    c: ['Un danger isolé, entouré d’eaux navigables', 'Des eaux saines', 'Une cardinale Nord', 'Une marque spéciale'], a: 0,
    e: 'Noire à bande rouge, deux sphères noires : danger isolé. Elle est posée sur le danger ; on passe de n’importe quel côté, à distance.', ref: R + '#danger-isole',
  },
  {
    id: 'b14', q: 'Je rencontre une bouée noire à bandes horizontales rouges, surmontée de deux sphères noires superposées :', src: 'annale 2023',
    c: ['C’est un danger isolé', 'C’est une marque spéciale', 'C’est une marque d’eaux saines'], a: 0,
    e: 'Noir et rouge, deux boules noires : danger isolé.', ref: R + '#danger-isole',
  },
  {
    id: 'b15', q: 'Que signale cette marque ?', fig: { k: 'balise', v: 'eaux-saines' },
    c: ['Des eaux saines tout autour (milieu de chenal, atterrissage)', 'Un danger isolé', 'Une marque bâbord', 'Une marque spéciale'], a: 0,
    e: 'Bandes verticales rouges et blanches, une sphère rouge : marque d’eaux saines.', ref: R + '#eaux-saines',
  },
  {
    id: 'b16', q: 'Comment passer près d’une marque d’eaux saines ?',
    c: ['De n’importe quel côté : les eaux sont navigables tout autour', 'Uniquement en la laissant à tribord', 'À au moins 200 m', 'On ne la passe jamais de nuit'], a: 0,
    e: 'Elle indique justement que les eaux sont saines autour d’elle (milieu de chenal, point d’atterrissage).', ref: R + '#eaux-saines',
  },
  {
    id: 'b17', q: 'Que signale cette marque ?', fig: { k: 'balise', v: 'speciale' },
    c: ['Une marque spéciale (zone ou objet particulier)', 'Un danger nouveau', 'Une cardinale Est', 'Une marque latérale tribord'], a: 0,
    e: 'Jaune avec une croix de Saint-André jaune : marque spéciale. La carte précise ce qu’elle signale (zone militaire, câble, zone de mouillage, de loisirs…).', ref: R + '#speciales',
  },
  {
    id: 'b18', q: 'Que signale cette marque ?', fig: { k: 'balise', v: 'danger-nouveau' },
    c: ['Un danger nouveau, pas encore porté sur les cartes', 'Une marque spéciale', 'Une zone de baignade', 'Une limite de zone militaire'], a: 0,
    e: 'Bandes verticales bleues et jaunes, croix droite jaune, feu alternativement bleu et jaune : bouée d’urgence d’épave, signalant un danger nouveau.', ref: R + '#danger-nouveau',
  },
  {
    id: 'b19', q: 'En rentrant au port, je laisse cette marque :', fig: { k: 'balise', v: 'babord' },
    c: ['À bâbord', 'À tribord', 'Indifféremment d’un côté ou de l’autre'], a: 0,
    e: 'Rouge, cylindrique, voyant cylindre : marque bâbord. En entrant, on la laisse à bâbord (à gauche).', ref: R + '#laterales',
  },
  {
    id: 'b20', q: 'En sortant du port, je laisse cette bouée verte à voyant conique :', fig: { k: 'balise', v: 'tribord' }, src: 'annale 2023',
    c: ['Sur bâbord', 'Sur tribord', 'Indifféremment sur bâbord ou sur tribord'], a: 0,
    e: 'Marque tribord : on la laisse à tribord en entrant, donc à bâbord en sortant.', ref: R + '#laterales',
  },
  {
    id: 'b21', q: 'Face à vous, vous voyez ces deux bouées. Vous vous dirigez :', src: 'annale 2024',
    fig: { k: 'balises', v: ['babord', 'tribord'] },
    c: ['Vers le port', 'Vers le large', 'Dans un chenal traversier devant une plage'], a: 0,
    e: 'Rouge à gauche, vert à droite : c’est la disposition vue en entrant au port (rouge à bâbord, vert à tribord).', ref: R + '#laterales',
  },
  {
    id: 'b22', q: 'En rentrant au port, à une bifurcation, je rencontre cette marque. Le chenal principal :', fig: { k: 'balise', v: 'chenal-pref-tribord' },
    c: ['Se suit en laissant la marque à bâbord', 'Se suit en laissant la marque à tribord', 'Passe indifféremment des deux côtés'], a: 0,
    e: 'Rouge à bande verte, voyant cylindre rouge : marque bâbord modifiée, chenal préféré à tribord. On la traite comme une marque bâbord pour suivre le chenal principal.', ref: R + '#laterales',
  },
  {
    id: 'b23', q: 'Quel est le rythme du feu d’une marque de bifurcation (chenal préféré) ?',
    c: ['Fl(2+1)', 'Fl(2)', 'Q(6)+LFl', 'Iso'], a: 0,
    e: 'Le rythme Fl(2+1), rouge ou vert, est réservé aux marques de chenal préféré. Fl(2) est le danger isolé, Q(6)+LFl la cardinale Sud, Iso une marque d’eaux saines.', ref: R + '#laterales',
  },
  {
    id: 'b24', q: 'En région A, un feu vert à éclats sur une bouée signale :',
    c: ['Une marque tribord', 'Une marque bâbord', 'Une marque spéciale', 'Un danger isolé'], a: 0,
    e: 'Feu vert : marque tribord. Feu rouge : bâbord. Jaune : spéciale. Blanc : cardinales, danger isolé, eaux saines.', ref: R + '#laterales',
  },
  {
    id: 'b25', q: 'Un feu jaune signale :',
    c: ['Une marque spéciale', 'Une cardinale', 'Un danger isolé', 'Une marque d’eaux saines'], a: 0,
    e: 'Les marques spéciales ont un feu jaune. Les cardinales, le danger isolé et les eaux saines ont un feu blanc.', ref: R + '#speciales',
  },
  {
    id: 'b26', q: 'Que signifie la notation « Fl(3) R 12s » ?',
    c: ['Trois éclats rouges groupés, répétés toutes les 12 secondes', 'Un éclat rouge toutes les 3 secondes pendant 12 secondes', 'Un feu rouge visible à 12 milles', 'Trois occultations rouges en 12 secondes'], a: 0,
    e: 'Fl(3) : trois éclats groupés ; R : rouge ; 12s : période, durée d’un cycle complet.', ref: R + '#feux',
  },
  {
    id: 'b27', q: 'Un feu isophase (Iso) est un feu :',
    c: ['Dont les durées de lumière et d’obscurité sont égales', 'Où la lumière dure plus longtemps que l’obscurité', 'Qui scintille 60 fois par minute', 'Fixe'], a: 0,
    e: 'Isophase : lumière et obscurité égales. Le feu à occultations a plus de lumière que d’obscurité, le feu à éclats l’inverse.', ref: R + '#feux',
  },
  {
    id: 'b28', q: 'Dans la bande des 300 m, la vitesse des navires est limitée à :',
    c: ['5 nœuds', '3 nœuds', '8 nœuds', '10 nœuds'], a: 0,
    e: 'La vitesse est limitée à 5 nd dans la bande des 300 m, et les zones de baignade balisées y sont interdites aux embarcations.', ref: R + '#plages',
  },
  {
    id: 'b29', q: 'Des bouées jaunes alignées le long d’une plage indiquent :', src: 'annale 2024',
    c: ['Une zone réservée à la baignade (ou la limite de la bande des 300 m)', 'Un danger nouveau et grave', 'Une cardinale Est', 'Un chenal réservé aux navires de commerce'], a: 0,
    e: 'Les bouées jaunes le long des plages délimitent les zones de baignade et la bande des 300 m. Elles sont interdites aux embarcations à l’intérieur.', ref: R + '#plages',
  },
  {
    id: 'b30', q: 'Près d’une plage, une bouée jaune coiffée d’un cône vert indique :', fig: { k: 'balise', v: 'plage-tribord' },
    c: ['Le côté tribord d’un chenal traversier (en venant du large)', 'La limite de la zone de baignade', 'Une cardinale Nord', 'Une zone de mouillage'], a: 0,
    e: 'Les chenaux traversiers permettent aux embarcations de franchir la bande des 300 m. Leurs bouées sont jaunes, avec un voyant de marque latérale : cône vert à tribord, cylindre rouge à bâbord, en allant vers la plage.', ref: R + '#plages',
  },
  {
    id: 'b31', q: 'Sur une carte marine, ce symbole désigne :', fig: { k: 'svg', v: S.rocheDecouvrante },
    c: ['Une roche qui couvre et découvre', 'Une roche toujours couverte', 'Une épave', 'Un haut-fond de sable'], a: 0,
    e: 'L’astérisque désigne une roche découvrante ; sa hauteur au-dessus du zéro des cartes est souvent indiquée à côté, soulignée.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b32', q: 'Sur une carte marine, ce symbole désigne :', fig: { k: 'svg', v: S.rocheCouverte },
    c: ['Une roche toujours immergée, dangereuse pour la navigation', 'Une roche à fleur d’eau', 'Une roche qui couvre et découvre', 'Une bouée'], a: 0,
    e: 'La croix entourée d’un pointillé désigne une roche toujours couverte, dangereuse, de profondeur inconnue.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b33', q: 'Sur une carte, qu’indique ce symbole ?', fig: { k: 'svg', v: S.mouillageInterdit }, src: 'annale 2024',
    c: ['Zone de mouillage interdite', 'Zone de mouillage à accès réglementé', 'Zone de mouillage non recommandée'], a: 0,
    e: 'Une ancre barrée : mouillage interdit (câbles, conduites, zones protégées…).', ref: C1 + '#lire-carte',
  },
  {
    id: 'b34', q: 'Ce trait magenta ondulé sur la carte désigne :', fig: { k: 'svg', v: S.cable },
    c: ['Un câble sous-marin, au-dessus duquel il ne faut pas mouiller', 'Une limite de zone de pêche', 'Un courant de marée', 'Un chenal dragué'], a: 0,
    e: 'Une ligne ondulée magenta représente un câble sous-marin. On n’y mouille pas : l’ancre peut l’endommager ou s’y prendre.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b35', q: 'Sur une carte marine, la zone verte en bordure de côte est :', src: 'annale 2021',
    c: ['L’estran, qui couvre et découvre avec la marée', 'Une zone recouverte de végétation', 'Une zone protégée en raison des fonds', 'Une zone toujours immergée'], a: 0,
    e: 'Le vert est l’estran ; le beige la terre ; le bleu les petits fonds.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b36', q: 'Sur une carte, ce chiffre souligné indique :', fig: { k: 'svg', v: S.sondeSoulignee }, src: 'annale 2018',
    c: ['Un fond qui découvre de 2,7 m au-dessus du zéro des cartes', 'Une profondeur de 2,7 m', 'Une roche immergée par 2,7 m de fond', 'La hauteur d’un feu'], a: 0,
    e: 'Une sonde soulignée est une hauteur au-dessus du zéro des cartes : à basse mer de vives eaux, ce fond émerge de 2,7 m.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b37', q: 'Sur une carte marine, un rocher qui découvre à marée basse est signalé par une sonde :', src: 'annale 2021',
    c: ['Soulignée', 'En italique', 'Négative', 'Entourée'], a: 0,
    e: 'Les sondes sont en italique ; celles des fonds découvrants sont en plus soulignées.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b38', q: 'Les sondes portées sur la carte sont comptées à partir :',
    c: ['Du zéro des cartes, voisin des plus basses mers', 'Du niveau moyen de la mer', 'Des plus hautes mers', 'Du niveau de la mer au moment du levé'], a: 0,
    e: 'Le zéro des cartes est proche du niveau des plus basses mers : la sonde est donc la profondeur minimale habituelle.', ref: 'cours/04-maree.html#hauteur-eau',
  },
  {
    id: 'b39', q: 'Qu’est-ce qu’un amer ?', src: 'annale 2024',
    c: ['Un point de repère fixe à terre, visible de loin et porté sur la carte', 'Un port d’échouage', 'Le temps d’adaptation au début de la navigation', 'Une bouée de mouillage'], a: 0,
    e: 'Clocher, phare, château d’eau, tourelle : les amers servent à faire le point par relèvements.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b40', q: 'Pour mesurer une distance sur la carte, on reporte l’écartement du compas à pointes sèches :',
    c: ['Sur l’échelle des latitudes, à la hauteur des points', 'Sur l’échelle des longitudes', 'Sur n’importe quel bord de la carte', 'Sur l’échelle en kilomètres'], a: 0,
    e: 'Sur l’échelle des latitudes, une minute vaut un mille. Les minutes de longitude sont plus courtes (cos φ) et ne mesurent pas des milles.', ref: C1 + '#mercator',
  },
  {
    id: 'b41', q: 'Un mille marin mesure :',
    c: ['1 852 m', '1 609 m', '1 000 m', '1 852 km'], a: 0,
    e: 'Le mille marin vaut 1 852 m, longueur d’une minute d’arc de méridien. 1 609 m est le mille terrestre anglo-saxon.', ref: C1 + '#mille',
  },
  {
    id: 'b42', q: 'Une carte au 1 : 25 000, comparée à une carte au 1 : 150 000 :',
    c: ['Est plus détaillée et couvre une zone plus petite', 'Est moins détaillée', 'Couvre une zone plus grande', 'Montre les mêmes détails'], a: 0,
    e: 'Plus l’échelle est grande (dénominateur petit), plus la carte est détaillée et plus la zone couverte est petite.', ref: C1 + '#echelle',
  },
  {
    id: 'b43', q: 'Faisant route au 090, je vois droit devant une cardinale Ouest :',
    c: ['Je ne la dépasse pas vers l’Est : le danger est derrière elle', 'Je passe à l’Est de la marque', 'Je la laisse indifféremment d’un côté ou de l’autre', 'Je continue : les cardinales ne concernent que les gros navires'], a: 0,
    e: 'Une cardinale Ouest est à l’Ouest du danger : en allant vers l’Est, le danger est juste au-delà. On change de route pour rester à l’Ouest de la marque.', ref: R + '#cardinales',
  },
  {
    id: 'b44', q: 'Les quadrants qui définissent les marques cardinales sont délimités par les relèvements vrais :',
    c: ['NW-NE, NE-SE, SE-SW et SW-NW', 'N-E, E-S, S-W et W-N', 'NNE-SSE et SSW-NNW', 'Ils dépendent du sens du balisage'], a: 0,
    e: 'Le quadrant Nord s’étend du NW au NE, le quadrant Est du NE au SE, etc.', ref: R + '#cardinales',
  },
  {
    id: 'b45', q: 'Sur une carte, ce symbole désigne :', fig: { k: 'svg', v: S.epaveDangereuse },
    c: ['Une épave dangereuse, de profondeur inconnue', 'Une roche à fleur d’eau', 'Un haut-fond de sable', 'Une zone de pêche'], a: 0,
    e: 'Le trait barré de trois petits traits représente une épave ; entouré d’un pointillé, elle est dangereuse pour la navigation.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b46', q: 'Une marque cardinale :',
    c: ['Indique de quel côté passer, quel que soit le sens de navigation', 'Se laisse toujours à tribord en entrant au port', 'Est posée sur le danger', 'Ne concerne que la navigation de nuit'], a: 0,
    e: 'Elle indique le quadrant où se trouvent les eaux saines, indépendamment du sens du balisage, contrairement aux marques latérales.', ref: R + '#cardinales',
  },
  {
    id: 'b47', q: 'Sur une marque, le voyant est :',
    c: ['La forme placée au sommet (cônes, cylindre, sphères, croix)', 'Le feu', 'Le numéro peint', 'Le réflecteur radar'], a: 0,
    e: 'Le voyant, qui se découpe sur le ciel, est souvent l’indice le plus fiable pour identifier une marque, surtout à contre-jour.', ref: R + '#systeme',
  },
];
