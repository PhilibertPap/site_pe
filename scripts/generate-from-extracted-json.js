const fs = require('node:fs');
const path = require('node:path');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
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

function parseArgs(argv) {
    const args = {};
    argv.forEach(arg => {
        if (!arg.startsWith('--')) return;
        const [key, raw] = arg.slice(2).split('=');
        args[key] = raw == null ? true : raw;
    });
    return args;
}

function toInt(v, fallback) {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
}

function firstExistingPath(paths) {
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

function getRequiredFieldsByType(schema) {
    const map = new Map();
    (schema.question_types || []).forEach(entry => {
        map.set(entry.type, entry.fields || []);
    });
    return map;
}

function assertBankSchema(bank, schema) {
    if (bank.schema_version !== schema.schema_version) {
        throw new Error(`Schema version mismatch: bank=${bank.schema_version} schema=${schema.schema_version}`);
    }

    const requiredByType = getRequiredFieldsByType(schema);
    const questions = bank.questions || [];
    questions.forEach((q, idx) => {
        const req = requiredByType.get(q.type);
        if (!req) throw new Error(`Question type inconnu: ${q.type} (index ${idx})`);
        req.forEach(field => {
            if (!(field in q)) throw new Error(`Champ manquant (${field}) dans question ${q.id}`);
        });

        if (q.type === 'mcq_single') {
            if (!Array.isArray(q.choices) || q.choices.length < 2) {
                throw new Error(`mcq_single sans choix valides: ${q.id}`);
            }
            if (!Number.isInteger(q.answer_index) || q.answer_index < 0 || q.answer_index >= q.choices.length) {
                throw new Error(`mcq_single answer_index invalide: ${q.id}`);
            }
        }
    });
}

function moduleNumericIdFromSource(moduleId) {
    if (moduleId === 'M1') return 1;
    if (moduleId === 'M14') return 8;
    const parsed = Number.parseInt(String(moduleId).replace(/\D+/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : 1;
}

function classifyM14TargetModule(text) {
    const t = String(text || '').toLowerCase();
    if (/(courant|flot|jusant)/.test(t)) return 7;
    return 8;
}

function deriveFactsFromModule(module) {
    const facts = [];

    (module.sections || []).forEach(section => {
        (section.key_points || []).forEach(point => {
            facts.push({
                text: point.trim(),
                sectionId: section.id,
                sectionTitle: section.title
            });
        });
    });

    (module.terms || []).forEach(term => {
        facts.push({
            text: `${term.term} : ${term.definition}`,
            sectionId: `${module.id}-TERMS`,
            sectionTitle: 'Termes et definitions'
        });
    });

    (module.exercises || []).forEach(ex => {
        const answers = ex.answers || {};
        Object.keys(answers).forEach(key => {
            facts.push({
                text: `Exercice ${ex.id} - ${key}: ${answers[key]}`,
                sectionId: `${module.id}-EX`,
                sectionTitle: 'Exercices corriges'
            });
        });
    });

    return facts.filter(item => item.text.length > 8);
}

function createQuestionStem(moduleName, sectionTitle, variant) {
    const stems = [
        `Selon le cours "${moduleName}", quelle affirmation est correcte ?`,
        `Dans la section "${sectionTitle}", quelle proposition est juste ?`,
        `Question PE (${moduleName}) : identifie l enonce exact.`,
        `Choisis la bonne reponse pour ${moduleName}.`
    ];
    return stems[variant % stems.length];
}

function buildMcqBankFromNormalized(normalized, options) {
    const rng = options.rng;
    const variantsPerFact = options.variantsPerFact;
    const moduleFilters = new Set((normalized.modules || []).map(m => m.id));
    const factsByModule = new Map();

    (normalized.modules || []).forEach(module => {
        factsByModule.set(module.id, deriveFactsFromModule(module));
    });

    const allFacts = [...factsByModule.values()].flat().map(item => item.text);
    const questions = [];
    let questionCounter = 1;

    for (const module of normalized.modules || []) {
        const localFacts = factsByModule.get(module.id) || [];
        const localTexts = localFacts.map(item => item.text);
        const sourcePages = module.source?.page_range || [];

        localFacts.forEach((fact, factIndex) => {
            for (let v = 0; v < variantsPerFact; v += 1) {
                const wrongLocal = shuffle(localTexts.filter(t => t !== fact.text), rng).slice(0, 2);
                const wrongGlobal = shuffle(allFacts.filter(t => t !== fact.text && !wrongLocal.includes(t)), rng).slice(0, 2);
                const wrong = [...wrongLocal, ...wrongGlobal].slice(0, 3);
                if (wrong.length < 3) continue;

                const choices = shuffle([fact.text, ...wrong], rng);
                const answerIndex = choices.findIndex(c => c === fact.text);

                questions.push({
                    id: `ext_${module.id}_${factIndex + 1}_${v + 1}`,
                    type: 'mcq_single',
                    module: module.id,
                    site_module: module.id === 'M14' ? classifyM14TargetModule(fact.text) : moduleNumericIdFromSource(module.id),
                    tags: [module.id, fact.sectionId, 'extracted'],
                    stem: createQuestionStem(module.name, fact.sectionTitle, v),
                    choices,
                    answer_index: answerIndex,
                    explanation: `Base cours: ${module.name} / ${fact.sectionTitle}`,
                    source_pages: sourcePages
                });
                questionCounter += 1;
            }
        });
    }

    return {
        schema_version: normalized.schema_version || '1.0',
        source: 'pe_course_dataset.normalized.json',
        question_count: questions.length,
        modules: [...moduleFilters],
        questions
    };
}

function convertBankToSiteQcm(bank) {
    const grouped = new Map();
    bank.questions.forEach(question => {
        const moduleNumeric = Number.isFinite(Number(question.site_module))
            ? Number(question.site_module)
            : moduleNumericIdFromSource(question.module);
        const key = `${question.module}_${moduleNumeric}`;
        if (!grouped.has(key)) {
            grouped.set(key, {
                id: `extracted_${String(question.module).toLowerCase()}_${moduleNumeric}`,
                name: `Extraits ${question.module} (module ${moduleNumeric})`,
                description: `Questions derivees du dataset normalise (${question.module})`,
                module: moduleNumeric,
                questions: []
            });
        }

        if (question.module === 'M14') {
            const targetId = moduleNumeric;
            const idSuffix = targetId === 7 ? 'courants' : 'marees';
            grouped.get(key).id = `extracted_m14_${idSuffix}`;
            grouped.get(key).name = targetId === 7 ? 'Extraits M14 - Courants' : 'Extraits M14 - Marees';
            grouped.get(key).module = targetId;
        }

        const answerIds = ['a', 'b', 'c', 'd', 'e'];
        grouped.get(key).questions.push({
            id: question.id,
            text: question.stem,
            image: null,
            answers: question.choices.map((choice, idx) => ({
                id: answerIds[idx] || String(idx),
                text: choice,
                correct: idx === question.answer_index
            })),
            difficulty: 2,
            explanation: question.explanation,
            source_pages: question.source_pages,
            tags: question.tags
        });
    });

    return {
        generatedAt: new Date().toISOString(),
        source: bank.source,
        categories: [...grouped.values()]
    };
}

function toCourseOverrideModules(normalized) {
    const overrides = [];

    (normalized.modules || []).forEach(module => {
        const sections = module.sections || [];
        const pageRange = module.source?.page_range || [];
        const pageText = pageRange.length ? `Pages source: ${pageRange[0]}-${pageRange[1]}.` : '';

        if (module.id === 'M14') {
            const currentSections = sections.filter(section => /(courant|flot|jusant)/i.test(JSON.stringify(section)));
            const tideSections = sections.filter(section => !currentSections.includes(section));

            const makeOverride = (id, label, pickedSections) => {
                const sectionHtml = pickedSections.map(section => {
                    const points = (section.key_points || []).map(point => `<li>${point}</li>`).join('');
                    return `<h5>${section.title}</h5><ul>${points}</ul>`;
                }).join('');
                const keyPoints = pickedSections.flatMap(section => section.key_points || []).slice(0, 12);
                return {
                    id,
                    description: label,
                    objectifs: keyPoints.slice(0, 6),
                    content: `<p>${pageText}</p>${sectionHtml}`,
                    keyPoints
                };
            };

            if (currentSections.length) {
                overrides.push(makeOverride(7, 'Courants (extraits M14)', currentSections));
            }
            if (tideSections.length) {
                overrides.push(makeOverride(8, 'Marees (extraits M14)', tideSections));
            }
            return;
        }

        const moduleId = moduleNumericIdFromSource(module.id);
        const sectionHtml = sections.map(section => {
            const points = (section.key_points || []).map(point => `<li>${point}</li>`).join('');
            return `<h5>${section.title}</h5><ul>${points}</ul>`;
        }).join('');

        const terms = (module.terms || []).map(t => `<li><strong>${t.term}</strong> : ${t.definition}</li>`).join('');
        const termsHtml = terms ? `<h5>Termes</h5><ul>${terms}</ul>` : '';
        const objectifsSection = sections.find(s => /objectif/i.test(s.title || ''));
        const objectifs = (objectifsSection?.key_points || []).slice(0, 6);
        const keyPoints = sections.flatMap(section => section.key_points || []).slice(0, 12);

        overrides.push({
            id: moduleId,
            description: module.name,
            objectifs: objectifs.length ? objectifs : keyPoints.slice(0, 4),
            content: `<p>${pageText}</p>${sectionHtml}${termsHtml}`,
            keyPoints
        });
    });

    return {
        generatedAt: new Date().toISOString(),
        source: 'pe_course_dataset.normalized.json',
        modules: overrides
    };
}

function mergeWithBaseQcm(baseQcm, extractedQcm) {
    const existingIds = new Set((baseQcm.categories || []).map(c => c.id));
    const categories = [...(baseQcm.categories || [])];
    extractedQcm.categories.forEach(category => {
        if (existingIds.has(category.id)) {
            categories.push({ ...category, id: `${category.id}_v2` });
        } else {
            categories.push(category);
        }
    });
    return {
        generatedAt: new Date().toISOString(),
        source: {
            base: 'qcm.json',
            extracted: extractedQcm.source
        },
        categories
    };
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const seed = toInt(args.seed, 20260212);
    const variantsPerFact = toInt(args.variants, 5);
    const rng = createSeededRng(seed);

    const root = path.join(__dirname, '..');
    const normalizedPath = firstExistingPath([
        path.join(root, 'imports', 'drive', 'pe_course_dataset.normalized.json'),
        String.raw`c:\Users\phili\Downloads\pe_course_dataset.normalized.json`
    ]);
    const schemaPath = firstExistingPath([
        path.join(root, 'imports', 'drive', 'pe_qcm_bank.schema.json'),
        String.raw`c:\Users\phili\Downloads\pe_qcm_bank.schema.json`
    ]);
    const baseQcmPath = path.join(root, 'src', 'data', 'qcm.json');
    const bankOutPath = path.join(root, 'src', 'data', 'pe_qcm_bank.generated.json');
    const extractedQcmOutPath = path.join(root, 'src', 'data', 'qcm.pe.extracted.generated.json');
    const mergedQcmOutPath = path.join(root, 'src', 'data', 'qcm.pe.generated.json');
    const courseOutPath = path.join(root, 'src', 'data', 'course.generated.json');

    if (!normalizedPath) throw new Error('pe_course_dataset.normalized.json introuvable');
    if (!schemaPath) throw new Error('pe_qcm_bank.schema.json introuvable');

    const normalized = readJson(normalizedPath);
    const schema = readJson(schemaPath);
    const baseQcm = readJson(baseQcmPath);

    const bank = buildMcqBankFromNormalized(normalized, { rng, variantsPerFact });
    assertBankSchema(bank, schema);
    const extractedQcm = convertBankToSiteQcm(bank);
    const mergedQcm = mergeWithBaseQcm(baseQcm, extractedQcm);
    const courseOverride = toCourseOverrideModules(normalized);

    writeJson(bankOutPath, bank);
    writeJson(extractedQcmOutPath, extractedQcm);
    writeJson(mergedQcmOutPath, mergedQcm);
    writeJson(courseOutPath, courseOverride);

    const totalExtracted = extractedQcm.categories.reduce((sum, c) => sum + (c.questions || []).length, 0);
    const totalMerged = mergedQcm.categories.reduce((sum, c) => sum + (c.questions || []).length, 0);
    console.log(`Input normalized: ${normalizedPath}`);
    console.log(`Input schema: ${schemaPath}`);
    console.log(`Generated bank: ${bankOutPath} (${bank.question_count} questions)`);
    console.log(`Generated extracted qcm: ${extractedQcmOutPath} (${totalExtracted} questions)`);
    console.log(`Generated merged qcm: ${mergedQcmOutPath} (${totalMerged} questions)`);
    console.log(`Generated course override: ${courseOutPath} (${courseOverride.modules.length} modules)`);
}

main();
