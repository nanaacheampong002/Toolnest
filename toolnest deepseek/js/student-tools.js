// Student Tools Functionality

// ==================== GPA CALCULATOR ====================
let courses = [];

// Initialize GPA calculator on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add first course by default
    if (document.getElementById('courses-container')) {
        addCourse();
        loadSavedGPAs();
    }
    
    // Load Pomodoro settings if they exist
    loadPomodoroSettings();
    
    // Check favorites status
    updateFavoriteIcons();
    
    // Load last GPA calculation
    loadLastGPACalculation();
});

function addCourse() {
    const container = document.getElementById('courses-container');
    if (!container) return;
    
    const courseDiv = document.createElement('div');
    courseDiv.className = 'course-row';
    courseDiv.innerHTML = `
        <div class="course-field">
            <label>Course Name</label>
            <input type="text" placeholder="e.g., MATH 101" class="course-name">
        </div>
        <div class="course-field">
            <label>Credit Hours</label>
            <input type="number" placeholder="Credits" min="0" max="6" step="0.5" class="course-credits" value="3">
        </div>
        <div class="course-field">
            <label>Grade</label>
            <select class="course-grade">
                <option value="4.0">A (4.0) - Excellent</option>
                <option value="3.7">A- (3.7)</option>
                <option value="3.3">B+ (3.3)</option>
                <option value="3.0" selected>B (3.0) - Good</option>
                <option value="2.7">B- (2.7)</option>
                <option value="2.3">C+ (2.3)</option>
                <option value="2.0">C (2.0) - Average</option>
                <option value="1.7">C- (1.7)</option>
                <option value="1.3">D+ (1.3)</option>
                <option value="1.0">D (1.0) - Poor</option>
                <option value="0.0">F (0.0) - Fail</option>
            </select>
        </div>
        <span class="material-icons remove-course" onclick="removeCourse(this)">delete</span>
    `;
    container.appendChild(courseDiv);
}

function removeCourse(element) {
    if (document.querySelectorAll('.course-row').length > 1) {
        element.parentElement.remove();
        calculateGPA();
    } else {
        alert('You need at least one course');
    }
}

function calculateGPA() {
    const gradeInputs = document.querySelectorAll('.course-grade');
    const creditInputs = document.querySelectorAll('.course-credits');
    let totalPoints = 0;
    let totalCredits = 0;

    for (let i = 0; i < gradeInputs.length; i++) {
        const grade = parseFloat(gradeInputs[i].value);
        const credits = parseFloat(creditInputs[i].value);
        
        if (credits > 0 && !isNaN(grade)) {
            totalPoints += grade * credits;
            totalCredits += credits;
        }
    }

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    
    const gpaElement = document.getElementById('gpa-value');
    const creditsElement = document.getElementById('total-credits');
    const pointsElement = document.getElementById('total-points');
    
    if (gpaElement) gpaElement.textContent = gpa;
    if (creditsElement) creditsElement.textContent = totalCredits;
    if (pointsElement) pointsElement.textContent = totalPoints.toFixed(2);

    // Add color coding
    if (gpaElement) {
        gpaElement.className = '';
        if (gpa >= 3.5) gpaElement.classList.add('gpa-excellent');
        else if (gpa >= 3.0) gpaElement.classList.add('gpa-good');
        else if (gpa >= 2.0) gpaElement.classList.add('gpa-average');
        else if (gpa >= 1.0) gpaElement.classList.add('gpa-poor');
        else gpaElement.classList.add('gpa-fail');
    }

    return { gpa, totalCredits, totalPoints };
}

function saveGPACalculation() {
    const result = calculateGPA();
    const courses = [];
    
    document.querySelectorAll('.course-row').forEach(row => {
        const name = row.querySelector('.course-name')?.value || '';
        const credits = row.querySelector('.course-credits')?.value || '3';
        const grade = row.querySelector('.course-grade')?.value || '3.0';
        courses.push({ name, credits, grade });
    });
    
    const calculation = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        gpa: result.gpa,
        totalCredits: result.totalCredits,
        totalPoints: result.totalPoints,
        courses: courses,
        gradingSystem: document.querySelector('input[name="gradingSystem"]:checked')?.value || 'ghana'
    };
    
    let savedGPAs = JSON.parse(localStorage.getItem('savedGPAs') || '[]');
    savedGPAs.unshift(calculation);
    savedGPAs = savedGPAs.slice(0, 10); // Keep only last 10
    
    localStorage.setItem('savedGPAs', JSON.stringify(savedGPAs));
    
    loadSavedGPAs();
    alert('GPA calculation saved!');
}

function loadSavedGPAs() {
    const savedGPAs = JSON.parse(localStorage.getItem('savedGPAs') || '[]');
    const listElement = document.getElementById('savedGpasList');
    
    if (!listElement) return;
    
    if (savedGPAs.length === 0) {
        listElement.innerHTML = '<p class="no-saved">No saved calculations yet</p>';
        return;
    }
    
    listElement.innerHTML = savedGPAs.map(calc => `
        <div class="saved-gpa-item" onclick="loadSavedGPA(${calc.id})">
            <span class="gpa-date">${calc.date}</span>
            <span class="gpa-value">GPA: ${calc.gpa}</span>
            <span class="gpa-credits">${calc.totalCredits} credits</span>
        </div>
    `).join('');
}

function loadSavedGPA(id) {
    const savedGPAs = JSON.parse(localStorage.getItem('savedGPAs') || '[]');
    const calculation = savedGPAs.find(c => c.id === id);
    
    if (!calculation) return;
    
    // Clear existing courses
    document.getElementById('courses-container').innerHTML = '';
    
    // Load courses
    calculation.courses.forEach(course => {
        addCourse();
        const lastRow = document.querySelector('.course-row:last-child');
        if (lastRow) {
            lastRow.querySelector('.course-name').value = course.name || '';
            lastRow.querySelector('.course-credits').value = course.credits || '3';
            lastRow.querySelector('.course-grade').value = course.grade || '3.0';
        }
    });
    
    // Set grading system
    const radio = document.querySelector(`input[name="gradingSystem"][value="${calculation.gradingSystem}"]`);
    if (radio) radio.checked = true;
    
    calculateGPA();
}

function loadLastGPACalculation() {
    const savedGPAs = JSON.parse(localStorage.getItem('savedGPAs') || '[]');
    if (savedGPAs.length > 0) {
        loadSavedGPA(savedGPAs[0].id);
    }
}

// ==================== POMODORO TIMER ====================
let timerInterval;
let timerMinutes = 25;
let timerSeconds = 0;
let isRunning = false;
let sessionCount = 0;
let currentMode = 'pomodoro';
const defaultTimes = { pomodoro: 25, shortBreak: 5, longBreak: 15 };
let customTimes = { ...defaultTimes };

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    
    timerInterval = setInterval(() => {
        if (timerSeconds === 0) {
            if (timerMinutes === 0) {
                completeTimer();
                return;
            }
            timerMinutes--;
            timerSeconds = 59;
        } else {
            timerSeconds--;
        }
        
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Reset to current mode's time
    if (currentMode === 'pomodoro') timerMinutes = defaultTimes.pomodoro;
    else if (currentMode === 'shortBreak') timerMinutes = defaultTimes.shortBreak;
    else if (currentMode === 'longBreak') timerMinutes = defaultTimes.longBreak;
    
    timerSeconds = 0;
    updateTimerDisplay();
    
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
}

function completeTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Update session count for pomodoro
    if (currentMode === 'pomodoro') {
        sessionCount++;
        const sessionElement = document.getElementById('sessionCount');
        if (sessionElement) sessionElement.textContent = sessionCount;
        
        // Save to storage
        localStorage.setItem('pomodoroSessions', sessionCount);
    }
    
    // Play notification
    playNotification();
    
    // Update buttons
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    
    // Auto-switch to break if it was pomodoro
    if (currentMode === 'pomodoro') {
        if (sessionCount % 4 === 0) {
            setMode(customTimes.longBreak, 'longBreak');
        } else {
            setMode(customTimes.shortBreak, 'shortBreak');
        }
    } else {
        setMode(customTimes.pomodoro, 'pomodoro');
    }
}

function setMode(minutes, mode) {
    timerMinutes = minutes;
    timerSeconds = 0;
    currentMode = mode;
    updateTimerDisplay();
    
    // Update active mode button
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    
    if (mode === 'pomodoro') {
        document.getElementById('mode-pomodoro')?.classList.add('active');
    } else if (mode === 'shortBreak') {
        document.getElementById('mode-short')?.classList.add('active');
    } else if (mode === 'longBreak') {
        document.getElementById('mode-long')?.classList.add('active');
    }
    
    // Reset running state
    if (isRunning) {
        pauseTimer();
    }
}

function updateTimerDisplay() {
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (minutesElement) {
        minutesElement.textContent = timerMinutes.toString().padStart(2, '0');
    }
    if (secondsElement) {
        secondsElement.textContent = timerSeconds.toString().padStart(2, '0');
    }
    
    // Update page title with timer
    document.title = `(${timerMinutes}:${timerSeconds.toString().padStart(2, '0')}) ToolNest`;
}

function playNotification() {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Browser does not support Web Audio API');
    }
}

function loadPomodoroSettings() {
    const saved = localStorage.getItem('pomodoroSessions');
    if (saved) {
        sessionCount = parseInt(saved);
        const sessionElement = document.getElementById('sessionCount');
        if (sessionElement) sessionElement.textContent = sessionCount;
    }
    
    // Load custom times
    const savedTimes = localStorage.getItem('pomodoroCustomTimes');
    if (savedTimes) {
        customTimes = JSON.parse(savedTimes);
        document.getElementById('customPomodoro').value = customTimes.pomodoro;
        document.getElementById('customShortBreak').value = customTimes.shortBreak;
        document.getElementById('customLongBreak').value = customTimes.longBreak;
    }
}

function updateCustomTimer() {
    // Just updates the display, actual apply happens with applyCustomTimer
}

function applyCustomTimer() {
    customTimes = {
        pomodoro: parseInt(document.getElementById('customPomodoro').value) || 25,
        shortBreak: parseInt(document.getElementById('customShortBreak').value) || 5,
        longBreak: parseInt(document.getElementById('customLongBreak').value) || 15
    };
    
    localStorage.setItem('pomodoroCustomTimes', JSON.stringify(customTimes));
    
    // Reset current mode with new time
    if (currentMode === 'pomodoro') timerMinutes = defaultTimes.pomodoro;
    else if (currentMode === 'shortBreak') timerMinutes = defaultTimes.shortBreak;
    else if (currentMode === 'longBreak') timerMinutes = defaultTimes.longBreak;
    
    timerSeconds = 0;
    updateTimerDisplay();
    
    alert('Timer settings saved!');
}

// ==================== CITATION GENERATOR ====================
function toggleCitationFields() {
    const source = document.getElementById('citation-source')?.value;
    
    // Hide all fields
    document.getElementById('book-fields').style.display = 'none';
    document.getElementById('website-fields').style.display = 'none';
    document.getElementById('journal-fields').style.display = 'none';
    document.getElementById('video-fields').style.display = 'none';
    document.getElementById('newspaper-fields').style.display = 'none';
    
    // Show selected fields
    if (source === 'book') {
        document.getElementById('book-fields').style.display = 'flex';
    } else if (source === 'website') {
        document.getElementById('website-fields').style.display = 'flex';
    } else if (source === 'journal') {
        document.getElementById('journal-fields').style.display = 'flex';
    } else if (source === 'video') {
        document.getElementById('video-fields').style.display = 'flex';
    } else if (source === 'newspaper') {
        document.getElementById('newspaper-fields').style.display = 'flex';
    }
}

function generateCitation() {
    const style = document.getElementById('citation-style')?.value;
    const source = document.getElementById('citation-source')?.value;
    let citation = '';
    
    if (source === 'book') {
        const author = document.getElementById('author')?.value;
        const year = document.getElementById('year')?.value;
        const title = document.getElementById('title')?.value;
        const publisher = document.getElementById('publisher')?.value;
        const edition = document.getElementById('edition')?.value;
        
        if (!author || !year || !title || !publisher) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (style === 'apa') {
            citation = `${author} (${year}). <em>${title}</em>${edition ? ' (' + edition + ' ed.)' : ''}. ${publisher}.`;
        } else if (style === 'mla') {
            citation = `${author}. <em>${title}</em>${edition ? ' ' + edition + ' ed.' : ''}, ${publisher}, ${year}.`;
        } else if (style === 'chicago') {
            citation = `${author}. <em>${title}</em>${edition ? ' ' + edition + ' ed.' : ''}. ${publisher}, ${year}.`;
        } else if (style === 'harvard') {
            citation = `${author} (${year}). <em>${title}</em>${edition ? ' ' + edition + ' edn.' : ''}. ${publisher}.`;
        }
    }
    else if (source === 'website') {
        const author = document.getElementById('web-author')?.value;
        const date = document.getElementById('web-date')?.value;
        const title = document.getElementById('web-title')?.value;
        const siteName = document.getElementById('site-name')?.value;
        const url = document.getElementById('web-url')?.value;
        const accessDate = document.getElementById('access-date')?.value;
        
        if (!author || !date || !title || !siteName || !url) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (style === 'apa') {
            citation = `${author} (${date}). ${title}. <em>${siteName}</em>. Retrieved ${accessDate || 'accessed date'}, from ${url}`;
        } else if (style === 'mla') {
            citation = `${author}. "${title}." <em>${siteName}</em>, ${date}, ${url}. Accessed ${accessDate || 'day month year'}.`;
        } else if (style === 'chicago') {
            citation = `${author}. "${title}." <em>${siteName}</em>. ${date}. ${url}.`;
        } else if (style === 'harvard') {
            citation = `${author} (${date}). ${title}. <em>${siteName}</em>. Available at: ${url} (Accessed: ${accessDate || 'date'}).`;
        }
    }
    // Add other source types similarly...
    
    const resultDiv = document.getElementById('citation-result');
    const actionsDiv = document.getElementById('citation-actions');
    
    if (resultDiv) {
        resultDiv.innerHTML = citation;
        resultDiv.style.display = 'block';
    }
    
    if (actionsDiv) {
        actionsDiv.style.display = 'flex';
    }
    
    // Track usage
    if (typeof storage !== 'undefined') {
        storage.addToHistory(3);
    }
}

function copyCitation() {
    const citation = document.getElementById('citation-result')?.innerText;
    if (citation) {
        navigator.clipboard.writeText(citation).then(() => {
            alert('Citation copied to clipboard!');
        });
    }
}

function saveCitation() {
    const citation = document.getElementById('citation-result')?.innerHTML;
    const style = document.getElementById('citation-style')?.value;
    const source = document.getElementById('citation-source')?.value;
    
    const savedCitation = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        style: style,
        source: source,
        citation: citation
    };
    
    let savedCitations = JSON.parse(localStorage.getItem('savedCitations') || '[]');
    savedCitations.unshift(savedCitation);
    savedCitations = savedCitations.slice(0, 20);
    
    localStorage.setItem('savedCitations', JSON.stringify(savedCitations));
    alert('Citation saved to your dashboard!');
}

// ==================== FLASHCARD GENERATOR ====================
function generateFlashcards() {
    const topic = document.getElementById('flashcard-topic')?.value;
    const content = document.getElementById('flashcard-content')?.value;
    
    if (!topic || !content) {
        alert('Please enter both topic and content');
        return;
    }
    
    const lines = content.split('\n').filter(line => line.trim());
    const flashcards = [];
    
    lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            flashcards.push({
                term: parts[0].trim(),
                definition: parts.slice(1).join(':').trim()
            });
        }
    });
    
    if (flashcards.length === 0) {
        alert('Please use the format: term: definition');
        return;
    }
    
    displayFlashcards(flashcards, topic);
}

function displayFlashcards(flashcards, topic) {
    const container = document.getElementById('flashcards-container');
    const grid = document.getElementById('flashcards-grid');
    
    container.style.display = 'block';
    
    grid.innerHTML = flashcards.map((card, index) => `
        <div class="flashcard" onclick="flipFlashcard(this)">
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <strong>${card.term}</strong>
                </div>
                <div class="flashcard-back">
                    ${card.definition}
                </div>
            </div>
        </div>
    `).join('');
    
    // Save to recent flashcards
    const flashcardSet = {
        id: Date.now(),
        topic: topic,
        cards: flashcards,
        count: flashcards.length
    };
    
    let savedSets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
    savedSets.unshift(flashcardSet);
    savedSets = savedSets.slice(0, 5);
    localStorage.setItem('flashcardSets', JSON.stringify(savedSets));
}

function flipFlashcard(card) {
    card.classList.toggle('flipped');
}

function shuffleFlashcards() {
    const grid = document.getElementById('flashcards-grid');
    const cards = Array.from(grid.children);
    
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        grid.insertBefore(cards[j], cards[i]);
    }
}

function resetFlashcards() {
    const cards = document.querySelectorAll('.flashcard');
    cards.forEach(card => card.classList.remove('flipped'));
}

// ==================== STUDY PLANNER ====================
function generateStudyPlan() {
    const examDate = document.getElementById('exam-date')?.value;
    const hoursPerDay = parseInt(document.getElementById('hours-per-day')?.value) || 4;
    const subjectsInput = document.getElementById('subjects')?.value;
    
    if (!examDate || !subjectsInput) {
        alert('Please fill in all fields');
        return;
    }
    
    const subjects = subjectsInput.split(',').map(s => s.trim()).filter(s => s);
    const today = new Date();
    const exam = new Date(examDate);
    const daysUntilExam = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExam <= 0) {
        alert('Exam date must be in the future');
        return;
    }
    
    const totalHours = daysUntilExam * hoursPerDay;
    const hoursPerSubject = Math.floor(totalHours / subjects.length);
    const remainingHours = totalHours % subjects.length;
    
    let plan = `<h3>Study Plan - ${daysUntilExam} days until exam</h3>`;
    plan += `<p>Total study hours available: ${totalHours}</p>`;
    plan += `<div class="plan-details">`;
    
    subjects.forEach((subject, index) => {
        const hours = hoursPerSubject + (index < remainingHours ? 1 : 0);
        const dailyHours = (hours / daysUntilExam).toFixed(1);
        plan += `
            <div class="subject-plan">
                <strong>${subject}</strong>
                <span>${hours} total hours</span>
                <span>≈ ${dailyHours} hours/day</span>
            </div>
        `;
    });
    
    plan += `</div>`;
    plan += `<div class="study-tips">`;
    plan += `<h4>Study Tips:</h4>`;
    plan += `<ul>`;
    plan += `<li>Break study sessions into 25-minute Pomodoro intervals</li>`;
    plan += `<li>Take 5-minute breaks between sessions</li>`;
    plan += `<li>Review material within 24 hours for better retention</li>`;
    plan += `<li>Practice active recall and spaced repetition</li>`;
    plan += `</ul>`;
    plan += `</div>`;
    
    const resultDiv = document.getElementById('study-plan-result');
    resultDiv.innerHTML = plan;
    resultDiv.style.display = 'block';
    
    // Save to history
    const planData = {
        date: new Date().toLocaleString(),
        examDate: examDate,
        subjects: subjects,
        daysUntilExam: daysUntilExam
    };
    
    let savedPlans = JSON.parse(localStorage.getItem('studyPlans') || '[]');
    savedPlans.unshift(planData);
    savedPlans = savedPlans.slice(0, 5);
    localStorage.setItem('studyPlans', JSON.stringify(savedPlans));
}

// ==================== FAVORITE TOGGLE ====================
function toggleFavorite(toolId) {
    if (typeof storage !== 'undefined') {
        const isFavorite = storage.toggleFavorite(toolId);
        updateFavoriteIcon(toolId, isFavorite);
    }
}

function updateFavoriteIcon(toolId, isFavorite) {
    const icon = document.getElementById(`fav-${toolId}`);
    if (icon) {
        icon.textContent = isFavorite ? 'star' : 'star_border';
    }
}

function updateFavoriteIcons() {
    if (typeof storage !== 'undefined') {
        const favorites = storage.getFavorites();
        favorites.forEach(toolId => {
            updateFavoriteIcon(toolId, true);
        });
    }
}

// ==================== TOOL EXPAND/COLLAPSE ====================
function toggleTool(header) {
    const card = header.closest('.tool-card');
    const content = card.querySelector('.tool-content');
    const icon = header.querySelector('.expand-icon');
    
    card.classList.toggle('expanded');
    
    if (content.style.display === 'none' || getComputedStyle(content).display === 'none') {
        content.style.display = 'block';
        icon.textContent = 'expand_less';
    } else {
        content.style.display = 'none';
        icon.textContent = 'expand_more';
    }
}

// Initialize everything when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudentTools);
} else {
    initStudentTools();
}

function initStudentTools() {
    // Set up citation source change
    const citationSource = document.getElementById('citation-source');
    if (citationSource) {
        citationSource.addEventListener('change', toggleCitationFields);
        toggleCitationFields(); // Initialize
    }
    
    // Set up GPA calculator real-time updates
    const container = document.getElementById('courses-container');
    if (container) {
        container.addEventListener('input', calculateGPA);
        container.addEventListener('change', calculateGPA);
    }
}


// ==================== SAVED SEMESTERS (GPA/CGPA) ====================
function _collectCoursesForSaveDeep() {
    const rows = document.querySelectorAll('#courses-container .course-row');
    const courses = [];
    rows.forEach(row => {
        const name = row.querySelector('.course-name')?.value?.trim() || '';
        const grade = row.querySelector('.course-grade')?.value || '';
        const credits = row.querySelector('.course-credits')?.value || '';
        if (name || grade || credits) courses.push({ name, grade, credits });
    });
    return courses;
}

function saveSemester() {
    const result = calculateGPA();
    const gpa = (result && result.gpa) ? result.gpa : (document.getElementById('gpa-value')?.textContent || '0.00');
    const totalCredits = (result && typeof result.totalCredits !== 'undefined') ? result.totalCredits : Number(document.getElementById('total-credits')?.textContent || 0);
    const courses = _collectCoursesForSaveDeep();

    const title = prompt('Semester name (e.g. Level 200 Sem 2):', '') || '';
    if (!title.trim()) { alert('Save cancelled.'); return; }

    const saved = (window.storage && window.storage.getCustom) ? (window.storage.getCustom('savedSemesters', []) || []) : (JSON.parse(localStorage.getItem('savedSemesters')||'[]'));
    saved.unshift({
        id: 'sem_' + Date.now(),
        title: title.trim(),
        gpa: String(gpa),
        totalCredits: Number(totalCredits) || 0,
        courses,
        createdAt: Date.now()
    });

    if (window.storage && window.storage.setCustom) window.storage.setCustom('savedSemesters', saved.slice(0, 40));
    else localStorage.setItem('savedSemesters', JSON.stringify(saved.slice(0,40)));

    alert('Saved!');
}

function openSavedSemesters() {
    const modal = document.getElementById('savedSemestersModal');
    if (!modal) return;
    renderSavedSemesters();
    modal.style.display = 'flex';
}

function closeSavedSemesters() {
    const modal = document.getElementById('savedSemestersModal');
    if (modal) modal.style.display = 'none';
}

function renderSavedSemesters() {
    const wrap = document.getElementById('savedSemestersList');
    if (!wrap) return;
    const saved = (window.storage && window.storage.getCustom) ? (window.storage.getCustom('savedSemesters', []) || []) : (JSON.parse(localStorage.getItem('savedSemesters')||'[]'));
    if (!saved.length) {
        wrap.innerHTML = '<p class="field-hint">No saved semesters yet.</p>';
        return;
    }

    wrap.innerHTML = saved.map(s => `
        <div class="update-card" style="margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;">
                <div>
                    <h3 style="margin-bottom:.25rem;">${escapeHtml(s.title)}</h3>
                    <div class="field-hint">GPA/CGPA: <b>${escapeHtml(s.gpa)}</b> • Credits: <b>${s.totalCredits}</b></div>
                </div>
                <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
                    <button class="btn btn-secondary" onclick="loadSavedSemester('${s.id}')">Load</button>
                    <button class="btn btn-secondary" onclick="deleteSavedSemester('${s.id}')">Delete</button>
                </div>
            </div>
            ${s.courses && s.courses.length ? `
                <details style="margin-top:.75rem;">
                    <summary>Courses</summary>
                    <div style="margin-top:.5rem;display:grid;gap:.35rem;">
                        ${s.courses.map(c => `<div class="field-hint">• ${escapeHtml(c.name || 'Course')} — Grade: ${escapeHtml(c.grade)} • Credits: ${escapeHtml(c.credits)}</div>`).join('')}
                    </div>
                </details>
            ` : ''}
        </div>
    `).join('');
}

function loadSavedSemester(id) {
    const saved = (window.storage && window.storage.getCustom) ? (window.storage.getCustom('savedSemesters', []) || []) : (JSON.parse(localStorage.getItem('savedSemesters')||'[]'));
    const sem = saved.find(x => x.id === id);
    if (!sem) return;

    const container = document.getElementById('courses-container');
    if (!container) return;
    container.innerHTML = '';
    (sem.courses || []).forEach(() => addCourse());
    const rows = container.querySelectorAll('.course-row');
    (sem.courses || []).forEach((c, i) => {
        const row = rows[i];
        if (!row) return;
        row.querySelector('.course-name').value = c.name || '';
        row.querySelector('.course-grade').value = c.grade || '';
        row.querySelector('.course-credits').value = c.credits || '';
    });
    calculateGPA();
    closeSavedSemesters();
}

function deleteSavedSemester(id) {
    const saved = (window.storage && window.storage.getCustom) ? (window.storage.getCustom('savedSemesters', []) || []) : (JSON.parse(localStorage.getItem('savedSemesters')||'[]'));
    const next = saved.filter(x => x.id !== id);
    if (window.storage && window.storage.setCustom) window.storage.setCustom('savedSemesters', next);
    else localStorage.setItem('savedSemesters', JSON.stringify(next));
    renderSavedSemesters();
}

function clearSavedSemesters() {
    if (!confirm('Clear all saved semesters?')) return;
    if (window.storage && window.storage.setCustom) window.storage.setCustom('savedSemesters', []);
    else localStorage.setItem('savedSemesters', JSON.stringify([]));
    renderSavedSemesters();
}

function exportSavedSemesters() {
    const saved = (window.storage && window.storage.getCustom) ? (window.storage.getCustom('savedSemesters', []) || []) : (JSON.parse(localStorage.getItem('savedSemesters')||'[]'));
    const blob = new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolnest_saved_semesters.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('savedSemestersModal');
    if (!modal || modal.style.display === 'none') return;
    if (e.target === modal) closeSavedSemesters();
});


// ==================== GRADE CONVERTER ====================
function convertGrade(){
  const el=document.getElementById('percent-input');
  const wrap=document.getElementById('convert-result');
  const letterEl=document.getElementById('convert-letter');
  const gpEl=document.getElementById('convert-gp');
  if(!el||!wrap||!letterEl||!gpEl) return;
  const p = Number(el.value);
  if(Number.isNaN(p) || p<0 || p>100){ alert('Enter a valid percentage (0–100).'); return; }

  // Ghana-style example mapping
  let letter='F', gp=0.0;
  if(p>=80){ letter='A'; gp=4.0; }
  else if(p>=75){ letter='B+'; gp=3.5; }
  else if(p>=70){ letter='B'; gp=3.0; }
  else if(p>=65){ letter='C+'; gp=2.5; }
  else if(p>=60){ letter='C'; gp=2.0; }
  else if(p>=55){ letter='D+'; gp=1.5; }
  else if(p>=50){ letter='D'; gp=1.0; }
  else if(p>=40){ letter='E'; gp=0.5; }
  else { letter='F'; gp=0.0; }

  letterEl.textContent = letter;
  gpEl.textContent = gp.toFixed(1);
  wrap.style.display='block';
  try{ window.storage?.addToHistory?.(23); }catch(e){}
}
function clearGradeConvert(){
  const el=document.getElementById('percent-input');
  const wrap=document.getElementById('convert-result');
  if(el) el.value='';
  if(wrap) wrap.style.display='none';
}
