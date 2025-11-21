// 模板加载器 - 负责动态加载题库数据
class TemplateLoader {
    constructor() {
        console.log('[TemplateLoader] 构造函数已调用');
        this.questions = [];
    }

    // 加载题库数据
    async loadQuestions() {
        console.log('[TemplateLoader] loadQuestions 被调用');
        try {
            // 直接使用内置题库数据
            console.log('[TemplateLoader] 调用 getBuiltInQuestions...');
            this.questions = this.getBuiltInQuestions();
            console.log('[TemplateLoader] getBuiltInQuestions 返回了', this.questions.length, '题');
            // 规范化题目数据（统一为数组格式）
            console.log('[TemplateLoader] 开始规范化题目...');
            this.normalizeQuestions(this.questions);
            console.log(`[TemplateLoader] 成功加载 ${this.questions.length} 道题目（来自内置题库）`);
            return this.questions;
        } catch (error) {
            console.error('[TemplateLoader] 加载题库失败:', error);
            console.error('错误堆栈:', error.stack);
            return [];
        }
    }

    // 规范化题目：将对象格式的 options 转为数组格式，正确答案转为索引
    normalizeQuestions(questions) {
        if (!Array.isArray(questions)) return;
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        
        this.questions = questions.map(q => {
            if (!q || !q.options) return q;
            // 已经是数组格式，跳过
            if (Array.isArray(q.options)) return q;

            // 对象格式：按 A/B/C/D 顺序转为数组
            const optsObj = q.options;
            const arr = [];
            for (const k of letters) {
                if (k in optsObj) arr.push(optsObj[k]);
            }
            if (arr.length === 0) {
                Object.values(optsObj).forEach(v => arr.push(v));
            }

            // 正确答案字母转为索引
            let correct = q.correctAnswer;
            if (typeof correct === 'string') {
                const up = correct.toUpperCase();
                const idx = letters.indexOf(up);
                correct = idx !== -1 ? idx : 0;
            }

            return Object.assign({}, q, { options: arr, correctAnswer: correct });
        });
    }

    // 获取内置题库数据（用于 file:// 协议支持）
    getBuiltInQuestions() {
        console.log('[TemplateLoader] getBuiltInQuestions 被调用');
        const questions = [
  {
    "id": 1,
    "question": "若 `int a=2;`，执行以下代码后输出结果是？\n\n<C>\nswitch(a) {\n    case 1: printf(\"A\"); break;\n    case 2: printf(\"B\");\n    case 3: printf(\"C\"); break;\n    default: printf(\"D\");\n}\n",
    "options": ["B", "BC", "BCD", "无输出"],
    "correctAnswer": 1,
    "explanation": "当 `a=2` 时，switch语句匹配到 `case 2`，执行 `printf(\"B\")`。由于 `case 2` 后面没有 `break` 语句，会继续执行 `case 3` 的 `printf(\"C\")`，然后遇到 `break` 跳出switch。所以输出结果是 BC。这体现了switch语句的fall-through（贯穿）特性。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 2;\n    switch(a) {\n        case 1: printf(\"A\"); break;\n        case 2: printf(\"B\");\n        case 3: printf(\"C\"); break;\n        default: printf(\"D\");\n    }\n    // 输出: BC\n    return 0;\n}"
  },
  {
    "id": 2,
    "question": "以下switch代码片段中，语法正确的是？\n\nA.\n<C>\nswitch(3) {\n    case 1: int x=10; break;\n    case 2: x=20; break;\n}\n\nB.\n<C>\nswitch('a') {\n    case 'A': printf(\"大写\"); break;\n    case 'a': printf(\"小写\"); break;\n}\n\nC.\n<C>\nswitch(5>3) {\n    case 1: printf(\"真\"); break;\n    case 0: printf(\"假\"); break;\n}\n\nD.\n<C>\nswitch(2) {\n    case 1+1: printf(\"等于2\"); break;\n}\n",
    "options": ["选项A语法正确", "选项B语法正确", "选项C语法正确", "选项D语法正确"],
    "correctAnswer": 3,
    "explanation": "D正确：`1+1`是常量表达式，可以用于case。A错误：变量`x`的作用域问题，在case中声明变量需要加花括号。B错误：虽然字符常量语法正确，但`case 'A'`和`case 'a'`是不同的字符。C在大多数C编译器中也是合法的：switch表达式需要是整型表达式，而布尔值在C中会被隐式转换为整数（1表示真，0表示假）。",
    "codeExample": "#include <stdio.h>\nint main() {\n    // 正确的代码（选项D）\n    switch(2) {\n        case 1+1: printf(\"等于2\"); break; // 1+1是常量表达式2\n    }\n    // 输出：等于2\n    \n    // 错误的代码示例（选项A的问题）\n    /*\n    switch(3) {\n        case 1: int x=10; break;  // 错误：需要加花括号\n        case 2: x=20; break;      // x未定义\n    }\n    */\n    \n    // 修正选项A的代码\n    switch(3) {\n        case 1: { int x=10; break; }  // 正确：加花括号限制作用域\n        case 2: { int x=20; break; }  // 正确：每个case都有自己的x\n    }\n    \n    return 0;\n}"
  }
];
        console.log('[TemplateLoader] getBuiltInQuestions 返回数据', questions.length, '条');
        return questions;
    }

    // 验证题库数据格式
    validateQuestions(questions) {
        if (!Array.isArray(questions)) {
            throw new Error('题库数据必须是数组格式');
        }

        const requiredFields = ['id', 'question', 'options', 'correctAnswer', 'explanation', 'codeExample'];
        
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            
            // 检查必需字段
            for (const field of requiredFields) {
                if (!(field in question)) {
                    throw new Error(`第 ${i + 1} 题缺少必需字段: ${field}`);
                }
            }

            // 检查选项格式（规范化后应为数组）
            if (!Array.isArray(question.options) || question.options.length === 0) {
                throw new Error(`第 ${i + 1} 题选项格式错误`);
            }

            // 检查正确答案是否在选项中
            const idx = parseInt(question.correctAnswer);
            if (isNaN(idx) || idx < 0 || idx >= question.options.length) {
                throw new Error(`第 ${i + 1} 题正确答案索引无效`);
            }
        }

        return true;
    }

    // 获取题库统计信息
    getQuestionStats() {
        return {
            total: this.questions.length,
            categories: this.getCategories(),
            difficulty: this.getDifficultyStats()
        };
    }

    // 获取题目分类（如果存在分类字段）
    getCategories() {
        const categories = new Set();
        this.questions.forEach(q => {
            if (q.category) {
                categories.add(q.category);
            }
        });
        return Array.from(categories);
    }

    // 获取难度统计（如果存在难度字段）
    getDifficultyStats() {
        const stats = {};
        this.questions.forEach(q => {
            if (q.difficulty) {
                stats[q.difficulty] = (stats[q.difficulty] || 0) + 1;
            }
        });
        return stats;
    }

    // 导出题库数据（用于备份或迁移）
    exportQuestions() {
        return JSON.stringify(this.questions, null, 2);
    }

    // 导入题库数据
    importQuestions(jsonData) {
        try {
            const questions = JSON.parse(jsonData);
            this.validateQuestions(questions);
            this.questions = questions;
        } catch (error) {
            console.error('导入题库失败:', error);
        }
    }
}

// 创建全局实例
console.log('[Script] 创建 TemplateLoader 全局实例...');
window.templateLoader = new TemplateLoader();
console.log('[Script] TemplateLoader 全局实例创建完成');