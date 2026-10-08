const R = 'cours/07-signaux.html';

export default [
  {
    id: 'f01', q: 'Sur un navire, vous voyez ce signal. Il s’agit :', fig: { k: 'marques', v: ['cylindre'] }, src: 'annale 2024',
    c: ['D’un navire handicapé par son tirant d’eau', 'D’un navire non maître de sa manœuvre', 'D’un chalutier', 'D’un navire de plus de 200 m'], a: 0,
    e: 'Un cylindre noir : navire handicapé par son tirant d’eau. De nuit, trois feux rouges superposés.', ref: R + '#speciaux',
  },
  {
    id: 'f02', q: 'Un navire porte cette marque à l’avant :', fig: { k: 'marques', v: ['boule'] },
    c: ['Il est au mouillage', 'Il est non maître de sa manœuvre', 'Il est échoué', 'Il est en pêche'], a: 0,
    e: 'Une boule : navire au mouillage. De nuit, un feu blanc visible sur tout l’horizon.', ref: R + '#speciaux',
  },
  {
    id: 'f03', q: 'Un navire porte ces marques :', fig: { k: 'marques', v: ['boule', 'boule'] },
    c: ['Il est non maître de sa manœuvre', 'Il est au mouillage', 'Il est échoué', 'Il est à capacité de manœuvre restreinte'], a: 0,
    e: 'Deux boules : non maître de sa manœuvre (avarie). De nuit, deux feux rouges superposés.', ref: R + '#speciaux',
  },
  {
    id: 'f04', q: 'Vous voyez ce signal sur la mâture d’un navire. Il s’agit d’un navire :', fig: { k: 'marques', v: ['boule', 'boule', 'boule'] }, src: 'annale 2024',
    c: ['Échoué', 'Non maître de sa manœuvre', 'Handicapé par son tirant d’eau', 'En opération de déminage'], a: 0,
    e: 'Trois boules superposées : navire échoué. (Trois boules en triangle, une en tête de mât et une à chaque bout de vergue : déminage.)', ref: R + '#speciaux',
  },
  {
    id: 'f05', q: 'Vous voyez une boule, un losange et une boule noirs superposés sur un navire. Il s’agit d’un navire :', fig: { k: 'marques', v: ['boule', 'losange', 'boule'] }, src: 'annale 2023',
    c: ['À capacité de manœuvre restreinte', 'Handicapé par son tirant d’eau', 'Dragueur de mines', 'Non maître de sa manœuvre'], a: 0,
    e: 'Boule-losange-boule : capacité de manœuvre restreinte (câblier, drague, travaux). De nuit : rouge, blanc, rouge.', ref: R + '#speciaux',
  },
  {
    id: 'f06', q: 'Un navire hisse cette marque :', fig: { k: 'marques', v: ['sablier'] },
    c: ['Il est en train de pêcher', 'Il est à capacité de manœuvre restreinte', 'C’est un voilier au moteur', 'Il est au mouillage'], a: 0,
    e: 'Deux cônes réunis par la pointe : navire en train de pêcher. À ne pas confondre avec le losange (cônes base contre base).', ref: R + '#speciaux',
  },
  {
    id: 'f07', q: 'Un voilier porte un cône noir pointe en bas :', fig: { k: 'marques', v: ['cone-bas'] },
    c: ['Il fait route au moteur', 'Il est en pêche', 'Il est au mouillage', 'Il est handicapé par son tirant d’eau'], a: 0,
    e: 'Le cône pointe en bas signale un voilier qui utilise son moteur : c’est alors un navire à moteur.', ref: R + '#speciaux',
  },
  {
    id: 'f08', q: 'De nuit, vous voyez ces feux droit devant. Il s’agit :', fig: { k: 'nuit', v: 'tirant-eau' },
    c: ['D’un navire handicapé par son tirant d’eau, qui vient vers vous', 'D’un navire échoué', 'D’un navire non maître de sa manœuvre', 'D’un chalutier'], a: 0,
    e: 'Trois rouges superposés : tirant d’eau. On voit aussi son feu de mât et ses deux feux de côté : il fait route vers nous.', ref: R + '#speciaux',
  },
  {
    id: 'f09', q: 'De nuit, vous voyez ces deux feux rouges superposés, sans autre feu :', fig: { k: 'nuit', v: 'nuc' },
    c: ['Navire non maître de sa manœuvre, sans erre', 'Navire au mouillage', 'Navire échoué', 'Bateau pilote'], a: 0,
    e: 'Deux feux rouges superposés : non maître de sa manœuvre. Sans feux de côté, il n’a pas d’erre.', ref: R + '#speciaux',
  },
  {
    id: 'f10', q: 'De nuit, ces feux sont ceux :', fig: { k: 'nuit', v: 'echoue' },
    c: ['D’un navire échoué', 'D’un navire non maître de sa manœuvre faisant route', 'D’un remorqueur', 'D’un navire au mouillage'], a: 0,
    e: 'Deux rouges superposés plus un feu de mouillage blanc : navire échoué.', ref: R + '#speciaux',
  },
  {
    id: 'f11', q: 'De nuit, ces feux superposés (rouge, blanc, rouge) sont ceux :', fig: { k: 'nuit', v: 'ram' },
    c: ['D’un navire à capacité de manœuvre restreinte', 'D’un navire non maître de sa manœuvre', 'D’un navire handicapé par son tirant d’eau', 'D’un bateau pilote'], a: 0,
    e: 'Rouge-blanc-rouge : capacité de manœuvre restreinte. Il travaille et ne peut pas s’écarter.', ref: R + '#speciaux',
  },
  {
    id: 'f12', q: 'De nuit, ces feux (vert au-dessus de blanc) sont ceux :', fig: { k: 'nuit', v: 'chalutier' },
    c: ['D’un chalutier en pêche', 'D’un navire en pêche autre qu’un chalutier', 'D’un bateau pilote', 'D’un navire au mouillage'], a: 0,
    e: 'Vert sur blanc : chalutier. Rouge sur blanc : autre pêcheur. Blanc sur rouge : pilote.', ref: R + '#speciaux',
  },
  {
    id: 'f13', q: 'Quel navire porte ces feux (rouge au-dessus de blanc) ?', fig: { k: 'nuit', v: 'peche' }, src: 'annale 2024',
    c: ['Un navire en action de pêche (autre que chalutier)', 'Un navire non maître de sa manœuvre', 'Un chalutier', 'Un navire échoué'], a: 0,
    e: 'Rouge sur blanc : navire en train de pêcher, autre qu’un chalutier.', ref: R + '#speciaux',
  },
  {
    id: 'f14', q: 'De nuit, ces feux (blanc au-dessus de rouge) sont ceux :', fig: { k: 'nuit', v: 'pilote' },
    c: ['D’un bateau pilote en service', 'D’un pêcheur', 'D’un navire non maître de sa manœuvre', 'D’un navire au mouillage'], a: 0,
    e: '« Blanc sur rouge, pilote à bord. »', ref: R + '#speciaux',
  },
  {
    id: 'f15', q: 'De nuit, vous voyez ces feux :', fig: { k: 'nuit', v: 'moteur-face' },
    c: ['Un navire à moteur qui vient droit sur vous', 'Un voilier qui vient droit sur vous', 'Un navire à moteur vu par l’arrière', 'Un navire au mouillage'], a: 0,
    e: 'Les deux feux de côté visibles en même temps : il vient vers nous. Le feu de mât blanc au-dessus indique un navire à moteur.', ref: R + '#feux-route',
  },
  {
    id: 'f16', q: 'De nuit, vous voyez ces feux :', fig: { k: 'nuit', v: 'voilier-face' },
    c: ['Un voilier qui vient droit sur vous', 'Un navire à moteur qui vient droit sur vous', 'Un voilier vu par l’arrière', 'Un chalutier'], a: 0,
    e: 'Rouge et vert sans feu de mât au-dessus : un voilier (à la voile) qui vient vers nous.', ref: R + '#feux-route',
  },
  {
    id: 'f17', q: 'De nuit, vous voyez ces feux :', fig: { k: 'nuit', v: 'moteur-tribord' },
    c: ['Un navire à moteur dont je vois le flanc tribord : il se déplace vers ma droite', 'Un navire à moteur dont je vois le flanc tribord : il se déplace vers ma gauche', 'Un voilier vu de face', 'Un navire au mouillage'], a: 0,
    e: 'Le feu vert est à tribord : je vois son côté droit, donc il va vers ma droite. Le feu blanc au-dessus est son feu de mât (navire à moteur).', ref: R + '#feux-route',
  },
  {
    id: 'f18', q: 'De nuit, vous voyez ces feux :', fig: { k: 'nuit', v: 'moteur50-babord' },
    c: ['Un navire à moteur de plus de 50 m qui va vers ma gauche', 'Un navire à moteur de plus de 50 m qui va vers ma droite', 'Deux voiliers', 'Un remorqueur'], a: 0,
    e: 'Feu rouge : je vois son bâbord, il va vers ma gauche. Deux feux de mât : plus de 50 m ; le plus bas est à l’avant, il est bien à gauche.', ref: R + '#feux-route',
  },
  {
    id: 'f19', q: 'De nuit, droit devant, vous voyez un seul feu blanc dont vous vous rapprochez lentement en faisant route :', fig: { k: 'nuit', v: 'arriere' },
    c: ['Je rattrape probablement un navire dont je vois le feu de poupe : je m’écarte', 'C’est un navire privilégié qui doit s’écarter', 'C’est forcément une bouée', 'Je dois émettre trois sons brefs'], a: 0,
    e: 'Un feu blanc seul peut être un feu de poupe (je rattrape), un feu de mouillage ou un petit bateau. Dans tous les cas, c’est à moi de m’écarter.', ref: R + '#feux-route',
  },
  {
    id: 'f20', q: 'Avec un voilier de 9 m, de nuit au mouillage (hors chenal), je dois montrer :', src: 'annale 2021',
    c: ['Un feu blanc visible sur tout l’horizon', 'Un feu vert', 'Mes feux de côté', 'Aucun feu'], a: 0,
    e: 'Feu de mouillage : un feu blanc 360°. Seuls les navires de moins de 7 m mouillés hors chenal et hors zone de mouillage en sont dispensés.', ref: R + '#speciaux',
  },
  {
    id: 'f21', q: 'Les feux de côté (vert à tribord, rouge à bâbord) sont visibles chacun sur :',
    c: ['112,5°, de l’avant jusqu’à 22,5° sur l’arrière du travers', '180°', '135°', '225°'], a: 0,
    e: 'Deux fois 112,5° = 225°, le secteur du feu de mât. Le feu de poupe couvre les 135° restants.', ref: R + '#feux-route',
  },
  {
    id: 'f22', q: 'Un voilier de moins de 20 m peut regrouper ses feux de navigation :',
    c: ['En un feu tricolore en tête de mât', 'En un feu blanc visible sur tout l’horizon', 'En un feu rouge sur vert', 'Il n’a pas le droit'], a: 0,
    e: 'Le tricolore (vert, rouge, blanc) en tête de mât remplace les feux de côté et de poupe. On ne l’allume jamais au moteur.', ref: R + '#feux-route',
  },
  {
    id: 'f23', q: 'Le feu de tête de mât (blanc, visible sur 225° vers l’avant) est porté :',
    c: ['Par les navires à moteur faisant route', 'Par les voiliers à la voile', 'Par tous les navires', 'Par les navires au mouillage'], a: 0,
    e: 'C’est le feu qui distingue un navire à moteur d’un voilier. Un voilier au moteur l’allume.', ref: R + '#feux-route',
  },
  {
    id: 'f24', q: 'De jour, un remorqueur et le navire qu’il remorque portent chacun un losange noir. Cela signifie :',
    c: ['Que la remorque dépasse 200 m', 'Qu’ils sont au mouillage', 'Que le remorqué est échoué', 'Qu’ils transportent des matières dangereuses'], a: 0,
    e: 'Le losange est porté quand la longueur de remorque dépasse 200 m. De nuit, le remorqueur montre trois feux de mât superposés au lieu de deux.', ref: R + '#speciaux',
  },
  {
    id: 'f25', q: 'De nuit, un feu jaune au-dessus du feu de poupe d’un navire indique :',
    c: ['Qu’il remorque', 'Qu’il est en pêche', 'Qu’il a un pilote à bord', 'Qu’il transporte des matières dangereuses'], a: 0,
    e: 'Le feu de remorquage, jaune, est placé au-dessus du feu de poupe.', ref: R + '#speciaux',
  },
  {
    id: 'f26', q: 'Un navire montre trois feux verts disposés en triangle :', fig: { k: 'nuit', v: 'deminage-face' },
    c: ['Il est en opération de déminage : s’en tenir à plus de 1 000 m', 'C’est un chalutier', 'C’est un bateau pilote', 'Il est au mouillage'], a: 0,
    e: 'Trois feux verts (ou trois boules) : dragueur de mines. Il est dangereux de s’en approcher à moins de 1 000 m.', ref: R + '#speciaux',
  },
  {
    id: 'f27', q: 'Ces feux, vus de face, sont ceux :', fig: { k: 'nuit', v: 'ram-face' },
    c: ['D’un navire à capacité de manœuvre restreinte, faisant route', 'D’un navire non maître de sa manœuvre, faisant route', 'D’un navire handicapé par son tirant d’eau', 'D’un bateau pilote'], a: 0,
    e: 'Rouge-blanc-rouge superposés, plus feu de mât et feux de côté : capacité restreinte, avec de l’erre.', ref: R + '#speciaux',
  },
  {
    id: 'f28', q: 'Ces feux, vus de face, sont ceux :', fig: { k: 'nuit', v: 'nuc-face' },
    c: ['D’un navire non maître de sa manœuvre, qui a de l’erre', 'D’un navire échoué', 'D’un navire handicapé par son tirant d’eau', 'D’un navire au mouillage'], a: 0,
    e: 'Deux rouges superposés : non maître de sa manœuvre. Il montre ses feux de côté car il a encore de l’erre (pas de feu de mât, il n’est plus manœuvrant).', ref: R + '#speciaux',
  },
  {
    id: 'f29', q: 'Un petit voilier de 5 m sans feux de navigation navigue de nuit. Il doit :',
    c: ['Avoir prête une lampe à feu blanc, à montrer à temps pour éviter un abordage', 'Rien, il est trop petit', 'Montrer un feu rouge', 'Rentrer au port avant la nuit, c’est la seule obligation'], a: 0,
    e: 'Règle 25 : un voilier de moins de 7 m qui ne peut porter ses feux doit avoir une lampe électrique blanche prête à être montrée.', ref: R + '#feux-route',
  },
];
