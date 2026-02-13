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

function splitConceptPoint(text) {
    const match = String(text || '').match(/^([^:]{2,120})\s*:\s*(.+)$/);
    if (!match) return null;
    return {
        concept: String(match[1]).trim(),
        detail: String(match[2]).trim()
    };
}

function modulePedagogyBlocks(moduleId) {
    const byModule = {
        1: {
            method: [
                'Identifier d abord le type de marque (laterale, cardinale, danger isole, eaux saines, speciale).',
                'Verifier ensuite sa couleur, sa forme et sa marque de sommet.',
                'Appliquer la conduite associee: laisser la marque du bon cote ou s en ecarter.'
            ],
            traps: [
                'Confondre le sens "entrant au port" et "sortant du port".',
                'Se fier uniquement a la couleur sans verifier la forme.',
                'Ignorer les secteurs d un feu cardinal.'
            ]
        },
        2: {
            method: [
                'De nuit, identifier la combinaison des feux (couleur, nombre, ordre vertical).',
                'Relier la combinaison au statut du navire (mouillage, peche, capacite restreinte, etc.).',
                'Adapter la route et la vitesse en fonction du statut identifie.'
            ],
            traps: [
                'Prendre un feu de mouillage pour un feu de route.',
                'Confondre un navire de peche et un navire non maitre de sa manœuvre.',
                'Oublier que l orientation d observation modifie la perception des feux.'
            ]
        },
        3: {
            method: [
                'Identifier le type de rencontre: route opposee, croisement, rattrapage.',
                'Determiner le navire privilegie selon RIPAM.',
                'Executer une manœuvre franche, precoce et lisible.'
            ],
            traps: [
                'Attendre trop longtemps avant de manœuvrer.',
                'Penser qu un navire privilegie ne doit rien surveiller.',
                'Confondre priorite voile/moteur avec les cas particuliers.'
            ]
        },
        4: {
            method: [
                'Associer chaque signal sonore a l intention du navire.',
                'Dans la brume, reconnaitre les signaux prolonges et leur periodicite.',
                'Croiser signal entendu et situation de route avant d agir.'
            ],
            traps: [
                'Confondre les signaux de manœuvre (1, 2, 3 sons brefs).',
                'Ignorer la notion d erre en visibilite reduite.',
                'Ne pas reduire l allure en cas de doute.'
            ]
        },
        5: {
            method: [
                'Lire la carte marine avec methode: legendes, sondes, dangers, alignements.',
                'Tracer route et relèvements avec les outils de navigation.',
                'Verifier en permanence la marge de securite sous quille.'
            ],
            traps: [
                'Mesurer les distances hors echelle des latitudes.',
                'Ne pas tenir compte de la date de mise a jour de la carte.',
                'Confondre sonde qui decouvre et sonde toujours immergee.'
            ]
        },
        6: {
            method: [
                'Poser les donnees dans l ordre: cap compas, deviation, declinaison, cap vrai.',
                'Appliquer une convention de signe unique (Est positif, Ouest negatif).',
                'Verifier la coherence du resultat avec la route observee.'
            ],
            traps: [
                'Inverser declinaison et deviation.',
                'Additionner les corrections dans le mauvais sens.',
                'Ne pas controler la plausibilite du cap final.'
            ]
        },
        7: {
            method: [
                'Tracer le vecteur surface puis le vecteur courant.',
                'Fermer le triangle des vitesses pour obtenir route et vitesse fond.',
                'Verifier le resultat avec la distance franchie sur le fond.'
            ],
            traps: [
                'Confondre route surface et route fond.',
                'Utiliser une echelle de vitesse incoherente sur les vecteurs.',
                'Oublier l influence de la derive vent.'
            ]
        },
        8: {
            method: [
                'Relever PM/BM, coefficients et marnage dans l annuaire.',
                'Appliquer la regle des douziemes sur la bonne tranche horaire.',
                'Conclure avec une marge de securite de hauteur d eau.'
            ],
            traps: [
                'Appliquer les douziemes sur une duree differente de 6 h sans adaptation.',
                'Confondre hauteur d eau et profondeur sondee carte.',
                'Oublier l heure legale/UTC selon la source utilisee.'
            ]
        },
        9: {
            method: [
                'Choisir le bon type de message: detresse, urgence, securite.',
                'Emettre sur le canal adapte (notamment 16 en detresse vocale).',
                'Structurer le message: identite, position, nature du probleme, assistance demandee.'
            ],
            traps: [
                'Utiliser un canal non reglementaire pour la detresse.',
                'Donner une position incomplete ou ambiguë.',
                'Melanger proceduren ASN et message vocal.'
            ]
        },
        10: {
            method: [
                'Verifier les limites SUF avant la sortie (meteo, distance a un abri, equipage).',
                'Confirmer l equipement de securite et les moyens d alerte.',
                'Maintenir une surveillance active et un plan de repli permanent.'
            ],
            traps: [
                'Minimiser la meteo reelle au regard de la prevision.',
                'Sortir sans correspondant a terre ou plan de route clair.',
                'Retarder la decision d interrompre la navigation.'
            ]
        }
    };
    return byModule[moduleId] || { method: [], traps: [] };
}

function buildFallbackCourseHtml(module, objectifs, keyPoints, formulas) {
    const defs = keyPoints
        .map(splitConceptPoint)
        .filter(Boolean)
        .slice(0, 18);
    const plainPoints = keyPoints
        .filter(item => !splitConceptPoint(item))
        .slice(0, 18);
    const objectifsHtml = objectifs.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const defsHtml = defs
        .map(item => `<li><strong>${escapeHtml(item.concept)}</strong> : ${escapeHtml(item.detail)}</li>`)
        .join('');
    const pointsHtml = plainPoints.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const pedagogy = modulePedagogyBlocks(Number(module.id));
    const methodHtml = pedagogy.method.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const trapsHtml = pedagogy.traps.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const formulasHtml = formulas
        ? `<h5>Formules et reperes</h5><p><code>${escapeHtml(formulas)}</code></p>`
        : '';

    return [
        `<p>${escapeHtml(module.description || '')}</p>`,
        objectifsHtml ? `<h5>Objectifs de progression</h5><ul>${objectifsHtml}</ul>` : '',
        defsHtml ? `<h5>Notions et definitions essentielles</h5><ul>${defsHtml}</ul>` : '',
        pointsHtml ? `<h5>Points cle a maitriser</h5><ul>${pointsHtml}</ul>` : '',
        methodHtml ? `<h5>Methode de resolution en examen</h5><ol>${methodHtml}</ol>` : '',
        trapsHtml ? `<h5>Erreurs frequentes a eviter</h5><ul>${trapsHtml}</ul>` : '',
        formulasHtml
    ].filter(Boolean).join('');
}

function normalizeSessionLabel(session) {
    if (session === 'mars') return 'Mars';
    if (session === 'octobre') return 'Octobre';
    return 'Annuel';
}

function toPublicAnnalesPath(filePath) {
    const normalized = String(filePath || '').replace(/\\/g, '/');
    if (!normalized.startsWith('imports/drive/annales/')) return '';
    return normalized.replace('imports/drive/annales/', 'annales/');
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

function pickRepresentativeMediaAsset(mediaAssets) {
    const assets = toArray(mediaAssets)
        .map(item => String(item || '').trim())
        .filter(Boolean);
    if (!assets.length) return null;

    const preferred = assets.find(item => !/\/image1\.(png|jpg|jpeg|gif)$/i.test(item));
    return preferred || null;
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
        const representative = pickRepresentativeMediaAsset(mediaAssets);
        return {
            question: item.cleanText,
            questionNumber: item.question,
            image: representative,
            hasImage: Boolean(representative)
        };
    });
}

function slugifySectionId(text, fallback = 'section') {
    const base = String(text || fallback)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .trim();
    return base || fallback;
}

function buildCourseSections(courseContentHtml) {
    const html = String(courseContentHtml || '').trim();
    if (!html) return [];

    const headingRegex = /<h[45][^>]*>([\s\S]*?)<\/h[45]>/gi;
    const sections = [];
    const matches = [...html.matchAll(headingRegex)];

    if (!matches.length) {
        return [{
            id: 'cours-complet',
            title: 'Cours complet',
            html
        }];
    }

    for (let i = 0; i < matches.length; i += 1) {
        const current = matches[i];
        const next = matches[i + 1];
        const headingRaw = current[1] || '';
        const title = stripHtml(headingRaw) || `Section ${i + 1}`;
        const startIndex = current.index + current[0].length;
        const endIndex = next ? next.index : html.length;
        const bodyHtml = html.slice(startIndex, endIndex).trim();
        const id = `${slugifySectionId(title, `section-${i + 1}`)}-${i + 1}`;
        sections.push({
            id,
            title,
            html: bodyHtml || '<p class="text-muted mb-0">Contenu en cours de completion.</p>'
        });
    }

    return sections;
}

function moduleFormulaRepereItems(moduleId, formulas, keyPoints) {
    const baseByModule = {
        1: [
            'Entrant au port (Region A): laisser rouge a babord, vert a tribord.',
            'Cardinale Est: marque noire/jaune/noire, feu blanc 3 scintillements.',
            'Danger isole: 2 spheres noires, feu blanc 2 eclats groupes.'
        ],
        2: [
            'Signal de manœuvre: 1 bref = je viens a tribord; 2 brefs = je viens a babord; 3 brefs = je bats en arriere.',
            'Feu de tete de mat navire a moteur: blanc 225 deg.',
            'Portee usuelle en plaisance (< 12 m): feux de cote 1 M, feu de tete 2 M.'
        ],
        3: [
            'Croisement: le navire qui a l autre sur son tribord doit s ecarter.',
            'Rattrapage: le rattrapant s ecarte quelle que soit sa nature.',
            'En cas de doute: reduction de vitesse et manœuvre franche, precoce, lisible.'
        ],
        4: [
            'Brume navire a moteur avec erre: 1 son prolonge toutes les 2 min.',
            'Brume navire a moteur sans erre: 2 sons prolonges toutes les 2 min.',
            'Signal de detresse: MAYDAY x3 + identification + position + nature de la detresse.'
        ],
        5: [
            'Distance: se mesure sur l echelle des latitudes (bord vertical de carte).',
            'Profondeur disponible: H (hauteur d eau) + S (sonde carte).',
            'Toujours conserver un pied de pilote adapte au plan d eau.'
        ],
        6: [
            'Cap vrai = cap compas + declinaison + deviation.',
            'Convention utile: Est positif, Ouest negatif.',
            'Toujours verifier la coherence du cap calcule avec la route observee.'
        ],
        7: [
            'Route fond = route surface + vecteur courant (construction vectorielle).',
            'Vitesse fond et cap fond se lisent sur le triangle des vitesses.',
            'Ne pas confondre derive vent et derive courant.'
        ],
        8: [
            'Marnage = PM - BM.',
            'Regle des douziemes: 1/12, 2/12, 3/12, 3/12, 2/12, 1/12.',
            'Profondeur minimale securite = tirant d eau + pied de pilote.'
        ],
        9: [
            'Canal 16: detresse, urgence, securite (veille obligatoire).',
            'Message MAYDAY: MAYDAY x3, nom navire x3, position, nature, aide demandee.',
            'Apres contact, bascule sur canal de degagement demande par le CROSS.'
        ],
        10: [
            'Bande des 300 m: vitesse max usuelle 5 nds (verifier reglement local).',
            'Chef de bord responsable: equipage, armement, meteo, decision de renoncer.',
            'Verification avant depart: equipement, route, meteo, point de repli.'
        ]
    };

    const base = toArray(baseByModule[Number(moduleId)]);
    const formulaParts = uniqueStrings(String(formulas || '').split(/\s*[|;]\s*/g).filter(Boolean))
        .filter(item => /[=0-9/]/.test(item) || /(cap|route|marnage|beaufort|canal|vitesse|profondeur|tirant)/i.test(item));
    const formulaPointHints = uniqueStrings(toArray(keyPoints).filter(item => /[=0-9/]/.test(item))).slice(0, 3);

    return uniqueStrings([...base, ...formulaParts, ...formulaPointHints]).slice(0, 8);
}

function moduleCourseIllustrations(moduleId) {
    const byModule = {
        1: [
            { src: 'assets/annales/qcm/2022/image2.png', alt: 'Balisage lateral en entree de port' },
            { src: 'assets/annales/qcm/2022/image3.png', alt: 'Marque de balisage et sens de passage' },
            { src: 'assets/annales/qcm/2022/image9.png', alt: 'Marques et signalisation de balisage' }
        ],
        2: [
            { src: 'assets/annales/qcm/2022/image4.png', alt: 'Signal sonore et interpretation RIPAM' },
            { src: 'assets/annales/qcm/2022/image8.png', alt: 'Feux de navires de nuit' }
        ],
        3: [
            { src: 'assets/annales/qcm/2022/image6.png', alt: 'Situation de priorite entre voiliers' },
            { src: 'assets/annales/qcm/2022/image14.png', alt: 'Croisement et regles de barre' }
        ],
        4: [
            { src: 'assets/annales/qcm/2022/image8.png', alt: 'Combinaison de feux et interpretation de navire' },
            { src: 'assets/annales/qcm/2022/image11.png', alt: 'Signaux sonores et visuels' }
        ],
        8: [
            { src: 'assets/annales/qcm/2022/image18.png', alt: 'Exemple de problematique maree et securite de profondeur' }
        ]
    };
    return toArray(byModule[Number(moduleId)]);
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
        const sujets = toArray(series.sujets).map(item => ({
            label: 'Sujet',
            path: toPublicAnnalesPath(item.path),
            extension: item.extension
        }));
        const corriges = toArray(series.corriges).map(item => ({
            label: 'Corrige',
            path: toPublicAnnalesPath(item.path),
            extension: item.extension
        }));
        const downloads = [...sujets, ...corriges].filter(item => Boolean(item.path));

        grouped[domain].push({
            year: series.year,
            session: series.session,
            sessionLabel: normalizeSessionLabel(series.session),
            label: `${series.year} - ${normalizeSessionLabel(series.session)}`,
            hasCorrige: toArray(series.corriges).length > 0,
            downloads,
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
        const formulaRepereItems = moduleFormulaRepereItems(moduleId, formulas, keyPoints);
        const fallbackCourseContentHtml = buildFallbackCourseHtml(module, objectifs, keyPoints, formulas);
        const overrideCourseContentHtml = override.content && String(override.content).trim().length > 40
            ? String(override.content)
            : '';
        const courseContentHtml = overrideCourseContentHtml.length >= fallbackCourseContentHtml.length
            ? overrideCourseContentHtml
            : fallbackCourseContentHtml;
        const courseSections = buildCourseSections(courseContentHtml);
        const domain = getAnnalesDomainByModule(moduleId);
        const annalesSeries = toArray(annalesByDomain[domain]).slice(0, 8);
        const annalesExamples = pickAnnalesExamples(moduleId, annalesQcm2022);
        const resources = toArray(theoryResourcesByModule.get(moduleId)).slice(0, 8);
        const courseIllustrations = moduleCourseIllustrations(moduleId);
        const synopsisSource = stripHtml(courseContentHtml) || module.description || '';
        const synopsis = synopsisSource.length > 200
            ? `${synopsisSource.slice(0, 200).trim()}...`
            : synopsisSource;
        const checklist = uniqueStrings([...objectifs, ...keyPoints]).slice(0, 10);
        const checklistEntries = checklist.map((text, index) => ({
            moduleId,
            index: String(index),
            text
        }));

        return {
            ...module,
            ...override,
            objectifs,
            keyPoints,
            quickKeyPoints: keyPoints.slice(0, 4),
            checklist,
            checklistEntries,
            formulas,
            formulaRepereItems,
            synopsis,
            courseContentHtml,
            courseSections,
            coursePage: `module-${moduleId}.html`,
            qcmQuestionCount: qcmCountByModule[String(moduleId)] || 0,
            annalesDomain: domain,
            annalesDomainLabel: domain === 'qcm' ? 'QCM' : (domain === 'maree' ? 'Maree' : 'Cartographie'),
            annalesCount: annalesSeries.length,
            annalesSeries,
            annalesExamples,
            courseIllustrations,
            resources,
            resourcesCount: resources.length,
            hasResources: resources.length > 0,
            hasAnnalesExamples: annalesExamples.length > 0,
            hasFormulas: formulaRepereItems.length > 0,
            hasCourseSections: courseSections.length > 0,
            hasCourseIllustrations: courseIllustrations.length > 0
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
            themes: categories.length
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
        const annalesSourceDir = path.join(__dirname, 'imports', 'drive', 'annales');
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

        const qcmWebCuratedPath = path.join(dataDir, 'qcm.web.curated.json');
        const qcmPeGeneratedPath = path.join(dataDir, 'qcm.pe.generated.json');
        const qcmMergedPath = path.join(dataDir, 'qcm.drive.merged.json');
        const qcmLargePath = path.join(dataDir, 'qcm.large.generated.json');
        let qcmSourcePath = path.join(dataDir, 'qcm.json');
        if (await fs.pathExists(qcmMergedPath)) qcmSourcePath = qcmMergedPath;
        else if (await fs.pathExists(qcmWebCuratedPath)) qcmSourcePath = qcmWebCuratedPath;
        else if (await fs.pathExists(path.join(dataDir, 'qcm.json'))) qcmSourcePath = path.join(dataDir, 'qcm.json');
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
        // Sous Windows, certains fichiers peuvent etre verrouilles temporairement (EBUSY).
        try {
            await fs.emptyDir(outputDir);
        } catch (error) {
            if (error && error.code === 'EBUSY') {
                console.warn('⚠️ Impossible de vider docs (fichier verrouille). Build en mode ecrasement.');
                await fs.ensureDir(outputDir);
            } else {
                throw error;
            }
        }

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
        if (await fs.pathExists(annalesSourceDir)) {
            await fs.copy(annalesSourceDir, path.join(outputDir, 'annales'));
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
