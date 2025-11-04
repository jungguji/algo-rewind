# Algo-Rewind

알고리즘 문제 복습 관리 웹 애플리케이션 (Rust + WebAssembly)

## 개요

Algo-Rewind는 알고리즘 문제 풀이 기록을 로컬 파일로 안전하게 저장하고, Spaced Repetition 원리에 기반한 체계적인 복습을 돕는 웹 애플리케이션입니다.

### 주요 특징

- 🦀 **Rust + WebAssembly**: 고성능 비즈니스 로직
- 💾 **자동 저장**: 문제 등록/복습 시 브라우저에 자동 저장
- 📂 **파일 백업**: JSON 파일로 데이터 백업 및 복원 지원
- 🔄 **Spaced Repetition**: 과학적 복습 주기 관리
- 📱 **반응형 디자인**: 모바일/데스크톱 모두 지원
- 🚀 **No Backend**: 서버 없이 브라우저만으로 실행

## 빠른 시작

### 온라인 데모 (권장)

GitHub Pages에서 바로 사용하실 수 있습니다:
```
https://[your-username].github.io/algo-rewind/
```

### 로컬 개발 환경

#### 1. 개발 환경 요구사항

- Rust (최신 stable 버전)
- wasm-pack (`cargo install wasm-pack`)
- Python 3 (로컬 서버용)

#### 2. 빌드 및 실행

```bash
# WASM 빌드
wasm-pack build --target web

# WASM 파일을 www 디렉토리로 복사
rm -rf www/wasm && mkdir -p www/wasm && cp pkg/* www/wasm/

# 로컬 서버 실행
cd www
python3 -m http.server 8080
```

#### 3. 브라우저에서 접속

```
http://localhost:8080
```

## 사용 방법

### 1. 샘플 데이터로 시작하기 (추천)
처음 사용하시는 분들을 위해 샘플 데이터를 제공합니다:
```bash
# 브라우저에서 http://localhost:8080 접속 후
# "📂 데이터 불러오기" 버튼 클릭
# www/sample-data.json 파일 선택
```

### 2. 새 문제 등록
- 문제 이름, URL, 태그, 핵심 메모를 입력
- 초기 이해도 선택 (AGAIN/HARD/GOOD/EASY)
- 등록 시 자동으로 다음 복습일이 계산됨

### 3. 복습 관리
- "오늘 복습할 문제" 섹션에서 자동으로 복습 대상 필터링
- 복습 완료 후 새로운 이해도 선택
- 다음 복습일이 자동으로 갱신됨

### 4. 데이터 관리
- **자동 저장**: 문제 등록/복습 시 브라우저 LocalStorage에 자동 저장됨
- **📂 데이터 불러오기**: JSON 백업 파일 로드 (자동 저장도 업데이트됨)
- **💾 백업 파일로 내보내기**: 현재 상태를 `algo-rewind.json` 파일로 백업
- **🗑️ 데이터 초기화**: 모든 저장된 데이터 삭제 (확인 필요)

### 5. 키보드 단축키
- **Esc**: 모달 닫기
- **Enter**: 폼 제출

## 복습 주기 알고리즘

| 이해도 | 다음 복습 |
|--------|-----------|
| AGAIN  | 1일 후    |
| HARD   | 3일 후    |
| GOOD   | 7일 후    |
| EASY   | 30일 후   |

## 데이터 저장 방식

### 자동 저장 (LocalStorage)
- **언제**: 문제 등록, 복습 완료, JSON 파일 불러오기 시 자동 저장
- **위치**: 브라우저 LocalStorage (`algo-rewind-problems` 키)
- **장점**: 페이지 새로고침/재방문 시 자동으로 데이터 복원
- **주의**: 브라우저별로 독립적, 브라우저 캐시 삭제 시 함께 삭제됨

### 파일 백업 (JSON)
- **추천**: 주기적으로 "백업 파일로 내보내기" 실행
- **용도**:
  - 다른 브라우저/기기에서 사용
  - 장기 보관 백업
  - 버전 관리 (Git 등)
- **파일명**: `algo-rewind.json` (Downloads 폴더에 저장)

## 프로젝트 구조

```
algo-rewind/
├── src/                    # Rust 소스코드
│   ├── lib.rs             # WASM 엔트리포인트
│   ├── models/            # 데이터 모델
│   │   └── problem.rs
│   ├── srs/               # SRS 로직
│   │   └── scheduler.rs
│   └── utils/
├── www/                   # 웹 프론트엔드
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── wasm/              # 빌드된 WASM (gitignore)
├── docs/                  # 문서
│   ├── PRD.md
│   └── development-plan.md
└── Cargo.toml
```

## 기술 스택

### Backend (WASM)
- **Rust**: 핵심 비즈니스 로직
- **wasm-bindgen**: Rust ↔ JavaScript 바인딩
- **serde**: JSON 직렬화/역직렬화
- **chrono**: 날짜 계산

### Frontend
- **Vanilla JavaScript**: 프레임워크 없는 경량 구현
- **HTML5/CSS3**: 시맨틱 마크업 및 반응형 디자인
- **ES6 Modules**: WASM 로딩
- **LocalStorage**: 브라우저 기반 자동 저장

## 개발 현황

### ✅ Phase 1: 프로젝트 셋업 (완료)
- Cargo.toml 설정
- 디렉토리 구조 생성
- 기본 WASM 빌드 테스트

### ✅ Phase 2: Rust 핵심 로직 구현 (완료)
- Problem 데이터 모델
- SRS 스케줄러
- WASM 바인딩 함수 5개 구현
  - `add_problem`
  - `get_today_reviews`
  - `update_review`
  - `filter_problems`
  - `sort_problems`
- JavaScript ↔ WASM 통합

### ✅ Phase 3-5: UI/UX 개선 및 마무리 (완료)
- 키보드 단축키 (Esc로 모달 닫기)
- 모달 외부 클릭으로 닫기
- ARIA 속성 추가 (접근성 개선)
- 빌드 경고 제거 (클린 빌드)
- 샘플 데이터 제공 (8개 예제 문제)

### ✅ Phase 6: 자동 저장 기능 (완료)
- LocalStorage 기반 자동 저장 구현
- 문제 등록/복습 시 자동 저장
- 페이지 로드 시 자동 불러오기
- 데이터 초기화 기능 추가
- 백업 파일 내보내기로 수동 저장 유지

### 🎉 MVP+ 완성!
모든 핵심 기능과 편의 기능이 구현되어 실제 사용 가능합니다.

## GitHub Pages 배포

### 자동 배포 설정 (권장)

이 프로젝트는 GitHub Actions를 통한 자동 배포가 설정되어 있습니다.

#### 1. GitHub 저장소 생성
```bash
# GitHub에서 새 저장소 생성 후
git init
git add .
git commit -m "Initial commit: Algo-Rewind MVP"
git branch -M master
git remote add origin https://github.com/[username]/algo-rewind.git
git push -u origin master
```

#### 2. GitHub Pages 활성화
1. GitHub 저장소 → Settings → Pages
2. **Source**: GitHub Actions 선택
3. 첫 push 시 자동으로 배포됩니다!

#### 3. 캐싱 최적화
워크플로우에 포함된 캐싱 전략:
- ✅ **Rust 의존성 캐싱**: 빌드 시간 5분 → 1분
- ✅ **wasm-pack 바이너리 캐싱**: 설치 스킵
- ✅ **WASM 빌드 결과 캐싱**: 소스 변경 없으면 재사용
- ✅ **조건부 빌드**: Rust 소스 변경 시에만 재빌드

**예상 빌드 시간**:
- 첫 빌드: ~3-5분
- 캐시 히트: ~30초-1분 (10배 빠름!)
- 소스 변경 시: ~1-2분

### 수동 배포

```bash
# 1. WASM 빌드
wasm-pack build --target web --release

# 2. 파일 복사
rm -rf www/wasm && mkdir -p www/wasm && cp pkg/* www/wasm/

# 3. www 디렉토리를 gh-pages 브랜치에 배포
# (또는 GitHub Pages 설정에서 master 브랜치의 www 폴더 선택)
```

## 테스트

```bash
# Rust 단위 테스트
cargo test

# WASM 빌드 테스트
wasm-pack build --target web
```

## 라이선스

MIT License

## 기여

이슈 및 PR은 언제나 환영합니다!

## 문서

- [PRD (제품 요구사항 문서)](docs/PRD.md)
- [개발 계획서](docs/development-plan.md)
