const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const qcmEngine = require('../src/js/qcm-engine.js');

function readJson(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
}

function createSeededRng(seed) {
    let value = seed >>> 0;
    return function seededRandom() {
        value = (1664525 * value + 1013904223) % 4294967296;
        return value / 4294967296;
    };
}

const root = path.join(__dirname, '..');
const generatedPath = path.join(root, 'src', 'data', 'qcm.pe.generated.json');
const fallbackPath = path.join(root, 'src', 'data', 'qcm.json');
const qcmPath = fs.existsSync(generatedPath) ? generatedPath : fallbackPath;
const qcmData = readJson(qcmPath);
const pool = qcmEngine.buildQuestionPool(qcmData);
const requestedCount = 30;
const effectiveCount = Math.min(requestedCount, pool.length);

test('generateExamSeries returns requested series and length', () => {
    const series = qcmEngine.generateExamSeries(pool, {
        count: requestedCount,
        seriesCount: 4,
        rng: createSeededRng(123)
    });
    assert.equal(series.length, 4);
    series.forEach(item => {
        assert.equal(item.questions.length, effectiveCount);
    });
});

test('no duplicate question inside a generated series', () => {
    const [first] = qcmEngine.generateExamSeries(pool, {
        count: 30,
        seriesCount: 1,
        rng: createSeededRng(99)
    });
    const ids = first.questions.map(question => question.id);
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length);
});

test('balanced generator includes scarce modules when available', () => {
    const [serie] = qcmEngine.generateExamSeries(pool, {
        count: requestedCount,
        seriesCount: 1,
        rng: createSeededRng(1)
    });
    const dist = serie.distributionByModule;
    const modulesInPool = [...new Set(pool.map(question => String(question.moduleId)))];
    if (effectiveCount >= modulesInPool.length) {
        modulesInPool.forEach(moduleId => {
            assert.ok((dist[moduleId] || 0) >= 1, `module ${moduleId} should be represented`);
        });
    }
});

test('generator is deterministic with the same seed', () => {
    const a = qcmEngine.generateExamSeries(pool, {
        count: 30,
        seriesCount: 2,
        rng: createSeededRng(777)
    });
    const b = qcmEngine.generateExamSeries(pool, {
        count: 30,
        seriesCount: 2,
        rng: createSeededRng(777)
    });
    assert.deepEqual(
        a.map(serie => serie.questionIds),
        b.map(serie => serie.questionIds)
    );
});
