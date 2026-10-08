const R = 'cours/08-meteo.html';
const M = 'cours/04-maree.html';

export default [
  {
    id: 'm01', q: 'Il est annoncé un vent de force 4 établi. À quelle vitesse cela correspond-il ?', src: 'annale 2023',
    c: ['11 à 16 nœuds', '17 à 21 nœuds', '7 à 10 nœuds', '22 à 27 nœuds'], a: 0,
    e: 'Force 3 : 7–10 nd ; force 4 : 11–16 ; force 5 : 17–21 ; force 6 : 22–27.', ref: R + '#beaufort',
  },
  {
    id: 'm02', q: 'Quelle pression atmosphérique indique une dépression ?', src: 'annale 2024',
    c: ['993 hPa', '1 013 hPa', '1 023 hPa'], a: 0,
    e: '1 013 hPa est la pression moyenne ; une dépression est nettement en dessous, un anticyclone au-dessus.', ref: R + '#pression',
  },
  {
    id: 'm03', q: 'Vous constatez que la pression baisse rapidement :', src: 'annale 2023',
    c: ['Le temps va se dégrader, du vent fort est probable', 'C’est bon signe, il va faire beau', 'Cela n’a pas d’importance'], a: 0,
    e: 'C’est la tendance qui compte : une baisse rapide annonce une perturbation et du vent fort.', ref: R + '#barometre',
  },
  {
    id: 'm04', q: 'Dans l’hémisphère Nord, le vent tourne autour d’une dépression :',
    c: ['Dans le sens inverse des aiguilles d’une montre', 'Dans le sens des aiguilles d’une montre', 'Cela dépend de la saison'], a: 0,
    e: 'La force de Coriolis dévie le mouvement vers la droite dans l’hémisphère Nord : rotation antihoraire autour des dépressions.', ref: R + '#pression',
  },
  {
    id: 'm05', q: 'Dans l’hémisphère Sud, les vents tournent autour d’une dépression :', src: 'annale 2021',
    c: ['Dans le sens horaire', 'Dans le sens antihoraire', 'Cela dépend de la zone géographique'], a: 0,
    e: 'Coriolis dévie vers la gauche dans l’hémisphère Sud : tout est inversé.', ref: R + '#pression',
  },
  {
    id: 'm06', q: 'Une brise thermique nocturne est :', src: 'annale 2021',
    c: ['Un vent de terre', 'Un vent de mer', 'Une chute de la pression', 'Une augmentation de la pression'], a: 0,
    e: 'La nuit, la terre se refroidit plus vite que la mer : la brise souffle de la terre vers la mer.', ref: R + '#brises',
  },
  {
    id: 'm07', q: 'Par beau temps, en milieu de journée, une ligne de cumulus au-dessus de la côte :', src: 'annale 2021',
    c: ['Est le signe d’une brise de mer', 'Annonce l’arrivée d’un front chaud', 'Indique une baisse de pression à venir', 'Annonce un front froid'], a: 0,
    e: 'L’air chauffé au-dessus de la terre s’élève et forme des cumulus le long de la côte : la brise de mer s’établit.', ref: R + '#brises',
  },
  {
    id: 'm08', q: 'Un bulletin météorologique spécial (BMS) côte est émis quand le vent prévu atteint au moins :',
    c: ['Force 7', 'Force 5', 'Force 6', 'Force 9'], a: 0,
    e: 'BMS côte : force 7 et plus ; BMS large : force 8 et plus.', ref: R + '#bulletins',
  },
  {
    id: 'm09', q: 'Des cirrus qui envahissent le ciel, puis un voile avec un halo autour du soleil, annoncent :',
    c: ['L’arrivée d’un front chaud dans les 12 à 24 heures', 'Un beau temps durable', 'Une brise thermique', 'Un orage dans l’heure'], a: 0,
    e: 'Ce sont les nuages élevés qui précèdent un front chaud. Le baromètre commence à baisser.', ref: R + '#nuages',
  },
  {
    id: 'm10', q: 'Au passage d’un front froid, en Bretagne :',
    c: ['Le vent saute au Nord-Ouest avec des rafales et le baromètre remonte', 'Le vent mollit et le baromètre baisse', 'La pluie devient fine et continue', 'Rien de notable'], a: 0,
    e: 'Front froid : cumulonimbus, grains, saute de vent, puis traîne avec averses et éclaircies.', ref: R + '#perturbations',
  },
  {
    id: 'm11', q: 'Dans l’hémisphère Nord, dos au vent, la dépression est :',
    c: ['À gauche', 'À droite', 'Devant', 'Derrière'], a: 0,
    e: 'Loi de Buys-Ballot.', ref: R + '#pression',
  },
  {
    id: 'm12', q: 'Un courant de marée qui porte contre le vent a pour effet :', src: 'annale 2022',
    c: ['De lever une mer plus creuse et plus courte', 'D’augmenter la vitesse du vent', 'D’augmenter la vitesse du courant', 'De calmer la mer'], a: 0,
    e: 'Vent contre courant, les vagues se raccourcissent et se creusent : la mer devient dure, surtout dans les passes.', ref: R + '#beaufort',
  },
  {
    id: 'm13', q: 'Les marées de vives eaux se produisent :',
    c: ['Vers la pleine lune et la nouvelle lune', 'Aux premier et dernier quartiers', 'Uniquement aux équinoxes', 'Une fois par mois'], a: 0,
    e: 'Lune et Soleil alignés : leurs effets s’additionnent. Les mortes eaux ont lieu aux quartiers.', ref: M + '#origine',
  },
  {
    id: 'm14', q: 'La plus grande hauteur d’eau possible se trouve à :', src: 'annale 2022',
    c: ['La marée haute de coefficient 120', 'La marée basse de coefficient 120', 'La marée haute de coefficient 20', 'La marée basse de coefficient 20'], a: 0,
    e: 'Un fort coefficient donne un grand marnage : PM plus haute et BM plus basse.', ref: M + '#coefficient',
  },
  {
    id: 'm15', q: 'Le coefficient de marée varie entre :',
    c: ['20 et 120', '0 et 100', '45 et 95', '1 et 12'], a: 0,
    e: '45 correspond aux mortes eaux moyennes, 95 aux vives eaux moyennes, 120 aux plus grandes marées.', ref: M + '#coefficient',
  },
  {
    id: 'm16', q: 'On parle de vives eaux pour un coefficient :',
    c: ['Supérieur à 70', 'Inférieur à 70', 'Supérieur à 100 seulement', 'Égal à 45'], a: 0,
    e: 'Au-dessus de 70 : vives eaux ; en dessous : mortes eaux.', ref: M + '#coefficient',
  },
  {
    id: 'm17', q: 'L’annuaire du SHOM est en heure UTC+1. En été, une PM annoncée à 14 h 10 a lieu en heure légale à :',
    c: ['15 h 10', '13 h 10', '16 h 10', '14 h 10'], a: 0,
    e: 'En été, l’heure légale est UTC+2 : on ajoute une heure.', ref: M + '#annuaire',
  },
  {
    id: 'm18', q: 'Selon la règle des douzièmes, pendant la troisième heure-marée, la mer varie de :',
    c: ['3/12 du marnage', '2/12 du marnage', '1/12 du marnage', '6/12 du marnage'], a: 0,
    e: '1, 2, 3, 3, 2, 1 douzièmes : la mer varie le plus vite pendant les 3e et 4e heures-marée.', ref: M + '#douziemes',
  },
  {
    id: 'm19', q: 'PM 4,80 m, BM 1,20 m. Un douzième vaut :',
    c: ['0,30 m', '0,40 m', '0,36 m', '0,60 m'], a: 0,
    e: 'Marnage = 4,80 − 1,20 = 3,60 m ; un douzième = 3,60 / 12 = 0,30 m.', ref: M + '#douziemes',
  },
  {
    id: 'm20', q: 'Sonde 2,4 m (non soulignée), hauteur de marée 1,2 m. La hauteur d’eau est de :',
    c: ['3,6 m', '1,2 m', '2,4 m', '1,4 m'], a: 0,
    e: 'Hauteur d’eau = sonde + hauteur de marée = 2,4 + 1,2 = 3,6 m.', ref: M + '#hauteur-eau',
  },
  {
    id: 'm21', q: 'Je m’apprête à mouiller sur une ligne tout chaîne :', src: 'annale 2023',
    c: ['Je prépare une longueur de chaîne d’environ trois fois la hauteur d’eau à la haute mer', 'Je prépare trois fois la hauteur d’eau à la basse mer', 'J’affale les voiles et je remonte le moteur'], a: 0,
    e: 'La touée se calcule sur la hauteur d’eau maximale, à la PM : environ 3 fois en chaîne, 5 fois en cordage.', ref: M + '#mouillage',
  },
  {
    id: 'm22', q: 'Avant de mouiller pour la nuit, on vérifie aussi :',
    c: ['Qu’il restera assez d’eau à basse mer sur tout le cercle d’évitage', 'Que la chaîne est plus courte que la profondeur', 'Que le moteur est éteint pour la nuit', 'Que le bateau est au milieu du chenal'], a: 0,
    e: 'À basse mer, il faut encore TE + pied de pilote sous la quille, partout où le bateau peut tourner autour de son ancre.', ref: M + '#mouillage',
  },
  {
    id: 'm23', q: 'Par basses pressions (980 hPa), le niveau de la mer est plus haut que prévu d’environ :',
    c: ['30 cm', '3 cm', '3 m', 'Rien, la pression n’a pas d’effet'], a: 0,
    e: 'Environ 1 cm par hPa en dessous de 1 013 hPa : 33 cm pour 980 hPa.', ref: M + '#douziemes',
  },
  {
    id: 'm24', q: 'Deux pleines mers successives sont séparées d’environ :',
    c: ['12 h 25', '12 h', '6 h', '24 h'], a: 0,
    e: 'Le jour lunaire dure 24 h 50 : deux PM par jour lunaire, donc environ 12 h 25 entre deux PM, et des marées 50 min plus tard chaque jour.', ref: M + '#observer',
  },
  {
    id: 'm25', q: 'La marée est due principalement :',
    c: ['À la différence d’attraction de la Lune (et du Soleil) entre les points de la Terre', 'Au vent dominant', 'À la rotation de la Terre seule', 'Aux variations de pression'], a: 0,
    e: 'La force de marée est la différence entre l’attraction en un point de la surface et au centre de la Terre ; elle varie en 1/d³, d’où la prédominance de la Lune.', ref: M + '#origine',
  },
  {
    id: 'm26', q: 'Pour évaluer l’état de la mer avant de sortir d’un port abrité :',
    c: ['On va regarder face au vent depuis un point dégagé', 'On regarde la mer dans le port', 'On se fie uniquement à l’application', 'On attend d’être sorti'], a: 0,
    e: 'Depuis un endroit abrité ou sous le vent, la mer paraît toujours plus belle qu’elle n’est.', ref: R + '#beaufort',
  },
];
