const R = 'cours/10-vhf.html';

export default [
  {
    id: 'v01', q: 'Comment épeler « Alizé » à la VHF ?', src: 'annale 2024',
    c: ['Alfa – Lima – India – Zulu – Echo', 'Allo – Lima – Indien – Zéphyr – Echo', 'Alpha – Luke – India – Zodiac – Echo', 'Allo – Luke – Indien – Zoulou – Echo'], a: 0,
    e: 'Alphabet phonétique international : Alfa, Lima, India, Zulu, Echo.', ref: R + '#procedure',
  },
  {
    id: 'v02', q: 'Classez les messages dans l’ordre de priorité, du moins grave au plus grave :', src: 'annale 2024',
    c: ['Sécurité / Pan Pan / Mayday', 'Pan Pan / Sécurité / Mayday', 'Mayday / Sécurité / Pan Pan'], a: 0,
    e: 'MAYDAY (détresse) passe avant PAN PAN (urgence), qui passe avant SÉCURITÉ (information).', ref: R + '#alerte',
  },
  {
    id: 'v03', q: 'Quels sont les canaux réservés aux communications entre navires ?', src: 'annale 2024',
    c: ['6, 8, 72, 77', '6, 10, 77, 78', '6, 16, 72, 78', '8, 9, 77, 78'], a: 0,
    e: '6, 8, 72 et 77 : navire à navire. Le 16 est l’appel et la détresse, le 9 les ports de plaisance.', ref: R + '#canaux',
  },
  {
    id: 'v04', q: 'Je souhaite contacter la capitainerie du port pour annoncer mon arrivée :', src: 'annale 2024',
    c: ['Je passe sur le canal 9', 'Je passe sur le canal 16', 'Je passe sur le canal 8', 'Je passe sur le canal 6'], a: 0,
    e: 'Les ports de plaisance veillent le canal 9.', ref: R + '#canaux',
  },
  {
    id: 'v05', q: 'En navigation, je mets la VHF en veille sur le canal :', src: 'annale 2023',
    c: ['16', '9', '72', '70'], a: 0,
    e: 'Le 16 est le canal de veille, d’appel et de détresse.', ref: R + '#canaux',
  },
  {
    id: 'v06', q: 'Le canal 70 est réservé :',
    c: ['À l’ASN (appel sélectif numérique), on n’y parle jamais', 'Aux capitaineries', 'À la météo', 'Aux appels vocaux des CROSS'], a: 0,
    e: 'Le 70 transporte uniquement les messages numériques ASN.', ref: R + '#canaux',
  },
  {
    id: 'v07', q: 'À quoi sert le canal 16 ?', src: 'annale 2018',
    c: ['Aux appels vocaux de détresse, d’urgence, de sécurité et aux appels, notamment des CROSS', 'Aux appels par ASN', 'Aux communications avec les capitaineries', 'Aux communications entre les CROSS'], a: 0,
    e: 'Canal 16 : veille, appel, détresse, urgence et sécurité, à la voix.', ref: R + '#canaux',
  },
  {
    id: 'v08', q: 'Après une collision, une voie d’eau s’est déclarée et ne peut pas être maîtrisée. Le message est :', src: 'annale 2023',
    c: ['MAYDAY… ici…', 'PAN PAN… ici…', 'SÉCURITÉ… ici…'], a: 0,
    e: 'Danger grave et imminent, besoin d’aide immédiate : détresse, MAYDAY.', ref: R + '#alerte',
  },
  {
    id: 'v09', q: 'Un équipier s’est blessé à la main ; le bateau n’est pas en danger, mais vous souhaitez un avis médical et un débarquement. Le message est :',
    c: ['PAN PAN', 'MAYDAY', 'SÉCURITÉ'], a: 0,
    e: 'Une urgence concernant une personne, sans danger immédiat pour le bateau : PAN PAN.', ref: R + '#alerte',
  },
  {
    id: 'v10', q: 'Vous apercevez un conteneur à la dérive. Vous émettez un message :',
    c: ['SÉCURITÉ', 'PAN PAN', 'MAYDAY'], a: 0,
    e: 'Un danger pour la navigation des autres : message de sécurité, annoncé sur le 16 et diffusé sur un canal de travail.', ref: R + '#alerte',
  },
  {
    id: 'v11', q: 'Un équipier tombe à l’eau. À la VHF, on émet :',
    c: ['Un MAYDAY', 'Un PAN PAN', 'Un message SÉCURITÉ', 'Rien, on le récupère d’abord'], a: 0,
    e: 'L’homme à la mer est une détresse : MAYDAY (et alerte ASN si possible), même si l’on pense pouvoir le récupérer seul. On annulera ensuite.', ref: R + '#alerte',
  },
  {
    id: 'v12', q: 'Vous entendez un MAYDAY sur le canal 16 :',
    c: ['Je cesse toute émission, j’écoute et je note le message', 'Je réponds immédiatement pour rassurer', 'Je change de canal pour ne pas encombrer', 'J’appelle un ami pour le prévenir'], a: 0,
    e: 'On laisse répondre le CROSS. Si personne ne répond dans les 5 minutes et qu’on peut aider, on accuse réception et on se déroute.', ref: R + '#alerte',
  },
  {
    id: 'v13', q: 'La portée entre deux VHF portatives tenues à hauteur d’homme est de l’ordre de :',
    c: ['Quelques milles (environ 5 M)', '50 milles', 'Plusieurs centaines de milles', '500 mètres'], a: 0,
    e: 'Portée ≈ 2,2 (√h1 + √h2) milles : environ 5 M avec deux antennes à 1,5 m.', ref: R + '#principe',
  },
  {
    id: 'v14', q: 'Comment appelle-t-on le CROSS un soir de 14 juillet ?', src: 'annale 2023',
    c: ['Sur le canal 16 de la VHF', 'Par fusée de détresse', 'Par le canal 9'], a: 0,
    e: 'Les soirs de feux d’artifice, une fusée passe inaperçue : la VHF (16) ou le 196 restent les moyens d’alerte.', ref: R + '#canaux',
  },
  {
    id: 'v15', q: 'À la VHF, « à vous » signifie :',
    c: ['J’ai fini de parler, j’attends votre réponse', 'La communication est terminée', 'Répétez votre message', 'Je passe sur un autre canal'], a: 0,
    e: '« À vous » : j’attends une réponse. « Terminé » : fin de la communication.', ref: R + '#procedure',
  },
  {
    id: 'v16', q: 'Le MMSI est :',
    c: ['Le numéro d’identification à neuf chiffres d’une station radio, utilisé par l’ASN', 'Le nom du bateau à la radio', 'Un canal VHF', 'Le permis radio'], a: 0,
    e: 'Le MMSI est attribué par l’ANFR ; il permet l’appel sélectif et identifie l’émetteur d’une alerte ASN.', ref: R + '#asn',
  },
  {
    id: 'v17', q: 'Dans les eaux territoriales françaises, une VHF portative sans ASN, de 6 W au plus :',
    c: ['Peut être utilisée sans CRR ni permis', 'Exige le certificat restreint de radiotéléphoniste', 'Est interdite', 'Exige une licence de radioamateur'], a: 0,
    e: 'Depuis 2011, ce cas est dispensé de CRR. Une VHF fixe ou ASN exige une licence et le CRR (ou, dans les eaux territoriales, le permis plaisance).', ref: R + '#reglementation',
  },
  {
    id: 'v18', q: 'Les CROSS diffusent les bulletins météo par VHF :',
    c: ['Sur un canal de travail annoncé sur le canal 16', 'Sur le canal 70', 'Sur le canal 9', 'Uniquement sur demande'], a: 0,
    e: 'L’annonce est faite sur le 16, puis le bulletin est lu sur un canal de diffusion (79, 80…) indiqué dans l’annonce.', ref: R + '#canaux',
  },
  {
    id: 'v19', q: 'Dans un message de détresse, après « MAYDAY ×3, ici [nom] ×3, MAYDAY [nom] », on donne d’abord :',
    c: ['La position', 'Le nombre de personnes à bord', 'La couleur du bateau', 'Le nom du chef de bord'], a: 0,
    e: 'La position d’abord (c’est le plus important si la communication est coupée), puis la nature de la détresse, l’aide demandée, le nombre de personnes, les autres informations.', ref: R + '#alerte',
  },
];
