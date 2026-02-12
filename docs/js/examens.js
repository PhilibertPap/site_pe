let examSeries = [];
let navigationProblems = [];

function getExamContainer() {
    return document.getElementById('exam-container');
}

function showExamContainer() {
    const container = getExamContainer();
    if (!container) return null;
    container.style.display = 'block';
    return container;
}

function renderFixedSeriesList() {
    const list = document.getElementById('fixed-series-list');
    if (!list) return;

    if (!examSeries.length) {
        list.innerHTML = '<p class="text-muted mb-0">Aucune serie disponible.</p>';
        return;
    }

    list.innerHTML = examSeries.map(series => `
        <div class="col-md-6">
            <button class="btn btn-outline-secondary w-100" data-series-id="${series.id}">
                ${series.name}
            </button>
        </div>
    `).join('');

    list.querySelectorAll('[data-series-id]').forEach(button => {
        button.addEventListener('click', () => {
            const id = Number.parseInt(button.dataset.seriesId, 10);
            startFixedSeries(id);
        });
    });
}

function startFixedSeries(seriesId) {
    const series = examSeries.find(item => item.id === seriesId);
    if (!series) {
        alert('Serie introuvable.');
        return;
    }

    showExamContainer();
    window.sitePE.startQCMFromQuestions(series.questions, {
        mode: 'fixed',
        seriesId: series.id,
        timeLimitMinutes: 30
    });
}

function startFullExam() {
    if (!examSeries.length) {
        alert('Aucune serie d examen disponible.');
        return;
    }
    const randomIndex = Math.floor(Math.random() * examSeries.length);
    const series = examSeries[randomIndex];
    showExamContainer();
    window.sitePE.startQCMFromQuestions(series.questions, {
        mode: 'full',
        seriesId: series.id,
        timeLimitMinutes: 30
    });
}

function startQuickQCM() {
    const filter = document.getElementById('qcm-filter')?.value || '';
    showExamContainer();
    window.sitePE.startQCM(filter || null);
}

function startNavigationProblem() {
    const container = showExamContainer();
    if (!container) return;

    const problem = navigationProblems[0];
    if (!problem) {
        container.innerHTML = '<div class="alert alert-warning mb-0">Aucun probleme de navigation disponible.</div>';
        return;
    }

    const steps = (problem.steps || []).map(step => `
        <li class="mb-2">
            <strong>${step.stepId}. ${step.task}</strong><br>
            <small class="text-muted">Attendu: ${step.expected}</small>
        </li>
    `).join('');

    container.innerHTML = `
        <div class="card border-0">
            <div class="card-body">
                <h3 class="h5">${problem.title}</h3>
                <p class="text-muted mb-3">
                    Difficulte: ${problem.difficulty} • Duree: ${problem.duration} min • Carte: ${problem.carte}
                </p>
                <ol class="mb-0">${steps}</ol>
            </div>
        </div>
    `;
}

async function loadExamData() {
    try {
        const [seriesResponse, navResponse] = await Promise.all([
            fetch('data/exam-series.json'),
            fetch('data/navigation-problems.json')
        ]);
        const seriesData = await seriesResponse.json();
        const navData = await navResponse.json();
        examSeries = Array.isArray(seriesData.series) ? seriesData.series : [];
        navigationProblems = Array.isArray(navData.problems) ? navData.problems : [];
    } catch (error) {
        console.error('Erreur de chargement des donnees examens:', error);
        examSeries = [];
        navigationProblems = [];
    }
}

function initExamPage() {
    const fullButton = document.getElementById('start-full-exam-btn');
    const quickButton = document.getElementById('start-quick-qcm-btn');
    const navButton = document.getElementById('start-navigation-problem-btn');
    if (!fullButton || !quickButton || !navButton) return;

    fullButton.addEventListener('click', startFullExam);
    quickButton.addEventListener('click', startQuickQCM);
    navButton.addEventListener('click', startNavigationProblem);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadExamData();
    renderFixedSeriesList();
    initExamPage();
});
