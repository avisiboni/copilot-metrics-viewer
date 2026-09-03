---
title: Erste Schritte
sidebar_position: 1
---

# Erste Schritte

Diese Anleitung führt Sie vom Klonen des Projekts bis zu einem laufenden Dashboard — einschließlich der Konfiguration von Organisation, Token, Logo und Unternehmensname.

## 1. Repository klonen

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. `.env` konfigurieren

```bash
cp .env.example .env
```

Öffnen Sie `.env` und füllen Sie folgende Werte aus:

### Organisation oder Unternehmen

```env
# Wählen: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# Ihr GitHub-Organisations-Slug (z.B. mein-unternehmen)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# Enterprise-Slug — nur wenn SCOPE=enterprise
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# Nach Team filtern (optional)
NUXT_PUBLIC_GITHUB_TEAM=
```

### Authentifizierung — Personal Access Token

```env
# PAT mit folgenden Berechtigungen:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> Token erstellen: GitHub → Settings → Developer settings → Personal access tokens

### Session-Passwort (erforderlich)

```env
# Zufällige Zeichenkette mit mindestens 32 Zeichen
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip Zufälliges Passwort generieren
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### Optionale Funktionen

```env
# OAuth statt PAT verwenden
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# Premium-Credits-Abruf deaktivieren (bei Erstinstallation empfohlen)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# Unternehmens-Proxy (falls erforderlich)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. Branding (Logo und Unternehmensname)

### Logo

Ersetzen Sie `public/favicon.svg` durch Ihr eigenes Icon (SVG empfohlen).

Platzieren Sie das Hauptlogo in `public/`:

```
public/
  logo.png        ← Hauptlogo (PNG, ~200px Breite empfohlen)
  favicon.svg     ← Browser-Tab-Icon
```

### Unternehmens-/Organisationsname in der Benutzeroberfläche

Der Organisations- oder Unternehmensname wird automatisch aus `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT` angezeigt — keine separate Konfiguration erforderlich.

Um den Browser-Tab-Titel zu ändern, bearbeiten Sie `nuxt.config.ts`:

```ts
app: {
  head: {
    title: 'Copilot Metrics — Mein Unternehmen'
  }
}
```

## 4. Lokal ausführen

```bash
npm install
npm run dev
```

Öffnen Sie `http://localhost:3000`.

:::tip Schnelltest ohne Token
Setzen Sie `NUXT_PUBLIC_IS_DATA_MOCKED=true` in `.env` — das Dashboard zeigt Demo-Daten und ermöglicht die UI-Prüfung vor der Verbindung mit der GitHub API.
:::

## 5. Funktionsprüfung

1. Dashboard lädt unter `http://localhost:3000`
2. Ihr Organisations-/Unternehmensname erscheint im Header
3. Diagramme zeigen Daten (echt oder simuliert)
4. Tab **Seat analysis** lädt ohne Fehler

## Nächste Schritte

| Thema | Link |
|-------|------|
| Erweiterte Authentifizierung (OAuth / GitHub App) | [Authentifizierung](./authentication) |
| Deployment mit Docker | [Docker](../deployment/docker) |
| Deployment auf Azure | [Azure](../deployment/azure) |
| Alle Umgebungsvariablen | [Referenz — Umgebungsvariablen](../reference/environment-variables) |
