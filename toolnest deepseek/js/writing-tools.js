// Expand/collapse tool cards
function toggleTool(header) {
    const card = header.closest('.tool-card');
    const content = card?.querySelector('.tool-content');
    const icon = header.querySelector('.expand-icon');
    if (!card || !content) return;

    const isOpen = card.classList.contains('expanded');
    document.querySelectorAll('.tool-card.expanded').forEach(c => {
        if (c !== card) {
            c.classList.remove('expanded');
            const cc = c.querySelector('.tool-content');
            if (cc) cc.style.display = 'none';
            const ii = c.querySelector('.expand-icon');
            if (ii) ii.textContent = 'expand_more';
        }
    });

    if (isOpen) {
        card.classList.remove('expanded');
        content.style.display = 'none';
        if (icon) icon.textContent = 'expand_more';
    } else {
        card.classList.add('expanded');
        content.style.display = 'block';
        if (icon) icon.textContent = 'expand_less';
        // track usage when opened via hash
        try { window.storage?.incrementUsage?.(999); } catch(e){}
    }
}

// Open a tool if URL has #hash
document.addEventListener('DOMContentLoaded', () => {
    const id = (location.hash || '').replace('#','');
    if (!id) return;
    const card = document.getElementById(id);
    if (!card) return;
    const header = card.querySelector('.tool-header');
    const content = card.querySelector('.tool-content');
    if (header && content && !card.classList.contains('expanded')) {
        toggleTool(header);
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});


// Writing Tools Functionality

// ==================== GRAMMAR CHECKER ====================
function checkGrammar() {
    const input = document.getElementById('grammar-input')?.value;
    
    if (!input || input.trim().length === 0) {
        alert('Please enter some text to check');
        return;
    }
    
    const issues = [];
    const suggestions = [];
    let fixedText = input;
    
    // Common grammar rules
    const rules = [
        {
            pattern: /\b(i|ive|id|ill|im)\b/gi,
            replacement: (match) => {
                if (match.toLowerCase() === 'i') return 'I';
                if (match.toLowerCase() === 'ive') return "I've";
                if (match.toLowerCase() === 'id') return "I'd";
                if (match.toLowerCase() === 'ill') return "I'll";
                if (match.toLowerCase() === 'im') return "I'm";
                return match;
            },
            message: 'Personal pronoun "I" should be capitalized'
        },
        {
            pattern: /\b(their|there|they're)\b/gi,
            check: (match, context) => {
                // This is a complex check - simplified version
                return false;
            },
            message: 'Check usage of their/there/they\'re'
        },
        {
            pattern: /\b(your|you're)\b/gi,
            check: (match, context) => {
                // Simplified check
                return false;
            },
            message: 'Check usage of your/you\'re'
        },
        {
            pattern: /\b(its|it's)\b/gi,
            check: (match, context) => {
                // Simplified check
                return false;
            },
            message: 'Check usage of its/it\'s'
        },
        {
            pattern: /\b(effect|affect)\b/gi,
            message: 'Check usage of effect/affect'
        }
    ];
    
    // Check for double spaces
    if (input.includes('  ')) {
        issues.push('Double spaces detected');
        fixedText = fixedText.replace(/\s+/g, ' ');
    }
    
    // Check for missing punctuation at end
    const sentences = input.match(/[^.!?]+[.!?]*/g) || [];
    sentences.forEach((sentence, index) => {
        if (!sentence.match(/[.!?]$/)) {
            issues.push(`Sentence ${index + 1} missing ending punctuation`);
        }
    });
    
    // Check for capitalization at start of sentences
    sentences.forEach((sentence, index) => {
        const trimmed = sentence.trim();
        if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase()) {
            issues.push(`Sentence ${index + 1} should start with capital letter`);
            // Fix it
            const firstChar = trimmed[0].toUpperCase();
            const rest = trimmed.slice(1);
            fixedText = fixedText.replace(trimmed, firstChar + rest);
        }
    });
    
    // Check for common spelling errors (simplified dictionary)
    const commonMisspellings = {
        'teh': 'the',
        'recieve': 'receive',
        'wierd': 'weird',
        'seperate': 'separate',
        'definately': 'definitely',
        'occured': 'occurred',
        'occuring': 'occurring',
        'alot': 'a lot',
        'untill': 'until',
        'thier': 'their',
        'wierd': 'weird',
        'acheive': 'achieve',
        'aquire': 'acquire',
        'calender': 'calendar',
        'cemetary': 'cemetery',
        'concious': 'conscious',
        'embarass': 'embarrass',
        'enviorment': 'environment',
        'excercise': 'exercise',
        'goverment': 'government',
        'grammer': 'grammar',
        'harrass': 'harass',
        'interupt': 'interrupt',
        'knowlege': 'knowledge',
        'liason': 'liaison',
        'libary': 'library',
        'miniscule': 'minuscule',
        'misspell': 'misspell',
        'neccessary': 'necessary',
        'occassion': 'occasion',
        'occurence': 'occurrence',
        'parliment': 'parliament',
        'priviledge': 'privilege',
        'publically': 'publicly',
        'recieve': 'receive',
        'recomend': 'recommend',
        'seperate': 'separate',
        'sieze': 'seize',
        'similer': 'similar',
        'speach': 'speech',
        'successfull': 'successful',
        'tommorow': 'tomorrow',
        'tounge': 'tongue',
        'truely': 'truly',
        'unfortunatly': 'unfortunately',
        'wierd': 'weird'
    };
    
    const words = input.split(/\s+/);
    words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]$/, '');
        if (commonMisspellings[cleanWord]) {
            issues.push(`Possible spelling error: "${word}" should be "${commonMisspellings[cleanWord]}"`);
            suggestions.push({
                original: word,
                suggestion: commonMisspellings[cleanWord]
            });
        }
    });
    
    // Display results
    const resultDiv = document.getElementById('grammar-result');
    const issuesDiv = document.getElementById('grammar-issues');
    const suggestionsDiv = document.getElementById('grammar-suggestions');
    
    if (issues.length === 0) {
        issuesDiv.innerHTML = '<p class="no-issues">✅ No grammar issues found!</p>';
        suggestionsDiv.innerHTML = '';
    } else {
        issuesDiv.innerHTML = '<h4>Issues Found:</h4><ul>' + 
            issues.map(issue => `<li>${issue}</li>`).join('') + 
            '</ul>';
        
        if (suggestions.length > 0) {
            suggestionsDiv.innerHTML = '<h4>Spelling Suggestions:</h4><ul>' + 
                suggestions.map(s => `<li>"${s.original}" → "${s.suggestion}"</li>`).join('') + 
                '</ul>';
        }
    }
    
    resultDiv.style.display = 'block';
    
    // Store fixed text for later
    resultDiv.dataset.fixedText = fixedText;
    
    // Track usage
    if (typeof storage !== 'undefined') {
        storage.addToHistory(13);
    }
}

function clearGrammar() {
    document.getElementById('grammar-input').value = '';
    document.getElementById('grammar-result').style.display = 'none';
}

function applyGrammarFixes() {
    const resultDiv = document.getElementById('grammar-result');
    const fixedText = resultDiv.dataset.fixedText;
    if (fixedText) {
        document.getElementById('grammar-input').value = fixedText;
        alert('Grammar fixes applied!');
    }
}

function copyGrammarResult() {
    const resultDiv = document.getElementById('grammar-result');
    const fixedText = resultDiv.dataset.fixedText;
    if (fixedText) {
        navigator.clipboard.writeText(fixedText).then(() => {
            alert('Fixed text copied to clipboard!');
        });
    }
}

// ==================== TEXT SUMMARIZER (Improved) ====================
function summarizeText() {
    const input = document.getElementById('summarize-input')?.value;
    const length = document.getElementById('summary-length')?.value;
    const style = document.getElementById('summary-style')?.value;
    
    if (!input || input.trim().length === 0) {
        alert('Please enter some text to summarize');
        return;
    }
    
    const wordCount = input.split(/\s+/).length;
    if (wordCount < 20) {
        alert('Please enter at least 20 words for a meaningful summary');
        return;
    }
    
    let summary = '';
    if (length === 'keypoints') {
        summary = generateKeyPoints(input);
    } else {
        summary = generateSummary(input, length, style);
    }
    
    const resultDiv = document.getElementById('summary-result');
    const summaryText = document.getElementById('summary-text');
    const originalLength = document.getElementById('original-length');
    const summaryLength = document.getElementById('summary-length-count');
    const reductionPercent = document.getElementById('reduction-percent');
    
    if (resultDiv) resultDiv.style.display = 'block';
    if (summaryText) summaryText.innerHTML = summary;
    
    const originalWordCount = wordCount;
    const summaryWordCount = summary.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const reduction = ((originalWordCount - summaryWordCount) / originalWordCount * 100).toFixed(1);
    
    if (originalLength) originalLength.textContent = originalWordCount;
    if (summaryLength) summaryLength.textContent = summaryWordCount;
    if (reductionPercent) reductionPercent.textContent = `${reduction}% reduction`;
    
    // Track usage
    if (typeof storage !== 'undefined') {
        storage.addToHistory(7);
    }
}

function generateSummary(text, length, style) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    if (sentences.length <= 3) {
        return text;
    }
    
    // Calculate word frequency for extractive summarization
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'is', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could']);
    
    words.forEach(word => {
        word = word.replace(/[.,!?;:]/, '');
        if (!stopWords.has(word) && word.length > 2) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });
    
    // Score sentences
    const sentenceScores = sentences.map((sentence, index) => {
        const sentenceWords = sentence.toLowerCase().split(/\s+/);
        let score = 0;
        
        sentenceWords.forEach(word => {
            word = word.replace(/[.,!?;:]/, '');
            if (wordFreq[word]) {
                score += wordFreq[word];
            }
        });
        
        // Boost first sentence
        if (index === 0) score *= 1.5;
        
        return { sentence, score, index };
    });
    
    // Sort by score
    sentenceScores.sort((a, b) => b.score - a.score);
    
    // Determine number of sentences based on length
    let targetSentences;
    if (length === 'short') {
        targetSentences = Math.max(2, Math.ceil(sentences.length * 0.25));
    } else if (length === 'medium') {
        targetSentences = Math.max(3, Math.ceil(sentences.length * 0.5));
    } else {
        targetSentences = Math.max(4, Math.ceil(sentences.length * 0.75));
    }
    
    // Select top sentences and sort by original order
    const selectedSentences = sentenceScores
        .slice(0, targetSentences)
        .sort((a, b) => a.index - b.index)
        .map(item => item.sentence);
    
    if (style === 'abstractive') {
        // Simple abstractive: combine and smooth
        return selectedSentences.join(' ').replace(/\s+/g, ' ');
    } else {
        return selectedSentences.join(' ');
    }
}

function generateKeyPoints(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Extract key sentences as bullet points
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    
    words.forEach(word => {
        word = word.replace(/[.,!?;:]/, '');
        if (!stopWords.has(word) && word.length > 3) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });
    
    // Score sentences
    const sentenceScores = sentences.map((sentence, index) => {
        const sentenceWords = sentence.toLowerCase().split(/\s+/);
        let score = 0;
        
        sentenceWords.forEach(word => {
            word = word.replace(/[.,!?;:]/, '');
            if (wordFreq[word]) {
                score += wordFreq[word];
            }
        });
        
        return { sentence, score };
    });
    
    // Sort by score and take top 5
    sentenceScores.sort((a, b) => b.score - a.score);
    const keyPoints = sentenceScores.slice(0, 5).map(item => item.sentence);
    
    return '<ul><li>' + keyPoints.join('</li><li>') + '</li></ul>';
}

function copySummary() {
    const summary = document.getElementById('summary-text')?.innerText;
    if (summary) {
        navigator.clipboard.writeText(summary).then(() => {
            alert('Summary copied to clipboard!');
        });
    }
}

function downloadSummary() {
    const summary = document.getElementById('summary-text')?.innerText;
    if (summary) {
        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'summary.txt';
        a.click();
    }
}

// ==================== WORD COUNTER (Improved) ====================
function updateWordCount() {
    const text = document.getElementById('wordcount-input')?.value || '';
    
    // Word count
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('word-count').textContent = words;
    
    // Character count
    document.getElementById('char-count').textContent = text.length;
    document.getElementById('char-count-no-spaces').textContent = text.replace(/\s/g, '').length;
    
    // Sentence count
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    document.getElementById('sentence-count').textContent = sentences.length;
    
    // Paragraph count
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    document.getElementById('paragraph-count').textContent = paragraphs.length;
    
    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);
    document.getElementById('reading-time').textContent = readingTime || 0;
    
    // Speaking time (average 150 words per minute)
    const speakingTime = Math.ceil(words / 150);
    document.getElementById('speaking-time').textContent = speakingTime || 0;
    
    // Unique words
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/).filter(w => w.length > 0));
    document.getElementById('unique-words').textContent = uniqueWords.size;
    
    // Show word frequency for longer texts
    if (words > 50) {
        showWordFrequency(text);
    } else {
        document.getElementById('word-frequency').style.display = 'none';
    }
    
    // Track usage
    if (text.length > 10 && typeof storage !== 'undefined') {
        storage.addToHistory(8);
    }
}

function showWordFrequency(text) {
    const words = text.toLowerCase().split(/\s+/);
    const freq = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'is', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could']);
    
    words.forEach(word => {
        word = word.replace(/[.,!?;:]/, '');
        if (word.length > 2 && !stopWords.has(word)) {
            freq[word] = (freq[word] || 0) + 1;
        }
    });
    
    // Sort by frequency
    const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    if (sorted.length > 0) {
        const freqDiv = document.getElementById('frequency-list');
        freqDiv.innerHTML = sorted.map(([word, count]) => `
            <div class="freq-item">
                <span class="freq-word">${word}</span>
                <span class="freq-count">${count}</span>
                <div class="freq-bar" style="width: ${(count / sorted[0][1]) * 100}%"></div>
            </div>
        `).join('');
        
        document.getElementById('word-frequency').style.display = 'block';
    }
}

function clearText() {
    document.getElementById('wordcount-input').value = '';
    updateWordCount();
}

function copyText() {
    const text = document.getElementById('wordcount-input')?.value;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Text copied to clipboard!');
        });
    }
}

function downloadText() {
    const text = document.getElementById('wordcount-input')?.value;
    if (text) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'text.txt';
        a.click();
    }
}

// ==================== ESSAY OUTLINE BUILDER (Improved) ====================
let mainPoints = [];

function addMainPoint() {
    const pointsDiv = document.getElementById('main-points');
    const pointInput = document.createElement('div');
    pointInput.className = 'point-input';
    pointInput.innerHTML = `
        <input type="text" class="point" placeholder="Main point ${mainPoints.length + 1}">
        <button class="btn-icon" onclick="addSubPoint(this)" title="Add sub-point">
            <span class="material-icons">add</span>
        </button>
        <button class="btn-icon" onclick="removeMainPoint(this)" title="Remove">
            <span class="material-icons">delete</span>
        </button>
        <div class="sub-points"></div>
    `;
    
    pointsDiv.appendChild(pointInput);
    mainPoints.push([]);
}

function addSubPoint(btn) {
    const pointInput = btn.closest('.point-input');
    const subPointsDiv = pointInput.querySelector('.sub-points');
    
    const subPointInput = document.createElement('div');
    subPointInput.className = 'point-input sub-point';
    subPointInput.innerHTML = `
        <input type="text" placeholder="Sub-point">
        <button class="btn-icon" onclick="removeSubPoint(this)">
            <span class="material-icons">close</span>
        </button>
    `;
    
    subPointsDiv.appendChild(subPointInput);
}

function removeMainPoint(btn) {
    const pointInput = btn.closest('.point-input');
    if (document.querySelectorAll('#main-points > .point-input').length > 1) {
        pointInput.remove();
    } else {
        alert('You need at least one main point');
    }
}

function removeSubPoint(btn) {
    btn.closest('.point-input').remove();
}

function updateOutlineTemplate() {
    const type = document.getElementById('essay-type')?.value;
    const thesisInput = document.getElementById('thesis-statement');
    
    if (type === 'argumentative') {
        thesisInput.placeholder = 'Example: "While some argue that [X], evidence shows that [Y] because [reasons]"';
    } else if (type === 'persuasive') {
        thesisInput.placeholder = 'Example: "[Your position] should be adopted because [reasons]"';
    } else if (type === 'compare') {
        thesisInput.placeholder = 'Example: "Although [A] and [B] share [similarities], they differ in [differences]"';
    } else if (type === 'cause') {
        thesisInput.placeholder = 'Example: "[Event] occurred because [causes], leading to [effects]"';
    }
}

function generateOutline() {
    const topic = document.getElementById('essay-topic')?.value;
    const thesis = document.getElementById('thesis-statement')?.value;
    const introPoints = document.getElementById('intro-points')?.value;
    const conclusionPoints = document.getElementById('conclusion-points')?.value;
    const sources = document.getElementById('sources')?.value;
    const essayType = document.getElementById('essay-type')?.value;
    
    if (!topic || !thesis) {
        alert('Please enter at least a topic and thesis statement');
        return;
    }
    
    let outline = `# ${topic}\n\n`;
    outline += `## Essay Type\n${essayType.replace('-', ' ')}\n\n`;
    outline += `## Thesis Statement\n${thesis}\n\n`;
    
    // Introduction
    outline += `## Introduction\n`;
    if (introPoints) {
        introPoints.split('\n').forEach(point => {
            if (point.trim()) {
                outline += `- ${point.trim()}\n`;
            }
        });
    } else {
        outline += `- Hook/Attention grabber\n`;
        outline += `- Background information\n`;
        outline += `- Thesis statement\n`;
    }
    outline += `\n`;
    
    // Body paragraphs
    outline += `## Body Paragraphs\n\n`;
    
    const pointInputs = document.querySelectorAll('#main-points > .point-input');
    pointInputs.forEach((input, index) => {
        const mainPoint = input.querySelector('input.point')?.value;
        if (mainPoint) {
            outline += `### Paragraph ${index + 1}: ${mainPoint}\n`;
            
            const subPoints = input.querySelectorAll('.sub-points .point-input input');
            if (subPoints.length > 0) {
                subPoints.forEach((sub, subIndex) => {
                    if (sub.value) {
                        outline += `- ${sub.value}\n`;
                    }
                });
            } else {
                outline += `- Topic sentence\n`;
                outline += `- Supporting evidence/example\n`;
                outline += `- Analysis/explanation\n`;
                outline += `- Transition to next point\n`;
            }
            outline += `\n`;
        }
    });
    
    // Conclusion
    outline += `## Conclusion\n`;
    if (conclusionPoints) {
        conclusionPoints.split('\n').forEach(point => {
            if (point.trim()) {
                outline += `- ${point.trim()}\n`;
            }
        });
    } else {
        outline += `- Restate thesis in new words\n`;
        outline += `- Summarize main points\n`;
        outline += `- Final thought/call to action\n`;
    }
    outline += `\n`;
    
    // Sources
    if (sources && sources.trim()) {
        outline += `## References\n`;
        sources.split('\n').forEach(source => {
            if (source.trim()) {
                outline += `- ${source.trim()}\n`;
            }
        });
    }
    
    const resultDiv = document.getElementById('outline-result');
    const outlineContent = document.getElementById('outline-content');
    
    if (resultDiv) resultDiv.style.display = 'block';
    if (outlineContent) outlineContent.textContent = outline;
    
    // Track usage
    if (typeof storage !== 'undefined') {
        storage.addToHistory(9);
    }
}

function copyOutline() {
    const outline = document.getElementById('outline-content')?.textContent;
    if (outline) {
        navigator.clipboard.writeText(outline).then(() => {
            alert('Outline copied to clipboard!');
        });
    }
}

function downloadOutline() {
    const outline = document.getElementById('outline-content')?.textContent;
    const topic = document.getElementById('essay-topic')?.value || 'outline';
    
    if (outline) {
        const blob = new Blob([outline], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic.replace(/\s+/g, '_')}_outline.txt`;
        a.click();
    }
}

function exportToWord() {
    const outline = document.getElementById('outline-content')?.textContent;
    const topic = document.getElementById('essay-topic')?.value || 'outline';
    
    if (outline) {
        const html = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        h1 { color: #0984e3; }
                        h2 { color: #2d3436; margin-top: 20px; }
                        h3 { color: #636e72; margin-left: 20px; }
                        ul { margin-left: 40px; }
                    </style>
                </head>
                <body>
                    <h1>${topic}</h1>
                    <pre style="font-family: inherit;">${outline}</pre>
                </body>
            </html>
        `;
        
        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic.replace(/\s+/g, '_')}_outline.doc`;
        a.click();
    }
}

// ==================== PARAPHRASING TOOL ====================
function paraphraseText() {
    const input = document.getElementById('paraphrase-input')?.value;
    const level = document.getElementById('paraphrase-level')?.value;
    
    if (!input || input.trim().length === 0) {
        alert('Please enter some text to paraphrase');
        return;
    }
    
    // Simple synonym replacement
    const synonyms = {
        'good': ['excellent', 'great', 'wonderful', 'superb'],
        'bad': ['poor', 'terrible', 'awful', 'dreadful'],
        'important': ['crucial', 'vital', 'essential', 'significant'],
        'big': ['large', 'huge', 'enormous', 'massive'],
        'small': ['tiny', 'little', 'miniature', 'compact'],
        'happy': ['pleased', 'delighted', 'joyful', 'content'],
        'sad': ['unhappy', 'miserable', 'depressed', 'downcast'],
        'angry': ['furious', 'annoyed', 'irritated', 'enraged'],
        'interesting': ['fascinating', 'engaging', 'captivating', 'intriguing'],
        'boring': ['dull', 'tedious', 'monotonous', 'uninteresting'],
        'difficult': ['hard', 'challenging', 'tough', 'arduous'],
        'easy': ['simple', 'effortless', 'straightforward', 'uncomplicated'],
        'beautiful': ['lovely', 'attractive', 'gorgeous', 'stunning'],
        'ugly': ['unattractive', 'hideous', 'unsightly', 'grotesque'],
        'fast': ['quick', 'rapid', 'swift', 'speedy'],
        'slow': ['sluggish', 'leisurely', 'unhurried', 'gradual'],
        'new': ['recent', 'modern', 'contemporary', 'latest'],
        'old': ['ancient', 'aged', 'elderly', 'vintage'],
        'rich': ['wealthy', 'affluent', 'prosperous', 'well-off'],
        'poor': ['impoverished', 'needy', 'destitute', 'penniless']
    };
    
    let paraphrased = input;
    
    if (level === 'light') {
        // Simple synonym replacement
        const words = input.split(/\s+/);
        paraphrased = words.map(word => {
            const cleanWord = word.toLowerCase().replace(/[.,!?;:]$/, '');
            if (synonyms[cleanWord] && Math.random() > 0.7) {
                const punct = word.match(/[.,!?;:]+$/) || '';
                return synonyms[cleanWord][Math.floor(Math.random() * synonyms[cleanWord].length)] + punct;
            }
            return word;
        }).join(' ');
    } else if (level === 'medium') {
        // Restructure sentences
        const sentences = input.match(/[^.!?]+[.!?]+/g) || [input];
        paraphrased = sentences.map(sentence => {
            // Simple passive/active voice changes
            if (sentence.includes(' is ') && Math.random() > 0.5) {
                return sentence.replace(' is ', ' can be ');
            }
            return sentence;
        }).join(' ');
    } else {
        // Heavy paraphrasing - more aggressive changes
        const sentences = input.match(/[^.!?]+[.!?]+/g) || [input];
        paraphrased = sentences.map(sentence => {
            // Swap first and second half occasionally
            if (sentence.split(' ').length > 8 && Math.random() > 0.5) {
                const words = sentence.split(' ');
                const mid = Math.floor(words.length / 2);
                return words.slice(mid).join(' ') + ' ' + words.slice(0, mid).join(' ');
            }
            return sentence;
        }).join(' ');
    }
    
    const resultDiv = document.getElementById('paraphrase-result');
    const paraphraseText = document.getElementById('paraphrase-text');
    
    resultDiv.style.display = 'block';
    paraphraseText.textContent = paraphrased;
    
    // Track usage
    if (typeof storage !== 'undefined') {
        storage.addToHistory(14);
    }
}

function copyParaphrase() {
    const text = document.getElementById('paraphrase-text')?.textContent;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Paraphrased text copied to clipboard!');
        });
    }
}

function acceptParaphrase() {
    const paraphrased = document.getElementById('paraphrase-text')?.textContent;
    if (paraphrased) {
        document.getElementById('paraphrase-input').value = paraphrased;
        document.getElementById('paraphrase-result').style.display = 'none';
    }
}

// ==================== READABILITY SCORE ====================
function checkReadability() {
    const text = document.getElementById('readability-input')?.value;
    
    if (!text || text.trim().length < 50) {
        alert('Please enter at least 50 words for accurate readability analysis');
        return;
    }
    
    const words = text.split(/\s+/).length;
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length || 1;
    const syllables = countSyllables(text);
    
    // Flesch Reading Ease
    const fleschScore = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    document.getElementById('flesch-score').textContent = Math.round(fleschScore * 10) / 10;
    
    let fleschDesc = '';
    if (fleschScore >= 90) fleschDesc = 'Very Easy (5th grade)';
    else if (fleschScore >= 80) fleschDesc = 'Easy (6th grade)';
    else if (fleschScore >= 70) fleschDesc = 'Fairly Easy (7th grade)';
    else if (fleschScore >= 60) fleschDesc = 'Standard (8th-9th grade)';
    else if (fleschScore >= 50) fleschDesc = 'Fairly Difficult (10th-12th grade)';
    else if (fleschScore >= 30) fleschDesc = 'Difficult (College)';
    else fleschDesc = 'Very Difficult (College Graduate)';
    
    document.getElementById('flesch-desc').textContent = fleschDesc;
    
    // Flesch-Kincaid Grade Level
    const fkGrade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    document.getElementById('fk-grade').textContent = Math.round(fkGrade * 10) / 10;
    
    // Gunning Fog Index
    const complexWords = countComplexWords(text);
    const fogIndex = 0.4 * ((words / sentences) + 100 * (complexWords / words));
    document.getElementById('fog-index').textContent = Math.round(fogIndex * 10) / 10;
    
    // Coleman-Liau Index
    const letters = text.replace(/[^a-zA-Z]/g, '').length;
    const colemanIndex = 0.0588 * (letters / words * 100) - 0.296 * (sentences / words * 100) - 15.8;
    document.getElementById('coleman-index').textContent = Math.max(0, Math.round(colemanIndex * 10) / 10);
    
    // Recommendations
    const recommendation = document.getElementById('readability-recommendation');
    let recText = '';
    
    if (fkGrade > 12) {
        recText = '⚠️ This text is quite complex. Consider using shorter sentences and simpler words for better readability.';
    } else if (fkGrade > 8) {
        recText = '📚 This text has moderate complexity. It should be understandable to high school students.';
    } else {
        recText = '✅ This text is easy to read and should be accessible to most audiences.';
    }
    
    recommendation.textContent = recText;
    
    document.getElementById('readability-result').style.display = 'block';
    
    // Track usage
    if (typeof storage !== 'undefined') {
        storage.addToHistory(15);
    }
}

function countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;
    
    words.forEach(word => {
        word = word.replace(/[^a-z]/g, '');
        const syls = word.match(/[aeiouy]{1,2}/g);
        count += syls ? syls.length : 1;
    });
    
    return count;
}

function countComplexWords(text) {
    const words = text.split(/\s+/);
    let complex = 0;
    
    words.forEach(word => {
        if (word.length > 6) complex++;
    });
    
    return complex;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set up word counter real-time updates
    const wordInput = document.getElementById('wordcount-input');
    if (wordInput) {
        wordInput.addEventListener('input', updateWordCount);
    }
    
    // Add first main point for outline builder
    if (document.getElementById('main-points')) {
        addMainPoint();
    }
    
    // Set up outline template
    updateOutlineTemplate();
});