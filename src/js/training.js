// ========== GESTION DES DONNÉES D'ENTRAÎNEMENT ==========

// Variables globales
let allSessions = [];

// Charger les données d'entraînement
async function loadTrainingData() {
  try {
    console.log('🎯 Chargement des données d\'entraînement...');
    
    const response = await fetch('/data/qcm.json');
    const data = await response.json();
    
    console.log('📊 Données reçues:', data);
    
    // Les trainingSessions sont générées par build.js
    // et passées au template qui les incorpore dans le HTML
    allSessions = data.trainingSessions || [];
    
    console.log('📋 Sessions trouvées:', allSessions.length);
    
    // Initialiser les cartes de session
    setupTrainingCards();
    
    return data;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des données:', error);
  }
}

// Configuration des cartes de session
function setupTrainingCards() {
  const cards = document.querySelectorAll('[data-session]');
  console.log('🎴 Cartes trouvées:', cards.length);
  
  cards.forEach(card => {
    card.addEventListener('click', function() {
      const sessionId = this.dataset.session;
      console.log('🖱️ Session cliquée:', sessionId);
      showSessionDetails(sessionId);
    });
  });
}

// Afficher les détails d'une session
function showSessionDetails(sessionId) {
  const session = allSessions.find(s => s.id === sessionId);
  
  if (!session) {
    console.warn('⚠️ Session non trouvée:', sessionId);
    return;
  }
  
  const detailsDiv = document.getElementById('session-details');
  if (!detailsDiv) {
    console.warn('⚠️ Div session-details non trouvée');
    return;
  }
  
  console.log('📝 Affichage session:', session.name);
  
  let html = `
    <div class="card">
      <div class="card-body">
        <h3 class="card-title">${session.icon} ${session.name}</h3>
        <p class="card-text">${session.description}</p>
  `;
  
  // Afficher les topics si disponibles
  if (session.topics && session.topics.length > 0) {
    html += '<h5 class="mt-3">Thèmes couverts:</h5>';
    html += '<div class="list-group">';
    session.topics.forEach(topic => {
      html += `<div class="list-group-item">${topic}</div>`;
    });
    html += '</div>';
  }
  
  // Afficher les examens si disponibles
  if (session.exams && session.exams.length > 0) {
    html += '<h5 class="mt-3">Séries d\'examen:</h5>';
    html += '<div class="btn-group-vertical w-100">';
    session.exams.forEach(exam => {
      html += `
        <button class="btn btn-primary" onclick="startExam(${exam.id})">
          ${exam.name} (${exam.questions} QCM)
        </button>
      `;
    });
    html += '</div>';
  }
  
  // Afficher les formats si disponibles
  if (session.formats && session.formats.length > 0) {
    html += '<h5 class="mt-3">Formats disponibles:</h5>';
    session.formats.forEach(format => {
      html += `
        <div class="card mb-2">
          <div class="card-body">
            <strong>${format.name}</strong><br>
            <small class="text-muted">${format.questions} QCM • ${format.timeLimit || '?'} min</small>
          </div>
        </div>
      `;
    });
  }
  
  html += '</div></div>';
  
  detailsDiv.innerHTML = html;
  detailsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Lancer un examen
function startExam(examId) {
  console.log('🚀 Démarrage examen:', examId);
  alert(`Examen ${examId} - À implémenter`);
  // window.location.href = `/examen.html?id=${examId}`;
}

// Initialiser quand la page charge
document.addEventListener('DOMContentLoaded', loadTrainingData);
