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
];
