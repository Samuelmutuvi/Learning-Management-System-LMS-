document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginBtn = document.getElementById('login-btn');
    const saveNotesBtn = document.getElementById('save-notes');
    const createAssignmentBtn = document.getElementById('create-assignment');
    const addQuestionBtn = document.getElementById('add-question');
    const saveQuizBtn = document.getElementById('save-quiz');
    const questionsContainer = document.getElementById('questions-container');

    // Login Functionality
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const instructorId = document.getElementById('instructor-id').value;
            const password = document.getElementById('password').value;

            // Simple validation
            if (instructorId && password) {
                // In a real app, you would verify credentials here
                loginSection.style.display = 'none';
                dashboardSection.style.display = 'block';
                
                // Load saved data
                loadSavedData();
            } else {
                alert('Please enter both ID and password');
            }
        });
    }

    // Notes Functionality
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', function() {
            const notes = document.getElementById('course-notes').value;
            localStorage.setItem('instructor-notes', notes);
            alert('Notes saved successfully!');
        });
    }

    // Assignment Functionality
    if (createAssignmentBtn) {
        createAssignmentBtn.addEventListener('click', function() {
            const title = document.getElementById('assignment-title').value;
            const desc = document.getElementById('assignment-desc').value;
            const dueDate = document.getElementById('assignment-due').value;

            if (title && desc && dueDate) {
                const assignment = {
                    title,
                    description: desc,
                    dueDate,
                    createdAt: new Date().toISOString()
                };

                // Save to localStorage
                let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
                assignments.push(assignment);
                localStorage.setItem('assignments', JSON.stringify(assignments));

                alert('Assignment created successfully!');
                clearAssignmentForm();
            } else {
                alert('Please fill all assignment fields');
            }
        });
    }

    // Quiz Functionality
    let questionCount = 0;

    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', function() {
            questionCount++;
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            questionDiv.innerHTML = `
                <h4>Question ${questionCount}</h4>
                <input type="text" placeholder="Question text" class="question-text">
                <input type="text" placeholder="Option A" class="question-option">
                <input type="text" placeholder="Option B" class="question-option">
                <input type="text" placeholder="Option C" class="question-option">
                <select class="correct-answer">
                    <option value="">Select correct answer</option>
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                </select>
            `;
            questionsContainer.appendChild(questionDiv);
        });
    }

    if (saveQuizBtn) {
        saveQuizBtn.addEventListener('click', function() {
            const quizTitle = document.getElementById('quiz-title').value;
            const questions = Array.from(document.querySelectorAll('.question')).map(question => {
                return {
                    text: question.querySelector('.question-text').value,
                    options: Array.from(question.querySelectorAll('.question-option')).map(opt => opt.value),
                    correctAnswer: question.querySelector('.correct-answer').value
                };
            });

            if (quizTitle && questions.length > 0) {
                const quiz = {
                    title: quizTitle,
                    questions,
                    createdAt: new Date().toISOString()
                };

                // Save to localStorage
                let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
                quizzes.push(quiz);
                localStorage.setItem('quizzes', JSON.stringify(quizzes));

                alert('Quiz saved successfully!');
                clearQuizForm();
            } else {
                alert('Please add at least one question and provide a quiz title');
            }
        });
    }

    // Helper Functions
    function loadSavedData() {
        // Load saved notes
        const savedNotes = localStorage.getItem('instructor-notes');
        if (savedNotes) {
            document.getElementById('course-notes').value = savedNotes;
        }
    }

    function clearAssignmentForm() {
        document.getElementById('assignment-title').value = '';
        document.getElementById('assignment-desc').value = '';
        document.getElementById('assignment-due').value = '';
    }

    function clearQuizForm() {
        document.getElementById('quiz-title').value = '';
        questionsContainer.innerHTML = '';
        questionCount = 0;
    }
});