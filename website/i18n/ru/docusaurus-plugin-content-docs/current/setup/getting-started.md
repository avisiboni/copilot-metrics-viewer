---
title: Начало работы
sidebar_position: 1
---

# Начало работы

Это руководство проведёт вас от клонирования проекта до работающей панели мониторинга — включая настройку организации, токена, логотипа и названия компании.

## 1. Клонирование репозитория

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. Настройка `.env`

```bash
cp .env.example .env
```

Откройте `.env` и заполните следующие значения:

### Организация или предприятие

```env
# Выберите: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# Slug вашей организации на GitHub (например: my-company)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# Slug предприятия — только если SCOPE=enterprise
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# Фильтрация по команде (необязательно)
NUXT_PUBLIC_GITHUB_TEAM=
```

### Аутентификация — Personal Access Token

```env
# PAT со следующими правами:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> Создать токен: GitHub → Settings → Developer settings → Personal access tokens

### Пароль сессии (обязательно)

```env
# Случайная строка длиной не менее 32 символов
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip Генерация случайного пароля
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### Дополнительные функции

```env
# Использовать OAuth вместо PAT
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# Отключить загрузку премиум-кредитов (рекомендуется при первоначальной настройке)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# Корпоративный прокси (при необходимости)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. Брендинг (логотип и название компании)

### Логотип

Замените `public/favicon.svg` своим значком (рекомендуется SVG).

Разместите основной логотип в `public/`:

```
public/
  logo.png        ← основной логотип (PNG, рекомендуемая ширина ~200px)
  favicon.svg     ← значок вкладки браузера
```

### Название компании/организации в интерфейсе

Название организации или предприятия отображается автоматически из `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT` — дополнительная настройка не требуется.

Чтобы изменить заголовок браузера, отредактируйте `nuxt.config.ts`:

```ts
app: {
  head: {
    title: 'Copilot Metrics — Моя Компания'
  }
}
```

## 4. Локальный запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

:::tip Быстрая проверка без токена
Установите `NUXT_PUBLIC_IS_DATA_MOCKED=true` в `.env` — панель будет использовать демо-данные, что позволит проверить интерфейс до подключения к GitHub API.
:::

## 5. Проверка работоспособности

1. Панель загружается по адресу `http://localhost:3000`
2. В заголовке отображается название вашей организации/предприятия
3. Графики показывают данные (реальные или тестовые)
4. Вкладка **Seat analysis** загружается без ошибок

## Следующие шаги

| Тема | Ссылка |
|------|--------|
| Расширенная аутентификация (OAuth / GitHub App) | [Аутентификация](./authentication) |
| Развёртывание с Docker | [Docker](../deployment/docker) |
| Развёртывание в Azure | [Azure](../deployment/azure) |
| Все переменные среды | [Справочник — Переменные среды](../reference/environment-variables) |
