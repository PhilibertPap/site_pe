// Charger les données des flashcards
async function loadFlashcardsData() {
    try {
        // Récupérer le module depuis l'URL
        const params = new URLSearchParams(window.location.search);
        const moduleName = params.get('module') || 'Module';

        // Charger les données QCM
        const response = await fetch('/data/qcm.json');
        const qcmData = await response.json();

        // Trouver la catégorie correspondante
        const category = qcmData.categories?.find(
            cat => cat.name.toLowerCase() === moduleName.toLowerCase()
        );

        if (!category || !category.questions) {
            document.getElementById('flashcard-content').innerHTML =
                '<p class="text-danger">Module non trouvé</p>';
            return;
        }

        // Initialiser les cartes
        const questions = category.questions;
        let currentIndex = 0;
        let isFlipped = false;

        // Mettre à jour le titre
        document.querySelector('h1').textContent = `📚 Cartes mémorisation - ${moduleName}`;
        updateCard(questions, currentIndex, isFlipped);

        // Événements
        document.getElementById('next-btn').addEventListener('click', () => {
            if (currentIndex < questions.length - 1) {
                currentIndex++;
                isFlipped = false;
                updateCard(questions, currentIndex, isFlipped);
            }
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                isFlipped = false;
                updateCard(questions, currentIndex, isFlipped);
            }
        });

        document.getElementById('flashcard-content').addEventListener('click', () => {
            isFlipped = !isFlipped;
            updateCard(questions, currentIndex, isFlipped);
        });

        document.getElementById('shuffle-mode').addEventListener('change', (e) => {
            if (e.target.checked) {
                // Mélanger les questions
                for (let i = questions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [questions[i], questions[j]] = [questions[j], questions[i]];
                }
                currentIndex = 0;
                isFlipped = false;
                updateCard(questions, currentIndex, isFlipped);
            }
        });
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('flashcard-content').innerHTML =
            '<p class="text-danger">Erreur lors du chargement</p>';
    }
}

function updateCard(questions, index, isFlipped) {
    const question = questions[index];
    const content = document.getElementById('flashcard-content');

    content.innerHTML = `
    <div style="text-align: center; cursor: pointer;">
      <small class="text-muted">${isFlipped ? 'Réponse' : 'Question'}</small>
      <h3 class="mt-3 mb-3">${isFlipped ? question.answer || question.responses?.[0] : question.question}</h3>
      ${question.image ? `<img src="${question.image}" style="max-width: 200px; max-height: 200px;" alt="Image" />` : ''}
      <small class="text-muted mt-3 d-block">Cliquez pour retourner</small>
    </div>
  `;

    // Mettre à jour le compteur
    document.getElementById('card-counter').textContent = `${index + 1} / ${questions.length}`;
    document.getElementById('progress-bar').style.width = `${((index + 1) / questions.length) * 100}%`;
    document.getElementById('progress-text').textContent = `${index + 1} / ${questions.length} cartes`;
}

// Charger au démarrage
document.addEventListener('DOMContentLoaded', loadFlashcardsData);
