const fs = require('node:fs');
const path = require('node:path');
const qcmEngine = require('../src/js/qcm-engine.js');

const MODULE_CONTENT_LINKS = {
    1: [1],
    2: [2, 4],
    3: [3],
    4: [5],
    5: [6],
    6: [7],
    7: [8],
    8: [9],
    9: [10],
    10: []
};

const MODULE_FACTS_FALLBACK = {
    10: [
        'En navigation scoute, le port du gilet est obligatoire en permanence.',
        'Le cadre SUF privilegie la navigation de jour.',
        'En habitable, la limite est de 6 milles d un abri.',
        'En voile legere, la limite est de 2 milles d un abri.',
        'En habitable, la limite meteo est force 4 avec rafales 5.',
        'En voile legere, la limite meteo est force 3 avec rafales 4.',
        'La presence d un correspondant a terre est obligatoire.',
        'La securite de l equipage prime sur l objectif pedagogique.'
    ]
};

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
    if (/sources?\s+web/i.test(concept) || /sources?\s+web/i.test(definition)) return false;
    if (/^source\b/i.test(concept) || /^source\b/i.test(definition)) return false;
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
        explanation: `"${pair.concept}" se definit par: ${pair.definition}`,
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
        explanation: `La definition donnee correspond au terme: ${pair.concept}`,
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
        explanation: `En appliquant la methode de l exercice ${exercise.id}, la valeur correcte est "${cleanValue}".`,
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
        const sanitizePoint = point => {
            const text = normalizeSpace(point);
            if (!text) return null;
            if (/sources?\s+web/i.test(text)) return null;
            return text;
        };

        if (module.id === 'M14') {
            const currentSections = sections.filter(section => /(courant|flot|jusant)/i.test(JSON.stringify(section)));
            const tideSections = sections.filter(section => !currentSections.includes(section));

            const makeOverride = (id, label, pickedSections) => {
                const sectionHtml = pickedSections.map(section => {
                    const points = (section.key_points || [])
                        .map(sanitizePoint)
                        .filter(Boolean)
                        .map(point => `<li>${point}</li>`)
                        .join('');
                    return `<h5>${section.title}</h5><ul>${points}</ul>`;
                }).join('');
                const keyPoints = pickedSections
                    .flatMap(section => section.key_points || [])
                    .map(sanitizePoint)
                    .filter(Boolean)
                    .slice(0, 12);
                return {
                    id,
                    description: label,
                    objectifs: keyPoints.slice(0, 6),
                    content: sectionHtml,
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
            const points = (section.key_points || [])
                .map(sanitizePoint)
                .filter(Boolean)
                .map(point => `<li>${point}</li>`)
                .join('');
            return `<h5>${section.title}</h5><ul>${points}</ul>`;
        }).join('');

        const terms = (module.terms || []).map(t => `<li><strong>${t.term}</strong> : ${t.definition}</li>`).join('');
        const termsHtml = terms ? `<h5>Termes</h5><ul>${terms}</ul>` : '';
        const objectifsSection = sections.find(s => /objectif/i.test(s.title || ''));
        const objectifs = (objectifsSection?.key_points || [])
            .map(sanitizePoint)
            .filter(Boolean)
            .slice(0, 6);
        const keyPoints = sections
            .flatMap(section => section.key_points || [])
            .map(sanitizePoint)
            .filter(Boolean)
            .slice(0, 12);

        overrides.push({
            id: moduleId,
            description: module.name,
            objectifs: objectifs.length ? objectifs : keyPoints.slice(0, 4),
            content: `${sectionHtml}${termsHtml}`,
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

function toUniquePoints(list) {
    const seen = new Set();
    const out = [];
    (list || []).forEach(item => {
        const text = normalizeSpace(item);
        if (text.length < 8) return;
        if (/^(comprendre|connaitre|conna[iî]tre|ma[iî]triser|appliquer|identifier|reconna[iî]tre)/i.test(text)) return;
        const key = text.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push(text);
    });
    return out;
}

function countQuestionsByModule(categories) {
    return (categories || []).reduce((acc, category) => {
        const key = String(category.module);
        acc[key] = (acc[key] || 0) + ((category.questions || []).length);
        return acc;
    }, {});
}

function splitConceptDefinition(point) {
    const match = String(point).match(/^([^:]{2,90})\s*:\s*(.+)$/);
    if (!match) return null;
    return {
        concept: normalizeSpace(match[1]),
        definition: normalizeSpace(match[2])
    };
}

function cleanAnnalesStem(text) {
    return String(text || '')
        .replace(/\s*\|\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/Question\s*\d+\s*$/i, '')
        .trim();
}

function toArray(value) {
    return Array.isArray(value) ? value : (value ? [value] : []);
}

function toPublicMediaPath(mediaPath) {
    return String(mediaPath || '').replace(/\\/g, '/').trim();
}

function isUsableVisualMedia(mediaPath) {
    const normalized = toPublicMediaPath(mediaPath);
    if (!normalized) return false;
    if (/\/image1\.png$/i.test(normalized)) return false;
    return /\.(png|jpg|jpeg|webp|svg)$/i.test(normalized);
}

function inferVisualTagsFromAnnalesText(text) {
    const t = cleanAnnalesStem(text).toLowerCase();
    const tags = new Set();
    if (/(bou[ée]e|balise|cardinale|danger isol[ée]|eaux saines|marque|chenal|entr[ée]e au port|scintillement)/.test(t)) {
        tags.add('balisage');
    }
    if (/(signal sonore|dans la brume|vous entendez|entendez ce signal|prolong[ée] [àa] intervalles|deux brefs|trois brefs)/.test(t)) {
        tags.add('signal_sonore');
    }
    if (/(de nuit|apercevez les feux|feux ci-contre|signal vu en m[âa]ture|que signifient ces signaux|\bfeu\b|\bfeux\b|scintillement)/.test(t)) {
        tags.add('feux_navire');
    }
    if (/(voilier|rattrap[ée]|route de collision|privil[eé]gi[ée]|qui doit man[œo]uvrer|tribord amure|vous [êe]tes sur un voilier|bateau a est rattrap[ée])/ .test(t)) {
        tags.add('priorite');
    }
    if (/(vhf|canal|d[eé]tresse|cross|mayday)/.test(t)) {
        tags.add('vhf');
    }
    if (/(feux plac[ée]s [àa] l'entr[ée]e d'un port|trafic [àa] sens)/.test(t)) {
        tags.add('feux_port');
    }
    if (!tags.size) tags.add('generic_visual');
    return [...tags];
}

function inferFactVisualTags(moduleId, fact) {
    const split = splitConceptDefinition(fact);
    const concept = normalizeSpace(split?.concept || fact).toLowerCase();
    const detail = normalizeSpace(split?.definition || fact).toLowerCase();
    const text = `${concept} ${detail}`;
    const tags = new Set();

    if (moduleId === 1) tags.add('balisage');
    if (moduleId === 3) tags.add('priorite');

    if (/(\bfeu\b|feux|boule|m[âa]ture|mouillage|chalutier|navire|non ma[iî]tre|[ée]chou[ée])/.test(text)) {
        tags.add('feux_navire');
    }
    if (/(signal sonore|brume|coup|bref|long|man[œo]uvre trib|man[œo]uvre b[aâ]b|je tribord|je b[aâ]bord)/.test(text)) {
        tags.add('signal_sonore');
    }
    if (/(canal|vhf|cross|mayday|pan-pan)/.test(text)) {
        tags.add('vhf');
    }
    if (/(entr[ée]e au port|chenal|secteur|bou[ée]e|balise|cardinal|danger isol[ée]|eaux saines|scintillement)/.test(text)) {
        tags.add('balisage');
    }

    if (!tags.size) {
        if (moduleId === 2 || moduleId === 4) tags.add('signal_sonore');
        else if (moduleId === 1) tags.add('balisage');
        else if (moduleId === 3) tags.add('priorite');
    }
    return [...tags];
}

function inferModuleFromAnnalesText(text) {
    const t = cleanAnnalesStem(text).toLowerCase();
    if (/(brassi[eè]re|navigation scoute|limite m[eé]t[eé]o.*scout|patron d.?embarcation|abri)/.test(t)) return 10;
    if (/(vhf|canal|cross|d[eé]tresse|mayday|pan[- ]?pan|asn)/.test(t)) return 9;
    if (/(douzi[eè]me|marnage|pleine mer|basse mer|hauteur d.?eau|coefficient|sondes?)/.test(t)) return 8;
    if (/(courant|route fond|triangle des vitesses|d[eé]rive)/.test(t)) return 7;
    if (/(cap\\s*\\d+|cap plein|d[eé]clinaison|d[eé]viation|cap compas|cap vrai)/.test(t)) return 6;
    if (/(grand frais|beaufort|bulletin m[eé]t[eé]o|d[eé]pression|front|anticyclone)/.test(t)) return 5;
    if (/(carte marine|rocher|shom|r[eè]gle cras|distance sur carte|carte 9999)/.test(t)) return 4;
    if (/(signal sonore|brume|prolong[eé] [àa] intervalles|entendez ce signal|vous entendez)/.test(t)) return 2;
    if (/(privil[eé]gi|crois|rattrap|route de collision|abordage|tribord amure|vous [êe]tes sur un voilier|qui doit man[œo]uvrer)/.test(t)) return 3;
    if (/(feux|m[âa]ture|scintillement|mouillage|chalutier|navire non ma[iî]tre|navire [ée]chou[ée])/i.test(t)) return 2;
    if (/(bou[ée]e|balise|chenal|cardinale|marque|entrant au port)/.test(t)) return 1;
    return 1;
}

function buildAnnalesImagePools(annalesRaw) {
    const pools = new Map();
    (annalesRaw.questions || []).forEach(question => {
        const moduleId = inferModuleFromAnnalesText(question.text);
        if (![1, 2, 3].includes(moduleId)) return;
        const media = toArray(question.mediaAssets)
            .map(toPublicMediaPath)
            .filter(isUsableVisualMedia);
        if (!media.length) return;
        if (!pools.has(moduleId)) pools.set(moduleId, []);
        const arr = pools.get(moduleId);
        const stemText = cleanAnnalesStem(question.text).toLowerCase();
        const tags = inferVisualTagsFromAnnalesText(question.text);
        media.forEach(path => {
            if (!arr.some(item => item.path === path)) {
                arr.push({ path, stemText, tags });
            }
        });
    });
    return pools;
}

function resolveModulePoints(module, modulesContentById) {
    const moduleId = Number(module.id);
    const sourceIds = MODULE_CONTENT_LINKS[moduleId] || [moduleId];
    const keyPoints = sourceIds.flatMap(sourceId => {
        const sourceModule = modulesContentById.get(Number(sourceId));
        return sourceModule ? (sourceModule.keyPoints || []) : [];
    });
    const fallbackObjectives = module.objectifs || [];
    const fallbackFacts = MODULE_FACTS_FALLBACK[moduleId] || [];
    return toUniquePoints([...keyPoints, ...fallbackFacts, ...fallbackObjectives]);
}

function getStemTemplates(moduleId, moduleName) {
    const templates = {
        1: [
            { text: 'En entrant au port,', visual: true },
            { text: 'Que signifie cette marque ?', visual: true },
            { text: 'Que dois-je faire en apercevant cette marque ?', visual: true },
            { text: 'Pour entrer au port en évitant les écueils, il faut naviguer :', visual: true },
            { text: 'Ces petites bouées jaunes rapprochées indiquent :', visual: true },
            { text: 'A propos de "{concept}", quelle affirmation est exacte ?', visual: false }
        ],
        2: [
            { text: 'En observant la situation ci-contre, quelle affirmation est exacte ?', visual: true, visualTags: ['feux_navire', 'signal_sonore'] },
            { text: 'De nuit, en observant les feux visibles, quelle affirmation est exacte ?', visual: true, visualTags: ['feux_navire'] },
            { text: 'Dans la brume, ce signal sonore correspond a :', visual: true, visualTags: ['signal_sonore'] },
            { text: 'Que signifie le signal montre sur l image ?', visual: true, visualTags: ['feux_navire', 'signal_sonore', 'feux_port'] },
            { text: 'A propos de "{concept}", quelle affirmation est exacte ?', visual: false }
        ],
        3: [
            { text: 'Dans la situation ci-contre, quelle regle de priorite s applique ?', visual: true, visualTags: ['priorite'] },
            { text: 'A partir de la situation illustree, quelle manœuvre est correcte ?', visual: true, visualTags: ['priorite'] },
            { text: 'En croisement, quelle priorité est exacte ?', visual: false },
            { text: 'A propos de "{concept}", quelle regle est exacte ?', visual: false }
        ],
        4: [
            { text: 'Sur une carte marine, quelle proposition est exacte ?', visual: false },
            { text: 'Avec la regle Cras, quelle methode est correcte ?', visual: false },
            { text: 'A propos de "{concept}", quelle interpretation est juste ?', visual: false }
        ],
        5: [
            { text: 'Le bulletin météo annonce un avis de grand frais. Quelle force de vent correspond ?', visual: false },
            { text: 'Avant appareillage, quelle interprétation météo est correcte ?', visual: false },
            { text: 'A propos de "{concept}", quelle affirmation meteo est exacte ?', visual: false }
        ],
        6: [
            { text: 'Pour convertir un cap compas en cap vrai, quelle relation est correcte ?', visual: false },
            { text: 'En navigation estimée, quelle proposition est exacte ?', visual: false },
            { text: 'A propos de "{concept}", quelle relation de cap est correcte ?', visual: false }
        ],
        7: [
            { text: 'Pour calculer la route fond, quelle relation est correcte ?', visual: false },
            { text: 'Dans le triangle des vitesses, quelle proposition est exacte ?', visual: false },
            { text: 'A propos de "{concept}", quelle affirmation est exacte ?', visual: false }
        ],
        8: [
            { text: 'Pour estimer la hauteur d’eau à une heure donnée, quelle méthode est correcte ?', visual: false },
            { text: 'Concernant la règle des douzièmes, quelle réponse est exacte ?', visual: false },
            { text: 'A propos de "{concept}", quelle relation est juste ?', visual: false }
        ],
        9: [
            { text: 'À la VHF, quel canal permet de signaler une détresse ?', visual: false },
            { text: 'Pour un message radio de détresse, quelle procédure est correcte ?', visual: false },
            { text: 'A propos de "{concept}", quelle procedure radio est correcte ?', visual: false }
        ],
        10: [
            { text: 'Lors d’une navigation scoute, le port de la brassière est obligatoire :', visual: false },
            { text: 'Pour une navigation scoute, quelle limite est correcte ?', visual: false },
            { text: 'A propos de "{concept}", quelle regle de securite s applique ?', visual: false }
        ]
    };
    return templates[moduleId] || [
        { text: `Dans le module ${moduleName}, quelle proposition est exacte ?`, visual: false },
        { text: 'A propos de "{concept}", quelle est la reponse correcte ?', visual: false }
    ];
}

function factToStatement(fact) {
    const text = normalizeSpace(fact);
    const split = splitConceptDefinition(text);
    if (split) {
        return `${split.concept} : ${split.definition}`.replace(/\s+/g, ' ').trim();
    }
    return text.endsWith('.') ? text : `${text}.`;
}

function buildDetailedExplanation(module, fact, correctStatement, isVisual) {
    const split = splitConceptDefinition(fact);
    const reminder = split
        ? `Rappel: ${split.concept} signifie ${split.definition}.`
        : `Rappel de cours: ${correctStatement}`;
    const intro = isVisual
        ? 'La situation illustrée doit être identifiée avant d appliquer la règle réglementaire.'
        : 'La réponse correcte applique directement la règle de cours.';
    return `${intro} ${reminder} Les autres propositions modifient un élément clé et deviennent réglementairement fausses.`;
}

function renderStem(templateText, fact) {
    const split = splitConceptDefinition(fact);
    const concept = split?.concept || cleanConcept(fact);
    return String(templateText || '').replace('{concept}', concept);
}

function pickImageForFact(module, fact, variantIndex, imagePools) {
    const entries = imagePools.get(Number(module.id)) || [];
    if (!entries.length) return null;

    const split = splitConceptDefinition(fact);
    const concept = (split?.concept || cleanConcept(fact)).toLowerCase();
    const conceptWords = concept.split(/[^a-z0-9àâäéèêëîïôöùûüç]+/i).filter(word => word.length >= 4);
    const factTags = inferFactVisualTags(Number(module.id), fact);
    const wantedTags = [...new Set(factTags)];

    const scored = entries.map(entry => {
        let score = 0;
        const imageTags = entry.tags || [];
        const sharedTagCount = wantedTags.filter(tag => imageTags.includes(tag)).length;
        score += sharedTagCount * 8;
        const conceptHitCount = conceptWords.filter(word => entry.stemText.includes(word)).length;
        score += conceptHitCount * 3;
        if (imageTags.includes('generic_visual')) score += 1;
        return { entry, score };
    }).sort((a, b) => b.score - a.score);

    if (!scored.length || scored[0].score < 8) return null;
    const bestScore = scored[0].score;
    const best = scored.filter(item => item.score === bestScore).map(item => item.entry);
    return best[variantIndex % best.length]?.path || null;
}

function buildPedagogicalQuestion(
    module,
    fact,
    variantIndex,
    localPool,
    globalPool,
    rng,
    questionId,
    imagePools
) {
    const answerIds = ['a', 'b', 'c', 'd', 'e'];

    const wrongLocal = pickDistractors(localPool, fact, 2, rng);
    const wrongGlobal = pickDistractors(
        globalPool.filter(item => !wrongLocal.includes(item)),
        fact,
        4,
        rng
    );
    const wrong = [...wrongLocal, ...wrongGlobal].slice(0, 3);
    if (wrong.length < 3) return null;

    const correctStatement = factToStatement(fact);
    const wrongStatements = wrong.map(factToStatement);
    const choices = shuffle([correctStatement, ...wrongStatements], rng);
    const answerIndex = choices.findIndex(choice => choice === correctStatement);
    const defaultStems = getStemTemplates(Number(module.id), module.name);
    const factVisualTags = inferFactVisualTags(Number(module.id), fact);
    const stems = defaultStems;
    const nonVisualFallback = stems.find(item => !item.visual) || stems[0];
    const visualCandidates = stems.filter(item => item.visual);
    const scoredVisuals = visualCandidates
        .map(item => {
            const tags = item.visualTags || [];
            const shared = factVisualTags.filter(tag => tags.includes(tag)).length;
            return { item, score: shared };
        })
        .sort((a, b) => b.score - a.score);
    const preferred = scoredVisuals.length && scoredVisuals[0].score > 0
        ? scoredVisuals[variantIndex % Math.max(1, scoredVisuals.filter(x => x.score === scoredVisuals[0].score).length)].item
        : stems[variantIndex % stems.length];
    let selected = preferred;
    let image = null;
    if (factVisualTags.includes('vhf')) {
        selected = nonVisualFallback;
    } else if (preferred.visual) {
        image = pickImageForFact(module, fact, variantIndex, imagePools);
        if (!image) selected = nonVisualFallback;
    }
    const questionText = renderStem(selected.text, fact);

    return {
        id: questionId,
        text: questionText,
        image,
        answers: choices.map((choice, idx) => ({
            id: answerIds[idx] || String(idx),
            text: choice,
            correct: idx === answerIndex
        })),
        difficulty: 2,
        explanation: buildDetailedExplanation(module, fact, correctStatement, Boolean(image)),
        tags: [`module_${module.id}`, 'pedagogical_quality']
    };
}

function buildTheoryCoverageCategories(modulesContent, siteData, existingCounts, rng, annalesRaw) {
    const modulesContentById = new Map((modulesContent.modules || []).map(m => [Number(m.id), m]));
    const imagePools = buildAnnalesImagePools(annalesRaw);
    const modules = (siteData.modules || []).map(module => ({
        ...module,
        facts: resolveModulePoints(module, modulesContentById)
    }));

    const globalFacts = modules.flatMap(module => module.facts || []);

    const categories = [];
    modules.forEach(module => {
        const moduleId = Number(module.id);
        const currentCount = existingCounts[String(moduleId)] || 0;
        const targetCount = 20;
        const needed = Math.max(0, targetCount - currentCount);
        if (needed <= 0) return;

        const localFacts = toUniquePoints(module.facts || []);
        if (!localFacts.length) return;
        const questions = [];
        const signatures = new Set();
        let cursor = 0;
        let guard = 0;

        while (questions.length < needed && guard < needed * 12) {
            const fact = localFacts[cursor % localFacts.length];
            const variantIndex = Math.floor(cursor / localFacts.length);
            const questionId = `pedago_${moduleId}_${questions.length + 1}`;
            const question = buildPedagogicalQuestion(
                module,
                fact,
                variantIndex,
                localFacts,
                globalFacts.filter(item => !localFacts.includes(item)),
                rng,
                questionId,
                imagePools
            );
            cursor += 1;
            guard += 1;
            if (!question) continue;

            const correct = question.answers.find(answer => answer.correct)?.text || '';
            const signature = `${question.text}|${correct}`;
            if (signatures.has(signature)) continue;
            signatures.add(signature);
            questions.push(question);
        }

        if (!questions.length) return;
        categories.push({
            id: `pedago_module_${moduleId}`,
            name: `Banque pedagogique module ${module.moduleNumber}`,
            description: `Questions formulees pour le style examen PE/permis bateau (module ${module.moduleNumber})`,
            module: moduleId,
            questions
        });
    });

    return categories;
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
    const modulesContentPath = path.join(root, 'src', 'data', 'modules-content.json');
    const sitePath = path.join(root, 'src', 'data', 'site.json');
    const annalesRawPath = path.join(root, 'imports', 'drive', 'annales', 'annales.qcm.2022.raw.json');
    const bankOutPath = path.join(root, 'src', 'data', 'pe_qcm_bank.generated.json');
    const extractedQcmOutPath = path.join(root, 'src', 'data', 'qcm.pe.extracted.generated.json');
    const mergedQcmOutPath = path.join(root, 'src', 'data', 'qcm.pe.generated.json');
    const courseOutPath = path.join(root, 'src', 'data', 'course.generated.json');

    if (!normalizedPath) throw new Error('pe_course_dataset.normalized.json introuvable');
    if (!schemaPath) throw new Error('pe_qcm_bank.schema.json introuvable');

    const normalized = readJson(normalizedPath);
    const schema = readJson(schemaPath);
    const baseQcm = readJson(baseQcmPath);
    const modulesContent = readJson(modulesContentPath);
    const siteData = readJson(sitePath);
    const annalesRaw = fs.existsSync(annalesRawPath)
        ? readJson(annalesRawPath)
        : { questions: [] };

    const bank = buildMcqBankFromNormalized(normalized, { rng, variantsPerFact });
    assertBankSchema(bank, schema);
    const extractedQcm = convertBankToSiteQcm(bank);
    const mergedBaseQcm = mergeWithBaseQcm(baseQcm, extractedQcm);
    const existingCounts = countQuestionsByModule(mergedBaseQcm.categories);
    const theoryCoverageCategories = buildTheoryCoverageCategories(
        modulesContent,
        siteData,
        existingCounts,
        rng,
        annalesRaw
    );
    const mergedQcm = {
        ...mergedBaseQcm,
        source: {
            ...mergedBaseQcm.source,
            theoryCoverage: 'modules-content.json'
        },
        categories: qcmEngine.sanitizeCategories([
            ...(mergedBaseQcm.categories || []),
            ...theoryCoverageCategories
        ])
    };
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
    console.log(`Added theory coverage categories: ${theoryCoverageCategories.length}`);
    console.log(`Generated course override: ${courseOutPath} (${courseOverride.modules.length} modules)`);
}

main();
