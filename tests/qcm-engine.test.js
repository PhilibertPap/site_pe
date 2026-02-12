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

const qcmDataPath = path.join(__dirname, '..', 'src', 'data', 'qcm.json');
const qcmData = readJson(qcmDataPath);
const pool = qcmEngine.buildQuestionPool(qcmData);

test('buildQuestionPool returns normalized questions', () => {
    assert.ok(pool.length > 0, 'Question pool should not be empty');
    const first = pool[0];
    assert.equal(typeof first.id, 'string');
    assert.equal(typeof first.text, 'string');
    assert.ok(Array.isArray(first.answers));
});

test('validatePool returns no schema errors', () => {
    const errors = qcmEngine.validatePool(pool);
    assert.deepEqual(errors, []);
});

test('pickQuestions can filter by module and count', () => {
    const rng = createSeededRng(42);
    const selected = qcmEngine.pickQuestions(pool, { moduleId: 1, count: 5, rng });
    assert.equal(selected.length, 5);
    selected.forEach(question => {
        assert.equal(String(question.moduleId), '1');
    });
});

test('scoreQuestions calculates score and errors coherently', () => {
    const questions = pool.slice(0, 4);
    const selectedIndexes = questions.map(question => question.answers.findIndex(answer => answer.correct));
    const result = qcmEngine.scoreQuestions(questions, selectedIndexes);
    assert.equal(result.total, 4);
    assert.equal(result.correct, 4);
    assert.equal(result.errors, 0);
    assert.equal(result.score, 100);
});
