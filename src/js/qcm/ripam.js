import { situ } from './dessins.js';

const R = 'cours/06-ripam.html';

export default [
  {
    id: 'r01', q: 'Un navire à moteur et un voilier faisant route à la voile sont en route de collision. Qui doit manœuvrer ?', src: 'annale 2024',
    c: ['Le navire à moteur', 'Le voilier', 'Les deux'], a: 0,
    e: 'Le navire à moteur s’écarte de la route d’un navire à voile (règle 18), sauf s’il est rattrapé, ou dans un chenal où le voilier ne doit pas le gêner.', ref: R + '#hierarchie',
  },
  {
    id: 'r02', q: 'Je suis à la voile et je fais route de collision avec un petit bateau à moteur qui ne change pas de cap :', src: 'annale 2024',
    c: ['Je m’écarte de sa route', 'Je maintiens mon cap car je suis prioritaire', 'J’émets trois sons brefs pour voir sa réaction'], a: 0,
    e: 'Le privilégié garde cap et vitesse, mais dès qu’il est évident que l’autre ne manœuvre pas, il doit agir pour éviter l’abordage (règles 2 et 17). Il peut avant cela émettre au moins cinq sons brefs. Trois sons brefs signifient « je bats en arrière ».', ref: R + '#risque',
  },
  {
    id: 'r03', q: 'Il y a risque de collision si le relèvement de l’autre navire, qui se rapproche :', src: 'annale 2024',
    c: ['Reste constant', 'Augmente', 'Diminue'], a: 0,
    e: 'Un relèvement constant avec une distance qui diminue signifie qu’on se rejoindra au même point : route de collision (règle 7).', ref: R + '#risque',
  },
  {
    id: 'r04', q: 'Dans cette situation, quel voilier doit s’écarter ?',
    fig: { k: 'svg', v: situ([{ x: 90, y: 150, h: 45, amure: 'b', label: 'A' }, { x: 210, y: 150, h: -45, amure: 't', label: 'B', lx: -26 }], 0) },
    c: ['Le voilier A', 'Le voilier B', 'Les deux'], a: 0, fixed: true,
    e: 'A reçoit le vent par bâbord (bôme à tribord) : il est bâbord amures. B est tribord amures. Amures différentes : le bâbord amures s’écarte.', ref: R + '#voiliers',
  },
  {
    id: 'r05', q: 'Les deux voiliers sont sur la même amure. Lequel doit s’écarter ?',
    fig: { k: 'svg', v: situ([{ x: 200, y: 70, h: -65, amure: 't', label: 'A' }, { x: 230, y: 150, h: -55, amure: 't', label: 'B' }], 0) },
    c: ['Le voilier A', 'Le voilier B'], a: 0, fixed: true,
    e: 'Les deux sont tribord amures. A est plus près de la direction d’où vient le vent : il est au vent de B. À même amure, le voilier au vent s’écarte.', ref: R + '#voiliers',
  },
  {
    id: 'r06', q: 'Deux voiliers recevant le vent d’un bord différent se rapprochent. Qui s’écarte ?',
    c: ['Celui qui est bâbord amures', 'Celui qui est tribord amures', 'Le plus petit', 'Celui qui est au vent'], a: 0,
    e: 'Règle 12 a) i) : le voilier bâbord amures s’écarte de celui qui est tribord amures.', ref: R + '#voiliers',
  },
  {
    id: 'r07', q: 'Deux voiliers reçoivent le vent du même bord. Qui s’écarte ?',
    c: ['Celui qui est au vent', 'Celui qui est sous le vent', 'Celui qui va le plus vite', 'Le plus grand'], a: 0,
    e: 'Règle 12 a) ii) : à même amure, le voilier au vent s’écarte de celui qui est sous le vent.', ref: R + '#voiliers',
  },
  {
    id: 'r08', q: 'Je suis tribord amures, sur le tribord d’un voilier identique, lui aussi tribord amures :', src: 'annale 2023',
    c: ['Je le laisse passer : le vent venant de tribord, je suis au vent de lui', 'Je maintiens mon cap, car j’ai la priorité', 'J’abats pour passer devant lui'], a: 0,
    e: 'Le vent vient de tribord, et je suis sur son tribord : je suis au vent. Même amure, le voilier au vent s’écarte (en lofant ou en passant derrière lui).', ref: R + '#voiliers',
  },
  {
    id: 'r09', q: 'Un voilier qui en rattrape un autre :',
    c: ['S’écarte de sa route, quelle que soit son amure', 'Est privilégié s’il est tribord amures', 'Peut passer où il veut, l’autre doit s’écarter', 'Doit émettre un son long'], a: 0,
    e: 'Le navire qui en rattrape un autre s’écarte toujours (règle 13), y compris entre voiliers.', ref: R + '#rattrapant',
  },
  {
    id: 'r10', q: 'Un voilier à la voile rattrape un navire à moteur. Qui s’écarte ?',
    c: ['Le voilier, parce qu’il rattrape', 'Le navire à moteur', 'Les deux'], a: 0,
    e: 'La règle du rattrapant prime sur la hiérarchie moteur/voile : celui qui rattrape s’écarte.', ref: R + '#rattrapant',
  },
  {
    id: 'r11', q: 'Un navire est « rattrapant » quand il arrive sur un autre :',
    c: ['D’une direction de plus de 22,5° sur l’arrière de son travers', 'Exactement par l’arrière', 'De n’importe quelle direction, s’il va plus vite', 'Par son tribord'], a: 0,
    e: 'Il arrive dans le secteur du feu de poupe (135°) : de nuit, il ne voit que ce feu blanc.', ref: R + '#rattrapant',
  },
  {
    id: 'r12', q: 'Deux navires à moteur font des routes directement opposées :',
    c: ['Chacun vient sur tribord', 'Chacun vient sur bâbord', 'Le plus petit s’écarte', 'Le plus rapide s’écarte'], a: 0,
    e: 'Règle 14 : face à face, chacun vient sur tribord et ils se croisent bâbord contre bâbord.', ref: R + '#moteur',
  },
  {
    id: 'r13', q: 'Deux navires à moteur font des routes qui se croisent. Celui qui s’écarte est celui qui :',
    c: ['Voit l’autre sur son tribord', 'Voit l’autre sur son bâbord', 'Va le plus vite', 'Est le plus petit'], a: 0,
    e: 'Règle 15 : celui qui a l’autre sur tribord s’écarte et évite de passer devant lui.', ref: R + '#moteur',
  },
  {
    id: 'r14', q: 'De nuit, au moteur, j’aperçois sur mon avant tribord le feu rouge d’un navire qui se rapproche à relèvement constant :',
    c: ['Je m’écarte : il est sur mon tribord', 'Je maintiens cap et vitesse', 'Je viens sur bâbord pour passer devant lui'], a: 0,
    e: 'Je vois son flanc bâbord : il croise de droite à gauche, et il est sur mon tribord. Je m’écarte, en venant franchement sur tribord pour passer derrière lui. « Rouge, je bouge. »', ref: R + '#moteur',
  },
  {
    id: 'r15', q: 'Quel ordre va du navire qui manœuvre le moins bien à celui qui manœuvre le mieux ?',
    c: ['Non maître de sa manœuvre, tirant d’eau, pêche, voile, moteur', 'Voile, moteur, pêche, tirant d’eau, non maître de sa manœuvre', 'Moteur, voile, pêche, non maître de sa manœuvre, tirant d’eau', 'Pêche, non maître de sa manœuvre, voile, moteur, tirant d’eau'], a: 0,
    e: 'Chacun s’écarte de ceux qui sont avant lui dans cette liste (règle 18). Le navire à capacité de manœuvre restreinte est au même rang que le non maître de sa manœuvre.', ref: R + '#hierarchie',
  },
  {
    id: 'r16', q: 'Un voilier à la voile et un chalutier en action de pêche sont en route de collision. Qui s’écarte ?',
    c: ['Le voilier', 'Le chalutier', 'Le plus petit des deux'], a: 0,
    e: 'Un navire en train de pêcher manœuvre difficilement : le voilier s’écarte de lui (règle 18).', ref: R + '#hierarchie',
  },
  {
    id: 'r17', q: 'Je suis en route de collision avec un ferry dans un chenal :', src: 'annale 2023',
    c: ['Je m’écarte', 'Je conserve mon cap, car je suis à la voile et lui au moteur', 'J’émets un signal sonore et continue ma route'], a: 0,
    e: 'Dans un chenal étroit, un voilier ou un bateau de moins de 20 m ne doit pas gêner un navire qui ne peut naviguer qu’à l’intérieur du chenal (règle 9).', ref: R + '#chenaux',
  },
  {
    id: 'r18', q: 'Dans un chenal étroit, on navigue :',
    c: ['Sur le côté tribord du chenal', 'Au milieu du chenal', 'Sur le côté bâbord du chenal', 'Où l’on veut, en restant dans le chenal'], a: 0,
    e: 'Règle 9 : on se tient aussi près que possible du bord tribord du chenal.', ref: R + '#chenaux',
  },
  {
    id: 'r19', q: 'Un voilier qui avance au moteur, voiles hautes, est considéré comme :',
    c: ['Un navire à moteur', 'Un navire à voile', 'Un navire à capacité de manœuvre restreinte', 'Un navire privilégié'], a: 0,
    e: 'Dès que le moteur propulse le bateau, c’est un navire à moteur. De jour, il le signale par un cône pointe en bas.', ref: R + '#principes',
  },
  {
    id: 'r20', q: 'Pour traverser un dispositif de séparation du trafic, on fait route :',
    c: ['Cap perpendiculaire à la direction générale du trafic', 'Dans le sens du trafic, puis on coupe', 'En diagonale pour gagner du temps', 'Uniquement de nuit'], a: 0,
    e: 'Règle 10 : on traverse le plus rapidement possible, cap perpendiculaire au trafic, sans gêner les navires qui suivent le rail.', ref: R + '#chenaux',
  },
  {
    id: 'r21', q: 'Par visibilité réduite, sans se voir :',
    c: ['Il n’y a plus de navire privilégié : chacun réduit sa vitesse et émet ses signaux de brume', 'Le voilier reste privilégié', 'On accélère pour sortir vite de la brume', 'Seul le plus gros navire émet des signaux'], a: 0,
    e: 'La règle 19 remplace les règles de priorité : vitesse de sécurité, signaux sonores, veille à l’écoute, manœuvres prudentes.', ref: R + '#brume',
  },
  {
    id: 'r22', q: 'Quand doit-on assurer la veille à bord ?', src: 'annale 2023',
    c: ['Tout le temps', 'Quand il y a beaucoup de trafic', 'Dans la brume', 'La nuit'], a: 0,
    e: 'Règle 5 : veille visuelle et auditive permanente, y compris au mouillage.', ref: R + '#veille',
  },
  {
    id: 'r23', q: 'Le navire privilégié :',
    c: ['Garde son cap et sa vitesse, mais doit agir s’il devient évident que l’autre ne manœuvre pas', 'Ne doit jamais manœuvrer', 'Peut modifier sa route comme il l’entend', 'Doit émettre un son bref pour signaler sa priorité'], a: 0,
    e: 'Règle 17 : il maintient cap et vitesse pour que l’autre puisse prévoir, mais reste tenu d’éviter l’abordage.', ref: R + '#risque',
  },
  {
    id: 'r24', q: 'Le navire qui doit s’écarter manœuvre :',
    c: ['Tôt et franchement, de façon visible', 'Au dernier moment, pour ne pas perdre de temps', 'Par petites corrections successives', 'En accélérant pour passer devant'], a: 0,
    e: 'Règles 8 et 16 : une manœuvre nette (30° ou plus) faite à temps se voit et ne laisse pas de doute à l’autre.', ref: R + '#risque',
  },
  {
    id: 'r25', q: 'Un plaisancier qui traîne une ligne de pêche derrière son bateau est, pour le RIPAM :',
    c: ['Un navire ordinaire (à voile ou à moteur)', 'Un navire en train de pêcher, privilégié', 'Un navire à capacité de manœuvre restreinte', 'Un navire non maître de sa manœuvre'], a: 0,
    e: 'Seuls les engins qui restreignent la manœuvre (chaluts, filets, palangres) font d’un navire un « navire en train de pêcher ».', ref: R + '#principes',
  },
  {
    id: 'r26', q: 'Un voilier en route de collision rencontre un navire non maître de sa manœuvre :',
    c: ['Le voilier s’écarte', 'Le navire non maître s’écarte', 'Le voilier est privilégié s’il est tribord amures'], a: 0,
    e: 'Un navire non maître de sa manœuvre ne peut pas s’écarter : tous les autres s’écartent de lui.', ref: R + '#hierarchie',
  },
  {
    id: 'r27', q: 'Un voilier au près bâbord amures est privilégié par rapport à :', src: 'annale 2018',
    c: ['Un bateau de plaisance à moteur', 'Un voilier au grand largue tribord amures', 'Un chalutier en action de pêche', 'Un voilier au vent arrière tribord amures'], a: 0,
    e: 'Le navire à moteur s’écarte du voilier (règle 18). Le voilier bâbord amures, lui, s’écarte de tout voilier tribord amures, quelle que soit l’allure, et du chalutier en pêche.', ref: R + '#hierarchie',
  },
  {
    id: 'r28', q: 'Un navire à moteur qui en rattrape un autre :', src: 'annale 2021',
    c: ['Peut le dépasser d’un côté ou de l’autre, en s’écartant de sa route', 'Ne peut le dépasser que par son bâbord', 'Ne peut le dépasser que sous son vent', 'Doit attendre que l’autre s’écarte'], a: 0,
    e: 'La règle 13 n’impose pas de côté : le rattrapant s’écarte jusqu’à être complètement paré. Dans un chenal, il annonce son intention par signal sonore.', ref: R + '#rattrapant',
  },
  {
    id: 'r29', q: 'De nuit, au moteur, j’aperçois sur mon avant tribord le feu vert d’un bateau, dont le relèvement change nettement :', src: 'annale 2021',
    c: ['Je poursuis ma route en le surveillant', 'Je dois m’écarter, car il est sur mon tribord', 'Je fais demi-tour', 'Je stoppe et j’attends qu’il soit passé'], a: 0,
    e: 'Je vois son flanc tribord : il se déplace vers ma droite. Son relèvement change : pas de risque d’abordage. « Vert, je ne m’en fais pas », mais la veille continue.', ref: R + '#moteur',
  },
  {
    id: 'r30', q: 'Bâbord amures, j’aperçois au vent un voilier dont je ne peux pas déterminer l’amure :',
    c: ['Je m’écarte', 'Je garde mon cap : il est au vent, c’est à lui de s’écarter', 'J’émets un son bref', 'Je lofe pour passer devant lui'], a: 0,
    e: 'Règle 12 a) iii) : dans le doute, le voilier bâbord amures s’écarte, car l’autre est peut-être tribord amures.', ref: R + '#voiliers',
  },
  {
    id: 'r31', q: 'Au vent arrière, pour le RIPAM, l’amure d’un voilier se détermine :',
    c: ['Par le côté opposé à celui où se trouve la bôme de grand-voile', 'Par le côté où se trouve la bôme', 'Par le côté où est établi le foc', 'Par le côté vers lequel le bateau gîte'], a: 0,
    e: 'Le côté du vent est réputé être celui opposé à la bôme (règle 12 b). Bôme à tribord : bâbord amures ; bôme à bâbord : tribord amures.', ref: R + '#voiliers',
  },
  {
    id: 'r32', q: 'A descend au vent arrière, B remonte au près. Lequel doit s’écarter ?',
    fig: { k: 'svg', v: situ([{ x: 150, y: 55, h: 180, amure: 'b', label: 'A' }, { x: 230, y: 160, h: 315, amure: 't', label: 'B' }], 0) },
    c: ['Le voilier A', 'Le voilier B', 'Les deux'], a: 0, fixed: true,
    e: 'La bôme de A est à tribord : il est bâbord amures. B reçoit le vent par tribord : il est tribord amures. Amures différentes : A s’écarte, même au vent arrière.', ref: R + '#voiliers',
  },
  {
    id: 'r33', q: 'Je suis tribord amures, sous le vent d’un voilier bâbord amures qui converge vers moi :',
    c: ['C’est lui qui s’écarte, car il est bâbord amures', 'C’est moi qui m’écarte, car je suis sous le vent', 'Le plus rapide s’écarte', 'Nous lofons tous les deux'], a: 0,
    e: 'La règle « au vent / sous le vent » ne sert qu’entre voiliers de même amure. Amures différentes : le bâbord amures s’écarte, toujours.', ref: R + '#voiliers',
  },
  {
    id: 'r34', q: 'Sans compas de relèvement, comment savoir si un voilier qui se rapproche est en route de collision ?', src: 'annale 2020',
    c: ['Je garde mon cap et je regarde s’il reste aligné avec un même repère du bord (hauban, chandelier)', 'Je regarde s’il grossit vite', 'Je compare sa vitesse à la mienne', 'C’est impossible sans compas'], a: 0,
    e: 'À cap constant, s’il reste dans l’alignement du même repère, son gisement ne change pas : route de collision. S’il défile, il passera devant ou derrière.', ref: R + '#risque',
  },
  {
    id: 'r35', q: 'Un navire qui se rapproche défile vers l’avant par rapport à un repère fixe du bord :',
    c: ['Il passera devant moi', 'Il passera derrière moi', 'Nous sommes en route de collision', 'Il est au mouillage'], a: 0,
    e: 'Il défile vers l’avant : il passera sur mon avant. Vers l’arrière, il passerait derrière ; s’il ne défile pas, nous allons nous aborder.', ref: R + '#risque',
  },
  {
    id: 'r36', q: 'Un grand cargo se rapproche à courte distance ; son relèvement varie un peu :',
    c: ['Le risque d’abordage peut quand même exister', 'Il n’y a aucun risque', 'Il est forcément au mouillage', 'C’est toujours à lui de s’écarter'], a: 0,
    e: 'Règle 7 : avec un grand navire, un remorquage ou à courte distance, une légère variation du relèvement ne suffit pas à écarter le risque.', ref: R + '#risque',
  },
  {
    id: 'r37', q: 'Un chalutier en pêche et un navire non maître de sa manœuvre sont en route de collision. Qui s’écarte ?',
    c: ['Le chalutier', 'Le navire non maître de sa manœuvre', 'Les deux'], a: 0,
    e: 'Règle 18 : le navire en train de pêcher s’écarte des navires non maîtres de leur manœuvre et à capacité de manœuvre restreinte.', ref: R + '#hierarchie',
  },
  {
    id: 'r38', q: 'Un voilier rencontre un navire handicapé par son tirant d’eau (cylindre noir) :',
    c: ['Il évite de gêner son passage', 'Il garde son cap : un voilier est privilégié', 'Il émet cinq sons brefs pour qu’il s’écarte', 'Il ne s’en occupe pas : cette règle ne vaut que dans les ports'], a: 0,
    e: 'Règle 18 d) : tout navire, sauf non maître de sa manœuvre ou à capacité restreinte, évite de gêner un navire handicapé par son tirant d’eau, qui ne peut quitter les eaux profondes.', ref: R + '#hierarchie',
  },
  {
    id: 'r39', q: 'Un petit voilier peut-il traverser un chenal étroit juste devant un cargo qui ne peut naviguer qu’à l’intérieur ?',
    c: ['Non, s’il gêne son passage', 'Oui, s’il est à la voile', 'Oui, s’il est tribord amures', 'Oui, à condition d’émettre un son prolongé'], a: 0,
    e: 'Règle 9 d) : on ne traverse pas un chenal si cela gêne un navire qui ne peut naviguer qu’à l’intérieur. On attend qu’il soit passé.', ref: R + '#chenaux',
  },
  {
    id: 'r40', q: 'Peut-on mouiller dans un chenal étroit ?',
    c: ['On l’évite autant que possible', 'Oui, en montrant une boule noire', 'Oui, de jour seulement', 'Oui, si le chenal est balisé'], a: 0,
    e: 'Règle 9 g) : on évite de mouiller dans un chenal étroit, où l’on gênerait les autres navires et risquerait d’être abordé.', ref: R + '#chenaux',
  },
  {
    id: 'r41', q: 'Dans une voie d’un dispositif de séparation du trafic (rail), un voilier :',
    c: ['Ne doit pas gêner les navires à moteur qui suivent la voie', 'Est privilégié sur les cargos', 'Doit naviguer à contresens pour être vu', 'Doit allumer ses feux de jour'], a: 0,
    e: 'Règle 10 j) : un voilier ou un navire de moins de 20 m ne gêne pas le passage des navires à moteur qui suivent la voie. Mieux vaut éviter les rails.', ref: R + '#chenaux',
  },
  {
    id: 'r42', q: 'Dans la brume, vous entendez sur l’avant de votre travers le signal de brume d’un navire que vous ne voyez pas :',
    c: ['Je réduis ma vitesse au minimum, et si nécessaire je casse mon erre', 'Je garde cap et vitesse : je suis à la voile', 'J’accélère pour m’éloigner', 'Je viens franchement sur bâbord'], a: 0,
    e: 'Règle 19 e) : réduire la vitesse au minimum pour gouverner, casser l’erre si besoin, et manœuvrer avec prudence jusqu’à ce que le risque soit écarté.', ref: R + '#brume',
  },
  {
    id: 'r43', q: 'Par visibilité réduite, un navire est détecté au radar sur l’avant de votre travers. Si vous changez de cap, vous évitez :',
    c: ['De venir sur bâbord', 'De venir sur tribord', 'De ralentir', 'D’émettre vos signaux de brume'], a: 0,
    e: 'Règle 19 d) : on évite de venir sur bâbord pour un navire situé sur l’avant du travers (sauf s’il est rattrapé).', ref: R + '#brume',
  },
  {
    id: 'r44', q: 'La vitesse de sécurité dépend notamment :',
    c: ['De la visibilité, du trafic, de la manœuvrabilité du bateau, de la mer et de la proximité des dangers', 'Uniquement de la limitation du port', 'Uniquement de la visibilité', 'De la puissance du moteur'], a: 0,
    e: 'Règle 6 : c’est la vitesse qui permet d’éviter un abordage et de s’arrêter sur une distance adaptée aux circonstances.', ref: R + '#veille',
  },
  {
    id: 'r45', q: 'Au moteur, de nuit, vous voyez droit devant ces feux, à relèvement constant :', fig: { k: 'nuit', v: 'moteur-face' },
    c: ['Je viens sur tribord', 'Je viens sur bâbord', 'Je garde cap et vitesse', 'Je fais demi-tour'], a: 0,
    e: 'Feu de mât, vert et rouge : navire à moteur qui vient droit sur moi. Face à face, chacun vient sur tribord et on se croise bâbord contre bâbord (règle 14).', ref: R + '#moteur',
  },
  {
    id: 'r46', q: 'Au moteur, de nuit, vous voyez sur votre avant bâbord ces feux d’un navire à moteur, dont le relèvement ne change pas :', fig: { k: 'nuit', v: 'moteur-tribord' },
    c: ['C’est à lui de s’écarter : je garde cap et vitesse, prêt à agir', 'Je m’écarte en venant sur bâbord', 'Je m’écarte en venant sur tribord', 'Nous venons tous les deux sur tribord'], a: 0,
    e: 'Je vois son feu vert : je suis sur son tribord. C’est lui qui a l’autre sur tribord, donc lui qui s’écarte (règle 15). Je reste prêt à manœuvrer s’il ne le fait pas.', ref: R + '#moteur',
  },
  {
    id: 'r47', q: 'Un navire qui en rattrape un autre se retrouve ensuite sur son travers, en route croisée :',
    c: ['Il reste rattrapant jusqu’à être complètement paré', 'Il devient privilégié s’il est sur le tribord de l’autre', 'Les règles de croisement s’appliquent dès lors', 'Les deux doivent s’écarter'], a: 0,
    e: 'Règle 13 d) : un changement de relèvement ultérieur ne fait pas du rattrapant un navire qui croise ; il s’écarte jusqu’à être paré.', ref: R + '#rattrapant',
  },
  {
    id: 'r48', q: 'Au moteur, vous croisez un voilier à la voile qui arrive sur votre bâbord :',
    c: ['Je m’écarte : un navire à moteur s’écarte d’un voilier', 'Il s’écarte : il m’a sur son tribord', 'Le plus rapide s’écarte', 'Nous venons tous les deux sur tribord'], a: 0,
    e: 'La règle « celui qui a l’autre sur tribord s’écarte » ne vaut qu’entre navires à moteur. Face à un voilier, le navire à moteur s’écarte (règle 18), de quelque côté qu’il arrive.', ref: R + '#hierarchie',
  },
  {
    id: 'r49', q: 'Votre voilier a un récepteur AIS. Pour la veille :',
    c: ['La veille visuelle reste obligatoire : beaucoup de bateaux n’émettent pas d’AIS', 'L’AIS dispense de la veille visuelle', 'L’AIS suffit la nuit', 'L’AIS remplace les feux de navigation'], a: 0,
    e: 'L’AIS aide à évaluer un risque (distance et heure du passage au plus près), mais ne montre que les navires équipés. Règle 5 : veille visuelle et auditive permanente.', ref: R + '#veille',
  },
];
