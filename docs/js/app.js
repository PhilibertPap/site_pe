class SitePE {
    constructor() {
        this.storageKey = 'sitepe_progress';
        this.progress = { modules: {}, examHistory: [] };
        this.data = { site: {}, qcm: {}, exercises: {}, problems: {} };
        this.qcmTimer = null;
        this.init();
    }

    async init() {
        console.log('Initialisation Site PE...');
        await this.loadData();
        this.loadProgress();
        this.setupUI();
    }

    async loadData() {
        try {
            const [site, qcm, exercises, problems] = await Promise.all([
                fetch('data/site.json').then(r => r.json()),
                fetch('data/qcm.json').then(r => r.json()),
                fetch('data/exercises.json').then(r => r.json()),
                fetch('data/navigation-problems.json').then(r => r.json())
            ]);

            this.data = { site, qcm, exercises, problems };
        } catch (e) {
            console.error('Erreur de chargement des donnees:', e);
        }
    }

    loadProgress() {
        const saved = localStorage.getItem(this.storageKey);
        this.progress = saved ? JSON.parse(saved) : { modules: {}, examHistory: [] };
    }

    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    setupUI() {
        document.querySelectorAll('[data-qcm-start]').forEach(button => {
            button.onclick = () => this.startQCM(button.dataset.qcmModule);
        });
        document.querySelectorAll('[data-flashcard-start]').forEach(button => {
            button.onclick = () => this.startFlashcards(button.dataset.fcModule);
        });
        this.updateDashboard();
    }

    updateDashboard() {
        const values = Object.values(this.progress.modules);
        const progress = values.length
            ? values.reduce((sum, item) => sum + (item.progress || 0), 0) / values.length
            : 0;

        const progressBar = document.querySelector('[data-progress-bar]');
        const progressText = document.querySelector('[data-progress-text]');
        if (!progressBar || !progressText) return;

        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }

    startQCM(moduleFilter = null) {
        this.stopQcmTimer();
        const pool = window.QcmEngine
            ? window.QcmEngine.buildQuestionPool(this.data.qcm)
            : [];
        const questions = window.QcmEngine
            ? window.QcmEngine.pickQuestions(pool, {
                moduleId: moduleFilter || null,
                count: moduleFilter ? 15 : 30
            })
            : [];

        if (!questions.length) {
            alert('Aucune question disponible pour ce mode.');
            return;
        }

        this.qcm = {
            q: questions,
            idx: 0,
            answers: [],
            start: Date.now(),
            score: 0,
            errors: 0,
            isFinished: false,
            metadata: {
                mode: moduleFilter ? 'quick-module' : 'quick',
                timeLimitMinutes: null
            }
        };
        this.displayQCM();
    }

    startQCMFromQuestions(questions, metadata = {}) {
        this.stopQcmTimer();
        if (!Array.isArray(questions) || !questions.length) {
            alert('Aucune question disponible dans cette serie.');
            return;
        }

        this.qcm = {
            q: [...questions],
            idx: 0,
            answers: [],
            start: Date.now(),
            score: 0,
            errors: 0,
            metadata: {
                mode: metadata.mode || 'custom',
                timeLimitMinutes: Number.isFinite(metadata.timeLimitMinutes) ? metadata.timeLimitMinutes : null,
                seriesId: metadata.seriesId || null
            },
            isFinished: false
        };
        this.startQcmTimerIfNeeded();
        this.displayQCM();
    }

    startQcmTimerIfNeeded() {
        const minutes = this.qcm?.metadata?.timeLimitMinutes;
        if (!Number.isFinite(minutes) || minutes <= 0) return;

        this.qcm.deadline = Date.now() + Math.floor(minutes * 60 * 1000);
        this.qcmTimer = setInterval(() => {
            if (!this.qcm || this.qcm.isFinished) {
                this.stopQcmTimer();
                return;
            }
            const remaining = this.getRemainingSeconds();
            if (remaining <= 0) {
                this.forceEndQcmByTimeout();
                return;
            }
            this.renderQcmTimerOnly();
        }, 1000);
    }

    stopQcmTimer() {
        if (this.qcmTimer) {
            clearInterval(this.qcmTimer);
            this.qcmTimer = null;
        }
    }

    getRemainingSeconds() {
        if (!this.qcm?.deadline) return null;
        return Math.max(0, Math.floor((this.qcm.deadline - Date.now()) / 1000));
    }

    formatRemainingTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    getTimerBadgeHtml() {
        const seconds = this.getRemainingSeconds();
        if (seconds == null) return '';
        const cls = seconds <= 60 ? 'text-bg-danger' : seconds <= 300 ? 'text-bg-warning' : 'text-bg-secondary';
        return `<span id="qcm-timer" class="badge ${cls}">Temps restant: ${this.formatRemainingTime(seconds)}</span>`;
    }

    renderQcmTimerOnly() {
        const timerEl = document.getElementById('qcm-timer');
        if (!timerEl) return;
        const seconds = this.getRemainingSeconds();
        if (seconds == null) return;
        timerEl.textContent = `Temps restant: ${this.formatRemainingTime(seconds)}`;
        timerEl.classList.remove('text-bg-secondary', 'text-bg-warning', 'text-bg-danger');
        if (seconds <= 60) timerEl.classList.add('text-bg-danger');
        else if (seconds <= 300) timerEl.classList.add('text-bg-warning');
        else timerEl.classList.add('text-bg-secondary');
    }

    forceEndQcmByTimeout() {
        this.endQCM({ timedOut: true });
    }

    getQcmContainer() {
        return document.getElementById('qcm-container') || document.getElementById('exam-container');
    }

    displayQCM() {
        const question = this.qcm.q[this.qcm.idx];
        if (!question) {
            this.endQCM();
            return;
        }

        const progress = ((this.qcm.idx + 1) / this.qcm.q.length) * 100;
        const options = question.answers.map((option, i) => {
            return `<div class="form-check">
                <input class="form-check-input" type="radio" name="ans" value="${i}" id="opt${this.qcm.idx}-${i}">
                <label class="form-check-label" for="opt${this.qcm.idx}-${i}">${option.text}</label>
            </div>`;
        }).join('');

        const html = `<div class="qcm-question">
            <div class="progress mb-3"><div class="progress-bar" style="width:${progress}%"></div></div>
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">${this.qcm.idx + 1}/${this.qcm.q.length}</h5>
                ${this.getTimerBadgeHtml()}
            </div>
            <h4>${question.text}</h4>
            <div class="options mt-4">${options}</div>
            <button class="btn btn-primary mt-4" onclick="window.sitePE.nextQCM()">Suivant</button>
        </div>`;

        const container = this.getQcmContainer();
        if (container) container.innerHTML = html;
    }

    nextQCM() {
        if (this.qcm?.isFinished) return;
        const remaining = this.getRemainingSeconds();
        if (remaining != null && remaining <= 0) {
            this.forceEndQcmByTimeout();
            return;
        }

        const selected = document.querySelector('input[name="ans"]:checked');
        if (!selected) {
            alert('Selectionne une reponse.');
            return;
        }

        const question = this.qcm.q[this.qcm.idx];
        const correctIndex = question.answers.findIndex(option => option.correct);
        const isCorrect = Number.parseInt(selected.value, 10) === correctIndex;

        if (isCorrect) {
            this.qcm.score += 100 / this.qcm.q.length;
        } else {
            this.qcm.errors += 1;
        }

        this.qcm.idx += 1;
        this.displayQCM();
    }

    endQCM(options = {}) {
        if (!this.qcm || this.qcm.isFinished) return;
        this.qcm.isFinished = true;
        this.stopQcmTimer();

        const score = Math.round(this.qcm.score);
        const passed = score >= 75 && this.qcm.errors <= 5;
        const timedOut = Boolean(options.timedOut);
        const exam = {
            date: new Date().toLocaleString('fr-FR'),
            score,
            errors: this.qcm.errors,
            passed,
            timedOut
        };

        this.progress.examHistory.push(exam);
        this.saveProgress();

        const html = `<div class="alert ${passed ? 'alert-success' : 'alert-danger'}">
            <h3>${passed ? 'Reussi' : 'A retenter'}</h3>
            ${timedOut ? '<p><strong>Temps écoulé:</strong> la série a été arrêtée automatiquement.</p>' : ''}
            <p><strong>Score: ${score}/100</strong></p>
            <p>Erreurs: ${this.qcm.errors}/5</p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">Recommencer</button>
        </div>`;

        const container = this.getQcmContainer();
        if (container) container.innerHTML = html;
    }

    startFlashcards(moduleId) {
        const allCards = this.data.exercises.flashcards || [];
        const cards = allCards
            .filter(card => card.moduleId == moduleId)
            .sort(() => Math.random() - 0.5);

        if (!cards.length) {
            alert('Aucune flashcard disponible pour ce module.');
            return;
        }

        this.fc = { cards, idx: 0, learned: [], flipped: false };
        this.displayFC();
    }

    displayFC() {
        const card = this.fc.cards[this.fc.idx];
        if (!card) {
            alert(`${this.fc.learned.length} cartes valides.`);
            return;
        }

        const face = this.fc.flipped ? card.answer : card.question;
        const progress = ((this.fc.idx + 1) / this.fc.cards.length) * 100;
        const html = `<div class="card" style="min-height:300px;">
            <div class="card-body d-flex align-items-center justify-content-center">
                <h3 class="text-center">${face}</h3>
            </div>
        </div>
        <button class="btn btn-outline-primary w-100 mt-2" onclick="window.sitePE.flipFC()">Retourner la carte</button>
        <div class="progress mb-3 mt-3"><div class="progress-bar" style="width:${progress}%"></div></div>
        <div class="btn-group w-100">
            <button class="btn btn-danger" onclick="window.sitePE.nextFC(false)">Difficile</button>
            <button class="btn btn-warning" onclick="window.sitePE.nextFC(false)">Reviser</button>
            <button class="btn btn-success" onclick="window.sitePE.nextFC(true)">Acquis</button>
        </div>`;

        const container = document.getElementById('flashcards-container');
        if (container) container.innerHTML = html;
    }

    flipFC() {
        this.fc.flipped = !this.fc.flipped;
        this.displayFC();
    }

    nextFC(isLearned) {
        if (isLearned) this.fc.learned.push(this.fc.cards[this.fc.idx].id);
        this.fc.idx += 1;
        this.fc.flipped = false;
        this.displayFC();
    }

    calcTide(pm, bm, pmTime, queryTime) {
        const diff = Math.abs((queryTime - pmTime) / 3600000);
        if (diff > 6) return bm;
        const rule = [1 / 12, 2 / 12, 3 / 12, 3 / 12, 2 / 12, 1 / 12];
        const marnage = pm - bm;
        let height = bm;
        for (let i = 0; i < Math.floor(diff); i++) height += rule[i] * marnage;
        return Math.round(height * 100) / 100;
    }

    calcCourse(cc, decl, dev) {
        return cc + decl + dev;
    }

    calcDrift(cv, windAngle, windSpeed) {
        return cv + (windSpeed * Math.sin(windAngle * Math.PI / 180)) * 0.1;
    }
}

window.sitePE = new SitePE();
