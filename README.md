# site_pe
Site d'entraînement à l'examen du PE pour les scouts du groupe NDC.

## Build et lancement
- `npm run build` genere le site statique dans `docs/`.
- `npm start` build puis sert `docs/` sur le port 8000.
- `npm test` execute les tests d'integrite des donnees et du moteur QCM.
- `npm run generate:series` genere `src/data/exam-series.json` (6 series de 30 questions).
- `npm run generate:qcm:large` genere `src/data/qcm.large.generated.json` (dataset massif).
- `npm run generate:pe:data` genere:
  - `src/data/qcm.pe.generated.json` (dataset QCM PE derive de slides + references web),
  - `src/data/course.generated.json` (contenu "cours" enrichi par module).
- `npm run generate:pe:extracted` genere un dataset rigoureux depuis:
  - `imports/drive/pe_course_dataset.normalized.json`
  - `imports/drive/pe_qcm_bank.schema.json`
  et produit:
  - `src/data/pe_qcm_bank.generated.json`
  - `src/data/qcm.pe.extracted.generated.json`
  - `src/data/qcm.pe.generated.json` (fusion avec base)
  - `src/data/course.generated.json`
- `npm run import:attendus` fusionne `imports/drive/attendus-pe.json` vers `src/data/qcm.drive.merged.json`.
- `npm run generate:annales` indexe `imports/drive/annales` (QCM/carto/maree), extrait les cles de reponses QCM quand disponibles en DOCX, parse le QCM 2022 `.ppsx` et produit:
  - `src/data/annales.manifest.json`
  - `imports/drive/annales/annales.qcm.2022.raw.json`
  - `src/assets/annales/qcm/2022/*` (visuels)

## Structure actuelle
- `docs/index.html`
- `docs/parcours.html`
- `docs/module-1.html` ... `docs/module-10.html` (pages de cours detaillees)
- `docs/entrainement.html`
- `docs/examens.html`
- `docs/carnet.html`
- `docs/session.html`
- `docs/navigation.html`

Sources:
- templates: `src/templates/`
- styles: `src/css/style.css`
- scripts: `src/js/`
- donnees: `src/data/`

## Parcours de cours
- La page `parcours.html` est une vue d'orientation (resume + acces rapide).
- Chaque module ouvre une page dediee `module-{id}.html` avec:
  - cours structure,
  - checklist,
  - QCM cible,
  - sessions d'annales associees,
  - exemples visuels extraits des annales 2022 quand disponibles.
