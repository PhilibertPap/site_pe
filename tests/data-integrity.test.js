const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readJson(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
}

const dataDir = path.join(__dirname, '..', 'src', 'data');
const site = readJson(path.join(dataDir, 'site.json'));
const qcm = readJson(path.join(dataDir, 'qcm.json'));
const exercises = readJson(path.join(dataDir, 'exercises.json'));
const sessions = readJson(path.join(dataDir, 'training-sessions.json'));

test('site modules and steps are coherent', () => {
    const moduleIds = new Set(site.modules.map(module => module.id));
    site.etapes.forEach(step => {
        step.modules.forEach(moduleId => {
            assert.ok(moduleIds.has(moduleId), `Missing module ${moduleId} in site.modules`);
        });
    });
});

test('qcm categories point to known modules', () => {
    const moduleIds = new Set(site.modules.map(module => String(module.id)));
    qcm.categories.forEach(category => {
        assert.ok(moduleIds.has(String(category.module)), `Unknown module for category ${category.id}`);
        assert.ok(Array.isArray(category.questions), `Category ${category.id} must have questions[]`);
        assert.ok(category.questions.length > 0, `Category ${category.id} must not be empty`);
    });
});

test('each qcm question has at least two answers and exactly one correct', () => {
    qcm.categories.forEach(category => {
        category.questions.forEach(question => {
            assert.ok(Array.isArray(question.answers), `Question ${question.id} must have answers[]`);
            assert.ok(question.answers.length >= 2, `Question ${question.id} has too few answers`);
            const correctCount = question.answers.filter(answer => answer.correct === true).length;
            assert.equal(correctCount, 1, `Question ${question.id} must have exactly one correct answer`);
        });
    });
});

test('flashcards point to known modules', () => {
    const moduleIds = new Set(site.modules.map(module => String(module.id)));
    exercises.flashcards.forEach(card => {
        assert.ok(moduleIds.has(String(card.moduleId)), `Flashcard ${card.id} has unknown module`);
    });
});

test('training sessions file is valid and non-empty', () => {
    assert.ok(Array.isArray(sessions.trainingSessions), 'trainingSessions must be an array');
    assert.ok(sessions.trainingSessions.length > 0, 'trainingSessions must not be empty');
    sessions.trainingSessions.forEach(session => {
        assert.ok(session.id, 'session.id is required');
        assert.ok(session.name, `session ${session.id} needs name`);
    });
});
