---
title: 시작하기
sidebar_position: 1
---

# 시작하기

이 가이드는 프로젝트 클론부터 작동하는 대시보드까지 — 조직 설정, 토큰, 로고, 회사명 구성을 포함하여 안내합니다.

## 1. 리포지토리 클론

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. `.env` 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 다음 값들을 입력하세요:

### 조직 또는 엔터프라이즈

```env
# 선택: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# GitHub 조직 슬러그 (예: my-company)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# 엔터프라이즈 슬러그 — SCOPE=enterprise인 경우만
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# 특정 팀으로 필터링 (선택 사항)
NUXT_PUBLIC_GITHUB_TEAM=
```

### 인증 — Personal Access Token

```env
# 다음 권한 범위의 PAT:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> 토큰 생성: GitHub → Settings → Developer settings → Personal access tokens

### 세션 비밀번호 (필수)

```env
# 최소 32자의 무작위 문자열
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip 무작위 비밀번호 생성
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### 선택적 기능

```env
# PAT 대신 OAuth 사용
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# 프리미엄 크레딧 가져오기 비활성화 (초기 설정 시 권장)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# 기업 프록시 (필요한 경우)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. 브랜딩 (로고 및 회사명)

### 로고

`public/favicon.svg`를 자신의 아이콘으로 교체하세요 (SVG 권장).

`public/`에 메인 로고를 배치하세요:

```
public/
  logo.png        ← 메인 로고 (PNG, 너비 약 200px 권장)
  favicon.svg     ← 브라우저 탭 아이콘
```

### UI의 회사/조직명

조직 또는 엔터프라이즈 이름은 `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT`에서 자동으로 표시됩니다 — 별도 설정 불필요.

브라우저 탭 제목을 변경하려면 `nuxt.config.ts`를 수정하세요:

```ts
app: {
  head: {
    title: 'Copilot Metrics — 우리 회사'
  }
}
```

## 4. 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:3000`에 접속하세요.

:::tip 토큰 없이 빠른 테스트
`.env`에 `NUXT_PUBLIC_IS_DATA_MOCKED=true`를 설정하면 GitHub API에 연결하기 전에 데모 데이터로 UI를 확인할 수 있습니다.
:::

## 5. 정상 작동 확인

1. `http://localhost:3000`에서 대시보드가 로드됨
2. 헤더에 조직/엔터프라이즈 이름이 표시됨
3. 차트에 데이터가 표시됨 (실제 또는 모의)
4. **Seat analysis** 탭이 오류 없이 로드됨

## 다음 단계

| 주제 | 링크 |
|------|------|
| 고급 인증 (OAuth / GitHub App) | [인증](./authentication) |
| Docker로 배포 | [Docker](../deployment/docker) |
| Azure에 배포 | [Azure](../deployment/azure) |
| 모든 환경 변수 | [레퍼런스 — 환경 변수](../reference/environment-variables) |
