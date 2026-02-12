// Charger les données du jeu
async function loadGameData() {
    try {
        // Récupérer le type de jeu depuis l'URL
        const params = new URLSearchParams(window.location.search);
        const gameType = params.get('type') || 'Quiz';

        // Charger les données QCM
        const response = await fetch('/data/qcm.json');
        const qcmData = await response.json();

        // Trouver les questions appropriées
        const questions = [];
        qcmData.categories?.forEach(category => {
            if (category.questions) {
                questions.push(...category.questions);
            }
        });

        if (questions.length === 0) {
            document.getElementById('game-content').innerHTML =
                '<p class="text-danger">Aucune question trouvée</p>';
            return;
        }

        // Initialiser le jeu
        let score = 0;
        let currentIndex = 0;

        // Mettre à jour le titre
        document.querySelector('h1').textContent = `🎮 Mini-jeu - ${gameType}`;

        const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 10);
        displayQuestion(shuffled, currentIndex, score);

        function displayQuestion(qs, idx, s) {
            const q = qs[idx];
            let html = `
        <div class="container">
          <h4>${q.question}</h4>
          ${q.image ? `<img src="${q.image}" style="max-width: 300px; margin: 20px 0;" />` : ''}
          <div class="mt-3">
      `;

            if (q.responses && Array.isArray(q.responses)) {
                q.responses.forEach((resp, i) => {
                    html += `
            <button class="btn btn-outline-primary d-block w-100 mb-2 text-start" 
                    onclick="checkAnswer(this, '${resp}', '${q.answer}', ${qs.length}, ${idx}, ${s})">
              ${resp}
            </button>
          `;
                });
            }

            html += `</div></div>`;
            document.getElementById('game-content').innerHTML = html;
            document.getElementById('score').textContent = `${s} / ${qs.length}`;
            document.getElementById('score-bar').style.width = `${(s / qs.length) * 100}%`;
        }

        window.checkAnswer = function (btn, answer, correct, total, idx, s) {
            if (answer === correct) {
                s++;
                btn.classList.add('btn-success');
                btn.classList.remove('btn-outline-primary');
            } else {
                btn.classList.add('btn-danger');
                btn.classList.remove('btn-outline-primary');
            }

            setTimeout(() => {
                if (idx < shuffled.length - 1) {
                    displayQuestion(shuffled, idx + 1, s);
                } else {
                    document.getElementById('game-content').innerHTML = `
            <div class="text-center">
              <h2>Jeu terminé!</h2>
              <h3 class="text-success mt-3">${s} / ${total} bonnes réponses</h3>
              <p>${Math.round((s / total) * 100)}%</p>
              <a href="/entrainement.html" class="btn btn-primary mt-3">Retour</a>
            </div>
          `;
                }
            }, 1000);
        };
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('game-content').innerHTML =
            '<p class="text-danger">Erreur lors du chargement du jeu</p>';
    }
}

// Charger au démarrage
document.addEventListener('DOMContentLoaded', loadGameData);
