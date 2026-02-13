class SitePE {
    constructor() {
        this.profileKey = 'sitepe_profile_code';
        this.profileCode = this.getStoredProfileCode();
        this.storageKey = this.buildStorageKey(this.profileCode);
        this.progress = { modules: {}, examHistory: [] };
        this.data = { site: {}, qcm: {}, exercises: {}, problems: {} };
        this.qcmTimer = null;
        this.init();
    }

    getStoredProfileCode() {
        const raw = String(localStorage.getItem(this.profileKey) || 'SCOUT-LOCAL').trim().toUpperCase();
        return raw || 'SCOUT-LOCAL';
    }

    buildStorageKey(profileCode) {
        const safe = String(profileCode || 'SCOUT-LOCAL')
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9_-]/g, '');
        return `sitepe_progress_${safe || 'SCOUT-LOCAL'}`;
    }

    async init() {
        console.log('Initialisation Site PE...');
        await this.loadData();
        this.loadProgress();
        this.setupUI();
    }

    async loadData() {
        try {
            const fetchFirstJson = async (paths) => {
                for (const p of paths) {
                    try {
                        const response = await fetch(p);
                        if (response.ok) return response.json();
                    } catch (_) {
                        // Fallback on next path
                    }
                }
                throw new Error(`Impossible de charger ${paths.join(' ou ')}`);
            };

            const [site, qcm, exercises, problems] = await Promise.all([
                fetch('data/site.json').then(r => r.json()),
                fetchFirstJson([
                    'data/qcm.drive.merged.json',
                    'data/qcm.web.curated.json',
                    'data/qcm.json',
                    'data/qcm.pe.generated.json',
                    'data/qcm.large.generated.json'
                ]),
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
        if (!saved) {
            this.progress = { modules: {}, examHistory: [] };
            return;
        }
        try {
            const parsed = JSON.parse(saved);
            this.progress = {
                modules: parsed.modules || {},
                examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : []
            };
        } catch (_) {
            this.progress = { modules: {}, examHistory: [] };
        }
    }

    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    setProfileCode(profileCode) {
        const normalized = String(profileCode || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        if (!normalized) {
            alert('Code invalide. Utilise lettres, chiffres, tiret ou underscore.');
            return;
        }
        this.profileCode = normalized;
        localStorage.setItem(this.profileKey, normalized);
        this.storageKey = this.buildStorageKey(normalized);
        this.loadProgress();
        this.updateDashboard();
        window.dispatchEvent(new CustomEvent('sitepe:profile-changed', { detail: { profileCode: normalized } }));
    }

    setupUI() {
        document.querySelectorAll('[data-qcm-start]').forEach(button => {
            button.onclick = () => this.startQCM(button.dataset.qcmModule);
        });
        document.querySelectorAll('[data-flashcard-start]').forEach(button => {
            button.onclick = () => this.startFlashcards(button.dataset.fcModule);
        });

        const profileInput = document.getElementById('profile-code-input');
        const profileSave = document.getElementById('save-profile-code-btn');
        const profileLabel = document.getElementById('current-profile-code');
        if (profileInput) profileInput.value = this.profileCode;
        if (profileLabel) profileLabel.textContent = this.profileCode;
        if (profileSave && profileInput) {
            profileSave.addEventListener('click', () => {
                this.setProfileCode(profileInput.value);
                profileLabel.textContent = this.profileCode;
            });
        }

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

        document.querySelectorAll('[data-module-progress]').forEach(node => {
            const moduleId = String(node.dataset.moduleProgress || '');
            const stat = this.progress.modules[moduleId];
            const percent = Math.round(stat?.progress || 0);
            node.style.width = `${percent}%`;
        });

        document.querySelectorAll('[data-module-stat]').forEach(node => {
            const moduleId = String(node.dataset.moduleStat || '');
            const stat = this.progress.modules[moduleId];
            if (!stat) return;
            node.textContent = `${Math.round(stat.progress || 0)}% • Score ${Math.round(stat.bestScore || 0)}/100 • Tentatives ${stat.attempts || 0}`;
        });
    }

    buildQcmImageHtml(question) {
        if (!question.image) return '';
        return `<figure class="qcm-media mt-3 mb-3">
            <img class="img-fluid rounded qcm-illustration" src="${question.image}" alt="Illustration de la question ${this.qcm.idx + 1}" loading="lazy"
                onerror="this.style.display='none'; this.parentElement.classList.add('qcm-media-missing');">
            <figcaption class="qcm-media-fallback">Illustration indisponible sur cet appareil. Continue le QCM avec l enonce.</figcaption>
        </figure>`;
    }

    buildQuestionContextHtml(question) {
        const context = String(question?.context || '').trim();
        if (!context) return '';
        return `<div class="alert alert-info qcm-context">${this.escapeHtml(context)}</div>`;
    }

    escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    buildAnswerReviewList(question, selectedIndex, correctIndex) {
        return question.answers.map((answer, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = correctIndex === index;
            let className = 'qcm-answer-item';
            let badge = '';
            if (isCorrect) {
                className += ' qcm-answer-correct';
                badge = '<span class="badge text-bg-success ms-2">Bonne</span>';
            }
            if (isSelected && !isCorrect) {
                className += ' qcm-answer-selected-wrong';
                badge = '<span class="badge text-bg-danger ms-2">Ta reponse</span>';
            }
            if (isSelected && isCorrect) {
                className += ' qcm-answer-selected-correct';
                badge = '<span class="badge text-bg-success ms-2">Ta reponse</span>';
            }
            return `<li class="${className}">${this.escapeHtml(answer.text)}${badge}</li>`;
        }).join('');
    }

    generateFallbackExplanation(question, correctIndex) {
        const correctAnswer = question.answers?.[correctIndex]?.text || '';
        const fullText = String(`${question.text || ''} ${question.context || ''}`).toLowerCase();
        let reference = 'Reference cours: module theorique PE correspondant.';
        let reason = 'Appliquer la regle du module, puis verifier la coherence avec les donnees de l enonce.';
        if (fullText.includes('entrant au port')) {
            reference = 'Reference cours: balisage lateral region A.';
            reason = 'En region A, en entrant du large vers le port, on garde les marques rouges a babord et vertes a tribord.';
        } else if (fullText.includes('angle') && fullText.includes('feu blanc') && fullText.includes('tete')) {
            reference = 'Reference: RIPAM regles 21 et 23.';
            reason = 'Le feu blanc de tete de mat couvre 225 deg sur l avant.';
        } else if (fullText.includes('feu de poupe')) {
            reference = 'Reference: RIPAM regle 21.';
            reason = 'Le feu de poupe couvre 135 deg vers l arriere.';
        } else if (fullText.includes('canal') && fullText.includes('vhf')) {
            reference = 'Reference cours: procedures VHF de detresse.';
            reason = 'En detresse vocale, le premier appel se fait sur le canal 16.';
        } else if (fullText.includes('300 m') || fullText.includes('bande cotiere')) {
            reference = 'Reference cours: reglementation cotiere.';
            reason = 'La vitesse y est strictement limitee pour la securite des usagers et baigneurs.';
        } else if (fullText.includes('veille')) {
            reference = 'Reference: RIPAM regle 5.';
            reason = 'La veille visuelle et auditive est permanente en navigation.';
        } else if (fullText.includes('rattrap')) {
            reference = 'Reference: RIPAM regle 13.';
            reason = "Le navire rattrapant est situe dans le secteur de 135 deg arriere de l'autre navire.";
        }
        return `Reponse correcte: ${correctAnswer}. ${reference} Explication: ${reason}`;
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
                timeLimitMinutes: null,
                instantFeedback: true
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
                seriesId: metadata.seriesId || null,
                instantFeedback: Boolean(metadata.instantFeedback)
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
        const imageHtml = this.buildQcmImageHtml(question);
        const contextHtml = this.buildQuestionContextHtml(question);

        const actionLabel = this.qcm?.metadata?.instantFeedback ? 'Valider' : 'Suivant';
        const html = `<div class="qcm-question">
            <div class="progress mb-3"><div class="progress-bar" style="width:${progress}%"></div></div>
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">${this.qcm.idx + 1}/${this.qcm.q.length}</h5>
                ${this.getTimerBadgeHtml()}
            </div>
            ${contextHtml}
            <h4>${question.text}</h4>
            ${imageHtml}
            <div class="options mt-4">${options}</div>
            <button class="btn btn-primary mt-4" onclick="window.sitePE.nextQCM()">${actionLabel}</button>
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
        const selectedIndex = Number.parseInt(selected.value, 10);
        this.qcm.answers[this.qcm.idx] = selectedIndex;
        const isCorrect = selectedIndex === correctIndex;

        if (isCorrect) {
            this.qcm.score += 100 / this.qcm.q.length;
        } else {
            this.qcm.errors += 1;
        }

        if (this.qcm?.metadata?.instantFeedback) {
            this.renderImmediateFeedback(question, selectedIndex, correctIndex, isCorrect);
            return;
        }

        this.qcm.idx += 1;
        this.displayQCM();
    }

    continueQCM() {
        if (!this.qcm || this.qcm.isFinished) return;
        this.qcm.idx += 1;
        this.displayQCM();
    }

    renderImmediateFeedback(question, selectedIndex, correctIndex, isCorrect) {
        const remaining = this.getRemainingSeconds();
        if (remaining != null && remaining <= 0) {
            this.forceEndQcmByTimeout();
            return;
        }

        const statusClass = isCorrect ? 'alert-success' : 'alert-warning';
        const statusText = isCorrect ? 'Bonne reponse.' : 'Reponse incorrecte.';
        const explanationText = String(question.explanation || '').trim() || this.generateFallbackExplanation(question, correctIndex);
        const explanation = `<p class="mb-0"><strong>Explication:</strong> ${this.escapeHtml(explanationText)}</p>`;
        const imageHtml = this.buildQcmImageHtml(question);
        const contextHtml = this.buildQuestionContextHtml(question);

        const html = `<div class="qcm-question">
            <div class="progress mb-3"><div class="progress-bar" style="width:${((this.qcm.idx + 1) / this.qcm.q.length) * 100}%"></div></div>
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">${this.qcm.idx + 1}/${this.qcm.q.length}</h5>
                ${this.getTimerBadgeHtml()}
            </div>
            ${contextHtml}
            <h4>${this.escapeHtml(question.text)}</h4>
            ${imageHtml}
            <div class="alert ${statusClass} mt-3">${statusText}</div>
            <ul class="mb-3 qcm-answer-list">${this.buildAnswerReviewList(question, selectedIndex, correctIndex)}</ul>
            ${explanation}
            <button class="btn btn-primary mt-4" onclick="window.sitePE.continueQCM()">Question suivante</button>
        </div>`;

        const container = this.getQcmContainer();
        if (container) container.innerHTML = html;
        this.renderQcmTimerOnly();
    }

    endQCM(options = {}) {
        if (!this.qcm || this.qcm.isFinished) return;
        this.qcm.isFinished = true;
        this.stopQcmTimer();

        const score = Math.round(this.qcm.score);
        const passed = score >= 75 && this.qcm.errors <= 5;
        const timedOut = Boolean(options.timedOut);
        const mode = this.qcm?.metadata?.mode || 'custom';
        const moduleIds = [...new Set((this.qcm.q || []).map(question => String(question.moduleId || '')).filter(Boolean))];
        const exam = {
            date: new Date().toLocaleString('fr-FR'),
            score,
            errors: this.qcm.errors,
            passed,
            timedOut,
            mode,
            questionCount: (this.qcm?.q || []).length,
            moduleIds
        };

        this.progress.examHistory.push(exam);
        if (this.progress.examHistory.length > 120) {
            this.progress.examHistory = this.progress.examHistory.slice(-120);
        }
        this.updateModuleProgress(moduleIds, score, passed);
        this.saveProgress();
        const fullExamNextStep = mode === 'full'
            ? '<p><a class="btn btn-outline-secondary btn-sm" href="navigation.html">Continuer avec le probleme de navigation</a></p>'
            : '';
        const reviewHtml = this.buildFinalReviewHtml();

        const html = `<div class="alert ${passed ? 'alert-success' : 'alert-danger'}">
            <h3>${passed ? 'Reussi' : 'A retenter'}</h3>
            ${timedOut ? '<p><strong>Temps écoulé:</strong> la série a été arrêtée automatiquement.</p>' : ''}
            <p><strong>Score: ${score}/100</strong></p>
            <p>Erreurs: ${this.qcm.errors}/5</p>
            <p>Code scout: <strong>${this.profileCode}</strong></p>
            ${fullExamNextStep}
            <button class="btn btn-primary mt-3" onclick="location.reload()">Recommencer</button>
            <a class="btn btn-outline-primary mt-3 ms-2" href="examens.html">Retour examens</a>
        </div>
        ${reviewHtml}`;

        const container = this.getQcmContainer();
        if (container) container.innerHTML = html;
    }

    buildFinalReviewHtml() {
        if (!Array.isArray(this.qcm?.q) || !this.qcm.q.length) return '';
        const rows = this.qcm.q.map((question, index) => {
            const selectedIndex = this.qcm.answers[index];
            const correctIndex = question.answers.findIndex(answer => answer.correct);
            const selectedText = Number.isInteger(selectedIndex) ? question.answers[selectedIndex]?.text : 'Aucune reponse';
            const correctText = question.answers[correctIndex]?.text || '';
            const explanation = String(question.explanation || '').trim() || this.generateFallbackExplanation(question, correctIndex);
            const stateClass = selectedIndex === correctIndex ? 'qcm-review-ok' : 'qcm-review-ko';
            const answerList = this.buildAnswerReviewList(question, selectedIndex, correctIndex);
            return `<article class="qcm-review-item ${stateClass} mb-3 p-3 rounded border">
                <p class="mb-2"><strong>Q${index + 1}.</strong> ${this.escapeHtml(question.text)}</p>
                ${question.context ? `<p class="small text-muted mb-2">${this.escapeHtml(question.context)}</p>` : ''}
                <ul class="mb-2 qcm-answer-list">${answerList}</ul>
                <p class="mb-1 ${selectedIndex === correctIndex ? 'text-success' : 'text-danger'}"><strong>Ta reponse:</strong> ${this.escapeHtml(selectedText || 'Aucune reponse')}</p>
                <p class="mb-1"><strong>Bonne reponse:</strong> ${this.escapeHtml(correctText)}</p>
                <p class="mb-0 small"><strong>Explication:</strong> ${this.escapeHtml(explanation)}</p>
            </article>`;
        }).join('');
        return `<section class="card mt-4"><div class="card-body"><h4 class="h6 mb-3">Correction detaillee immediate</h4>${rows}</div></section>`;
    }

    updateModuleProgress(moduleIds, score, passed) {
        moduleIds.forEach(moduleId => {
            const current = this.progress.modules[moduleId] || {
                attempts: 0,
                passedCount: 0,
                bestScore: 0,
                lastScore: 0,
                progress: 0
            };
            current.attempts += 1;
            current.lastScore = score;
            current.bestScore = Math.max(current.bestScore || 0, score);
            if (passed) current.passedCount += 1;
            current.progress = Math.round((current.bestScore / 100) * 100);
            this.progress.modules[moduleId] = current;
        });
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
