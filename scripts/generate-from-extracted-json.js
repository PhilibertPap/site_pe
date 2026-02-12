const fs = require('node:fs');
const path = require('node:path');
const qcmEngine = require('../src/js/qcm-engine.js');

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

function normalizeSpace(text) {
    return String(text || '')
        .replace(/\s+/g, ' ')
        .replace(/\u00a0/g, ' ')
        .trim();
}

function cleanConcept(text) {
    return normalizeSpace(text)
        .replace(/^[\-\u2022\d\.\)\s]+/, '')
        .replace(/^["'«]+|["'»]+$/g, '')
        .trim();
}

function cleanDefinition(text) {
    return normalizeSpace(text)
        .replace(/^[\-\u2022\s]+/, '')
        .trim();
}

function isHighQualityPair(concept, definition) {
    if (!concept || !definition) return false;
    if (concept.length < 2 || concept.length > 90) return false;
    if (definition.length < 12 || definition.length > 260) return false;
    if (/^(objectif|memo|rappel)$/i.test(concept)) return false;
    if (/^questions? de revision/i.test(concept)) return false;
    return true;
}

function isConceptLabel(text) {
    const concept = cleanConcept(text);
    if (!concept) return false;
    if (concept.length > 55) return false;
    if (/[;,.]/.test(concept)) return false;
    const words = concept.split(/\s+/).filter(Boolean);
    return words.length <= 8;
}

function extractDefinitionPairs(module) {
    const pairs = [];
    const sections = module.sections || [];

    (module.terms || []).forEach(term => {
        const concept = cleanConcept(term.term);
        const definition = cleanDefinition(term.definition);
        if (!isHighQualityPair(concept, definition)) return;
        pairs.push({
            moduleId: module.id,
            moduleName: module.name,
            sectionId: `${module.id}-TERMS`,
            sectionTitle: 'Termes et definitions',
            concept,
            definition
        });
    });

    sections.forEach(section => {
        if (/objectif/i.test(section.title || '')) return;
        (section.key_points || []).forEach(point => {
            const normalized = normalizeSpace(point);
            const m = normalized.match(/^([^:]{2,90})\s*:\s*(.+)$/);
            if (!m) return;
            const concept = cleanConcept(m[1]);
            const definition = cleanDefinition(m[2]);
            if (!isHighQualityPair(concept, definition)) return;
            pairs.push({
                moduleId: module.id,
                moduleName: module.name,
                sectionId: section.id,
                sectionTitle: section.title,
                concept,
                definition
            });
        });
    });

    const seen = new Set();
    return pairs.filter(pair => {
        const key = `${pair.moduleId}|${pair.concept.toLowerCase()}|${pair.definition.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function pickDistractors(candidates, correct, count, rng) {
    const filtered = candidates.filter(item => item && item !== correct);
    const unique = [...new Set(filtered)];
    return shuffle(unique, rng).slice(0, count);
}

function createQuestionEntry({
    id,
    moduleId,
    stem,
    choices,
    answerIndex,
    explanation,
    tags,
    sourcePages,
    sourceText
}) {
    const siteModule = moduleId === 'M14'
        ? classifyM14TargetModule(sourceText)
        : moduleNumericIdFromSource(moduleId);

    return {
        id,
        type: 'mcq_single',
        module: moduleId,
        site_module: siteModule,
        tags,
        stem,
        choices,
        answer_index: answerIndex,
        explanation,
        source_pages: sourcePages
    };
}

function generateDefinitionMcq(pair, idx, allPairs, rng) {
    const sameModuleDefinitions = allPairs
        .filter(item => item.moduleId === pair.moduleId)
        .map(item => item.definition);
    const globalDefinitions = allPairs.map(item => item.definition);
    const wrongLocal = pickDistractors(sameModuleDefinitions, pair.definition, 3, rng);
    const wrongGlobal = pickDistractors(globalDefinitions, pair.definition, 6, rng)
        .filter(item => !wrongLocal.includes(item));
    const wrong = [...wrongLocal, ...wrongGlobal].slice(0, 3);
    if (wrong.length < 3) return null;

    const choices = shuffle([pair.definition, ...wrong], rng);
    const answerIndex = choices.findIndex(choice => choice === pair.definition);

    return createQuestionEntry({
        id: `ext_${pair.moduleId}_def_${idx}`,
        moduleId: pair.moduleId,
        stem: `Que signifie "${pair.concept}" ?`,
        choices,
        answerIndex,
        explanation: `Definition issue de ${pair.moduleName} / ${pair.sectionTitle}`,
        tags: [pair.moduleId, pair.sectionId, 'definition'],
        sourcePages: [],
        sourceText: `${pair.concept} ${pair.definition}`
    });
}

function generateTermMcq(pair, idx, allPairs, rng) {
    if (!isConceptLabel(pair.concept)) return null;
    const sameModuleConcepts = allPairs
        .filter(item => item.moduleId === pair.moduleId)
        .map(item => item.concept)
        .filter(isConceptLabel);
    const globalConcepts = allPairs
        .map(item => item.concept)
        .filter(isConceptLabel);
    const wrongLocal = pickDistractors(sameModuleConcepts, pair.concept, 3, rng);
    const wrongGlobal = pickDistractors(globalConcepts, pair.concept, 6, rng)
        .filter(item => !wrongLocal.includes(item));
    const wrong = [...wrongLocal, ...wrongGlobal].slice(0, 3);
    if (wrong.length < 3) return null;

    const choices = shuffle([pair.concept, ...wrong], rng);
    const answerIndex = choices.findIndex(choice => choice === pair.concept);

    return createQuestionEntry({
        id: `ext_${pair.moduleId}_term_${idx}`,
        moduleId: pair.moduleId,
        stem: `Quel terme correspond a la definition suivante ? "${pair.definition}"`,
        choices,
        answerIndex,
        explanation: `Definition issue de ${pair.moduleName} / ${pair.sectionTitle}`,
        tags: [pair.moduleId, pair.sectionId, 'definition_inverse'],
        sourcePages: [],
        sourceText: `${pair.concept} ${pair.definition}`
    });
}

function buildNumericVariants(rawValue) {
    const value = normalizeSpace(rawValue);
    const variants = new Set();

    const decimal = value.match(/^(\d+)(?:[.,](\d+))?$/);
    if (decimal) {
        const base = Number.parseFloat(value.replace(',', '.'));
        if (Number.isFinite(base)) {
            variants.add((base + 1).toFixed(2));
            variants.add((Math.max(0, base - 1)).toFixed(2));
            variants.add((base + 0.5).toFixed(2));
        }
    }

    const shortTime = value.match(/^(\d{1,2})h(\d{2})$/i);
    if (shortTime) {
        const hours = Number(shortTime[1]);
        const mins = Number(shortTime[2]);
        variants.add(`${String((hours + 1) % 24).padStart(2, '0')}h${String(mins).padStart(2, '0')}`);
        variants.add(`${String(Math.max(0, hours - 1)).padStart(2, '0')}h${String(mins).padStart(2, '0')}`);
        variants.add(`${String(hours).padStart(2, '0')}h${String((mins + 20) % 60).padStart(2, '0')}`);
    }

    const longTime = value.match(/^(\d{1,2})h(\d{2})m(\d{2})s/i);
    if (longTime) {
        const hours = Number(longTime[1]);
        const mins = Number(longTime[2]);
        const secs = Number(longTime[3]);
        variants.add(`${String((hours + 1) % 24).padStart(2, '0')}h${String(mins).padStart(2, '0')}m${String(secs).padStart(2, '0')}s`);
        variants.add(`${String(hours).padStart(2, '0')}h${String((mins + 10) % 60).padStart(2, '0')}m${String(secs).padStart(2, '0')}s`);
        variants.add(`${String(hours).padStart(2, '0')}h${String(mins).padStart(2, '0')}m${String((secs + 20) % 60).padStart(2, '0')}s`);
    }

    return [...variants].filter(v => v !== value);
}

function labelFromAnswerKey(key) {
    return String(key || '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function generateExerciseMcq(module, exercise, answerKey, answerValue, index, rng, allDefinitions) {
    const cleanValue = normalizeSpace(answerValue);
    if (!cleanValue) return null;

    const localValues = Object.values(exercise.answers || {}).map(normalizeSpace).filter(Boolean);
    const distractors = pickDistractors([
        ...localValues,
        ...buildNumericVariants(cleanValue),
        ...allDefinitions
    ], cleanValue, 3, rng);
    if (distractors.length < 3) return null;

    const choices = shuffle([cleanValue, ...distractors], rng);
    const answerIndex = choices.findIndex(choice => choice === cleanValue);
    const answerLabel = labelFromAnswerKey(answerKey);

    return createQuestionEntry({
        id: `ext_${module.id}_ex_${index}`,
        moduleId: module.id,
        stem: `Exercice ${exercise.id}: quelle est la valeur correcte pour "${answerLabel}" ?`,
        choices,
        answerIndex,
        explanation: `Resultat issu de l'exercice ${exercise.id} (${module.name})`,
        tags: [module.id, exercise.id, 'exercise_result'],
        sourcePages: module.source?.page_range || [],
        sourceText: `${answerLabel} ${cleanValue}`
    });
}

function buildMcqBankFromNormalized(normalized, options) {
    const rng = options.rng;
    const variantsPerFact = Math.max(1, options.variantsPerFact);
    const moduleFilters = new Set((normalized.modules || []).map(m => m.id));
    const questions = [];

    const allPairs = (normalized.modules || []).flatMap(module => extractDefinitionPairs(module));
    const allDefinitions = allPairs.map(item => item.definition);
    let definitionCounter = 1;

    allPairs.forEach(pair => {
        const q1 = generateDefinitionMcq(pair, definitionCounter, allPairs, rng);
        if (q1) questions.push(q1);

        if (variantsPerFact > 1) {
            const q2 = generateTermMcq(pair, definitionCounter, allPairs, rng);
            if (q2) questions.push(q2);
        }

        definitionCounter += 1;
    });

    let exerciseCounter = 1;
    (normalized.modules || []).forEach(module => {
        (module.exercises || []).forEach(exercise => {
            Object.entries(exercise.answers || {}).forEach(([key, value]) => {
                const q = generateExerciseMcq(module, exercise, key, value, exerciseCounter, rng, allDefinitions);
                if (q) questions.push(q);
                exerciseCounter += 1;
            });
        });
    });

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
        categories: qcmEngine.sanitizeCategories(categories)
    };
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const seed = toInt(args.seed, 20260212);
    const variantsPerFact = toInt(args.variants, 2);
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
