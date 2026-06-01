---
title: Başlarken
sidebar_position: 1
---

# Başlarken

Bu kılavuz, projeyi klonlamaktan çalışan bir panele kadar — organizasyon, token, logo ve şirket adı yapılandırması dahil — adım adım rehberlik eder.

## 1. Depoyu klonlayın

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. `.env` yapılandırması

```bash
cp .env.example .env
```

`.env` dosyasını açın ve aşağıdaki değerleri doldurun:

### Organizasyon veya Kurumsal

```env
# Seçin: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# GitHub organizasyon slug'ınız (örn: sirketim)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# Kurumsal slug — yalnızca SCOPE=enterprise olduğunda
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# Ekibe göre filtrele (isteğe bağlı)
NUXT_PUBLIC_GITHUB_TEAM=
```

### Kimlik doğrulama — Personal Access Token

```env
# Şu izinlere sahip PAT:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> Token oluştur: GitHub → Settings → Developer settings → Personal access tokens

### Oturum şifresi (zorunlu)

```env
# En az 32 karakterlik rastgele bir dize
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip Rastgele şifre oluşturma
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### İsteğe bağlı özellikler

```env
# PAT yerine OAuth kullan
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# Premium kredi getirmeyi devre dışı bırak (ilk kurulumda önerilir)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# Kurumsal proxy (gerekirse)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. Marka özelleştirme (logo ve şirket adı)

### Logo

`public/favicon.svg` dosyasını kendi simgenizle değiştirin (SVG önerilir).

Ana logoyu `public/` klasörüne yerleştirin:

```
public/
  logo.png        ← ana logo (PNG, ~200px genişlik önerilir)
  favicon.svg     ← tarayıcı sekme simgesi
```

### Arayüzdeki şirket/organizasyon adı

Organizasyon veya kurumsal ad, `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT`'den otomatik olarak gösterilir — ek yapılandırma gerekmez.

Tarayıcı sekme başlığını değiştirmek için `nuxt.config.ts` dosyasını düzenleyin:

```ts
app: {
  head: {
    title: 'Copilot Metrics — Şirketim'
  }
}
```

## 4. Yerel olarak çalıştırma

```bash
npm install
npm run dev
```

`http://localhost:3000` adresini açın.

:::tip Token olmadan hızlı test
`.env` dosyasında `NUXT_PUBLIC_IS_DATA_MOCKED=true` ayarlayın — panel, GitHub API'ye bağlanmadan önce demo verilerle gösterilir.
:::

## 5. Her şeyin çalıştığını doğrulama

1. Panel `http://localhost:3000` adresinde yükleniyor
2. Organizasyon/kurumsal adınız başlıkta görünüyor
3. Grafikler veri gösteriyor (gerçek veya simüle edilmiş)
4. **Seat analysis** sekmesi hatasız yükleniyor

## Sonraki adımlar

| Konu | Bağlantı |
|------|----------|
| Gelişmiş kimlik doğrulama (OAuth / GitHub App) | [Kimlik doğrulama](./authentication) |
| Docker ile dağıtım | [Docker](../deployment/docker) |
| Azure'a dağıtım | [Azure](../deployment/azure) |
| Tüm ortam değişkenleri | [Referans — Ortam değişkenleri](../reference/environment-variables) |
