# Algo-Rewind 배포 가이드

## GitHub Pages 자동 배포

### 전제 조건
- GitHub 계정
- Git 설치

---

## 단계별 배포 가이드

### 1. GitHub 저장소 생성

1. GitHub에 로그인
2. 우측 상단 `+` → `New repository` 클릭
3. 저장소 정보 입력:
   - **Repository name**: `algo-rewind`
   - **Description**: "알고리즘 복습 관리 웹 앱 (Rust + WASM)"
   - **Public** 선택 (GitHub Pages는 Public 저장소에서 무료)
4. **Create repository** 클릭

---

### 2. 로컬 프로젝트 연결 및 Push

```bash
# 현재 프로젝트 디렉토리에서

# Git 초기화 (아직 안했다면)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Algo-Rewind MVP with GitHub Pages deployment"

# 기본 브랜치를 master로 설정
git branch -M master

# GitHub 원격 저장소 연결 (username을 본인 것으로 변경)
git remote add origin https://github.com/[your-username]/algo-rewind.git

# Push
git push -u origin master
```

---

### 3. GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 선택
4. **Source** 섹션에서:
   - **Source**: `GitHub Actions` 선택
5. 저장 (자동 저장됨)

---

### 4. 자동 배포 확인

1. 저장소의 **Actions** 탭으로 이동
2. "Deploy to GitHub Pages" 워크플로우 실행 확인
3. 첫 배포는 약 3-5분 소요
4. 배포 완료 후 다음 URL에서 접속:
   ```
   https://[your-username].github.io/algo-rewind/
   ```

---

## 캐싱 최적화 상세

### 워크플로우에 포함된 캐싱

#### 1. Rust 의존성 캐싱
```yaml
- name: Cache Rust dependencies
  uses: Swatinem/rust-cache@v2
  with:
    cache-on-failure: true
    key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
```
- **효과**: Cargo 의존성 다운로드 및 컴파일 스킵
- **절약 시간**: 약 2-3분

#### 2. wasm-pack 바이너리 캐싱
```yaml
- name: Cache wasm-pack
  uses: actions/cache@v4
  with:
    path: ~/.cargo/bin/wasm-pack
    key: ${{ runner.os }}-wasm-pack-...
```
- **효과**: wasm-pack 재설치 스킵
- **절약 시간**: 약 30초-1분

#### 3. WASM 빌드 결과 캐싱
```yaml
- name: Cache WASM build
  uses: actions/cache@v4
  with:
    path: |
      pkg/
      www/wasm/
    key: ${{ runner.os }}-wasm-${{ hashFiles('src/**', 'Cargo.toml') }}
```
- **효과**: Rust 소스 변경 없으면 빌드 스킵
- **절약 시간**: 약 1-2분

---

## 빌드 시간 비교

| 시나리오 | 빌드 시간 | 설명 |
|---------|----------|------|
| **첫 빌드** | 3-5분 | 모든 의존성 다운로드 및 컴파일 |
| **캐시 히트** | 30초-1분 | 변경 없음, 모든 캐시 활용 |
| **Rust 소스 변경** | 1-2분 | WASM만 재빌드, 의존성은 캐시 |
| **의존성 변경** | 2-3분 | 의존성 재컴파일, WASM 재빌드 |

---

## 배포 트리거

### 자동 배포되는 경우
1. `master` 브랜치에 push할 때
2. GitHub 웹에서 "Run workflow" 수동 실행

### 배포 과정
```
Push → GitHub Actions 트리거
     → Rust 환경 설정
     → 캐시 복원
     → WASM 빌드 (필요 시)
     → www/ 디렉토리 배포
     → GitHub Pages 업데이트
```

---

## 문제 해결

### 배포 실패 시

#### 1. Actions 로그 확인
- GitHub 저장소 → Actions 탭
- 실패한 워크플로우 클릭
- 각 단계의 로그 확인

#### 2. 일반적인 문제

**문제**: "Process completed with exit code 101"
- **원인**: Rust 컴파일 에러
- **해결**: 로컬에서 `cargo test` 실행하여 에러 수정

**문제**: "Page build failed"
- **원인**: GitHub Pages 설정 문제
- **해결**: Settings → Pages에서 Source가 "GitHub Actions"인지 확인

**문제**: 캐시 관련 오류
- **원인**: 캐시 손상
- **해결**: Actions → Caches에서 캐시 삭제 후 재배포

---

## 커스텀 도메인 설정 (선택)

### 1. 도메인 구입 (예: Namecheap, GoDaddy)

### 2. DNS 설정
도메인 제공업체에서 다음 레코드 추가:
```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   [your-username].github.io
```

### 3. GitHub 설정
1. Settings → Pages
2. **Custom domain**에 도메인 입력 (예: algo-rewind.com)
3. **Enforce HTTPS** 체크

### 4. CNAME 파일 추가
```bash
# www/CNAME 파일 생성
echo "algo-rewind.com" > www/CNAME
git add www/CNAME
git commit -m "Add custom domain"
git push
```

---

## 배포 최적화 팁

### 1. 브랜치 전략
```bash
# 개발용 브랜치
git checkout -b dev

# 작업 후
git add .
git commit -m "Feature: ..."
git push origin dev

# Pull Request 생성 → master 병합 → 자동 배포
```

### 2. 로컬 테스트
배포 전 로컬에서 테스트:
```bash
wasm-pack build --target web --release
rm -rf www/wasm && mkdir -p www/wasm && cp pkg/* www/wasm/
cd www && python3 -m http.server 8080
```

### 3. 캐시 무효화
캐시 문제 시:
- GitHub → Actions → Caches
- 해당 캐시 삭제
- 재배포

---

## 모니터링

### 배포 상태 확인
```bash
# GitHub CLI 사용 (선택)
gh workflow view "Deploy to GitHub Pages"
gh run list --workflow="Deploy to GitHub Pages"
```

### 배포 URL
배포 완료 후 Actions 로그에서 확인:
```
🚀 Deployment successful!
📍 URL: https://[username].github.io/algo-rewind/
```

---

## 추가 리소스

- [GitHub Pages 공식 문서](https://docs.github.com/en/pages)
- [GitHub Actions 캐싱](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [wasm-pack 문서](https://rustwasm.github.io/wasm-pack/)

---

**배포 완료!** 🎉

이제 전 세계 어디서나 `https://[username].github.io/algo-rewind/`로 접속할 수 있습니다!
