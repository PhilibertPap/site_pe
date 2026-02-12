const fs = require('node:fs');
const path = require('node:path');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function parseArgs(argv) {
    const out = {};
    argv.forEach(arg => {
        if (!arg.startsWith('--')) return;
        const [key, rawValue] = arg.slice(2).split('=');
        out[key] = rawValue == null ? true : rawValue;
    });
    return out;
}

function toInt(value, fallback) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
}

function createSeededRng(seed) {
    let value = seed >>> 0;
    return function seededRandom() {
        value = (1664525 * value + 1013904223) % 4294967296;
        return value / 4294967296;
    };
}

function shuffle(items, rng) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function reindexAnswers(answers) {
    const labels = ['a', 'b', 'c', 'd', 'e', 'f'];
    return answers.map((answer, index) => ({
        id: labels[index] || String(index),
        text: answer.text,
        correct: Boolean(answer.correct)
    }));
}

function lowerFirst(text) {
    if (!text) return text;
    return text[0].toLowerCase() + text.slice(1);
}

function buildQuestionVariant(baseQuestion, variantIndex, rng) {
    const templates = [
        t => t,
        t => `En situation pratique, ${lowerFirst(t)}`,
        t => `Pour l'examen PE, ${lowerFirst(t)}`,
        t => `Cas d'application: ${t}`,
        t => `Question de revision: ${t}`,
        t => `${t} (serie d'entrainement ${variantIndex})`
    ];
    const template = templates[variantIndex % templates.length];
    const answers = reindexAnswers(shuffle(baseQuestion.answers, rng));
    return {
        ...baseQuestion,
        id: `${baseQuestion.id}_v${variantIndex}`,
        text: template(baseQuestion.text),
        answers
    };
}

function buildObjectiveQuestions(siteData, rng, perObjectiveVariants) {
    const allObjectives = siteData.modules.flatMap(module =>
        (module.objectifs || []).map(objectif => ({ module, objectif }))
    );

    const categories = [];
    siteData.modules.forEach(module => {
        const objectifs = module.objectifs || [];
        const questions = [];

        objectifs.forEach((objectif, idx) => {
            for (let variant = 1; variant <= perObjectiveVariants; variant += 1) {
                const distractors = shuffle(
                    allObjectives
                        .filter(item => item.module.id !== module.id)
                        .map(item => item.objectif),
                    rng
                ).slice(0, 3);

                const answers = reindexAnswers(shuffle([
                    { id: 'a', text: objectif, correct: true },
                    ...distractors.map((text, i) => ({ id: String(i + 1), text, correct: false }))
                ], rng));

                questions.push({
                    id: `obj_${module.id}_${idx + 1}_${variant}`,
                    text: `Module ${module.moduleNumber} - ${module.name}: quel objectif fait partie des attendus ?`,
                    image: null,
                    answers,
                    difficulty: 2
                });
            }
        });

        categories.push({
            id: `objectifs_module_${module.id}`,
            name: `Objectifs module ${module.moduleNumber}`,
            description: `Verification des attendus du module ${module.moduleNumber}`,
            module: module.id,
            questions
        });
    });

    return categories;
}

function countQuestionsByModule(categories) {
    return categories.reduce((acc, category) => {
        const key = String(category.module);
        acc[key] = (acc[key] || 0) + (category.questions?.length || 0);
        return acc;
    }, {});
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const variantsPerQuestion = Math.max(0, toInt(args.variants, 150));
    const objectiveVariants = Math.max(1, toInt(args.objectiveVariants, 3));
    const seed = toInt(args.seed, 20260212);
    const outPathArg = args.out || 'src/data/qcm.large.generated.json';

    const rootDir = path.join(__dirname, '..');
    const qcmBasePath = path.join(rootDir, 'src', 'data', 'qcm.json');
    const sitePath = path.join(rootDir, 'src', 'data', 'site.json');
    const outputPath = path.join(rootDir, outPathArg);

    const qcmBase = readJson(qcmBasePath);
    const siteData = readJson(sitePath);
    const rng = createSeededRng(seed);

    const expandedCategories = qcmBase.categories.map(category => {
        const baseQuestions = category.questions || [];
        const expanded = [...baseQuestions];
        baseQuestions.forEach(question => {
            for (let i = 1; i <= variantsPerQuestion; i += 1) {
                expanded.push(buildQuestionVariant(question, i, rng));
            }
        });
        return {
            ...category,
            questions: expanded
        };
    });

    const objectiveCategories = buildObjectiveQuestions(siteData, rng, objectiveVariants);
    const categories = [...expandedCategories, ...objectiveCategories];
    const totalQuestions = categories.reduce((sum, category) => sum + (category.questions?.length || 0), 0);

    const payload = {
        generatedAt: new Date().toISOString(),
        source: {
            baseQcm: 'qcm.json',
            site: 'site.json'
        },
        generation: {
            algorithm: 'variant_and_objectives_v1',
            variantsPerQuestion,
            objectiveVariants,
            seed
        },
        stats: {
            categories: categories.length,
            totalQuestions,
            byModule: countQuestionsByModule(categories)
        },
        categories
    };

    writeJson(outputPath, payload);
    console.log(`Generated large QCM dataset: ${outputPath}`);
    console.log(`Total categories: ${payload.stats.categories}`);
    console.log(`Total questions: ${payload.stats.totalQuestions}`);
}

main();
