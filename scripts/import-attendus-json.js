const fs = require('node:fs');
const path = require('node:path');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function normalizeImportedCategories(importedCategories) {
    return importedCategories.map((category, categoryIndex) => {
        const questions = (category.questions || []).map((question, questionIndex) => {
            const answers = (question.answers || []).map((answer, answerIndex) => ({
                id: answer.id || String.fromCharCode(97 + answerIndex),
                text: answer.text || '',
                correct: Boolean(answer.correct)
            }));
            return {
                id: question.id || `imp_${categoryIndex + 1}_${questionIndex + 1}`,
                text: question.text || '',
                image: question.image || null,
                answers,
                difficulty: question.difficulty || 2
            };
        });
        return {
            id: category.id || `import_${categoryIndex + 1}`,
            name: category.name || `Import ${categoryIndex + 1}`,
            description: category.description || 'Import Drive',
            module: Number.isFinite(Number(category.module)) ? Number(category.module) : 1,
            questions
        };
    });
}

function main() {
    const root = path.join(__dirname, '..');
    const inputPath = path.join(root, 'imports', 'drive', 'attendus-pe.json');
    const basePath = path.join(root, 'src', 'data', 'qcm.json');
    const outputPath = path.join(root, 'src', 'data', 'qcm.drive.merged.json');

    if (!fs.existsSync(inputPath)) {
        console.error(`Input not found: ${inputPath}`);
        process.exit(1);
    }

    const base = readJson(basePath);
    const imported = readJson(inputPath);
    const importedCategories = normalizeImportedCategories(imported.categories || []);

    const merged = {
        generatedAt: new Date().toISOString(),
        source: {
            base: 'qcm.json',
            imported: 'imports/drive/attendus-pe.json'
        },
        categories: [...base.categories, ...importedCategories]
    };

    writeJson(outputPath, merged);
    console.log(`Merged QCM file written to ${outputPath}`);
    console.log(`Imported categories: ${importedCategories.length}`);
}

main();
