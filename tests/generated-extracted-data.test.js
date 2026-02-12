const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function hasFile(filePath) {
    return fs.existsSync(filePath);
}

const root = path.join(__dirname, '..');
const schemaPath = path.join(root, 'imports', 'drive', 'pe_qcm_bank.schema.json');
const bankPath = path.join(root, 'src', 'data', 'pe_qcm_bank.generated.json');
const mergedQcmPath = path.join(root, 'src', 'data', 'qcm.pe.generated.json');
const coursePath = path.join(root, 'src', 'data', 'course.generated.json');

if (hasFile(schemaPath) && hasFile(bankPath)) {
    test('generated extracted bank matches required fields', () => {
        const schema = readJson(schemaPath);
        const bank = readJson(bankPath);
        const requiredByType = new Map((schema.question_types || []).map(entry => [entry.type, entry.fields || []]));
        (bank.questions || []).forEach(question => {
            const required = requiredByType.get(question.type);
            assert.ok(required, `Unknown type: ${question.type}`);
            required.forEach(field => assert.ok(field in question, `Missing ${field} in ${question.id}`));
        });
    });
} else {
    test('generated extracted bank matches required fields', { skip: 'Generated bank not present' }, () => {});
}

if (hasFile(mergedQcmPath)) {
    test('merged PE QCM is usable by app format', () => {
        const qcm = readJson(mergedQcmPath);
        const qcmEngine = require('../src/js/qcm-engine.js');
        const weakStemPatterns = [
            /quelle affirmation est correcte/i,
            /question de revision/i
        ];
        assert.ok(Array.isArray(qcm.categories));
        assert.ok(qcm.categories.length > 0);
        qcm.categories.forEach(category => {
            assert.ok(Array.isArray(category.questions), `Category ${category.id} missing questions`);
            category.questions.forEach(question => {
                assert.equal(typeof question.text, 'string');
                assert.ok(question.text.trim().length >= 8, `Question too short: ${question.id}`);
                weakStemPatterns.forEach(pattern => {
                    assert.ok(!pattern.test(question.text), `Weak stem detected: ${question.id}`);
                });
                assert.ok(Array.isArray(question.answers), `Question ${question.id} missing answers`);
                question.answers.forEach(answer => {
                    assert.equal(typeof answer.text, 'string');
                    assert.ok(answer.text.trim().length >= 2, `Answer too short in ${question.id}`);
                });
                const correctCount = question.answers.filter(answer => answer.correct === true).length;
                assert.equal(correctCount, 1, `Question ${question.id} should have exactly one correct answer`);
                if (qcmEngine.questionNeedsImage(question.text)) {
                    assert.ok(Boolean(question.image), `Visual question without image: ${question.id}`);
                }
            });
        });
    });
} else {
    test('merged PE QCM is usable by app format', { skip: 'Merged qcm not present' }, () => {});
}

if (hasFile(coursePath)) {
    test('course override has module entries with content', () => {
        const course = readJson(coursePath);
        assert.ok(Array.isArray(course.modules));
        assert.ok(course.modules.length > 0);
        course.modules.forEach(module => {
            assert.ok(module.id, 'Missing module.id');
            assert.equal(typeof module.content, 'string');
            assert.ok(module.content.length > 20, `Module ${module.id} content too short`);
        });
    });
} else {
    test('course override has module entries with content', { skip: 'Course override not present' }, () => {});
}
