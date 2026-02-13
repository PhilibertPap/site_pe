const fs = require('node:fs');
const path = require('node:path');

const SERIES_URLS = [1, 2, 3, 4, 5, 6].map(
    index => `https://www.loisirs-nautic.fr/test_permis_cotier_${index}.php`
);

const QUESTION_BLOCK_REGEX = /<div\s+name="Q(\d+)"[^>]*class="quest"[\s\S]*?<form[^>]*id="qcm\1"[\s\S]*?<label[^>]*>([\s\S]*?)<\/label>[\s\S]*?<div>([\s\S]*?)<\/div>[\s\S]*?<\/form>/g;
const ANSWER_OPTION_REGEX = /<label class="checkbox"[^>]*>[\s\S]*?<i><\/i>([\s\S]*?)<\/label>/g;
const HTML_IMAGE_URL_REGEX = /https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp)/ig;
const VISUAL_OR_CONTEXT_REQUIRED_PATTERNS = [
    /^que signifie ce panneau/i,
    /^cap au\s*\d+/i,
    /dans la situation ci-contre/i,
    /quel voilier/i,
    /^pouvez-vous rester à cet endroit/i,
    /^quelle sera la force du vent/i,
    /de nuit, vous apercevez/i,
    /de quel navire s[’']agit-il/i
];
const LOW_QUALITY_TEXT_PATTERNS = [
    /^que signifie\s*["']?de jour["']?\s*\?*$/i,
    /^que signifie\s*["']?de nuit["']?\s*\?*$/i,
    /^ce feu est\s*:?\s*$/i
];
const AMBIGUOUS_WITHOUT_CONTEXT_PATTERNS = [
    /^la vitesse est limit[ée]e [àa]\s*:?\s*$/i,
    /^quelle limite de vitesse connaissez-vous\s*\??$/i,
    /^dans les ports, la vitesse\s*:?\s*$/i,
    /^avez-vous le droit de p[eê]cher en mer\s*\??$/i
];
const MANUAL_CURATION = {
    dropKeys: new Set([
        // Doublon avec une question equivalente deja conservee dans la banque.
        'web_annales_module_10:ln_pc1_q2'
    ]),
    overridesByKey: {
        'balisage:4': {
            text: 'Reglementation cotiere: dans la bande des 300 m, quelle vitesse maximale est autorisee (sauf signalisation locale contraire) ?'
        },
        'web_annales_module_1:ln_pc2_q17': {
            text: "Balisage de plage: un chenal traversier d'acces a la plage est delimite par :"
        },
        'web_annales_module_1:ln_pc3_q11': {
            text: "Feux de balisage: quelle est la definition d'un feu a occultation ?"
        },
        'web_annales_module_1:ln_pc6_q5': {
            text: "Feux de balisage: quelle est la definition d'un feu a eclat ?"
        },
        'web_annales_module_2:ln_pc1_q13': {
            text: "RIPAM - feux de navigation: quel est l'angle du feu blanc de tete de mat d'un navire a moteur ?"
        },
        'web_annales_module_2:ln_pc2_q13': {
            text: "RIPAM - feux de navigation: quel est l'angle du feu de poupe d'un navire a moteur ?"
        },
        'web_annales_module_2:ln_pc3_q13': {
            text: "RIPAM - feux de navigation: quelle est la portee reglementaire des feux de cote d'un navire de plaisance de moins de 12 m ?"
        },
        'web_annales_module_2:ln_pc5_q5': {
            text: "RIPAM - feux de navigation: quel est le secteur angulaire d'un feu de cote ?"
        },
        'web_annales_module_3:ln_pc4_q23': {
            text: "Regles de barre: dans quelle condition etes-vous considere comme navire rattrapant ?"
        },
        'web_annales_module_3:ln_pc4_q29': {
            text: "Lecture de cap: vous faites route au 180 deg (plein Sud). Pour aller vers l'Est (090 deg), que faites-vous ?"
        },
        'web_annales_module_3:ln_pc5_q19': {
            text: "Risque d'abordage: un navire est releve successivement au 65 deg, 70 deg puis 67 deg. Quelle conclusion retenez-vous ?"
        },
        'web_annales_module_3:ln_pc6_q8': {
            text: 'Veille visuelle et auditive: a quel moment doit-elle etre assuree ?'
        },
        'web_annales_module_4:ln_pc6_q28': {
            text: "Carte marine: ou se lit une minute sur l'echelle des latitudes ?"
        },
        'web_annales_module_10:ln_pc1_q33': {
            text: 'Securite environnementale: lors du plein de carburant, quelle pratique est conforme ?'
        },
        'web_annales_module_10:ln_pc2_q21': {
            text: "Responsabilite a bord: le locataire d'un navire devient-il automatiquement chef de bord ?"
        },
        'web_annales_module_10:ln_pc3_q10': {
            text: "Vehicule nautique a moteur (2 personnes): quelle est la distance maximale d'eloignement par rapport a un abri ?"
        },
        'web_annales_module_10:ln_pc3_q17': {
            text: "Securite homme a la mer: dans quelle zone un dispositif de reperage et d'assistance est-il obligatoire ?"
        },
        'web_annales_module_10:ln_pc4_q20': {
            text: 'Organisation des secours: qui coordonne les secours en mer ?'
        },
        'web_annales_module_10:ln_pc4_q22': {
            text: 'Zone basique (2 milles): pour quel type de navire cette limite est-elle applicable ?'
        },
        'web_annales_module_10:ln_pc5_q25': {
            text: "Activite de traction: le bateau tracteur doit-il pouvoir embarquer toutes les personnes tractees en plus de son equipage ?"
        },
        'web_annales_module_10:ln_pc6_q32': {
            text: "Armement de securite cotier: quel equipement est obligatoire ?"
        }
    }
};

function decodeHtml(text) {
    let decoded = String(text || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&eacute;/g, 'e')
        .replace(/&egrave;/g, 'e')
        .replace(/&ecirc;/g, 'e')
        .replace(/&euml;/g, 'e')
        .replace(/&agrave;/g, 'a')
        .replace(/&acirc;/g, 'a')
        .replace(/&ccedil;/g, 'c')
        .replace(/&ocirc;/g, 'o')
        .replace(/&ouml;/g, 'o')
        .replace(/&ucirc;/g, 'u')
        .replace(/&uuml;/g, 'u')
        .replace(/&icirc;/g, 'i')
        .replace(/&iuml;/g, 'i')
        .replace(/&oelig;/g, 'oe')
        .replace(/&OElig;/g, 'OE')
        .replace(/&deg;/g, 'deg')
        .replace(/&sup2;/g, '2')
        .replace(/&#(\d+);/g, (_, code) => {
            const value = Number.parseInt(code, 10);
            return Number.isFinite(value) ? String.fromCodePoint(value) : '';
        })
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return decoded;
}

function normalize(text) {
    return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function toArray(value) {
    return Array.isArray(value) ? value : [];
}

function toAbsoluteLoisirsUrl(rawUrl) {
    const value = String(rawUrl || '').trim();
    if (!value) return null;
    if (!/\.(png|jpe?g|gif|webp)(\?|$)/i.test(value)) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return `https://www.loisirs-nautic.fr/${value.replace(/^\/+/, '')}`;
}

function pickBestImageUrl(candidates) {
    const urls = candidates
        .map(toAbsoluteLoisirsUrl)
        .filter(Boolean);
    if (!urls.length) return null;
    const nonDecorative = urls.find(url => !/\/(puce|logo|btn|icon|sprite)\b/i.test(url));
    return nonDecorative || urls[0];
}

function extractQuestionContext(block) {
    const alertTexts = [...String(block || '').matchAll(/<div[^>]*class="[^"]*alert[^"]*"[^>]*>([\s\S]*?)<\/div>/ig)]
        .map(match => decodeHtml(match[1]))
        .filter(Boolean);
    if (!alertTexts.length) return null;
    return alertTexts.join(' ');
}

function extractQuestionImage(block) {
    const html = String(block || '');
    const srcCandidates = [...html.matchAll(/<(?:img|source)[^>]+(?:src|data-src)="([^"]+)"/ig)].map(match => match[1]);
    const hrefCandidates = [...html.matchAll(/<a[^>]+href="([^"]+\.(?:png|jpe?g|gif|webp)[^"]*)"/ig)].map(match => match[1]);
    const inlineCandidates = [...html.matchAll(/url\((['"]?)([^'")]+\.(?:png|jpe?g|gif|webp)[^'")]*)\1\)/ig)].map(match => match[2]);
    const rawAbsoluteCandidates = [...html.matchAll(HTML_IMAGE_URL_REGEX)].map(match => match[0]);
    return pickBestImageUrl([
        ...srcCandidates,
        ...hrefCandidates,
        ...inlineCandidates,
        ...rawAbsoluteCandidates
    ]);
}

function needsVisualOrContext(questionText) {
    const text = String(questionText || '').trim();
    return VISUAL_OR_CONTEXT_REQUIRED_PATTERNS.some(pattern => pattern.test(text));
}

function parseNumberArray(html, varName) {
    const match = html.match(new RegExp(`${varName}\\s*=\\s*\\[([^\\]]*)\\]`));
    if (!match) return [];
    return match[1]
        .split(',')
        .map(item => Number.parseInt(item.trim(), 10))
        .map(value => (Number.isFinite(value) ? value : 0));
}

function mapThemeToModule(theme) {
    const mapping = {
        1: 1,  // balisage
        2: 1,  // cardinales
        3: 4,  // carte marine
        4: 2,  // feux navires
        5: 10, // securite
        6: 3,  // regles de barre
        7: 10, // reglementation
        8: 2,  // signaux visuels/sonores
        9: 5,  // meteo
        10: 9, // vhf
        11: 10 // environnement
    };
    return mapping[theme] || 1;
}

function themeExplanationHint(theme, fullText = '', correctText = '') {
    const combined = normalize(`${fullText} ${correctText}`);

    if (theme === 1) {
        if (/panneau|interdit|engins a moteur|vehicules nautiques|vnm/.test(combined)) {
            return "Cours PE reglementation locale: un panneau se lit strictement selon son pictogramme. Si l'interdiction vise les engins a moteur, la navigation motorisee est exclue dans la zone signalisee.";
        }
        if (/chenal traversier|acces a la plage/.test(combined)) {
            return "Cours PE balisage des plages: un chenal traversier materialise un couloir de circulation entre plage et large, a respecter sans couper les lignes de bouees.";
        }
        if (/route\s+[abc]\b|passe en\s+[ab]\b|chenal principal|sens de navigation|entre au port|sortant du port/.test(combined)) {
            return "Cours PE balisage lateral (IALA region A): il faut d'abord identifier le sens conventionnel (entrant au port), puis positionner les marques laterales pour choisir la route conforme.";
        }
        return "Cours PE module balisage: identifier d'abord le type de marque (laterale, cardinale, speciale, eaux saines, danger isole), puis appliquer la regle de passage associee.";
    }

    if (theme === 2) {
        return "Cours PE feux de navigation (RIPAM regles 21 a 23): l'identification repose sur la combinaison couleur + position + secteur + portee, jamais sur un seul feu isole.";
    }
    if (theme === 3 || theme === 6) {
        return "Cours PE regles de barre (RIPAM): qualifier la situation (rattrapage, croisement, route convergente), determiner le navire privilegie puis executer une manœuvre franche et precoce.";
    }
    if (theme === 4) {
        return "Cours PE cartographie: la reponse se construit en lisant la legende SHOM, les echelles et les symboles normalises avant toute decision de route.";
    }
    if (theme === 5) {
        return "Cours PE meteo marine: traduire les termes du bulletin en force Beaufort, etat de mer et impact sur la securite du navire.";
    }
    if (theme === 7 || theme === 10 || theme === 11) {
        return "Cours PE securite/reglementation: appliquer l'obligation legale du chef de bord et verifier les contraintes de zone, d'armement et de pratique.";
    }
    if (theme === 8) {
        return "Cours PE signaux sonores (RIPAM regle 34): le sens du signal depend strictement du nombre et de la duree des sons.";
    }
    if (theme === 9) {
        return "Cours PE VHF/SMDSM: identifier le niveau d'urgence puis appliquer le bon format d'appel sur le canal approprie.";
    }
    return "Cours PE: appliquer la regle de reference du module concerne.";
}

function inferSpecificRule(fullText, correctText = '') {
    const combined = normalize(`${fullText} ${correctText}`);
    const rules = [
        {
            test: /(?:\bmayday\b|\bpan pan\b|message de securite|canal\s*16|appel.*vhf|vhf.*appel|detresse.*vhf)/,
            reason: "En VHF marine, le signal depend du degre d'urgence: MAYDAY pour detresse grave et imminente, PAN PAN pour urgence, SECURITE pour message de securite."
        },
        {
            test: /cross|secours en mer|coordonne les secours/,
            reason: "La coordination operationnelle des secours en mer est assuree par le CROSS."
        },
        {
            test: /erre\b|vitesse du navire par rapport a l eau|vitesse du navire par rapport a l'eau/,
            reason: "L'erre designe la vitesse propre du navire par rapport a l'eau, a distinguer de la vitesse fond."
        },
        {
            test: /division 240|armement de securite|feux a main|manuel du proprietaire/,
            reason: "L'armement obligatoire se verifie sur le manuel du navire et, a defaut, dans la reglementation Division 240 correspondant a la zone de navigation."
        },
        {
            test: /plein de carburant|entonnoir|debordement|pollution/,
            reason: "Au ravitaillement, toute mesure limitant debordement et rejet a la mer est obligatoire pour la securite et la prevention de la pollution."
        },
        {
            test: /derive dangereusement|cote rocheuse|jette l ancre|jeter l ancre|panne moteur/,
            reason: "En derive vers un danger, la priorite est de stopper la derive (mouillage si possible) puis d'alerter selon l'urgence de la situation."
        },
        {
            test: /homme a la mer|dispositif de reperage|zone de navigation cotiere|zone basique/,
            reason: "Les equipements de reperage et d'assistance augmentent avec l'eloignement: certaines obligations s'appliquent des la zone cotiere."
        },
        {
            test: /chef de bord|locataire|titulaire du permis|responsabilite a bord/,
            reason: "Le chef de bord est la personne qui assume legalement la conduite et la securite du navire; ce role n'est pas automatiquement lie a la location."
        },
        {
            test: /bouees jaunes rapprochees|collier de bouees jaunes|danger nouveau|pas encore porte sur les cartes/,
            reason: "Un collier de petites bouees jaunes signale en pratique un danger nouveau ou temporaire: on ne le franchit pas et on recherche un passage balise autorise.",
            reference: "Reference: cours PE balisage des dangers nouveaux et information nautique locale."
        },
        {
            test: /chenal traversier|acces a la plage|chenal d acces a la plage|chenal de plage/,
            reason: "Le chenal traversier est un couloir obligatoire entre plage et large. Il est balise par des marques jaunes laterales (conique/cylindrique selon le cote) et se franchit en restant dans l'axe.",
            reference: "Reference: cours PE balisage des plages et chenaux traversiers."
        },
        {
            test: /voyant.*bouee|forme au dessus du corps de la bouee/,
            reason: "Le voyant (topmark) est la marque de sommet. Il sert, avec la couleur et le rythme du feu, a identifier sans ambiguite la categorie de bouee.",
            reference: "Reference: cours PE balisage (elements d'identification d'une marque)."
        },
        {
            test: /feu blanc isophase|isophase/,
            reason: "Un feu isophase alterne lumieres et obscurites de duree egale. Sur une marque d'eaux saines, il confirme que l'eau est libre tout autour.",
            reference: "Reference: cours PE balisage lumineux (caractere des feux) + marque d'eaux saines."
        },
        {
            test: /zone de peche|marque speciale|speciale/,
            reason: "Une marque speciale (jaune) delimite une zone ou un usage particulier (peche, zone de travaux, chenal de service). Ce n'est pas une marque de chenal principal.",
            reference: "Reference: systeme IALA, cours PE marques speciales."
        },
        {
            test: /antilles|guyane|st pierre|saint pierre|couleurs inversees/,
            reason: "Dans les zones relevant de l'IALA region B, les couleurs laterales sont inversees par rapport a la metropole (region A).",
            reference: "Reference: cours PE balisage lateral IALA region A/B."
        },
        {
            test: /j entre au port|entre au port|sortant du port|sens de navigation|se dirige.*vers le large|se dirige.*vers le port/,
            reason: "Le sens conventionnel sert de reference: en entrant, rouge a babord et vert a tribord (region A). En sortie, la logique est inversee.",
            reference: "Reference: cours PE balisage lateral IALA region A."
        },
        {
            test: /route\s+[abc]\b|passe en\s+[ab]\b|chenal principal/,
            reason: "La bonne route est celle qui respecte le balisage du chenal principal et maintient une marge de securite vis-a-vis des dangers cartographies.",
            reference: "Reference: cours PE balisage + lecture de route sur carte/extrait d'annale."
        },
        {
            test: /panneau|navigation interdite|engins a moteur|vehicules nautiques a moteur interdits/,
            reason: "La signalisation de zone s'applique telle quelle: un panneau d'interdiction limite effectivement la pratique concernee sur la zone delimitee.",
            reference: "Reference: cours PE reglementation cotiere et signalisation locale."
        },
        {
            test: /cale immergee/,
            reason: "Une cale immergee est un danger local pour l'helice et le controle du navire, surtout a faible hauteur d'eau ou maree descendante.",
            reference: "Reference: cours PE securite portuaire et vigilance en zone abritee."
        },
        {
            test: /cap au \d+|cap au (nord|sud|est|ouest)|faisant route au|route au \d+|route au (nord|sud|est|ouest)/,
            reason: "La manœuvre se deduit du compas: vers des valeurs plus faibles on vient a gauche (babord), vers des valeurs plus elevees on vient a droite (tribord), en tenant compte du passage 000/360.",
            reference: "Reference: cours PE cartographie/navigation (lecture et evolution du cap)."
        },
        {
            test: /danger isole|isol[ée]/,
            reason: "Une marque de danger isole signale un obstacle local entoure d'eaux saines; on ne passe pas au contact.",
            reference: "Reference: cours PE balisage (marque de danger isole: couleurs noir/rouge, 2 spheres, feu blanc 2 eclats)."
        },
        {
            test: /eaux saines|safe water|atterrissage/,
            reason: "La marque d'eaux saines indique une eau navigable tout autour et sert souvent d'atterrissage.",
            reference: "Reference: cours PE balisage (marque d'eaux saines: bandes rouge/blanc, voyant sphere)."
        },
        {
            test: /chenal pref[ée]r[ée]|bifurcation/,
            reason: "Une marque de chenal prefere indique la branche principale a suivre dans une bifurcation de chenal.",
            reference: "Reference: cours PE balisage lateral (rythme 2+1 pour identifier le chenal prefere)."
        },
        {
            test: /cardinale|scintillement|c[ôo]nes?\s*(haut|bas)|topmark/,
            reason: "Une cardinale se lit par couleur, orientation des cones et rythme du feu blanc pour deduire le cote de passage securise.",
            reference: "Reference: cours PE cardinales + systeme AISM/IALA."
        },
        {
            test: /signal sonore|sons brefs|son prolonge/,
            reason: "Le message sonore se decode strictement par nombre et duree des coups, puis s'applique a la manœuvre immediate.",
            reference: "Reference: RIPAM regle 34 (signaux de manœuvre et d'avertissement) et cours PE signaux sonores."
        },
        {
            test: /chalut|mouillage|non maitre|capacite de man[œo]uvre|echou[ée]/,
            reason: "Le statut du navire est determine par la combinaison des feux/marques de jour, ce qui conditionne priorite et distance de securite.",
            reference: "Reference: RIPAM regles 21 a 30 + cours PE feux et marques de navires."
        },
        {
            test: /gisement|rel[eè]vement/,
            reason: "Un relèvement qui reste quasi constant caracterise un risque d'abordage, meme si la distance semble encore confortable.",
            reference: "Reference: RIPAM regle 7 et methode de veille du cours PE."
        },
        {
            test: /route convergente|croisement|priorit[ée]|sur son tribord/,
            reason: "En route convergente, le navire qui voit l'autre sur son tribord est navire non privilegie et doit s'ecarter.",
            reference: "Reference: RIPAM regles 15 et 16."
        },
        {
            test: /privilegi[ée]|stand[- ]on|doit s ecarter|s ecarter/,
            reason: "Le navire privilegie maintient route et vitesse, mais doit agir a temps si l'autre ne manœuvre pas.",
            reference: "Reference: RIPAM regle 17."
        },
        {
            test: /compas|cap vrai|cap compas|d[ée]clinaison|d[ée]viation/,
            reason: "La conversion des caps suit la chaine cap compas -> corrections magnetiques -> cap vrai avec convention de signe explicite.",
            reference: "Reference: cours PE cartographie/navigation calculatoire."
        },
        {
            test: /beaufort|avis de grand frais|vent de force/,
            reason: "L'avis meteo se traduit en plage Beaufort et en etat de mer compatible ou non avec la categorie de navire.",
            reference: "Reference: cours PE meteo marine (echelle Beaufort et interpretation bulletin)."
        },
        {
            test: /mar[éee]|marnage|hauteur d eau|douzi[eè]mes|sonde/,
            reason: "La decision se fonde sur hauteur d'eau calculee (PM/BM/marnage) et marge sous quille.",
            reference: "Reference: cours PE maree (regle des douziemes et pied de pilote)."
        },
        {
            test: /entrant au port/,
            reason: "En region A, en entrant depuis le large, on laisse les marques rouges a babord et vertes a tribord.",
            reference: "Reference: balisage lateral IALA region A (cours PE module balisage)."
        },
        {
            test: /sortant du port/,
            reason: "En sortie, la lecture du balisage est inversee par rapport au sens conventionnel d'entree.",
            reference: "Reference: balisage lateral IALA region A (cours PE module balisage)."
        },
        {
            test: /angle du feu blanc de tete de mat/,
            reason: "Le feu blanc de tete de mat d'un navire a moteur couvre 225 deg.",
            reference: "Reference: RIPAM regles 21 et 23 (feux des navires a propulsion mecanique)."
        },
        {
            test: /angle du feu de poupe/,
            reason: "Le feu de poupe couvre 135 deg vers l'arriere.",
            reference: "Reference: RIPAM regle 21 (definition des feux de navigation)."
        },
        {
            test: /angle d un feu de cote|angle d'un feu de cote/,
            reason: "Chaque feu de cote couvre 112,5 deg.",
            reference: "Reference: RIPAM regle 21 (feux de cote)."
        },
        {
            test: /portee des feux de cote.*moins de 12/,
            reason: "Pour un navire de plaisance de moins de 12 m, la portee minimale des feux de cote est de 1 mille.",
            reference: "Reference: RIPAM regle 22 (portee des feux)."
        },
        {
            test: /portee du feu de tete de mat.*moins de 12/,
            reason: "Pour un navire a moteur de moins de 12 m, la portee du feu de tete de mat est de 2 milles.",
            reference: "Reference: RIPAM regle 22 (portee des feux)."
        },
        {
            test: /canal.*detresse|mayday|\bvhf\b/,
            reason: "En detresse vocale, l'appel initial se fait sur le canal 16 avant degagement sur canal de travail.",
            reference: "Reference: cours PE VHF et procedures SMDSM/canal 16."
        },
        {
            test: /cross|secours en mer/,
            reason: "La coordination des secours en mer releve du CROSS.",
            reference: "Reference: organisation des secours en mer (cours PE securite/VHF)."
        },
        {
            test: /300 m|bande cotiere|dans les ports, la vitesse/,
            reason: "La vitesse est reglementee pour la securite des usagers; la limite usuelle est 5 nds sauf signalisation locale.",
            reference: "Reference: cours PE reglementation cotiere (bande des 300 m)."
        },
        {
            test: /rattrap/,
            reason: "Est rattrapant le navire situe dans le secteur de 135 deg arriere de l'autre navire.",
            reference: "Reference: RIPAM regle 13 (rattrapage)."
        },
        {
            test: /releve au 65.*70.*67|risque d abordage|risque d'abordage/,
            reason: "Une variation faible et non franche du relèvement impose de retenir un risque d'abordage.",
            reference: "Reference: RIPAM regle 7 (evaluation du risque d'abordage)."
        },
        {
            test: /veille sur un navire/,
            reason: "La veille visuelle et auditive est permanente en navigation.",
            reference: "Reference: RIPAM regle 5 (veille)."
        },
        {
            test: /categorie de conception c.*force 8|force 6.*categorie de conception c/,
            reason: "La categorie C ne couvre pas des conditions de mer correspondant a force 8.",
            reference: "Reference: cours PE securite et categories de conception CE."
        },
        {
            test: /categorie de conception b.*force/,
            reason: "La categorie B est prevue jusqu a des conditions de vent force 8.",
            reference: "Reference: cours PE securite et categories de conception CE."
        },
        {
            test: /zone de navigation basique.*2 milles/,
            reason: "La zone basique (2 milles) concerne des vehicules nautiques a moteur mono-place.",
            reference: "Reference: cours PE reglementation des VNM."
        },
        {
            test: /coupe[- ]circuit/,
            reason: "Le coupe-circuit est obligatoire sur VNM a partir de 6 cv.",
            reference: "Reference: cours PE securite des VNM."
        },
        {
            test: /feu a occultation/,
            reason: "Un feu a occultation a des periodes de lumiere plus longues que les periodes d'obscurite.",
            reference: "Reference: cours PE balisage (caractere des feux)."
        },
        {
            test: /feu a eclat/,
            reason: "Un feu a eclat presente des periodes d'obscurite plus longues que les periodes lumineuses.",
            reference: "Reference: cours PE balisage (caractere des feux)."
        },
        {
            test: /chenal traversier d acces a la plage|chenal traversier d'acces a la plage/,
            reason: "Le chenal traversier est balise en jaune par conique a tribord et cylindrique a babord (sens d'entree).",
            reference: "Reference: cours PE balisage des plages."
        },
        {
            test: /minute sur l echelle des latitudes|minute sur l'echelle des latitudes/,
            reason: "Sur carte marine, la minute se lit sur les echelles verticales de latitude (gauche/droite).",
            reference: "Reference: cours PE cartographie (lecture des echelles)."
        }
    ];
    return rules.find(rule => rule.test.test(combined)) || null;
}

function themeReference(theme) {
    const refs = {
        1: "Reference cours: module balisage (marques laterales, cardinales, marques speciales).",
        2: "Reference cours: module feux et signaux + RIPAM regles 21 a 23.",
        3: "Reference cours: module regles de barre + RIPAM regles 5, 7, 13, 15, 16, 17.",
        4: "Reference cours: module cartographie et symboles SHOM.",
        5: "Reference cours: module meteo marine et echelle Beaufort.",
        9: "Reference cours: module VHF et procedures de detresse/urgence.",
        10: "Reference cours: module securite et reglementation plaisance."
    };
    return refs[theme] || "Reference cours: module theorique PE correspondant.";
}

function stripTrailingPunctuation(value) {
    return String(value || '').trim().replace(/[.?!]+$/g, '');
}

function buildExplanation({ text, context, answers, correctIndex, theme }) {
    const correctText = stripTrailingPunctuation(answers[correctIndex]);
    const questionText = String(text || '').trim();
    const rawContext = String(context || '').trim();
    const contextualHint = /^Question\s+/i.test(rawContext) ? '' : rawContext;
    const fullText = normalize(`${questionText} ${contextualHint}`);
    const matched = inferSpecificRule(fullText, correctText);
    const baseReason = matched ? matched.reason : themeExplanationHint(theme, fullText, correctText);
    const contextReason = contextualHint ? `Contexte de l'enonce: ${stripTrailingPunctuation(contextualHint)}.` : '';

    return [
        `Reponse correcte: ${correctText}.`,
        `Explication: ${baseReason}`,
        contextReason
    ].filter(Boolean).join(' ');
}

function synthesizeTheoryContext(questionText, moduleId) {
    const text = normalize(questionText);
    if (!text) return null;

    if (/angle|portee|feu|tete de mat|poupe|feux de cote/.test(text)) {
        return 'Question theorique RIPAM sur les caracteristiques reglementaires des feux de navigation.';
    }
    if (/bande cotiere|300 m|vitesse|ports/.test(text)) {
        return 'Question de reglementation de vitesse en plaisance (France), sauf indication locale plus restrictive.';
    }
    if (/categorie de conception|force 6|force 8|vent/.test(text)) {
        return 'Question de securite: confronter la meteo aux limites de categorie de conception du navire.';
    }
    if (/rattrap|abordage|releve|veille|route au 180|tribord|babord/.test(text)) {
        return 'Question de regles de barre et de prevention des abordages (RIPAM).';
    }
    if (/cross|canal|vhf|detresse|secours/.test(text)) {
        return 'Question de communication et d organisation des secours en mer.';
    }
    if (/carte marine|latitudes|minute|sonde|maree/.test(text)) {
        return 'Question de lecture de carte marine et de securite de navigation.';
    }
    if (/peche|coupe circuit|vehicule nautique|chef de bord|armement|securite/.test(text)) {
        return 'Question de reglementation plaisance et de responsabilite du chef de bord.';
    }

    return `Question theorique du module ${moduleId}.`;
}

function applyManualCuration(categories) {
    return toArray(categories)
        .map(category => {
            const moduleId = Number(category.module || 1);
            const questions = toArray(category.questions)
                .map(question => {
                    const key = `${category.id}:${question.id}`;
                    if (MANUAL_CURATION.dropKeys.has(key)) return null;

                    const override = MANUAL_CURATION.overridesByKey[key] || null;
                    const merged = {
                        ...question,
                        ...(override || {})
                    };

                    if (!merged.image && !merged.context) {
                        merged.context = synthesizeTheoryContext(merged.text, moduleId);
                    }

                    const answers = toArray(merged.answers).map(answer => answer.text);
                    const correctIndex = toArray(merged.answers).findIndex(answer => answer.correct);
                    if (correctIndex >= 0) {
                        merged.explanation = buildExplanation({
                            text: merged.text,
                            context: merged.context,
                            answers,
                            correctIndex,
                            theme: moduleId
                        });
                    }

                    return merged;
                })
                .filter(Boolean)
                .filter(isQuestionSane);

            return {
                ...category,
                questions
            };
        })
        .filter(category => toArray(category.questions).length > 0);
}

function isQuestionSane(question) {
    if (!question || !question.text || question.text.length < 10) return false;
    const text = String(question.text).trim();
    if (LOW_QUALITY_TEXT_PATTERNS.some(pattern => pattern.test(text))) return false;
    if (!Array.isArray(question.answers) || question.answers.length < 2) return false;
    const correctCount = question.answers.filter(answer => answer.correct).length;
    if (correctCount !== 1) return false;

    const answers = question.answers.map(answer => normalize(answer.text)).filter(Boolean);
    if (answers.length !== question.answers.length) return false;
    if (new Set(answers).size !== answers.length) return false;
    if (needsVisualOrContext(text) && !question.image && !question.context) return false;
    if (!question.image && !question.context && AMBIGUOUS_WITHOUT_CONTEXT_PATTERNS.some(pattern => pattern.test(text))) return false;
    if (!question.image && !question.context && text.length < 18 && /[:?]$/.test(text)) return false;
    return true;
}

function buildQuestionSignature(question) {
    const answers = (question.answers || [])
        .map(answer => normalize(answer.text))
        .sort()
        .join('|');
    return `${normalize(question.text)}||${normalize(question.context || '')}||${answers}`;
}

async function fetchHtml(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'site-pe-curator/1.0 (+https://www.loisirs-nautic.fr/)'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${url}`);
        }
        return response.text();
    } finally {
        clearTimeout(timeout);
    }
}

function parseQuestionsFromSeries(html, seriesIndex) {
    const goodAnswers = parseNumberArray(html, 'TabBonnesReponses');
    const goodAnswers2 = parseNumberArray(html, 'TabBonnesReponses2');
    const themes = parseNumberArray(html, 'TabThemes');
    const parsed = [];

    let match;
    while ((match = QUESTION_BLOCK_REGEX.exec(html)) !== null) {
        const questionNumber = Number.parseInt(match[1], 10);
        const block = match[0];
        const text = decodeHtml(match[2]);
        const answersRaw = [...match[3].matchAll(ANSWER_OPTION_REGEX)].map(item => decodeHtml(item[1]));
        const image = extractQuestionImage(block);
        const context = extractQuestionContext(block);

        const correctIndex1 = (goodAnswers[questionNumber - 1] || 0) - 1;
        const correctIndex2 = (goodAnswers2[questionNumber - 1] || 0) - 1;
        const theme = themes[questionNumber - 1] || 0;

        // Le moteur actuel supporte les questions a reponse unique
        if (correctIndex2 >= 0) continue;
        if (correctIndex1 < 0 || correctIndex1 >= answersRaw.length) continue;

        const answers = answersRaw.map((answerText, index) => ({
            id: String.fromCharCode(97 + index),
            text: answerText,
            correct: index === correctIndex1
        }));

        const question = {
            id: `ln_pc${seriesIndex}_q${questionNumber}`,
            text,
            context,
            image,
            answers,
            explanation: buildExplanation({
                text,
                context,
                answers: answersRaw,
                correctIndex: correctIndex1,
                theme
            }),
            difficulty: 2,
            tags: ['web_annales', `series_${seriesIndex}`, `theme_${theme}`],
            source: 'https://www.loisirs-nautic.fr/'
        };

        if (!isQuestionSane(question)) continue;

        parsed.push({
            module: mapThemeToModule(theme),
            question
        });
    }

    return parsed;
}

function loadBaseCategories(rootDir) {
    const qcmPath = path.join(rootDir, 'src', 'data', 'qcm.json');
    const qcm = JSON.parse(fs.readFileSync(qcmPath, 'utf8'));
    const categories = Array.isArray(qcm.categories) ? qcm.categories : [];
    return categories
        .map(category => ({
            ...category,
            questions: (category.questions || [])
                .map(question => {
                    const answers = (question.answers || []).map(answer => answer.text);
                    const correctIndex = (question.answers || []).findIndex(answer => answer.correct);
                    const theme = Number(category.module || 1);
                    return {
                        ...question,
                        context: question.context || null,
                        explanation: String(question.explanation || '').trim() || buildExplanation({
                            text: question.text,
                            context: question.context || null,
                            answers,
                            correctIndex,
                            theme
                        })
                    };
                })
                .filter(isQuestionSane)
        }))
        .filter(category => (category.questions || []).length > 0);
}

function mergeCategories(baseCategories, importedByModule) {
    const merged = JSON.parse(JSON.stringify(baseCategories));
    const seenByModule = new Map();

    merged.forEach(category => {
        const moduleId = Number(category.module || 1);
        if (!seenByModule.has(moduleId)) seenByModule.set(moduleId, new Set());
        const set = seenByModule.get(moduleId);
        (category.questions || []).forEach(question => {
            set.add(buildQuestionSignature(question));
        });
    });

    Object.entries(importedByModule).forEach(([moduleKey, questions]) => {
        const moduleId = Number(moduleKey);
        const categoryId = `web_annales_module_${moduleId}`;
        let category = merged.find(item => item.id === categoryId);
        if (!category) {
            category = {
                id: categoryId,
                name: `Annales web module ${moduleId}`,
                description: 'Questions annales/web permiss bateau a reponse unique',
                module: moduleId,
                questions: []
            };
            merged.push(category);
        }

        if (!seenByModule.has(moduleId)) seenByModule.set(moduleId, new Set());
        const signatureSet = seenByModule.get(moduleId);

        questions.forEach(question => {
            const signature = buildQuestionSignature(question);
            if (signatureSet.has(signature)) return;
            signatureSet.add(signature);
            category.questions.push(question);
        });
    });

    return merged;
}

async function main() {
    const rootDir = path.join(__dirname, '..');
    const importedByModule = {};

    for (let i = 0; i < SERIES_URLS.length; i += 1) {
        const url = SERIES_URLS[i];
        const seriesIndex = i + 1;
        const html = await fetchHtml(url);
        const parsed = parseQuestionsFromSeries(html, seriesIndex);
        parsed.forEach(item => {
            if (!importedByModule[item.module]) importedByModule[item.module] = [];
            importedByModule[item.module].push(item.question);
        });
    }

    const baseCategories = loadBaseCategories(rootDir);
    const mergedCategories = mergeCategories(baseCategories, importedByModule);
    const categories = applyManualCuration(mergedCategories);
    const totalQuestions = categories.reduce((sum, category) => sum + (category.questions || []).length, 0);

    const output = {
        generatedAt: new Date().toISOString(),
        source: {
            base: 'src/data/qcm.json',
            web: 'https://www.loisirs-nautic.fr/'
        },
        categories,
        metadata: {
            totalQuestions
        }
    };

    const outputPath = path.join(rootDir, 'src', 'data', 'qcm.web.curated.json');
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

    const importedCount = Object.values(importedByModule)
        .reduce((sum, list) => sum + list.length, 0);
    console.log(`Generated ${outputPath}`);
    console.log(`Imported web questions (single-answer): ${importedCount}`);
    console.log(`Total merged questions: ${totalQuestions}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
