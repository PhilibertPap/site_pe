let navigationProblems = [];

function renderProblem(problem) {
    if (!problem) {
        return '<div class="alert alert-warning mb-0">Aucun probleme disponible.</div>';
    }

    const steps = (problem.steps || []).map(step => `
        <li class="mb-3">
            <strong>${step.stepId}. ${step.task}</strong>
            ${step.hint ? `<p class="small text-muted mb-1">Indice: ${step.hint}</p>` : ''}
            <details>
                <summary>Voir l attendu</summary>
                <p class="mb-1"><strong>Attendu:</strong> ${step.expected}</p>
                ${step.explanation ? `<p class="mb-0 small text-muted">${step.explanation}</p>` : ''}
            </details>
        </li>
    `).join('');

    return `
        <article class="card">
            <div class="card-body">
                <h2 class="h4 mb-1">${problem.title}</h2>
                <p class="text-muted mb-1">
                    Difficulté: ${problem.difficulty} • Duree: ${problem.duration} min • Carte: ${problem.carte}
                </p>
                ${problem.scenario ? `<p class="mb-3">${problem.scenario}</p>` : ''}
                <ol class="mb-0">${steps}</ol>
            </div>
        </article>
    `;
}

function renderSelector(problems) {
    const select = document.getElementById('navigation-problem-select');
    if (!select) return;
    select.innerHTML = problems.map(problem => `
        <option value="${problem.id}">${problem.title} (${problem.duration} min)</option>
    `).join('');
}

function renderById(problemId) {
    const container = document.getElementById('navigation-problem-container');
    if (!container) return;
    const selected = navigationProblems.find(problem => String(problem.id) === String(problemId)) || navigationProblems[0] || null;
    container.innerHTML = renderProblem(selected);
}

async function initNavigationPage() {
    const container = document.getElementById('navigation-problem-container');
    if (!container) return;

    try {
        const response = await fetch('data/navigation-problems.json');
        const payload = await response.json();
        navigationProblems = Array.isArray(payload.problems) ? payload.problems : [];

        if (!navigationProblems.length) {
            container.innerHTML = '<div class="alert alert-warning mb-0">Aucun probleme configure.</div>';
            return;
        }

        renderSelector(navigationProblems);
        renderById(navigationProblems[0].id);

        const select = document.getElementById('navigation-problem-select');
        if (select) {
            select.addEventListener('change', () => {
                renderById(select.value);
            });
        }

        const randomBtn = document.getElementById('start-random-problem-btn');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                const random = navigationProblems[Math.floor(Math.random() * navigationProblems.length)];
                if (!random) return;
                if (select) select.value = String(random.id);
                renderById(random.id);
            });
        }
    } catch (error) {
        console.error('Erreur chargement navigation:', error);
        container.innerHTML = '<div class="alert alert-danger mb-0">Impossible de charger le probleme de navigation.</div>';
    }
}

document.addEventListener('DOMContentLoaded', initNavigationPage);
