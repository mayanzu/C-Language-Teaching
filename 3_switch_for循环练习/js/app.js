// 练习应用主逻辑
class PracticeApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswered = false;
        this.currentCodeText = '';
        
        // 缓存常用正则表达式以提高性能
        this.regexCache = {
            cTag: /<C>([\s\S]*?)<\/C>/g,
            markdownCode: /```(\w*)\n([\s\S]*?)\n```/g,
            markdownCodeExtract: /```\w*\n([\s\S]*?)\n```/,
            newline: /\n/g,
            tab: /\t/g
        };
        
        // 初始化DOM元素
        this.initializeElements();
        
        // 添加缺失的DOM元素引用
        if (!this.elements.codeLanguageLabel) {
            this.elements.codeLanguageLabel = document.getElementById('code-language-label');
        }
        // 绑定事件
        this.bindEvents();
        // 开始应用
        this.start();
    }

    // 初始化DOM元素
    initializeElements() {
        this.elements = {
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            submitBtn: document.getElementById('submit-btn'),
            nextBtn: document.getElementById('next-btn'),
            restartBtn: document.getElementById('restart-btn'),
            feedbackContainer: document.getElementById('feedback-container'),
            feedback: document.getElementById('feedback'),
            codeExample: document.getElementById('code-example'),
            codeExampleContainer: document.getElementById('code-example-container'),
            codeLanguageLabel: document.getElementById('code-language-label'),
            copyBtn: document.getElementById('copy-btn'),
            currentQuestionSpan: document.getElementById('current-question'),
            totalQuestionsSpan: document.getElementById('total-questions'),
            scoreSpan: document.getElementById('score'),
            title: document.querySelector('title'),
            headerTitle: document.querySelector('header h1'),
            // 题目导航相关元素
            questionList: document.getElementById('question-list'),
            toggleLeftNav: document.getElementById('toggle-left-nav'),
            toggleRightNav: document.getElementById('toggle-right-nav'),
            prevQuestionBtn: document.getElementById('prev-question-btn'),
            nextQuestionBtn: document.getElementById('next-question-btn'),
            randomQuestionBtn: document.getElementById('random-question-btn'),
            firstQuestionBtn: document.getElementById('first-question-btn'),
            lastQuestionBtn: document.getElementById('last-question-btn'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            leftNav: document.querySelector('.left-nav'),
            rightNav: document.querySelector('.right-nav')
        };
        
        // 题目导航状态
        this.questionStates = []; // 存储每个题目的状态 (未答/正确/错误)
        this.isLeftNavCollapsed = false;
        this.isRightNavCollapsed = false;
    }

    // 绑定事件
    bindEvents() {
        this.elements.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.elements.restartBtn.addEventListener('click', () => this.restart());
        this.elements.copyBtn.addEventListener('click', () => this.copyCode());
        
        // 题目导航事件
        this.elements.toggleLeftNav.addEventListener('click', () => this.toggleLeftNav());
        this.elements.toggleRightNav.addEventListener('click', () => this.toggleRightNav());
        this.elements.prevQuestionBtn.addEventListener('click', () => this.goToPrevQuestion());
        this.elements.nextQuestionBtn.addEventListener('click', () => this.goToNextQuestion());
        this.elements.randomQuestionBtn.addEventListener('click', () => this.goToRandomQuestion());
        this.elements.firstQuestionBtn.addEventListener('click', () => this.goToFirstQuestion());
        this.elements.lastQuestionBtn.addEventListener('click', () => this.goToLastQuestion());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.goToPrevQuestion();
            } else if (e.key === 'ArrowRight') {
                this.goToNextQuestion();
            }
        });
    }

    // 开始应用
    async start() {
        try {
            // 显示加载状态
            this.elements.questionText.textContent = '正在加载题目...';
            
            // 加载题库数据
            this.questions = await window.templateLoader.loadQuestions();
            
            if (this.questions.length === 0) {
                this.showError('题库数据为空或加载失败，请检查 data/questions.json 文件');
                return;
            }

            // 验证题库数据
        try {
            if (window.templateLoader && typeof window.templateLoader.validateQuestions === 'function') {
                window.templateLoader.validateQuestions(this.questions);
            }
        } catch (error) {
            this.showError(`题库数据格式错误: ${error.message}`);
            return;
        }

            // 更新页面标题和统计信息
            this.updatePageTitle();
            this.elements.totalQuestionsSpan.textContent = this.questions.length;
            
            // 初始化题目状态
            this.questionStates = new Array(this.questions.length).fill('unanswered');
            
            // 生成题目导航列表
            this.generateQuestionList();
            
            // 显示第一题
            this.showQuestion(0);
            
        } catch (error) {
            console.error('应用启动失败:', error);
            this.showError('应用启动失败，请检查控制台错误信息');
        }
    }

    // 更新页面标题
    updatePageTitle() {
        const stats = window.templateLoader.getQuestionStats();
        const title = `C语言switch和for循环练习 - ${stats.total} 道题目`;
        this.elements.title.textContent = title;
        this.elements.headerTitle.textContent = title;
    }

    // 显示题目
    showQuestion(index) {
        if (index >= this.questions.length) {
            this.showFinalResults();
            return;
        }

        const question = this.questions[index];
        this.currentQuestionIndex = index;
        this.isAnswered = false;
        this.selectedAnswer = null;

        // 更新题目信息
        this.elements.currentQuestionSpan.textContent = index + 1;
        
        // 处理题目描述中的代码块（markdown格式转换为格式化代码）
        const formattedQuestion = this.formatQuestionText(`${question.id}. ${question.question}`);
        this.elements.questionText.innerHTML = formattedQuestion;

        // 清空并生成选项
        this.elements.optionsContainer.innerHTML = '';
        
        // 处理不同格式的选项数据（支持数组和对象两种格式）
        let optionsEntries = [];
        if (Array.isArray(question.options)) {
            // 如果是数组格式，将索引转换为字母标签A, B, C, D...
            optionsEntries = question.options.map((value, index) => {
                const letter = String.fromCharCode(65 + index); // 65是'A'的ASCII码
                return [letter, value];
            });
        } else {
            // 如果是对象格式，保持原有的键值对
            optionsEntries = Object.entries(question.options);
        }
        
        // 生成选项
        optionsEntries.forEach(([key, value]) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.dataset.option = key;
            // 对选项内容也应用代码块高亮处理
            const formattedOption = this.formatTextWithCodeBlocks(value);
            optionDiv.innerHTML = `<span class="option-label">${key}.</span>${formattedOption}`;
            optionDiv.addEventListener('click', () => this.selectOption(key, optionDiv));
            this.elements.optionsContainer.appendChild(optionDiv);
        });

        // 隐藏反馈和代码示例
        this.elements.feedbackContainer.style.display = 'none';
        
        // 重置按钮状态
        this.elements.submitBtn.style.display = 'inline-block';
        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.textContent = '提交答案';
        this.elements.nextBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'none';
        
        // 更新当前题目高亮
        this.updateCurrentQuestionHighlight();
    }

    // 选择选项
    selectOption(option, element) {
        if (this.isAnswered) return;

        // 移除之前的选择
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // 添加当前选择
        element.classList.add('selected');
        this.selectedAnswer = option;
        this.elements.submitBtn.disabled = false;
    }

    // 提交答案
    submitAnswer() {
        if (!this.selectedAnswer || this.isAnswered) return;

        this.isAnswered = true;
        const question = this.questions[this.currentQuestionIndex];
        
        // 处理答案验证：如果选项是数组格式且selectedAnswer是字母，需要转换为数字索引进行比较
        let userAnswerIndex = this.selectedAnswer;
        if (Array.isArray(question.options) && isNaN(parseInt(this.selectedAnswer))) {
            // 将字母A/B/C/D转换为数字索引0/1/2/3
            userAnswerIndex = this.selectedAnswer.charCodeAt(0) - 65;
        }
        
        const isCorrect = userAnswerIndex == question.correctAnswer;

        // 更新题目状态
        this.updateQuestionState(this.currentQuestionIndex, isCorrect ? 'correct' : 'incorrect');

        // 更新分数
        if (isCorrect) {
            this.score++;
            this.elements.scoreSpan.textContent = this.score;
        }

        // 显示正确答案和错误答案
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.add('disabled');
            
            // 处理正确答案比较：如果选项是字母格式，需要将数字索引转换为字母
            let correctAnswerValue = question.correctAnswer;
            if (Array.isArray(question.options) && !isNaN(parseInt(question.correctAnswer))) {
                correctAnswerValue = String.fromCharCode(65 + parseInt(question.correctAnswer));
            }
            
            if (opt.dataset.option === correctAnswerValue) {
                opt.classList.add('correct');
            } else if (opt.dataset.option === this.selectedAnswer && !isCorrect) {
                opt.classList.add('incorrect');
            }
        });

        // 显示反馈
        this.elements.feedbackContainer.style.display = 'block';
        this.elements.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        // 对反馈内容中的代码块也应用高亮
        const formattedExplanation = this.formatTextWithCodeBlocks(question.explanation);
        const formattedCorrectOption = this.formatTextWithCodeBlocks(question.options[question.correctAnswer]);
        
        // 将正确答案数字索引转换为字母标签
        let correctAnswerLabel = question.correctAnswer;
        if (Array.isArray(question.options) && !isNaN(parseInt(question.correctAnswer))) {
            correctAnswerLabel = String.fromCharCode(65 + parseInt(question.correctAnswer));
        }
        
        this.elements.feedback.innerHTML = `
            <h3>${isCorrect ? '✓ 回答正确！' : '✗ 回答错误'}</h3>
            <p><strong>正确答案：</strong>${correctAnswerLabel}. ${formattedCorrectOption}</p>
            <p><strong>解析：</strong>${formattedExplanation}</p>
        `;

        // 显示代码示例
        this.currentCodeText = question.codeExample;
        
        // 提取代码块内容（移除markdown标记）
        const codeBlockMatch = this.currentCodeText.match(/```(?:\w+)?\n?([\s\S]*?)```/);
        const codeContent = codeBlockMatch ? codeBlockMatch[1] : this.currentCodeText;
        
        // 确保头文件正确处理，避免被错误格式化
        // 使用更精确的正则表达式处理#include语句
        const processedCode = codeContent.replace(/#include\s*<([^>]+)>/g, '#include <$1>');
        
        // 检测语言并设置标签
        const language = this.detectCodeLanguage(processedCode);
        this.elements.codeLanguageLabel.textContent = language.toUpperCase();
        
        // 应用语法高亮，保留原始缩进
        const highlightedCode = this.applySyntaxHighlighting(processedCode, language);
        
        // 直接设置代码内容，不添加额外的行号或格式
        this.elements.codeExample.innerHTML = highlightedCode;

        // 更新按钮
        this.elements.submitBtn.style.display = 'none';
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.elements.nextBtn.style.display = 'inline-block';
        } else {
            this.elements.restartBtn.style.display = 'inline-block';
        }
    }

    // 格式化文本中的代码块（处理markdown格式、<C>标签格式和普通代码片段）
    formatTextWithCodeBlocks(text) {
        if (!text || typeof text !== 'string') return text || '';
        
        let processedText = text;
        
        // 1. 处理<C>标签格式的代码块
        // 先提取<C>标签代码块，避免在处理过程中被其他逻辑影响
        const cTagBlocks = [];
        processedText = processedText.replace(this.regexCache.cTag, (match, code) => {
            const placeholder = `C_TAG_BLOCK_${cTagBlocks.length}`;
            // 对于<C>标签，我们明确将其识别为C语言代码
            const language = 'c';
            // 移除代码中的换行符，避免在后续处理中被转换为<br>
            const codeWithoutNewlines = code.replace(/\n/g, ' ');
            const formattedCode = codeWithoutNewlines.replace(this.regexCache.tab, '    ').trim();
            const highlightedCode = this.applySyntaxHighlighting(formattedCode, language);
            
            const codeBlock = `<div class="code-example-container">
                    <div class="code-example-header">
                        <span class="code-language-label">${language.toUpperCase()}</span>
                    </div>
                    <pre class="code-with-line-numbers"><code>${highlightedCode}</code></pre>
                </div>`;
            
            cTagBlocks.push({ placeholder, content: codeBlock });
            return placeholder;
        });
        
        // 2. 处理markdown格式的代码块
        processedText = processedText.replace(this.regexCache.markdownCode, (match, language, code) => {
            const detectedLanguage = this.detectCodeLanguage(code.trim()) || language || 'c';
            const formattedCode = code.replace(this.regexCache.tab, '    ').trim();
            const highlightedCode = this.applySyntaxHighlighting(formattedCode, detectedLanguage);
            
            return `<div class="code-example-container">
                    <div class="code-example-header">
                        <span class="code-language-label">${detectedLanguage.toUpperCase()}</span>
                    </div>
                    <pre class="code-with-line-numbers"><code>${highlightedCode}</code></pre>
                </div>`;
        });
        
        // 3. 为普通文本中的代码片段添加简单高亮（适用于题干中的内联代码）
        // 预编译正则表达式以提高性能
        if (!this.regexCache.inlineCodeRegex) {
            // 优化关键字列表，只包含最常用的C语言关键字和函数
            const cKeywords = ['int', 'char', 'float', 'double', 'if', 'else', 'while', 'for', 
                             'return', 'void', 'switch', 'case', 'default', 'break', 'printf', 'scanf'];
            
            // 优化正则表达式，减少捕获组数量，提高执行效率
            this.regexCache.inlineCodeRegex = new RegExp(`\\b(${cKeywords.join('|')})\\b|(\\w+)\\s*\\(|\"([^\"]*)\"`, 'g');
        }
        
        // 性能优化：只对真正需要高亮的文本进行处理，避免不必要的DOM操作
        // 使用字符串处理方式代替复杂的DOM遍历，提高性能
        
        // 先提取已经格式化的代码块和<C>标签占位符，避免重复处理
        const codeBlockPlaceholders = [];
        let tempText = processedText;
        
        // 替换已格式化的代码块为临时标记
        tempText = tempText.replace(/<div class="code-example-container">[\s\S]*?<\/div>/g, (match) => {
            const placeholder = `CODE_BLOCK_PLACEHOLDER_${codeBlockPlaceholders.length}`;
            codeBlockPlaceholders.push({ placeholder, content: match });
            return placeholder;
        });
        
        // 替换<C>标签占位符为临时标记
        tempText = tempText.replace(/C_TAG_BLOCK_\d+/g, (match) => {
            const placeholder = `C_TAG_PLACEHOLDER_${codeBlockPlaceholders.length}`;
            codeBlockPlaceholders.push({ placeholder, content: match });
            return placeholder;
        });
        
        // 对剩余文本应用内联代码高亮
        tempText = tempText.replace(this.regexCache.inlineCodeRegex, (match, keyword, func, str) => {
            if (keyword) {
                return `<span class="code-keyword">${keyword}</span>`;
            } else if (func) {
                // 处理函数名，保留括号
                return `<span class="code-function">${func}</span>(`;
            } else if (str !== undefined) {
                return `<span class="code-string">"${str}"</span>`;
            }
            return match;
        });
        
        // 恢复已格式化的代码块和<C>标签占位符
        codeBlockPlaceholders.forEach(({ placeholder, content }) => {
            tempText = tempText.replace(placeholder, content);
        });
        
        processedText = tempText;
        
        // 4. 处理换行符转换为<br>标签
        // 先提取所有代码块和<C>标签占位符，避免在代码块内部添加<br>标签
        const allCodeBlocks = [];
        let finalText = processedText;
        
        // 替换所有代码块为临时标记
        finalText = finalText.replace(/<div class="code-example-container">[\s\S]*?<\/div>/g, (match) => {
            const placeholder = `FINAL_CODE_BLOCK_${allCodeBlocks.length}`;
            allCodeBlocks.push({ placeholder, content: match });
            return placeholder;
        });
        
        // 替换<C>标签占位符为临时标记
        finalText = finalText.replace(/C_TAG_BLOCK_\d+/g, (match) => {
            const placeholder = `FINAL_C_TAG_BLOCK_${allCodeBlocks.length}`;
            allCodeBlocks.push({ placeholder, content: match });
            return placeholder;
        });
        
        // 只对非代码块部分应用换行符转换
        finalText = finalText.replace(this.regexCache.newline, '<br>');
        
        // 5. 恢复所有代码块
        allCodeBlocks.forEach(({ placeholder, content }) => {
            finalText = finalText.replace(placeholder, content);
        });
        
        // 6. 恢复<C>标签代码块
        cTagBlocks.forEach(({ placeholder, content }) => {
            finalText = finalText.replace(placeholder, content);
        });
        
        // 7. 清理连续的<br>标签，避免在代码块前后出现多余的空行
        finalText = finalText.replace(/(<br>\s*){2,}/g, '<br>');
        
        return finalText;
    }
    
    // 格式化题目文本
    formatQuestionText(questionText) {
        return this.formatTextWithCodeBlocks(questionText);
    }

    // 检测代码语言
    detectCodeLanguage(codeText) {
        if (!codeText || typeof codeText !== 'string') return 'c';
        
        // 为常见模式创建简单的正则表达式，提高检测准确性
        const patterns = {
            c: /#include|#define|int\s+main\s*\(|printf|scanf|stdlib\.h/i,
            javascript: /function|var\s+|let\s+|const\s+|console\.log/i,
            python: /def\s+|import\s+|print\s*\(|if\s+__name__/i,
            java: /public\s+class|System\.out\.println|public\s+static\s+void\s+main/i
        };
        
        // 按照优先级检测语言
        for (const [language, pattern] of Object.entries(patterns)) {
            if (pattern.test(codeText)) {
                return language;
            }
        }
        
        // 默认为C语言（因为这是C语言练习系统）
        return 'c';
    }

    // 格式化并高亮代码
    formatAndHighlightCode(codeText, language) {
        // 标准化缩进（将tab转换为4个空格）
        const formattedCode = codeText.replace(/\t/g, '    ');
        
        // 应用语言特定的语法高亮
        const highlightedCode = this.applySyntaxHighlighting(formattedCode, language);
        
        // 设置代码内容，使用完整的代码容器结构
        this.elements.codeExample.innerHTML = `<div class="code-example-container">
                <div class="code-example-header">
                    <span class="code-language-label">${language.toUpperCase()}</span>
                </div>
                <pre class="code-with-line-numbers"><code>${highlightedCode}</code></pre>
            </div>`;
    }

    // 应用语法高亮
    applySyntaxHighlighting(code, language) {
        switch (language) {
            case 'c':
                return this.highlightCCode(code);
            case 'javascript':
                return this.highlightJavaScript(code);
            case 'python':
                return this.highlightPython(code);
            case 'java':
                return this.highlightJava(code);
            default:
                return this.highlightCCode(code);
        }
    }

    // C语言语法高亮
    highlightCCode(code) {
        if (!code || typeof code !== 'string') return '';
        
        // 初始化缓存的正则表达式（如果尚未初始化）
        if (!this.regexCache.keywordsRegex) {
            const keywords = ['int', 'char', 'float', 'double', 'if', 'else', 'while', 'for', 
                             'return', 'void', 'sizeof', 'struct', 'enum', 'typedef', 'unsigned', 'signed',
                             'long', 'short', 'static', 'const', 'extern', 'auto', 'register', 
                             'switch', 'case', 'default', 'break'];
            this.regexCache.keywordsRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
        }
        
        if (!this.regexCache.typesRegex) {
            const types = ['int', 'char', 'float', 'double', 'void'];
            this.regexCache.typesRegex = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
        }
        
        if (!this.regexCache.functionCallRegex) {
            this.regexCache.functionCallRegex = /(\w+)(?=\s*\()(?![^<]*>)/g;
        }
        
        // 使用更安全的处理方式，避免重复替换
        let highlighted = code;
        
        // 1. 先处理字符串，避免与其他规则冲突
        highlighted = highlighted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="code-string">"$1"</span>');
        
        // 2. 处理注释
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="code-comment">$&</span>');
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="code-comment">$&</span>');
        
        // 3. 特别处理头文件include语句
        highlighted = highlighted.replace(/(#include)\s*<([^>]+)>/g, '<span class="code-macro">$1</span> &lt;<span class="code-include">$2</span>&gt;');
        
        // 4. 处理其他预处理指令
        highlighted = highlighted.replace(/(#\w+)(?!include)/g, '<span class="code-macro">$1</span>');
        
        // 5. 数字
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>');
        
        // 6. 类型（优先级高于关键字）
        highlighted = highlighted.replace(this.regexCache.typesRegex, '<span class="code-type">$1</span>');
        
        // 7. 关键字
        highlighted = highlighted.replace(this.regexCache.keywordsRegex, '<span class="code-keyword">$1</span>');
        
        // 8. 函数调用 - 使用更精确的正则表达式，避免匹配HTML标签内的内容
        highlighted = highlighted.replace(this.regexCache.functionCallRegex, '<span class="code-function">$1</span>');
        
        return highlighted;
    }

    // JavaScript语法高亮（简化版）
    highlightJavaScript(code) {
        let highlighted = code;
        
        // 关键字
        const keywords = ['function', 'var', 'let', 'const', 'if', 'else', 'while', 'for', 
                         'return', 'true', 'false', 'null', 'undefined', 'this', 'new', 'class'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="code-keyword">${keyword}</span>`);
        });
        
        // 字符串
        highlighted = highlighted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="code-string">"$1"</span>');
        highlighted = highlighted.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '<span class="code-string">\'$1\'</span>');
        
        // 注释
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="code-comment">$&</span>');
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="code-comment">$&</span>');
        
        return highlighted;
    }

    // Python语法高亮（简化版）
    highlightPython(code) {
        let highlighted = code;
        
        // 关键字
        const keywords = ['def', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 
                         'from', 'as', 'class', 'try', 'except', 'finally', 'with', 'in', 'not', 'and', 'or'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="code-keyword">${keyword}</span>`);
        });
        
        // 字符串
        highlighted = highlighted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="code-string">"$1"</span>');
        highlighted = highlighted.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '<span class="code-string">\'$1\'</span>');
        
        // 注释
        highlighted = highlighted.replace(/#.*$/gm, '<span class="code-comment">$&</span>');
        
        return highlighted;
    }

    // Java语法高亮（简化版）
    highlightJava(code) {
        let highlighted = code;
        
        // 关键字
        const keywords = ['public', 'private', 'protected', 'static', 'final', 'void', 'int', 'char', 
                         'float', 'double', 'boolean', 'if', 'else', 'while', 'for', 'return', 'class', 
                         'interface', 'extends', 'implements', 'try', 'catch', 'finally', 'throw', 'throws'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="code-keyword">${keyword}</span>`);
        });
        
        // 字符串
        highlighted = highlighted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="code-string">"$1"</span>');
        
        // 注释
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="code-comment">$&</span>');
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="code-comment">$&</span>');
        
        return highlighted;
    }

    // 下一题
    nextQuestion() {
        this.showQuestion(this.currentQuestionIndex + 1);
    }

    // 重新开始
    restart() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.elements.scoreSpan.textContent = this.score;
        this.showQuestion(0);
    }

    // 显示最终结果
    showFinalResults() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        this.elements.questionText.textContent = '练习完成！';
        this.elements.optionsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #667eea; margin-bottom: 20px;">你的得分</h2>
                <div style="font-size: 3em; color: #667eea; margin: 20px 0;">${this.score} / ${this.questions.length}</div>
                <div style="font-size: 1.5em; color: #6c757d; margin-bottom: 30px;">正确率: ${percentage}%</div>
                <p style="color: #6c757d; line-height: 1.8;">
                    ${percentage >= 90 ? '🎉 优秀！你掌握得很好！' : 
                      percentage >= 70 ? '👍 不错！继续加油！' : 
                      '💪 继续努力，多练习会更好！'}
                </p>
            </div>
        `;
        this.elements.feedbackContainer.style.display = 'none';
        this.elements.submitBtn.style.display = 'none';
        this.elements.nextBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        this.elements.restartBtn.textContent = '重新开始';
    }

    // 复制代码
    copyCode() {
        // 获取原始代码文本，避免复制HTML标签
        let code = '';
        if (this.currentCodeText) {
            // 从currentCodeText中提取纯文本代码
            if (this.currentCodeText.includes('```')) {
                const match = this.currentCodeText.match(this.regexCache.markdownCodeExtract);
                if (match) {
                    code = match[1];
                } else {
                    code = this.currentCodeText;
                }
            } else {
                code = this.currentCodeText;
            }
        } else if (this.elements && this.elements.codeExample) {
            code = this.elements.codeExample.textContent;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            const originalText = this.elements.copyBtn.textContent;
            this.elements.copyBtn.textContent = '已复制！';
            setTimeout(() => {
                this.elements.copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            this.elements.copyBtn.textContent = '复制失败';
            setTimeout(() => {
                this.elements.copyBtn.textContent = '复制代码';
            }, 2000);
        });
    }

    // 显示错误信息
    showError(message) {
        this.elements.questionText.textContent = message;
        this.elements.optionsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <h3>错误</h3>
                <p>${message}</p>
                <p style="margin-top: 20px; font-size: 0.9em;">请检查 data/questions.json 文件格式是否正确。</p>
            </div>
        `;
    }

    // 生成题目导航列表
    generateQuestionList() {
        this.elements.questionList.innerHTML = '';
        
        this.questions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            questionItem.dataset.index = index;
            
            // 设置题目状态类
            if (index === this.currentQuestionIndex) {
                questionItem.classList.add('current');
            } else if (this.questionStates[index] === 'correct') {
                questionItem.classList.add('answered-correct');
            } else if (this.questionStates[index] === 'incorrect') {
                questionItem.classList.add('answered-incorrect');
            }
            
            // 创建题目编号
            const questionNumber = document.createElement('span');
            questionNumber.className = 'question-number';
            questionNumber.textContent = index + 1;
            
            // 创建题目文本
            const questionText = document.createElement('span');
            questionText.className = 'question-item-text';
            questionText.textContent = `题目 ${index + 1}`;
            
            questionItem.appendChild(questionNumber);
            questionItem.appendChild(questionText);
            
            // 添加点击事件
            questionItem.addEventListener('click', () => {
                this.goToQuestion(index);
            });
            
            this.elements.questionList.appendChild(questionItem);
        });
        
        // 更新进度条
        this.updateProgressBar();
    }

    // 跳转到指定题目
    goToQuestion(index) {
        if (index >= 0 && index < this.questions.length && index !== this.currentQuestionIndex) {
            this.showQuestion(index);
        }
    }

    // 上一题
    goToPrevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.goToQuestion(this.currentQuestionIndex - 1);
        }
    }

    // 下一题
    goToNextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.goToQuestion(this.currentQuestionIndex + 1);
        }
    }

    // 随机题目
    goToRandomQuestion() {
        const randomIndex = Math.floor(Math.random() * this.questions.length);
        if (randomIndex !== this.currentQuestionIndex) {
            this.goToQuestion(randomIndex);
        } else {
            // 如果随机到当前题目，再随机一次
            this.goToRandomQuestion();
        }
    }

    // 第一题
    goToFirstQuestion() {
        this.goToQuestion(0);
    }

    // 最后一题
    goToLastQuestion() {
        this.goToQuestion(this.questions.length - 1);
    }

    // 切换左侧导航栏
    toggleLeftNav() {
        this.isLeftNavCollapsed = !this.isLeftNavCollapsed;
        if (this.isLeftNavCollapsed) {
            this.elements.leftNav.classList.add('collapsed');
            this.elements.toggleLeftNav.textContent = '▶';
        } else {
            this.elements.leftNav.classList.remove('collapsed');
            this.elements.toggleLeftNav.textContent = '◀';
        }
    }

    // 切换右侧导航栏
    toggleRightNav() {
        this.isRightNavCollapsed = !this.isRightNavCollapsed;
        if (this.isRightNavCollapsed) {
            this.elements.rightNav.classList.add('collapsed');
            this.elements.toggleRightNav.textContent = '◀';
        } else {
            this.elements.rightNav.classList.remove('collapsed');
            this.elements.toggleRightNav.textContent = '▶';
        }
    }

    // 更新进度条
    updateProgressBar() {
        const answeredCount = this.questionStates.filter(state => 
            state === 'correct' || state === 'incorrect'
        ).length;
        const progressPercentage = (answeredCount / this.questions.length) * 100;
        
        this.elements.progressFill.style.width = `${progressPercentage}%`;
        this.elements.progressText.textContent = `${answeredCount}/${this.questions.length}`;
    }

    // 更新题目状态
    updateQuestionState(index, state) {
        this.questionStates[index] = state;
        
        // 更新题目列表中的状态
        const questionItems = this.elements.questionList.querySelectorAll('.question-item');
        if (questionItems[index]) {
            questionItems[index].classList.remove('answered-correct', 'answered-incorrect');
            
            if (state === 'correct') {
                questionItems[index].classList.add('answered-correct');
            } else if (state === 'incorrect') {
                questionItems[index].classList.add('answered-incorrect');
            }
        }
        
        // 更新进度条
        this.updateProgressBar();
    }

    // 更新当前题目高亮
    updateCurrentQuestionHighlight() {
        // 移除所有current类
        const questionItems = this.elements.questionList.querySelectorAll('.question-item');
        questionItems.forEach(item => item.classList.remove('current'));
        
        // 添加current类到当前题目
        if (questionItems[this.currentQuestionIndex]) {
            questionItems[this.currentQuestionIndex].classList.add('current');
        }
        
        // 更新导航按钮状态
        this.elements.prevQuestionBtn.disabled = this.currentQuestionIndex === 0;
        this.elements.nextQuestionBtn.disabled = this.currentQuestionIndex === this.questions.length - 1;
    }
}

// 页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    new PracticeApp();
});