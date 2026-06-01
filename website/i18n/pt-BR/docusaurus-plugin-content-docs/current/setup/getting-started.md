---
title: Primeiros passos
sidebar_position: 1
---

# Primeiros passos

Este guia leva você desde a clonagem do projeto até um painel em funcionamento — incluindo configuração de organização, token, logo e nome da empresa.

## 1. Clonar o repositório

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. Configurar o `.env`

```bash
cp .env.example .env
```

Abra o `.env` e preencha os seguintes valores:

### Organização ou Empresa

```env
# Escolha: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# Slug da sua organização no GitHub (ex: minha-empresa)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# Slug da empresa — somente quando SCOPE=enterprise
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# Filtrar por equipe (opcional)
NUXT_PUBLIC_GITHUB_TEAM=
```

### Autenticação — Personal Access Token

```env
# PAT com os escopos:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> Criar token: GitHub → Settings → Developer settings → Personal access tokens

### Senha de sessão (obrigatório)

```env
# String aleatória com pelo menos 32 caracteres
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip Gerar uma senha aleatória
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### Funcionalidades opcionais

```env
# Usar OAuth em vez de PAT
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# Desativar busca de créditos premium (recomendado na configuração inicial)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# Proxy corporativo (se necessário)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. Personalização de marca (logo e nome da empresa)

### Logo

Substitua `public/favicon.svg` pelo seu próprio ícone (SVG recomendado).

Coloque o logo principal em `public/`:

```
public/
  logo.png        ← logo principal (PNG, ~200px de largura recomendado)
  favicon.svg     ← ícone da aba do navegador
```

### Nome da empresa/organização na interface

O nome da organização ou empresa é exibido automaticamente a partir de `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT` — nenhuma configuração adicional é necessária.

Para alterar o título do navegador, edite `nuxt.config.ts`:

```ts
app: {
  head: {
    title: 'Copilot Metrics — Minha Empresa'
  }
}
```

## 4. Executar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

:::tip Teste rápido sem token
Defina `NUXT_PUBLIC_IS_DATA_MOCKED=true` no `.env` para ver o painel com dados de demonstração antes de conectar à API do GitHub.
:::

## 5. Verificar se tudo funciona

1. O painel carrega em `http://localhost:3000`
2. O nome da sua organização/empresa aparece no cabeçalho
3. Os gráficos exibem dados (reais ou simulados)
4. A aba **Seat analysis** carrega sem erros

## Próximos passos

| Tópico | Link |
|--------|------|
| Autenticação avançada (OAuth / GitHub App) | [Autenticação](./authentication) |
| Deploy com Docker | [Docker](../deployment/docker) |
| Deploy no Azure | [Azure](../deployment/azure) |
| Todas as variáveis de ambiente | [Referência — Variáveis de ambiente](../reference/environment-variables) |
