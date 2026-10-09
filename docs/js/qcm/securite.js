const R = 'cours/09-securite.html';

export default [
  {
    id: 'se01', q: 'Pour la Division 240, une navigation « basique » se fait à moins de :',
    c: ['2 milles d’un abri', '6 milles d’un abri', '300 m d’un abri', '2 milles de la côte'], a: 0,
    e: 'Basique : moins de 2 M d’un abri ; côtier : 2 à 6 M ; semi-hauturier : 6 à 60 M ; hauturier : au-delà.', ref: R + '#zones',
  },
  {
    id: 'se02', q: 'Une navigation « côtière » au sens de la Division 240 se fait :',
    c: ['Entre 2 et 6 milles d’un abri', 'Entre 6 et 60 milles d’un abri', 'Dans la bande des 300 m', 'À moins de 20 milles de la côte'], a: 0,
    e: 'Côtier : de 2 à moins de 6 milles d’un abri. La distance se compte depuis un abri, pas depuis la côte.', ref: R + '#zones',
  },
  {
    id: 'se03', q: 'Qu’est-ce qu’un abri au sens de la réglementation ?', src: 'annale 2022',
    c: ['Un endroit de la côte où l’on peut se mettre en sécurité et repartir sans assistance, compte tenu de la météo', 'Une crique', 'Une partie de la côte protégée du vent', 'Un port équipé d’une capitainerie'], a: 0,
    e: 'La notion d’abri tient compte des conditions du moment et du bateau : une crique peut être un abri par vent d’Est et un piège par vent d’Ouest.', ref: R + '#zones',
  },
  {
    id: 'se04', q: 'En navigation côtière (jusqu’à 6 milles d’un abri), l’équipement individuel de flottabilité doit être d’au moins :', src: 'annale 2021',
    c: ['100 N (ou 50 N effectivement porté par une personne sachant nager)', '50 N dans tous les cas', '150 N', '275 N'], a: 0,
    e: 'Côtier : 100 N, sauf si l’on porte réellement un EIF de 50 N (et qu’on sait nager). Basique : 50 N. Au-delà de 6 M : 150 N.', ref: R + '#zones',
  },
  {
    id: 'se05', q: 'Jusqu’à 2 milles d’un abri, l’équipement individuel de flottabilité doit être d’au moins :',
    c: ['50 N', '100 N', '150 N', 'Aucun minimum'], a: 0,
    e: 'Navigation basique : 50 N par personne embarquée.', ref: R + '#zones',
  },
  {
    id: 'se06', q: 'Lequel de ces équipements n’est PAS obligatoire en navigation côtière ?',
    c: ['Un radeau de survie', 'Une bouée couronne ou fer à cheval', 'Trois feux rouges à main', 'Un compas magnétique (ou GPS étanche)'], a: 0,
    e: 'Le radeau de survie n’est exigé qu’au-delà de 6 milles d’un abri (semi-hauturier).', ref: R + '#zones',
  },
  {
    id: 'se07', q: 'Une VHF fixe est obligatoire :',
    c: ['À partir de 6 milles d’un abri (semi-hauturier)', 'Dès 2 milles d’un abri', 'Dès qu’on quitte le port', 'Jamais'], a: 0,
    e: 'VHF fixe obligatoire en semi-hauturier et hauturier. En deçà, elle reste vivement recommandée (au moins une portative).', ref: R + '#zones',
  },
  {
    id: 'se08', q: 'Un bateau de catégorie de conception C est conçu pour :',
    c: ['Un vent jusqu’à force 6 et des vagues jusqu’à 2 m', 'Un vent jusqu’à force 8 et des vagues jusqu’à 4 m', 'Un vent jusqu’à force 4 et des vagues de 0,3 m', 'Toutes conditions'], a: 0,
    e: 'A : au-delà de force 8 ; B : jusqu’à 8 et 4 m ; C : jusqu’à 6 et 2 m ; D : jusqu’à 4 et 0,3 m.', ref: R + '#categories',
  },
  {
    id: 'se09', q: 'Un dériveur de catégorie de conception D est conçu pour naviguer par :',
    c: ['Vent jusqu’à force 4, vagues jusqu’à 0,3 m', 'Vent jusqu’à force 6, vagues jusqu’à 2 m', 'Vent jusqu’à force 8', 'Toutes conditions, près des côtes'], a: 0,
    e: 'Catégorie D : eaux protégées, vent jusqu’à force 4, vagues de 0,3 m (occasionnellement 0,5 m).', ref: R + '#categories',
  },
  {
    id: 'se10', q: 'Vous êtes en détresse. Qui devez-vous alerter en premier ?', src: 'annale 2021',
    c: ['Le CROSS', 'La SNSM', 'La capitainerie', 'Le sémaphore le plus proche'], a: 0,
    e: 'Le CROSS coordonne tous les secours (SNSM, Marine, hélicoptères, navires proches). On le joint par VHF 16, ASN ou téléphone 196.', ref: R + '#sauvetage',
  },
  {
    id: 'se11', q: 'En cas d’urgence, je contacte en premier :', src: 'annale 2023',
    c: ['Le CROSS sur le canal 16', 'Le centre national de mon association', 'La SNSM sur son numéro'], a: 0,
    e: 'Le CROSS d’abord : c’est lui qui déclenche et coordonne les moyens.', ref: R + '#sauvetage',
  },
  {
    id: 'se12', q: 'Le numéro de téléphone d’urgence maritime, qui aboutit au CROSS, est le :',
    c: ['196', '18', '17', '115'], a: 0,
    e: 'Le 196 est le numéro d’urgence en mer ; l’appel est transféré au CROSS le plus proche.', ref: R + '#sauvetage',
  },
  {
    id: 'se13', q: 'Le sauvetage des personnes en mer est :',
    c: ['Obligatoire et gratuit', 'Payant, facturé par la SNSM', 'Facultatif', 'Gratuit seulement pour les bateaux assurés'], a: 0,
    e: 'Aucune rémunération ne peut être demandée pour sauver des personnes. Le remorquage et l’assistance aux biens, eux, peuvent être payants.', ref: R + '#sauvetage',
  },
  {
    id: 'se14', q: 'Le remorquage d’un bateau en panne de moteur, sans danger pour les personnes :',
    c: ['Est un contrat, payant, dont le demandeur choisit le remorqueur', 'Est toujours gratuit', 'Est obligatoire pour tout navire présent', 'Est assuré gratuitement par le CROSS'], a: 0,
    e: 'Le remorquage donne lieu à un contrat de services ; l’assurance le prend souvent en charge.', ref: R + '#sauvetage',
  },
  {
    id: 'se15', q: 'Quel CROSS est compétent de la pointe de Penmarc’h à la frontière espagnole ?',
    c: ['Étel', 'Corsen', 'Jobourg', 'La Garde'], a: 0,
    e: 'Corsen : de la baie du Mont-Saint-Michel à Penmarc’h ; Étel : de Penmarc’h à l’Espagne.', ref: R + '#sauvetage',
  },
  {
    id: 'se16', q: 'Par erreur, un gilet autogonflant se déclenche le premier jour lors d’une manœuvre :', src: 'annale 2024',
    c: ['Il doit être révisé au plus tôt, et l’équipier prend un autre gilet', 'Il assure toujours la sécurité : on le garde pour la semaine', 'On le dégonfle et on le remet tel quel'], a: 0,
    e: 'Sa cartouche est vide : il ne se regonflera pas. Il faut le réarmer (cartouche, pastille) avant de le réutiliser.', ref: R + '#zones',
  },
  {
    id: 'se17', q: 'Un équipement de flottabilité de 150 N par personne est exigé :',
    c: ['Au-delà de 6 milles d’un abri', 'Dès 2 milles d’un abri', 'Seulement de nuit', 'Seulement pour les enfants'], a: 0,
    e: '150 N en semi-hauturier et hauturier.', ref: R + '#zones',
  },
  {
    id: 'se18', q: 'La Division 240 est :',
    c: ['La réglementation du matériel de sécurité des navires de plaisance', 'Le règlement de priorité en mer', 'Le code du balisage', 'La liste des ports de référence'], a: 0,
    e: 'Elle fixe les zones de navigation et le matériel d’armement et de sécurité correspondant, pour les navires de plaisance de moins de 24 m.', ref: R + '#zones',
  },
  {
    id: 'se19', q: 'Où éviter de mouiller pour préserver le milieu ?',
    c: ['Dans les herbiers (zostères, posidonies)', 'Sur un fond de sable', 'Sur une bouée d’amarrage prévue à cet effet', 'Dans une zone de mouillage balisée'], a: 0,
    e: 'Les herbiers sont des nurseries pour les poissons ; l’ancre et la chaîne les arrachent.', ref: R + '#environnement',
  },
  {
    id: 'se20', q: 'Votre voilier est échoué et complètement à sec. Faire tourner le moteur pour recharger les batteries :', src: 'annale 2024',
    c: ['Est une mauvaise idée : sans eau de refroidissement, il chauffe et peut prendre feu', 'Est une bonne idée', 'Est sans conséquence'], a: 0,
    e: 'Les prises d’eau de refroidissement sont sous la flottaison : à sec, le moteur n’est plus refroidi.', ref: 'cours/04-maree.html#mouillage',
  },
  {
    id: 'se21', q: 'Un équipier a le mal de mer. Le meilleur conseil est :',
    c: ['Rester sur le pont, au grand air, regarder l’horizon et s’occuper (barrer, par exemple)', 'Descendre dans la cabine lire un livre', 'Ne plus rien boire', 'Se mettre à l’avant du bateau'], a: 0,
    e: 'L’horizon et l’activité limitent le conflit entre l’oreille interne et la vue. On le surveille : il se refroidit et devient vite incapable d’agir.', ref: R + '#prevention',
  },
  {
    id: 'se22', q: 'Le matériel de sécurité obligatoire dépend :',
    c: ['De la distance à un abri à laquelle on navigue', 'De la longueur du bateau uniquement', 'Du nombre de voiles', 'De la saison'], a: 0,
    e: 'La Division 240 organise le matériel selon l’éloignement d’un abri : basique, côtier, semi-hauturier, hauturier.', ref: R + '#zones',
  },
  {
    id: 'se23', q: 'En navigation basique (moins de 2 milles d’un abri), lequel de ces équipements est obligatoire ?',
    c: ['Un dispositif lumineux étanche (lampe torche)', 'Une bouée couronne', 'Trois feux rouges à main', 'Les cartes marines de la zone'], a: 0,
    e: 'Basique : EIF, dispositif lumineux, extincteur selon le bateau, moyen d’assèchement, dispositif de remorquage, ligne de mouillage. Bouée, feux à main et cartes s’ajoutent en côtier.', ref: R + '#zones',
  },
  {
    id: 'se24', q: 'En navigation côtière (2 à 6 milles d’un abri), quels documents doivent être à bord ?',
    c: ['Les cartes marines officielles à jour, le RIPAM (ou un résumé) et la description du balisage', 'Le livre des feux et le journal de bord', 'Aucun document', 'Seulement l’annuaire des marées'], a: 0,
    e: 'Livre des feux et journal de bord ne deviennent obligatoires qu’en semi-hauturier, au-delà de 6 milles.', ref: R + '#zones',
  },
  {
    id: 'se25', q: 'Une radiobalise de détresse (EPIRB) est obligatoire :',
    c: ['Au-delà de 60 milles d’un abri (hauturier)', 'Dès 2 milles d’un abri', 'Dès 6 milles d’un abri', 'Jamais en plaisance'], a: 0,
    e: 'Hauturier : radiobalise, en plus du matériel semi-hauturier (radeau, VHF fixe, harnais…).', ref: R + '#zones',
  },
  {
    id: 'se26', q: 'Pour une navigation scoute (jusqu’à 6 milles d’un abri), lequel de ces équipements est obligatoire ?', src: 'annale 2020',
    c: ['Un gilet de sauvetage par personne embarquée', 'Trois fusées à parachute', 'Une radiobalise de détresse', 'Un projecteur de recherche d’homme à la mer'], a: 0,
    e: 'Chaque personne a son gilet, porté en permanence. Projecteur et radiobalise ne sont exigés qu’au-delà de 6 et de 60 milles ; en côtier, on emporte des feux à main, pas de fusées obligatoires.', ref: R + '#zones',
  },
  {
    id: 'se27', q: 'Un harnais et une longe par personne sont obligatoires à bord des voiliers :',
    c: ['Au-delà de 6 milles d’un abri', 'Dès 2 milles d’un abri', 'Uniquement la nuit', 'Jamais : ils sont seulement recommandés'], a: 0,
    e: 'C’est du matériel semi-hauturier. Plus près, le harnais reste utile par mauvais temps.', ref: R + '#zones',
  },
  {
    id: 'se28', q: 'Une aide à la flottabilité de 50 N :',
    c: ['Suppose que la personne sache nager : elle ne retourne pas une personne inconsciente', 'Retourne sur le dos une personne inconsciente', 'Suffit pour toutes les navigations', 'Ne se porte qu’en cas de danger'], a: 0,
    e: 'À partir de 100 N, ce sont des gilets de sauvetage, conçus pour retourner une personne inconsciente sur le dos, d’autant mieux que la flottabilité est grande.', ref: R + '#zones',
  },
  {
    id: 'se29', q: 'À quoi sert la sous-cutale d’un gilet ?',
    c: ['À empêcher le gilet de remonter sur le visage dans l’eau', 'À accrocher la longe du harnais', 'À ranger le gilet', 'À déclencher le gonflage'], a: 0,
    e: 'Un gilet ne protège que s’il est porté, ajusté et attaché, sous-cutale comprise.', ref: R + '#zones',
  },
  {
    id: 'se30', q: 'Votre voilier est de catégorie de conception C. Le bulletin annonce force 7 :',
    c: ['Il n’est pas conçu pour ces conditions : on ne sort pas', 'Aucun problème en restant à moins de 6 milles d’un abri', 'On sort avec un ris', 'On sort si le chef de bord est expérimenté'], a: 0,
    e: 'Catégorie C : jusqu’à force 6 et 2 m de vagues. La catégorie limite les conditions, quelle que soit la distance à l’abri. Et la limite scoute est bien plus basse.', ref: R + '#categories',
  },
  {
    id: 'se31', q: 'Quel CROSS coordonne les secours en Méditerranée ?',
    c: ['La Garde', 'Étel', 'Gris-Nez', 'Jobourg'], a: 0,
    e: 'La Garde, avec Aspretto en Corse. Gris-Nez et Jobourg couvrent la Manche, Corsen la pointe de Bretagne, Étel le golfe de Gascogne.', ref: R + '#sauvetage',
  },
  {
    id: 'se32', q: 'La SNSM est :',
    c: ['Une association de sauveteurs bénévoles qui arme les canots de sauvetage', 'Le service de l’État qui coordonne les secours en mer', 'Une entreprise de remorquage', 'Un service de la Marine nationale'], a: 0,
    e: 'C’est le CROSS qui coordonne les secours ; il engage la SNSM, la Marine, des hélicoptères ou des navires proches.', ref: R + '#sauvetage',
  },
  {
    id: 'se33', q: 'Les sémaphores de la côte :',
    c: ['Sont des postes de la Marine nationale qui veillent la mer à vue et à la VHF', 'Sont des phares automatiques', 'Donnent les heures de marée', 'Sont tenus par la SNSM'], a: 0,
    e: 'Ils surveillent les approches et relaient les alertes vers le CROSS.', ref: R + '#sauvetage',
  },
  {
    id: 'se34', q: 'Vous avez alerté le CROSS pour une avarie ; la situation s’améliore et vous n’avez plus besoin d’aide :',
    c: ['Je préviens le CROSS et je reste en veille', 'Je ne dis rien : le CROSS comprendra', 'J’éteins la VHF pour économiser la batterie', 'Je préviens seulement mon correspondant à terre'], a: 0,
    e: 'On informe le CROSS de toute évolution, en mieux comme en pire, pour qu’il n’engage pas des moyens pour rien.', ref: R + '#sauvetage',
  },
  {
    id: 'se35', q: 'Un navire en danger de se perdre est sauvé, avec sa cargaison, par un autre navire. Cette assistance aux biens :',
    c: ['Ouvre droit à une rémunération', 'Est toujours gratuite', 'Est payée par le CROSS', 'Est interdite aux plaisanciers'], a: 0,
    e: 'Seul le sauvetage des personnes est gratuit. L’assistance aux biens est rémunérée selon les biens sauvés et les moyens engagés.', ref: R + '#sauvetage',
  },
  {
    id: 'se36', q: 'Pour éviter la chute à l’eau, l’accident le plus grave, on applique notamment :',
    c: ['« Une main pour soi, une main pour le bateau », gilet porté et ajusté', 'On se tient aux écoutes', 'On reste debout à l’avant pendant les manœuvres', 'On retire son gilet pour être plus mobile'], a: 0,
    e: 'Par mauvais temps, on s’attache aussi avec un harnais ; sans rôle dans la manœuvre, on reste dans le cockpit.', ref: R + '#prevention',
  },
  {
    id: 'se37', q: 'Avant d’empanner, le barreur :',
    c: ['Annonce la manœuvre et fait contrôler la bôme à l’écoute', 'Laisse passer la grand-voile seule', 'Fait lever l’équipage dans le cockpit pour aider', 'N’annonce rien : c’est une manœuvre courante'], a: 0,
    e: 'Un empannage non contrôlé envoie la bôme d’un bord à l’autre avec violence : coup de bôme, casse, risque de chute à l’eau.', ref: R + '#prevention',
  },
  {
    id: 'se38', q: 'Un équipier vient d’être repêché après une chute à l’eau, en été :',
    c: ['On le sèche, on le change, on le réchauffe et on le surveille', 'Il reprend son poste aussitôt : l’eau est chaude', 'On lui donne de l’alcool pour le réchauffer', 'On le laisse sécher au vent'], a: 0,
    e: 'Une personne tombée à l’eau se refroidit très vite, même en été. L’alcool accélère la perte de chaleur.', ref: R + '#prevention',
  },
  {
    id: 'se39', q: 'Un passe-coque cède et l’eau entre. Pour boucher rapidement le trou, on utilise :',
    c: ['Une pinoche (bouchon conique en bois) enfoncée dans le trou', 'Du ruban adhésif', 'Rien : on se contente d’écoper', 'Le moteur, pour rentrer plus vite'], a: 0,
    e: 'On garde une pinoche près de chaque passe-coque. Puis on donne l’alerte et on fait route vers un abri en écopant.', ref: R + '#prevention',
  },
  {
    id: 'se40', q: 'Après avoir utilisé le réchaud à gaz :',
    c: ['On ferme le robinet de la bouteille', 'On laisse la bouteille ouverte pour la prochaine fois', 'On aère seulement la cabine', 'On ferme seulement le bouton du réchaud'], a: 0,
    e: 'Le gaz est plus lourd que l’air : une fuite s’accumule dans les fonds et peut exploser.', ref: R + '#prevention',
  },
  {
    id: 'se41', q: 'En navigation, les déchets du bord :',
    c: ['Restent à bord jusqu’au port', 'Peuvent être jetés à la mer s’ils sont en papier', 'Se jettent au large, à plus de 3 milles', 'Se brûlent à bord'], a: 0,
    e: 'Ne rien jeter à la mer : on trie à bord et on dépose les déchets au port.', ref: R + '#environnement',
  },
  {
    id: 'se42', q: 'On peut vider les toilettes du bord (eaux noires) :',
    c: ['Ni dans les ports, ni près des côtes, ni dans les zones de baignade', 'Partout : la mer dilue tout', 'Dans les ports, où l’eau est calme', 'À l’entrée des ports'], a: 0,
    e: 'Les eaux noires polluent les plages et les parcs à coquillages. Beaucoup de ports ont une pompe de récupération.', ref: R + '#environnement',
  },
  {
    id: 'se43', q: 'Que fait-on des feux à main périmés ?',
    c: ['On les rapporte au magasin d’accastillage', 'On les tire en mer pour s’entraîner', 'On les jette avec les ordures ménagères', 'On les jette à la mer'], a: 0,
    e: 'Un feu tiré sans détresse déclenche une fausse alerte. Les points de vente reprennent les engins pyrotechniques périmés.', ref: R + '#zones',
  },
  {
    id: 'se44', q: 'Un équipier tombe à l’eau. Le premier réflexe :',
    c: ['Crier « Un homme à la mer ! », lancer la bouée et désigner quelqu’un qui le montre du doigt sans le quitter des yeux', 'Faire demi-tour au moteur avant toute chose', 'Appeler d’abord la capitainerie', 'Affaler toutes les voiles avant toute chose'], a: 0,
    e: 'Une tête dans les vagues se perd vite de vue. On marque la position (bouton MOB du GPS), on alerte le CROSS et on revient le chercher.', ref: R + '#prevention',
  },
  {
    id: 'se45', q: 'Vous croisez un groupe de dauphins :',
    c: ['Je ralentis et je garde mes distances', 'Je m’approche au moteur pour les voir de près', 'Je fonce dans le groupe : ils s’écartent toujours', 'Je les nourris'], a: 0,
    e: 'Près des mammifères marins et des colonies d’oiseaux, on ralentit et on s’écarte ; les aires marines protégées ont leurs propres règles.', ref: R + '#environnement',
  },
];
