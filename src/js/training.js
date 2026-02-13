function parseTrainingSessions() {
    const fallback = [
        { id: 'thematic', name: 'Tests thematiques', advice: 'Travail module par module.' },
        { id: 'random', name: 'Tests aleatoires', advice: 'Simulation rapide sur tout le programme.' },
        { id: 'fixed', name: 'Series fixes', advice: 'Conditions proches de l examen.' },
        { id: 'random-thematic', name: 'Theme aleatoire', advice: 'Un module choisi au hasard.' }
    ];

    try {
        const node = document.getElementById('training-sessions-data');
        const parsed = node ? JSON.parse(node.textContent || '[]') : [];
        return Array.isArray(parsed) && parsed.length ? parsed : fallback;
    } catch (_) {
        return fallback;
    }
}

function sessionRoute(sessionId, selectedModule) {
    if (sessionId === 'thematic') {
        if (!selectedModule) return null;
        return `session.html?mode=quick&module=${encodeURIComponent(selectedModule)}&count=20&feedback=instant`;
    }
    if (sessionId === 'random') {
        return 'session.html?mode=quick&count=30&feedback=instant';
    }
    if (sessionId === 'fixed') {
        return 'session.html?mode=fixed';
    }
    if (sessionId === 'random-thematic') {
        return selectedModule
            ? `session.html?mode=quick&module=${encodeURIComponent(selectedModule)}&count=20&feedback=instant`
            : 'session.html?mode=quick-random-module&count=20&feedback=instant';
    }
    return 'session.html?mode=quick&count=30&feedback=instant';
}

function describeMode(session) {
    if (!session) return '';
    const hints = {
        thematic: 'Choisis un module, puis lance 20 questions avec correction immediate.',
        random: '30 questions tirees dans toute la banque, correction immediate.',
        fixed: 'Serie pregeneree, notation finale uniquement.',
        'random-thematic': '20 questions sur un module choisi (ou aleatoire).'
    };
    return hints[session.id] || session.advice || '';
}

function initTrainingPage() {
    const sessions = parseTrainingSessions();
    const detailsHelp = document.getElementById('selected-mode-help');
    const moduleSelect = document.getElementById('training-module-select');
    const launchSelectedBtn = document.getElementById('start-selected-mode-btn');
    let selectedMode = null;

    function startMode(modeId) {
        const moduleId = moduleSelect?.value || '';
        const target = sessionRoute(modeId, moduleId);
        if (!target) {
            alert('Selectionne un module pour ce mode.');
            return;
        }
        window.location.href = target;
    }

    function setSelected(modeId) {
        selectedMode = sessions.find(item => item.id === modeId) || null;
        if (launchSelectedBtn) {
            launchSelectedBtn.disabled = !selectedMode;
        }
        if (detailsHelp) {
            detailsHelp.textContent = describeMode(selectedMode);
        }
        document.querySelectorAll('[data-session]').forEach(card => {
            card.classList.toggle('is-selected', card.dataset.session === modeId);
        });
    }

    document.querySelectorAll('[data-session]').forEach(card => {
        const sessionId = card.dataset.session;
        const clickHandler = () => setSelected(sessionId);
        card.addEventListener('click', clickHandler);
        card.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') clickHandler();
        });
    });

    document.querySelectorAll('[data-session-start]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            startMode(button.dataset.sessionStart);
        });
    });

    if (launchSelectedBtn) {
        launchSelectedBtn.addEventListener('click', () => {
            if (!selectedMode) return;
            startMode(selectedMode.id);
        });
    }

    if (sessions.length) setSelected(sessions[0].id);
}

document.addEventListener('DOMContentLoaded', initTrainingPage);
