const fs = require('node:fs');
const path = require('node:path');

const SERIES_URLS = [1, 2, 3, 4, 5, 6].map(
    index => `https://www.loisirs-nautic.fr/test_permis_cotier_${index}.php`
);

const QUESTION_BLOCK_REGEX = /<div\s+name="Q(\d+)"[^>]*class="quest"[\s\S]*?<form[^>]*id="qcm\1"[\s\S]*?<label[^>]*>([\s\S]*?)<\/label>[\s\S]*?<div>([\s\S]*?)<\/div>[\s\S]*?<\/form>/g;
const ANSWER_OPTION_REGEX = /<label class="checkbox"[^>]*>[\s\S]*?<i><\/i>([\s\S]*?)<\/label>/g;
const LOW_QUALITY_TEXT_PATTERNS = [
    /^que signifie\s*["']?de jour["']?\s*\?*$/i,
    /^que signifie\s*["']?de nuit["']?\s*\?*$/i,
    /^ce feu est\s*:?\s*$/i
];

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

function isQuestionSane(question) {
    if (!question || !question.text || question.text.length < 10) return false;
    if (LOW_QUALITY_TEXT_PATTERNS.some(pattern => pattern.test(String(question.text).trim()))) return false;
    if (!Array.isArray(question.answers) || question.answers.length < 2) return false;
    const correctCount = question.answers.filter(answer => answer.correct).length;
    if (correctCount !== 1) return false;

    const answers = question.answers.map(answer => normalize(answer.text)).filter(Boolean);
    if (answers.length !== question.answers.length) return false;
    if (new Set(answers).size !== answers.length) return false;
    return true;
}

function buildQuestionSignature(question) {
    const answers = (question.answers || [])
        .map(answer => normalize(answer.text))
        .sort()
        .join('|');
    return `${normalize(question.text)}||${answers}`;
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
        const imageMatch = block.match(/<img[^>]*src="([^"]+)"/i);
        const image = imageMatch
            ? (imageMatch[1].startsWith('http')
                ? imageMatch[1]
                : `https://www.loisirs-nautic.fr/${imageMatch[1].replace(/^\/+/, '')}`)
            : null;

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
            image,
            answers,
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
            questions: (category.questions || []).filter(isQuestionSane)
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
    const categories = mergeCategories(baseCategories, importedByModule);
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
