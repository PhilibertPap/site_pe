function waitForSitePE(maxRetries = 50) {
    return new Promise((resolve, reject) => {
        let retries = 0;
        const timer = setInterval(() => {
            const isReady = window.sitePE && window.sitePE.data && window.sitePE.data.qcm;
            if (isReady) {
                clearInterval(timer);
                resolve(window.sitePE);
                return;
            }
            retries += 1;
            if (retries >= maxRetries) {
                clearInterval(timer);
                reject(new Error('SitePE non initialise'));
            }
        }, 100);
    });
}

function setSessionHeader(text, info) {
    const subtitle = document.getElementById('session-subtitle');
    const infoBox = document.getElementById('session-info');
    if (subtitle) subtitle.textContent = text;
    if (infoBox) infoBox.innerHTML = info;
}

async function loadExamSeries() {
    const response = await fetch('data/exam-series.json');
    const payload = await response.json();
    return Array.isArray(payload.series) ? payload.series : [];
}

async function startSessionFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') || 'quick';
    const moduleId = params.get('module');
    const seriesId = Number.parseInt(params.get('seriesId') || '', 10);
    const sitePE = await waitForSitePE();

    if (mode === 'quick') {
        const moduleLabel = moduleId ? `module ${moduleId}` : 'tous modules';
        setSessionHeader(
            'QCM rapide',
            `<strong>Mode:</strong> QCM rapide • <strong>Filtre:</strong> ${moduleLabel} • Pas de limite de temps`
        );
        sitePE.startQCM(moduleId || null);
        return;
    }

    const series = await loadExamSeries();
    if (!series.length) {
        setSessionHeader('Erreur', 'Aucune serie d examen disponible.');
        return;
    }

    if (mode === 'fixed') {
        const selected = series.find(item => item.id === seriesId);
        if (!selected) {
            setSessionHeader('Erreur', `Serie ${seriesId} introuvable.`);
            return;
        }
        setSessionHeader(
            selected.name,
            `<strong>Mode:</strong> Serie fixe • <strong>Questions:</strong> ${selected.questions.length} • <strong>Temps:</strong> 30 minutes`
        );
        sitePE.startQCMFromQuestions(selected.questions, {
            mode: 'fixed',
            seriesId: selected.id,
            timeLimitMinutes: 30
        });
        return;
    }

    if (mode === 'full') {
        const selected = series[Math.floor(Math.random() * series.length)];
        setSessionHeader(
            `Examen complet (${selected.name})`,
            `<strong>Mode:</strong> Examen complet • <strong>Questions:</strong> ${selected.questions.length} • <strong>Temps:</strong> 30 minutes`
        );
        sitePE.startQCMFromQuestions(selected.questions, {
            mode: 'full',
            seriesId: selected.id,
            timeLimitMinutes: 30
        });
        return;
    }

    setSessionHeader('Mode inconnu', `Le mode "${mode}" n'est pas reconnu.`);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await startSessionFromQuery();
    } catch (error) {
        console.error('Erreur session:', error);
        setSessionHeader('Erreur', 'Impossible de lancer la session.');
    }
});
