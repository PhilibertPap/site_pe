# Patron d'embarcation

Cours de navigation, QCM d'entraînement, exercices et fiches de pratique pour préparer le
brevet de patron d'embarcation (scouts marins), et plus largement pour apprendre à naviguer
sur un voilier.

Site publié par GitHub Pages depuis le dossier `docs/`.

## Organisation

```
build.mjs             générateur (Node, sans dépendance)
serve.mjs             petit serveur local pour relire le site
firestore.rules       règles de sécurité de la base Firebase (questions-réponses)
src/layout.html       gabarit commun
src/pages/            contenu : cours/, qcm/, exercices/, pratique/, cqcf/, parcours/, annales/,
                      questions/, compte/, carnet/, equipage(s)/, chefs/
src/sw.js             service worker (site installable et consultable hors ligne)
src/css/style.css     mise en page
src/js/               figures.js (balises, feux, pavillons), qcm.js, exos.js, outils.js,
                      auth.js, fb.js, questions.js, chefs.js, diplomes.js, attendus.js,
                      agregats.js (classement publié), firebase-config.js
docs/                 site généré (ne pas modifier à la main)
docs/fichiers/        fichiers servis tels quels (annales PDF), conservés par le build
```

Chaque page commence par un en-tête `<!--meta {"title": ..., "order": ...} -->`.
Les titres `h2`/`h3`, les encadrés (définition, propriété, méthode, exemple) et les figures
sont numérotés automatiquement. Les figures se décrivent par des balises courtes :

```html
<x-balise type="babord"/>  <x-marques seq="cone-haut,cone-haut"/>  <x-nuit preset="moteur-face"/>
<x-pavillon code="H"/>  <x-feu r="Q(3)" c="W" p="10"/>  <x-son s=".."/>
```

Les questions du QCM sont dans `src/js/qcm/` : un fichier par thème, `index.js` (thèmes, plan
d'épreuve `EXAM_PLAN`) et `generees.js`, qui fabrique des questions à partir des figures
(marques, feux, pavillons, signaux sonores et de port) : ajouter une entrée à ses tables suffit. Les exercices sont générés aléatoirement par `src/js/exos.js`.

## Parcours, diplômes, équipages (comptes activés)

- **Parcours.** Pages publiques `parcours/pe.html`, `cq.html`, `cf.html` (prérequis, examen, étapes ;
  étapes définies dans `src/js/diplomes.js`), reliées depuis l'accueil (« Je prépare »). Chaque inscrit
  choisit son objectif (PE, CQ ou CF) dans Mon espace, qui montre prérequis manquants et avancement.
- **Diplômes.** Le scout déclare un diplôme et son mois (`diplomes/{uid}`) ; un chef le confirme dans la
  Vue d'ensemble (`users/{uid}.dip`). Modules du PE : expiration à 18 mois affichée dans Mon espace.
- **Rôles et accès** (imposés par `firestore.rules`) :
  chef : tout, avec la Vue d'ensemble (inscrits, objectifs, diplômes, carnets) ;
  scout : uniquement ses données ;
  chef d'équipage : statistiques, carnet et demandes de son équipage de la saison, et validation de son carnet ;
  titulaire confirmé du PE, du CQ ou du CF : « formateur » dans les questions, rien de plus.
- **Équipages.** Un chef compose les équipages de chaque saison (Espace chefs > Équipages) ;
  l'enregistrement recopie l'affectation sur les profils (`eq` et `ce` : `{ '2026': '<id>' }`).
- **Classement.** Calculé à partir des statistiques individuelles et publié par équipage
  (`classement/{saison}_{eq}`) quand un chef ouvre l'espace chefs ou la page Équipages, ou qu'un chef
  d'équipage ouvre la page Équipages ou son tableau de bord. Les scouts ne lisent que ces agrégats.
- **Défi de la semaine.** Dix questions identiques pour tous, un seul essai (page QCM).
- **Carnets de progression** PE, CQ et CF (`src/js/attendus.js`) : le scout demande une validation,
  son chef d'équipage ou un chef la donne après avoir signé le carnet papier.

Après une mise à jour de `firestore.rules`, la recopier dans la console Firebase (Règles > Publier).

## Annales ajoutées par les chefs

Déposer le fichier dans `docs/fichiers/annales` depuis GitHub (Add file > Upload files), nommé
`qcm|carto|maree-ANNEE[-mois]-sujet|corrige.ext`. L'action GitHub `.github/workflows/build.yml`
reconstruit le site à chaque push et publie la nouvelle ligne du tableau.

## Téléphone et hors ligne

Le build produit `manifest.webmanifest` et `sw.js` : le site s'installe comme une application
(Android : « Installer l'application » ; iPhone : Partager > « Sur l'écran d'accueil ») et reste
consultable sans réseau. Les PDF d'annales ne sont mis en cache qu'une fois ouverts.

## Construire et relire

```
npm run build        # génère docs/
npm run serve        # génère puis sert sur http://localhost:8000
```

Il faut Node 18 ou plus récent. Ensuite `git add -A`, `git commit`, `git push` : GitHub Pages
publie `docs/`.

## Accès réservé et questions-réponses (Firebase, gratuit)

Tant que `src/js/firebase-config.js` est vide, le site est ouvert à tous et la partie
« Questions » n'apparaît pas. Pour l'activer :

1. Sur <https://console.firebase.google.com>, créer un projet (offre Spark, gratuite ;
   Google Analytics inutile).
2. **Authentication** > Commencer > Méthode de connexion : activer **Adresse e-mail/Mot de passe**.
3. **Authentication** > Paramètres > Domaines autorisés : ajouter `philibertpap.github.io`
   (`localhost` y est déjà).
4. **Firestore Database** > Créer une base de données, en mode production, région `eur3`
   (Europe).
5. **Firestore Database** > Règles : remplacer le contenu par celui de `firestore.rules`,
   puis Publier. À refaire à chaque modification de `firestore.rules`.
6. **Paramètres du projet** > Vos applications > icône Web `</>` : enregistrer une
   application (sans Hosting). Copier l'objet `firebaseConfig` affiché dans
   `src/js/firebase-config.js`.
7. `npm run build`, commit, push.
8. Sur le site, créer son propre compte. Puis dans la console Firestore, collection `users`,
   ouvrir son document et mettre `approved` à `true` et `role` à `"chef"`.
   Ensuite tout se fait depuis le site : page **Comptes** (lien en haut quand on est chef)
   pour valider les inscriptions et nommer d'autres chefs.

Fonctionnement : chaque élève crée un compte, un chef le valide.
Chaque QCM terminé par un inscrit est enregistré : l'élève voit ses résultats sur la page QCM,
les chefs voient la page **Résultats** (réussite par thème, questions les plus ratées, détail
par scout), pratique pour choisir quoi reprendre en séance. Tout le monde voit toutes
les questions et réponses ; les réponses des chefs sont signalées. Un chef peut supprimer
une question ou une réponse ; l'auteur d'une question peut la marquer résolue.

Limites à connaître :

- Le dépôt GitHub étant public, le contenu du site (cours, QCM) reste lisible sur GitHub
  pour qui le cherche : la connexion empêche de naviguer sur le site, elle ne chiffre pas les
  pages. Les **questions-réponses**, elles, sont réellement protégées par les règles
  Firestore. Pour tout cacher, il faut un dépôt privé avec GitHub Pages, ce qui demande
  GitHub Pro (gratuit avec le GitHub Student Pack).
- L'offre gratuite n'envoie pas de notification par e-mail aux chefs quand une question
  arrive : cocher « sans réponse d'un chef » dans la liste, ou passer par la page Comptes,
  qui liste les questions ouvertes.
- Quotas gratuits (50 000 lectures et 20 000 écritures par jour) très au-dessus des besoins
  d'un groupe scout.

## Sources

Cours repris et mis à jour à partir des supports de formation des Scouts marins d'Europe de
Brest (dossier `Cours Nav pour scouts-marins/`) et de ceux du groupe Notre-Dame-des-Champs des
Scouts unitaires de France (dossier `cours_ndc/`), non versionnés (taille, données personnelles), du RIPAM,
du système de balisage AISM région A et de la division 240.
