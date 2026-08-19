# Application de gestion des fouilles de l'abbaye de Morimond

Application de visualisation, de projection cartographique et d'analyse statistique des campagnes de fouilles archéologiques de l'abbaye de Morimond. Développée avec Electron.

---

## 🚀 Fonctionnalités principales

*   **🗺️ Carte Interactive & Carroyage** : 
    *   Affichage d'un fond de carte avec grille de carroyage dynamique.
    *   Outils de navigation complets : zoom interactif (boutons +/- ou molette), déplacement (pan) à la souris, et réinitialisation de la vue.
    *   Infobulles détaillées (tooltips) au survol de chaque carreau et légende de densité de trouvailles (du mono-objet à la zone très dense).
    *   Export/Téléchargement de la carte projetée au format image (`.png`).
*   **📊 Statistiques & Graphiques** :
    *   Tableau de bord présentant le nombre total d'objets, le nombre de zones fouillées et le total d'Unités Stratigraphiques (US).
    *   Graphique dynamique et interactif (alimenté par Chart.js) permettant d'analyser la répartition des trouvailles par année ou par catégorie.
*   **🔍 Exploration de Données** :
    *   Tableau de résultats paginé avec un filtre de recherche dynamique pour filtrer instantanément par zone.
*   **📥 Importation & Base Locale** :
    *   Importation directe de fichiers Excel (`.xlsx`) via glisser-déposer (Drag & Drop) ou sélection de fichier pour les données de fouilles (`base_de_donnees_consolidee.xlsx`) et la configuration du carroyage (`carroyage.xlsx`).
    *   Conversion automatique en bases JSON locales (`fouilles.json` et `carroyage.json`) pour un fonctionnement autonome sans dépendance permanente vis-à-vis des fichiers Excel.

---

## 🛠️ Installation et Lancement

### Prérequis

Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé sur votre machine.

### Installation des dépendances

Installez les dépendances du projet à l'aide de npm :

```bash
npm install
```

### Lancement en mode développement

Démarrez l'application avec la commande suivante :

```bash
npm start
```

---

## 📦 Distribution et Packaging (Packaging applicatif)

Le processus de packaging utilise **electron-builder** pour générer des installateurs spécifiques pour les différents systèmes d'exploitation.

*   **Compiler pour l'OS actuel (répertoire temporaire / non compressé)** :
    ```bash
    npm run package
    ```
*   **Générer l'installateur pour l'OS actuel** :
    ```bash
    npm run dist
    ```
*   **Générer les installateurs par plateforme** :
    *   **macOS** : `npm run dist:mac`
    *   **Windows** : `npm run dist:win`
    *   **Linux** : `npm run dist:linux`
    *   **Toutes plateformes** : `npm run dist:all`

Les fichiers compilés et les installateurs sont générés dans le dossier `dist/`.

---

## ⚙️ Configuration cartographique

Le fond de carte utilisé pour les projections se situe dans `assets/img/plan-morimond.jpg`. 
Pour un affichage correct du carroyage :
*   Sa taille de référence est de `4218x5318` pixels.
*   Les carreaux de la grille terrain y correspondent à des zones de `106x106` pixels.