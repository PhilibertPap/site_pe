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
  {
    id: 'f30', q: 'Un navire en travaux montre boule-losange-boule ; d’un côté, deux boules superposées ; de l’autre, deux losanges superposés. Je passe :', src: 'annale 2018',
    c: ['Du côté des deux losanges', 'Du côté des deux boules', 'D’un côté ou de l’autre', 'Je ne passe pas : il est échoué'], a: 0,
    e: 'Les deux boules (de nuit, deux feux rouges) marquent le côté de l’obstruction ; les deux losanges (deux feux verts), le côté où l’on peut passer. On passe lentement et à distance.', ref: R + '#speciaux',
  },
  {
    id: 'f31', q: 'De nuit, une drague au travail montre rouge-blanc-rouge, deux feux rouges superposés d’un côté et deux feux verts superposés de l’autre. Je passe :',
    c: ['Du côté des feux verts', 'Du côté des feux rouges', 'Entre les deux groupes de feux', 'Je ne peux pas savoir'], a: 0,
    e: 'Deux rouges : côté de l’obstruction (câble, conduite, élinde). Deux verts : côté où le passage est libre.', ref: R + '#speciaux',
  },
  {
    id: 'f32', q: 'Un voilier peut-il allumer en même temps son feu tricolore et les deux feux rouge sur vert de tête de mât ?',
    c: ['Non, jamais ensemble', 'Oui, c’est même recommandé', 'Oui, mais seulement au moteur', 'Oui, mais seulement au mouillage'], a: 0,
    e: 'Règle 25 c) : les feux rouge sur vert s’ajoutent aux feux de côté et de poupe séparés, jamais au tricolore.', ref: R + '#feux-route',
  },
  {
    id: 'f33', q: 'Un navire remorqué montre, de nuit :',
    c: ['Ses feux de côté et un feu de poupe, sans feu de mât', 'Un feu de mât et ses feux de côté', 'Trois feux blancs superposés', 'Un feu jaune au-dessus du feu de poupe'], a: 0,
    e: 'Règle 24 : le remorqué n’a pas de feu de mât. Les feux de mât superposés et le feu jaune de remorquage sont ceux du remorqueur.', ref: R + '#speciaux',
  },
  {
    id: 'f34', q: 'De nuit, vous voyez un remorqueur (feux de mât superposés) et, loin derrière lui, des feux de côté sans feu de mât :',
    c: ['C’est le navire remorqué : je ne passe surtout pas entre les deux', 'C’est un voilier : je peux passer entre eux', 'Ce sont deux navires indépendants', 'C’est un navire au mouillage'], a: 0,
    e: 'Le remorqué n’a pas de feu de mât. Entre lui et le remorqueur court la remorque, parfois longue de plusieurs centaines de mètres : on contourne l’ensemble.', ref: R + '#speciaux',
  },
  {
    id: 'f35', q: 'Un chalutier montre vert sur blanc, et en plus ses feux de côté et son feu de poupe. Cela indique :',
    c: ['Qu’il a de l’erre : il avance dans l’eau', 'Qu’il est au mouillage', 'Qu’il a fini de pêcher', 'Qu’il est non maître de sa manœuvre'], a: 0,
    e: 'Comme les autres navires particuliers, le pêcheur ne montre ses feux de côté et de poupe que lorsqu’il fait route avec de l’erre.', ref: R + '#speciaux',
  },
  {
    id: 'f36', q: 'Un navire non maître de sa manœuvre, arrêté dans l’eau (sans erre), montre :',
    c: ['Seulement ses deux feux rouges superposés', 'Ses deux feux rouges et ses feux de côté', 'Ses deux feux rouges et son feu de mât', 'Un feu blanc de mouillage'], a: 0,
    e: 'Les feux de côté et de poupe s’allument seulement s’il a de l’erre. Il ne montre jamais de feu de mât : il n’est plus manœuvrant.', ref: R + '#speciaux',
  },
  {
    id: 'f37', q: 'De nuit, un petit bateau à moteur de 5 m, dont la vitesse maximale ne dépasse pas 7 nœuds, peut se contenter de montrer :',
    c: ['Un feu blanc visible sur tout l’horizon (et, si possible, ses feux de côté)', 'Aucun feu', 'Un feu rouge visible sur tout l’horizon', 'Un feu de poupe seulement'], a: 0,
    e: 'Règle 23 d) : moins de 7 m et vitesse maximale de 7 nd au plus. Jusqu’à 12 m, le feu de mât et le feu de poupe peuvent aussi être réunis en un feu blanc 360°, avec les feux de côté.', ref: R + '#feux-route',
  },
  {
    id: 'f38', q: 'Quand doit-on allumer ses feux de navigation ?',
    c: ['Du coucher au lever du soleil, et de jour par visibilité réduite', 'Seulement par nuit noire', 'Seulement dans les chenaux', 'Seulement quand on voit un autre bateau'], a: 0,
    e: 'Règle 20. Dans la brume, même en plein jour, les feux aident les autres à vous identifier.', ref: R + '#feux-route',
  },
  {
    id: 'f39', q: 'De nuit, vous naviguez à la voile, feu tricolore allumé. Vous démarrez le moteur pour avancer :',
    c: ['J’éteins le tricolore et j’allume le feu de mât, les feux de côté et le feu de poupe', 'Je garde le tricolore et j’ajoute un feu rouge', 'Je garde le tricolore : les voiles sont toujours hautes', 'Je n’ai rien à changer'], a: 0,
    e: 'Dès que le moteur propulse le bateau, c’est un navire à moteur : il montre un feu de mât. Le tricolore est réservé aux voiliers à la voile.', ref: R + '#feux-route',
  },
  {
    id: 'f40', q: 'Le feu de poupe d’un navire est :',
    c: ['Blanc, visible sur 135° vers l’arrière', 'Rouge, visible sur 135° vers l’arrière', 'Blanc, visible sur tout l’horizon', 'Jaune, visible sur 225° vers l’avant'], a: 0,
    e: 'Il couvre exactement le secteur que laissent libre les feux de côté (2 × 112,5° = 225°).', ref: R + '#feux-route',
  },
  {
    id: 'f41', q: 'De nuit, un feu rouge fixe, sans autre feu au-dessus, se rapproche sur votre avant tribord à relèvement constant :',
    c: ['C’est probablement un voilier dont je vois le flanc bâbord', 'C’est un navire à moteur vu de face', 'C’est un navire au mouillage', 'C’est un navire non maître de sa manœuvre'], a: 0,
    e: 'Un seul feu de côté, sans feu de mât : un voilier (ou un petit bateau) qui me présente son bâbord. Relèvement constant : risque d’abordage, à traiter selon les règles de barre.', ref: R + '#feux-route',
  },
  {
    id: 'f42', q: 'De nuit, vous voyez les deux feux de mât d’un grand navire : le plus bas est à droite du plus haut. Ce navire se dirige :',
    c: ['Vers ma droite', 'Vers ma gauche', 'Droit sur moi', 'On ne peut pas savoir'], a: 0,
    e: 'Le feu de mât arrière est plus haut que celui de l’avant. Le plus bas, donc l’avant, est à droite : le navire va vers la droite. Son feu de côté (vert) le confirme.', ref: R + '#feux-route',
  },
  {
    id: 'f43', q: 'Un navire à moteur vous montrait son feu de mât et son feu vert. Vous voyez maintenant aussi son feu rouge :',
    c: ['Il a changé de cap : il vient maintenant droit sur moi', 'Il s’éloigne de moi', 'Il s’est mis au mouillage', 'Il a éteint son feu de mât'], a: 0,
    e: 'Voir ses deux feux de côté en même temps, c’est le voir par l’avant : il fait route vers moi. On surveille son relèvement et on applique les règles de barre.', ref: R + '#feux-route',
  },
  {
    id: 'f44', q: 'À la voile, de nuit, vous voyez vert sur blanc, plus le vert et le rouge de ses feux de côté, droit devant, à relèvement constant :',
    c: ['C’est un chalutier en pêche qui vient vers moi : je m’écarte', 'C’est un navire à moteur : il doit s’écarter du voilier', 'C’est un bateau pilote : je garde mon cap', 'C’est un navire au mouillage : je le contourne'], a: 0,
    e: 'Vert sur blanc : chalutier en pêche, avec de l’erre (feux de côté). Un voilier s’écarte d’un navire en train de pêcher (règle 18).', ref: R + '#speciaux',
  },
  {
    id: 'f45', q: 'Dans un chenal, à la voile, vous voyez devant un navire portant trois feux rouges superposés :',
    c: ['J’évite de gêner son passage : il ne peut pas quitter les eaux profondes', 'Il est non maître de sa manœuvre et s’arrête', 'C’est à lui de s’écarter du voilier', 'Il est échoué : il ne bouge plus'], a: 0,
    e: 'Trois rouges : navire handicapé par son tirant d’eau. Tout navire évite de gêner son passage ; dans un chenal, un voilier ne gêne de toute façon pas un navire qui ne peut naviguer qu’à l’intérieur.', ref: R + '#speciaux',
  },
  {
    id: 'f46', q: 'De nuit, un navire échoué de moins de 50 m montre :', src: 'annale 2016',
    c: ['Deux feux rouges superposés et son feu de mouillage', 'Trois feux rouges superposés', 'Deux feux rouges superposés seulement', 'Ses feux de côté et son feu de poupe'], a: 0,
    e: 'Échoué : les deux rouges du navire non maître de sa manœuvre, plus le feu de mouillage. Trois rouges : navire handicapé par son tirant d’eau.', ref: R + '#speciaux',
  },
];
