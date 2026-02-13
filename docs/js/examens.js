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
                ${series.name} (${series.questions?.length || 0} questions)
            </a>
        </div>
    `).join('');
}

function startFullExam() {
    window.location.href = 'session.html?mode=full';
}

function startModuleExam() {
    const moduleId = document.getElementById('qcm-filter')?.value || '';
    if (!moduleId) {
        alert('Selectionne un module.');
        return;
    }
    window.location.href = `session.html?mode=exam-module&module=${encodeURIComponent(moduleId)}&count=30`;
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

function renderLocalStats() {
    const list = document.getElementById('exam-history-list');
    const kpis = document.getElementById('exam-kpis');
    if (!window.sitePE || !window.sitePE.progress) return;

    const history = Array.isArray(window.sitePE.progress.examHistory)
        ? [...window.sitePE.progress.examHistory]
        : [];
    const latest = history.slice(-8).reverse();

    if (list) {
        if (!latest.length) {
            list.innerHTML = '<p class="text-muted mb-0">Aucun examen enregistre pour le moment.</p>';
        } else {
            list.innerHTML = latest.map(item => `
                <div class="mb-3 pb-3 border-bottom">
                    <small class="text-muted">${item.date}</small><br>
                    <strong>Score: ${item.score}/100</strong> • ${item.errors} erreur(s)
                    <div class="progress mt-2" role="progressbar">
                        <div class="progress-bar${item.score >= 75 ? ' bg-success' : ' bg-danger'}" style="width:${item.score}%"></div>
                    </div>
                </div>
            `).join('');
        }
    }

    if (kpis) {
        const attempts = history.length;
        const passed = history.filter(item => item.passed).length;
        const avg = attempts
            ? Math.round(history.reduce((sum, item) => sum + Number(item.score || 0), 0) / attempts)
            : 0;
        const successRate = attempts ? Math.round((passed / attempts) * 100) : 0;
        kpis.innerHTML = `
            <div><strong>Tentatives:</strong> ${attempts}</div>
            <div><strong>Moyenne:</strong> ${avg}/100</div>
            <div><strong>Taux de reussite:</strong> ${successRate}%</div>
            <div><strong>Code scout local:</strong> ${window.sitePE.profileCode || 'SCOUT-LOCAL'}</div>
        `;
    }
}

function initExamPage() {
    const fullButton = document.getElementById('start-full-exam-btn');
    const moduleButton = document.getElementById('start-module-exam-btn');
    const navButton = document.getElementById('start-navigation-problem-btn');
    if (fullButton) fullButton.addEventListener('click', startFullExam);
    if (moduleButton) moduleButton.addEventListener('click', startModuleExam);
    if (navButton) navButton.addEventListener('click', startNavigationProblem);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadExamData();
    renderFixedSeriesList();
    initExamPage();
    setTimeout(renderLocalStats, 150);
    window.addEventListener('sitepe:profile-changed', () => setTimeout(renderLocalStats, 50));
});
