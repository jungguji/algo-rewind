# Algo-Rewind 아키텍처 설계

## 개요

TypeScript + Svelte 5 기반의 새로운 Algo-Rewind 아키텍처 설계 문서입니다.

## 시스템 아키텍처

### Phase 1: Frontend-Only (현재 마이그레이션 대상)

```
┌─────────────────────────────────────────────┐
│           Browser (클라이언트)                │
├─────────────────────────────────────────────┤
│  Svelte 5 Frontend                          │
│  ├── UI Components                          │
│  ├── Stores (상태 관리)                      │
│  ├── SRS Logic                              │
│  └── LocalStorage                           │
└─────────────────────────────────────────────┘
```

**특징**:
- 백엔드 없음
- 모든 데이터는 브라우저 LocalStorage에 저장
- 정적 파일로 GitHub Pages 배포 가능

### Phase 2: Full-Stack (향후 확장)

```
┌──────────────────┐
│   Browser        │
│                  │
│  Svelte 5 SPA    │◄────┐
└──────────────────┘     │
         │               │
         │ REST API      │ Static Files
         │               │
         ▼               │
┌──────────────────┐     │
│  Backend Server  │     │
│  (Hono + Bun)    │─────┘
│                  │
│  ├── API Routes  │
│  ├── LLM Client  │
│  └── Auth        │
└──────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│   PostgreSQL     │     │  Anthropic API   │
│   (Vercel)       │     │  (Claude)        │
└──────────────────┘     └──────────────────┘
```

**특징**:
- SPA + Backend API 분리
- RESTful API
- PostgreSQL로 영구 저장
- LLM 통합

## 프론트엔드 아키텍처 (Phase 1)

### 디렉토리 구조

```
src/
├── lib/
│   ├── types/                  # TypeScript 타입 정의
│   │   └── problem.ts          # Problem, Level 등
│   │
│   ├── stores/                 # Svelte Stores (상태 관리)
│   │   ├── problems.ts         # 문제 목록 store
│   │   └── ui.ts               # UI 상태 (toast, modal)
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── srs.ts              # SRS 알고리즘
│   │   ├── storage.ts          # LocalStorage 래퍼
│   │   ├── date.ts             # 날짜 포맷팅
│   │   └── validation.ts       # 입력 검증
│   │
│   └── components/             # 재사용 컴포넌트
│       ├── layout/
│       │   ├── Header.svelte
│       │   ├── Footer.svelte
│       │   └── DataControls.svelte
│       │
│       ├── problem/
│       │   ├── ProblemCard.svelte
│       │   ├── ProblemForm.svelte
│       │   ├── ProblemList.svelte
│       │   └── ProblemFilters.svelte
│       │
│       ├── review/
│       │   ├── ReviewModal.svelte
│       │   ├── TodayReviews.svelte
│       │   └── ReviewButton.svelte
│       │
│       └── ui/
│           ├── Button.svelte
│           ├── Input.svelte
│           ├── Select.svelte
│           ├── Textarea.svelte
│           ├── Modal.svelte
│           └── Toast.svelte
│
├── App.svelte                  # 루트 컴포넌트
├── main.ts                     # 진입점
└── app.css                     # 글로벌 스타일
```

### 데이터 흐름 (Svelte Stores)

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
Store Method Call
    │
    ├─► Update Store State
    ├─► Save to LocalStorage
    └─► Trigger UI Re-render (reactive)
```

**예시**:
```typescript
// 사용자가 문제 추가 버튼 클릭
handleSubmit() {
  // Store 메서드 호출
  problems.add(newProblem);
  // → Store 내부에서 자동으로:
  //   1. 상태 업데이트
  //   2. LocalStorage 저장
  //   3. 모든 구독자(컴포넌트) 재렌더링
}
```

### 주요 Store 설계

#### 1. Problems Store (`stores/problems.ts`)

```typescript
interface ProblemStore {
  subscribe: Readable<Problem[]>['subscribe'];
  add: (problem: Problem) => void;
  update: (id: number, updater: (p: Problem) => Problem) => void;
  remove: (id: number) => void;
  clear: () => void;
  import: (problems: Problem[]) => void;
  filter: (query: string) => void;
  sort: (criteria: SortCriteria) => void;
}
```

**파생 Store**:
```typescript
// 오늘 복습할 문제 (자동 계산)
export const todayReviews = derived(problems, $problems =>
  getTodayReviews($problems)
);

// 검색 결과 (필터링된 문제)
export const filteredProblems = derived(
  [problems, searchQuery],
  ([$problems, $query]) => filterProblems($problems, $query)
);
```

#### 2. UI Store (`stores/ui.ts`)

```typescript
interface UIStore {
  toast: Writable<ToastState>;
  modal: Writable<ModalState>;
  loading: Writable<boolean>;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface ModalState {
  show: boolean;
  type: 'review' | 'delete' | 'edit' | null;
  data: any;
}
```

### 컴포넌트 계층 구조

```
App.svelte
├── Header.svelte
├── DataControls.svelte
│   ├── Button (Import)
│   ├── Button (Export)
│   └── Button (Clear)
│
├── ProblemForm.svelte
│   ├── Input (name)
│   ├── Input (url)
│   ├── Input (tags)
│   ├── Textarea (memo)
│   ├── Select (level)
│   └── Button (submit)
│
├── TodayReviews.svelte
│   └── ProblemList
│       └── ProblemCard * N
│           ├── Button (메모 보기)
│           └── Button (복습 완료)
│
├── ProblemFilters.svelte
│   ├── Input (search)
│   └── Select (sort)
│
├── ProblemList.svelte (전체 문제)
│   └── ProblemCard * N
│
├── ReviewModal.svelte
│   ├── Modal
│   └── Button * 4 (AGAIN/HARD/GOOD/EASY)
│
└── Toast.svelte
```

### 라우팅 (SvelteKit 사용 시)

Phase 1에서는 SPA이므로 라우팅 불필요. 향후 확장 시:

```
routes/
├── +page.svelte              # 홈 (문제 목록)
├── +layout.svelte            # 공통 레이아웃
├── problems/
│   ├── +page.svelte          # 문제 목록
│   └── [id]/
│       └── +page.svelte      # 문제 상세
├── review/
│   └── +page.svelte          # 오늘의 복습
└── stats/
    └── +page.svelte          # 통계 (향후)
```

## 백엔드 아키텍처 (Phase 2)

### 기술 스택
- **Runtime**: Bun (빠른 TypeScript 실행)
- **Framework**: Hono (경량 웹 프레임워크)
- **Database**: PostgreSQL (Vercel Postgres)
- **ORM**: Drizzle (타입 안전 쿼리)
- **Auth**: Clerk (간편 인증)
- **LLM**: Anthropic Claude API

### 디렉토리 구조

```
backend/
├── src/
│   ├── index.ts              # 진입점
│   ├── routes/               # API 라우트
│   │   ├── problems.ts       # /api/problems
│   │   ├── reviews.ts        # /api/reviews
│   │   ├── recommendations.ts # /api/recommendations
│   │   └── auth.ts           # /api/auth
│   │
│   ├── services/             # 비즈니스 로직
│   │   ├── srs.service.ts
│   │   ├── llm.service.ts
│   │   └── problem.service.ts
│   │
│   ├── db/                   # 데이터베이스
│   │   ├── schema.ts         # Drizzle 스키마
│   │   ├── client.ts         # DB 클라이언트
│   │   └── migrations/
│   │
│   ├── middleware/
│   │   ├── auth.ts           # 인증 미들웨어
│   │   ├── cors.ts
│   │   └── logger.ts
│   │
│   └── lib/
│       ├── anthropic.ts      # LLM 클라이언트
│       └── validation.ts     # Zod 스키마
│
├── package.json
└── tsconfig.json
```

### API 엔드포인트 설계

#### 인증
```
POST   /api/auth/signup         # 회원가입
POST   /api/auth/login          # 로그인
POST   /api/auth/logout         # 로그아웃
GET    /api/auth/me             # 현재 사용자 정보
```

#### 문제 관리
```
GET    /api/problems            # 문제 목록 조회
POST   /api/problems            # 문제 추가
GET    /api/problems/:id        # 문제 상세 조회
PATCH  /api/problems/:id        # 문제 수정
DELETE /api/problems/:id        # 문제 삭제
GET    /api/problems/today      # 오늘 복습할 문제
```

#### 복습
```
POST   /api/reviews             # 복습 완료 기록
GET    /api/reviews             # 복습 이력 조회
GET    /api/reviews/stats       # 복습 통계
```

#### LLM 기능
```
POST   /api/recommendations     # 문제 추천 받기
POST   /api/analyze             # 학습 패턴 분석
POST   /api/enhance-memo        # 메모 자동 개선
```

### 데이터베이스 스키마

```sql
-- 사용자
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 문제
CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT,
  tags JSONB DEFAULT '[]',
  memo TEXT,
  level VARCHAR(10) NOT NULL,  -- AGAIN, HARD, GOOD, EASY
  created_at DATE NOT NULL,
  next_review_at DATE NOT NULL,
  review_count INTEGER DEFAULT 0,
  INDEX idx_user_next_review (user_id, next_review_at),
  INDEX idx_tags USING GIN (tags)
);

-- 복습 이력
CREATE TABLE review_history (
  id SERIAL PRIMARY KEY,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(10) NOT NULL,
  reviewed_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_problem_reviewed (problem_id, reviewed_at)
);

-- LLM 캐시 (비용 절감)
CREATE TABLE llm_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  INDEX idx_cache_key_expires (cache_key, expires_at)
);
```

### Drizzle 스키마 (`db/schema.ts`)

```typescript
import { pgTable, serial, varchar, text, integer, jsonb, timestamp, date, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url'),
  tags: jsonb('tags').default([]),
  memo: text('memo'),
  level: varchar('level', { length: 10 }).notNull(),
  createdAt: date('created_at').notNull(),
  nextReviewAt: date('next_review_at').notNull(),
  reviewCount: integer('review_count').default(0),
}, (table) => ({
  userNextReviewIdx: index('idx_user_next_review').on(table.userId, table.nextReviewAt),
}));

export const reviewHistory = pgTable('review_history', {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id').references(() => problems.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  level: varchar('level', { length: 10 }).notNull(),
  reviewedAt: timestamp('reviewed_at').defaultNow(),
});
```

### API 예시 (`routes/problems.ts`)

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db/client';
import { problems } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// 인증 미들웨어 적용
app.use('*', authMiddleware);

// 문제 목록 조회
app.get('/', async (c) => {
  const userId = c.get('userId');
  const problemList = await db
    .select()
    .from(problems)
    .where(eq(problems.userId, userId));
  return c.json(problemList);
});

// 문제 추가
const createProblemSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  tags: z.array(z.string()),
  memo: z.string(),
  level: z.enum(['AGAIN', 'HARD', 'GOOD', 'EASY']),
});

app.post('/', zValidator('json', createProblemSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');

  const today = new Date().toISOString().split('T')[0];
  const nextReview = calculateNextReview(today, data.level);

  const [problem] = await db
    .insert(problems)
    .values({
      userId,
      ...data,
      createdAt: today,
      nextReviewAt: nextReview,
    })
    .returning();

  return c.json(problem, 201);
});

// 오늘 복습할 문제
app.get('/today', async (c) => {
  const userId = c.get('userId');
  const today = new Date().toISOString().split('T')[0];

  const todayProblems = await db
    .select()
    .from(problems)
    .where(
      and(
        eq(problems.userId, userId),
        lte(problems.nextReviewAt, today)
      )
    );

  return c.json(todayProblems);
});

export default app;
```

### LLM 서비스 (`services/llm.service.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { Problem } from '../types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class LLMService {
  /**
   * 사용자의 문제 풀이 패턴을 분석하고 새로운 문제를 추천
   */
  async recommendProblems(problems: Problem[]): Promise<string[]> {
    const prompt = `
You are an algorithm study assistant. Analyze the user's problem-solving history and recommend 3 new problems they should practice.

User's problem history:
${JSON.stringify(problems, null, 2)}

Consider:
1. Topics they struggle with (many AGAIN/HARD reviews)
2. Topics they've mastered (mostly EASY reviews)
3. Balanced difficulty progression

Respond with a JSON array of 3 problem recommendations:
[
  {
    "name": "Problem name",
    "reason": "Why this problem",
    "difficulty": "Easy/Medium/Hard",
    "topics": ["topic1", "topic2"]
  }
]
    `;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Unexpected response format');
  }

  /**
   * 학습 패턴 분석
   */
  async analyzeProgress(problems: Problem[], reviews: any[]): Promise<string> {
    const prompt = `
Analyze the user's algorithm study progress and provide insights.

Problems: ${problems.length} total
Reviews: ${reviews.length} total

Problem breakdown:
${JSON.stringify(this.groupByLevel(problems), null, 2)}

Provide:
1. Strengths (topics they're doing well in)
2. Weaknesses (topics to focus on)
3. Study recommendations
4. Progress trend

Keep it concise (3-5 sentences).
    `;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  private groupByLevel(problems: Problem[]) {
    return problems.reduce((acc, p) => {
      acc[p.level] = (acc[p.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
```

## 배포 아키텍처

### Phase 1: Static Hosting

```
GitHub Repository
    │
    ▼
GitHub Actions (CI/CD)
    │
    ├─► npm run build
    ├─► Generate static files
    └─► Deploy to GitHub Pages
```

**장점**:
- 무료
- 자동 HTTPS
- 간단한 배포

### Phase 2: Full-Stack Deployment

```
Frontend (Vercel)
    ├─► Static SPA hosting
    └─► Edge CDN

Backend (Vercel Functions)
    ├─► Serverless functions
    └─► Auto-scaling

Database (Vercel Postgres)
    └─► Managed PostgreSQL

External Services
    └─► Anthropic API (Claude)
```

**대안**:
- Backend: Railway, Fly.io, Render
- Database: Neon, Supabase, PlanetScale
- All-in-one: Supabase (DB + Auth + Storage)

## 보안 고려사항

### 프론트엔드
1. **XSS 방지**: DOMPurify로 마크다운 sanitization
2. **LocalStorage**: 민감 정보 저장 금지
3. **HTTPS**: GitHub Pages 기본 제공

### 백엔드
1. **인증**: JWT 또는 Clerk
2. **API Key 보호**: 환경 변수로 관리
3. **Rate Limiting**: LLM API 호출 제한
4. **SQL Injection**: Drizzle ORM 사용 (파라미터화 쿼리)
5. **CORS**: 프론트엔드 도메인만 허용

## 성능 최적화

### 프론트엔드
1. **Code Splitting**: Vite 자동 처리
2. **Lazy Loading**: 컴포넌트 동적 import
3. **이미지 최적화**: WebP 사용
4. **번들 크기**: Gzip 압축 < 100KB

### 백엔드
1. **Database Indexing**: user_id, next_review_at 인덱싱
2. **LLM Caching**: 동일 요청 캐싱 (1시간 TTL)
3. **Connection Pooling**: Drizzle 기본 제공
4. **Response Caching**: HTTP Cache-Control 헤더

## 모니터링 및 로깅

### 프론트엔드
- **에러 추적**: Sentry (선택사항)
- **분석**: Google Analytics (선택사항)

### 백엔드
- **로깅**: Pino 또는 Winston
- **APM**: Vercel Analytics
- **에러 추적**: Sentry

## 확장 가능성

### 향후 기능
1. **소셜 기능**: 친구와 문제 공유
2. **통계 대시보드**: 학습 진행도 시각화
3. **문제 추천 AI**: 개인화된 학습 경로
4. **스트릭 시스템**: 연속 학습 일수 추적
5. **이메일 알림**: 복습 리마인더

### 확장 전략
1. Phase 1 → Phase 2: 백엔드 추가 (사용자 증가 시)
2. PostgreSQL → Redis: 캐싱 레이어 추가
3. Monolith → Microservices: LLM 서비스 분리

---

**작성일**: 2025-11-23
**버전**: 1.0
**작성자**: Claude Code
