// Charger les données d'entraînement
async function loadTrainingData() {
  try {
    const response = await fetch('/data/qcm.json');
    const data = await response.json();
    
    // Initialiser les sessions
    const sessions = data.trainingSessions || [];
    setupTrainingCards(sessions);
    
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  }
}

// Configuration des cartes de session
function setupTrainingCards(sessions) {
  document.querySelectorAll('[data-session]').forEach(card => {
    card.addEventListener('click', function() {
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
  let html = `<h3>${session.name}</h3>`;
  
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
  
  detailsDiv.innerHTML = html;
}

// Lancer un examen
function startExam(examId) {
  window.location.href = `/examen.html?id=${examId}`;
}

// Lancer le calculateur
function startCalculator() {
  const type = document.getElementById('cap-calculator-type').value;
  if (type) {
    window.location.href = `/calculator.html?type=${type}`;
  }
}

// Lancer un mini-jeu
function startGame() {
  const gameType = document.getElementById('game-module').value;
  if (gameType) {
    window.location.href = `/game.html?type=${gameType}`;
  }
}

// Initialiser quand la page charge
document.addEventListener('DOMContentLoaded', loadTrainingData);
