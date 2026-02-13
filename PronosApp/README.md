# 🏆 PronosApp

Application mobile de gestion de pronostics sportifs créée avec React Native et Expo.

## 📱 Description

PronosApp est une application complète permettant de :
- Créer et gérer des tournois de pronostics
- Ajouter des compétitions et des matchs
- Gérer des utilisateurs (parieurs)
- Suivre les classements et les points
- Faire des pronostics sur les matchs

## 🚀 Fonctionnalités

### 🏆 Gestion des tournois
- Création de tournois personnalisés
- Suivi du statut (à venir, en cours, terminé)
- Interface intuitive de gestion

### ⚽ Gestion des compétitions
- Création de compétitions
- Ajout de matchs avec équipes et dates
- Organisation par catégories

### 👤 Gestion des parieurs
- Création de profils de parieurs
- Suivi des points et classements
- Historique des pronostics

### 📊 Suivi des pronostics
- Interface de pronostication simple
- Calcul automatique des points
- Classements en temps réel

## 🛠️ Stack Technique

- **Framework**: React Native avec Expo
- **Navigation**: Expo Router (file-based routing)
- **Stockage**: AsyncStorage pour les données locales
- **Langage**: TypeScript
- **UI**: React Native components avec styles personnalisés

## 📦 Dépendances principales

- `expo` - Plateforme de développement
- `expo-router` - Navigation par fichiers
- `@react-native-async-storage/async-storage` - Stockage local
- `react-native-safe-area-context` - Gestion des zones sécurisées
- `@react-navigation/native` - Navigation

## 🚀 Installation

1. Clonez le repository :
```bash
git clone <repository-url>
cd PronosApp
```

2. Installez les dépendances :
```bash
npm install
```

3. Démarrez l'application :
```bash
npx expo start
```

## 📱 Plateformes supportées

- **iOS** - Simulateur et appareils physiques
- **Android** - Émulateur et appareils physiques  
- **Web** - Navigateur moderne

## 🎯 Utilisation

### Démarrage rapide

1. Lancez l'application
2. Créez votre premier tournoi avec le bouton `➕`
3. Ajoutez des utilisateurs (parieurs)
4. Créez des compétitions et matchs
5. Commencez à faire des pronostics !

### Navigation

L'application utilise une navigation par fichiers intuitive :
- `/` - Accueil et gestion des tournois
- `/competitions` - Liste des compétitions
- `/competitions/[id]` - Détails d'une compétition
- `/bettors` - Gestion des parieurs
- `/bets` - Création de pronostics

## 🏗️ Structure du projet

```
PronosApp/
├── app/
│   ├── (home)/           # Navigation tab principale
│   ├── competitions/      # Gestion des compétitions
│   ├── bettors/          # Gestion des parieurs
│   ├── bets/             # Gestion des pronostics
│   └── _layout.tsx       # Layout racine
├── context/              # Contexte global de données
├── assets/               # Images et ressources
└── types/                # Définitions TypeScript
```

## 🔧 Configuration

### Variables d'environnement

Le projet utilise la configuration par défaut d'Expo. Pour des fonctionnalités avancées, vous pouvez ajouter un fichier `app.config.js`.

### Personnalisation

- **Thème**: Les couleurs et styles sont définis dans les composants
- **Icônes**: Utilisation d'emojis pour une interface légère
- **Animations**: React Native Reanimated pour les transitions

## 🤝 Contribuer

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commitez vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📝 Notes de développement

- L'application utilise TypeScript pour la sécurité du typage
- Les données sont stockées localement avec AsyncStorage
- L'interface est optimisée pour mobile avec des composants natifs
- Le routing utilise Expo Router pour une navigation fluide

## 🐛 Débuggage

En cas de problème :
1. Vérifiez les logs avec `npx expo start --dev-client`
2. Nettoyez le cache avec `npx expo start -c`
3. Réinitialisez le projet avec `npm run reset-project`

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à contacter l'équipe de développement.

---

**PronosApp** - Faites des pronostics, remportez des victoires ! 🏆