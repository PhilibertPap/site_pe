const fs = require('fs-extra');
const path = require('path');
const mustache = require('mustache');

async function loadJSON(filePath, defaultValue = {}) {
    try {
        return await fs.readJson(filePath);
    } catch (e) {
        console.warn(`⚠️ Fichier manquant: ${filePath}, utilisant valeur par défaut`);
        return defaultValue;
    }
}

async function build() {
    try {
        console.log("🔨 Build en cours...");
        const srcDir = path.join(__dirname, 'src');
        const dataDir = path.join(srcDir, 'data');
        const templateDir = path.join(srcDir, 'templates');
        const cssDir = path.join(srcDir, 'css');
        const jsDir = path.join(srcDir, 'js');
        const outputDir = path.join(__dirname, 'public');

        console.log("📂 Chargement données...");
        const siteData = await loadJSON(path.join(dataDir, 'site.json'), { title: 'PE', modules: [], etapes: [] });
        const qcmData = await loadJSON(path.join(dataDir, 'qcm.json'), { questions: [] });
        const exercisesData = await loadJSON(path.join(dataDir, 'exercises.json'), { flashcards: [] });
        const navProblemsData = await loadJSON(path.join(dataDir, 'navigation-problems.json'), { problems: [] });
        const configData = await loadJSON(path.join(dataDir, 'app-config.json'), {});
        const modulesData = await loadJSON(path.join(dataDir, 'modules-content.json'), { modules: [] });

        console.log("📄 Chargement templates...");
        const layoutTemplate = await fs.readFile(path.join(templateDir, 'layout.mustache'), 'utf8');
        const dashboardTemplate = await fs.readFile(path.join(templateDir, 'dashboard.mustache'), 'utf8');
        const parcoursTemplate = await fs.readFile(path.join(templateDir, 'parcours.mustache'), 'utf8');
        const entrainementTemplate = await fs.readFile(path.join(templateDir, 'entrainement.mustache'), 'utf8');
        const examensTemplate = await fs.readFile(path.join(templateDir, 'examens.mustache'), 'utf8');
        const carnetTemplate = await fs.readFile(path.join(templateDir, 'carnet.mustache'), 'utf8');

        await fs.ensureDir(outputDir);

        async function generatePage(filename, template, data) {
            const content = mustache.render(template, data);
            const html = mustache.render(layoutTemplate, { content, title: data.title || 'PE' });
            await fs.writeFile(path.join(outputDir, filename), html);
            console.log(`✅ ${filename}`);
        }

        const dashboardData = { ...siteData, title: "Dashboard", globalProgress: 0, modules: siteData.modules.slice(0, 3) };
        await generatePage('index.html', dashboardTemplate, dashboardData);

        const parcoursData = { ...siteData, title: "Parcours", etapes: siteData.etapes.map(e => ({ ...e, modules: siteData.modules.filter(m => e.modules.includes(m.id)) })) };
        await generatePage('parcours.html', parcoursTemplate, parcoursData);

        const entrainementData = { title: "Entraînement", modules: siteData.modules, ...exercisesData };
        await generatePage('entrainement.html', entrainementTemplate, entrainementData);

        const examensData = { title: "Examens", modules: siteData.modules, qcmQuestionCount: qcmData.totalQuestions || 30, examHistory: [], ...configData };
        await generatePage('examens.html', examensTemplate, examensData);

        const carnetData = { title: "Carnet", modules: siteData.modules.map(m => ({ ...m, isCompleted: false, keyPoints: ['Point 1', 'Point 2'] })), completedModulesCount: 0, totalModulesCount: siteData.modules.length };
        await generatePage('carnet.html', carnetTemplate, carnetData);

        await fs.copy(cssDir, path.join(outputDir, 'css'));
        await fs.copy(jsDir, path.join(outputDir, 'js'));
        await fs.ensureDir(path.join(outputDir, 'data'));
        await fs.copy(dataDir, path.join(outputDir, 'data'));

        console.log("✅ Build OK!");
    } catch (error) {
        console.error("❌ Erreur:", error.message);
        process.exit(1);
    }
}

build();
