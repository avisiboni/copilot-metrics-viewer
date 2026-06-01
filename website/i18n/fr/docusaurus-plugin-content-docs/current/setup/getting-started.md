---
title: Premiers pas
sidebar_position: 1
---

# Premiers pas

Ce guide vous accompagne du clonage du projet jusqu'à un tableau de bord fonctionnel — incluant la configuration de l'organisation, du token, du logo et du nom d'entreprise.

## 1. Cloner le dépôt

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. Configurer `.env`

```bash
cp .env.example .env
```

Ouvrez `.env` et renseignez les valeurs suivantes :

### Organisation ou Entreprise

```env
# Choisissez : organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# Slug de votre organisation GitHub (ex : mon-entreprise)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# Slug d'entreprise — uniquement si SCOPE=enterprise
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# Filtrer par équipe (optionnel)
NUXT_PUBLIC_GITHUB_TEAM=
```

### Authentification — Personal Access Token

```env
# PAT avec les permissions :
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> Créer un token : GitHub → Settings → Developer settings → Personal access tokens

### Mot de passe de session (obligatoire)

```env
# Chaîne aléatoire d'au moins 32 caractères
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip Générer un mot de passe aléatoire
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### Fonctionnalités optionnelles

```env
# Utiliser OAuth à la place du PAT
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# Désactiver la récupération des crédits premium (recommandé lors de l'installation initiale)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# Proxy d'entreprise (si nécessaire)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. Personnalisation de marque (logo et nom d'entreprise)

### Logo

Remplacez `public/favicon.svg` par votre propre icône (SVG recommandé).

Placez le logo principal dans `public/` :

```
public/
  logo.png        ← logo principal (PNG, ~200px de large recommandé)
  favicon.svg     ← icône d'onglet navigateur
```

### Nom d'entreprise/organisation dans l'interface

Le nom de l'organisation ou de l'entreprise s'affiche automatiquement depuis `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT` — aucune configuration supplémentaire requise.

Pour changer le titre du navigateur, éditez `nuxt.config.ts` :

```ts
app: {
  head: {
    title: 'Copilot Metrics — Mon Entreprise'
  }
}
```

## 4. Lancer en local

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:3000`.

:::tip Test rapide sans token
Définissez `NUXT_PUBLIC_IS_DATA_MOCKED=true` dans `.env` pour afficher le tableau de bord avec des données de démonstration avant de connecter l'API GitHub.
:::

## 5. Vérifier que tout fonctionne

1. Le tableau de bord se charge sur `http://localhost:3000`
2. Le nom de votre organisation/entreprise apparaît dans l'en-tête
3. Les graphiques affichent des données (réelles ou simulées)
4. L'onglet **Seat analysis** se charge sans erreur

## Prochaines étapes

| Sujet | Lien |
|-------|------|
| Authentification avancée (OAuth / GitHub App) | [Authentification](./authentication) |
| Déploiement avec Docker | [Docker](../deployment/docker) |
| Déploiement sur Azure | [Azure](../deployment/azure) |
| Toutes les variables d'environnement | [Référence — Variables d'environnement](../reference/environment-variables) |
