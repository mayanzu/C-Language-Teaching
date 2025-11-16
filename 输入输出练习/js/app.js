// 练习应用主逻辑
class PracticeApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.isAnswered = false;
        this.currentCodeText = '';
        
        // 初始化DOM元素
        this.initializeElements();
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
            copyBtn: document.getElementById('copy-btn'),
            currentQuestionSpan: document.getElementById('current-question'),
            totalQuestionsSpan: document.getElementById('total-questions'),
            scoreSpan: document.getElementById('score'),
            title: document.querySelector('title'),
            headerTitle: document.querySelector('header h1')
        };
    }

    // 绑定事件
    bindEvents() {
        this.elements.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.elements.restartBtn.addEventListener('click', () => this.restart());
        this.elements.copyBtn.addEventListener('click', () => this.copyCode());
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
                window.templateLoader.validateQuestions(this.questions);
            } catch (error) {
                this.showError(`题库数据格式错误: ${error.message}`);
                return;
            }

            // 更新页面标题和统计信息
            this.updatePageTitle();
            this.elements.totalQuestionsSpan.textContent = this.questions.length;
            
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
        const title = `C语言输入输出练习 - ${stats.total} 道题目`;
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
        this.elements.questionText.textContent = `${question.id}. ${question.question}`;

        // 清空并生成选项 - 支持两种格式（数组和对象）
        this.elements.optionsContainer.innerHTML = '';
        
        if (Array.isArray(question.options)) {
            // 数组格式：转换为 A/B/C/D 标签
            question.options.forEach((value, optionIndex) => {
                const label = String.fromCharCode(65 + optionIndex); // 65='A'
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                // 存储为索引字符串，便于与 question.correctAnswer（数字索引）比较
                optionDiv.dataset.option = String(optionIndex);
                optionDiv.innerHTML = `<span class="option-label">${label}.</span>${value}`;
                optionDiv.addEventListener('click', () => this.selectOption(String(optionIndex), optionDiv));
                this.elements.optionsContainer.appendChild(optionDiv);
            });
        } else {
            // 对象格式：直接使用字母标签
            Object.entries(question.options).forEach(([key, value]) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.dataset.option = key;
                optionDiv.innerHTML = `<span class="option-label">${key}.</span>${value}`;
                optionDiv.addEventListener('click', () => this.selectOption(key, optionDiv));
                this.elements.optionsContainer.appendChild(optionDiv);
            });
        }

        // 隐藏反馈和代码示例
        this.elements.feedbackContainer.style.display = 'none';
        
        // 重置按钮状态
        this.elements.submitBtn.style.display = 'inline-block';
        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.textContent = '提交答案';
        this.elements.nextBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'none';
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

        // 规范比较：数组格式的题目使用数字索引（字符串形式存于 dataset.option），对象格式使用字母键
        let isCorrect = false;
        if (Array.isArray(question.options)) {
            isCorrect = parseInt(this.selectedAnswer) === Number(question.correctAnswer);
        } else {
            isCorrect = this.selectedAnswer === question.correctAnswer;
        }

        // 更新分数
        if (isCorrect) {
            this.score++;
            this.elements.scoreSpan.textContent = this.score;
        }

        // 显示正确答案和错误答案（根据题目格式分别处理）
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.add('disabled');
            if (Array.isArray(question.options)) {
                if (parseInt(opt.dataset.option) === Number(question.correctAnswer)) {
                    opt.classList.add('correct');
                } else if (parseInt(opt.dataset.option) === parseInt(this.selectedAnswer) && !isCorrect) {
                    opt.classList.add('incorrect');
                }
            } else {
                if (opt.dataset.option === question.correctAnswer) {
                    opt.classList.add('correct');
                } else if (opt.dataset.option === this.selectedAnswer && !isCorrect) {
                    opt.classList.add('incorrect');
                }
            }
        });

        // 准备反馈文本（显示字母标签与选项文本）
        let correctLabel = '';
        let correctText = '';
        if (Array.isArray(question.options)) {
            correctLabel = String.fromCharCode(65 + Number(question.correctAnswer));
            correctText = question.options[Number(question.correctAnswer)];
        } else {
            correctLabel = question.correctAnswer;
            correctText = question.options[question.correctAnswer];
        }

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
        
        // 提取代码块内容（移除markdown标记）
        const codeBlockMatch = question.codeExample.match(/```(?:\w+)?\n?([\s\S]*?)```/);
        const codeContent = codeBlockMatch ? codeBlockMatch[1].trim() : question.codeExample;
        
        this.elements.codeExample.textContent = codeContent;
        
        // 简单的语法高亮
        this.highlightCode(codeContent);

        // 更新按钮
        this.elements.submitBtn.style.display = 'none';
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.elements.nextBtn.style.display = 'inline-block';
        } else {
            this.elements.restartBtn.style.display = 'inline-block';
        }
    }

    // 简单的语法高亮
    highlightCode(code) {
        const codeElement = this.elements.codeExample;
        codeElement.textContent = code || this.currentCodeText;
    }

    // 复制代码
    copyCode() {
        navigator.clipboard.writeText(this.currentCodeText).then(() => {
            const originalText = this.elements.copyBtn.textContent;
            this.elements.copyBtn.textContent = '已复制！';
            setTimeout(() => {
                this.elements.copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动选择代码复制');
        });
    }

    // 下一题
    nextQuestion() {
        this.showQuestion(this.currentQuestionIndex + 1);
    }

    // 重新开始
    restart() {
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
                <h2>练习结果</h2>
                <p style="font-size: 1.2em; margin: 20px 0;">
                    得分: <strong>${this.score}</strong> / ${this.questions.length} (${percentage}%)
                </p>
                <p style="color: #666;">
                    ${percentage >= 80 ? '🎉 优秀！' : percentage >= 60 ? '👍 良好！' : '💪 继续加油！'}
                </p>
            </div>
        `;
        
        this.elements.feedbackContainer.style.display = 'none';
        this.elements.submitBtn.style.display = 'none';
        this.elements.nextBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
    }

    // 显示错误信息
    showError(message) {
        this.elements.questionText.textContent = message;
        this.elements.optionsContainer.innerHTML = '';
        this.elements.submitBtn.style.display = 'none';
    }
}

// 当页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    new PracticeApp();
});