class SitePE {
    constructor() {
        this.storageKey = 'sitepe_progress';
        this.progress = { modules: {}, examHistory: [] };
        this.data = { site: {}, qcm: {}, exercises: {}, problems: {} };
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
        const allQuestions = this.data.qcm.questions || [];
        let questions = [...allQuestions];
        if (moduleFilter) {
            questions = questions.filter(question => question.moduleId == moduleFilter);
        }

        this.qcm = {
            q: questions.sort(() => Math.random() - 0.5),
            idx: 0,
            answers: [],
            start: Date.now(),
            score: 0,
            errors: 0
        };
        this.displayQCM();
    }

    displayQCM() {
        const question = this.qcm.q[this.qcm.idx];
        if (!question) {
            this.endQCM();
            return;
        }

        const progress = ((this.qcm.idx + 1) / this.qcm.q.length) * 100;
        const options = question.options.map((option, i) => {
            return `<div class="form-check">
                <input class="form-check-input" type="radio" name="ans" value="${i}" id="opt${this.qcm.idx}-${i}">
                <label class="form-check-label" for="opt${this.qcm.idx}-${i}">${option.text}</label>
            </div>`;
        }).join('');

        const html = `<div class="qcm-question">
            <div class="progress mb-3"><div class="progress-bar" style="width:${progress}%"></div></div>
            <h5>${this.qcm.idx + 1}/${this.qcm.q.length}</h5>
            <h4>${question.question}</h4>
            <div class="options mt-4">${options}</div>
            <button class="btn btn-primary mt-4" onclick="window.sitePE.nextQCM()">Suivant</button>
        </div>`;

        const container = document.getElementById('qcm-container');
        if (container) container.innerHTML = html;
    }

    nextQCM() {
        const selected = document.querySelector('input[name="ans"]:checked');
        if (!selected) {
            alert('Selectionne une reponse.');
            return;
        }

        const question = this.qcm.q[this.qcm.idx];
        const correctIndex = question.options.findIndex(option => option.correct);
        const isCorrect = Number.parseInt(selected.value, 10) === correctIndex;

        if (isCorrect) {
            this.qcm.score += 100 / this.qcm.q.length;
        } else {
            this.qcm.errors += 1;
        }

        this.qcm.idx += 1;
        this.displayQCM();
    }

    endQCM() {
        const score = Math.round(this.qcm.score);
        const passed = score >= 75 && this.qcm.errors <= 5;
        const exam = {
            date: new Date().toLocaleString('fr-FR'),
            score,
            errors: this.qcm.errors,
            passed
        };

        this.progress.examHistory.push(exam);
        this.saveProgress();

        const html = `<div class="alert ${passed ? 'alert-success' : 'alert-danger'}">
            <h3>${passed ? 'Reussi' : 'A retenter'}</h3>
            <p><strong>Score: ${score}/100</strong></p>
            <p>Erreurs: ${this.qcm.errors}/5</p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">Recommencer</button>
        </div>`;

        const container = document.getElementById('qcm-container');
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
