# Drive Import

Ce dossier sert de point d'entree quand tu exportes le contenu de Google Drive.

## Fichier attendu
- `attendus-pe.json`

## Format minimal
```json
{
  "categories": [
    {
      "id": "reglementation",
      "name": "Reglementation",
      "description": "Attendus PE - reglementation",
      "module": 1,
      "questions": [
        {
          "id": "reg_1",
          "text": "Question ...",
          "difficulty": 2,
          "answers": [
            { "text": "Reponse A", "correct": false },
            { "text": "Reponse B", "correct": true },
            { "text": "Reponse C", "correct": false }
          ]
        }
      ]
    }
  ]
}
```

## Commande d'import
- `npm run import:attendus`

Le script genere `src/data/qcm.drive.merged.json`.
