---
title: 快速入门
sidebar_position: 1
---

# 快速入门

本指南将引导您从克隆项目到运行仪表盘——包括配置组织、Token、Logo 和公司名称。

## 1. 克隆项目

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. 配置 `.env` 文件

```bash
cp .env.example .env
```

打开 `.env` 文件并填写以下内容：

### 组织或企业

```env
# 选择：organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# 您的 GitHub 组织 slug（例如：my-company）
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# 企业 slug — 仅当 SCOPE=enterprise 时填写
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# 可选：过滤特定团队
NUXT_PUBLIC_GITHUB_TEAM=
```

### 认证 — Personal Access Token

```env
# 需要以下权限范围的 PAT：
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> 创建 Token：GitHub → Settings → Developer settings → Personal access tokens

### Session 密码（必填）

```env
# 至少 32 个字符的随机字符串
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip 生成随机密码
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### 可选功能

```env
# 使用 OAuth 替代 PAT
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# 禁用高级积分获取（初始安装时推荐）
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# 企业代理（如需要）
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. 品牌定制（Logo 和公司名称）

### Logo

将 `public/favicon.svg` 替换为您自己的图标（推荐 SVG 格式）。

将主 Logo 放置在 `public/` 目录下：

```
public/
  logo.png        ← 主 Logo（推荐 PNG，宽度约 200px）
  favicon.svg     ← 浏览器标签图标
```

### 界面中的公司/组织名称

组织或企业名称自动从 `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT` 读取，无需额外配置。

修改浏览器标签标题，编辑 `nuxt.config.ts`：

```ts
app: {
  head: {
    title: 'Copilot Metrics — 我的公司'
  }
}
```

## 4. 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

:::tip 无需 Token 快速体验
设置 `NUXT_PUBLIC_IS_DATA_MOCKED=true` — 仪表盘将使用内置演示数据，方便在连接 GitHub API 之前验证界面。
:::

## 5. 验证一切正常

1. 仪表盘在 `http://localhost:3000` 正常加载
2. 标题栏显示您的组织/企业名称
3. 图表显示数据（真实或模拟）
4. **Seat analysis** 标签页加载无误

## 下一步

| 主题 | 链接 |
|------|------|
| 高级认证（OAuth / GitHub App） | [认证](./authentication) |
| Docker 部署 | [Docker](../deployment/docker) |
| Azure 部署 | [Azure](../deployment/azure) |
| 所有环境变量 | [参考 — 环境变量](../reference/environment-variables) |
