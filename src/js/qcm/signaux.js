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
  {
    id: 's26', q: 'Parmi ces signaux, lequel est un signal de détresse ?', src: 'annale 2018',
    c: ['Un son continu de corne de brume', 'Au moins cinq sons brefs', 'Trois sons brefs', 'Deux sons prolongés'], a: 0,
    e: 'Le son continu figure dans les signaux de détresse (RIPAM, annexe IV). Cinq brefs : signal de doute ; trois brefs : je bats en arrière ; deux prolongés : navire à moteur stoppé dans la brume.', ref: R + '#detresse',
  },
  {
    id: 's27', q: 'Lequel de ces signaux n’est PAS un signal de détresse ?', src: 'annale 2020',
    c: ['Deux sons prolongés toutes les deux minutes', 'Un pavillon carré avec une boule au-dessus ou au-dessous', 'SOS en morse, avec une lampe ou un miroir', 'MAYDAY à la VHF'], a: 0,
    e: 'Deux sons prolongés toutes les 2 minutes : navire à moteur stoppé, par visibilité réduite. Les trois autres sont des signaux de détresse.', ref: R + '#detresse',
  },
  {
    id: 's28', q: 'Un feu automatique à main est :', src: 'annale 2015',
    c: ['Un engin tenu à la main qui produit une lumière rouge vive', 'Une fusée qui monte à 300 m sous parachute', 'Un fumigène orange flottant', 'Une lampe flash blanche'], a: 0,
    e: 'Il se voit à environ 3 milles et brûle une minute. La fusée à parachute monte à 300 m ; le fumigène se voit surtout de jour.', ref: R + '#detresse',
  },
  {
    id: 's29', q: 'On tire une fusée à parachute :',
    c: ['Bras tendu, vers le haut, quand un navire ou un aéronef peut la voir', 'À l’horizontale, en visant le navire qu’on veut alerter', 'Le plus tôt possible, même sans personne en vue', 'Dans le bateau, sous le vent du génois'], a: 0,
    e: 'Elle monte à environ 300 m et se voit à plus de 20 M par temps clair. On la tire vers le haut, bras tendu, en suivant les pictogrammes de la notice, et on la garde pour le moment où quelqu’un peut la voir. Jamais vers un navire ou un aéronef.', ref: R + '#detresse',
  },
  {
    id: 's30', q: 'Vous êtes en détresse avec trois feux à main. Un navire passe au loin sans vous voir :',
    c: ['J’en allume un quand il peut le voir, et je garde les autres', 'J’allume les trois en même temps pour être bien vu', 'Je les garde : un feu à main ne se voit que de jour', 'Je les allume l’un après l’autre tout de suite, même s’il est trop loin'], a: 0,
    e: 'Un feu à main se voit à environ 3 M et dure une minute : on le réserve au moment où un navire ou un aéronef est assez près pour le voir.', ref: R + '#detresse',
  },
  {
    id: 's31', q: 'Un fumigène orange est surtout efficace :',
    c: ['De jour, pour être repéré d’un hélicoptère ou d’un avion', 'De nuit', 'Par vent fort', 'À plus de 20 milles'], a: 0,
    e: 'La fumée orange se voit bien d’en haut, de jour, mais le vent l’écrase. De nuit, on utilise feux à main et fusées.', ref: R + '#detresse',
  },
  {
    id: 's32', q: 'Dans la brume, juste après le signal long-bref-bref d’un remorqueur, vous entendez ce signal :', fig: { k: 'son', v: '-...' },
    c: ['Le navire remorqué, qui a un équipage', 'Un second remorqueur', 'Un navire au mouillage', 'Un navire en détresse'], a: 0,
    e: 'Un prolongé et trois brefs : navire remorqué (s’il a du monde à bord), émis juste après le signal du remorqueur. Il rappelle qu’une remorque relie les deux.', ref: R + '#sonores',
  },
  {
    id: 's33', q: 'Dans la brume, un navire émet ce signal en plus de son signal de brume habituel :', fig: { k: 'son', v: '....' },
    c: ['C’est un bateau pilote en service', 'Il est en détresse', 'Il doute de vos intentions', 'Il est échoué'], a: 0,
    e: 'Quatre sons brefs : signal d’identification du bateau pilote. À ne pas confondre avec cinq brefs ou plus, signal de doute.', ref: R + '#sonores',
  },
  {
    id: 's34', q: 'Dans la brume, un navire au mouillage peut, en plus de sa cloche, émettre ce signal :', fig: { k: 'son', v: '.-.' },
    c: ['Pour avertir un navire qui s’approche de sa position', 'Pour annoncer qu’il vient sur tribord', 'Pour demander assistance', 'Pour annoncer qu’il appareille'], a: 0,
    e: 'Bref-prolongé-bref : « attention, je suis mouillé ici », pour prévenir un navire qui risque de l’aborder.', ref: R + '#sonores',
  },
  {
    id: 's35', q: 'Dans la brume, vous entendez une cloche tintée rapidement, suivie aussitôt d’un gong :', fig: { k: 'son', v: 'bg' },
    c: ['Un navire de 100 m ou plus au mouillage', 'Un navire à moteur sans erre', 'Un voilier faisant route', 'Un navire qui bat en arrière'], a: 0,
    e: 'Cloche à l’avant, puis gong à l’arrière : grand navire au mouillage. L’échoué ajoute trois coups de cloche distincts avant et après.', ref: R + '#sonores',
  },
  {
    id: 's36', q: 'Votre voilier de 8 m n’a pas de corne de brume réglementaire. Dans la brume, vous devez :',
    c: ['Émettre un autre signal sonore efficace, au moins toutes les 2 minutes', 'Ne rien émettre : sous 12 m, on est dispensé de tout', 'Émettre seulement si vous entendez un autre navire', 'Seulement allumer vos feux'], a: 0,
    e: 'Règle 35 : sous 12 m, on n’est pas tenu aux signaux réglementaires, mais on doit alors faire entendre un autre signal sonore efficace, à intervalles de 2 minutes au plus.', ref: R + '#sonores',
  },
  {
    id: 's37', q: 'Dans la brume, vous affalez et faites route au moteur. Votre signal de brume devient :',
    c: ['Un son prolongé, au moins toutes les 2 minutes', 'Un prolongé et deux brefs, toutes les 2 minutes', 'Deux sons prolongés, toutes les 2 minutes', 'Une cloche, toutes les minutes'], a: 0,
    e: 'Au moteur avec de l’erre : un prolongé. À la voile : prolongé-bref-bref. Moteur stoppé, sans erre : deux prolongés.', ref: R + '#sonores',
  },
  {
    id: 's38', q: 'Dans un chenal, vous émettez deux sons prolongés et un bref pour dépasser un navire par son tribord. Il répond par au moins cinq sons brefs :', src: 'annale 2016',
    c: ['Il a un doute ou n’est pas d’accord : je ne dépasse pas pour l’instant', 'Il est d’accord : je dépasse', 'Il bat en arrière pour me laisser passer', 'Il me demande de passer par son bâbord'], a: 0,
    e: 'Cinq brefs ou plus : signal de doute. S’il était d’accord, il répondrait long-bref-long-bref.', ref: R + '#sonores',
  },
  {
    id: 's39', q: 'Signal de port vert-blanc-vert, avec un feu jaune à gauche du feu supérieur. Vous êtes sur un petit voilier qui reste en dehors du chenal principal :', fig: { k: 'port', v: ['G', 'W', 'G'], exempt: 'Y' },
    c: ['Je peux passer sans attendre d’instructions, en restant hors du chenal principal', 'J’attends des instructions comme les autres', 'Le passage est interdit à tous', 'Le trafic est à sens unique'], a: 0,
    e: 'Le feu jaune d’exemption signifie que le signal principal ne s’applique pas aux navires qui naviguent en dehors du chenal principal.', ref: R + '#port',
  },
  {
    id: 's40', q: 'Un sémaphore hisse deux cônes noirs superposés, pointes en bas. Il annonce un coup de vent :', fig: { k: 'marques', v: ['cone-bas', 'cone-bas'] },
    c: ['De Sud-Est', 'De Sud-Ouest', 'De Nord-Est', 'De Nord-Ouest'], a: 0,
    e: 'Pointes en bas : secteur Sud ; pointes en haut : secteur Nord. Un cône : Ouest ; deux cônes : Est. Deux cônes pointes en bas : Sud-Est.', ref: 'cours/08-meteo.html#bulletins',
  },
];
