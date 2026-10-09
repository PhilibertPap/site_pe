// Carnets de progression : PE, CQ et CF. Les id ne doivent pas changer (ils sont enregistrés
// dans carnets/{uid}.v) ; ceux du CQ et du CF sont préfixés (cq01, cf01).
//
// PE : la liste « Avant de me présenter au PE » de la Passerelle SUF (version septembre 2022).

export const SECTIONS = [
  {
    id: 'qcm',
    titre: '1. QCM',
    items: [
      ['q01', 'Je connais les balises et leurs signaux de nuit, ainsi que le balisage des plages', 'cours/05-balisage.html'],
      ['q02', 'Je connais les marques des navires de jour et de nuit', 'cours/07-signaux.html#speciaux'],
      ['q03', 'Je sais lire les informations d’un phare sur la carte', 'cours/05-balisage.html#phare-carte'],
      ['q04', 'Je connais les règles de priorité sur l’eau', 'cours/06-ripam.html'],
      ['q05', 'Je connais les pictogrammes de la carte marine', 'cours/01-carte.html'],
      ['q06', 'Je connais les signaux sonores des navires', 'cours/07-signaux.html#sonores'],
      ['q07', 'Je connais les signaux de détresse', 'cours/07-signaux.html#detresse'],
      ['q08', 'Je connais les signaux portuaires et ceux du sémaphore', 'cours/07-signaux.html#port'],
      ['q09', 'Je connais les règles de sécurité et le matériel d’armement', 'cours/09-securite.html'],
      ['q10', 'Je connais les pièces administratives d’un bateau', 'cours/09-securite.html'],
      ['q11', 'Je sais utiliser une VHF', 'cours/10-vhf.html'],
      ['q12', 'Je connais les principaux canaux VHF', 'cours/10-vhf.html'],
      ['q13', 'Je connais la réglementation spécifique au scoutisme marin', 'cours/09-securite.html'],
      ['q14', 'Je sais ce qu’est une brise thermique', 'cours/08-meteo.html'],
      ['q15', 'Je connais les principaux nuages, et sais en déduire l’évolution météo', 'cours/08-meteo.html'],
    ],
  },
  {
    id: 'carto',
    titre: '2. Cartographie',
    items: [
      ['c01', 'Je connais les symboles de la carte', 'cours/01-carte.html'],
      ['c02', 'Je sais repérer les cartouches de courant et utiliser le tableau', 'cours/03-estime.html'],
      ['c03', 'Je sais lire les coordonnées d’un point sur une carte', 'cours/01-carte.html'],
      ['c04', 'Je sais porter un point sur une carte à partir de ses coordonnées', 'cours/01-carte.html'],
      ['c05', 'Je sais tracer trois relèvements pour obtenir ma position', 'cours/02-compas.html'],
      ['c06', 'Je sais mesurer une distance', 'cours/01-carte.html'],
      ['c07', 'Je sais mesurer ou tracer un cap', 'cours/01-carte.html'],
      ['c08', 'Je sais calculer la déclinaison magnétique en fonction de l’année', 'cours/02-compas.html'],
      ['c09', 'Je sais passer du cap compas au cap vrai, et inversement', 'cours/02-compas.html'],
      ['c10', 'Je sais lire une courbe de dérive due au vent', 'cours/03-estime.html'],
      ['c11', 'Je sais ce que sont la route surface et la route fond', 'cours/03-estime.html'],
      ['c12', 'Je sais tracer un vecteur de courant et tracer ma route fond', 'cours/03-estime.html'],
      ['c13', 'Synthèse : je sais passer d’un cap et d’une vitesse donnés par le barreur à une route fond (cap et vitesse), et donner l’heure de passage à un point', 'exercices/estime.html'],
      ['c14', 'Synthèse : je sais passer d’une route fond voulue à un cap à donner au barreur, et donner l’heure de passage à un point', 'exercices/estime.html'],
      ['c15', 'Synthèse : je sais calculer le courant subi en fonction du cap de mon barreur et de ma route fond observée', 'exercices/estime.html'],
    ],
  },
  {
    id: 'maree',
    titre: '3. Marées',
    items: [
      ['m01', 'Je connais par cœur le schéma type des hauteurs d’eau', 'cours/04-maree.html'],
      ['m02', 'Je sais dresser le tableau de marées d’un port rattaché à partir du port principal et du tableau de corrections', 'cours/04-maree.html'],
      ['m03', 'Je sais calculer l’heure-marée, le marnage et le douzième', 'cours/04-maree.html'],
      ['m04', 'Je peux dresser un tableau des hauteurs d’eau heure par heure', 'cours/04-maree.html'],
      ['m05', 'Je sais calculer une valeur « entre deux cases du tableau » avec une règle de trois', 'cours/04-maree.html'],
      ['m06', 'Synthèse : je sais calculer la hauteur d’eau à une heure donnée', 'exercices/maree.html'],
      ['m07', 'Synthèse : je sais calculer l’heure à partir de (ou jusqu’à) laquelle la hauteur d’eau est au-dessus (ou en dessous) d’une valeur', 'exercices/maree.html'],
      ['m08', 'Synthèse : en arrivant à une heure donnée sur un mouillage, je sais calculer la hauteur d’eau minimale à lire avant de mouiller et la longueur de chaîne à dérouler', 'exercices/maree.html'],
    ],
  },
  {
    id: 'oral',
    titre: '4. Oral',
    items: [
      ['o01', 'Je sais préparer une navigation en prenant en compte les éléments météo', 'pratique/oral-pe.html'],
      ['o02', 'Je connais les différentes sources d’information que j’ai à ma disposition', 'cours/08-meteo.html'],
      ['o03', 'Je connais le principe du doute systématique', 'cours/03-estime.html'],
      ['o04', 'Je sais exposer ma navigation de manière structurée', 'pratique/oral-pe.html'],
      ['o05', 'Je sais adapter la fin de ma navigation en fonction des aléas météo ou des incidents', 'pratique/oral-pe.html'],
      ['o06', 'Je sais simuler le briefing d’une manœuvre', 'pratique/chef-de-bord.html'],
      ['o07', 'Je connais les vérifications à effectuer avant d’embarquer', 'pratique/chef-de-bord.html'],
      ['o08', 'Je sais expliquer à un nouveau les règles de sécurité', 'pratique/chef-de-bord.html'],
      ['o09', 'Je sais simuler le briefing à faire à mon équipage avant chaque navigation', 'pratique/chef-de-bord.html'],
      ['o10', 'Je connais la conduite à tenir en cas de voie d’eau', 'pratique/avaries.html'],
      ['o11', 'Je connais la conduite à tenir en cas de feu', 'pratique/avaries.html'],
      ['o12', 'Je connais la conduite à tenir en cas de casse de la barre', 'pratique/avaries.html'],
      ['o13', 'Je connais la conduite à tenir en cas de casse d’un hauban', 'pratique/avaries.html'],
      ['o14', 'Je connais la conduite à tenir en cas de chute du mât', 'pratique/avaries.html'],
      ['o15', 'Je sais appeler les secours et lancer un message de détresse', 'cours/10-vhf.html'],
      ['o16', 'Je connais les prérogatives (ce que j’ai le droit de faire) du diplôme du PE', 'cours/09-securite.html'],
    ],
  },
  {
    id: 'pratique',
    titre: '5. Pratique',
    items: [
      ['p01', 'Je connais les vérifications à faire avant de partir en navigation', 'pratique/chef-de-bord.html'],
      ['p02', 'Je sais contrôler la présence et l’état du matériel, particulièrement du matériel de sécurité', 'pratique/chef-de-bord.html'],
      ['p03', 'Je connais les documents obligatoires', 'cours/09-securite.html'],
      ['p04', 'Je sais contrôler la tenue de mes équipiers avant la navigation', 'pratique/chef-de-bord.html'],
      ['p05', 'Je sais ranger le bateau pour une navigation, déléguer le rangement et le contrôler', 'pratique/chef-de-bord.html'],
      ['p06', 'Je sais prendre des notes en briefing de navigation avec le CF', 'pratique/chef-de-bord.html'],
      ['p07', 'Je sais expliquer la navigation du jour à mes équipiers', 'pratique/chef-de-bord.html'],
      ['p08', 'Je sais expliquer une manœuvre simplement, avec un vocabulaire adapté', 'pratique/chef-de-bord.html'],
      ['p09', 'Je sais répartir les rôles et surveiller les actions de chacun', 'pratique/chef-de-bord.html'],
      ['p10', 'Je connais les dangers de la manœuvre : je surveille le plan d’eau et maîtrise ma trajectoire', 'pratique/manoeuvres.html'],
      ['p11', 'Je sais me placer et me déplacer correctement sur le bateau', 'pratique/chef-de-bord.html'],
      ['p12', 'Je sais anticiper et décider de lancer une manœuvre bien avant qu’il ne soit trop tard', 'pratique/manoeuvres.html'],
      ['p13', 'Je sais utiliser correctement la VHF', 'cours/10-vhf.html'],
      ['p14', 'Je sais hisser ou affaler la voile, et enrouler le foc à la main', 'pratique/manoeuvres.html'],
      ['p15', 'Je sais virer de bord en maîtrisant ma trajectoire et l’assiette du bateau', 'pratique/manoeuvres.html'],
      ['p16', 'Je sais empanner en toute sécurité', 'pratique/manoeuvres.html'],
      ['p17', 'Je sais tenir un alignement avant ou arrière', 'pratique/manoeuvres.html'],
      ['p18', 'Je sais tenir un ciseau', 'pratique/manoeuvres.html'],
      ['p19', 'Je sais arrêter mon bateau, par exemple à la cape, au moins une minute', 'pratique/manoeuvres.html'],
      ['p20', 'Je sais réaliser une manœuvre d’homme à la mer sans oublier d’étape, et arriver à l’arrêt sur la bouée', 'pratique/hlm.html'],
      ['p21', 'Je sais prendre un ris ou le larguer en moins de 4 minutes, au près serré', 'pratique/manoeuvres.html'],
      ['p22', 'Je sais régler l’enrouleur pour adapter la surface du foc à celle de la grand-voile', 'pratique/manoeuvres.html'],
      ['p23', 'Je sais accoster en tenant compte de l’environnement (vent, trafic…)', 'pratique/port.html'],
      ['p24', 'Je sais vérifier l’amarrage de mon bateau au quai', 'pratique/port.html'],
      ['p25', 'Je sais prendre un coffre ou un mouillage, et vérifier sa bonne tenue', 'pratique/mouillage.html'],
      ['p26', 'Je sais préparer une patte d’oie pour un remorquage', 'pratique/avaries.html'],
      ['p27', 'Je sais adapter la longueur de la remorque aux conditions météo', 'pratique/avaries.html'],
      ['p28', 'Je sais me positionner grossièrement à tout moment sur la carte', 'cours/03-estime.html'],
      ['p29', 'Je sais faire un point par trois relèvements en 4 minutes', 'cours/02-compas.html'],
      ['p30', 'Je sais choisir des amers pertinents', 'cours/02-compas.html'],
      ['p31', 'Je sais déduire des effets sur le vent, la mer ou le courant en observant le relief de la côte', 'cours/08-meteo.html'],
      ['p32', 'Je connais l’impact de la nature du fond sur mon mouillage et sais la contrôler', 'pratique/mouillage.html'],
      ['p33', 'Je sais prendre du recul sur ma navigation et garder une vision globale du plan d’eau', 'pratique/chef-de-bord.html'],
      ['p34', 'Je sais tenir mon carnet de bord proprement', 'pratique/chef-de-bord.html'],
    ],
  },
];

// CQ : d'après le manuel de formation du chef de quart (2025, avec son autotest), la formation
// théorique CQ/CF et les conditions de passage des examens (2022).
export const SECTIONS_CQ = [
  {
    id: 'cq-cadre',
    titre: '1. Prérequis et cadre',
    items: [
      ['cq01', 'Je maîtrise tout le programme du PE et je sais l’enseigner aux jeunes', 'cqcf/diplomes.html#prerequis'],
      ['cq02', 'J’ai le permis côtier et le PSC1, et je les ai enregistrés sur Céphée', 'cqcf/diplomes.html#prerequis'],
      ['cq03', 'Je connais les prérogatives du CQ : voile légère, randonnée nautique, habitable en autonomie (nombre de bateaux, distance d’un abri, vent)', 'cqcf/diplomes.html#prerogatives'],
      ['cq04', 'Je sais ce qu’est un abri et je sais en repérer sur la carte selon le vent du jour', 'cqcf/diplomes.html#prerogatives'],
      ['cq05', 'Je connais mes responsabilités de CQ et le partage des rôles avec le chef d’unité', 'cqcf/diplomes.html#responsabilite'],
      ['cq06', 'Je connais les démarches de l’examen : inscription sur Céphée un mois avant, CV scout et marin, test préalable de navigation', 'cqcf/diplomes.html#inscription'],
    ],
  },
  {
    id: 'cq-prep',
    titre: '2. Préparation et dossier',
    items: [
      ['cq07', 'Je sais choisir des bateaux et une zone de navigation adaptés aux jeunes et aux prérogatives du diplôme', 'cqcf/preparer.html#annee'],
      ['cq08', 'Je sais faire une demande de visa marin sur Céphée et je connais ses délais', 'cqcf/preparer.html#annee'],
      ['cq09', 'Je sais construire un dossier de navigation : présentation, journée type, une fiche par jour, carte résumé', 'cqcf/dossier.html#contenu'],
      ['cq10', 'Je sais indiquer dans chaque fiche journalière les horaires, les dangers, les ports de repli et les activités pédagogiques', 'cqcf/dossier.html#trame'],
      ['cq11', 'Je connais le rôle du correspondant à terre et je sais organiser les contacts avant, pendant et après la navigation', 'cqcf/preparer.html#correspondant'],
      ['cq12', 'Je sais prendre en main une flottille que je ne connais pas : bateaux, matériel, équipages', 'cqcf/preparer.html#prise-en-main'],
    ],
  },
  {
    id: 'cq-meteo',
    titre: '3. Météo, marée et sécurité',
    items: [
      ['cq13', 'Je sais lire un bulletin météo marine, et je sais que le bulletin expertisé de Météo-France fait foi', 'cqcf/preparer.html#meteo'],
      ['cq14', 'Je sais croiser les sources météo, observer la situation sur zone et appliquer le doute systématique', 'cqcf/preparer.html#meteo'],
      ['cq15', 'Je sais calculer la marée et prévoir les courants de la zone pour la journée', 'cqcf/preparer.html#maree'],
      ['cq16', 'Je sais bâtir une journée qui rentre au plus tard 2 h avant le coucher du soleil, avec des marges', 'cqcf/preparer.html#journee'],
      ['cq17', 'Je sais faire le tour des bateaux avant le départ et vérifier leur armement', 'cqcf/preparer.html#tour'],
    ],
  },
  {
    id: 'cq-flot',
    titre: '4. Conduite de la flottille',
    items: [
      ['cq18', 'Je sais animer le briefing des chefs de bord et vérifier que les consignes sont notées', 'cqcf/preparer.html#briefing'],
      ['cq19', 'Je sais me placer par rapport à la flottille et au danger, et garder les bateaux groupés', 'cqcf/flottille.html#position'],
      ['cq20', 'Je sais passer des consignes claires par VHF, avec un ordre de réponse, et les noter', 'cqcf/flottille.html#consignes'],
      ['cq21', 'Je sais organiser la sortie et l’entrée de port de la flottille', 'cqcf/flottille.html#port'],
      ['cq22', 'Je sais organiser le mouillage de la flottille et faire la ronde de vérification', 'cqcf/flottille.html#mouillage'],
      ['cq23', 'Je sais tenir le journal de flottille et mener le débriefing', 'cqcf/flottille.html#journal'],
    ],
  },
  {
    id: 'cq-secu',
    titre: '5. Bateau de sécurité',
    items: [
      ['cq24', 'Je sais prendre en main la sécu et faire les vérifications du matin : moteur, carburant, armement, coupe-circuit', 'cqcf/bateau-secu.html#prise-en-main'],
      ['cq25', 'Je sais conduire la sécu dans le clapot, en dosant les gaz sans à-coups', 'cqcf/bateau-secu.html#conduite'],
      ['cq26', 'Je sais approcher un voilier, et y embarquer ou en débarquer une personne', 'cqcf/bateau-secu.html#approcher'],
      ['cq27', 'Je sais remorquer un ou plusieurs bateaux, en flèche ou à couple, et donner les consignes de sécurité', 'cqcf/bateau-secu.html#remorquage'],
      ['cq28', 'Je sais récupérer un homme à la mer et aider au redressement d’un dériveur', 'cqcf/bateau-secu.html#secours'],
      ['cq29', 'Je sais dépanner un moteur hors-bord dans les cas simples', 'cqcf/bateau-secu.html#pannes'],
    ],
  },
  {
    id: 'cq-av',
    titre: '6. Avaries et secours',
    items: [
      ['cq30', 'Je sais gérer une avarie de l’extérieur : rester calme, faire un état des lieux, rappeler la réaction immédiate, laisser agir le chef de bord', 'cqcf/avaries.html#principes'],
      ['cq31', 'Je sais déclencher les secours (CROSS, VHF 16, 196) et rester factuel à la radio', 'cqcf/avaries.html#alerter'],
      ['cq32', 'Je sais mettre le reste de la flottille en sécurité pendant un incident', 'cqcf/avaries.html#securiser'],
      ['cq33', 'Je connais la conduite à tenir face aux incidents de flottille : dispersion, blessé, problème humain', 'cqcf/avaries.html#incidents'],
    ],
  },
  {
    id: 'cq-peda',
    titre: '7. Pédagogie et dimension scoute',
    items: [
      ['cq34', 'Je sais intégrer la navigation dans la vie de l’unité : les cinq buts, l’équipage, l’imaginaire', 'cqcf/pedagogie.html#cinq-buts'],
      ['cq35', 'Je sais proposer des jeux sur l’eau, avec la sécu, et des activités à terre en cas de mauvais temps', 'cqcf/pedagogie.html#jeu'],
      ['cq36', 'Je sais faire progresser les jeunes pendant la navigation, en m’appuyant sur les chefs de bord', 'cqcf/pedagogie.html#progression'],
    ],
  },
  {
    id: 'cq-oral',
    titre: '8. Oral',
    items: [
      ['cq37', 'Je sais présenter mon dossier au jury en 15 à 20 minutes', 'cqcf/diplomes.html#examen'],
      ['cq38', 'Je sais répondre à une mise en situation : réaction immédiate, décisions, analyse de la nouvelle situation', 'cqcf/oral.html#situations'],
      ['cq39', 'Je sais répondre aux questions classiques sur la réglementation, la météo et la conduite de flottille', 'cqcf/oral.html#reglementation'],
    ],
  },
];

// CF : d'après le manuel de formation du chef de flottille (2026), la formation théorique CQ/CF
// et les conditions de passage des examens (2022).
export const SECTIONS_CF = [
  {
    id: 'cf-cadre',
    titre: '1. Prérequis et cadre',
    items: [
      ['cf01', 'Je maîtrise le programme du PE et j’ai navigué comme chef de bord sur le type de bateau choisi', 'cqcf/diplomes.html#prerequis'],
      ['cf02', 'J’ai le permis côtier, le PSC1 et le CEP1', 'cqcf/diplomes.html#prerequis'],
      ['cf03', 'J’ai une expérience d’encadrement de flottille, si possible comme CQ, et des navigations hors du cadre scout', 'cqcf/diplomes.html#prerequis'],
      ['cf04', 'Je connais les prérogatives du CF : flottille de 4 habitables au plus, habitable seul encadré depuis la côte, prérogatives du CQ', 'cqcf/diplomes.html#prerogatives'],
      ['cf05', 'Je connais les conditions d’une flottille d’habitables : un PE ou un CQ sur chaque bateau, 6 milles d’un abri, force 4 rafales à 5', 'cqcf/habitables.html#cadre'],
      ['cf06', 'Je connais mes responsabilités et la place du chef d’unité, qui garde l’autorité pédagogique', 'cqcf/diplomes.html#responsabilite'],
    ],
  },
  {
    id: 'cf-prep',
    titre: '2. Préparation et dossier',
    items: [
      ['cf07', 'Je sais répondre à un sujet de CF (ports, durée, nombre et type de bateaux) en prenant mon unité comme exemple', 'cqcf/dossier.html#contenu'],
      ['cf08', 'Je sais rédiger un visa marin technique et le dossier d’une navigation de plusieurs jours', 'cqcf/dossier.html#trame'],
      ['cf09', 'Je sais prévoir des horaires larges, des replis réels et des nuits tranquilles', 'cqcf/dossier.html#rediger'],
      ['cf10', 'Je sais organiser les escales, les ports et l’intendance d’une navigation de plusieurs jours', 'cqcf/habitables.html#escales'],
      ['cf11', 'Je sais choisir des habitables adaptés aux jeunes et à leur niveau, et organiser le bateau de maîtrise', 'cqcf/habitables.html#bateaux'],
      ['cf12', 'Je sais organiser le rôle du correspondant à terre et les contacts de la journée', 'cqcf/preparer.html#correspondant'],
    ],
  },
  {
    id: 'cf-meteo',
    titre: '3. Météo et sécurité',
    items: [
      ['cf13', 'Je sais préparer la météo et la marée d’une navigation de plusieurs jours, en croisant les sources', 'cqcf/preparer.html#meteo'],
      ['cf14', 'Je sais analyser la carte pour choisir les routes, repérer les dangers et les abris de chaque étape', 'cqcf/dossier.html#trame'],
      ['cf15', 'Je connais les documents à avoir à bord de chaque habitable', 'cqcf/habitables.html#documents'],
      ['cf16', 'Je sais vérifier les habitables et leur armement à la prise en main et chaque matin', 'cqcf/preparer.html#tour'],
    ],
  },
  {
    id: 'cf-flot',
    titre: '4. Conduite de la flottille d’habitables',
    items: [
      ['cf17', 'Je sais briefer les chefs de bord et vérifier ce qu’ils ont noté', 'cqcf/habitables.html#chefs-de-bord'],
      ['cf18', 'Je sais organiser le départ et la sortie de port de la flottille', 'cqcf/habitables.html#depart'],
      ['cf19', 'Je sais encadrer depuis mon habitable : me placer, garder la flottille groupée, communiquer', 'cqcf/habitables.html#en-mer'],
      ['cf20', 'Je sais mener mon propre bateau en sécurité pendant que j’encadre', 'cqcf/flottille.html#position'],
      ['cf21', 'Je sais organiser l’arrivée au port et les relations avec la capitainerie', 'cqcf/habitables.html#arrivee'],
      ['cf22', 'Je sais organiser le mouillage de nuit et la veille', 'cqcf/habitables.html#mouillage'],
      ['cf23', 'Je sais tenir le journal de flottille et remettre en question ma navigation', 'cqcf/flottille.html#journal'],
    ],
  },
  {
    id: 'cf-av',
    titre: '5. Manœuvres, avaries et secours',
    items: [
      ['cf24', 'Je sais faire seul avec mon équipage une manœuvre d’homme à la mer sur un habitable', 'pratique/hlm.html'],
      ['cf25', 'Je sais remorquer un habitable', 'cqcf/habitables.html#remorquer'],
      ['cf26', 'Je sais réussir une manœuvre de port avec un habitable', 'pratique/port.html'],
      ['cf27', 'Je sais gérer une avarie depuis un habitable : état des lieux, alerte, sécurité de la flottille', 'cqcf/avaries.html#agir'],
      ['cf28', 'Je sais déclencher les secours et renseigner le CROSS', 'cqcf/avaries.html#alerter'],
      ['cf29', 'Je sais prévenir le correspondant à terre et rendre compte après un incident', 'cqcf/avaries.html#apres'],
    ],
  },
  {
    id: 'cf-peda',
    titre: '6. Pédagogie et dimension scoute',
    items: [
      ['cf30', 'Je sais organiser des journées complètes, en mer et à terre, cohérentes avec la pédagogie de l’unité', 'cqcf/pedagogie.html#annee'],
      ['cf31', 'Je sais faire vivre l’équipage à bord : rôles, vie du bord, progression de chacun', 'cqcf/habitables.html#vie-a-bord'],
      ['cf32', 'Je sais proposer un jeu à la flottille pendant la navigation', 'cqcf/pedagogie.html#jeu'],
      ['cf33', 'Je sais former les jeunes qui me sont confiés, quel que soit leur âge', 'cqcf/pedagogie.html#progression'],
    ],
  },
  {
    id: 'cf-oral',
    titre: '7. Oral',
    items: [
      ['cf34', 'Je sais présenter mon dossier à un jury qui suit la navigation sur sa carte', 'cqcf/diplomes.html#examen'],
      ['cf35', 'Je sais répondre aux questions sur la réglementation et les prérogatives des diplômes', 'cqcf/oral.html#reglementation'],
      ['cf36', 'Je sais répondre aux questions propres au CF et aux mises en situation', 'cqcf/oral.html#cf'],
    ],
  },
];

export const LISTES = { PE: SECTIONS, CQ: SECTIONS_CQ, CF: SECTIONS_CF };

// Tous les points des trois listes, par id
export const ITEMS = Object.fromEntries(
  Object.entries(LISTES).flatMap(([liste, secs]) =>
    secs.flatMap((s) => s.items.map(([id, texte, ref]) => [id, { id, texte, ref, section: s.id, liste }]))
  )
);
export const TOTAUX = Object.fromEntries(Object.entries(LISTES).map(([k, secs]) => [k, secs.reduce((n, s) => n + s.items.length, 0)]));
export const TOTAL = TOTAUX.PE;
// Points validés d'une liste : v = carnets/{uid}.v
export const valides = (v, liste) => Object.keys(v || {}).filter((id) => ITEMS[id] && ITEMS[id].liste === liste).length;
