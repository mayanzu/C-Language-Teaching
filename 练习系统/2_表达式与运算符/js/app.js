// 练习应用主逻辑
class PracticeApp {
    constructor() {
        console.log('[PracticeApp] 构造函数已调用');
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswered = false;
        this.currentCodeText = '';
        
        // 初始化DOM元素
        console.log('[PracticeApp] 初始化DOM元素...');
        this.initializeElements();
        // 绑定事件
        console.log('[PracticeApp] 绑定事件...');
        this.bindEvents();
        // 开始应用
        console.log('[PracticeApp] 调用 start() 方法...');
        this.start();
    }

    // 初始化DOM元素
    initializeElements() {
        console.log('[PracticeApp] initializeElements 开始...');
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
            headerTitle: document.getElementById('header-title'),
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
            leftSidebar: document.querySelector('.sidebar-left'),
            rightSidebar: document.querySelector('.sidebar-right')
        };
        
        // 验证元素是否都成功加载
        console.log('[PracticeApp] 验证DOM元素...');
        const missingElements = Object.entries(this.elements)
            .filter(([key, el]) => el === null)
            .map(([key]) => key);
        
        if (missingElements.length > 0) {
            console.error('[PracticeApp] ❌ 缺失的DOM元素:', missingElements);
        } else {
            console.log('[PracticeApp] ✓ 所有DOM元素已正确加载');
        }
        
        // 题目导航状态
        this.questionStates = []; // 存储每个题目的状态 (未答/正确/错误)
        this.isLeftNavCollapsed = false;
        this.isRightNavCollapsed = false;
        console.log('[PracticeApp] initializeElements 完成');
    }

    // 绑定事件
    bindEvents() {
        console.log('[PracticeApp] bindEvents 开始...');
        try {
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
            
            console.log('[PracticeApp] ✓ 所有事件已绑定');
        } catch (error) {
            console.error('[PracticeApp] ❌ 绑定事件失败:', error);
            throw error;
        }
    }

    // 开始应用
    async start() {
        try {
            console.log('[PracticeApp] 开始初始化应用...');
            
            // 显示加载状态
            this.elements.questionText.textContent = '正在加载题目...';
            console.log('[PracticeApp] 显示加载状态');
            
            // 检查 templateLoader
            console.log('[PracticeApp] templateLoader 状态:', window.templateLoader);
            
            // 加载题库数据
            console.log('[PracticeApp] 开始加载题库数据...');
            this.questions = await window.templateLoader.loadQuestions();
            console.log('[PracticeApp] 题库数据加载完成，共', this.questions.length, '题');
            
            if (this.questions.length === 0) {
                console.error('[PracticeApp] 题库数据为空！');
                this.showError('题库数据为空或加载失败，请检查内置题库数据');
                return;
            }

            // 验证题库数据
            console.log('[PracticeApp] 开始验证题库数据...');
            try {
                window.templateLoader.validateQuestions(this.questions);
                console.log('[PracticeApp] 题库数据验证通过');
            } catch (error) {
                console.error('[PracticeApp] 题库数据验证失败:', error);
                this.showError(`题库数据格式错误: ${error.message}`);
                return;
            }

            // 更新页面标题和统计信息
            console.log('[PracticeApp] 更新页面信息...');
            this.updatePageTitle();
            this.elements.totalQuestionsSpan.textContent = this.questions.length;
            
            // 初始化题目状态
            console.log('[PracticeApp] 初始化题目状态...');
            this.questionStates = new Array(this.questions.length).fill('unanswered');
            
            // 生成题目导航列表
            console.log('[PracticeApp] 生成题目导航列表...');
            this.generateQuestionList();
            
            // 显示第一题
            console.log('[PracticeApp] 显示第一题...');
            this.showQuestion(0);
            console.log('[PracticeApp] 应用初始化完成！');
            
        } catch (error) {
            console.error('[PracticeApp] 应用启动失败:', error);
            console.error('错误堆栈:', error.stack);
            this.showError('应用启动失败，请检查控制台错误信息');
        }
    }

    // 更新页面标题
    updatePageTitle() {
        const stats = window.templateLoader.getQuestionStats();
        // 保留原始标题的练习类型信息，只更新题目数量
        const originalTitle = document.title;
        const practiceType = originalTitle.match(/^C语言(.+?)练习/) ? originalTitle.match(/^C语言(.+?)练习/)[1] : '';
        
        // 分别更新页面标题和页面内标题
        this.elements.title.textContent = `C语言${practiceType}练习 - ${stats.total} 道题目`;
        this.elements.headerTitle.textContent = `C语言${practiceType}练习`;
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

        // 清空并生成选项（规范化后的数组格式）
        this.elements.optionsContainer.innerHTML = '';
        
        if (Array.isArray(question.options)) {
            // 数组格式：转换为 A/B/C/D 标签并保存索引
            question.options.forEach((value, optionIndex) => {
                const label = String.fromCharCode(65 + optionIndex); // 65='A'
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                // 存储索引，便于与 question.correctAnswer（数字）比较
                optionDiv.dataset.option = String(optionIndex);
                // 格式化选项中的内联代码
                const formattedValue = this.formatOptionText(value);
                optionDiv.innerHTML = `<span class="option-label">${label}.</span><span class="option-content">${formattedValue}</span>`;
                optionDiv.addEventListener('click', () => this.selectOption(String(optionIndex), optionDiv));
                this.elements.optionsContainer.appendChild(optionDiv);
            });
        } else {
            // 备用：如果仍是对象格式（不应该出现，但保险起见）
            Object.entries(question.options).forEach(([key, value]) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.dataset.option = key;
                // 格式化选项中的内联代码
                const formattedValue = this.formatOptionText(value);
                optionDiv.innerHTML = `<span class="option-label">${key}.</span><span class="option-content">${formattedValue}</span>`;
                optionDiv.addEventListener('click', () => this.selectOption(key, optionDiv));
                this.elements.optionsContainer.appendChild(optionDiv);
            });
        }

        // 初始化选项悬浮光效
        this.initializeOptionHoverEffects();

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

    // 初始化选项悬浮光效
    initializeOptionHoverEffects() {
        const options = this.elements.optionsContainer.querySelectorAll('.option');
        options.forEach(option => {
            let animationFrameId = null;
            let hoverX = 0;
            let hoverY = 0;

            const updateSpotlight = () => {
                option.style.setProperty('--hover-x', `${hoverX}px`);
                option.style.setProperty('--hover-y', `${hoverY}px`);
                option.classList.add('has-pointer');
                animationFrameId = null;
            };

            option.addEventListener('mousemove', (event) => {
                const rect = option.getBoundingClientRect();
                hoverX = event.clientX - rect.left;
                hoverY = event.clientY - rect.top;

                if (animationFrameId === null) {
                    animationFrameId = requestAnimationFrame(updateSpotlight);
                }
            });

            option.addEventListener('mouseleave', () => {
                if (animationFrameId !== null) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                option.classList.remove('has-pointer');
                option.style.removeProperty('--hover-x');
                option.style.removeProperty('--hover-y');
            });
        });
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
        
        // 规范比较：选中的索引（字符串）与 correctAnswer（数字）比较
        const isCorrect = parseInt(this.selectedAnswer) === Number(question.correctAnswer);

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
            const optIdx = parseInt(opt.dataset.option);
            const correctIdx = Number(question.correctAnswer);
            if (optIdx === correctIdx) {
                opt.classList.add('correct');
            } else if (optIdx === parseInt(this.selectedAnswer) && !isCorrect) {
                opt.classList.add('incorrect');
            }
        });

        // 准备反馈文本（显示字母标签与选项文本）
        const correctIdx = Number(question.correctAnswer);
        const correctLabel = String.fromCharCode(65 + correctIdx); // 转为字母
        const correctText = question.options[correctIdx];

        // 显示反馈
        this.elements.feedbackContainer.style.display = 'block';
        this.elements.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        this.elements.feedback.innerHTML = `
            <h3>${isCorrect ? '✓ 回答正确！' : '✗ 回答错误'}</h3>
            <p><strong>正确答案：</strong>${correctLabel}. ${correctText}</p>
            <p><strong>解析：</strong>${question.explanation}</p>
        `;

        // 显示代码示例
        this.currentCodeText = question.codeExample;
        
        // 自动检测代码语言
        const language = this.detectCodeLanguage(this.currentCodeText);
        
        // 应用代码格式化和高亮
        this.formatAndHighlightCode(this.currentCodeText, language);

        // 更新按钮
        this.elements.submitBtn.style.display = 'none';
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.elements.nextBtn.style.display = 'inline-block';
        } else {
            this.elements.restartBtn.style.display = 'inline-block';
        }
    }

    // 格式化题目文本（处理markdown代码块和<C>标记）
    formatQuestionText(questionText) {
        let result = questionText;
        const codeBlocks = []; // 存储代码块
        
        // 1. 处理 <C> 标记的代码块（同时移除前后的换行符）
        const cTagRegex = /\n*<C>\s*([\s\S]*?)\s*<\/C>\n*|\n*<C>\s*([\s\S]*?)(?=\n\n|\n[A-Z]\.|\n选项|$)\n*/gi;
        result = result.replace(cTagRegex, (match, codeWithClosing, codeWithoutClosing) => {
            const code = (codeWithClosing || codeWithoutClosing || '').trim();
            const formattedCode = code.replace(/\t/g, '    ');
            const highlightedCode = this.applySyntaxHighlighting(formattedCode, 'c');
            
            const blockHtml = `<div class="code-example-container inline-code-block"><pre><code>${highlightedCode}</code></pre></div>`;
            const index = codeBlocks.length;
            codeBlocks.push(blockHtml);
            return `\n___CODE_BLOCK_${index}___\n`;
        });
        
        // 2. 处理 markdown 代码块 ```c ... ```（同时移除前后的换行符）
        const codeBlockRegex = /\n*```(\w*)\n([\s\S]*?)\n```\n*/g;
        result = result.replace(codeBlockRegex, (match, language, code) => {
            const detectedLanguage = this.detectCodeLanguage(code.trim()) || language || 'c';
            const formattedCode = code.replace(/\t/g, '    ').trim();
            const highlightedCode = this.applySyntaxHighlighting(formattedCode, detectedLanguage);
            
            const blockHtml = `<div class="code-example-container"><pre class="code-with-line-numbers"><code>${highlightedCode}</code></pre></div>`;
            const index = codeBlocks.length;
            codeBlocks.push(blockHtml);
            return `\n___CODE_BLOCK_${index}___\n`;
        });
        
        // 3. 处理内联代码 `code` - 不应用语法高亮，保持简单样式
        result = result.replace(/`([^`]+)`/g, (match, code) => {
            // 转义HTML特殊字符
            const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<code class="inline-code">${escaped}</code>`;
        });
        
        // 4. 处理换行符（将连续多个换行符合并为一个）
        result = result.replace(/\n{3,}/g, '\n\n');
        result = result.replace(/\n/g, '<br>');
        
        // 5. 恢复代码块
        result = result.replace(/___CODE_BLOCK_(\d+)___/g, (match, index) => {
            return codeBlocks[parseInt(index)];
        });
        
        return result;
    }

    // 格式化选项文本（处理内联代码）
    formatOptionText(optionText) {
        let result = optionText;
        
        // 处理内联代码 `code` - 不应用语法高亮，保持简单样式
        result = result.replace(/`([^`]+)`/g, (match, code) => {
            // 转义HTML特殊字符
            const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<code class="inline-code">${escaped}</code>`;
        });
        
        return result;
    }

    // 检测代码语言
    detectCodeLanguage(codeText) {
        // 检测C语言
        if (codeText.includes('#include') || codeText.includes('#define') ||
            codeText.includes('int main()') || codeText.includes('printf') ||
            codeText.includes('scanf') || codeText.includes('stdlib.h')) {
            return 'c';
        }
        
        // 检测JavaScript
        if (codeText.includes('function') || codeText.includes('var ') ||
            codeText.includes('let ') || codeText.includes('const ') ||
            codeText.includes('console.log')) {
            return 'javascript';
        }
        
        // 检测Python
        if (codeText.includes('def ') || codeText.includes('import ') ||
            codeText.includes('print(') || codeText.includes('if __name__')) {
            return 'python';
        }
        
        // 检测Java
        if (codeText.includes('public class') || codeText.includes('System.out.println') ||
            codeText.includes('public static void main')) {
            return 'java';
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
        
        // 设置代码内容
        this.elements.codeExample.innerHTML = highlightedCode;
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
        // 使用更安全的处理方式，避免重复替换
        let highlighted = code;

        // 0. 先转义HTML特殊字符，防止 <stdio.h> 等被浏览器解析为标签
        highlighted = highlighted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // 1. 先处理字符串，避免与其他规则冲突
        highlighted = highlighted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="code-string">"$1"</span>');
        
        // 2. 处理注释
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="code-comment">$&</span>');
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="code-comment">$&</span>');
        
        // 3. 预处理指令
        highlighted = highlighted.replace(/(#\w+)/g, '<span class="code-macro">$1</span>');
        
        // 4. 关键字（包含switch、case、default、break）
        const keywords = ['int', 'char', 'float', 'double', 'if', 'else', 'while', 'for',
                         'return', 'void', 'sizeof', 'struct', 'enum', 'typedef', 'unsigned', 'signed',
                         'long', 'short', 'static', 'const', 'extern', 'auto', 'register',
                         'switch', 'case', 'default', 'break'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="code-keyword">${keyword}</span>`);
        });
        
        // 5. 类型
        const types = ['int', 'char', 'float', 'double', 'void'];
        types.forEach(type => {
            const regex = new RegExp(`\\b${type}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="code-type">${type}</span>`);
        });
        
        // 6. 数字
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>');
        
        // 7. 函数调用 - 使用更精确的正则表达式，避免匹配HTML标签内的内容
        // 使用负向前瞻确保不匹配已经在span标签内的内容
        highlighted = highlighted.replace(/(\w+)(?=\s*\()(?![^<]*>)/g, '<span class="code-function">$1</span>');
        
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
        // 更新当前题目高亮
        this.updateCurrentQuestionHighlight();
    }

    // 重新开始
    restart() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.elements.scoreSpan.textContent = this.score;
        
        // 重置题目状态
        this.questionStates = new Array(this.questions.length).fill('unanswered');
        
        // 重新生成题目导航列表
        this.generateQuestionList();
        
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
                    ${percentage >= 90 ? '🎉 优秀！你对C语言运算符理解得很好！' : 
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
        const code = this.currentCodeText || this.elements.codeExample.textContent;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = this.elements.copyBtn.textContent;
            this.elements.copyBtn.textContent = '已复制！';
            setTimeout(() => {
                this.elements.copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            this.elements.copyBtn.textContent = '复制失败';
        });
    }

    // 显示错误信息
    showError(message) {
        this.elements.questionText.textContent = message;
        this.elements.optionsContainer.innerHTML = '';
        this.elements.feedbackContainer.style.display = 'none';
        this.elements.submitBtn.style.display = 'none';
        this.elements.nextBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        this.elements.restartBtn.textContent = '重新加载';
    }

    // 生成题目导航列表
    generateQuestionList() {
        this.elements.questionList.innerHTML = '';
        
        this.questions.forEach((question, index) => {
            const questionItem = document.createElement('li');
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
            this.elements.leftSidebar.classList.add('collapsed');
            this.elements.toggleLeftNav.querySelector('.toggle-icon').textContent = '▶';
        } else {
            this.elements.leftSidebar.classList.remove('collapsed');
            this.elements.toggleLeftNav.querySelector('.toggle-icon').textContent = '◀';
        }
    }

    // 切换右侧导航栏
    toggleRightNav() {
        this.isRightNavCollapsed = !this.isRightNavCollapsed;
        if (this.isRightNavCollapsed) {
            this.elements.rightSidebar.classList.add('collapsed');
            this.elements.toggleRightNav.querySelector('.toggle-icon').textContent = '◀';
        } else {
            this.elements.rightSidebar.classList.remove('collapsed');
            this.elements.toggleRightNav.querySelector('.toggle-icon').textContent = '▶';
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
            const currentItem = questionItems[this.currentQuestionIndex];
            currentItem.classList.add('current');
            
            // 滚动到当前题目，使其在可视区域内
            currentItem.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
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