const fs = require('fs-extra');
const path = require('path');
const mustache = require('mustache');

// ========== UTILITAIRES ==========
async function loadJSON(filePath, defaultValue = {}) {
  try {
    return await fs.readJson(filePath);
  } catch (e) {
    console.warn(`⚠️ Fichier manquant: ${filePath}, utilisant valeur par défaut`);
    return defaultValue;
  }
}

// ========== TRANSFORMATION DES DONNÉES ==========

/**
 * Prépare les données d'entraînement pour le template
 * Groupe les questions par catégorie et prépare les sessions
 */
function prepareTrainingData(qcmData, siteData) {
  const trainingSessions = [
    {
      id: 'thematic',
      name: 'Tests Thématiques',
      description: 'Maîtrisez chaque sujet progressivement',
      icon: '📚',
      type: 'learning',
      advice: 'Idéal pour débuter. Apprentissage logique et progressif.'
    },
    {
      id: 'random',
      name: 'Tests Aléatoires',
      description: 'Testez-vous comme à l\'examen',
      icon: '🎲',
      type: 'simulation',
      advice: 'Pour progresser après les tests thématiques.'
    },
    {
      id: 'fixed',
      name: 'Tests Fixes Examen',
      description: '6 séries d\'examen officielles',
      icon: '📋',
      type: 'exam',
      advice: 'Simulations d\'examen blanc.'
    },
    {
      id: 'random-thematic',
      name: 'Tests Thématiques Aléatoires',
      description: 'Variations aléatoires par thème',
      icon: '🔄',
      type: 'revision',
      advice: 'Pour renforcer vos connaissances.'
    }
  ];

  // Compter les questions par catégorie
  const categories = qcmData.categories || [];
  categories.forEach(cat => {
    cat.questionCount = cat.questions ? cat.questions.length : 0;
  });

  return {
    trainingSessions,
    categories,
    totalQuestions: categories.reduce((sum, cat) => sum + cat.questionCount, 0),
    totalCategories: categories.length,
    statistics: {
      totalQCM: categories.reduce((sum, cat) => sum + cat.questionCount, 0),
      typeOfTests: 4,
      themes: categories.length,
      price: 'Gratuit'
    }
  };
}

/**
 * Enrichit les données QCM avec les informations de difficulté
 */
function enrichQCMData(qcmData) {
  if (!qcmData.categories) {
    qcmData.categories = [];
  }

  qcmData.categories.forEach(category => {
    if (!category.questions) {
      category.questions = [];
    }
    
    // Calculer les stats par catégorie
    category.totalQuestions = category.questions.length;
    category.avgDifficulty = category.questions.reduce((sum, q) => sum + (q.difficulty || 1), 0) / (category.questions.length || 1);
    
    // Ajouter les images si présentes
    category.questions = category.questions.map(q => ({
      ...q,
      hasImage: q.image && q.image !== null && q.image !== 'null'
    }));
  });

  return qcmData;
}

// ========== FONCTION PRINCIPALE DE BUILD ==========
async function build() {
  try {
    console.log("🔨 Build en cours...");
    
    // Configuration des chemins
    const srcDir = path.join(__dirname, 'src');
    const dataDir = path.join(srcDir, 'data');
    const templateDir = path.join(srcDir, 'templates');
    const cssDir = path.join(srcDir, 'css');
    const jsDir = path.join(srcDir, 'js');
    const outputDir = path.join(__dirname, 'docs');

    // ========== CHARGEMENT DES DONNÉES ==========
    console.log("📂 Chargement données...");
    
    const siteData = await loadJSON(path.join(dataDir, 'site.json'), { 
      title: 'PE', 
      modules: [], 
      etapes: [] 
    });
    
    const qcmData = await loadJSON(path.join(dataDir, 'qcm.json'), { 
      categories: [],
      totalQuestions: 0 
    });
    
    const exercisesData = await loadJSON(path.join(dataDir, 'exercises.json'), { 
      flashcards: [] 
    });
    
    const navProblemsData = await loadJSON(path.join(dataDir, 'navigation-problems.json'), { 
      problems: [] 
    });
    
    const configData = await loadJSON(path.join(dataDir, 'app-config.json'), {});
    
    const modulesData = await loadJSON(path.join(dataDir, 'modules-content.json'), { 
      modules: [] 
    });

    // ========== TRANSFORMATION DES DONNÉES ==========
    console.log("🔄 Transformation des données...");
    
    // Enrichir les données QCM
    const enrichedQCMData = enrichQCMData(qcmData);
    
    // Préparer les données d'entraînement
    const trainingData = prepareTrainingData(enrichedQCMData, siteData);

    // ========== CHARGEMENT DES TEMPLATES ==========
    console.log("📄 Chargement templates...");
    
    const layoutTemplate = await fs.readFile(path.join(templateDir, 'layout.mustache'), 'utf8');
    const dashboardTemplate = await fs.readFile(path.join(templateDir, 'dashboard.mustache'), 'utf8');
    const parcoursTemplate = await fs.readFile(path.join(templateDir, 'parcours.mustache'), 'utf8');
    const entrainementTemplate = await fs.readFile(path.join(templateDir, 'entrainement.mustache'), 'utf8');
    const examensTemplate = await fs.readFile(path.join(templateDir, 'examens.mustache'), 'utf8');
    const carnetTemplate = await fs.readFile(path.join(templateDir, 'carnet.mustache'), 'utf8');

    // Créer le dossier de sortie
    await fs.ensureDir(outputDir);

    // ========== FONCTION UTILITAIRE POUR GÉNÉRER UNE PAGE ==========
    async function generatePage(filename, template, data) {
      const content = mustache.render(template, data);
      const html = mustache.render(layoutTemplate, { 
        content, 
        title: data.title || 'PE',
        page: filename.replace('.html', '') // Pour styliser la page active
      });
      await fs.writeFile(path.join(outputDir, filename), html);
      console.log(`✅ ${filename}`);
    }

    // ========== GÉNÉRATION DES PAGES ==========
    console.log("🏗️ Génération des pages...");

    // Dashboard
    const dashboardData = { 
      ...siteData, 
      title: "Dashboard",
      globalProgress: 0, 
      modules: siteData.modules.slice(0, 3),
      ...trainingData.statistics 
    };
    await generatePage('index.html', dashboardTemplate, dashboardData);

    // Parcours
    const parcoursData = { 
      ...siteData, 
      title: "Parcours", 
      etapes: siteData.etapes.map(e => ({ 
        ...e, 
        modules: siteData.modules.filter(m => e.modules.includes(m.id)) 
      })) 
    };
    await generatePage('parcours.html', parcoursTemplate, parcoursData);

    // ========== PAGE ENTRAÎNEMENT (MODIFIÉE) ==========
    const entrainementData = { 
      title: "Entraînement",
      modules: siteData.modules,
      ...trainingData,           // ✅ Données d'entraînement
      ...exercisesData,
      // Ajouter les données QCM pour les templates
      categories: enrichedQCMData.categories,
      trainingSessions: trainingData.trainingSessions,
      statistics: trainingData.statistics
    };
    await generatePage('entrainement.html', entrainementTemplate, entrainementData);

    // Examens
    const examensData = { 
      title: "Examens", 
      modules: siteData.modules, 
      qcmQuestionCount: enrichedQCMData.totalQuestions || 0,
      examHistory: [], 
      ...configData,
      categories: enrichedQCMData.categories // ✅ Ajouter les catégories
    };
    await generatePage('examens.html', examensTemplate, examensData);

    // Carnet
    const carnetData = { 
      title: "Carnet", 
      modules: siteData.modules.map(m => ({ 
        ...m, 
        isCompleted: false, 
        keyPoints: ['Point 1', 'Point 2'] 
      })), 
      completedModulesCount: 0, 
      totalModulesCount: siteData.modules.length 
    };
    await generatePage('carnet.html', carnetTemplate, carnetData);

    // ========== COPIE DES ASSETS STATIQUES ==========
    console.log("📋 Copie des assets...");
    
    await fs.copy(cssDir, path.join(outputDir, 'css'));
    await fs.copy(jsDir, path.join(outputDir, 'js'));
    
    // Copier les données pour un accès dynamique côté client
    await fs.ensureDir(path.join(outputDir, 'data'));
    await fs.copy(dataDir, path.join(outputDir, 'data'));

    console.log("✅ Build terminé avec succès!");
    console.log(`📊 Statistiques:`);
    console.log(`   - Total QCM: ${trainingData.statistics.totalQCM}`);
    console.log(`   - Catégories: ${trainingData.statistics.themes}`);
    console.log(`   - Types de tests: ${trainingData.statistics.typeOfTests}`);

  } catch (error) {
    console.error("❌ Erreur build:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ========== LANCER LE BUILD ==========
build();
