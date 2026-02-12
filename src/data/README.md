# Data Guide

## Files
- `site.json`: structure du site (etapes, modules, contenu principal).
- `qcm.json`: banque de questions QCM, classee par categories.
- `training-sessions.json`: configuration des modes d'entrainement.
- `exercises.json`: flashcards, mini-jeux et calculateurs.
- `navigation-problems.json`: problemes longs de navigation.
- `app-config.json`: configuration generale de l'application.
- `exam-series.json`: optionnel, genere via `npm run generate:series`.
- `qcm.large.generated.json`: optionnel, genere via `npm run generate:qcm:large`.
- `qcm.pe.generated.json`: optionnel, genere via `npm run generate:pe:data`.
- `course.generated.json`: optionnel, genere via `npm run generate:pe:data`.
- `qcm.drive.merged.json`: optionnel, genere via `npm run import:attendus`.

## Convention QCM
- Source de verite: `qcm.json`.
- Chaque categorie contient `questions[]`.
- Chaque question doit contenir:
  - `id`
  - `text`
  - `answers[]` (au moins 2)
  - exactement 1 reponse `correct: true`

## Validation
- Lancer `npm test`.
- Les tests verifient:
  - coherence modules/categories
  - validite schema QCM
  - liens flashcards -> modules
  - validite des sessions d'entrainement
