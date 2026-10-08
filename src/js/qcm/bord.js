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
];
