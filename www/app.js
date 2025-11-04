// Main application state
let currentProblems = [];
let wasm = null;

// LocalStorage key
const STORAGE_KEY = 'algo-rewind-problems';

// LocalStorage utility functions
function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProblems));
        console.log('Data auto-saved to localStorage');
    } catch (error) {
        console.error('LocalStorage save error:', error);
        showToast('자동 저장 실패: ' + error.message, 'error');
    }
}

function loadFromLocalStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('LocalStorage load error:', error);
        showToast('저장된 데이터 불러오기 실패: ' + error.message, 'error');
        return [];
    }
}

function clearLocalStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('LocalStorage cleared');
    } catch (error) {
        console.error('LocalStorage clear error:', error);
        showToast('데이터 초기화 실패: ' + error.message, 'error');
    }
}

// Initialize WASM and application
async function init() {
    try {
        console.log('Initializing Algo-Rewind...');

        // Load WASM module
        const wasmModule = await import('./wasm/algo_rewind.js');
        await wasmModule.default();
        wasm = wasmModule;

        console.log('WASM loaded successfully!');
        console.log('Testing WASM:', wasm.greet('User'));

        // Hide loading, show main content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        showToast('WASM 로드 완료! 애플리케이션이 준비되었습니다.');

        // Setup event listeners
        setupEventListeners();

        // Auto-load data from localStorage
        const savedData = loadFromLocalStorage();
        if (savedData.length > 0) {
            currentProblems = savedData;
            renderProblems();
            showToast(`저장된 데이터를 자동으로 불러왔습니다. (문제 ${savedData.length}개)`);
        }

    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('loading').innerHTML =
            '<p style="color: red;">❌ 초기화 실패: ' + error.message + '</p>' +
            '<p>로컬 서버를 통해 접속하셨나요? file:// 프로토콜에서는 WASM이 로드되지 않을 수 있습니다.</p>';
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Import/Export/Clear buttons
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', handleImport);
    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('clear-btn').addEventListener('click', handleClearData);

    // Add problem form
    document.getElementById('add-problem-form').addEventListener('submit', handleAddProblem);

    // Search and sort
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('sort-select').addEventListener('change', handleSort);

    // Modal
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.querySelectorAll('.modal-buttons button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const level = e.target.getAttribute('data-level');
            if (level) {
                handleReviewComplete(level);
            }
        });
    });

    // Modal outside click to close
    document.getElementById('review-modal').addEventListener('click', (e) => {
        if (e.target.id === 'review-modal') {
            closeModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Esc to close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('review-modal');
            if (modal.classList.contains('show')) {
                closeModal();
            }
        }
    });
}

// Handle file import
function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            currentProblems = data;
            saveToLocalStorage(); // Auto-save imported data
            renderProblems();
            showToast('데이터를 성공적으로 불러왔습니다!');
        } catch (error) {
            showToast('파일 읽기 실패: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// Handle file export
function handleExport() {
    if (currentProblems.length === 0) {
        showToast('저장할 데이터가 없습니다.', 'warning');
        return;
    }

    const blob = new Blob(
        [JSON.stringify(currentProblems, null, 2)],
        { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'algo-rewind.json';
    a.click();
    showToast('백업 파일로 내보냈습니다!');
}

// Handle data clear
function handleClearData() {
    if (currentProblems.length === 0) {
        showToast('삭제할 데이터가 없습니다.', 'warning');
        return;
    }

    const confirmed = confirm(
        `정말로 모든 데이터를 삭제하시겠습니까?\n\n` +
        `현재 ${currentProblems.length}개의 문제가 저장되어 있습니다.\n` +
        `이 작업은 되돌릴 수 없습니다.`
    );

    if (confirmed) {
        currentProblems = [];
        clearLocalStorage();
        renderProblems();
        showToast('모든 데이터가 삭제되었습니다.', 'warning');
    }
}

// Handle adding new problem
async function handleAddProblem(event) {
    event.preventDefault();

    if (!wasm) {
        showToast('WASM 모듈이 로드되지 않았습니다.', 'error');
        return;
    }

    const name = document.getElementById('problem-name').value.trim();
    const url = document.getElementById('problem-url').value.trim() || null;
    const tagsInput = document.getElementById('problem-tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    const memo = document.getElementById('problem-memo').value.trim();
    const level = document.getElementById('problem-level').value;

    try {
        // Call WASM function to create problem
        const problemJson = wasm.add_problem(name, url, tags, memo, level);
        const problem = JSON.parse(problemJson);

        currentProblems.push(problem);
        saveToLocalStorage(); // Auto-save
        renderProblems();

        // Reset form
        event.target.reset();

        showToast('문제를 등록했습니다!');
    } catch (error) {
        console.error('Add problem error:', error);
        showToast('문제 등록 실패: ' + error, 'error');
    }
}

// Render all problems
function renderProblems() {
    renderTodayReviews();
    renderAllProblems();
}

// Render today's reviews
async function renderTodayReviews() {
    const today = new Date().toISOString().split('T')[0];
    let todayProblems = [];

    if (wasm && currentProblems.length > 0) {
        try {
            // Use WASM to filter today's reviews
            const todayJson = wasm.get_today_reviews(JSON.stringify(currentProblems), today);
            todayProblems = JSON.parse(todayJson);
        } catch (error) {
            console.error('WASM filter error:', error);
            // Fallback to JS filtering
            todayProblems = currentProblems.filter(p => p.next_review_at <= today);
        }
    } else {
        // Fallback to JS filtering
        todayProblems = currentProblems.filter(p => p.next_review_at <= today);
    }

    const container = document.getElementById('today-reviews');

    if (todayProblems.length === 0) {
        container.innerHTML = '<p class="empty-message">복습할 문제가 없습니다!</p>';
        return;
    }

    container.innerHTML = todayProblems.map(problem => createProblemCard(problem, true)).join('');

    // Add event listeners for review buttons
    todayProblems.forEach(problem => {
        const reviewBtn = document.querySelector(`[data-review-id="${problem.id}"]`);
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => openReviewModal(problem));
        }

        const toggleBtn = document.querySelector(`[data-toggle-id="${problem.id}"]`);
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => toggleMemo(problem.id));
        }
    });
}

// Render all problems
function renderAllProblems() {
    const container = document.getElementById('all-problems');

    if (currentProblems.length === 0) {
        container.innerHTML = '<p class="empty-message">등록된 문제가 없습니다. 위에서 새 문제를 등록해보세요!</p>';
        return;
    }

    container.innerHTML = currentProblems.map(problem => createProblemCard(problem, false)).join('');

    // Add event listeners for toggle buttons
    currentProblems.forEach(problem => {
        const toggleBtn = document.querySelector(`[data-toggle-all-id="${problem.id}"]`);
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => toggleMemo(problem.id, true));
        }
    });
}

// Render markdown memo
function renderMarkdownMemo(memo) {
    if (!memo) return '메모가 없습니다.';

    // Use marked.js if available, otherwise fallback to plain text
    if (typeof marked !== 'undefined') {
        try {
            return marked.parse(memo);
        } catch (error) {
            console.error('Markdown parsing error:', error);
            return escapeHtml(memo);
        }
    }
    return escapeHtml(memo);
}

// Create problem card HTML
function createProblemCard(problem, isReview) {
    const toggleId = isReview ? `data-toggle-id="${problem.id}"` : `data-toggle-all-id="${problem.id}"`;
    const memoId = isReview ? `memo-${problem.id}` : `memo-all-${problem.id}`;

    return `
        <div class="problem-card">
            <div class="problem-header">
                <div class="problem-name">${escapeHtml(problem.name)}</div>
                ${problem.url ? `<a href="${escapeHtml(problem.url)}" target="_blank" class="btn btn-info" style="padding: 6px 12px; font-size: 0.9em;">문제 보기</a>` : ''}
            </div>
            ${problem.tags.length > 0 ? `
                <div class="problem-tags">
                    ${problem.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="problem-memo" id="${memoId}">
                ${renderMarkdownMemo(problem.memo)}
            </div>
            <div class="problem-info">
                등록일: ${problem.created_at} | 다음 복습: ${problem.next_review_at} | 이해도: ${problem.level}
            </div>
            <div class="problem-actions">
                <button ${toggleId} class="btn btn-secondary">메모 보기</button>
                ${isReview ? `<button data-review-id="${problem.id}" class="btn btn-success">복습 완료</button>` : ''}
            </div>
        </div>
    `;
}

// Toggle memo visibility
function toggleMemo(problemId, isAll = false) {
    const memoId = isAll ? `memo-all-${problemId}` : `memo-${problemId}`;
    const memo = document.getElementById(memoId);
    const toggleId = isAll ? `data-toggle-all-id` : `data-toggle-id`;
    const btn = document.querySelector(`[${toggleId}="${problemId}"]`);

    if (memo && btn) {
        memo.classList.toggle('show');
        btn.textContent = memo.classList.contains('show') ? '메모 숨기기' : '메모 보기';
    }
}

// Open review modal
let currentReviewProblem = null;

function openReviewModal(problem) {
    currentReviewProblem = problem;
    const modal = document.getElementById('review-modal');
    document.getElementById('modal-problem-name').textContent = problem.name;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // Focus first button for accessibility
    setTimeout(() => {
        const firstButton = modal.querySelector('.modal-buttons button');
        if (firstButton) firstButton.focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('review-modal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    currentReviewProblem = null;
}

// Handle review completion
async function handleReviewComplete(newLevel) {
    if (!currentReviewProblem) return;

    if (!wasm) {
        showToast('WASM 모듈이 로드되지 않았습니다.', 'error');
        return;
    }

    try {
        // Call WASM function to update review
        const updatedJson = wasm.update_review(
            JSON.stringify(currentReviewProblem),
            newLevel
        );
        const updatedProblem = JSON.parse(updatedJson);

        // Update the problem in the array
        const index = currentProblems.findIndex(p => p.id === currentReviewProblem.id);
        if (index !== -1) {
            currentProblems[index] = updatedProblem;
        }

        saveToLocalStorage(); // Auto-save
        renderProblems();
        closeModal();
        showToast('복습을 완료했습니다!');
    } catch (error) {
        console.error('Review update error:', error);
        showToast('복습 완료 처리 실패: ' + error, 'error');
    }
}

// Handle search
async function handleSearch(event) {
    const searchTerm = event.target.value.trim();

    if (!searchTerm) {
        renderAllProblems();
        return;
    }

    let filtered = [];

    if (wasm && currentProblems.length > 0) {
        try {
            // Use WASM to filter
            const filteredJson = wasm.filter_problems(JSON.stringify(currentProblems), searchTerm);
            filtered = JSON.parse(filteredJson);
        } catch (error) {
            console.error('WASM filter error:', error);
            // Fallback to JS filtering
            const searchLower = searchTerm.toLowerCase();
            filtered = currentProblems.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }
    } else {
        // Fallback to JS filtering
        const searchLower = searchTerm.toLowerCase();
        filtered = currentProblems.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }

    const container = document.getElementById('all-problems');
    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-message">검색 결과가 없습니다.</p>';
        return;
    }

    container.innerHTML = filtered.map(problem => createProblemCard(problem, false)).join('');
}

// Handle sort
async function handleSort(event) {
    const criteria = event.target.value;

    if (wasm && currentProblems.length > 0) {
        try {
            // Use WASM to sort
            const sortedJson = wasm.sort_problems(JSON.stringify(currentProblems), criteria);
            currentProblems = JSON.parse(sortedJson);
        } catch (error) {
            console.error('WASM sort error:', error);
            // Fallback to JS sorting
            currentProblems.sort((a, b) => {
                if (criteria === 'next_review') {
                    return a.next_review_at.localeCompare(b.next_review_at);
                } else if (criteria === 'created_at') {
                    return b.created_at.localeCompare(a.created_at);
                } else if (criteria === 'name') {
                    return a.name.localeCompare(b.name);
                }
                return 0;
            });
        }
    } else {
        // Fallback to JS sorting
        currentProblems.sort((a, b) => {
            if (criteria === 'next_review') {
                return a.next_review_at.localeCompare(b.next_review_at);
            } else if (criteria === 'created_at') {
                return b.created_at.localeCompare(a.created_at);
            } else if (criteria === 'name') {
                return a.name.localeCompare(b.name);
            }
            return 0;
        });
    }

    renderAllProblems();
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;

    if (type === 'error') {
        toast.style.backgroundColor = '#e74c3c';
    } else if (type === 'warning') {
        toast.style.backgroundColor = '#f39c12';
    } else {
        toast.style.backgroundColor = '#2ecc71';
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start the application
init();
