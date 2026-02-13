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

function themeExplanationHint(theme) {
    const hints = {
        1: 'Balisage: raisonner avec le triplet couleur + forme + sens conventionnel de navigation.',
        2: 'Feux/signaux: identifier un navire par la combinaison complete (couleur, position, secteur, portee).',
        3: 'Regles de barre: commencer par qualifier la rencontre, puis appliquer la priorite RIPAM correspondante.',
        4: 'Cartographie: associer chaque symbole a sa definition officielle SHOM, sans interpretation libre.',
        5: 'Meteo: convertir les termes du bulletin (force/avis) en consequences navigation concretes.',
        6: 'RIPAM pratique: privilegie ou non, la manœuvre doit rester franche, precoce et comprehensible.',
        7: 'Reglementation plaisance: la bonne reponse est celle qui respecte l obligation legale explicite.',
        8: 'Signaux sonores: compter exactement les sons et leur duree, sans approximation.',
        9: 'Radio: choisir le bon canal et le bon niveau d urgence avant tout message.',
        10: 'Securite equipage/navire: verifier categorie, zone, equipement et responsabilite du chef de bord.',
        11: 'Environnement: retenir la conduite limitant le risque pour les personnes et le milieu.'
    };
    return hints[theme] || 'Applique la regle de reference du cours, puis elimine les propositions incoherentes.';
}

function inferSpecificRule(fullText) {
    const rules = [
        {
            test: /entrant au port/,
            reason: 'En region A, en entrant depuis le large, on laisse les marques rouges a babord et vertes a tribord.',
            trap: "Le piege classique est d'inverser avec la logique de sortie de port."
        },
        {
            test: /sortant du port/,
            reason: 'En sortie, la lecture du balisage est inversee par rapport au sens conventionnel d entree.',
            trap: "Ne pas reutiliser automatiquement la regle d'entree."
        },
        {
            test: /angle du feu blanc de tete de mat/,
            reason: "Le feu blanc de tete de mat d'un navire a moteur couvre 225 deg.",
            trap: '135 deg correspond au feu de poupe, pas au feu de tete.'
        },
        {
            test: /angle du feu de poupe/,
            reason: "Le feu de poupe couvre 135 deg vers l'arriere.",
            trap: '225 deg correspond au feu de tete de mat.'
        },
        {
            test: /angle d un feu de cote|angle d'un feu de cote/,
            reason: 'Chaque feu de cote couvre 112,5 deg.',
            trap: 'Ne pas confondre avec 135 deg (poupe) ou 225 deg (tete de mat).'
        },
        {
            test: /portee des feux de cote.*moins de 12/,
            reason: 'Pour un navire de plaisance de moins de 12 m, la portee minimale des feux de cote est de 1 mille.',
            trap: 'Les portees plus grandes concernent d autres categories de navires.'
        },
        {
            test: /portee du feu de tete de mat.*moins de 12/,
            reason: "Pour un navire a moteur de moins de 12 m, la portee du feu de tete de mat est de 2 milles.",
            trap: '300 m est insuffisant, 5 ou 10 milles correspondent a de plus gros navires.'
        },
        {
            test: /canal.*detresse|mayday|\bvhf\b/,
            reason: 'En detresse vocale, l appel initial se fait sur le canal 16.',
            trap: 'Ne pas confondre canal d appel de detresse et canaux de travail.'
        },
        {
            test: /cross|secours en mer/,
            reason: 'La coordination des secours en mer releve du CROSS.',
            trap: 'La SNSM intervient en sauvetage mais ne coordonne pas les operations.'
        },
        {
            test: /300 m|bande cotiere|dans les ports, la vitesse/,
            reason: 'La vitesse est reglementee pour la securite des usagers; la limite usuelle est 5 nds sauf signalisation locale.',
            trap: 'Ne pas melanger unites (km/h et nds) ni generaliser hors zone reglementee.'
        },
        {
            test: /rattrap/,
            reason: "Est rattrapant le navire situe dans le secteur de 135 deg arriere de l'autre navire.",
            trap: '90 deg ou 112,5 deg ne couvrent pas toute la definition RIPAM.'
        },
        {
            test: /releve au 65.*70.*67|risque d abordage|risque d'abordage/,
            reason: "Une variation faible et non franche du relèvement impose de retenir un risque d'abordage.",
            trap: 'En securite, le doute se traite comme un risque et non comme une absence de danger.'
        },
        {
            test: /veille sur un navire/,
            reason: 'La veille visuelle et auditive est permanente en navigation.',
            trap: 'Elle ne se limite pas a la nuit, a la brume, ou au trafic dense.'
        },
        {
            test: /categorie de conception c.*force 8|force 6.*categorie de conception c/,
            reason: 'La categorie C ne couvre pas des conditions de mer correspondant a force 8.',
            trap: 'Toujours confronter meteo annoncee et limites de conception du navire.'
        },
        {
            test: /categorie de conception b.*force/,
            reason: 'La categorie B est prevue jusqu a des conditions de vent force 8.',
            trap: "Au-dela, la condition sort du domaine nominal de conception."
        },
        {
            test: /zone de navigation basique.*2 milles/,
            reason: 'La zone basique (2 milles) concerne des vehicules nautiques a moteur mono-place.',
            trap: 'Ne pas extrapoler aux navires a moteur classiques.'
        },
        {
            test: /coupe[- ]circuit/,
            reason: "Le coupe-circuit est obligatoire sur VNM a partir de 6 cv.",
            trap: "Ne pas attendre des puissances superieures: l'obligation commence des 6 cv."
        },
        {
            test: /feu a occultation/,
            reason: "Un feu a occultation a des periodes de lumiere plus longues que les periodes d'obscurite.",
            trap: 'Les durees egales caracterisent un autre type de feu.'
        },
        {
            test: /feu a eclat/,
            reason: "Un feu a eclat presente des periodes d'obscurite plus longues que les periodes lumineuses.",
            trap: "Ne pas inverser avec la definition du feu a occultation."
        },
        {
            test: /chenal traversier d acces a la plage|chenal traversier d'acces a la plage/,
            reason: "Le chenal traversier est balise en jaune par conique a tribord et cylindrique a babord (sens d'entree).",
            trap: 'Ne pas appliquer le rouge/vert du balisage lateral de chenal classique.'
        },
        {
            test: /minute sur l echelle des latitudes|minute sur l'echelle des latitudes/,
            reason: "Sur carte marine, la minute se lit sur les echelles verticales de latitude (gauche/droite).",
            trap: "Les bords haut/bas servent a la longitude."
        }
    ];
    return rules.find(rule => rule.test.test(fullText)) || null;
}

function explainWrongChoices(fullText, wrongAnswers, correctText) {
    const wrong = wrongAnswers.filter(Boolean);
    if (!wrong.length) return 'Les autres propositions ne respectent pas la regle de reference.';

    if (/[0-9]+\s*deg|°/.test(`${correctText} ${wrong.join(' ')}`)) {
        return 'Les autres valeurs correspondent a d autres feux/secteurs et non a la situation demandee.';
    }
    if (/vrai|faux/i.test(`${correctText} ${wrong.join(' ')}`)) {
        return "L'alternative inverse contredit directement la regle ou l'obligation visee par la question.";
    }
    if (/canal|vhf|cross|detresse/.test(fullText)) {
        return 'Les autres choix confondent acteur de coordination, canal d appel ou niveau d urgence.';
    }
    if (/vitesse|300 m|ports/.test(fullText)) {
        return 'Les autres choix melangent unites ou valeurs hors cadre reglementaire.';
    }
    if (/categorie de conception|force/.test(fullText)) {
        return 'Les autres choix ignorent les limites de conception et le niveau de vent annonce.';
    }
    return 'Les autres propositions soit inversent la regle, soit decrivent un cas voisin mais different.';
}

function buildExplanation({ text, context, answers, correctIndex, theme }) {
    const correctText = String(answers[correctIndex] || '').trim();
    const questionText = String(text || '').trim();
    const fullText = normalize(`${questionText} ${context || ''}`);
    const matched = inferSpecificRule(fullText);
    const baseReason = matched ? matched.reason : themeExplanationHint(theme);
    const trap = matched ? matched.trap : 'Piege frequent: confondre une regle generale avec un cas particulier non demande.';
    const wrongAnswers = answers.filter((_, index) => index !== correctIndex);
    const wrongReason = explainWrongChoices(fullText, wrongAnswers, correctText);
    const contextReason = context ? `Contexte a exploiter: ${context}.` : '';

    return [
        `Bonne reponse: ${correctText}.`,
        `Regle: ${baseReason}`,
        `Pourquoi les autres non: ${wrongReason}`,
        `Piege examen: ${trap}`,
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

                    if (!String(merged.explanation || '').trim()) {
                        const answers = toArray(merged.answers).map(answer => answer.text);
                        const correctIndex = toArray(merged.answers).findIndex(answer => answer.correct);
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
