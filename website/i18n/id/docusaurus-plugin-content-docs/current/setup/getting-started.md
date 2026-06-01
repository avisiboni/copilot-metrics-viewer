---
title: Mulai
sidebar_position: 1
---

# Mulai

Panduan ini membawa Anda dari mengkloning proyek hingga dasbor yang berjalan — termasuk konfigurasi organisasi, token, logo, dan nama perusahaan.

## 1. Kloning repositori

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. Konfigurasi `.env`

```bash
cp .env.example .env
```

Buka `.env` dan isi nilai-nilai berikut:

### Organisasi atau Perusahaan

```env
# Pilih: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# Slug organisasi GitHub Anda (contoh: perusahaan-saya)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# Slug perusahaan — hanya saat SCOPE=enterprise
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# Filter berdasarkan tim (opsional)
NUXT_PUBLIC_GITHUB_TEAM=
```

### Autentikasi — Personal Access Token

```env
# PAT dengan izin:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> Buat token: GitHub → Settings → Developer settings → Personal access tokens

### Kata sandi sesi (wajib)

```env
# String acak minimal 32 karakter
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip Buat kata sandi acak
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### Fitur opsional

```env
# Gunakan OAuth sebagai pengganti PAT
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# Nonaktifkan pengambilan kredit premium (disarankan saat instalasi awal)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# Proxy perusahaan (jika diperlukan)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. Branding (logo dan nama perusahaan)

### Logo

Ganti `public/favicon.svg` dengan ikon Anda sendiri (SVG disarankan).

Tempatkan logo utama di `public/`:

```
public/
  logo.png        ← logo utama (PNG, lebar ~200px disarankan)
  favicon.svg     ← ikon tab browser
```

### Nama perusahaan/organisasi di UI

Nama organisasi atau perusahaan ditampilkan secara otomatis dari `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT` — tidak perlu konfigurasi tambahan.

Untuk mengubah judul tab browser, edit `nuxt.config.ts`:

```ts
app: {
  head: {
    title: 'Copilot Metrics — Perusahaan Saya'
  }
}
```

## 4. Jalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

:::tip Uji cepat tanpa token
Atur `NUXT_PUBLIC_IS_DATA_MOCKED=true` di `.env` — dasbor akan menampilkan data demo sebelum terhubung ke GitHub API.
:::

## 5. Verifikasi semuanya berjalan

1. Dasbor dimuat di `http://localhost:3000`
2. Nama organisasi/perusahaan Anda muncul di header
3. Grafik menampilkan data (nyata atau simulasi)
4. Tab **Seat analysis** dimuat tanpa kesalahan

## Langkah selanjutnya

| Topik | Tautan |
|-------|--------|
| Autentikasi lanjutan (OAuth / GitHub App) | [Autentikasi](./authentication) |
| Deploy dengan Docker | [Docker](../deployment/docker) |
| Deploy ke Azure | [Azure](../deployment/azure) |
| Semua variabel lingkungan | [Referensi — Variabel lingkungan](../reference/environment-variables) |
