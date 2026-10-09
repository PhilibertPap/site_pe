const R = 'cours/09-securite.html';

export default [
  {
    id: 'bo01', q: 'En navigation, qui est le chef de bord d’une embarcation scoute ?', src: 'annale 2024',
    c: ['Le patron d’embarcation', 'Le chef d’équipage', 'Le membre d’équipage qui n’a jamais le mal de mer'], a: 0,
    e: 'Le patron d’embarcation est le chef de bord : il répond de la sécurité et des décisions à bord.', ref: R + '#chef-de-bord',
  },
  {
    id: 'bo02', q: 'Dans le cadre du scoutisme marin, je peux naviguer jusqu’à :', src: 'annale 2024',
    c: ['6 milles d’un abri', '5 milles de la côte', '6 milles de la côte', '5 milles d’un abri'], a: 0,
    e: 'La navigation scoute reste côtière : jusqu’à 6 milles d’un abri. On compte depuis un abri, pas depuis la côte.', ref: R + '#scoutisme',
  },
  {
    id: 'bo03', q: 'Dans le cadre du scoutisme marin, le port du gilet de sauvetage est :', src: 'annale 2024',
    c: ['Obligatoire en toutes circonstances', 'Imposé par le PE ou le CF quand le bateau gîte trop', 'Déconseillé, car il gêne les manœuvres'], a: 0,
    e: 'Gilet porté en permanence, par tous : c’est la règle des associations scoutes, plus stricte que la réglementation générale.', ref: R + '#scoutisme',
  },
  {
    id: 'bo04', q: 'Le journal de bord de votre embarcation doit être rempli :', src: 'annale 2024',
    c: ['Toutes les heures (et à chaque événement)', 'Quand vous le pouvez', 'Seulement en cas d’avarie'], a: 0,
    e: 'Un journal tenu régulièrement permet l’estime, le suivi de la météo et la reconstitution d’un incident.', ref: 'cours/03-estime.html#estime',
  },
  {
    id: 'bo05', q: 'Le patron d’embarcation est responsable du port des gilets sur son voilier :', src: 'annale 2023',
    c: ['En toutes circonstances et pour tous', 'Uniquement lors des manœuvres portuaires', 'Uniquement au large'], a: 0,
    e: 'Le chef de bord fait respecter le port du gilet, à tout moment.', ref: R + '#scoutisme',
  },
  {
    id: 'bo06', q: 'Pour faire route au moteur avec un voilier équipé d’un moteur de 10 ch, il faut :',
    c: ['Un permis plaisance', 'Aucun permis, c’est un voilier', 'Le certificat restreint de radiotéléphoniste', 'Un brevet de patron d’embarcation'], a: 0,
    e: 'Le permis plaisance est exigé pour conduire un bateau dont le moteur dépasse 6 ch (4,5 kW), y compris un voilier qui fait route au moteur.', ref: R + '#documents',
  },
  {
    id: 'bo07', q: 'Avant d’appareiller, le chef de bord :',
    c: ['Montre à l’équipage où est le matériel de sécurité et répartit les rôles', 'Laisse chacun découvrir le bateau en navigation', 'Range le matériel de sécurité au fond des coffres', 'N’a rien de particulier à faire si la météo est belle'], a: 0,
    e: 'Le briefing de sécurité (gilets, VHF, extincteurs, homme à la mer, qui fait quoi) fait partie de ses responsabilités.', ref: R + '#chef-de-bord',
  },
  {
    id: 'bo08', q: 'La catégorie de conception d’un bateau figure :',
    c: ['Sur la plaque du constructeur et dans le manuel du propriétaire', 'Sur la grand-voile', 'Uniquement sur la carte de circulation', 'Sur la licence radio'], a: 0,
    e: 'La plaque du constructeur indique la catégorie (A, B, C, D) et le nombre maximal de personnes.', ref: R + '#categories',
  },
  {
    id: 'bo09', q: 'Je suis de quart au mouillage :', src: 'annale 2023',
    c: ['Je surveille la tenue du mouillage, les autres bateaux et le temps, et je note toute anomalie dans le journal de bord', 'Je dors dans le cockpit', 'Je n’interviens que si une alarme sonne'], a: 0,
    e: 'Le quart au mouillage consiste à vérifier que l’ancre tient (relèvements, alarme de mouillage), surveiller la météo et noter les événements.', ref: 'cours/06-ripam.html#veille',
  },
  {
    id: 'bo10', q: 'Selon la Division 240, qui choisit la distance à un abri à laquelle on navigue ?',
    c: ['Le chef de bord, en tenant compte de la catégorie de conception du navire', 'Les affaires maritimes', 'Le constructeur', 'Le CROSS'], a: 0,
    e: 'Le choix est laissé au chef de bord, sous sa responsabilité, avec le matériel correspondant.', ref: R + '#chef-de-bord',
  },
  {
    id: 'bo11', q: 'Le titre de navigation d’un bateau :',
    c: ['Porte son numéro d’immatriculation, qui figure aussi sur la coque', 'Remplace le permis', 'N’est utile qu’à l’étranger', 'Est délivré par l’ANFR'], a: 0,
    e: 'Carte de circulation ou acte de francisation : c’est le « papier » du bateau. L’ANFR délivre la licence radio.', ref: R + '#documents',
  },
  {
    id: 'bo12', q: 'En voile légère (dériveurs), la limite météo pour naviguer aux SUF est :',
    c: ['Force 3 établie, rafales à 4', 'Force 4 établie, rafales à 5', 'Force 5 établie, rafales à 6', 'Elle dépend de la catégorie de conception du bateau'], a: 0,
    e: 'Règlement SUF : force 3 rafales 4 en voile légère, force 4 rafales 5 en habitable. Ce sont des maximums, pas des objectifs.', ref: R + '#scoutisme',
  },
  {
    id: 'bo13', q: 'Aux SUF, une flottille de voile légère navigue :',
    c: ['À moins de 2 milles d’un abri, sous la surveillance d’un chef de quart', 'À moins de 6 milles d’un abri, sans encadrement', 'Où elle veut, si chaque bateau a un PE', 'Uniquement dans le port'], a: 0,
    e: 'Voile légère : 2 milles d’un abri, chef de quart présent avec la flottille. Habitable : 6 milles d’un abri, chef de flottille présent.', ref: R + '#scoutisme',
  },
  {
    id: 'bo14', q: 'Le patron d’embarcation mineur, sur un habitable :', src: 'annale 2018',
    c: ['Navigue toujours sous la responsabilité et la surveillance d’un chef de flottille, qui reste avec la flottille', 'Peut naviguer de nuit par pleine lune, mer belle et force 3 au plus', 'Doit aviser les Affaires maritimes des déplacements de son bateau', 'Peut s’éloigner de la flottille s’il prévient par VHF'], a: 0,
    e: 'Le PE est chef de bord de son embarcation, mais il navigue en flottille, en vue et sous l’autorité du chef de flottille. La navigation scoute se fait de jour.', ref: R + '#scoutisme',
  },
  {
    id: 'bo15', q: 'Une navigation scoute en habitable a lieu :',
    c: ['Uniquement de jour', 'De jour comme de nuit', 'De nuit si la mer est belle et la lune pleine', 'De nuit si le PE est majeur'], a: 0,
    e: 'Le règlement SUF limite la navigation scoute au jour.', ref: R + '#scoutisme',
  },
  {
    id: 'bo16', q: 'Dans une flottille scoute d’habitables, il faut à bord de chaque bateau :',
    c: ['Un patron d’embarcation ou un chef de quart valide', 'Un moniteur diplômé d’État', 'Deux chefs de flottille', 'Un titulaire du permis hauturier'], a: 0,
    e: 'Chaque bateau a son chef de bord (PE ou CQ) ; le chef de flottille encadre l’ensemble.', ref: R + '#scoutisme',
  },
  {
    id: 'bo17', q: 'Avant une navigation scoute, on désigne :',
    c: ['Un correspondant à terre, qui connaît le programme et l’heure de retour prévue', 'Un représentant des Affaires maritimes', 'Un moniteur de la fédération de voile', 'Un pilote'], a: 0,
    e: 'Le correspondant à terre sait où va la flottille et quand elle doit rentrer : en cas de retard anormal, il peut donner l’alerte.', ref: R + '#scoutisme',
  },
  {
    id: 'bo18', q: 'Le brevet de patron d’embarcation SUF donne ses prérogatives à partir de :',
    c: ['16 ans', '14 ans', '18 ans', '12 ans'], a: 0,
    e: 'On peut passer le module théorique dès 14 ans, mais le brevet n’est délivré qu’à 16 ans révolus.', ref: R + '#scoutisme',
  },
  {
    id: 'bo19', q: 'En camp, une flottille d’habitables peut sortir :', src: 'annale 2020',
    c: ['À moins de 6 milles d’un abri, par vent annoncé ne dépassant pas force 4, rafales à 5', 'À moins de 6 milles d’un abri, par force 5 rafales à 6 annoncé en baisse', 'À moins de 6 milles d’un abri, par force 3 forcissant 6 dans l’après-midi', 'À moins de 5 milles d’un abri, par force 6 au plus'], a: 0,
    e: 'Limite SUF en habitable : force 4 établie, rafales à 5, à moins de 6 milles d’un abri. On regarde toute la prévision, y compris l’évolution prévue.', ref: R + '#scoutisme',
  },
  {
    id: 'bo20', q: 'Les règles propres au scoutisme marin (gilet permanent, limites de vent…) :',
    c: ['S’ajoutent à la réglementation générale, en plus strict', 'Remplacent la Division 240', 'Ne s’appliquent qu’en camp d’été', 'Sont de simples conseils'], a: 0,
    e: 'Division 240 et RIPAM s’appliquent à tous ; l’association ajoute des règles plus strictes, que le PE fait respecter.', ref: R + '#scoutisme',
  },
  {
    id: 'bo21', q: 'L’attestation d’assurance du bateau :',
    c: ['Est exigée par la plupart des ports et indispensable en cas d’accident', 'Remplace le titre de navigation', 'N’est utile qu’à l’étranger', 'Est délivrée par le CROSS'], a: 0,
    e: 'Elle fait partie des papiers du bord, avec le titre de navigation, le manuel du propriétaire et, s’il y a une VHF fixe, la licence radio.', ref: R + '#documents',
  },
  {
    id: 'bo22', q: 'En navigation, le vent forcit plus qu’annoncé, de force 4 à force 6 :', src: 'annale 2017',
    c: ['Je réduis la voilure et je rejoins l’abri de repli prévu', 'Je continue le programme : le bateau est de catégorie C', 'J’appelle la SNSM pour me faire remorquer', 'Je garde toute la toile pour rentrer plus vite'], a: 0,
    e: 'On réduit la toile avant d’être débordé, et on applique la solution de repli préparée à terre. On prévient le chef de flottille.', ref: R + '#chef-de-bord',
  },
  {
    id: 'bo23', q: 'En préparant une navigation, il faut toujours prévoir :',
    c: ['Une solution de repli : un abri accessible si le vent forcit ou si l’horaire dérape', 'Un horaire sans marge', 'Une route qui passe au plus près des dangers pour gagner du temps', 'De décider de la route une fois en mer'], a: 0,
    e: 'Un point de repli accessible avec le vent prévu fait partie de toute préparation, comme les amers et les relèvements de contrôle.', ref: 'cours/03-estime.html#preparer',
  },
  {
    id: 'bo24', q: 'Le vent est de Nord, force 4. Le but est droit au 020 :',
    c: ['Il faudra tirer des bords : la route est à 20° du vent', 'On peut y aller directement au près', 'Il faut mettre le spinnaker', 'C’est une route au travers'], a: 0,
    e: 'Un voilier remonte au mieux à 45° du vent environ : un but à 20° du vent ne s’atteint qu’en louvoyant, ce qui allonge nettement la route (× 1,4 au moins si le but est plein vent debout).', ref: 'cours/03-estime.html#preparer',
  },
  {
    id: 'bo25', q: 'Sur un voilier, la grand-voile et le génois masquent le secteur sous le vent. Le chef de bord :',
    c: ['Fait regarder régulièrement sous la voile', 'Considère que les bateaux sous le vent doivent s’écarter', 'Ne s’en préoccupe que la nuit', 'Compte sur l’AIS'], a: 0,
    e: 'La veille est le premier devoir à bord, et le secteur caché par les voiles est celui où l’on se fait surprendre.', ref: 'cours/06-ripam.html#veille',
  },
  {
    id: 'bo26', q: 'Le GPS vous place au milieu du chenal, mais la bouée verte que vous deviez laisser à tribord est sur votre bâbord :',
    c: ['Je me fie à ce que je vois : je ralentis et je vérifie ma position (carte, relèvements)', 'Je suis le GPS, précis à 10 m près', 'Je continue : la bouée a dû dériver', 'J’accélère pour sortir de la zone'], a: 0,
    e: 'Doute systématique : le GPS ne voit pas le balisage, et une carte électronique peut être fausse ou mal zoomée. On recoupe toujours.', ref: 'cours/03-estime.html#electronique',
  },
  {
    id: 'bo27', q: 'Avant le départ, un jeune équipier n’a pas de gilet à sa taille :',
    c: ['On ne part pas tant qu’il n’a pas un gilet adapté et ajusté', 'Il part avec un gilet trop grand, bien serré', 'Il part sans gilet et reste dans le cockpit', 'Il garde le gilet à portée de main'], a: 0,
    e: 'Un gilet trop grand remonte sur le visage dans l’eau. Le PE contrôle la tenue de chacun avant d’appareiller.', ref: R + '#scoutisme',
  },
  {
    id: 'bo28', q: 'Au briefing de navigation avec le chef de flottille, le patron d’embarcation :',
    c: ['Prend des notes (programme, météo, horaires, abris de repli, canal VHF) et les explique ensuite à son équipage', 'Écoute sans noter : le chef de flottille guidera en mer', 'Laisse un équipier y aller à sa place', 'Ne retient que l’heure du retour'], a: 0,
    e: 'Le PE doit pouvoir mener sa navigation et expliquer à ses équipiers le programme du jour.', ref: R + '#chef-de-bord',
  },
  {
    id: 'bo29', q: 'En faisant le tour du bateau avant le départ, vous trouvez un hauban effiloché :',
    c: ['Je ne pars pas et je préviens le chef de flottille', 'Je pars en ménageant le bateau', 'Je pars en restant bâbord amures', 'Je le signale au retour'], a: 0,
    e: 'Un hauban qui casse peut faire tomber le mât. On vérifie gréement, matériel de sécurité et moteur avant d’appareiller, et on ne part pas avec une avarie.', ref: R + '#chef-de-bord',
  },
  {
    id: 'bo30', q: 'Avant un virement de bord, le patron d’embarcation :',
    c: ['Annonce « Paré à virer ? », attend que chacun soit prêt et réponde, puis vire', 'Vire sans prévenir pour gagner du temps', 'Fait monter l’équipage sur le pont', 'Lâche la barre pour aider à border'], a: 0,
    e: 'Annoncer, vérifier que chacun est à son poste, puis exécuter : on évite les coups de bôme et les écoutes mal tenues.', ref: R + '#chef-de-bord',
  },
];
