const R = 'cours/07-signaux.html';

export default [
  {
    id: 's01', q: 'Quelle est la signification de trois sons brefs émis par un navire en vue ?', fig: { k: 'son', v: '...' }, src: 'annale 2023',
    c: ['Je bats en arrière', 'Je viens sur tribord', 'Je viens sur bâbord'], a: 0,
    e: 'Un bref : je viens sur tribord. Deux brefs : sur bâbord. Trois brefs : ma machine bat en arrière.', ref: R + '#sonores',
  },
  {
    id: 's02', q: 'Un navire en vue émet ce signal :', fig: { k: 'son', v: '.' },
    c: ['Je viens sur tribord', 'Je viens sur bâbord', 'Je bats en arrière', 'Je suis au mouillage'], a: 0,
    e: 'Un son bref : je viens sur tribord.', ref: R + '#sonores',
  },
  {
    id: 's03', q: 'Un navire en vue émet ce signal :', fig: { k: 'son', v: '..' }, src: 'annale 2018',
    c: ['Je viens sur bâbord (je vais à gauche)', 'Je viens sur tribord (je vais à droite)', 'Je bats en arrière'], a: 0,
    e: 'Deux sons brefs : je viens sur bâbord.', ref: R + '#sonores',
  },
  {
    id: 's04', q: 'Un navire émet au moins cinq sons brefs et rapides :', fig: { k: 'son', v: '.....' }, src: 'annale 2018',
    c: ['Il doute de vos intentions ou de votre manœuvre', 'Il est en détresse', 'Il bat en arrière', 'Il entre dans un chenal'], a: 0,
    e: 'C’est le signal d’avertissement : « je ne comprends pas ce que vous faites », ou « vous ne manœuvrez pas assez ».', ref: R + '#sonores',
  },
  {
    id: 's05', q: 'Dans la brume, vous entendez un son prolongé toutes les deux minutes environ :', fig: { k: 'son', v: '-' }, src: 'annale 2021',
    c: ['Un navire à moteur faisant route avec de l’erre', 'Un navire à moteur stoppé', 'Un voilier', 'Un navire au mouillage'], a: 0,
    e: 'Un son prolongé : navire à moteur qui avance. Deux sons prolongés : navire à moteur stoppé, sans erre.', ref: R + '#sonores',
  },
  {
    id: 's06', q: 'Dans la brume, vous entendez ce signal :', fig: { k: 'son', v: '--' },
    c: ['Un navire à moteur faisant route mais stoppé, sans erre', 'Un navire à moteur avec erre', 'Un voilier', 'Un navire échoué'], a: 0,
    e: 'Deux sons prolongés : navire à moteur faisant route, mais sans erre.', ref: R + '#sonores',
  },
  {
    id: 's07', q: 'Dans la brume, vous entendez ce signal (un long, deux brefs). Il peut s’agir :', fig: { k: 'son', v: '-..' }, src: 'annale 2023',
    c: ['D’un voilier, d’un pêcheur, ou d’un navire qui manœuvre difficilement', 'D’un navire à moteur avec erre', 'D’un navire au mouillage', 'D’un navire en détresse'], a: 0,
    e: 'Long-bref-bref (D en morse) : voilier, pêcheur, remorqueur, non maître de sa manœuvre, capacité restreinte, handicapé par son tirant d’eau.', ref: R + '#sonores',
  },
  {
    id: 's08', q: 'Par brume, un navire au mouillage signale sa présence :',
    c: ['Par une cloche tintée rapidement pendant 5 s, au moins toutes les minutes', 'Par un son prolongé toutes les deux minutes', 'Par deux sons prolongés', 'Il n’a aucun signal à faire'], a: 0,
    e: 'La cloche (et un gong à l’arrière au-delà de 100 m) est le signal des navires au mouillage.', ref: R + '#sonores',
  },
  {
    id: 's09', q: 'Dans un chenal, un navire émet deux sons prolongés suivis d’un son bref :', fig: { k: 'son', v: '--.' },
    c: ['Il a l’intention de vous rattraper par votre tribord', 'Il va vous rattraper par votre bâbord', 'Il bat en arrière', 'Il est d’accord'], a: 0,
    e: 'Deux longs, un bref : dépassement par tribord ; deux longs, deux brefs : par bâbord. Le navire rattrapé répond long-bref-long-bref s’il est d’accord.', ref: R + '#sonores',
  },
  {
    id: 's10', q: 'Un son prolongé à l’approche d’un coude masqué d’un chenal signifie :',
    c: ['Attention, un navire arrive derrière le coude', 'Je viens sur tribord', 'Je suis en détresse', 'Je suis au mouillage'], a: 0,
    e: 'On émet un son prolongé avant un coude ou un passage masqué ; un navire qui l’entend de l’autre côté répond de même.', ref: R + '#sonores',
  },
  {
    id: 's11', q: 'Que signifie ce signal à l’entrée d’un port ?', fig: { k: 'port', v: ['G', 'G', 'W'] }, src: 'annale 2021',
    c: ['Passage autorisé, trafic à double sens', 'Passage autorisé, trafic à sens unique', 'Attendre les instructions', 'Passage autorisé pour les bateaux de moins de 30 m'], a: 0,
    e: 'Vert, vert, blanc : passage autorisé à double sens. Trois verts : sens unique. Vert, blanc, vert : sur instructions.', ref: R + '#port',
  },
  {
    id: 's12', q: 'Ces feux fixes, à l’entrée d’un port, signifient :', fig: { k: 'port', v: ['R', 'R', 'R'] },
    c: ['Entrée ou sortie interdite', 'Passage autorisé, sens unique', 'Attendre les instructions', 'Marque latérale bâbord'], a: 0,
    e: 'Trois feux rouges fixes : interdiction de passer. À éclats, ils signalent un danger grave.', ref: R + '#port',
  },
  {
    id: 's13', q: 'Ces feux rouges à éclats à l’entrée d’un port m’indiquent :', fig: { k: 'port', v: ['R', 'R', 'R'], flash: 1 }, src: 'annale 2024',
    c: ['Interdiction d’entrer, danger grave : je m’arrête ou me déroute', 'Une marque latérale bâbord', 'Une circulation alternée dans le port'], a: 0,
    e: 'Trois rouges à éclats : urgence grave, tous les navires s’arrêtent ou se déroutent selon les instructions.', ref: R + '#port',
  },
  {
    id: 's14', q: 'Que signifie ce signal de port ?', fig: { k: 'port', v: ['G', 'G', 'G'] },
    c: ['Passage autorisé, trafic à sens unique', 'Passage autorisé, trafic à double sens', 'Attendre les instructions', 'Interdiction de passer'], a: 0,
    e: 'Trois verts : on peut passer, le trafic est à sens unique.', ref: R + '#port',
  },
  {
    id: 's15', q: 'Que signifie ce signal de port ?', fig: { k: 'port', v: ['G', 'W', 'G'] }, src: 'annale 2018',
    c: ['Passage autorisé seulement après avoir reçu des instructions', 'Passage autorisé sans rien demander', 'Interdiction de passer', 'Trafic à double sens'], a: 0,
    e: 'Vert, blanc, vert : on attend les instructions (par VHF) avant de passer. « Vert et blanc ensemble, je pose la question. »', ref: R + '#port',
  },
  {
    id: 's16', q: 'Un feu jaune s’ajoute à gauche du feu supérieur de ce signal :', fig: { k: 'port', v: ['R', 'R', 'R'], exempt: 'Y' },
    c: ['L’interdiction ne s’applique pas aux navires qui naviguent en dehors du chenal principal', 'L’interdiction s’applique à tous les navires', 'Seuls les navires de commerce peuvent passer', 'Le port est fermé pour la nuit'], a: 0,
    e: 'Le feu jaune d’exemption : les petits navires qui restent en dehors du chenal principal ne sont pas concernés.', ref: R + '#port',
  },
  {
    id: 's17', q: 'Quelle est la signification des pavillons N sur C ?', fig: { k: 'pavillon', v: 'NC', w: 60 }, src: 'annale 2024',
    c: ['Navire en détresse', 'Plongeurs à proximité', 'Bateau pilote', 'Navire au mouillage'], a: 0,
    e: 'November au-dessus de Charlie est un signal de détresse reconnu par le RIPAM.', ref: R + '#detresse',
  },
  {
    id: 's18', q: 'Une embarcation arbore ce pavillon :', fig: { k: 'pavillon', v: 'A' }, src: 'annale 2021',
    c: ['Plongeurs en immersion : je m’en écarte et je ralentis', 'Matières dangereuses à bord', 'Pilote à bord', 'Homme à la mer'], a: 0,
    e: 'Pavillon A (Alfa) : plongeurs. En France, on se tient à au moins 100 m, à vitesse réduite.', ref: R + '#pavillons',
  },
  {
    id: 's19', q: 'Un navire hisse ce pavillon :', fig: { k: 'pavillon', v: 'O' },
    c: ['Homme à la mer', 'Je demande assistance', 'Pilote à bord', 'Oui'], a: 0,
    e: 'Pavillon O (Oscar), rouge et jaune en diagonale : homme à la mer.', ref: R + '#pavillons',
  },
  {
    id: 's20', q: 'Un navire hisse ce pavillon :', fig: { k: 'pavillon', v: 'B' },
    c: ['Il transporte ou manipule des matières dangereuses', 'Il est en détresse', 'Il a des plongeurs en immersion', 'Il est au mouillage'], a: 0,
    e: 'Pavillon B (Bravo), rouge à queue d’aronde : matières dangereuses.', ref: R + '#pavillons',
  },
  {
    id: 's21', q: 'Lequel de ces signaux n’est PAS un signal de détresse ?',
    c: ['Le pavillon H', 'Des mouvements lents et répétés des bras tendus', 'Une fusée à parachute rouge', 'Un son continu de corne de brume'], a: 0,
    e: 'Le pavillon H signifie « j’ai un pilote à bord ». Les trois autres figurent dans la liste des signaux de détresse.', ref: R + '#detresse',
  },
  {
    id: 's22', q: 'Sur un bateau, une personne lève et abaisse lentement les bras tendus, de façon répétée :', src: 'annale 2022',
    c: ['Elle a besoin d’assistance (signal de détresse)', 'Elle dit bonjour', 'Elle indique que le bateau est incapable de manœuvrer', 'Elle fait de la gymnastique'], a: 0,
    e: 'C’est un signal de détresse du RIPAM (annexe IV). Saluer se fait d’un geste différent : on ne fait jamais ce mouvement pour dire bonjour.', ref: R + '#detresse',
  },
  {
    id: 's23', q: 'Pour allumer un feu à main, je me place :',
    c: ['Sous le vent, bras tendu, avec un gant ou un chiffon mouillé', 'Au vent, pour que la fumée parte loin', 'Dans la cabine, à l’abri', 'À l’avant, face au vent'], a: 0,
    e: 'Le feu à main projette des scories brûlantes : on le tient sous le vent, à l’extérieur du bateau, la main protégée.', ref: R + '#detresse',
  },
  {
    id: 's24', q: 'Un sémaphore hisse un cône noir pointe en haut. Il annonce :', fig: { k: 'marques', v: ['cone-haut'] }, src: 'annale 2018',
    c: ['Un coup de vent de Nord-Ouest', 'Un coup de vent de Nord-Est', 'Un coup de vent de Sud-Ouest', 'Un coup de vent de Sud-Est'], a: 0,
    e: 'Pointe en haut : secteur Nord ; pointe en bas : secteur Sud ; un cône : Ouest ; deux cônes : Est.', ref: 'cours/08-meteo.html#bulletins',
  },
  {
    id: 's25', q: 'Tout capitaine ou chef de bord qui a connaissance d’une personne en danger en mer :',
    c: ['Est tenu de lui porter assistance, s’il peut le faire sans danger grave pour son navire et son équipage', 'N’a aucune obligation', 'Doit seulement prévenir la capitainerie', 'Doit lui porter assistance seulement s’il est à moins de 2 milles'], a: 0,
    e: 'L’obligation d’assistance aux personnes en danger est une règle fondamentale du droit maritime ; s’y soustraire est un délit.', ref: R + '#detresse',
  },
];
