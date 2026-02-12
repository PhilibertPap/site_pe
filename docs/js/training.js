// Charger les données d'entraînement
async function loadTrainingData() {
    const fallbackSessions = [
        {
            id: 'thematic',
            name: 'Tests thématiques',
            advice: 'Commence par un thème pour progresser de manière structurée.'
        },
        {
            id: 'random',
            name: 'Tests aléatoires',
            advice: 'Excellente option pour simuler un examen réel.'
        },
        {
            id: 'fixed',
            name: 'Tests fixes examen',
            advice: 'Travaille des séries proches du format officiel.'
        },
        {
            id: 'random-thematic',
            name: 'Tests thématiques aléatoires',
            advice: 'Utile pour consolider un thème déjà étudié.'
        }
    ];

    try {
        const response = await fetch('data/qcm.json');
        const data = await response.json();

        // Initialiser les sessions
        const sessions = data.trainingSessions || fallbackSessions;
        setupTrainingCards(sessions);

        // Initialiser les handlers pour les boutons d'entraînement
        initializeTrainingButtons();

        return sessions;
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setupTrainingCards(fallbackSessions);
        initializeTrainingButtons();
        return fallbackSessions;
    }
}

// Initialiser les gestionnaires de boutons
function initializeTrainingButtons() {
    // Trouver les boutons par texte
    const buttons = Array.from(document.querySelectorAll('button'));

    // Bouton Démarrer (Flashcards)
    const startBtn = buttons.find(btn => btn.textContent.trim() === 'Démarrer');
    if (startBtn) {
        startBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const module = document.getElementById('flashcard-module')?.value;
            if (!module || module === 'Choisir un module...') {
                alert('Veuillez sélectionner un module');
                return;
            }
            startFlashcards(module);
        });
    }

    // Bouton Jouer (Mini-jeux)
    const playBtn = buttons.find(btn => btn.textContent.trim() === 'Jouer');
    if (playBtn) {
        playBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const gameType = document.getElementById('game-module')?.value;
            if (!gameType || gameType === 'Choisir un type...') {
                alert('Veuillez sélectionner un type de jeu');
                return;
            }
            startGame(gameType);
        });
    }

    // Bouton Calculer
    const calcBtn = buttons.find(btn => btn.textContent.trim() === 'Calculer');
    if (calcBtn) {
        calcBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const calcType = document.getElementById('calculator-type')?.value;
            if (!calcType || calcType === 'Choisir un outil...') {
                alert('Veuillez sélectionner un outil');
                return;
            }
            startCalculator(calcType);
        });
    }
}

// Configuration des cartes de session
function setupTrainingCards(sessions) {
    document.querySelectorAll('[data-session]').forEach(card => {
        card.addEventListener('click', function () {
            const sessionId = this.dataset.session;
            showSessionDetails(sessionId, sessions);
        });
    });
}

// Afficher les détails d'une session
function showSessionDetails(sessionId, sessions) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const detailsDiv = document.getElementById('session-details');
    let html = `<div class="card"><div class="card-body">
        <h3 class="h4">${session.name}</h3>
        ${session.advice ? `<p class="mb-3">${session.advice}</p>` : ''}`;

    if (session.topics) {
        html += '<div class="list-group">';
        session.topics.forEach(topic => {
            html += `<div class="list-group-item">${topic}</div>`;
        });
        html += '</div>';
    }

    if (session.exams) {
        html += '<div class="mt-3"><h5>Séries disponibles:</h5>';
        session.exams.forEach(exam => {
            html += `<button class="btn btn-primary btn-sm m-1" onclick="startExam(${exam.id})">${exam.name}</button>`;
        });
        html += '</div>';
    }

    html += '</div></div>';
    detailsDiv.innerHTML = html;
}

// Lancer les flashcards
function startFlashcards(module) {
    console.log('Démarrage des flashcards pour le module:', module);
    // Option 1: Navigate vers une page flashcards
    window.location.href = `flashcards.html?module=${encodeURIComponent(module)}`;
    // Option 2: Ou afficher les flashcards sur la page actuelle
    // loadFlashcardsForModule(module);
}

// Lancer un mini-jeu
function startGame(gameType) {
    console.log('Lancement du jeu:', gameType);
    window.location.href = `game.html?type=${encodeURIComponent(gameType)}`;
}

// Lancer un examen
function startExam(examId) {
    window.location.href = `examens.html?id=${examId}`;
}

// Lancer le calculateur
function startCalculator(calculatorType) {
    console.log('Lancement du calculateur:', calculatorType);
    window.location.href = `calculator.html?type=${encodeURIComponent(calculatorType)}`;
}

// Initialiser quand la page charge
document.addEventListener('DOMContentLoaded', loadTrainingData);
