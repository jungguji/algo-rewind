# 기술 스택 상세

## 개요

Algo-Rewind의 TypeScript + Svelte 5 기반 새로운 기술 스택 상세 문서입니다.

---

## Phase 1: Frontend-Only

### 🎨 프론트엔드 프레임워크

#### Svelte 5
- **버전**: 5.x (최신 stable)
- **선택 이유**:
  - 반응형 프로그래밍의 간결함
  - 작은 번들 크기 (컴파일 타임에 최적화)
  - React보다 보일러플레이트 적음
  - TypeScript 완벽 지원
  - 빠른 학습 곡선

**주요 기능**:
- Reactivity (반응형 상태)
- Components (재사용 가능한 컴포넌트)
- Stores (전역 상태 관리)
- Transitions & Animations (내장)

**설치**:
```bash
npm create vite@latest algo-rewind-v2 -- --template svelte-ts
```

**예시 코드**:
```svelte
<script lang="ts">
  let count = $state(0);  // Svelte 5 신규 문법

  function increment() {
    count++;  // 자동 반응형
  }
</script>

<button onclick={increment}>
  Count: {count}
</button>
```

---

### 🔧 빌드 도구

#### Vite
- **버전**: 5.x
- **선택 이유**:
  - 초고속 HMR (Hot Module Replacement)
  - ES 모듈 네이티브 지원
  - 플러그인 생태계
  - 프로덕션 빌드 최적화 (Rollup 기반)

**설정** (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});
```

---

### 📦 언어 및 타입

#### TypeScript
- **버전**: 5.x
- **선택 이유**:
  - 타입 안전성
  - IDE 자동완성
  - 리팩토링 편의성
  - 런타임 에러 사전 방지

**설정** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vite/client"],
    "paths": {
      "$lib/*": ["./src/lib/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.svelte"]
}
```

---

### 📚 주요 라이브러리

#### 1. date-fns
- **버전**: 3.x
- **용도**: 날짜 계산 및 포맷팅
- **선택 이유**:
  - 가볍고 모듈화됨 (필요한 함수만 import)
  - TypeScript 타입 지원
  - 불변성 (immutable)
  - Tree-shaking 가능

**사용 예시**:
```typescript
import { addDays, format } from 'date-fns';

const today = new Date();
const nextWeek = addDays(today, 7);
const formatted = format(nextWeek, 'yyyy-MM-dd'); // "2025-11-30"
```

**대안**:
- Day.js (더 작지만 기능 적음)
- Luxon (Intl API 기반, 더 무거움)

---

#### 2. marked
- **버전**: 11.x
- **용도**: 마크다운 → HTML 변환
- **선택 이유**:
  - 가볍고 빠름
  - GitHub Flavored Markdown (GFM) 지원
  - 확장 가능

**사용 예시**:
```typescript
import { marked } from 'marked';

const html = marked.parse('# Hello **World**');
// "<h1>Hello <strong>World</strong></h1>"
```

**보안**: DOMPurify와 함께 사용 (XSS 방지)

---

#### 3. DOMPurify
- **버전**: 3.x
- **용도**: HTML Sanitization (XSS 방지)
- **선택 이유**:
  - 사용자가 입력한 마크다운의 안전한 렌더링
  - 악의적인 스크립트 제거

**사용 예시**:
```typescript
import DOMPurify from 'dompurify';
import { marked } from 'marked';

const userInput = '# Title\n<script>alert("XSS")</script>';
const html = marked.parse(userInput);
const safeHtml = DOMPurify.sanitize(html);
// <script> 태그가 제거됨
```

---

### 🎨 스타일링

#### CSS (Vanilla)
- **선택 이유**:
  - 기존 CSS 재사용 가능
  - Svelte 컴포넌트 스코프 스타일 지원
  - CSS 변수로 테마 관리

**Svelte 스코프 스타일**:
```svelte
<style>
  /* 이 스타일은 이 컴포넌트에만 적용됨 */
  .button {
    background: blue;
  }
</style>
```

**글로벌 스타일** (`app.css`):
```css
:root {
  --primary-color: #3498db;
  --danger-color: #e74c3c;
  --border-radius: 6px;
}

* {
  box-sizing: border-box;
}
```

**대안** (향후 고려):
- TailwindCSS: 유틸리티 퍼스트
- UnoCSS: Tailwind 대안, 더 빠름

---

### 💾 상태 관리

#### Svelte Stores
- **내장 기능**: 별도 라이브러리 불필요
- **타입**: Writable, Readable, Derived

**Writable Store**:
```typescript
import { writable } from 'svelte/store';

const count = writable(0);

// 구독
count.subscribe(value => console.log(value));

// 업데이트
count.set(10);
count.update(n => n + 1);
```

**Derived Store** (계산된 값):
```typescript
import { derived } from 'svelte/store';

const doubled = derived(count, $count => $count * 2);
```

**Custom Store**:
```typescript
function createProblemsStore() {
  const { subscribe, set, update } = writable<Problem[]>([]);

  return {
    subscribe,
    add: (problem: Problem) => update(problems => [...problems, problem]),
    remove: (id: number) => update(problems => problems.filter(p => p.id !== id)),
  };
}

export const problems = createProblemsStore();
```

---

### 🧪 테스팅 (선택사항)

#### Vitest
- **버전**: 1.x
- **용도**: 단위 테스트
- **선택 이유**:
  - Vite와 완벽 호환
  - Jest 호환 API
  - 빠른 실행 속도

**설치**:
```bash
npm install -D vitest @testing-library/svelte
```

**예시**:
```typescript
import { describe, it, expect } from 'vitest';
import { calculateNextReview } from './srs';
import { Level } from './types';

describe('SRS Scheduler', () => {
  it('should add 7 days for GOOD level', () => {
    const result = calculateNextReview('2025-11-23', Level.GOOD);
    expect(result).toBe('2025-11-30');
  });
});
```

---

### 📦 패키지 관리

#### npm
- **선택 이유**: 기본 제공, 안정적
- **대안**: pnpm (더 빠름, 디스크 효율적)

**package.json** 예시:
```json
{
  "name": "algo-rewind-v2",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "svelte": "^5.0.0",
    "marked": "^11.0.0",
    "dompurify": "^3.0.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

### 🚀 배포

#### GitHub Pages
- **무료 정적 호스팅**
- **자동 HTTPS**
- **Custom Domain 지원**

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**대안**:
- Vercel: 자동 배포, Preview 브랜치
- Netlify: 유사 기능
- Cloudflare Pages: 빠른 CDN

---

## Phase 2: Full-Stack

### 🖥️ 백엔드 런타임

#### Bun
- **버전**: 1.x
- **선택 이유**:
  - Rust 기반 JavaScript 런타임 (빠름!)
  - Node.js 호환성
  - 내장 TypeScript 지원
  - 내장 번들러, 테스트 러너
  - npm 패키지 호환

**설치**:
```bash
curl -fsSL https://bun.sh/install | bash
```

**프로젝트 초기화**:
```bash
bun init
```

**성능 비교** (벤치마크):
- Bun: 3-4배 빠름 (vs Node.js)
- npm install: 25배 빠름
- 메모리 사용량: 50% 적음

**대안**:
- Node.js 20 LTS: 안정적, 생태계 크기
- Deno: 보안 중심, TypeScript 네이티브

---

### 🌐 백엔드 프레임워크

#### Hono
- **버전**: 4.x
- **선택 이유**:
  - 초경량 (12KB)
  - Edge-ready (Cloudflare Workers, Vercel Edge)
  - TypeScript 퍼스트
  - Express-like API
  - 빠른 성능 (Fastify보다 2배 빠름)

**예시**:
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/api/problems', async (c) => {
  const problems = await db.select().from(problemsTable);
  return c.json(problems);
});

export default app;
```

**대안**:
- Fastify: 더 성숙한 생태계
- Express: 가장 큰 커뮤니티 (하지만 느림)
- tRPC: End-to-end type safety (더 복잡함)

---

### 🗄️ 데이터베이스

#### PostgreSQL
- **버전**: 16.x
- **선택 이유**:
  - 산업 표준 관계형 DB
  - JSONB 지원 (유연한 스키마)
  - 강력한 인덱싱
  - ACID 보장

**호스팅 옵션**:
1. **Vercel Postgres** (추천)
   - 무료 티어: 256MB, 60시간 계산
   - Vercel 배포와 완벽 통합
   - 자동 스케일링

2. **Neon**
   - 서버리스 Postgres
   - 무료 티어: 3GB 스토리지
   - 빠른 콜드 스타트

3. **Supabase**
   - Postgres + Auth + Storage
   - 무료 티어: 500MB, 2GB 전송
   - 실시간 기능

**연결**:
```typescript
import { Pool } from '@vercel/postgres';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});
```

---

### 🔧 ORM

#### Drizzle ORM
- **버전**: 0.29.x
- **선택 이유**:
  - TypeScript 네이티브
  - 타입 안전한 쿼리
  - 마이그레이션 도구 포함
  - 가볍고 빠름 (Prisma보다 2배 빠름)
  - SQL-like API (배우기 쉬움)

**스키마 정의**:
```typescript
import { pgTable, serial, varchar, text, date } from 'drizzle-orm/pg-core';

export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url'),
  tags: jsonb('tags').$type<string[]>().default([]),
  memo: text('memo'),
  level: varchar('level', { length: 10 }).notNull(),
  createdAt: date('created_at').notNull(),
  nextReviewAt: date('next_review_at').notNull(),
});
```

**쿼리**:
```typescript
import { db } from './client';
import { problems } from './schema';
import { eq } from 'drizzle-orm';

// SELECT
const allProblems = await db.select().from(problems);

// WHERE
const userProblems = await db
  .select()
  .from(problems)
  .where(eq(problems.userId, 1));

// INSERT
await db.insert(problems).values({
  userId: 1,
  name: 'BOJ 1000',
  level: 'GOOD',
  // ...
});
```

**대안**:
- Prisma: 더 큰 생태계, 더 무거움
- Kysely: 더 SQL에 가까움
- Raw SQL: 최대 제어, 타입 안전성 없음

---

### 🔐 인증

#### Clerk
- **선택 이유**:
  - 완전 관리형 인증
  - 소셜 로그인 (Google, GitHub)
  - 무료 티어: 5,000 MAU
  - TypeScript SDK
  - React/Svelte 컴포넌트 제공

**설치**:
```bash
npm install @clerk/clerk-sdk-node
npm install @clerk/svelte  # 프론트엔드
```

**백엔드 미들웨어**:
```typescript
import { clerkMiddleware } from '@clerk/clerk-sdk-node';

app.use('*', clerkMiddleware());

app.get('/api/protected', (c) => {
  const userId = c.get('auth').userId;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  // ...
});
```

**대안**:
- NextAuth.js: 오픈소스, 더 많은 제어
- Supabase Auth: DB와 통합
- JWT 직접 구현: 최대 제어, 복잡함

---

### 🤖 LLM 통합

#### Anthropic Claude API
- **모델**: Claude 3.5 Sonnet
- **선택 이유**:
  - 최고의 추론 능력
  - 긴 컨텍스트 (200K 토큰)
  - Prompt Caching (비용 절감)
  - 한국어 지원 우수

**설치**:
```bash
npm install @anthropic-ai/sdk
```

**사용 예시**:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: 'Recommend 3 algorithm problems for a beginner',
  }],
});

console.log(response.content[0].text);
```

**비용 (Claude 3.5 Sonnet)**:
- Input: $3 / 1M 토큰
- Output: $15 / 1M 토큰
- Prompt Caching: 90% 할인

**예상 비용** (개인 사용):
- 월 10회 추천: ~$0.05
- 월 20회 분석: ~$0.10
- **총합: ~$0.15/월**

**대안**:
- OpenAI GPT-4: 더 큰 생태계
- Google Gemini: 무료 티어 큼
- Local LLMs (Ollama): 무료, 품질 낮음

---

### 🔍 입력 검증

#### Zod
- **버전**: 3.x
- **선택 이유**:
  - TypeScript 타입 추론
  - 런타임 검증
  - 명확한 에러 메시지

**예시**:
```typescript
import { z } from 'zod';

const problemSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url().optional(),
  tags: z.array(z.string()),
  memo: z.string(),
  level: z.enum(['AGAIN', 'HARD', 'GOOD', 'EASY']),
});

type Problem = z.infer<typeof problemSchema>;

// 검증
const result = problemSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}
```

**Hono 통합**:
```typescript
import { zValidator } from '@hono/zod-validator';

app.post('/api/problems', zValidator('json', problemSchema), async (c) => {
  const data = c.req.valid('json'); // 타입 안전!
  // ...
});
```

---

### 📊 환경 변수 관리

#### dotenv
- **파일**: `.env`, `.env.local`

**예시** (`.env`):
```bash
# Database
POSTGRES_URL=postgresql://user:password@host/db

# LLM
ANTHROPIC_API_KEY=sk-ant-...

# Auth
CLERK_SECRET_KEY=sk_test_...

# App
NODE_ENV=development
PORT=3000
```

**사용**:
```typescript
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY is required');
}
```

---

## 개발 도구

### 🔨 코드 품질

#### ESLint
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### Prettier
```bash
npm install -D prettier prettier-plugin-svelte
```

**.prettierrc**:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-svelte"]
}
```

---

### 📦 버전 관리

#### Git Hooks (Husky)
```bash
npm install -D husky lint-staged
```

**package.json**:
```json
{
  "lint-staged": {
    "*.{ts,svelte}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 번들 크기 비교

### 현재 스택 (Rust/WASM)
- WASM: 222KB
- JS Glue: 10KB
- App JS: 15KB
- **Total: ~247KB**

### 새 스택 (TypeScript/Svelte)
- Svelte Runtime: ~5KB (컴파일됨)
- App Code: ~20KB
- Dependencies: ~15KB (marked, date-fns)
- **Total: ~40KB (gzip: ~15KB)**

**개선**: 6배 작음!

---

## 개발 환경 요구사항

### Phase 1
- Node.js 20+
- npm 10+
- Git
- 코드 에디터 (VS Code 추천)

### Phase 2
- Bun 1.0+
- PostgreSQL (로컬 개발용)
- Docker (선택사항)

---

## VS Code 확장

1. **Svelte for VS Code** (`svelte.svelte-vscode`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **ESLint** (`dbaeumer.vscode-eslint`)
4. **TypeScript + Svelte Plugin**

---

## 참고 링크

- [Svelte 공식 문서](https://svelte.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [Hono 공식 문서](https://hono.dev)
- [Drizzle ORM 문서](https://orm.drizzle.team)
- [Anthropic API 문서](https://docs.anthropic.com)

---

**작성일**: 2025-11-23
**버전**: 1.0
**작성자**: Claude Code
