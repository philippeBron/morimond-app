# Application de gestion des fouilles de l'abbaye de Morimond

Application de projection cartographique des campagnes de fouilles de l'abbaye de Morimond. Cette application est basée sur le framework eletronjs.

## Installation

Pour pouvoir utiliser cette application, il faut tout d'abord installer electronjs dans l'environnement de développement à l'aide de la commande :

```
npm install
```

L'application se lance depuis une ligne de commande en utilisant la syntaxe :

```
npm start
```

Pour générer l'application pour Windows, on utilise la commande :

```
npm run package-win
```

### Configuration de la carte

Le fond de carte servant à l'affichage est sité dans le répertoire `assets/img` et s'appelle `plan-v2_2019.jpg`. Son échelle et sa définition doivent être cohérentes avec la représentation du carroyage. L'image actuelle à une taille de `4218x5318` et les carreaux ont une taille en pixel de `106x106`.

## Utilisation

L'application se lance en utilisant le fichier `.exe` se trouvant à la racine du répertoire de l'application.

### Chargement des données

Le chargement des données de fouille et du carroyage se font au travers du menu FIchier de l'application. Le menu `Chargement des données` utilise le fichier `base_de_donnees_consolidee.xlsx` qui doit être positionné dans le répertoire racine de l'application. Le menu `Chargement du carroyage` fait appel au fihier `carroyage.xlsx` qui doit être également enregistré dans le répertoire racine de l'application.

Le chargement de ces deux fichiers crées les fichiers `.json` qui serviront de base de données locale à l'application. Une fois utilisés, les fichiers `.xlsx` ne sont plus nécessaire au fonctionnement de l'application. Les fichiers générés sont `fouilles.json`pour les données de fouilles et `carroyage.json` pour les données du carroyage à utiliser.

### Visualisation

Le bouton `Visualiser` permet de générer une carte donnant une vue d'ensemble du plan. Il affiche une image à `1/4` de la définition originale.

Le bouton `Agrandir` permet d'afficher une image à la taille et la définition maximales.

Le bouton `Télécharger` permet de télécharge l'image affichée. Le résulat sera donc une image à une échelle `1/4` ou `1` en fonction du choix.