let examSeries = [];

function renderFixedSeriesList() {
    const list = document.getElementById('fixed-series-list');
    if (!list) return;

    if (!examSeries.length) {
        list.innerHTML = '<p class="text-muted mb-0">Aucune serie disponible.</p>';
        return;
    }

    list.innerHTML = examSeries.map(series => `
        <div class="col-md-6">
            <a class="btn btn-outline-secondary w-100" href="session.html?mode=fixed&seriesId=${series.id}">
                ${series.name}
            </a>
        </div>
    `).join('');
}

function startFullExam() {
    window.location.href = 'session.html?mode=full';
}

function startQuickQCM() {
    const filter = document.getElementById('qcm-filter')?.value || '';
    const query = filter ? `session.html?mode=quick&module=${encodeURIComponent(filter)}` : 'session.html?mode=quick';
    window.location.href = query;
}

function startNavigationProblem() {
    window.location.href = 'navigation.html';
}

async function loadExamData() {
    try {
        const seriesResponse = await fetch('data/exam-series.json');
        const seriesData = await seriesResponse.json();
        examSeries = Array.isArray(seriesData.series) ? seriesData.series : [];
    } catch (error) {
        console.error('Erreur de chargement des donnees examens:', error);
        examSeries = [];
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
