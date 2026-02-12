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

function main() {
    const rootDir = path.join(__dirname, '..');
    const qcmPePath = path.join(rootDir, 'src', 'data', 'qcm.pe.generated.json');
    const qcmMergedPath = path.join(rootDir, 'src', 'data', 'qcm.drive.merged.json');
    const qcmLargePath = path.join(rootDir, 'src', 'data', 'qcm.large.generated.json');
    const qcmBasePath = path.join(rootDir, 'src', 'data', 'qcm.json');
    const qcmPath = fs.existsSync(qcmMergedPath)
        ? qcmMergedPath
        : (fs.existsSync(qcmPePath)
            ? qcmPePath
            : (fs.existsSync(qcmLargePath) ? qcmLargePath : qcmBasePath));
    const outputPath = path.join(rootDir, 'src', 'data', 'exam-series.json');

    const qcmData = readJson(qcmPath);
    const pool = qcmEngine.buildQuestionPool(qcmData);
    const validationErrors = qcmEngine.validatePool(pool);
    if (validationErrors.length) {
        console.error('QCM data invalid:');
        validationErrors.forEach(err => console.error(`- ${err}`));
        process.exit(1);
    }

    const seed = 20260212;
    const rng = createSeededRng(seed);
    const series = qcmEngine.generateExamSeries(pool, {
        count: 30,
        seriesCount: 6,
        rng
    });

    const payload = {
        generatedAt: new Date().toISOString(),
        algorithm: 'balanced_under_constraints_v1',
        seed,
        qcmSource: path.basename(qcmPath),
        totalQuestionsInPool: pool.length,
        series
    };

    writeJson(outputPath, payload);
    console.log(`Generated ${series.length} exam series in ${outputPath}`);
}

main();
