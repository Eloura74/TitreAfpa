# Organisation des styles CSS

## Structure du dossier

```
styles/
├── abstracts/             # Abstractions, variables et utilitaires
│   ├── _variables.css     # Variables CSS et configuration globale
│   ├── _mixins.css        # Classes utilitaires et "mixins" CSS
│   └── _animations.css    # Animations et keyframes
│
├── base/                  # Styles de base
│   ├── _reset.css         # Reset CSS et styles fondamentaux
│   └── _typography.css    # Typographie et polices
│
├── components/            # Composants réutilisables
│   ├── _buttons.css       # Styles de boutons
│   ├── _cards.css         # Styles de cartes et conteneurs
│   ├── navbar.css         # Style de la barre de navigation
│   └── footer.css         # Style du pied de page
│
├── layout/                # Mise en page
│   ├── _grid.css          # Système de grille et conteneurs
│   └── _header.css        # Styles d'en-tête de page
│
├── pages/                 # Styles spécifiques aux pages
│   ├── home.css           # Styles uniques à la page d'accueil
│   ├── galerie.css        # Styles uniques à la page galerie
│   └── evenements.css     # Styles uniques à la page événements
│
└── main.css               # Fichier principal d'importation
```

## Philosophie de conception

Cette architecture suit les principes de la méthodologie 7-1 (7 dossiers, 1 fichier) adaptée pour CSS vanilla, en utilisant le préfixe underscore `_` pour les fichiers partiels qui ne sont pas destinés à être utilisés directement.

## Comment utiliser ce système

1. **Importer uniquement le fichier `main.css`** dans votre application. Ce fichier importe tous les autres.

2. **Variables et thèmes**: Utilisez les variables CSS définies dans `_variables.css` pour maintenir la cohérence.

3. **Composants réutilisables**: Tous les composants UI génériques sont dans le dossier `components/`.

4. **Styles spécifiques aux pages**: Les styles qui ne s'appliquent qu'à une seule page se trouvent dans `pages/`.

## Conventions de nommage

- Utilisez la casse kebab (kebab-case) pour les noms de classes CSS: `.ma-classe`
- Utilisez des noms descriptifs qui expliquent à quoi sert un élément plutôt que son apparence
- Préfixez les classes utilitaires avec leurs caractéristiques: `.mt-4` pour "margin-top: 1rem"

## Bonnes pratiques

- Évitez la spécificité excessive pour faciliter la maintenance
- Utilisez les classes utilitaires pour les ajustements mineurs plutôt que de créer des styles personnalisés
- Privilégiez les variables CSS pour les valeurs qui se répètent (couleurs, espacements, etc.)
- Commentez votre code pour expliquer "pourquoi" plutôt que "quoi"

## Migration

Pour migrer les styles existants vers cette nouvelle structure:

1. Identifiez les styles partagés et déplacez-les vers les fichiers appropriés
2. Remplacez les valeurs codées en dur par des variables CSS
3. Identifiez et supprimez les styles dupliqués
4. Utilisez les classes utilitaires pour les ajustements mineurs
