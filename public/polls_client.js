async function deletePoll(id) {
    if (!confirm("Delete quiz? (There will be no going back. Please be certain.)")) return;
    
    try {
        const res = await fetch(`/polls/${id}`, { method: 'DELETE' });
        if (res.ok) {
            window.location.reload();
        } else {
            alert('Deleting error');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred');
    }
}

function reindexQuestions() {
    const blocks = document.querySelectorAll('#questionsContainer .question-block');
    blocks.forEach((block, i) => {
        const label = block.querySelector('.question-number');
        if (label) label.textContent = `Qustion ${i + 1}`;

        const qtInput = block.querySelector('input[data-field="question_text"]');
        if (qtInput) qtInput.name = 'question_text';

        const typeSelect = block.querySelector('select[data-field="type"]');
        if (typeSelect) typeSelect.name = 'type';

        block.querySelectorAll('input[data-field="option"]').forEach(inp => {
            inp.name = `options_${i}[]`;
        });
        block.querySelectorAll('input[data-field="correct_option"]').forEach(inp => {
            inp.name = inp.type === 'radio' ? `correct_options_${i}` : `correct_options_${i}[]`;
        });
    });
}

function toggleOptions() {
    const typeSelect = document.getElementById('type');
    if (!typeSelect) return;
    const type = typeSelect.value;
    const container = document.getElementById('optionsContainer');
    const textContainer = document.getElementById('textAnswerContainer');
    if (container) container.style.display = (type === 'text') ? 'none' : 'block';
    if (textContainer) textContainer.style.display = (type === 'text') ? 'block' : 'none';

    document.querySelectorAll('#optionsList .correct-option-input').forEach(inp => {
        inp.type = type === 'single' ? 'radio' : 'checkbox';
    });
    reindexQuestions();
}

function addOptionField() {
    const list = document.getElementById('optionsList');
    if (!list) return;
    const type = document.getElementById('type').value;
    const idx = list.querySelectorAll('.input-group').length;

    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
        <div class="input-group-text">
            <input class="correct-option-input"
                data-field="correct_option"
                type="${type === 'single' ? 'radio' : 'checkbox'}"
                value="${idx}">
        </div>
        <input type="text" data-field="option" class="form-control" placeholder="Option ${idx + 1}">
    `;
    list.appendChild(div);
    reindexQuestions();
}


let questionCount = 1;

function addQuestion() {
    questionCount++;
    const container = document.getElementById('questionsContainer');
    if (!container) return;

    const block = document.createElement('div');
    block.className = 'form-card question-block';
    block.innerHTML = `
        <button type="button" class="btn-remove-question" onclick="removeQuestion(this)" title="Delete question">✕</button>
        <div class="question-number">Question ${questionCount}</div>

        <div class="form-group">
            <label>Question text:</label>
            <input type="text" data-field="question_text" name="question_text" class="form-control" required>
        </div>

        <div class="form-group">
            <label>Question type:</label>
            <select data-field="type" name="type" class="form-control extra-type-select" onchange="toggleExtraOptions(this)">
                <option value="text">text</option>
                <option value="single">single choice</option>
                <option value="multiple">multiple choice</option>
            </select>
        </div>

        <div class="extra-options-container" style="display:none;">
            <label>Options:</label>
            <div class="extra-options-list">
                <div class="input-group mb-2">
                    <div class="input-group-text">
                        <input class="correct-option-input" data-field="correct_option" type="checkbox" value="0">
                    </div>
                    <input type="text" data-field="option" class="form-control" placeholder="Option 1">
                </div>
            </div>
            <button type="button" onclick="addExtraOptionField(this)" class="btn btn-sm btn-secondary">+ Add option</button>
        </div>

        <div class="extra-text-container" style="display:block;">
            <label>Correct answer:</label>
            <input type="text" name="correct_text_${questionCount - 1}" class="form-control" placeholder="Input correct answer...">
        </div>
    `;

    container.appendChild(block);
    reindexQuestions();
    block.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function removeQuestion(btn) {
    btn.closest('.question-block').remove();
    const blocks = document.querySelectorAll('#questionsContainer .question-block');
    questionCount = blocks.length;
    reindexQuestions();
}

function toggleExtraOptions(select) {
    const block = select.closest('.question-block');
    const optContainer = block.querySelector('.extra-options-container');
    const txtContainer = block.querySelector('.extra-text-container');
    const val = select.value;

    if (optContainer) optContainer.style.display = (val === 'text') ? 'none' : 'block';
    if (txtContainer) txtContainer.style.display = (val === 'text') ? 'block' : 'none';

    block.querySelectorAll('.correct-option-input').forEach(inp => {
        inp.type = val === 'single' ? 'radio' : 'checkbox';
    });
    reindexQuestions();
}

function addExtraOptionField(btn) {
    const list = btn.previousElementSibling;
    const select = btn.closest('.question-block').querySelector('.extra-type-select');
    const type = select ? select.value : 'checkbox';
    const idx = list.querySelectorAll('.input-group').length;

    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
        <div class="input-group-text">
            <input class="correct-option-input"
                data-field="correct_option"
                type="${type === 'single' ? 'radio' : 'checkbox'}"
                value="${idx}">
        </div>
        <input type="text" data-field="option" class="form-control" placeholder="Option ${idx + 1}">
    `;
    list.appendChild(div);
    reindexQuestions();
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('type')) {
        toggleOptions();
    }
    reindexQuestions();
});