# Algo-Rewind 개발 계획서

## 1. 아키텍처 개요

### 1.1 기술 스택 상세
- **Rust + WebAssembly**: 핵심 비즈니스 로직 구현
  - `wasm-pack`: WASM 빌드 도구
  - `wasm-bindgen`: Rust ↔ JavaScript 바인딩
  - `serde`, `serde_json`: JSON 직렬화/역직렬화
  - `chrono`: 날짜 계산

- **Vanilla JavaScript**:
  - WASM 모듈 로딩 및 호출
  - DOM 조작 및 UI 렌더링
  - File API를 통한 로컬 파일 입출력

- **HTML5 + CSS3**:
  - 시맨틱 HTML 구조
  - 최소한의 스타일링 (가독성 중심)

### 1.2 시스템 아키텍처

```
┌─────────────────────────────────────────┐
│         Browser (index.html)            │
├─────────────────────────────────────────┤
│  JavaScript Layer                       │
│  - UI Rendering                         │
│  - Event Handling                       │
│  - File I/O (Import/Export JSON)        │
│  - WASM Module Loading                  │
├─────────────────────────────────────────┤
│  WASM (Rust Compiled)                   │
│  - Problem Data Model                   │
│  - SRS Logic (Next Review Date Calc)   │
│  - Data Serialization/Deserialization   │
│  - Filter & Sort Operations             │
└─────────────────────────────────────────┘
          ↕
┌─────────────────────────────────────────┐
│  Local File System                      │
│  - algo-rewind.json (User Data)         │
└─────────────────────────────────────────┘
```

---

## 2. 디렉토리 구조

```
algo-rewind/
├── Cargo.toml                 # Rust 프로젝트 설정
├── src/
│   ├── lib.rs                # WASM 엔트리포인트
│   ├── models/
│   │   └── problem.rs        # Problem 데이터 구조
│   ├── srs/
│   │   └── scheduler.rs      # SRS 로직 (복습 주기 계산)
│   └── utils/
│       ├── date.rs           # 날짜 유틸리티
│       └── serializer.rs     # JSON 직렬화 헬퍼
├── www/
│   ├── index.html            # 메인 HTML
│   ├── style.css             # 스타일시트
│   ├── app.js                # 메인 JavaScript
│   └── wasm/                 # WASM 빌드 결과물 (gitignore)
├── pkg/                      # wasm-pack 빌드 출력 (gitignore)
└── docs/
    ├── PRD.md                # 제품 요구사항 문서
    └── development-plan.md   # 본 문서
```

---

## 3. 개발 단계 (Phase by Phase)

### Phase 1: 프로젝트 셋업 및 환경 구성

**목표**: Rust + WASM 개발 환경 완성

**작업 항목**:
1. `Cargo.toml` 설정
   ```toml
   [package]
   name = "algo-rewind"
   version = "0.1.0"
   edition = "2021"

   [lib]
   crate-type = ["cdylib", "rlib"]

   [dependencies]
   wasm-bindgen = "0.2"
   serde = { version = "1.0", features = ["derive"] }
   serde_json = "1.0"
   chrono = { version = "0.4", features = ["wasmbind"] }
   ```

2. `wasm-pack` 설치 및 테스트 빌드
   ```bash
   cargo install wasm-pack
   wasm-pack build --target web
   ```

3. 기본 HTML 파일 생성 (`www/index.html`)
   - WASM 모듈 로드 스크립트 포함

4. `.gitignore` 설정
   ```
   /target
   /pkg
   /www/wasm
   Cargo.lock
   ```

**완료 기준**: `wasm-pack build` 성공, 브라우저에서 HTML 로드 확인

---

### Phase 2: Rust 핵심 로직 구현

**목표**: WASM으로 컴파일될 비즈니스 로직 완성

**2.1 데이터 모델 (`src/models/problem.rs`)**
```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum Level {
    AGAIN,
    HARD,
    GOOD,
    EASY,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Problem {
    pub id: i64,              // timestamp
    pub name: String,
    pub url: Option<String>,
    pub tags: Vec<String>,
    pub memo: String,
    pub level: Level,
    pub created_at: String,   // ISO 8601 format
    pub next_review_at: String,
}
```

**2.2 SRS 스케줄러 (`src/srs/scheduler.rs`)**
```rust
use chrono::{NaiveDate, Duration};
use crate::models::problem::Level;

pub fn calculate_next_review(
    current_date: &str,
    level: &Level
) -> String {
    let date = NaiveDate::parse_from_str(current_date, "%Y-%m-%d").unwrap();
    let days = match level {
        Level::AGAIN => 1,
        Level::HARD => 3,
        Level::GOOD => 7,
        Level::EASY => 30,
    };
    (date + Duration::days(days)).format("%Y-%m-%d").to_string()
}
```

**2.3 WASM 바인딩 함수 (`src/lib.rs`)**
```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add_problem(
    name: String,
    url: Option<String>,
    tags: Vec<String>,
    memo: String,
    level: String,
) -> JsValue {
    // Problem 생성 로직
    // JSON으로 직렬화하여 반환
}

#[wasm_bindgen]
pub fn get_today_reviews(problems_json: String, today: String) -> JsValue {
    // 오늘 복습할 문제 필터링
}

#[wasm_bindgen]
pub fn update_review(problem_json: String, new_level: String) -> JsValue {
    // 복습 완료 처리 및 다음 복습일 갱신
}
```

**완료 기준**:
- 모든 Rust 코드 컴파일 성공
- `wasm-pack build` 시 오류 없음
---

### Phase 3: JavaScript ↔ WASM 통합

**목표**: 브라우저에서 WASM 함수 호출 가능하게 만들기

**작업 항목**:
1. WASM 모듈 로딩 (`www/app.js`)
   ```javascript
   import init, {
     add_problem,
     get_today_reviews,
     update_review
   } from './wasm/algo_rewind.js';

   let wasm;
   async function initWasm() {
     wasm = await init();
     console.log('WASM loaded successfully');
   }
   ```

2. 데이터 변환 헬퍼 함수
   ```javascript
   function parseProblems(wasmResult) {
     return JSON.parse(wasmResult);
   }

   function stringifyProblems(problems) {
     return JSON.stringify(problems);
   }
   ```

3. 통합 테스트
   - 브라우저 콘솔에서 WASM 함수 직접 호출 테스트

**완료 기준**: 콘솔에서 모든 WASM 함수 정상 동작 확인

---

### Phase 4: 프론트엔드 UI 구현

**목표**: PRD의 모든 핵심 기능을 UI로 구현

**4.1 데이터 관리 기능**
- **불러오기 (Import)**
  ```javascript
  function handleImport(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      renderProblems(data);
    };
    reader.readAsText(file);
  }
  ```

- **저장하기 (Export)**
  ```javascript
  function handleExport() {
    const blob = new Blob(
      [JSON.stringify(currentProblems, null, 2)],
      { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'algo-rewind.json';
    a.click();
  }
  ```

**4.2 문제 등록 폼**
- HTML 폼 구성 (name, url, tags, memo, level)
- Submit 시 WASM `add_problem` 호출
- 목록에 즉시 추가

**4.3 복습 대시보드**
- **오늘 복습할 문제 섹션**
  ```javascript
  function renderTodayReviews() {
    const today = new Date().toISOString().split('T')[0];
    const todayProblems = get_today_reviews(
      stringifyProblems(currentProblems),
      today
    );
    // DOM에 렌더링
  }
  ```

- **복습 완료 모달**
  - 이해도 재선택 UI
  - WASM `update_review` 호출
  - 목록에서 제거

- **전체 문제 목록**
  - 검색/필터 기능 (이름, 태그)
  - 정렬 기능 (다음 복습일, 최신 등록)

**4.4 핵심 메모 토글**
- 기본: 숨김 상태
- 클릭 시 표시/숨김 토글

**완료 기준**:
- PRD의 모든 Feature 동작
- 데이터 Import → 작업 → Export 전체 플로우 검증

---

### Phase 5: 스타일링 및 UX 개선

**목표**: 사용자 경험 향상

**작업 항목**:
1. **CSS 스타일링** (`www/style.css`)
   - 반응형 레이아웃 (Mobile-first)
   - 버튼 호버/포커스 상태
   - 폼 입력 검증 스타일
   - 문제 카드 디자인

2. **UX 개선**
   - 로딩 인디케이터 (WASM 초기화 시)
   - 데이터 저장 성공 알림 (Toast)
   - 빈 상태 메시지 (문제가 없을 때)
   - 키보드 단축키 (Enter로 폼 제출 등)

3. **접근성 (A11y)**
   - ARIA 레이블
   - 키보드 네비게이션
   - 스크린 리더 지원

4. **성능 최적화**
   - WASM 파일 사이즈 최소화 (`wasm-opt`)
   - 불필요한 리렌더링 방지

**완료 기준**:
- 모든 브라우저(Chrome, Firefox, Safari)에서 정상 동작
- Mobile 환경에서 테스트 통과

---

## 5. 빌드 및 배포

### 5.1 개발 빌드
```bash
# WASM 빌드
wasm-pack build --target web --dev

# 개발 서버 실행 (Python 간단 서버)
cd www
python3 -m http.server 8080
```

### 5.2 프로덕션 빌드
```bash
# 최적화된 WASM 빌드
wasm-pack build --target web --release

# wasm-opt로 추가 최적화 (선택사항)
wasm-opt -Oz -o pkg/algo_rewind_bg_opt.wasm pkg/algo_rewind_bg.wasm
```

### 5.3 배포
- **방법 1**: GitHub Pages
  - `www/` 폴더를 `gh-pages` 브랜치에 배포

- **방법 2**: 단일 HTML 파일로 패키징
  - WASM을 Base64로 인라인화
  - CSS/JS도 `<style>`, `<script>` 태그 내부에 포함

---

## 6. 향후 확장 가능성

### MVP 이후 추가 가능한 기능
1. **통계 대시보드**
   - 복습 완료율
   - 이해도별 문제 분포 차트

2. **태그 자동 추천**
   - 기존 태그 목록 표시

3. **문제 수정/삭제**
   - 현재 MVP에서는 제외되었으나 추가 가능

4. **백업 자동화**
   - Git Repository 연동 (libgit2-wasm)

5. **PWA 변환**
   - Service Worker 추가
   - 오프라인 지원

---

## 7. 주요 의사결정 기록

### 7.1 왜 WASM을 사용하는가?
- **성능**: 대량의 문제 데이터 처리 시 JavaScript보다 빠름
- **타입 안정성**: Rust의 강력한 타입 시스템으로 버그 최소화
- **학습 목적**: Rust + WASM 기술 스택 경험

### 7.2 왜 로컬 파일 기반인가?
- **데이터 주권**: 사용자가 완전히 제어
- **단순성**: 백엔드 서버 불필요
- **이식성**: JSON 파일은 어디든 백업 가능

### 7.3 왜 프레임워크를 사용하지 않는가?
- **가볍움**: 단일 HTML 파일로 배포 가능
- **의존성 최소화**: 외부 라이브러리 없음
- **학습 곡선**: 프레임워크 없이도 충분히 구현 가능

---

## 8. 타임라인 추정

| Phase | 작업 내용 | 예상 시간 |
|-------|----------|----------|
| Phase 1 | 프로젝트 셋업 | 2시간 |
| Phase 2 | Rust 로직 구현 | 4시간 |
| Phase 3 | WASM 통합 | 2시간 |
| Phase 4 | 프론트엔드 UI | 6시간 |
| Phase 5 | 스타일링 | 3시간 |
| **총합** | | **17시간** |

*실제 개발 시간은 경험에 따라 달라질 수 있음*

---

## 9. 참고 자료

- [wasm-pack 공식 문서](https://rustwasm.github.io/wasm-pack/)
- [wasm-bindgen 가이드](https://rustwasm.github.io/wasm-bindgen/)
- [File API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [Spaced Repetition 알고리즘 설명](https://en.wikipedia.org/wiki/Spaced_repetition)

---

**작성일**: 2025-11-02
**문서 버전**: 1.0
**작성자**: Development Team
