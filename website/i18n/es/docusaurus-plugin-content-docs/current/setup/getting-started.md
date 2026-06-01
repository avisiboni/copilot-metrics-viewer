---
title: Primeros pasos
sidebar_position: 1
---

# Primeros pasos

Esta guía te lleva desde clonar el proyecto hasta tener un panel de control en funcionamiento, incluyendo la configuración de organización, token, logo y nombre de empresa.

## 1. Clonar el repositorio

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. Configurar `.env`

```bash
cp .env.example .env
```

Abre `.env` y completa los siguientes valores:

### Organización o Empresa

```env
# Elige: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# Slug de tu organización en GitHub (ej: mi-empresa)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# Slug de empresa — solo si SCOPE=enterprise
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# Filtrar por equipo (opcional)
NUXT_PUBLIC_GITHUB_TEAM=
```

### Autenticación — Personal Access Token

```env
# PAT con los siguientes permisos:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> Crear token: GitHub → Settings → Developer settings → Personal access tokens

### Contraseña de sesión (obligatorio)

```env
# Cadena aleatoria de al menos 32 caracteres
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip Generar una contraseña aleatoria
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### Funciones opcionales

```env
# Usar OAuth en lugar de PAT
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# Desactivar la obtención de créditos premium (recomendado en instalación inicial)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# Proxy corporativo (si es necesario)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. Personalización de marca (logo y nombre de empresa)

### Logo

Reemplaza `public/favicon.svg` con tu propio icono (SVG recomendado).

Coloca el logo principal en `public/`:

```
public/
  logo.png        ← logo principal (PNG, ~200px de ancho recomendado)
  favicon.svg     ← icono de pestaña del navegador
```

### Nombre de empresa/organización en la interfaz

El nombre de la organización o empresa se muestra automáticamente desde `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT` — no se necesita configuración adicional.

Para cambiar el título del navegador, edita `nuxt.config.ts`:

```ts
app: {
  head: {
    title: 'Copilot Metrics — Mi Empresa'
  }
}
```

## 4. Ejecutar localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

:::tip Prueba rápida sin token
Establece `NUXT_PUBLIC_IS_DATA_MOCKED=true` en `.env` para ver el panel con datos de demostración antes de conectar la API de GitHub.
:::

## 5. Verificar que todo funciona

1. El panel carga en `http://localhost:3000`
2. El nombre de tu organización/empresa aparece en el encabezado
3. Los gráficos muestran datos (reales o simulados)
4. La pestaña **Seat analysis** carga sin errores

## Próximos pasos

| Tema | Enlace |
|------|--------|
| Autenticación avanzada (OAuth / GitHub App) | [Autenticación](./authentication) |
| Despliegue con Docker | [Docker](../deployment/docker) |
| Despliegue en Azure | [Azure](../deployment/azure) |
| Todas las variables de entorno | [Referencia — Variables de entorno](../reference/environment-variables) |
