# site_pe
Site d'entraînement à l'examen du PE pour les scouts du groupe NDC.

## Build et lancement
- `npm run build` genere le site statique dans `docs/`.
- `npm start` build puis sert `docs/` sur le port 8000.
- `npm test` execute les tests d'integrite des donnees et du moteur QCM.
- `npm run generate:series` genere `src/data/exam-series.json` (6 series de 30 questions).

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
