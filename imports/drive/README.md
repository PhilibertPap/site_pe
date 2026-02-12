# Drive Import

Ce dossier sert de point d'entree quand tu exportes le contenu de Google Drive.

## Fichier attendu
- `attendus-pe.json`
- `pe_course_dataset.normalized.json`
- `pe_qcm_bank.schema.json`
- `pe_course_pages.raw.json` (trace brute, utile pour audit)

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

## Generation depuis extraction normalisee
- `npm run generate:pe:extracted`

Ce pipeline valide les champs contre `pe_qcm_bank.schema.json` puis genere:
- `src/data/pe_qcm_bank.generated.json`
- `src/data/qcm.pe.extracted.generated.json`
- `src/data/qcm.pe.generated.json`
- `src/data/course.generated.json`
