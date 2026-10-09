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
  {
    id: 'b48', q: 'Un phare est décrit sur la carte par « Fl(2) 10s 87m 25M ». C’est un feu :', src: 'annale 2018',
    c: ['À éclats, groupés par deux', 'Isophase', 'À occultations', 'Scintillant'], a: 0,
    e: 'Fl : à éclats, la lumière dure moins longtemps que l’obscurité ; (2) : éclats groupés par deux ; 10s : période. Isophase s’écrirait Iso, occultations Oc, scintillant Q.', ref: R + '#feux',
  },
  {
    id: 'b49', q: 'Dans la description « Fl(2) 10s 87m 25M », « 25M » est :',
    c: ['La portée du feu : 25 milles', 'La hauteur du feu : 25 m', 'La période : 25 secondes', 'Le nombre d’éclats par minute'], a: 0,
    e: 'M désigne les milles : c’est la portée nominale, par nuit claire. 87m est la hauteur du feu, en mètres ; 10s la période.', ref: R + '#feux',
  },
  {
    id: 'b50', q: 'Un feu est décrit par « Fl(3) WRG 12s 15m 11-8M ». Que signifie « 11-8M » ?',
    c: ['Le secteur blanc porte à 11 milles, les secteurs colorés à 8 milles', 'Le feu est allumé de 8 h à 11 h', 'Le feu est à 11 m de haut et porte à 8 milles', 'Il montre 11 éclats blancs et 8 éclats colorés'], a: 0,
    e: 'Un feu coloré porte moins loin qu’un feu blanc : on donne la portée du blanc puis celle des couleurs. 15m est la hauteur du feu, 12s sa période.', ref: R + '#feux',
  },
  {
    id: 'b51', q: 'Qu’est-ce qu’un phare à secteurs ?', src: 'annale 2016',
    c: ['Un feu dont la couleur change selon la direction d’où on le voit', 'Un feu dont la couleur change selon l’heure de la nuit', 'Un feu qui ne s’allume que par mauvaise visibilité', 'Un feu réservé aux navires de commerce'], a: 0,
    e: 'Les limites des secteurs sont portées sur la carte, en relèvements vrais vus du large. En général, le blanc couvre la route sûre, le rouge et le vert les dangers.', ref: R + '#feux',
  },
  {
    id: 'b52', q: 'Pour entrer de nuit dans un port en évitant les écueils, on navigue dans le secteur :', src: 'annale 2022',
    c: ['Blanc', 'Rouge', 'Vert', 'Rouge ou vert, indifféremment'], a: 0,
    e: 'Le secteur blanc couvre en général la route sûre ; les secteurs rouge et vert couvrent les dangers de part et d’autre. On le vérifie toujours sur la carte.', ref: R + '#feux',
  },
  {
    id: 'b53', q: 'De nuit, vous suivez le secteur blanc d’un feu d’entrée de port. Le feu vous apparaît soudain rouge :',
    c: ['Je suis sorti du secteur sûr : je corrige ma route, carte en main, pour revenir dans le blanc', 'Le feu est en panne : je continue', 'Le port est fermé : je fais demi-tour', 'Rien à faire, je suis toujours dans le chenal'], a: 0,
    e: 'Changer de couleur, c’est franchir une limite de secteur : la carte dit de quel côté on a dérivé. Cette limite est une droite de position aussi utile qu’un relèvement.', ref: R + '#feux',
  },
  {
    id: 'b54', q: 'Un feu à occultations (Oc) est un feu :',
    c: ['Dont la lumière dure plus longtemps que l’obscurité', 'Dont l’obscurité dure plus longtemps que la lumière', 'Dont la lumière et l’obscurité ont la même durée', 'Qui change de couleur'], a: 0,
    e: 'Oc : allumé la plupart du temps, il s’éteint brièvement. Le feu à éclats (Fl) fait l’inverse ; l’isophase (Iso) partage le temps à égalité.', ref: R + '#feux',
  },
  {
    id: 'b55', q: 'Devant vous, un feu jaune s’allume 2 secondes, puis reste éteint 4 secondes. C’est le feu :', fig: { k: 'feu', r: 'LFl', c: 'Y', p: 6 }, src: 'annale 2018',
    c: ['D’une marque spéciale', 'D’un danger isolé', 'D’une cardinale Sud', 'D’une marque d’eaux saines'], a: 0,
    e: 'Un feu jaune, quel que soit son rythme, est celui d’une marque spéciale. Cardinales, danger isolé et eaux saines ont un feu blanc.', ref: R + '#speciales',
  },
  {
    id: 'b56', q: 'Sur une carte, une petite flamme magenta à côté du symbole d’une bouée indique :', src: 'annale 2015',
    c: ['Qu’elle porte un feu', 'Qu’elle est sonore', 'Qu’elle est peinte en magenta', 'Qu’elle est provisoire'], a: 0,
    e: 'La tache magenta en forme de flamme désigne un feu ; ses caractéristiques (rythme, couleur, période) sont écrites à côté.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b57', q: 'Sur une carte marine, ce symbole désigne :', fig: { k: 'svg', v: S.rocheFleur }, src: 'annale 2021',
    c: ['Une roche à fleur d’eau, au niveau du zéro des cartes', 'Une roche qui découvre de plusieurs mètres', 'Une roche toujours couverte, de profondeur inconnue', 'Une marque de danger isolé'], a: 0,
    e: 'Croix cantonnée de quatre points : roche à fleur d’eau. L’astérisque est une roche découvrante ; la croix entourée de pointillés, une roche toujours couverte.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b58', q: 'Sur une carte marine, ce symbole désigne :', fig: { k: 'svg', v: S.epaveDecouvrante },
    c: ['Une épave dont la coque découvre', 'Une épave dangereuse, toujours couverte', 'Une roche découvrante', 'Une zone de mouillage'], a: 0,
    e: 'La silhouette de coque représente une épave dont une partie émerge à basse mer. L’épave dangereuse toujours couverte est un trait barré entouré de pointillés.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b59', q: 'Sur la carte, un losange magenta marqué d’une lettre renvoie :',
    c: ['À un tableau des courants de marée, heure par heure', 'À une zone de mouillage', 'À une épave signalée', 'À un point de rendez-vous des secours'], a: 0,
    e: 'Pour chaque lettre, un tableau en marge donne la direction et la vitesse du courant de PM − 6 à PM + 6, en vives eaux et en mortes eaux.', ref: 'cours/03-estime.html#courant',
  },
  {
    id: 'b60', q: 'Dans le tableau des courants d’une carte, les heures sont comptées :',
    c: ['Par rapport à l’heure de pleine mer du port de référence indiqué', 'En heure légale', 'Par rapport à la basse mer du port le plus proche', 'Depuis minuit'], a: 0,
    e: 'On cherche d’abord l’heure de PM au port de référence dans l’annuaire, puis la ligne (PM − 3, PM + 2…) qui correspond à l’heure de passage.', ref: 'cours/03-estime.html#courant',
  },
  {
    id: 'b61', q: 'Le tableau des courants donne 2,0 nd en vives eaux et 1,0 nd en mortes eaux. Le coefficient du jour est 70. Le courant vaut environ :',
    c: ['1,5 nd', '2,0 nd', '1,0 nd', '0,7 nd'], a: 0,
    e: 'Vives eaux : coefficient 95 ; mortes eaux : 45. 70 est à mi-chemin : 1,0 + (2,0 − 1,0) × 25/50 = 1,5 nd.', ref: 'cours/03-estime.html#courant',
  },
  {
    id: 'b62', q: 'Un courant de 1,5 nd « portant au 090 » :',
    c: ['Pousse le bateau vers l’Est', 'Vient de l’Est', 'Pousse le bateau vers l’Ouest', 'Vient du Nord'], a: 0,
    e: 'Un courant se désigne par la direction où il va, à l’inverse du vent, qui se désigne par la direction d’où il vient.', ref: 'cours/03-estime.html#courant',
  },
  {
    id: 'b63', q: 'Au large d’une plage, vous rencontrez cette bouée jaune sphérique. Elle marque en général :', fig: { k: 'balise', v: 'plage-limite' }, src: 'annale 2023',
    c: ['La limite de la bande des 300 m', 'La limite des 200 m', 'Un danger isolé', 'Un câble sous-marin'], a: 0,
    e: 'Les bouées sphériques jaunes matérialisent la limite de la bande des 300 m ou d’une zone de baignade. En deçà : 5 nd au plus.', ref: R + '#plages',
  },
  {
    id: 'b64', q: 'Près d’une plage, cette bouée jaune à voyant cylindrique rouge est :', fig: { k: 'balise', v: 'plage-babord' }, src: 'annale 2020',
    c: ['La marque bâbord d’un chenal traversier', 'La limite d’une zone de baignade', 'Une marque bâbord du chenal d’un port', 'Un danger isolé'], a: 0,
    e: 'Bouée jaune avec un voyant de marque latérale : chenal traversier. Le cylindre rouge se laisse à bâbord en allant vers la plage.', ref: R + '#plages',
  },
  {
    id: 'b65', q: 'Avec un dériveur, vous voulez rejoindre une plage dont la bande des 300 m est balisée :',
    c: ['J’emprunte le chenal traversier, à 5 nd au plus', 'Je traverse la zone de baignade au plus court', 'À la voile, la limite de vitesse ne s’applique pas', 'L’accès à la plage est interdit à tout bateau'], a: 0,
    e: 'Les zones de baignade balisées sont interdites aux embarcations ; les chenaux traversiers servent à rejoindre le rivage. Les 5 nd valent pour tous, voiliers compris.', ref: R + '#plages',
  },
  {
    id: 'b66', q: 'En quittant la plage vers le large par un chenal traversier, je laisse les bouées à voyant cylindrique rouge :',
    c: ['À tribord', 'À bâbord', 'Indifféremment d’un côté ou de l’autre'], a: 0,
    e: 'Le chenal traversier se lit en venant du large vers la plage : cylindre rouge à bâbord en entrant, donc à tribord en sortant.', ref: R + '#plages',
  },
  {
    id: 'b67', q: 'Que signalent deux bouées rouges identiques mouillées côte à côte ?', fig: { k: 'balises', v: ['babord', 'babord'] }, src: 'annale 2021',
    c: ['Un danger nouveau, pas encore porté sur les cartes', 'Une bifurcation du chenal', 'Le chenal préféré', 'Un rétrécissement du chenal'], a: 0,
    e: 'Une marque doublée (deux marques identiques côte à côte) signale un danger nouveau, pas encore porté sur les cartes. Depuis 2006, on peut aussi poser une bouée d’urgence d’épave, bleue et jaune.', ref: R + '#danger-nouveau',
  },
  {
    id: 'b68', q: 'Aux États-Unis (région B), en entrant au port, on laisse les marques rouges :',
    c: ['À tribord', 'À bâbord', 'Indifféremment d’un côté ou de l’autre'], a: 0,
    e: 'En région B (Amériques, Japon, Corée, Philippines), les couleurs des marques latérales sont inversées : rouge à tribord en entrant. Les cardinales ne changent pas.', ref: R + '#systeme',
  },
  {
    id: 'b69', q: 'En France, les marques latérales d’un chenal sont numérotées depuis le large :',
    c: ['Numéros pairs à bâbord (rouges), impairs à tribord (vertes)', 'Numéros impairs à bâbord, pairs à tribord', 'Dans l’ordre de leur mise en place', 'Seules les marques tribord sont numérotées'], a: 0,
    e: 'En rentrant au port, on rencontre la 1 (verte) à tribord, la 2 (rouge) à bâbord, et les numéros augmentent vers le port.', ref: R + '#laterales',
  },
  {
    id: 'b70', q: 'Entre deux îles, loin de tout port, comment savoir dans quel sens lire le balisage latéral ?',
    c: ['La carte l’indique par une flèche magenta', 'On le lit toujours du Nord vers le Sud', 'On le lit toujours d’Ouest en Est', 'Il n’y a jamais de marques latérales hors des ports'], a: 0,
    e: 'Le sens conventionnel va du large vers les ports et les estuaires ; ailleurs, l’autorité le fixe et la carte le porte par une flèche magenta.', ref: R + '#laterales',
  },
  {
    id: 'b71', q: 'De nuit, en sortant du port, vous voyez devant vous ce feu vert scintillant :', fig: { k: 'feu', r: 'Q', c: 'G' }, src: 'annale 2015',
    c: ['Je le laisse à bâbord', 'Je le laisse à tribord', 'Je passe d’un côté ou de l’autre'], a: 0,
    e: 'Feu vert : marque tribord, qu’on laisse à tribord en entrant, donc à bâbord en sortant. Le rythme d’un feu latéral est quelconque, sauf Fl(2+1).', ref: R + '#laterales',
  },
  {
    id: 'b72', q: 'De nuit, faisant route au 045, j’aperçois devant moi ce feu blanc :', fig: { k: 'feu', r: 'Q(6)+LFl', p: 15 }, src: 'annale 2023',
    c: ['Je le laisse à bâbord', 'Je le laisse à tribord', 'En tant que voilier, ce feu ne me concerne pas', 'Je passe d’un côté ou de l’autre'], a: 0,
    e: 'Six scintillements et un éclat long : cardinale Sud, on passe au Sud. En allant vers le Nord-Est, le Sud est sur ma droite : la marque reste à gauche, à bâbord.', ref: R + '#cardinales',
  },
  {
    id: 'b73', q: 'Dans la brume, cap au Nord, vous apercevez droit devant ce feu blanc :', fig: { k: 'feu', r: 'Q(9)', p: 15 }, src: 'annale 2015',
    c: ['Je le laisse à tribord', 'Je le laisse à bâbord', 'Je passe d’un côté ou de l’autre en m’écartant largement'], a: 0,
    e: 'Neuf scintillements : cardinale Ouest, on passe à l’Ouest. Cap au Nord, l’Ouest est à gauche : la marque reste à droite, à tribord.', ref: R + '#cardinales',
  },
  {
    id: 'b74', q: 'Faisant route au 170, j’aperçois devant moi cette marque :', fig: { k: 'balise', v: 'cardinale-e' }, src: 'annale 2017',
    c: ['Je la laisse sur tribord', 'Je la laisse sur bâbord', 'Je la laisse indifféremment d’un côté ou de l’autre'], a: 0,
    e: 'Noir-jaune-noir : cardinale Est, on passe à l’Est. En descendant vers le Sud, l’Est est à gauche : la marque reste à droite, sur tribord.', ref: R + '#cardinales',
  },
  {
    id: 'b75', q: 'De nuit, cap au 090, vous voyez droit devant ce feu blanc :', fig: { k: 'feu', r: 'Q(3)', p: 10 }, src: 'annale 2020',
    c: ['Le danger est entre la marque et moi : je change franchement de route, puis je regarde sur la carte comment le contourner', 'Je la laisse à bâbord en gardant mon cap', 'Je la laisse à tribord en gardant mon cap', 'Je passe d’un côté ou de l’autre en m’écartant'], a: 0,
    e: 'Trois scintillements : cardinale Est, placée à l’Est du danger. Venant de l’Ouest, je fais route sur le danger avant même d’atteindre la marque : il faut s’écarter tout de suite.', ref: R + '#cardinales',
  },
  {
    id: 'b76', q: 'Dans le brouillard, faisant route au Sud, vous apercevez devant vous ce feu blanc :', fig: { k: 'feu', r: 'Fl(2)', p: 5 }, src: 'annale 2016',
    c: ['Je passe d’un côté ou de l’autre, en m’écartant largement', 'Je le laisse obligatoirement à bâbord', 'C’est une cardinale Est : je passe à l’Est', 'C’est une embarcation à moteur'], a: 0,
    e: 'Deux éclats groupés : danger isolé, posé sur le danger. On passe de n’importe quel côté, mais à bonne distance.', ref: R + '#danger-isole',
  },
  {
    id: 'b77', q: 'Laquelle de ces marques peut signaler un câble sous-marin ?', src: 'annale 2024',
    fig: { k: 'balises', v: ['danger-isole', 'speciale', 'eaux-saines'], labels: ['A', 'B', 'C'] },
    c: ['A', 'B', 'C'], a: 1, fixed: true,
    e: 'Une marque spéciale (jaune, croix jaune) signale une zone ou un objet particulier : câble, zone militaire, zone de mouillage… A est un danger isolé, C une marque d’eaux saines.', ref: R + '#speciales',
  },
  {
    id: 'b78', q: 'Tous les points d’un même parallèle ont :', src: 'annale 2023',
    c: ['La même latitude', 'La même longitude', 'La même déclinaison magnétique', 'La même heure de pleine mer'], a: 0,
    e: 'Un parallèle est un cercle parallèle à l’équateur : la latitude y est constante. Les méridiens, qui relient les pôles, sont les lignes de même longitude.', ref: C1 + '#coordonnees',
  },
  {
    id: 'b79', q: 'Un bateau qui file 1 nœud parcourt en une heure :', src: 'annale 2020',
    c: ['1 852 m', '1 000 m', '1 609 m', 'Une minute de longitude'], a: 0,
    e: 'Le nœud vaut un mille par heure. Le mille, 1 852 m, est une minute de latitude ; une minute de longitude est plus courte dès qu’on quitte l’équateur.', ref: C1 + '#mille',
  },
  {
    id: 'b80', q: 'À 5 nœuds, combien de temps faut-il pour parcourir 2,5 milles ?',
    c: ['30 minutes', '20 minutes', '50 minutes', '2 heures'], a: 0,
    e: 't = d / V = 2,5 / 5 = 0,5 h, soit 30 minutes.', ref: C1 + '#mille',
  },
  {
    id: 'b81', q: 'Quel ouvrage donne les caractéristiques de chaque feu et phare ?',
    c: ['Le Livre des feux', 'Les Instructions nautiques', 'L’annuaire des marées', 'Le RIPAM'], a: 0,
    e: 'Le Livre des feux donne rythme, couleur, portée et secteurs de chaque feu. Les Instructions nautiques décrivent la côte, les dangers et les ports ; l’annuaire donne les marées ; le RIPAM, les règles de route.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b82', q: 'Sur une carte marine, une ligne qui relie les points de même profondeur s’appelle :',
    c: ['Une isobathe', 'Une isobare', 'Un alignement', 'Un méridien'], a: 0,
    e: 'Les isobathes (lignes de sonde de 2, 5, 10, 20 m…) dessinent le relief du fond. Les isobares, sur les cartes météo, relient les points de même pression.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b83', q: 'Pour choisir un mouillage, vous lisez « S » sur la carte, près d’une sonde. Le fond est :',
    c: ['Du sable', 'De la vase', 'De la roche', 'Des coquilles'], a: 0,
    e: 'S : sable ; M : vase ; R : roche ; Sh : coquilles. Une ancre tient bien dans le sable ou la vase, mal sur la roche.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b84', q: 'Le cartouche d’une carte récente indique « WGS 84 ». Cela signifie :',
    c: ['Qu’on peut y reporter directement une position lue sur le GPS', 'Que la carte date de 1984', 'Que les sondes sont en pieds', 'Que la carte est au 1 : 84 000'], a: 0,
    e: 'WGS 84 est le système géodésique du GPS. Sur une carte dans un autre système, la position GPS serait décalée.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b85', q: 'Une carte papier achetée il y a dix ans et jamais corrigée :',
    c: ['Peut être dangereuse : le balisage et les dangers ont pu changer', 'Reste exacte : les fonds ne bougent pas', 'Est interdite à bord', 'N’est utilisable que de jour'], a: 0,
    e: 'Le SHOM publie chaque semaine les Groupes d’avis aux navigateurs pour corriger ses cartes ; les corrections faites sont notées dans la marge.', ref: C1 + '#lire-carte',
  },
  {
    id: 'b86', q: 'Le « COG » affiché par le GPS est :',
    c: ['La route fond du bateau', 'Le cap compas', 'Le cap vrai', 'La direction du vent'], a: 0,
    e: 'COG (course over ground) : route par rapport au fond, calculée à partir des positions successives. Elle diffère du cap dès qu’il y a dérive ou courant.', ref: 'cours/03-estime.html#electronique',
  },
];
