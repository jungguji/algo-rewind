# TypeScript + Svelte 5 마이그레이션 계획

## 개요

Algo-Rewind를 현재 Rust/WASM + Vanilla JS 스택에서 TypeScript + Svelte 5 스택으로 마이그레이션하는 계획 문서입니다.

## 마이그레이션 이유

### 현재 스택의 한계
1. **성능 이득 없음**: WASM으로 처리하는 로직(필터링, 정렬)이 8-100개 정도의 작은 데이터셋에서 불필요
2. **복잡한 빌드**: Rust 컴파일 + WASM 빌드 과정이 3-5분 소요
3. **LLM 통합 어려움**: Rust에서 LLM API를 직접 호출하려면 수동 JSON 처리 필요
4. **확장성 제한**: LocalStorage만 사용, 백엔드 없음

### 새 스택의 장점
1. **빠른 개발**: TypeScript 생산성, Svelte의 간결한 문법
2. **백엔드 추가 용이**: Node.js/Bun 백엔드로 LLM API 호출 및 DB 연동
3. **작은 번들**: WASM 222KB → TypeScript ~20KB
4. **개발자 경험**: HMR, 빠른 빌드, 쉬운 디버깅

## 현재 시스템 분석

### 코드 구조
```
algo-rewind/
├── src/                    # Rust 코드
│   ├── lib.rs             # WASM 진입점 (138줄)
│   ├── models/
│   │   └── problem.rs     # Problem, Level 모델 (62줄)
│   └── srs/
│       └── scheduler.rs   # SRS 알고리즘 (53줄)
├── www/                    # 프론트엔드
│   ├── index.html         # HTML 구조 (112줄)
│   ├── style.css          # 스타일 (448줄)
│   ├── app.js             # JavaScript 로직 (520줄)
│   └── wasm/              # 빌드된 WASM 파일
└── Cargo.toml             # Rust 의존성
```

### 재사용 가능한 자산

#### 1. CSS (거의 100% 재사용)
- **style.css (448줄)**: 깔끔하고 잘 구조화된 스타일
- 컴포넌트별 스타일 분리 가능
- 반응형 디자인 포함

#### 2. HTML 구조 (80% 재사용)
- 폼 레이아웃
- Problem Card 구조
- 모달 구조
- Toast 알림
- Svelte 컴포넌트로 변환 필요

#### 3. 비즈니스 로직 (100% 재사용)
- **SRS 알고리즘**:
  ```typescript
  const SRS_INTERVALS = {
    AGAIN: 1,
    HARD: 3,
    GOOD: 7,
    EASY: 30
  };
  ```
- **데이터 모델**: Problem, Level 타입
- **날짜 계산 로직**

#### 4. UI 로직 (70% 재사용)
- 필터링/정렬 로직
- LocalStorage 저장/불러오기
- Import/Export 기능
- Modal 관리
- Toast 알림

## 마이그레이션 전략

### 접근 방식: 같은 Repo, 브랜치 전략

**중요**: 새 프로젝트를 만들지 않고, **같은 저장소 내에서 브랜치를 만들어** 마이그레이션합니다.

**이유**:
- Claude Code가 기존 코드를 참조하며 작업 가능
- Git 히스토리 유지
- 기존 Rust 코드 보면서 TypeScript로 변환
- 언제든 롤백 가능

### 프로젝트 구조 (마이그레이션 중)

```
algo-rewind/
├── src/                    # 기존 Rust 코드 (유지)
├── www/                    # 기존 프론트 (유지)
├── frontend-v2/            # 새 Svelte 프론트엔드 (추가)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── types/
│   │   │   ├── stores/
│   │   │   ├── utils/
│   │   │   └── components/
│   │   ├── App.svelte
│   │   ├── main.ts
│   │   └── app.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docs/
├── Cargo.toml
└── README.md
```

**마이그레이션 완료 후** (선택 1: 클린업)
```
algo-rewind/
├── legacy/                 # 기존 코드 보관
│   ├── rust-src/
│   └── www/
├── src/                    # Svelte 코드
├── public/
├── package.json
└── ...
```

**마이그레이션 완료 후** (선택 2: 병행 유지)
```
algo-rewind/
├── frontend-v2/            # 새 버전 (메인)
├── legacy/                 # v1 (참고용)
└── backend/                # 향후 추가
```

## 단계별 로드맵

### Phase 0: 준비 (1일)

#### Git 브랜치 생성
```bash
# 현재 작업 커밋
git add .
git commit -m "feat: 현재 Rust/WASM 버전 완료"

# 마이그레이션 브랜치 생성
git checkout -b migrate-to-svelte

# 안전을 위한 태그
git tag v1.0-rust-wasm
```

#### frontend-v2 디렉토리 생성
```bash
# frontend-v2 폴더에 Svelte 프로젝트 초기화
mkdir frontend-v2
cd frontend-v2
npm create vite@latest . -- --template svelte-ts
npm install
```

#### 의존성 설치
```bash
npm install marked dompurify date-fns
npm install -D @types/dompurify
```

### Phase 1: 프로젝트 초기화 (1일)

#### 디렉토리 구조 생성
```bash
cd frontend-v2
mkdir -p src/lib/{types,stores,utils,components/{layout,problem,review,ui}}
```

**생성할 파일**:
```
frontend-v2/src/lib/
├── types/
│   └── problem.ts
├── stores/
│   ├── problems.ts
│   └── ui.ts
├── utils/
│   ├── srs.ts
│   ├── storage.ts
│   ├── filter.ts
│   └── import-export.ts
└── components/
    ├── layout/
    │   ├── Header.svelte
    │   └── DataControls.svelte
    ├── problem/
    │   ├── ProblemCard.svelte
    │   ├── ProblemForm.svelte
    │   └── ProblemList.svelte
    ├── review/
    │   └── ReviewModal.svelte
    └── ui/
        ├── Button.svelte
        ├── Modal.svelte
        └── Toast.svelte
```

#### Vite 설정
```typescript
// frontend-v2/vite.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'esnext',
    minify: 'terser',
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '$lib': '/src/lib',
    },
  },
});
```

### Phase 2: 코어 로직 이식 (2-3일)

#### 작업 순서

**1. 타입 정의** (`src/lib/types/problem.ts`)
```bash
# ../src/models/problem.rs 참고하며 작성
```

```typescript
export enum Level {
  AGAIN = 'AGAIN',
  HARD = 'HARD',
  GOOD = 'GOOD',
  EASY = 'EASY',
}

export interface Problem {
  id: number;
  name: string;
  url?: string;
  tags: string[];
  memo: string;
  level: Level;
  created_at: string;
  next_review_at: string;
}
```

**2. SRS 로직** (`src/lib/utils/srs.ts`)
```bash
# ../src/srs/scheduler.rs 참고
```

```typescript
import { addDays, format } from 'date-fns';
import { Level } from '../types/problem';

const SRS_INTERVALS: Record<Level, number> = {
  [Level.AGAIN]: 1,
  [Level.HARD]: 3,
  [Level.GOOD]: 7,
  [Level.EASY]: 30,
};

export function calculateNextReview(currentDate: string, level: Level): string {
  const date = new Date(currentDate);
  const days = SRS_INTERVALS[level];
  return format(addDays(date, days), 'yyyy-MM-dd');
}

export function getTodayReviews(problems: Problem[]): Problem[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  return problems.filter(p => p.next_review_at <= today);
}
```

**3. LocalStorage 유틸** (`src/lib/utils/storage.ts`)
```bash
# ../www/app.js의 saveToLocalStorage, loadFromLocalStorage 참고
```

**4. Svelte Store** (`src/lib/stores/problems.ts`)
```typescript
import { writable, derived } from 'svelte/store';
import type { Problem } from '../types/problem';
import { loadProblems, saveProblems } from '../utils/storage';
import { getTodayReviews } from '../utils/srs';

function createProblemStore() {
  const { subscribe, set, update } = writable<Problem[]>(loadProblems());

  return {
    subscribe,
    add: (problem: Problem) => {
      update(problems => {
        const updated = [...problems, problem];
        saveProblems(updated);
        return updated;
      });
    },
    update: (id: number, updater: (p: Problem) => Problem) => {
      update(problems => {
        const updated = problems.map(p => p.id === id ? updater(p) : p);
        saveProblems(updated);
        return updated;
      });
    },
    remove: (id: number) => {
      update(problems => {
        const updated = problems.filter(p => p.id !== id);
        saveProblems(updated);
        return updated;
      });
    },
    clear: () => {
      set([]);
      saveProblems([]);
    },
    import: (problems: Problem[]) => {
      set(problems);
      saveProblems(problems);
    }
  };
}

export const problems = createProblemStore();

export const todayReviews = derived(problems, $problems =>
  getTodayReviews($problems)
);
```

### Phase 3: 컴포넌트 개발 (3-4일)

#### CSS 이식
```bash
# ../www/style.css를 참고하여:
# 1. 글로벌 스타일 → frontend-v2/src/app.css
# 2. 컴포넌트 스타일 → 각 .svelte 파일의 <style> 태그
```

#### 주요 컴포넌트 개발 순서

1. **UI 기본 컴포넌트** (1일)
   - Button.svelte
   - Input.svelte
   - Modal.svelte
   - Toast.svelte

2. **레이아웃 컴포넌트** (0.5일)
   - Header.svelte
   - DataControls.svelte

3. **Problem 컴포넌트** (1.5일)
   - ProblemCard.svelte (가장 복잡)
   - ProblemForm.svelte
   - ProblemList.svelte

4. **Review 컴포넌트** (0.5일)
   - ReviewModal.svelte

5. **App.svelte 통합** (0.5일)

**참고**: `../www/index.html`과 `../www/app.js`를 보면서 작업

### Phase 4: 통합 및 테스트 (1-2일)

#### 작업 내용
1. **App.svelte에서 모든 컴포넌트 통합**
2. **기존 데이터 마이그레이션 테스트**
   - LocalStorage 키 동일 (`algo-rewind-problems`)
   - 데이터 구조 호환성 확인
3. **수동 테스트**
   - 문제 추가/수정/삭제
   - 복습 완료 처리
   - 검색/정렬/필터링
   - Import/Export
   - LocalStorage 저장/불러오기
4. **반응형 테스트** (모바일, 태블릿)

### Phase 5: 배포 준비 (1일)

#### 빌드 설정
```bash
cd frontend-v2
npm run build
# dist/ 폴더 생성 확인
```

#### GitHub Pages 배포
```bash
# package.json에 추가
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

npm install -D gh-pages
```

#### GitHub Actions (`.github/workflows/deploy-v2.yml`)
```yaml
name: Deploy Svelte Frontend

on:
  push:
    branches: [migrate-to-svelte]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd frontend-v2 && npm ci
      - run: cd frontend-v2 && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend-v2/dist
```

#### README 업데이트
```markdown
# Algo-Rewind

## Version 2.0 (TypeScript + Svelte 5)

위치: `frontend-v2/`

### 개발 서버 실행
\`\`\`bash
cd frontend-v2
npm install
npm run dev
\`\`\`

### 빌드
\`\`\`bash
npm run build
\`\`\`

---

## Version 1.0 (Rust/WASM) - Legacy

위치: `src/`, `www/`

참고용으로 보관됨.
```

## 마이그레이션 완료 후 선택지

### 옵션 1: 기존 코드 보관 (추천)
```bash
# migrate-to-svelte 브랜치에서
git checkout -b main-v2

# 기존 master를 legacy로 변경
git branch -m master legacy-rust-wasm

# v2를 새 master로
git branch -m main-v2 master

# 원격 반영
git push origin master --force
git push origin legacy-rust-wasm
```

**결과**:
- `master`: Svelte 버전
- `legacy-rust-wasm`: Rust 버전 (참고용)

### 옵션 2: 폴더만 정리
```bash
# migrate-to-svelte 브랜치에서
mkdir legacy
git mv src/ legacy/rust-src/
git mv www/ legacy/www/
git mv Cargo.toml legacy/

# frontend-v2를 루트로 이동
mv frontend-v2/* .
mv frontend-v2/.* .
rmdir frontend-v2

git add .
git commit -m "refactor: 프로젝트 구조 정리"
git push origin migrate-to-svelte
```

**결과**:
- 루트에 Svelte 프로젝트
- `legacy/`에 Rust 코드 보관

## 데이터 마이그레이션

### LocalStorage 호환성

**기존 키**: `algo-rewind-problems`
**새 키**: `algo-rewind-problems` (동일!)

**데이터 구조**: 변경 없음!

```json
[
  {
    "id": 1730980800000,
    "name": "BOJ 1000",
    "url": "https://...",
    "tags": ["기초", "구현"],
    "memo": "간단한 A+B",
    "level": "GOOD",
    "created_at": "2025-11-02",
    "next_review_at": "2025-11-09"
  }
]
```

**결론**: 사용자가 기존 데이터를 잃지 않음!

## Claude Code 활용 방법

### 컨텍스트 제공

```
현재 작업: frontend-v2/src/lib/components/problem/ProblemCard.svelte 개발 중

참고할 기존 코드:
1. www/app.js의 createProblemCard 함수 (line 308-336)
2. www/style.css의 .problem-card 스타일 (line 166-336)
3. src/models/problem.rs의 Problem 구조체

요구사항:
- 마크다운 렌더링 (marked + DOMPurify)
- 메모 토글 기능
- 복습 버튼 (isReview=true일 때만)
```

이렇게 하면 Claude Code가 기존 코드를 참조하며 작업 가능!

## 백엔드 추가 (향후 작업)

### Phase 6: 백엔드 개발 (별도 계획)

```
algo-rewind/
├── frontend/               # 프론트엔드 (완성)
├── backend/                # 백엔드 (새로 추가)
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── db/
│   └── package.json
└── legacy/
```

#### 기술 스택
- Runtime: Bun
- Framework: Hono
- Database: PostgreSQL (Vercel Postgres)
- ORM: Drizzle
- LLM: Anthropic Claude API

*백엔드 상세 계획은 `architecture.md` 참고*

## 리스크 및 대응

### 1. 기존 코드 참조 어려움
- **대응**: 같은 repo에 보관, Claude에게 명시적으로 파일 경로 제공

### 2. LocalStorage 데이터 손실
- **대응**: 키 이름 동일하게 유지

### 3. CSS 스타일 깨짐
- **대응**: 기존 CSS를 그대로 복사 후 점진적 수정

## 성공 기준

### 기능적 기준
- [ ] 모든 기존 기능 동작 (추가, 수정, 삭제, 복습, 검색, 정렬)
- [ ] LocalStorage 저장/불러오기
- [ ] Import/Export JSON
- [ ] 마크다운 렌더링
- [ ] 반응형 디자인

### 비기능적 기준
- [ ] 빌드 시간 < 10초
- [ ] 번들 크기 < 100KB (gzip)
- [ ] 첫 페이지 로드 < 1초
- [ ] 타입 에러 0개

## 타임라인

| Phase | 작업 내용 | 예상 시간 | 누적 시간 |
|-------|----------|---------|---------|
| Phase 0 | 준비 (브랜치, 초기화) | 1일 | 1일 |
| Phase 1 | 프로젝트 초기화 | 1일 | 2일 |
| Phase 2 | 코어 로직 이식 | 2-3일 | 4-5일 |
| Phase 3 | 컴포넌트 개발 | 3-4일 | 7-9일 |
| Phase 4 | 통합 및 테스트 | 1-2일 | 8-11일 |
| Phase 5 | 배포 준비 | 1일 | 9-12일 |

**총 예상 시간**: 1.5-2주 (파트타임 기준)

## 다음 단계

1. ✅ 마이그레이션 계획 검토 (현재 문서)
2. ⬜ Git 브랜치 생성 (`migrate-to-svelte`)
3. ⬜ `frontend-v2/` 디렉토리에 Svelte 프로젝트 초기화
4. ⬜ 코어 로직 이식 시작
5. ⬜ 컴포넌트 개발
6. ⬜ 통합 테스트
7. ⬜ 배포

## 참고 문서

- [architecture.md](./architecture.md) - 새 시스템 아키텍처
- [tech-stack.md](./tech-stack.md) - 기술 스택 상세
- [reusable-assets.md](./reusable-assets.md) - 재사용 가능한 자산 목록

---

**작성일**: 2025-11-23
**버전**: 1.1 (브랜치 전략으로 수정)
**작성자**: Claude Code
