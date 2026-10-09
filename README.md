# Patron d'embarcation

Cours de navigation, QCM d'entraînement, exercices et fiches de pratique pour préparer le
brevet de patron d'embarcation (scouts marins), et plus largement pour apprendre à naviguer
sur un voilier.

Site publié par GitHub Pages depuis le dossier `docs/`.

## Pour les chefs

Le mode d'emploi complet est sur le site : **Espace chefs > Guide** (`chefs/guide.html`).
En résumé :

- **Espace chefs** : lien en haut de chaque page quand on est chef, avec le nombre de choses à faire.
  Son accueil liste ce qui attend (comptes à valider, diplômes à confirmer, demandes de validation de
  carnet, questions sans réponse d'un formateur, équipages à composer ou sans chef d'équipage, saison
  suivante à préparer en août), chacun avec un lien vers l'endroit où agir. Onglets : Accueil, Inscrits,
  Équipages, Résultats, Tableaux de bord, Guide.
- **Inscriptions** : chaque scout crée son compte, un chef le valide (Inscrits). Un chef nomme les
  autres chefs depuis la même page.
- **Rentrée** : créer ou fermer les équipages, composer la saison (« Reprendre la composition de la
  saison précédente »), cocher un chef d'équipage par équipage, **enregistrer** ; demander aux scouts
  de choisir leur objectif (PE, CQ, CF) et de déclarer leurs diplômes dans Mon espace.
- **Au fil de l'année** : confirmer les diplômes, répondre aux questions, suivre les résultats et les
  tableaux de bord, donner des points bonus. Le classement se met à jour tout seul.
- **Avant un examen** : prérequis (badges de diplômes), modules du PE (18 mois), carnet, épreuves
  blanches, CV et inscription sur Céphée.
- **Annales** : voir plus bas.

### Qui peut faire quoi

Imposé par `firestore.rules` (et reproduit par l'interface) :

| | Chef | Chef d'équipage (CE) | Scout |
|---|---|---|---|
| Valider les comptes, nommer un chef, confirmer un diplôme | oui | non | non (déclare les siens) |
| Créer, composer les équipages, nommer les CE, points bonus | oui | non | non |
| Publier le classement | oui (automatique) | non | non |
| Tableau de bord, résultats et carnet d'un scout | tous | ses équipiers | les siens |
| Valider un point de carnet | tous (sauf le sien) | ses équipiers | non (il demande) |
| Supprimer des résultats, modérer les questions | oui | non | sa question sans réponse |
| Nom, unité, objectif, déclarations, demandes, ses QCM | les siens | les siens | les siens |

Les titulaires confirmés du PE, du CQ ou du CF sont « formateurs » : leurs réponses aux questions
sont mises en avant, sans autre droit.

## Annales ajoutées par les chefs

Déposer le fichier dans `docs/fichiers/annales` depuis GitHub (Add file > Upload files), nommé
`qcm|carto|maree-ANNEE[-session]-sujet|corrige.ext` (par exemple `qcm-2026-sujet.pdf`,
`carto-2026-juin-corrige.pdf`). L'action GitHub `.github/workflows/build.yml` reconstruit le site
à chaque push et publie la nouvelle ligne du tableau. Un fichier mal nommé n'apparaît pas.

## Organisation du code

```
build.mjs             générateur (Node, sans dépendance)
serve.mjs             petit serveur local pour relire le site
firestore.rules       règles de sécurité de la base Firebase
src/layout.html       gabarit commun (barre du haut, menu, zone compte)
src/pages/            contenu : cours/, qcm/, exercices/, pratique/, cqcf/, parcours/, annales/,
                      et, avec les comptes : questions/, compte/, carnet/, equipage/, equipages/, chefs/
src/sw.js             service worker (site installable et consultable hors ligne)
src/css/style.css     mise en page
src/js/               figures.js, qcm.js, exos.js, outils.js, site.js (thème, menu)
                      comptes : auth.js (connexion, barre du compte), fb.js (seul accès à Firebase),
                      ui.js (messages, confirmations), diplomes.js, attendus.js (carnets), saison.js,
                      classement.js (points), agregats.js (classement publié), afaire.js (à faire
                      des chefs), compte.js, carnet.js, accueil.js, questions.js, equipage.js,
                      equipages.js, chefs.js (accueil chefs), inscrits.js, chefs-equipages.js,
                      resultats.js ; firebase-config.js
docs/                 site généré (ne pas modifier à la main)
docs/fichiers/        fichiers servis tels quels (annales PDF), conservés par le build
```

Chaque page commence par un en-tête `<!--meta {"title": ..., "order": ...} -->`. Clés utiles :
`part` (partie du site), `wide`, `scripts`, et `chefs` pour les pages de l'espace chefs (onglet
courant ; la barre d'onglets est ajoutée par le build). Les blocs `<!--IF_AUTH-->…<!--END_IF_AUTH-->`
n'apparaissent que si Firebase est configuré. Les titres `h2`/`h3`, les encadrés (définition,
propriété, méthode, exemple) et les figures sont numérotés automatiquement dans les cours. Les
figures se décrivent par des balises courtes :

```html
<x-balise type="babord"/>  <x-marques seq="cone-haut,cone-haut"/>  <x-nuit preset="moteur-face"/>
<x-pavillon code="H"/>  <x-feu r="Q(3)" c="W" p="10"/>  <x-son s=".."/>
```

Les questions du QCM sont dans `src/js/qcm/` : un fichier par thème, `index.js` (thèmes, plan
d'épreuve `EXAM_PLAN`) et `generees.js`, qui fabrique des questions à partir des figures
(marques, feux, pavillons, signaux sonores et de port) : ajouter une entrée à ses tables suffit.
Les exercices sont générés aléatoirement par `src/js/exos.js`.

## Données (Firestore)

- `users/{uid}` : nom, unité, rôle (`eleve` ou `chef`), `approved`, objectif, diplômes confirmés
  `dip`, et par saison l'équipage `eq` et le rôle de chef d'équipage `ce` (`{ '2026': '<id>' }`),
  recopiés par les chefs à l'enregistrement de la composition.
- `diplomes/{uid}` : déclarations du scout en attente ; `carnets/{uid}` : points validés ;
  `demandes/{uid}_{point}` : demandes de validation.
- `results/` : un document par QCM ; `stats/{saison}_{uid}` : résumé de saison d'un scout.
- `equipages/`, `saisons/{saison}/equipages/` (composition), `bonus/`.
- `classement/{saison}_{eq}` : agrégats par équipage, seuls lus par les scouts. Écrits par les chefs
  uniquement : à l'ouverture de la page Classement, à l'enregistrement d'une composition ou d'un
  bonus, et en arrière-plan quand un chef consulte n'importe quelle page (au plus toutes les
  30 minutes, horodatage en `localStorage`).
- `questions/` et leurs `answers/`.

Le compteur « à faire » de la barre des chefs est recalculé au plus toutes les 10 minutes
(cache en `sessionStorage`), pour limiter les lectures.

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
publie `docs/` (l'action GitHub reconstruit aussi le site à chaque push).

## Accès réservé et comptes (Firebase, gratuit)

Tant que `src/js/firebase-config.js` est vide, le site est ouvert à tous, sans comptes : pas de
questions, d'équipages, de carnets ni d'espace chefs. Pour les activer :

1. Sur <https://console.firebase.google.com>, créer un projet (offre Spark, gratuite ;
   Google Analytics inutile).
2. **Authentication** > Commencer > Méthode de connexion : activer **Adresse e-mail/Mot de passe**.
3. **Authentication** > Paramètres > Domaines autorisés : ajouter `philibertpap.github.io`
   (`localhost` y est déjà).
4. **Firestore Database** > Créer une base de données, en mode production, région `eur3`
   (Europe).
5. **Firestore Database** > Règles : remplacer le contenu par celui de `firestore.rules`,
   puis Publier.
6. **Paramètres du projet** > Vos applications > icône Web `</>` : enregistrer une
   application (sans Hosting). Copier l'objet `firebaseConfig` affiché dans
   `src/js/firebase-config.js`.
7. `npm run build`, commit, push.
8. Sur le site, créer son propre compte. Puis dans la console Firestore, collection `users`,
   ouvrir son document et mettre `approved` à `true` et `role` à `"chef"`.
   Ensuite tout se fait depuis le site : **Espace chefs** (lien en haut de chaque page).

**Règles à republier** : à chaque modification de `firestore.rules`, recopier le fichier dans la
console (Firestore Database > Règles > Publier). Les règles de cette version retirent au chef
d'équipage le droit de publier le classement : tant qu'elles ne sont pas republiées, l'ancienne
version reste en vigueur.

Limites à connaître :

- Le dépôt GitHub étant public, le contenu du site (cours, QCM) reste lisible sur GitHub
  pour qui le cherche : la connexion empêche de naviguer sur le site, elle ne chiffre pas les
  pages. Les données des inscrits (résultats, carnets, diplômes, questions) sont, elles,
  réellement protégées par les règles Firestore. Pour tout cacher, il faut un dépôt privé avec
  GitHub Pages, ce qui demande GitHub Pro (gratuit avec le GitHub Student Pack).
- L'offre gratuite n'envoie pas de notification par e-mail aux chefs : le compteur de l'espace
  chefs signale les comptes, diplômes, demandes et questions en attente.
- Les statistiques de QCM sont écrites par le scout lui-même (sans serveur, c'est le seul moyen
  avec l'offre gratuite) : un scout habile pourrait les falsifier. Le classement est un jeu,
  pas une évaluation.
- Quotas gratuits (50 000 lectures et 20 000 écritures par jour) très au-dessus des besoins
  d'un groupe scout.

## Sources

Cours repris et mis à jour à partir des supports de formation des Scouts marins d'Europe de
Brest (dossier `Cours Nav pour scouts-marins/`) et de ceux du groupe Notre-Dame-des-Champs des
Scouts unitaires de France (dossier `cours_ndc/`), non versionnés (taille, données personnelles), du RIPAM,
du système de balisage AISM région A et de la division 240.
