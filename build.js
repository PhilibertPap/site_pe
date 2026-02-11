const fs = require('fs-extra');
const path = require('path');
const mustache = require('mustache');

async function build() {
  try {
    console.log("🔨 Build en cours...");
    
    // Chemins
    const srcDir = path.join(__dirname, 'src');
    const templateDir = path.join(srcDir, 'templates');
    const dataDir = path.join(srcDir, 'data');
    const cssDir = path.join(srcDir, 'css');
    const jsDir = path.join(srcDir, 'js');
    const outputDir = path.join(__dirname, 'public');

    // Charger les données
    const siteData = await fs.readJson(path.join(dataDir, 'site.json'));
    const qcmData = await fs.readJson(path.join(dataDir, 'qcm.json'));
    const exercisesData = await fs.readJson(path.join(dataDir, 'exercises.json'));
    const navProblemsData = await fs.readJson(path.join(dataDir, 'navigation-problems.json'));
    const configData = await fs.readJson(path.join(dataDir, 'app-config.json'));
    const modulesData = await fs.readJson(path.join(dataDir, 'modules-content.json'));

    // Charger les templates
    const layoutTemplate = await fs.readFile(path.join(templateDir, 'layout.mustache'), 'utf8');
    const dashboardTemplate = await fs.readFile(path.join(templateDir, 'dashboard.mustache'), 'utf8');
    const parcoursTemplate = await fs.readFile(path.join(templateDir, 'parcours.mustache'), 'utf8');
    const entrainementTemplate = await fs.readFile(path.join(templateDir, 'entrainement.mustache'), 'utf8');
    const examensTemplate = await fs.readFile(path.join(templateDir, 'examens.mustache'), 'utf8');
    const carnetTemplate = await fs.readFile(path.join(templateDir, 'carnet.mustache'), 'utf8');

    // Créer dossier output
    await fs.ensureDir(outputDir);

    // Fonction helper pour générer une page
    async function generatePage(filename, template, data) {
      const content = mustache.render(template, data);
      const html = mustache.render(layoutTemplate, { 
        content: content,
        title: data.title || 'Patron d\'Embarcation'
      });
      await fs.writeFile(path.join(outputDir, filename), html);
      console.log(`✅ ${filename} généré`);
    }

    // 1. DASHBOARD (Index)
    const dashboardData = {
      ...siteData,
      title: "Dashboard",
      globalProgress: 0,
      modules: siteData.modules.slice(0, 3) // Afficher 3 modules en aperçu
    };
    await generatePage('index.html', dashboardTemplate, dashboardData);

    // 2. PARCOURS
    const parcoursData = {
      ...siteData,
      title: "Parcours d'apprentissage",
      etapes: siteData.etapes.map(etape => ({
        ...etape,
        modules: siteData.modules.filter(m => etape.modules.includes(m.id))
      }))
    };
    await generatePage('parcours.html', parcoursTemplate, parcoursData);

    // 3. ENTRAINEMENT
    const entrainementData = {
      title: "Espace d'entraînement",
      modules: siteData.modules,
      ...exercisesData
    };
    await generatePage('entrainement.html', entrainementTemplate, entrainementData);

    // 4. EXAMENS
    const examensData = {
      title: "Pont d'examen",
      modules: siteData.modules,
      qcmQuestionCount: qcmData.totalQuestions,
      examHistory: [],
      ...configData
    };
    await generatePage('examens.html', examensTemplate, examensData);

    // 5. CARNET
    const carnetData = {
      title: "Carnet de bord pratique",
      modules: siteData.modules.map(m => ({
        ...m,
        isCompleted: false,
        keyPoints: ["Point clé 1", "Point clé 2", "Point clé 3"]
      })),
      completedModulesCount: 0,
      totalModulesCount: siteData.modules.length
    };
    await generatePage('carnet.html', carnetTemplate, carnetData);

    // Copier les assets
    await fs.copy(cssDir, path.join(outputDir, 'css'));
    await fs.copy(jsDir, path.join(outputDir, 'js'));

    // Copier les données JSON pour utilisation côté client
    await fs.ensureDir(path.join(outputDir, 'data'));
    await fs.copy(dataDir, path.join(outputDir, 'data'));

    console.log("✅ Build terminé avec succès !");
    console.log("📁 Fichiers générés:");
    console.log("   - public/index.html");
    console.log("   - public/parcours.html");
    console.log("   - public/entrainement.html");
    console.log("   - public/examens.html");
    console.log("   - public/carnet.html");
    console.log("   - public/css/");
    console.log("   - public/js/");
    console.log("   - public/data/");

  } catch (error) {
    console.error("❌ Erreur de build :", error);
    process.exit(1);
  }
}

build();
