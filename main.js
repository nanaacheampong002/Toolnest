// Global tools database (expanded)
const tools = [
    // Student Tools
    { id: 1, name: 'GPA Calculator', description: 'Calculate your GPA with Ghana & International grading systems', icon: 'calculate', category: 'student', url: 'student-tools.html#gpa', keywords: ['gpa', 'grade', 'points', 'cgpa', 'calculator', 'university', 'college'] },
    { id: 2, name: 'Pomodoro Timer', description: 'Stay focused with customizable study sessions', icon: 'timer', category: 'student', url: 'student-tools.html#pomodoro', keywords: ['timer', 'study', 'focus', 'productivity', 'time management'] },
    { id: 3, name: 'Citation Generator', description: 'Generate citations in APA, MLA, Chicago, and Harvard styles', icon: 'format_quote', category: 'student', url: 'student-tools.html#citation', keywords: ['citation', 'apa', 'mla', 'chicago', 'harvard', 'reference', 'bibliography'] },
    { id: 4, name: 'Flashcard Generator', description: 'Create digital flashcards for effective studying', icon: 'style', category: 'student', url: 'student-tools.html#flashcards', keywords: ['flashcard', 'study', 'memory', 'learning', 'quiz'] },
    { id: 5, name: 'Study Schedule Planner', description: 'Plan your study sessions based on exam dates', icon: 'calendar_month', category: 'student', url: 'student-tools.html#study-planner', keywords: ['study plan', 'schedule', 'exam', 'planner', 'timetable'] },
    
    // PDF Tools
    { id: 6, name: 'Merge PDF', description: 'Combine multiple PDF files into one document', icon: 'merge', category: 'pdf', url: 'pdf-tools.html#merge', keywords: ['merge', 'combine', 'join', 'pdf', 'document'] },
    { id: 7, name: 'Split PDF', description: 'Split PDF files by page ranges or every X pages', icon: 'call_split', category: 'pdf', url: 'pdf-tools.html#split', keywords: ['split', 'separate', 'extract', 'pages', 'pdf'] },
    { id: 8, name: 'Reorder Pages', description: 'Rearrange PDF pages with visual thumbnails', icon: 'swap_calls', category: 'pdf', url: 'pdf-tools.html#reorder', keywords: ['reorder', 'rearrange', 'organize', 'pages', 'pdf'] },
    { id: 9, name: 'Compress PDF', description: 'Reduce PDF file size while maintaining quality', icon: 'compress', category: 'pdf', url: 'pdf-tools.html#compress', keywords: ['compress', 'reduce size', 'smaller', 'pdf', 'optimize'] },
    { id: 10, name: 'PDF to Images', description: 'Convert PDF pages to PNG or JPEG images', icon: 'image', category: 'pdf', url: 'pdf-tools.html#pdf-to-images', keywords: ['pdf to image', 'convert', 'png', 'jpeg', 'jpg', 'picture'] },
    { id: 11, name: 'Protect PDF', description: 'Add password protection to your PDF files', icon: 'lock', category: 'pdf', url: 'pdf-tools.html#protect', keywords: ['protect', 'password', 'secure', 'encrypt', 'pdf'] },
    
        { id: 18, name: 'Rotate Pages', description: 'Rotate PDF pages (90°/180°/270°).', icon: 'rotate_right', category: 'pdf', url: 'pdf-tools.html#rotate', keywords: ['rotate','pdf','pages'] },
    { id: 19, name: 'Extract Pages', description: 'Extract selected pages into a new PDF.', icon: 'content_copy', category: 'pdf', url: 'pdf-tools.html#extract', keywords: ['extract','pages','pdf'] },
    { id: 20, name: 'Delete Pages', description: 'Delete pages and save a cleaned PDF.', icon: 'delete', category: 'pdf', url: 'pdf-tools.html#delete', keywords: ['delete','remove','pages','pdf'] },
    { id: 21, name: 'Images → PDF', description: 'Convert images to a PDF.', icon: 'image', category: 'pdf', url: 'pdf-tools.html#img2pdf', keywords: ['images','jpg','png','to pdf'] },
    { id: 22, name: 'PDF → Images', description: 'Export PDF pages as images.', icon: 'photo_library', category: 'pdf', url: 'pdf-tools.html#pdf2img', keywords: ['pdf','to images','png'] },
    { id: 23, name: 'Grade Converter', description: 'Convert score → grade + grade point.', icon: 'swap_horiz', category: 'student', url: 'student-tools.html#converter', keywords: ['grade converter','percentage','letter'] },
    { id: 24, name: 'Case Converter', description: 'UPPERCASE, lowercase, Title Case, Sentence case.', icon: 'text_fields', category: 'writing', url: 'writing-tools.html#case', keywords: ['case','uppercase','lowercase'] },
    { id: 25, name: 'Keyword Extractor', description: 'Find top keywords from text.', icon: 'search', category: 'writing', url: 'writing-tools.html#keywords', keywords: ['keywords','extract'] },

    // Writing Tools
    { id: 12, name: 'Grammar & Spell Checker', description: 'Advanced grammar checking with real-time suggestions', icon: 'spellcheck', category: 'writing', url: 'writing-tools.html#grammar', keywords: ['grammar', 'spell check', 'proofreading', 'writing', 'correction'] },
    { id: 13, name: 'AI Text Summarizer', description: 'Summarize long texts with extractive or abstractive methods', icon: 'summarize', category: 'writing', url: 'writing-tools.html#summarizer', keywords: ['summarize', 'summary', 'condense', 'shorten', 'text'] },
    { id: 14, name: 'Advanced Word Counter', description: 'Count words, characters, sentences, paragraphs', icon: 'numbers', category: 'writing', url: 'writing-tools.html#wordcounter', keywords: ['word count', 'character count', 'counter', 'text analysis'] },
    { id: 15, name: 'Essay Outline Builder', description: 'Create structured outlines for different essay types', icon: 'format_list_bulleted', category: 'writing', url: 'writing-tools.html#outline', keywords: ['outline', 'essay', 'structure', 'writing', 'plan'] },
    { id: 16, name: 'Paraphrasing Tool', description: 'Rewrite text with different levels of paraphrasing', icon: 'sync_alt', category: 'writing', url: 'writing-tools.html#paraphrase', keywords: ['paraphrase', 'rewrite', 'rephrase', 'plagiarism'] },
    { id: 17, name: 'Readability Score', description: 'Analyze text readability with multiple metrics', icon: 'analytics', category: 'writing', url: 'writing-tools.html#readability', keywords: ['readability', 'flesch', 'grade level', 'text analysis'] }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedTools();
    updateStats();
    setupDarkMode();
    setupGlobalSearch();
    setupMobileMenu();
    loadUserData();
    highlightCurrentPage();
});


// Track usage + recent + history, then navigate
function handleToolClick(toolId, url) {
    try {
        if (window.storage) {
            window.storage.incrementUsage?.(toolId);
            window.storage.addToRecent?.(toolId);
            window.storage.addToHistory?.(toolId);
        }
    } catch (e) { /* ignore */ }
    window.location.href = url;
}

// Load featured tools on homepage

function loadFeaturedTools() {
    const featuredContainer = document.getElementById('featuredTools');
    if (!featuredContainer) return;

    const favorites = getFavorites();
    const usage = (window.storage && window.storage.getUsageCounts) ? window.storage.getUsageCounts() : {};
    const sorted = [...tools].sort((a,b) => (usage[b.id]||0) - (usage[a.id]||0));

    // Top 8 by usage count; if all zero, show a sensible default set
    let popular = sorted.filter(t => (usage[t.id]||0) > 0).slice(0, 8);
    if (popular.length < 8) {
        const fallback = [...tools].slice(0, 12); // stable fallback
        const fill = fallback.filter(t => !popular.some(p=>p.id===t.id)).slice(0, 8 - popular.length);
        popular = popular.concat(fill);
    }

    featuredContainer.innerHTML = popular.map(tool => `
        <div class="tool-card" onclick="handleToolClick(${tool.id}, '${tool.url}')">
            <span class="material-icons tool-icon">${tool.icon}</span>
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
            <div class="tool-meta">
                <span class="tool-category">${tool.category}</span>
                <button class="favorite-btn ${favorites.includes(tool.id) ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite(${tool.id})">
                    <span class="material-icons">${favorites.includes(tool.id) ? 'star' : 'star_border'}</span>
                </button>
            </div>
        </div>
    `).join('');
}


// Update stats
function updateStats() {
    const totalTools = document.getElementById('totalTools');
    const todayUsers = document.getElementById('todayUsers');
    
    if (totalTools) {
        totalTools.textContent = tools.length;
    }
    
    if (todayUsers) {
        // Simulate active users (in real app, this would come from analytics)
        const users = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
        todayUsers.textContent = users;
    }
}

// Dark mode setup
function setupDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    // Check for saved preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
        toggle.innerHTML = '<span class="material-icons">light_mode</span>';
    }

    toggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('darkMode', 'false');
            toggle.innerHTML = '<span class="material-icons">dark_mode</span>';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('darkMode', 'true');
            toggle.innerHTML = '<span class="material-icons">light_mode</span>';
        }
    });
}


// Search dropdown helpers
function closeSearchDropdown() {
    const sr = document.getElementById('searchResults');
    if (sr) sr.classList.remove('active');
}
function clearSearchDropdown() {
    const sr = document.getElementById('searchResults');
    if (sr) sr.innerHTML = '';
}

// Global search with enhanced functionality
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    let searchResults = document.getElementById('searchResults');
    if (!searchInput) return;
    // Create dropdown if missing in HTML
    if (!searchResults) {
        searchResults = document.createElement('div');
        searchResults.id = 'searchResults';
        searchResults.className = 'search-results';
        const box = searchInput.closest('.search-box');
        if (box) box.appendChild(searchResults);
    }
    if (!searchResults) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            clearSearchDropdown();
            closeSearchDropdown();
            return;
        }

        searchTimeout = setTimeout(() => {
            // Search in tools
            const results = tools.filter(tool => {
                return tool.name.toLowerCase().includes(query) ||
                       tool.description.toLowerCase().includes(query) ||
                       (tool.keywords && tool.keywords.some(k => k.includes(query)));
            }).slice(0, 8); // Limit to 8 results

            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">No tools found</div>';
            } else {
                searchResults.innerHTML = results.map(tool => `
                    <button class="search-result" type="button"
                        onclick=\"handleToolClick(${tool.id}, '${tool.url}'); document.getElementById('globalSearch').value=''; clearSearchDropdown(); closeSearchDropdown();\">
                        <span class="material-icons">${tool.icon}</span>
                        <span class="sr-text">
                            <strong>${tool.name}</strong>
                            <small>${tool.description}</small>
                        </span>
                        <span class="sr-tag">${tool.category}</span>
                    </button>
                `).join('');
            }
            
            searchResults.classList.add('active');
        }, 300); // Debounce search
    });

    // Close dropdown on outside click / Escape
    document.addEventListener('click', (ev) => {
        const box = searchInput.closest('.search-box');
        if (box && !box.contains(ev.target)) {
            closeSearchDropdown();
        }
    });
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
            closeSearchDropdown();
            searchInput.blur();
        }
    });
    searchInput.addEventListener('blur', () => {
        // small delay so clicking a result still works
        setTimeout(() => closeSearchDropdown(), 120);
    });


    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchResults.classList.remove('active');
            searchInput.blur();
        }
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const items = searchResults.querySelectorAll('.search-result-item');
            if (items.length === 0) return;
            
            const current = document.activeElement;
            let index = Array.from(items).indexOf(current);
            
            if (e.key === 'ArrowDown') {
                index = (index + 1) % items.length;
            } else {
                index = (index - 1 + items.length) % items.length;
            }
            
            items[index].focus();
        }
        
        if (e.key === 'Enter') {
            const firstItem = searchResults.querySelector('.search-result-item');
            if (firstItem) {
                firstItem.click();
            }
        }
    });
}

// Mobile menu
function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuBtn.innerHTML = navMenu.classList.contains('active') 
                ? '<span class="material-icons">close</span>' 
                : '<span class="material-icons">menu</span>';
        });
        
        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuBtn.innerHTML = '<span class="material-icons">menu</span>';
            });
        });
    }
}

// Highlight current page in navigation
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// User data management
function loadUserData() {
    const recentTools = getRecentTools();
    const favorites = getFavorites();
    
    // Update dashboard if we're on dashboard page
    if (window.location.pathname.includes('dashboard')) {
        updateDashboard(recentTools, favorites);
    }
}

// Favorites management
function getFavorites() {
    if (window.storage && window.storage.getFavorites) return window.storage.getFavorites();
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

function getRecentTools() {
    if (window.storage && window.storage.getRecentTools) return window.storage.getRecentTools(20);
    const recent = localStorage.getItem('recentTools');
    return recent ? JSON.parse(recent) : [];
}

function toggleFavorite(toolId) {
    if (window.storage && window.storage.toggleFavorite) {
        window.storage.toggleFavorite(toolId);
    } else {
        const favorites = getFavorites();
        const index = favorites.indexOf(toolId);
        if (index === -1) favorites.push(toolId); else favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
// Refresh displays
    loadFeaturedTools();
    
    // Update all favorite buttons on the page
    document.querySelectorAll(`.favorite-btn`).forEach(btn => {
        const btnToolId = parseInt(btn.closest('[onclick]')?.toString().match(/\d+/) || 
                                 btn.getAttribute('onclick')?.match(/\d+/));
        if (btnToolId === toolId) {
            const icon = btn.querySelector('.material-icons');
            if (icon) {
                icon.textContent = favorites.includes(toolId) ? 'star' : 'star_border';
            }
            btn.classList.toggle('active', favorites.includes(toolId));
        }
    });
    
    // Track favorite action
    trackToolUse(toolId);
}

// Track tool usage
function trackToolUse(toolId) {
    const recent = getRecentTools();
    const newRecent = [toolId, ...recent.filter(id => id !== toolId)].slice(0, 10);
    localStorage.setItem('recentTools', JSON.stringify(newRecent));
    
    // Add to history
    const history = JSON.parse(localStorage.getItem('toolHistory') || '[]');
    history.unshift({
        toolId: toolId,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('toolHistory', JSON.stringify(history.slice(0, 50)));
}

// Report Issue Modal Functions
function openReportModal() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeReportModal() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function submitReport(event) {
    event.preventDefault();
    
    const name = document.getElementById('reportName').value;
    const email = document.getElementById('reportEmail').value;
    const type = document.getElementById('reportType').value;
    const tool = document.getElementById('reportTool').value;
    const message = document.getElementById('reportMessage').value;
    
    // Save report locally
    const reports = JSON.parse(localStorage.getItem('bugReports') || '[]');
    reports.push({
        name,
        email,
        type,
        tool,
        message,
        date: new Date().toISOString(),
        url: window.location.href
    });
    localStorage.setItem('bugReports', JSON.stringify(reports.slice(-20)));
    
    // In production, this would send to a backend
    alert('Thank you for your report! We\'ll look into it.');
    
    closeReportModal();
    event.target.reset();
}


// Help page bug report form (inline)
function submitBugReport(event){
    event.preventDefault();
    const name = document.getElementById('bugName')?.value || '';
    const email = document.getElementById('bugEmail')?.value || '';
    const type = document.getElementById('bugType')?.value || '';
    const tool = document.getElementById('bugTool')?.value || '';
    const message = document.getElementById('bugMsg')?.value || '';

    const reports = JSON.parse(localStorage.getItem('bugReports') || '[]');
    reports.push({ name, email, type, tool, message, date: new Date().toISOString(), url: window.location.href });
    localStorage.setItem('bugReports', JSON.stringify(reports.slice(-50)));

    alert("Thanks! Your report was saved on this device.");
    event.target.reset();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('reportModal');
    if (e.target === modal) {
        closeReportModal();
    }
});

// Initialize everything when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupGlobalSearch();
        highlightCurrentPage();
    });
} else {
    setupGlobalSearch();
    highlightCurrentPage();
}