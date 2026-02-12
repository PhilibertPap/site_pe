(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.QcmEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    const VISUAL_PATTERNS = [
        /cette marque/i,
        /ce bateau/i,
        /ce navire/i,
        /ce balisage/i,
        /cette bou[eé]e/i,
        /ces bou[eé]es/i,
        /que signifie ce panneau/i,
        /quelle est la balise/i,
        /dans cette situation/i,
        /route\s*[ab]/i,
        /ce(?:s)? feux/i,
        /sur le navire\s*[ab]/i,
        /vous [eê]tes sur le navire\s*[ab]/i,
        /quelle route suivez[- ]vous/i,
        /quel est votre sens de navigation/i,
        /quelle est la balise qui montre ces feux/i,
        /vous voyez cette bou[eé]e/i,
        /vous voyez ces/i,
        /cap au\s*\d+/i,
        /sur l[’']image/i,
        /ci-contre/i
    ];

    function shuffle(items, rng) {
        const random = typeof rng === 'function' ? rng : Math.random;
        const arr = [...items];
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = Math.floor(random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function normalizeQuestion(raw, category) {
        return {
            id: `${category.id}:${raw.id}`,
            sourceId: raw.id,
            categoryId: category.id,
            categoryName: category.name,
            moduleId: category.module,
            text: raw.text || raw.question || '',
            image: raw.image || null,
            difficulty: raw.difficulty || 1,
            answers: (raw.answers || raw.options || []).map((answer, index) => ({
                id: answer.id || String(index),
                text: answer.text || '',
                correct: Boolean(answer.correct)
            })),
            explanation: raw.explanation || '',
            tags: raw.tags || []
        };
    }

    function questionNeedsImage(questionText) {
        const text = String(questionText || '');
        return VISUAL_PATTERNS.some(pattern => pattern.test(text));
    }

    function hasExactlyOneCorrectAnswer(question) {
        const answers = Array.isArray(question.answers) ? question.answers : [];
        const correctCount = answers.filter(answer => answer.correct === true).length;
        return correctCount === 1;
    }

    function isQuestionUsable(question) {
        if (!question || typeof question.text !== 'string' || question.text.trim().length < 8) return false;
        if (!Array.isArray(question.answers) || question.answers.length < 2) return false;
        if (!hasExactlyOneCorrectAnswer(question)) return false;
        if (questionNeedsImage(question.text) && !question.image) return false;
        return true;
    }

    function sanitizeQuestions(questions) {
        return (questions || []).filter(isQuestionUsable);
    }

    function sanitizeCategories(categories) {
        return (categories || []).map(category => ({
            ...category,
            questions: sanitizeQuestions(category.questions || [])
        })).filter(category => (category.questions || []).length > 0);
    }

    function buildQuestionPool(qcmData) {
        if (!qcmData || !Array.isArray(qcmData.categories)) return [];
        const categories = sanitizeCategories(qcmData.categories);
        return categories.flatMap(category => {
            const questions = Array.isArray(category.questions) ? category.questions : [];
            return questions.map(question => normalizeQuestion(question, category));
        });
    }

    function filterQuestions(pool, options) {
        const cfg = options || {};
        let questions = [...pool];
        if (cfg.moduleId != null && cfg.moduleId !== '') {
            questions = questions.filter(question => String(question.moduleId) === String(cfg.moduleId));
        }
        if (cfg.categoryId) {
            questions = questions.filter(question => question.categoryId === cfg.categoryId);
        }
        return questions;
    }

    function pickQuestions(pool, options) {
        const cfg = options || {};
        const filtered = filterQuestions(pool, cfg);
        const randomized = shuffle(filtered, cfg.rng);
        const count = Math.max(1, cfg.count || 30);
        return randomized.slice(0, Math.min(count, randomized.length));
    }

    function pickBalancedQuestions(pool, options) {
        const cfg = options || {};
        const count = Math.max(1, cfg.count || 30);
        const filtered = filterQuestions(pool, cfg);
        if (!filtered.length) return [];

        const byModule = new Map();
        filtered.forEach(question => {
            const key = String(question.moduleId);
            if (!byModule.has(key)) byModule.set(key, []);
            byModule.get(key).push(question);
        });

        const modules = [...byModule.keys()].sort((a, b) => Number(a) - Number(b));
        const random = typeof cfg.rng === 'function' ? cfg.rng : Math.random;
        modules.forEach(moduleId => {
            byModule.set(moduleId, shuffle(byModule.get(moduleId), random));
        });

        const totalAvailable = filtered.length;
        const effectiveCount = Math.min(count, totalAvailable);
        const base = Math.floor(effectiveCount / modules.length);
        const remainder = effectiveCount % modules.length;

        const quotas = new Map();
        let allocated = 0;
        modules.forEach((moduleId, index) => {
            const available = byModule.get(moduleId).length;
            const target = base + (index < remainder ? 1 : 0);
            const quota = Math.min(target, available);
            quotas.set(moduleId, quota);
            allocated += quota;
        });

        let leftover = effectiveCount - allocated;
        while (leftover > 0) {
            let progressed = false;
            const order = [...modules].sort((a, b) => {
                const remA = byModule.get(a).length - quotas.get(a);
                const remB = byModule.get(b).length - quotas.get(b);
                if (remA === remB) return Number(a) - Number(b);
                return remB - remA;
            });

            for (const moduleId of order) {
                const quota = quotas.get(moduleId);
                const available = byModule.get(moduleId).length;
                if (quota < available) {
                    quotas.set(moduleId, quota + 1);
                    leftover -= 1;
                    progressed = true;
                    if (leftover === 0) break;
                }
            }
            if (!progressed) break;
        }

        const selected = [];
        modules.forEach(moduleId => {
            const quota = quotas.get(moduleId);
            const questions = byModule.get(moduleId).slice(0, quota);
            selected.push(...questions);
        });

        return shuffle(selected, random);
    }

    function getDistributionByModule(questions) {
        return questions.reduce((acc, question) => {
            const key = String(question.moduleId);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }

    function generateExamSeries(pool, options) {
        const cfg = options || {};
        const count = Math.max(1, cfg.count || 30);
        const seriesCount = Math.max(1, cfg.seriesCount || 6);
        const random = typeof cfg.rng === 'function' ? cfg.rng : Math.random;
        const series = [];

        for (let i = 0; i < seriesCount; i += 1) {
            const questions = pickBalancedQuestions(pool, {
                count,
                moduleId: cfg.moduleId,
                categoryId: cfg.categoryId,
                rng: random
            });
            series.push({
                id: i + 1,
                name: `Serie ${i + 1}`,
                questionIds: questions.map(question => question.id),
                questions,
                distributionByModule: getDistributionByModule(questions)
            });
        }

        return series;
    }

    function scoreQuestions(questions, selectedIndexes) {
        const selections = selectedIndexes || [];
        const total = questions.length;
        if (total === 0) {
            return { total: 0, correct: 0, errors: 0, score: 0 };
        }

        let correct = 0;
        let errors = 0;
        questions.forEach((question, index) => {
            const selected = selections[index];
            const correctIndex = question.answers.findIndex(answer => answer.correct);
            if (selected === correctIndex) correct += 1;
            else errors += 1;
        });

        return {
            total,
            correct,
            errors,
            score: Math.round((correct / total) * 100)
        };
    }

    function validatePool(pool) {
        const errors = [];
        const ids = new Set();

        pool.forEach(question => {
            if (!question.text) errors.push(`Question sans texte: ${question.id}`);
            if (ids.has(question.id)) errors.push(`Question dupliquee: ${question.id}`);
            ids.add(question.id);
            if (!Array.isArray(question.answers) || question.answers.length < 2) {
                errors.push(`Question sans reponses valides: ${question.id}`);
                return;
            }
            const correctCount = question.answers.filter(answer => answer.correct).length;
            if (correctCount !== 1) {
                errors.push(`Question avec ${correctCount} bonne(s) reponse(s): ${question.id}`);
            }
            if (questionNeedsImage(question.text) && !question.image) {
                errors.push(`Question visuelle sans image: ${question.id}`);
            }
        });

        return errors;
    }

    return {
        buildQuestionPool,
        questionNeedsImage,
        isQuestionUsable,
        sanitizeQuestions,
        sanitizeCategories,
        pickQuestions,
        pickBalancedQuestions,
        getDistributionByModule,
        generateExamSeries,
        scoreQuestions,
        validatePool
    };
}));
