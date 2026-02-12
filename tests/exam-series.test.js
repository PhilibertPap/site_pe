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

const qcmData = readJson(path.join(__dirname, '..', 'src', 'data', 'qcm.json'));
const pool = qcmEngine.buildQuestionPool(qcmData);

test('generateExamSeries returns requested series and length', () => {
    const series = qcmEngine.generateExamSeries(pool, {
        count: 30,
        seriesCount: 4,
        rng: createSeededRng(123)
    });
    assert.equal(series.length, 4);
    series.forEach(item => {
        assert.equal(item.questions.length, 30);
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
        count: 30,
        seriesCount: 1,
        rng: createSeededRng(1)
    });
    const dist = serie.distributionByModule;
    assert.equal(dist['2'], 1);
    assert.equal(dist['3'], 1);
    assert.equal(dist['1'], 28);
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
