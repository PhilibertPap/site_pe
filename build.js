const fs = require('fs-extra');
const path = require('path');
const mustache = require('mustache');
const qcmEngine = require('./src/js/qcm-engine.js');

const MODULE_CONTENT_LINKS = {
    1: [1],
    2: [2, 4],
    3: [3],
    4: [5],
    5: [6],
    6: [7],
    7: [8],
    8: [9],
    9: [10],
    10: []
};

// ========== UTILITAIRES ==========
async function loadJSON(filePath, defaultValue = {}) {
    try {
        return await fs.readJson(filePath);
    } catch (e) {
        console.warn(`⚠️ Fichier manquant: ${filePath}, utilisant valeur par défaut`);
        return defaultValue;
    }
}

function createSeededRng(seed) {
    let value = seed >>> 0;
    return function seededRandom() {
        value = (1664525 * value + 1013904223) % 4294967296;
        return value / 4294967296;
    };
}

function toArray(value) {
    return Array.isArray(value) ? value : [];
}

function uniqueStrings(list) {
    const seen = new Set();
    const out = [];
    toArray(list).forEach(item => {
        const text = String(item || '').trim();
        if (!text) return;
        const key = text.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push(text);
    });
    return out;
}

function stripHtml(text) {
    return String(text || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildFallbackCourseHtml(module, objectifs, keyPoints, formulas) {
    const objectifsHtml = objectifs.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const pointsHtml = keyPoints.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const formulasHtml = formulas
        ? `<h5>Formules et reperes</h5><p><code>${escapeHtml(formulas)}</code></p>`
        : '';

    return [
        `<p>${escapeHtml(module.description || '')}</p>`,
        objectifsHtml ? `<h5>Objectifs de progression</h5><ul>${objectifsHtml}</ul>` : '',
        pointsHtml ? `<h5>Points cle a memoriser</h5><ul>${pointsHtml}</ul>` : '',
        formulasHtml
    ].filter(Boolean).join('');
}

function normalizeSessionLabel(session) {
    if (session === 'mars') return 'Mars';
    if (session === 'octobre') return 'Octobre';
    return 'Annuel';
}

function sortAnnalesSeries(items) {
    const rank = { annuel: 0, mars: 1, octobre: 2 };
    return [...items].sort((a, b) => {
        if ((b.year || 0) !== (a.year || 0)) return (b.year || 0) - (a.year || 0);
        return (rank[b.session] || 0) - (rank[a.session] || 0);
    });
}

function getAnnalesDomainByModule(moduleId) {
    if ([5, 6, 7].includes(Number(moduleId))) return 'cartographie';
    if (Number(moduleId) === 8) return 'maree';
    return 'qcm';
}

function cleanAnnalesQuestionText(text) {
    return String(text || '')
        .replace(/\s*\|\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/Question\s*\d+$/i, '')
        .trim();
}

function pickAnnalesExamples(moduleId, annalesQcm2022) {
    const questions = toArray(annalesQcm2022?.questions);
    if (!questions.length) return [];

    const byModulePatterns = {
        1: [/bou[ée]e/i, /balis/i, /balise/i, /chenal/i, /cardinal/i, /marque/i],
        2: [/signal/i, /sonore/i, /lumin/i, /canal/i, /\bvhf\b/i],
        3: [/route/i, /crois/i, /priorit/i, /tribord/i, /b[âa]bord/i, /man[œo]uvr/i],
        4: [/navire/i, /feux/i, /mouillage/i, /chalutier/i, /echou/i],
        9: [/\bvhf\b/i, /canal/i, /d[eé]tresse/i],
        10: [/brassi[eè]re/i, /abri/i, /s[ée]curit/i, /m[eé]t[eé]o/i]
    };
    const patterns = byModulePatterns[moduleId] || [];

    const selected = questions
        .map(item => ({
            ...item,
            cleanText: cleanAnnalesQuestionText(item.text)
        }))
        .filter(item => patterns.length && patterns.some(pattern => pattern.test(item.cleanText)));

    return selected.slice(0, 3).map(item => {
        const mediaAssets = toArray(item.mediaAssets);
        return {
            question: item.cleanText,
            questionNumber: item.question,
            image: mediaAssets[0] || null,
            hasImage: Boolean(mediaAssets[0])
        };
    });
}

function buildModulesContentMap(modulesContentData) {
    return new Map(
        toArray(modulesContentData.modules).map(module => [Number(module.id), module])
    );
}

function resolveModuleContentForSiteModule(moduleId, modulesContentMap) {
    const sourceIds = MODULE_CONTENT_LINKS[moduleId] || [moduleId];
    const sourceModules = sourceIds
        .map(id => modulesContentMap.get(Number(id)))
        .filter(Boolean);
    const keyPoints = uniqueStrings(sourceModules.flatMap(module => toArray(module.keyPoints)));
    const formulas = uniqueStrings(sourceModules.map(module => module.formulas)).join(' | ');
    const objectifs = uniqueStrings(sourceModules.flatMap(module => toArray(module.objectifs)));

    return {
        keyPoints,
        formulas,
        objectifs
    };
}

function buildQcmCountByModule(qcmData) {
    const countByModule = {};
    toArray(qcmData.categories).forEach(category => {
        const moduleId = String(category.module);
        countByModule[moduleId] = (countByModule[moduleId] || 0) + toArray(category.questions).length;
    });
    return countByModule;
}

function buildAnnalesByDomain(annalesManifest) {
    const grouped = { qcm: [], cartographie: [], maree: [] };
    toArray(annalesManifest.series).forEach(series => {
        const domain = series.domain;
        if (!grouped[domain]) return;
        const sujet = toArray(series.sujets)[0] || null;
        grouped[domain].push({
            year: series.year,
            session: series.session,
            sessionLabel: normalizeSessionLabel(series.session),
            label: `${series.year} - ${normalizeSessionLabel(series.session)}`,
            hasCorrige: toArray(series.corriges).length > 0,
            subjectPath: sujet ? sujet.path : '',
            answerKeyAvailable: Boolean(series.metadata?.hasDocxAnswerKey)
        });
    });

    Object.keys(grouped).forEach(key => {
        grouped[key] = sortAnnalesSeries(grouped[key]);
    });

    return grouped;
}

async function collectFilesRecursive(rootDir) {
    const out = [];
    if (!(await fs.pathExists(rootDir))) return out;

    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
                continue;
            }
            out.push(fullPath);
        }
    }

    await walk(rootDir);
    return out;
}

function uniqueByPath(items) {
    const seen = new Set();
    const out = [];
    toArray(items).forEach(item => {
        const key = String(item.path || '');
        if (!key || seen.has(key)) return;
        seen.add(key);
        out.push(item);
    });
    return out;
}

async function buildTheoryResourcesByModule(theoryRoot) {
    const files = await collectFilesRecursive(theoryRoot);
    const normalizedFiles = files.map(fullPath => {
        const rel = path.relative(path.join(__dirname), fullPath).split(path.sep).join('/');
        const name = path.basename(fullPath);
        return { fullPath, rel, name };
    });

    function pick(label, pattern) {
        return normalizedFiles
            .filter(file => pattern.test(file.rel))
            .map(file => ({ label, path: file.rel }));
    }

    const resources = new Map();
    resources.set(1, uniqueByPath([
        ...pick('Cours QCM (slides)', /QCM\/Cours QCM\/Cours QCM\.pdf$/i),
        ...pick('Fiche balisage', /QCM\/Cours QCM\/Fiche balisage\.(pdf|docx)$/i)
    ]));
    resources.set(2, uniqueByPath([
        ...pick('Cours QCM (slides)', /QCM\/Cours QCM\/Cours QCM\.pdf$/i),
        ...pick('Fiche signaux sonores et lumineux', /QCM\/Cours QCM\/Fiche signaux sonores et lumineux\.pdf$/i)
    ]));
    resources.set(3, uniqueByPath([
        ...pick('Cours QCM (slides)', /QCM\/Cours QCM\/Cours QCM\.pdf$/i),
        ...pick('Fiche regles de barre et de route', /QCM\/Cours QCM\/Fiche règle de barre et de route\.(pdf|docx)$/i)
    ]));
    resources.set(4, uniqueByPath([
        ...pick('Cours QCM (slides)', /QCM\/Cours QCM\/Cours QCM\.pdf$/i),
        ...pick('Fiche feux et marques des navires', /QCM\/Cours QCM\/Fiche feux et marques des navires\.(pdf|docx)$/i)
    ]));
    resources.set(5, uniqueByPath([
        ...pick('Cours cartographie', /CARTO\/Cours\/Cours cartographie\.pdf$/i),
        ...pick('Fiche cartographie', /CARTO\/Cours\/Fiche cartographie\.pdf$/i),
        ...pick('Compte rendu cartographie', /Compte rendu de séance\/Compte rendu cours 4 PE\.docx$/i)
    ]));
    resources.set(6, uniqueByPath([
        ...pick('Cours cartographie', /CARTO\/Cours\/Cours cartographie\.pdf$/i),
        ...pick('Fiche cartographie', /CARTO\/Cours\/Fiche cartographie\.pdf$/i),
        ...pick('Compte rendu cartographie', /Compte rendu de séance\/Compte rendu cours 4 PE\.docx$/i)
    ]));
    resources.set(7, uniqueByPath([
        ...pick('Cours cartographie', /CARTO\/Cours\/Cours cartographie\.pdf$/i),
        ...pick('Fiche cartographie', /CARTO\/Cours\/Fiche cartographie\.pdf$/i),
        ...pick('Cours maree (courants)', /MAREE\/Cours\/Cours calcul de marée\.pdf$/i)
    ]));
    resources.set(8, uniqueByPath([
        ...pick('Cours calcul de maree', /MAREE\/Cours\/Cours calcul de marée\.pdf$/i),
        ...pick('Methode calcul de maree', /MAREE\/Cours\/Méthode calcul de marée\.pdf$/i),
        ...pick('Compte rendu maree', /Compte rendu de séance\/Compte rendu cours 3 PE\.docx$/i)
    ]));
    resources.set(9, uniqueByPath([
        ...pick('Cours QCM (slides)', /QCM\/Cours QCM\/Cours QCM\.pdf$/i),
        ...pick('Compte rendu cours 2', /Compte rendu de séance\/Compte rendu cours 2 PE\.docx$/i)
    ]));
    resources.set(10, uniqueByPath([
        ...pick('Cours QCM (slides)', /QCM\/Cours QCM\/Cours QCM\.pdf$/i),
        ...pick('Compte rendu cours 2', /Compte rendu de séance\/Compte rendu cours 2 PE\.docx$/i),
        ...pick('Comment utiliser ce drive', /Compte rendu de séance\/Comment utiliser ce drive\.docx$/i)
    ]));

    return resources;
}

function enrichModulesForLearning({
    siteModules,
    overridesById,
    modulesContentMap,
    qcmCountByModule,
    annalesByDomain,
    annalesQcm2022,
    theoryResourcesByModule
}) {
    return toArray(siteModules).map(module => {
        const moduleId = Number(module.id);
        const override = overridesById.get(moduleId) || {};
        const moduleContent = resolveModuleContentForSiteModule(moduleId, modulesContentMap);
        const objectifs = uniqueStrings([
            ...toArray(override.objectifs),
            ...toArray(moduleContent.objectifs),
            ...toArray(module.objectifs)
        ]);
        const keyPoints = uniqueStrings([
            ...toArray(override.keyPoints),
            ...toArray(moduleContent.keyPoints),
            ...toArray(module.objectifs)
        ]);
        const formulas = moduleContent.formulas || '';
        const courseContentHtml = override.content && String(override.content).trim().length > 40
            ? String(override.content)
            : buildFallbackCourseHtml(module, objectifs, keyPoints, formulas);
        const domain = getAnnalesDomainByModule(moduleId);
        const annalesSeries = toArray(annalesByDomain[domain]).slice(0, 8);
        const annalesExamples = pickAnnalesExamples(moduleId, annalesQcm2022);
        const resources = toArray(theoryResourcesByModule.get(moduleId)).slice(0, 8);
        const synopsisSource = stripHtml(courseContentHtml) || module.description || '';
        const synopsis = synopsisSource.length > 200
            ? `${synopsisSource.slice(0, 200).trim()}...`
            : synopsisSource;
        const checklist = uniqueStrings([...objectifs, ...keyPoints]).slice(0, 10);

        return {
            ...module,
            ...override,
            objectifs,
            keyPoints,
            quickKeyPoints: keyPoints.slice(0, 4),
            checklist,
            formulas,
            synopsis,
            courseContentHtml,
            coursePage: `module-${moduleId}.html`,
            qcmQuestionCount: qcmCountByModule[String(moduleId)] || 0,
            annalesDomain: domain,
            annalesDomainLabel: domain === 'qcm' ? 'QCM' : (domain === 'maree' ? 'Maree' : 'Cartographie'),
            annalesCount: annalesSeries.length,
            annalesSeries,
            annalesExamples,
            resources,
            resourcesCount: resources.length,
            hasResources: resources.length > 0,
            hasAnnalesExamples: annalesExamples.length > 0,
            hasFormulas: Boolean(formulas)
        };
    });
}

// ========== TRANSFORMATION DES DONNÉES ==========

/**
 * Prépare les données d'entraînement pour le template
 * Groupe les questions par catégorie et prépare les sessions
 */
function prepareTrainingData(qcmData, trainingSessionsData = {}) {
    const fallbackSessions = [
        { id: 'thematic', name: 'Tests Thematiques', description: 'Maitrisez chaque sujet progressivement', icon: '📚', type: 'learning', advice: 'Ideal pour debuter.' },
        { id: 'random', name: 'Tests Aleatoires', description: 'Testez-vous comme a l examen', icon: '🎲', type: 'simulation', advice: 'Bonne simulation.' },
        { id: 'fixed', name: 'Tests Fixes Examen', description: 'Series proches de l examen', icon: '📋', type: 'exam', advice: 'Conditions realistes.' },
        { id: 'random-thematic', name: 'Tests Thematiques Aleatoires', description: 'Variations aleatoires par theme', icon: '🔄', type: 'revision', advice: 'Consolider les acquis.' }
    ];
    const trainingSessions = Array.isArray(trainingSessionsData.trainingSessions) && trainingSessionsData.trainingSessions.length
        ? trainingSessionsData.trainingSessions
        : fallbackSessions;

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

function sanitizeQCMData(qcmData) {
    const sanitizedCategories = qcmEngine.sanitizeCategories(qcmData.categories || []);
    return {
        ...qcmData,
        categories: sanitizedCategories
    };
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
        const assetsDir = path.join(srcDir, 'assets');
        const outputDir = path.join(__dirname, 'docs');

        // ========== CHARGEMENT DES DONNÉES ==========
        console.log("📂 Chargement données...");

        const siteData = await loadJSON(path.join(dataDir, 'site.json'), {
            title: 'PE',
            modules: [],
            etapes: []
        });
        const courseGeneratedData = await loadJSON(path.join(dataDir, 'course.generated.json'), {
            modules: []
        });
        const modulesContentData = await loadJSON(path.join(dataDir, 'modules-content.json'), {
            modules: []
        });
        const annalesManifestData = await loadJSON(path.join(dataDir, 'annales.manifest.json'), {
            series: []
        });
        const annalesQcm2022Data = await loadJSON(
            path.join(__dirname, 'imports', 'drive', 'annales', 'annales.qcm.2022.raw.json'),
            { questions: [] }
        );
        const theoryResourcesByModule = await buildTheoryResourcesByModule(
            path.join(__dirname, 'imports', 'drive', 'theorie', 'Théorie')
        );

        const qcmPeGeneratedPath = path.join(dataDir, 'qcm.pe.generated.json');
        const qcmMergedPath = path.join(dataDir, 'qcm.drive.merged.json');
        const qcmLargePath = path.join(dataDir, 'qcm.large.generated.json');
        let qcmSourcePath = path.join(dataDir, 'qcm.json');
        if (await fs.pathExists(qcmMergedPath)) qcmSourcePath = qcmMergedPath;
        else if (await fs.pathExists(qcmPeGeneratedPath)) qcmSourcePath = qcmPeGeneratedPath;
        else if (await fs.pathExists(qcmLargePath)) qcmSourcePath = qcmLargePath;
        const qcmData = await loadJSON(qcmSourcePath, {
            categories: [],
            totalQuestions: 0
        });

        const exercisesData = await loadJSON(path.join(dataDir, 'exercises.json'), {
            flashcards: []
        });

        const configData = await loadJSON(path.join(dataDir, 'app-config.json'), {});
        const trainingSessionsData = await loadJSON(path.join(dataDir, 'training-sessions.json'), {
            trainingSessions: []
        });

        // ========== TRANSFORMATION DES DONNÉES ==========
        console.log("🔄 Transformation des données...");

        // Enrichir les données QCM
        const sanitizedQCMData = sanitizeQCMData(qcmData);
        const enrichedQCMData = enrichQCMData(sanitizedQCMData);
        const qcmPool = qcmEngine.buildQuestionPool(enrichedQCMData);
        const qcmErrors = qcmEngine.validatePool(qcmPool);
        if (qcmErrors.length) {
            throw new Error(`QCM invalide: ${qcmErrors[0]}`);
        }
        const qcmCountByModule = buildQcmCountByModule(enrichedQCMData);
        const overridesById = new Map(toArray(courseGeneratedData.modules).map(module => [Number(module.id), module]));
        const modulesContentMap = buildModulesContentMap(modulesContentData);
        const annalesByDomain = buildAnnalesByDomain(annalesManifestData);
        const enrichedModules = enrichModulesForLearning({
            siteModules: siteData.modules,
            overridesById,
            modulesContentMap,
            qcmCountByModule,
            annalesByDomain,
            annalesQcm2022: annalesQcm2022Data,
            theoryResourcesByModule
        });
        const enrichedSiteData = {
            ...siteData,
            modules: enrichedModules
        };

        // Préparer les données d'entraînement
        const trainingData = prepareTrainingData(enrichedQCMData, trainingSessionsData);
        const totalQcmCount = trainingData.statistics.totalQCM;
        const examSeriesData = {
            generatedAt: new Date().toISOString(),
            algorithm: 'balanced_under_constraints_v1',
            seed: 20260212,
            totalQuestionsInPool: qcmPool.length,
            series: qcmEngine.generateExamSeries(qcmPool, {
                count: 30,
                seriesCount: 6,
                rng: createSeededRng(20260212)
            })
        };

        // ========== CHARGEMENT DES TEMPLATES ==========
        console.log("📄 Chargement templates...");

        const layoutTemplate = await fs.readFile(path.join(templateDir, 'layout.mustache'), 'utf8');
        const dashboardTemplate = await fs.readFile(path.join(templateDir, 'dashboard.mustache'), 'utf8');
        const parcoursTemplate = await fs.readFile(path.join(templateDir, 'parcours.mustache'), 'utf8');
        const entrainementTemplate = await fs.readFile(path.join(templateDir, 'entrainement.mustache'), 'utf8');
        const examensTemplate = await fs.readFile(path.join(templateDir, 'examens.mustache'), 'utf8');
        const carnetTemplate = await fs.readFile(path.join(templateDir, 'carnet.mustache'), 'utf8');
        const moduleTemplate = await fs.readFile(path.join(templateDir, 'module.mustache'), 'utf8');
        const sessionTemplate = await fs.readFile(path.join(templateDir, 'session.mustache'), 'utf8');
        const navigationTemplate = await fs.readFile(path.join(templateDir, 'navigation.mustache'), 'utf8');

        // Nettoyer puis recréer le dossier de sortie pour éviter les fichiers obsolètes
        await fs.emptyDir(outputDir);

        // ========== FONCTION UTILITAIRE POUR GÉNÉRER UNE PAGE ==========
        async function generatePage(filename, template, data) {
            const content = mustache.render(template, data);
            const page = filename.replace('.html', '');
            const isModulePage = page.startsWith('module-');
            const html = mustache.render(layoutTemplate, {
                content,
                title: data.title || 'PE',
                page, // Pour styliser la page active
                isIndex: page === 'index',
                isParcours: page === 'parcours' || isModulePage,
                isEntrainement: page === 'entrainement',
                isExamens: page === 'examens',
                isCarnet: page === 'carnet'
            });
            await fs.writeFile(path.join(outputDir, filename), html);
            console.log(`✅ ${filename}`);
        }

        // ========== GÉNÉRATION DES PAGES ==========
        console.log("🏗️ Génération des pages...");

        // Dashboard
        const dashboardData = {
            ...enrichedSiteData,
            title: "Dashboard",
            globalProgress: 0,
            modules: enrichedSiteData.modules.slice(0, 6),
            ...trainingData.statistics
        };
        await generatePage('index.html', dashboardTemplate, dashboardData);

        // Parcours
        const parcoursData = {
            ...enrichedSiteData,
            title: "Parcours",
            etapes: enrichedSiteData.etapes.map(e => ({
                ...e,
                modules: enrichedSiteData.modules.filter(m => e.modules.includes(m.id))
            }))
        };
        await generatePage('parcours.html', parcoursTemplate, parcoursData);

        // Pages cours par module
        for (const module of enrichedSiteData.modules) {
            const modulePageData = {
                ...module,
                title: `Module ${module.moduleNumber} - ${module.name}`
            };
            await generatePage(`module-${module.id}.html`, moduleTemplate, modulePageData);
        }

        // ========== PAGE ENTRAÎNEMENT (MODIFIÉE) ==========
        const entrainementData = {
            title: "Entraînement",
            modules: enrichedSiteData.modules,
            ...trainingData,           // ✅ Données d'entraînement
            ...exercisesData,
            // Ajouter les données QCM pour les templates
            categories: enrichedQCMData.categories,
            trainingSessions: trainingData.trainingSessions,
            statistics: trainingData.statistics,
            trainingSessionsJson: JSON.stringify(trainingData.trainingSessions)
        };
        await generatePage('entrainement.html', entrainementTemplate, entrainementData);

        // Examens
        const examensData = {
            title: "Examens",
            modules: enrichedSiteData.modules,
            qcmQuestionCount: totalQcmCount,
            examHistory: [],
            ...configData,
            categories: enrichedQCMData.categories,
            annalesQcmSessions: toArray(annalesByDomain.qcm).slice(0, 10)
        };
        await generatePage('examens.html', examensTemplate, examensData);

        // Carnet
        const carnetData = {
            title: "Carnet",
            modules: enrichedSiteData.modules.map(module => ({
                ...module,
                isCompleted: true
            })),
            completedModulesCount: enrichedSiteData.modules.length,
            totalModulesCount: enrichedSiteData.modules.length
        };
        await generatePage('carnet.html', carnetTemplate, carnetData);

        // Session QCM (page cible des redirections)
        const sessionData = {
            title: "Session"
        };
        await generatePage('session.html', sessionTemplate, sessionData);

        // Navigation problem (page dédiée)
        const navigationData = {
            title: "Navigation"
        };
        await generatePage('navigation.html', navigationTemplate, navigationData);

        // ========== COPIE DES ASSETS STATIQUES ==========
        console.log("📋 Copie des assets...");

        await fs.copy(cssDir, path.join(outputDir, 'css'));
        await fs.copy(jsDir, path.join(outputDir, 'js'));
        if (await fs.pathExists(assetsDir)) {
            await fs.copy(assetsDir, path.join(outputDir, 'assets'));
        }

        // Copier les données pour un accès dynamique côté client
        await fs.ensureDir(path.join(outputDir, 'data'));
        await fs.copy(dataDir, path.join(outputDir, 'data'));
        await fs.writeJson(path.join(outputDir, 'data', 'exam-series.json'), examSeriesData, { spaces: 2 });

        console.log("✅ Build terminé avec succès!");
        console.log(`📊 Statistiques:`);
        console.log(`   - Source QCM: ${path.basename(qcmSourcePath)}`);
        console.log(`   - Total QCM: ${trainingData.statistics.totalQCM}`);
        console.log(`   - Catégories: ${trainingData.statistics.themes}`);
        console.log(`   - Types de tests: ${trainingData.statistics.typeOfTests}`);
        console.log(`   - Séries examen générées: ${examSeriesData.series.length}`);

    } catch (error) {
        console.error("❌ Erreur build:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// ========== LANCER LE BUILD ==========
build();
