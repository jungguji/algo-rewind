# 재사용 가능한 자산 목록

## 개요

현재 Rust/WASM 프로젝트에서 TypeScript + Svelte 5 마이그레이션 시 재사용 가능한 자산들의 상세 목록입니다.

---

## 1. CSS 스타일 (100% 재사용 가능)

### 📁 `www/style.css` (448줄)

#### 재사용률: **~95%**

현재 CSS는 잘 구조화되어 있어 대부분 그대로 재사용 가능합니다.

#### 재사용 방법

**옵션 1: 글로벌 스타일로 이동**
```
src/app.css
```
- Reset 스타일
- 글로벌 변수
- 유틸리티 클래스

**옵션 2: 컴포넌트별 분리**
```
src/lib/components/
├── layout/
│   └── Header.svelte  (header 스타일 포함)
├── problem/
│   └── ProblemCard.svelte  (.problem-card 스타일 포함)
└── ui/
    ├── Button.svelte  (.btn 스타일 포함)
    └── Modal.svelte  (.modal 스타일 포함)
```

#### 스타일 섹션별 분류

##### 1. 글로벌 스타일 (app.css)
```css
/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
    padding: 20px;
}

#app {
    max-width: 1200px;
    margin: 0 auto;
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
```

##### 2. Header 스타일 (Header.svelte)
```css
header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
}

header h1 {
    font-size: 2.5em;
    color: #2c3e50;
    margin-bottom: 10px;
}

.subtitle {
    color: #7f8c8d;
    font-size: 1.1em;
}
```

##### 3. Button 스타일 (Button.svelte)
```css
.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary {
    background-color: #3498db;
    color: white;
}

.btn-success {
    background-color: #2ecc71;
    color: white;
}

.btn-danger {
    background-color: #e74c3c;
    color: white;
}

.btn-warning {
    background-color: #f39c12;
    color: white;
}

.btn-info {
    background-color: #3498db;
    color: white;
}

.btn-secondary {
    background-color: #95a5a6;
    color: white;
}
```

##### 4. Form 스타일 (ProblemForm.svelte)
```css
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #2c3e50;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1em;
    font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}
```

##### 5. Problem Card 스타일 (ProblemCard.svelte)
```css
.problem-card {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #3498db;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.problem-card:hover {
    transform: translateX(5px);
}

.problem-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.problem-name {
    font-size: 1.2em;
    font-weight: 600;
    color: #2c3e50;
}

.problem-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 10px 0;
}

.tag {
    background-color: #ecf0f1;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9em;
    color: #7f8c8d;
}
```

##### 6. Markdown 메모 스타일 (ProblemCard.svelte)
```css
.problem-memo {
    margin: 15px 0;
    padding: 15px;
    background-color: #fff9e6;
    border-left: 3px solid #f39c12;
    border-radius: 4px;
    display: none;
    word-wrap: break-word;
    line-height: 1.6;
}

.problem-memo.show {
    display: block;
}

/* Markdown styles */
.problem-memo h1,
.problem-memo h2,
.problem-memo h3 {
    color: #2c3e50;
    margin: 0.5em 0;
}

.problem-memo code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
    color: #e74c3c;
}

.problem-memo pre {
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
    margin: 0.5em 0;
}

.problem-memo blockquote {
    border-left: 3px solid #bdc3c7;
    margin: 0.5em 0;
    padding-left: 1em;
    color: #7f8c8d;
    font-style: italic;
}
```

##### 7. Modal 스타일 (Modal.svelte)
```css
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.modal.show {
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
```

##### 8. Toast 스타일 (Toast.svelte)
```css
.toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: #2ecc71;
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2000;
}

.toast.show {
    opacity: 1;
}
```

##### 9. 반응형 스타일 (app.css)
```css
@media (max-width: 768px) {
    body {
        padding: 10px;
    }

    #app {
        padding: 20px;
    }

    header h1 {
        font-size: 2em;
    }

    .data-controls {
        flex-direction: column;
    }

    .list-controls {
        flex-direction: column;
    }
}
```

---

## 2. HTML 구조 (80% 재사용)

### 📁 `www/index.html` (112줄)

#### Svelte 컴포넌트로 변환

**현재 HTML** → **Svelte 컴포넌트**

##### 1. Header
```html
<!-- 현재 -->
<header>
    <h1>📚 Algo-Rewind</h1>
    <p class="subtitle">알고리즘 문제 복습 관리</p>
</header>
```

```svelte
<!-- src/lib/components/layout/Header.svelte -->
<header>
    <h1>📚 Algo-Rewind</h1>
    <p class="subtitle">알고리즘 문제 복습 관리</p>
</header>

<style>
    /* header 스타일 */
</style>
```

##### 2. DataControls
```html
<!-- 현재 -->
<section class="data-controls">
    <button id="import-btn" class="btn btn-primary">📂 데이터 불러오기</button>
    <button id="export-btn" class="btn btn-success">💾 백업 파일로 내보내기</button>
    <button id="clear-btn" class="btn btn-danger">🗑️ 데이터 초기화</button>
</section>
```

```svelte
<!-- src/lib/components/layout/DataControls.svelte -->
<script lang="ts">
  import { problems } from '$lib/stores/problems';

  function handleImport() { /* ... */ }
  function handleExport() { /* ... */ }
  function handleClear() { /* ... */ }
</script>

<section class="data-controls">
    <button on:click={handleImport} class="btn btn-primary">
        📂 데이터 불러오기
    </button>
    <button on:click={handleExport} class="btn btn-success">
        💾 백업 파일로 내보내기
    </button>
    <button on:click={handleClear} class="btn btn-danger">
        🗑️ 데이터 초기화
    </button>
</section>
```

##### 3. Problem Form
```html
<!-- 현재 -->
<section class="add-problem-section">
    <h2>➕ 새 문제 등록</h2>
    <form id="add-problem-form">
        <div class="form-group">
            <label for="problem-name">문제 이름/번호 *</label>
            <input type="text" id="problem-name" required>
        </div>
        <!-- 더 많은 필드들... -->
        <button type="submit" class="btn btn-primary">등록하기</button>
    </form>
</section>
```

```svelte
<!-- src/lib/components/problem/ProblemForm.svelte -->
<script lang="ts">
  import { problems } from '$lib/stores/problems';
  import { Level, type Problem } from '$lib/types/problem';

  let name = '';
  let url = '';
  let tags = '';
  let memo = '';
  let level = Level.GOOD;

  function handleSubmit() {
    const problem: Problem = {
      id: Date.now(),
      name,
      url: url || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      memo,
      level,
      created_at: new Date().toISOString().split('T')[0],
      next_review_at: calculateNextReview(new Date(), level),
    };

    problems.add(problem);

    // Reset
    name = '';
    url = '';
    tags = '';
    memo = '';
    level = Level.GOOD;
  }
</script>

<section class="add-problem-section">
    <h2>➕ 새 문제 등록</h2>
    <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
            <label for="problem-name">문제 이름/번호 *</label>
            <input type="text" id="problem-name" bind:value={name} required>
        </div>

        <div class="form-group">
            <label for="problem-url">문제 링크</label>
            <input type="url" id="problem-url" bind:value={url}>
        </div>

        <div class="form-group">
            <label for="problem-tags">태그 (쉼표로 구분)</label>
            <input type="text" id="problem-tags" bind:value={tags}>
        </div>

        <div class="form-group">
            <label for="problem-memo">핵심 메모</label>
            <textarea id="problem-memo" bind:value={memo} rows="3"></textarea>
        </div>

        <div class="form-group">
            <label for="problem-level">나의 이해도 *</label>
            <select id="problem-level" bind:value={level} required>
                <option value={Level.AGAIN}>AGAIN (1일 후)</option>
                <option value={Level.HARD}>HARD (3일 후)</option>
                <option value={Level.GOOD}>GOOD (7일 후)</option>
                <option value={Level.EASY}>EASY (30일 후)</option>
            </select>
        </div>

        <button type="submit" class="btn btn-primary">등록하기</button>
    </form>
</section>
```

##### 4. Problem Card (가장 중요!)
```svelte
<!-- src/lib/components/problem/ProblemCard.svelte -->
<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import type { Problem } from '$lib/types/problem';

  export let problem: Problem;
  export let isReview = false;
  export let onReview: ((problem: Problem) => void) | undefined = undefined;

  let showMemo = false;

  function toggleMemo() {
    showMemo = !showMemo;
  }

  function renderMemo(memo: string): string {
    const html = marked.parse(memo);
    return DOMPurify.sanitize(html);
  }
</script>

<div class="problem-card">
    <div class="problem-header">
        <div class="problem-name">{problem.name}</div>
        {#if problem.url}
            <a href={problem.url} target="_blank" class="btn btn-info">문제 보기</a>
        {/if}
    </div>

    {#if problem.tags.length > 0}
        <div class="problem-tags">
            {#each problem.tags as tag}
                <span class="tag">{tag}</span>
            {/each}
        </div>
    {/if}

    {#if showMemo}
        <div class="problem-memo">
            {@html renderMemo(problem.memo)}
        </div>
    {/if}

    <div class="problem-info">
        등록일: {problem.created_at} | 다음 복습: {problem.next_review_at} | 이해도: {problem.level}
    </div>

    <div class="problem-actions">
        <button on:click={toggleMemo} class="btn btn-secondary">
            {showMemo ? '메모 숨기기' : '메모 보기'}
        </button>
        {#if isReview && onReview}
            <button on:click={() => onReview?.(problem)} class="btn btn-success">
                복습 완료
            </button>
        {/if}
    </div>
</div>

<style>
    /* problem-card 스타일 */
</style>
```

---

## 3. 비즈니스 로직 (100% 재사용)

### 📁 `src/srs/scheduler.rs` → `src/lib/utils/srs.ts`

#### SRS 알고리즘 (간격 반복 학습)

**Rust 코드**:
```rust
pub fn calculate_next_review(current_date: &str, level: &Level) -> String {
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

**TypeScript 코드** (똑같은 로직):
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

**테스트 케이스** (Rust 테스트 참고):
```typescript
import { describe, it, expect } from 'vitest';
import { calculateNextReview } from './srs';
import { Level } from '../types/problem';

describe('SRS Scheduler', () => {
  it('AGAIN: 1일 후', () => {
    expect(calculateNextReview('2025-11-02', Level.AGAIN))
      .toBe('2025-11-03');
  });

  it('HARD: 3일 후', () => {
    expect(calculateNextReview('2025-11-02', Level.HARD))
      .toBe('2025-11-05');
  });

  it('GOOD: 7일 후', () => {
    expect(calculateNextReview('2025-11-02', Level.GOOD))
      .toBe('2025-11-09');
  });

  it('EASY: 30일 후', () => {
    expect(calculateNextReview('2025-11-02', Level.EASY))
      .toBe('2025-12-02');
  });
});
```

---

### 📁 `src/models/problem.rs` → `src/lib/types/problem.ts`

#### 데이터 모델

**Rust 코드**:
```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum Level {
    AGAIN,
    HARD,
    GOOD,
    EASY,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Problem {
    pub id: i64,
    pub name: String,
    pub url: Option<String>,
    pub tags: Vec<String>,
    pub memo: String,
    pub level: Level,
    pub created_at: String,
    pub next_review_at: String,
}
```

**TypeScript 코드** (동일한 구조):
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
  created_at: string;   // YYYY-MM-DD
  next_review_at: string;  // YYYY-MM-DD
}
```

**JSON 호환성**: 완벽히 동일! LocalStorage 데이터 그대로 사용 가능.

---

### 📁 `www/app.js` → Svelte Stores

#### LocalStorage 관리

**JavaScript 코드** (lines 8-41):
```javascript
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProblems));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function clearLocalStorage() {
    localStorage.removeItem(STORAGE_KEY);
}
```

**TypeScript 코드**:
```typescript
// src/lib/utils/storage.ts
import type { Problem } from '../types/problem';

const STORAGE_KEY = 'algo-rewind-problems';

export function saveProblems(problems: Problem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadProblems(): Problem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
}

export function clearProblems(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

---

#### 필터링 로직

**JavaScript 코드** (lines 409-449):
```javascript
async function handleSearch(event) {
    const searchTerm = event.target.value.trim();
    const searchLower = searchTerm.toLowerCase();

    const filtered = currentProblems.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );

    // Render filtered
}
```

**TypeScript 코드**:
```typescript
// src/lib/utils/filter.ts
import type { Problem } from '../types/problem';

export function filterProblems(problems: Problem[], query: string): Problem[] {
  if (!query.trim()) return problems;

  const lowerQuery = query.toLowerCase();

  return problems.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function sortProblems(
  problems: Problem[],
  criteria: 'next_review' | 'created_at' | 'name'
): Problem[] {
  const sorted = [...problems];

  switch (criteria) {
    case 'next_review':
      return sorted.sort((a, b) => a.next_review_at.localeCompare(b.next_review_at));
    case 'created_at':
      return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}
```

---

## 4. UI 패턴 (100% 재사용)

### Toast 알림
```typescript
// src/lib/stores/ui.ts
import { writable } from 'svelte/store';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

function createToastStore() {
  const { subscribe, set } = writable<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  return {
    subscribe,
    show: (message: string, type: ToastState['type'] = 'success') => {
      set({ show: true, message, type });
      setTimeout(() => {
        set({ show: false, message: '', type: 'success' });
      }, 3000);
    },
  };
}

export const toast = createToastStore();
```

```svelte
<!-- src/lib/components/ui/Toast.svelte -->
<script lang="ts">
  import { toast } from '$lib/stores/ui';
</script>

{#if $toast.show}
  <div class="toast {$toast.type}">
    {$toast.message}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    padding: 15px 25px;
    border-radius: 6px;
    color: white;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
  }

  .success { background-color: #2ecc71; }
  .error { background-color: #e74c3c; }
  .warning { background-color: #f39c12; }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
```

---

### Modal 패턴
```svelte
<!-- src/lib/components/ui/Modal.svelte -->
<script lang="ts">
  export let show = false;
  export let onClose: () => void;
</script>

{#if show}
  <div class="modal" on:click={onClose}>
    <div class="modal-content" on:click|stopPropagation>
      <slot />
      <button on:click={onClose} class="btn btn-secondary">닫기</button>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 500px;
    width: 90%;
  }
</style>
```

---

## 5. Import/Export 기능 (100% 재사용)

### JSON Import/Export

**JavaScript 코드** (lines 129-165):
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

function handleImport(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        currentProblems = data;
        saveToLocalStorage();
        renderProblems();
    };
    reader.readAsText(file);
}
```

**TypeScript/Svelte 코드**:
```typescript
// src/lib/utils/import-export.ts
import type { Problem } from '../types/problem';

export function exportToJSON(problems: Problem[]): void {
  const json = JSON.stringify(problems, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `algo-rewind-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<Problem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
```

**Svelte 컴포넌트에서 사용**:
```svelte
<script lang="ts">
  import { problems } from '$lib/stores/problems';
  import { exportToJSON, importFromJSON } from '$lib/utils/import-export';
  import { toast } from '$lib/stores/ui';

  let fileInput: HTMLInputElement;

  function handleExport() {
    exportToJSON($problems);
    toast.show('백업 파일로 내보냈습니다!');
  }

  async function handleImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    try {
      const data = await importFromJSON(file);
      problems.import(data);
      toast.show(`${data.length}개 문제를 불러왔습니다!`);
    } catch (error) {
      toast.show('파일 읽기 실패: ' + error.message, 'error');
    }
  }
</script>

<button on:click={() => fileInput.click()} class="btn btn-primary">
  📂 데이터 불러오기
</button>
<input
  bind:this={fileInput}
  type="file"
  accept=".json"
  on:change={handleImport}
  hidden
/>

<button on:click={handleExport} class="btn btn-success">
  💾 백업 파일로 내보내기
</button>
```

---

## 6. 재사용 불가능한 것들 (버림)

### ❌ Rust 코드
- `src/lib.rs` - WASM 바인딩 코드
- `Cargo.toml` - Rust 의존성
- `wasm-pack` 빌드 설정

**이유**: TypeScript로 대체, WASM 불필요

### ❌ WASM 로더 코드
```javascript
// www/app.js lines 44-79
async function init() {
    const wasmModule = await import('./wasm/algo_rewind.js');
    await wasmModule.default();
    wasm = wasmModule;
}
```

**대체**: Svelte stores와 TypeScript 함수로 직접 구현

---

## 7. 데이터 마이그레이션

### LocalStorage 키: 동일 유지

**키 이름**: `algo-rewind-problems`

**데이터 구조**: 변경 없음!

```json
[
  {
    "id": 1730980800000,
    "name": "BOJ 1000 A+B",
    "url": "https://www.acmicpc.net/problem/1000",
    "tags": ["기초", "수학"],
    "memo": "간단한 덧셈 문제",
    "level": "GOOD",
    "created_at": "2025-11-02",
    "next_review_at": "2025-11-09"
  }
]
```

**결론**: 사용자가 기존 데이터를 잃지 않음! 새 앱이 그대로 읽을 수 있음.

---

## 8. 샘플 데이터

현재 프로젝트에 있는 샘플 데이터 (있다면):

```json
[
  {
    "id": 1730544000000,
    "name": "BOJ 1000 A+B",
    "url": "https://www.acmicpc.net/problem/1000",
    "tags": ["기초", "수학"],
    "memo": "간단한 덧셈 문제",
    "level": "EASY",
    "created_at": "2025-11-02",
    "next_review_at": "2025-12-02"
  },
  {
    "id": 1730630400000,
    "name": "백준 1463 1로 만들기",
    "url": "https://www.acmicpc.net/problem/1463",
    "tags": ["DP", "그리디"],
    "memo": "DP 기초 문제. 3가지 연산 중 최소값 선택",
    "level": "GOOD",
    "created_at": "2025-11-03",
    "next_review_at": "2025-11-10"
  }
]
```

---

## 9. 재사용 체크리스트

### ✅ 100% 재사용 가능
- [ ] SRS 알고리즘 로직
- [ ] 데이터 모델 (Problem, Level)
- [ ] CSS 스타일 (~95%)
- [ ] LocalStorage 저장 로직
- [ ] 필터링/정렬 로직
- [ ] Import/Export 기능
- [ ] Toast 알림 패턴
- [ ] Modal 패턴
- [ ] 마크다운 렌더링 로직

### ⚠️ 변환 필요 (80% 재사용)
- [ ] HTML 구조 → Svelte 컴포넌트
- [ ] JavaScript 이벤트 핸들러 → Svelte 이벤트
- [ ] DOM 조작 → Svelte 반응형

### ❌ 재사용 불가
- [ ] Rust/WASM 코드
- [ ] wasm-pack 빌드
- [ ] Cargo 설정

---

## 10. 마이그레이션 우선순위

### Phase 1: 핵심 로직 (1-2일)
1. 타입 정의 (`problem.ts`)
2. SRS 로직 (`srs.ts`)
3. Storage 유틸 (`storage.ts`)
4. Stores (`problems.ts`, `ui.ts`)

### Phase 2: UI 컴포넌트 (2-3일)
1. Button, Input, Select (재사용 컴포넌트)
2. ProblemCard (가장 복잡)
3. ProblemForm
4. Modal, Toast

### Phase 3: 통합 (1일)
1. App.svelte에서 모든 컴포넌트 조립
2. CSS 적용
3. 테스트

---

**작성일**: 2025-11-23
**버전**: 1.0
**작성자**: Claude Code
