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

## Structure actuelle (5 pages)
- `docs/index.html`
- `docs/parcours.html`
- `docs/entrainement.html`
- `docs/examens.html`
- `docs/carnet.html`

Sources:
- templates: `src/templates/`
- styles: `src/css/style.css`
- scripts: `src/js/`
- donnees: `src/data/`

## Pages futures
Les templates et scripts pour des pages supplementaires (flashcards, game, calculator) sont conserves dans `src/templates/` et `src/js/` pour activation ulterieure.
