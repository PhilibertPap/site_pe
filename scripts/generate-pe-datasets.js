const fs = require('node:fs');
const path = require('node:path');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function shuffle(list, rng) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function sampleUnique(list, count, rng, exclude = new Set()) {
    const pool = list.filter(item => !exclude.has(item));
    return shuffle(pool, rng).slice(0, Math.min(count, pool.length));
}

function createSeededRng(seed) {
    let value = seed >>> 0;
    return function seededRandom() {
        value = (1664525 * value + 1013904223) % 4294967296;
        return value / 4294967296;
    };
}

function parseArgs(argv) {
    const args = {};
    argv.forEach(arg => {
        if (!arg.startsWith('--')) return;
        const [key, raw] = arg.slice(2).split('=');
        args[key] = raw == null ? true : raw;
    });
    return args;
}

function toInt(value, fallback) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
}

const BANK = [
    {
        moduleId: 1,
        moduleName: 'Balisage et pictogrammes',
        categoryId: 'bank_balisage',
        categoryName: 'Balisage (bank)',
        courseIntro: 'Fondamentaux de balisage IALA region A pour l approche, la sortie de port et les marques speciales.',
        objectifs: [
            'Identifier rapidement les marques laterales et cardinales',
            'Connaitre le sens de passage en region A',
            'Distinguer marques de danger, eaux saines et marques speciales'
        ],
        sections: [
            { title: 'Laterales region A', bullets: ['En entrant au port: rouge a babord, vert a tribord', 'Marque babord: rouge, forme plutot cylindrique', 'Marque tribord: verte, forme plutot conique'] },
            { title: 'Cardinales', bullets: ['Cardinale Nord: passer au Nord', 'Cardinale Est: passer a l Est', 'Cardinale Sud: passer au Sud', 'Cardinale Ouest: passer a l Ouest'] },
            { title: 'Autres marques', bullets: ['Danger isole: noir/rouge avec deux boules noires', 'Eaux saines: bandes verticales rouge/blanc, sphere rouge', 'Marque speciale: jaune, topmark en X'] }
        ],
        facts: [
            'En region A, en entrant au port, on laisse le rouge a babord.',
            'En region A, en entrant au port, on laisse le vert a tribord.',
            'La marque laterale babord est rouge.',
            'La marque laterale tribord est verte.',
            'La cardinale nord indique de passer au nord de la marque.',
            'La cardinale est indique de passer a l est de la marque.',
            'La cardinale sud indique de passer au sud de la marque.',
            'La cardinale ouest indique de passer a l ouest de la marque.',
            'Une marque de danger isole est noire et rouge avec deux boules noires.',
            'Une marque d eaux saines est rouge et blanche avec une sphere rouge.',
            'Une marque speciale est jaune avec un topmark en X.',
            'En France, la vitesse est limitee dans la bande des 300 m.'
        ],
        distractors: [
            'En region A, en entrant au port, on laisse le rouge a tribord.',
            'Une marque speciale est rouge et verte.',
            'La cardinale nord impose de passer au sud.',
            'Une marque d eaux saines est noire et jaune.'
        ],
        references: [
            { title: 'IALA Maritime Buoyage System', url: 'https://www.iala-aism.org/technical/maritime-buoyage/' }
        ]
    },
    {
        moduleId: 2,
        moduleName: 'Signaux sonores et lumineux',
        categoryId: 'bank_signaux',
        categoryName: 'Signaux sonores et lumineux (bank)',
        courseIntro: 'Signaux sonores de manœuvre et feux reglementaires utiles au QCM PE.',
        objectifs: [
            'Memoriser les signaux sonores essentiels RIPAM',
            'Reconnaitre les secteurs des feux de navigation',
            'Appliquer les signaux en visibilite reduite'
        ],
        sections: [
            { title: 'Signaux sonores', bullets: ['1 bref: je viens sur tribord', '2 brefs: je viens sur babord', '3 brefs: je bats en arriere', 'Un bref dure environ 1 seconde'] },
            { title: 'Visibilite reduite', bullets: ['Navire a machine faisant route: 1 son prolonge toutes les 2 min max', 'Navire a machine en route sans erre: 2 sons prolonges'] },
            { title: 'Feux', bullets: ['Feu de babord: rouge', 'Feu de tribord: vert', 'Feu de tete de mat: 225 degres', 'Feu de poupe: 135 degres'] }
        ],
        facts: [
            'Un son bref dure environ une seconde.',
            'Un son prolonge dure de quatre a six secondes.',
            'Un son bref signifie intention de venir sur tribord.',
            'Deux sons brefs signifient intention de venir sur babord.',
            'Trois sons brefs signifient propulsion en arriere.',
            'En visibilite reduite, un navire a machine faisant route emet un son prolonge toutes les deux minutes au maximum.',
            'En visibilite reduite, un navire a machine en route sans erre emet deux sons prolonges.',
            'Le feu de cote babord est rouge.',
            'Le feu de cote tribord est vert.',
            'Le feu de tete de mat couvre 225 degres.',
            'Le feu de poupe couvre 135 degres.',
            'Un feu omnidirectionnel est visible sur 360 degres.'
        ],
        distractors: [
            'Un son bref dure dix secondes.',
            'Deux sons brefs signifient propulsion en arriere.',
            'Le feu de cote babord est vert.',
            'Le feu de poupe couvre 225 degres.'
        ],
        references: [
            { title: 'IMO COLREG', url: 'https://www.imo.org/en/About/Conventions/Pages/COLREG.aspx' }
        ]
    },
    {
        moduleId: 3,
        moduleName: 'Regles de barre et de route',
        categoryId: 'bank_regles_route',
        categoryName: 'Regles de barre et de route (bank)',
        courseIntro: 'Priorites et prevention des abordages conformes aux regles RIPAM.',
        objectifs: [
            'Appliquer les priorites en routes de collision',
            'Identifier le navire qui doit manœuvrer',
            'Connaitre les regles fondamentales de prevention'
        ],
        sections: [
            { title: 'Principes generaux', bullets: ['Veille visuelle et auditive permanente', 'Vitesse de securite adaptee', 'Action franche et precoce pour eviter la collision'] },
            { title: 'Situations typiques', bullets: ['Route opposee: les deux navires viennent sur tribord', 'Croisement: navire ayant l autre sur tribord doit s ecarter', 'Depassement: navire depassant garde ses distances'] }
        ],
        facts: [
            'La veille visuelle et auditive doit etre assuree en permanence.',
            'La vitesse doit rester une vitesse de securite.',
            'Un gisement pratiquement constant peut indiquer un risque de collision.',
            'En route opposee, deux navires a machine doivent venir sur tribord.',
            'En croisement, le navire qui voit l autre sur tribord doit s ecarter.',
            'Le navire depassant doit se maintenir a l ecart du navire depasse.',
            'Le navire privilegie garde en principe son cap et sa vitesse.',
            'Une action d evitement doit etre franche et prise a temps.',
            'Dans un chenal etroit, on se tient du cote tribord du chenal.',
            'Une action tardive augmente le risque d abordage.',
            'Le navire non privilegie doit manœuvrer franchement.',
            'Un changement de cap net est prefere a de petits ecarts ambiguës.'
        ],
        distractors: [
            'En route opposee, on vient sur babord.',
            'Le navire depasse est toujours prioritaire pour depasser.',
            'Le navire non privilegie doit maintenir cap et vitesse.',
            'Dans un chenal etroit, on se tient librement au centre.'
        ],
        references: [
            { title: 'IMO COLREG', url: 'https://www.imo.org/en/About/Conventions/Pages/COLREG.aspx' }
        ]
    },
    {
        moduleId: 4,
        moduleName: 'Feux et marques des navires',
        categoryId: 'bank_feux_marques',
        categoryName: 'Feux et marques des navires (bank)',
        courseIntro: 'Identifier les navires particuliers de nuit (feux) et de jour (marques).',
        objectifs: [
            'Reconnaître les feux des navires speciaux',
            'Connaitre les marques de jour associees',
            'Adapter la conduite selon le statut du navire observe'
        ],
        sections: [
            { title: 'Cas particuliers', bullets: ['NUC: deux feux rouges superposes', 'RAM: rouge-blanc-rouge', 'Pilotage: blanc sur rouge'] },
            { title: 'Marques de jour', bullets: ['NUC: deux boules noires', 'RAM: boule losange boule', 'Mouillage: une boule noire'] }
        ],
        facts: [
            'Un navire non maitre de sa manœuvre montre deux feux rouges superposes.',
            'Un navire a capacite de manœuvre restreinte montre rouge-blanc-rouge.',
            'Un navire pilote montre blanc sur rouge.',
            'Un navire en peche autre que chalut montre rouge sur blanc.',
            'Un chalutier montre vert sur blanc.',
            'Un navire au mouillage montre au moins un feu blanc omnidirectionnel.',
            'Un navire echoue montre les marques du mouillage et deux feux rouges superposes.',
            'La marque de jour NUC est deux boules noires.',
            'La marque de jour RAM est boule-losange-boule.',
            'La marque de jour d un navire au mouillage est une boule noire.',
            'Les feux de statut completent les feux de route quand necessaire.',
            'Un feu rouge sur blanc n est pas un navire pilote.'
        ],
        distractors: [
            'Un navire pilote montre rouge sur blanc.',
            'Un chalutier montre rouge sur blanc.',
            'NUC: boule-losange-boule.',
            'RAM: deux boules noires.'
        ],
        references: [
            { title: 'IMO COLREG', url: 'https://www.imo.org/en/About/Conventions/Pages/COLREG.aspx' }
        ]
    },
    {
        moduleId: 5,
        moduleName: 'Carte marine et regle Cras',
        categoryId: 'bank_carte_marine',
        categoryName: 'Carte marine et Cras (bank)',
        courseIntro: 'Lecture de carte SHOM, echelles, profondeurs et mesures de route.',
        objectifs: [
            'Lire les informations essentielles d une carte marine',
            'Mesurer cap et distance correctement',
            'Identifier les limitations liees aux profondeurs'
        ],
        sections: [
            { title: 'Mesures', bullets: ['1 minute de latitude vaut 1 mille nautique', 'La distance se lit sur l echelle des latitudes', 'La regle Cras sert a mesurer un relèvement/cap'] },
            { title: 'Profondeurs et symboles', bullets: ['Les sondes sont referencees a un zero hydrographique', 'Les isobathes relient des profondeurs egales', 'Les symboles SHOM signalent dangers et ouvrages'] }
        ],
        facts: [
            'Une minute de latitude correspond a un mille nautique.',
            'La distance sur carte marine se mesure sur l echelle des latitudes.',
            'La regle Cras sert a mesurer les caps et les relèvements.',
            'Les sondes de carte sont referencees au zero hydrographique de la carte.',
            'Les isobathes relient des points de meme profondeur.',
            'La variation magnetique locale est indiquee sur la carte.',
            'Le nord geographique est donne par les meridiens.',
            'Les informations de carte doivent etre recoupees avec les avis de navigation.',
            'Un danger cartographie peut etre balise ou non selon la zone.',
            'La precision de navigation depend de l echelle de carte.',
            'Un mille nautique vaut 1852 metres.',
            'Les details de port exigent des cartes a grande echelle.'
        ],
        distractors: [
            'Une minute de longitude vaut toujours un mille nautique.',
            'La distance se mesure sur l echelle des longitudes.',
            'Le mille nautique vaut 1000 metres.',
            'Les isobathes relient des points de meme cap.'
        ],
        references: [
            { title: 'SHOM - prediction et donnees marines', url: 'https://www.shom.fr/fr/marees/marees-la-carte' }
        ]
    },
    {
        moduleId: 6,
        moduleName: 'Meteo marine',
        categoryId: 'bank_meteo',
        categoryName: 'Meteo marine (bank)',
        courseIntro: 'Lecture meteo utile a la securite en navigation cotiere.',
        objectifs: [
            'Interpréter les tendances de pression',
            'Relier types de nuages et evolution probable',
            'Utiliser l echelle de Beaufort'
        ],
        sections: [
            { title: 'Pression et fronts', bullets: ['Pression en baisse: degration probable', 'Front froid: rafales et averses', 'Front chaud: pluie plus continue'] },
            { title: 'Echelle de Beaufort', bullets: ['F4: 11-16 nds', 'F5: 17-21 nds', 'Les rafales peuvent depasser le vent moyen'] }
        ],
        facts: [
            'Une pression en baisse est un signal de possible degration.',
            'Une pression en hausse signale souvent une amelioration relative.',
            'Un front froid est souvent associe a des averses et a une bascule du vent.',
            'Un front chaud apporte souvent une couverture nuageuse et des pluies progressives.',
            'Un cumulonimbus est un nuage d orage.',
            'Le brouillard peut se former avec air humide sur eau plus froide.',
            'Force 4 Beaufort correspond environ a 11-16 nœuds.',
            'Force 5 Beaufort correspond environ a 17-21 nœuds.',
            'La direction du vent est nommee par son origine.',
            'Le vent reel et les rafales doivent etre surveilles avant appareillage.',
            'Un bulletin meteo marin est un element de securite prioritaire.',
            'La meteo locale peut differer du bulletin general.'
        ],
        distractors: [
            'Une pression qui monte annonce toujours un grain violent.',
            'Le front chaud provoque toujours des orages brutaux.',
            'Force 4 Beaufort correspond a 30-35 nœuds.',
            'La direction du vent est nommee par sa destination.'
        ],
        references: [
            { title: 'Meteo marine (France)', url: 'https://www.meteo-marine.com/' }
        ]
    },
    {
        moduleId: 7,
        moduleName: 'Caps, derive et courants',
        categoryId: 'bank_caps_courants',
        categoryName: 'Caps, derive et courants (bank)',
        courseIntro: 'Calculs de cap compas/vrai et construction de route surface/fond.',
        objectifs: [
            'Appliquer les conversions de cap',
            'Prendre en compte courant et derive',
            'Verifier la coherence des calculs de route'
        ],
        sections: [
            { title: 'Conversions', bullets: ['Convention courante: Est positif, Ouest negatif', 'Cv = Cc + declinaison + deviation'] },
            { title: 'Vecteurs', bullets: ['Route fond = route surface + vecteur courant', 'Set: direction du courant', 'Drift: vitesse du courant'] }
        ],
        facts: [
            'Une conversion complete peut s ecrire Cv = Cc + declinaison + deviation.',
            'Avec la convention E positif / W negatif, il faut respecter les signes.',
            'La route fond est la somme vectorielle de la route surface et du courant.',
            'Le set du courant est sa direction.',
            'La drift du courant est sa vitesse.',
            'Un nœud correspond a un mille nautique par heure.',
            'La derive de vent decale la route vers le sous-le-vent.',
            'Un calcul de navigation se verifie par coherence geometrique.',
            'Un cap compas non corrige peut mener a une route fausse.',
            'Le temps est indispensable pour convertir vitesse en distance.',
            'La route surface est la route dans l eau, hors effet du courant.',
            'Le triangle des vitesses est un outil utile pour route fond.'
        ],
        distractors: [
            'La route fond ignore le courant.',
            'Le set est la vitesse du courant.',
            'Un nœud correspond a un kilometre par heure.',
            'La declinaison n influence jamais le cap vrai.'
        ],
        references: [
            { title: 'Cours SUF PE - modules navigation', url: 'c:/Users/phili/Documents/scout/PE/Cours/Cours QCM.pdf' }
        ]
    },
    {
        moduleId: 8,
        moduleName: 'Marees et hauteur d eau',
        categoryId: 'bank_marees',
        categoryName: 'Marees et hauteur d eau (bank)',
        courseIntro: 'Calcul pratique des hauteurs d eau, marnage, coefficients et securite sous quille.',
        objectifs: [
            'Calculer une hauteur d eau avec methode adaptee',
            'Interpréter PM/BM et marnage',
            'Utiliser les donnees de maree pour la securite'
        ],
        sections: [
            { title: 'Definitions', bullets: ['PM: pleine mer', 'BM: basse mer', 'Marnage = PM - BM', 'Flot: BM vers PM, jusant: PM vers BM'] },
            { title: 'Calcul', bullets: ['Regle des douziemes: 1-2-3-3-2-1', '3e et 4e heures les plus actives', 'Verifier le pied de pilote avant passage'] },
            { title: 'Documents', bullets: ['Consulter annuaire et previsions de maree SHOM', 'Recouper heure locale et references de carte'] }
        ],
        facts: [
            'PM signifie pleine mer.',
            'BM signifie basse mer.',
            'Le marnage est la difference PM moins BM.',
            'Le flot est la phase montante entre BM et PM.',
            'Le jusant est la phase descendante entre PM et BM.',
            'La regle des douziemes suit 1/12, 2/12, 3/12, 3/12, 2/12, 1/12.',
            'Les troisieme et quatrieme heures concentrent la plus grande variation.',
            'Le coefficient de maree reflète l amplitude relative de la maree.',
            'Les vives-eaux sont en general plus marquées que les mortes-eaux.',
            'Le calcul du pied de pilote vise a garantir la securite sous la quille.',
            'Une hauteur d eau exploitable depend de la sonde carte et de la maree.',
            'Les previsions SHOM sont une reference pour la planification.'
        ],
        distractors: [
            'Le marnage est la somme PM + BM.',
            'Le jusant est la phase montante.',
            'La regle des douziemes vaut 1-1-2-2-3-3.',
            'Le coefficient ne change jamais d un jour a l autre.'
        ],
        references: [
            { title: 'SHOM - Marees la carte', url: 'https://www.shom.fr/fr/marees/marees-la-carte' },
            { title: 'Refmar SHOM - Previsions de maree', url: 'https://refmar.shom.fr/fr/previsions-maree' },
            { title: 'Cours SUF PE - module 14', url: 'c:/Users/phili/Documents/scout/PE/Cours/Cours calcul de marée.pdf' }
        ]
    },
    {
        moduleId: 9,
        moduleName: 'VHF et communication',
        categoryId: 'bank_vhf',
        categoryName: 'VHF et communication (bank)',
        courseIntro: 'Procedures radio de securite, urgence et detresse en navigation cotiere.',
        objectifs: [
            'Distinguer Mayday, Pan-Pan et Securite',
            'Utiliser correctement les canaux de detresse',
            'Structurer un message radio clair'
        ],
        sections: [
            { title: 'Canaux', bullets: ['Canal 16: detresse, urgence, appel', 'Canal 70: appel selectif numerique (DSC)'] },
            { title: 'Messages', bullets: ['MAYDAY: danger grave et imminent', 'PAN-PAN: urgence', 'SECURITE: message de securite'] }
        ],
        facts: [
            'Le canal VHF 16 est le canal international de detresse et d appel.',
            'Le canal 70 est reserve a l appel selectif numerique (DSC).',
            'MAYDAY est utilise en cas de danger grave et imminent.',
            'PAN-PAN correspond a une urgence sans detresse immediate.',
            'SECURITE sert a diffuser un message de securite nautique ou meteo.',
            'Un message de detresse doit inclure la position du navire.',
            'L identification du navire doit etre annoncee clairement.',
            'La discipline radio est essentielle sur les canaux de securite.',
            'Un faux MAYDAY est interdit et sanctionnable.',
            'Le message doit rester court, clair et standardise.',
            'L alphabet phonetique aide a epeler sans ambiguite.',
            'Apres un MAYDAY, on maintient l ecoute sur les instructions de coordination.'
        ],
        distractors: [
            'Le canal 16 est reserve aux conversations privees.',
            'PAN-PAN est plus grave que MAYDAY.',
            'Le canal 70 est un canal voix classique.',
            'Un message de detresse n a pas besoin de position.'
        ],
        references: [
            { title: 'IMO - GMDSS', url: 'https://www.imo.org/en/OurWork/Safety/Pages/GMDSS.aspx' }
        ]
    },
    {
        moduleId: 10,
        moduleName: 'Cadre scout et securite de bord',
        categoryId: 'bank_securite_scout',
        categoryName: 'Cadre scout et securite de bord (bank)',
        courseIntro: 'Regles operationnelles SUF de navigation et securite des equipages.',
        objectifs: [
            'Appliquer les limites SUF en navigation',
            'Respecter les exigences d encadrement',
            'Prioriser la securite equipage et materiel'
        ],
        sections: [
            { title: 'Regles SUF (slide)', bullets: ['Gilet de sauvetage en permanence', 'Age minimum PE: 16 ans', 'Navigation de jour uniquement'] },
            { title: 'Habitable', bullets: ['Sous surveillance d un chef de flottille', 'Moins de 6 milles d un abri', 'Force 4 rafale 5 max', 'Correspondant a terre'] },
            { title: 'Voile legere', bullets: ['Sous surveillance d un chef de quart', 'Moins de 2 milles d un abri', 'Force 3 rafale 4 max', 'Correspondant a terre'] }
        ],
        facts: [
            'Dans le cadre SUF, le port du gilet est permanent en navigation.',
            'L age minimum mentionne pour le PE est 16 ans.',
            'La navigation est prevue de jour.',
            'En habitable, la flottille est sous surveillance d un chef de flottille.',
            'En habitable, la limite est 6 milles d un abri.',
            'En habitable, la limite meteo indiquee est force 4 rafale 5.',
            'En voile legere, la limite est 2 milles d un abri.',
            'En voile legere, la limite meteo indiquee est force 3 rafale 4.',
            'Un correspondant a terre est requis.',
            'Un abri est un lieu de cote permettant mise en securite du bateau et de l equipage.',
            'La securite de l equipage prime sur l objectif pedagogique.',
            'La preparation comprend verification meteo, materiel et plan de route.'
        ],
        distractors: [
            'En habitable, la limite est 12 milles d un abri.',
            'Le gilet est optionnel par beau temps.',
            'La navigation de nuit est libre en routine.',
            'En voile legere, la limite est force 6.'
        ],
        references: [
            { title: 'Cours SUF PE - Reglementation navigation', url: 'c:/Users/phili/Documents/scout/PE/Cours/Cours QCM.pdf' }
        ]
    }
];

function createQuestion(module, fact, variantIndex, allFacts, rng) {
    const stems = [
        `Concernant ${module.moduleName}, quelle affirmation est correcte ?`,
        `Dans le cadre du PE, quelle proposition est juste pour ${module.moduleName} ?`,
        `Choisis l enonce exact (${module.moduleName}).`,
        `Question de revision ${module.moduleName}: quelle est la bonne reponse ?`
    ];
    const stem = stems[variantIndex % stems.length];

    const exclude = new Set([fact]);
    const wrongFromModule = sampleUnique(module.distractors, 2, rng, exclude);
    const wrongFromGlobal = sampleUnique(allFacts, 4, rng, new Set([...exclude, ...wrongFromModule]));
    const wrong = [...wrongFromModule, ...wrongFromGlobal].slice(0, 3);
    const choices = shuffle([
        { text: fact, correct: true },
        ...wrong.map(text => ({ text, correct: false }))
    ], rng);

    const answerIds = ['a', 'b', 'c', 'd'];
    const answers = choices.map((choice, idx) => ({
        id: answerIds[idx],
        text: choice.text,
        correct: choice.correct
    }));

    return {
        id: `${module.moduleId}_${variantIndex}`,
        text: stem,
        image: null,
        answers,
        difficulty: (variantIndex % 3) + 1
    };
}

function buildCourseHtml(module) {
    const sectionsHtml = module.sections.map(section => {
        const bullets = section.bullets.map(item => `<li>${item}</li>`).join('');
        return `<h5>${section.title}</h5><ul>${bullets}</ul>`;
    }).join('');

    const refs = module.references
        .map(ref => `<li><a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.title}</a></li>`)
        .join('');

    return `<p>${module.courseIntro}</p>${sectionsHtml}<h6>References</h6><ul>${refs}</ul>`;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const seed = toInt(args.seed, 20260212);
    const perFact = toInt(args.perFact, 8);
    const rng = createSeededRng(seed);

    const rootDir = path.join(__dirname, '..');
    const qcmBasePath = path.join(rootDir, 'src', 'data', 'qcm.json');
    const qcmOutPath = path.join(rootDir, 'src', 'data', 'qcm.pe.generated.json');
    const courseOutPath = path.join(rootDir, 'src', 'data', 'course.generated.json');
    const qcmBase = readJson(qcmBasePath);

    const allFacts = BANK.flatMap(module => module.facts);
    const generatedCategories = BANK.map(module => {
        const questions = [];
        let index = 1;
        module.facts.forEach(fact => {
            for (let i = 0; i < perFact; i += 1) {
                questions.push(createQuestion(module, fact, index, allFacts, rng));
                index += 1;
            }
        });
        return {
            id: module.categoryId,
            name: module.categoryName,
            description: `${module.moduleName} - banque generee depuis slides + references web`,
            module: module.moduleId,
            questions
        };
    });

    const qcmGenerated = {
        generatedAt: new Date().toISOString(),
        source: {
            slides: [
                'c:/Users/phili/Documents/scout/PE/Cours/Cours QCM.pdf',
                'c:/Users/phili/Documents/scout/PE/Cours/Cours calcul de marée.pdf'
            ],
            webReferences: [...new Set(BANK.flatMap(module => module.references.map(ref => ref.url)))],
            baseQcm: 'src/data/qcm.json'
        },
        generation: {
            algorithm: 'pe_bank_templates_v1',
            seed,
            perFact
        },
        categories: [...qcmBase.categories, ...generatedCategories]
    };

    const courseGenerated = {
        generatedAt: new Date().toISOString(),
        source: 'pe_knowledge_bank',
        modules: BANK.map(module => ({
            id: module.moduleId,
            description: module.courseIntro,
            objectifs: module.objectifs,
            content: buildCourseHtml(module),
            keyPoints: module.facts.slice(0, 10),
            qcmQuestionCount: module.facts.length * perFact
        }))
    };

    writeJson(qcmOutPath, qcmGenerated);
    writeJson(courseOutPath, courseGenerated);

    const totalGenerated = generatedCategories.reduce((sum, category) => sum + category.questions.length, 0);
    const totalFinal = qcmGenerated.categories.reduce((sum, category) => sum + (category.questions?.length || 0), 0);
    console.log(`Generated ${qcmOutPath}`);
    console.log(`- Categories ajoutees: ${generatedCategories.length}`);
    console.log(`- Questions ajoutees: ${totalGenerated}`);
    console.log(`- Questions totales: ${totalFinal}`);
    console.log(`Generated ${courseOutPath}`);
  }

main();
