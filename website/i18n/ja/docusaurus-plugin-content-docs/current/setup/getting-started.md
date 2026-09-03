---
title: はじめに
sidebar_position: 1
---

# はじめに

このガイドでは、プロジェクトのクローンから動作するダッシュボードまでの手順を説明します。組織名、Token、ロゴ、会社名の設定も含みます。

## 1. リポジトリのクローン

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. `.env` の設定

```bash
cp .env.example .env
```

`.env` を開いて以下の値を入力してください：

### 組織またはエンタープライズ

```env
# 選択: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# GitHub 組織のスラッグ（例: my-company）
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# エンタープライズスラッグ — SCOPE=enterprise の場合のみ
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# チームでフィルタリング（任意）
NUXT_PUBLIC_GITHUB_TEAM=
```

### 認証 — Personal Access Token

```env
# 以下のスコープを持つ PAT:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> Token の作成: GitHub → Settings → Developer settings → Personal access tokens

### セッションパスワード（必須）

```env
# 32文字以上のランダムな文字列
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip ランダムパスワードの生成
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### オプション機能

```env
# PAT の代わりに OAuth を使用
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# プレミアムクレジット取得を無効化（初期設定時推奨）
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# 企業プロキシ（必要な場合）
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. ブランディング（ロゴと会社名）

### ロゴ

`public/favicon.svg` を自分のアイコンに置き換えてください（SVG 推奨）。

メインロゴは `public/` に配置します：

```
public/
  logo.png        ← メインロゴ（PNG、幅約 200px 推奨）
  favicon.svg     ← ブラウザタブアイコン
```

### UIの会社/組織名

組織またはエンタープライズ名は `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT` から自動表示されます。別途設定は不要です。

ブラウザタブのタイトルを変更する場合は `nuxt.config.ts` を編集します：

```ts
app: {
  head: {
    title: 'Copilot Metrics — 株式会社〇〇'
  }
}
```

## 4. ローカルで実行

```bash
npm install
npm run dev
```

`http://localhost:3000` にアクセスしてください。

:::tip Token なしで素早く確認する
`.env` に `NUXT_PUBLIC_IS_DATA_MOCKED=true` を設定すると、GitHub API に接続する前にデモデータでUIを確認できます。
:::

## 5. 動作確認

1. `http://localhost:3000` でダッシュボードが表示される
2. ヘッダーに組織/エンタープライズ名が表示される
3. グラフにデータが表示される（実データまたはモックデータ）
4. **Seat analysis** タブがエラーなく読み込まれる

## 次のステップ

| トピック | リンク |
|----------|--------|
| 高度な認証（OAuth / GitHub App） | [認証](./authentication) |
| Docker でのデプロイ | [Docker](../deployment/docker) |
| Azure へのデプロイ | [Azure](../deployment/azure) |
| 全環境変数 | [リファレンス — 環境変数](../reference/environment-variables) |
