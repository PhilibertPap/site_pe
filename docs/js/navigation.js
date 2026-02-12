function renderProblem(problem) {
    if (!problem) {
        return '<div class="alert alert-warning mb-0">Aucun probleme disponible.</div>';
    }

    const steps = (problem.steps || []).map(step => `
        <li class="mb-3">
            <strong>${step.stepId}. ${step.task}</strong><br>
            <small class="text-muted">Attendu: ${step.expected}</small>
        </li>
    `).join('');

    return `
        <article class="card">
            <div class="card-body">
                <h2 class="h4 mb-2">${problem.title}</h2>
                <p class="text-muted mb-3">
                    Difficulte: ${problem.difficulty} • Duree: ${problem.duration} min • Carte: ${problem.carte}
                </p>
                <ol class="mb-0">${steps}</ol>
            </div>
        </article>
    `;
}

async function initNavigationPage() {
    const container = document.getElementById('navigation-problem-container');
    if (!container) return;

    try {
        const response = await fetch('data/navigation-problems.json');
        const payload = await response.json();
        const problems = Array.isArray(payload.problems) ? payload.problems : [];
        const first = problems[0] || null;
        container.innerHTML = renderProblem(first);
    } catch (error) {
        console.error('Erreur chargement navigation:', error);
        container.innerHTML = '<div class="alert alert-danger mb-0">Impossible de charger le probleme de navigation.</div>';
    }
}

document.addEventListener('DOMContentLoaded', initNavigationPage);
