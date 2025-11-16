// 模板加载器 - 负责动态加载题库数据
class TemplateLoader {
    constructor() {
        this.questions = [];
    }

    // 加载题库数据
    async loadQuestions() {
        // 直接使用内置题库数据
        this.questions = this.getBuiltInQuestions();
        console.log(`成功加载 ${this.questions.length} 道题目（来自内置题库）`);
        return this.questions;
    }

    // 获取内置题库数据
    getBuiltInQuestions() {
        return [
  {
    "id": 1,
    "question": "用printf输出格式说明符本身（如'%%d'），正确写法是？",
    "options": ["printf(\"%d\");", "printf(\"%%d\");", "printf(\"%\\\\d\");", "printf(\"d\");"],
    "correctAnswer": 1,
    "explanation": "在C语言中，要输出%字符本身，需要使用两个连续的%字符（%%）。这是因为%在printf中用作格式说明符的起始字符。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"%%d\\n\");  // 输出: %d\n    printf(\"%%f\\n\");  // 输出: %f\n    printf(\"%%s\\n\");  // 输出: %s\n    return 0;\n}"
  },
  {
    "id": 2,
    "question": "scanf读整数后直接用`%c`读字符，会出现什么问题？",
    "options": ["程序崩溃", "读取到之前输入的换行符", "自动跳过空白字符", "读取随机字符"],
    "correctAnswer": 1,
    "explanation": "当使用scanf读取整数后，输入缓冲区中会留下换行符（回车键）。如果紧接着使用%c读取字符，会读取到这个换行符而不是用户实际输入的字符。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num;\n    char ch;\n    \n    printf(\"请输入一个整数: \");\n    scanf(\"%d\", &num);  // 输入: 123<回车>\n    \n    printf(\"请输入一个字符: \");\n    scanf(\"%c\", &ch);   // 这里会读取到换行符，而不是用户输入的字符\n    \n    printf(\"字符的ASCII码: %d\\n\", ch);  // 输出: 10 (换行符的ASCII码)\n    return 0;\n}"
  },
  {
    "id": 3,
    "question": "printf中`%*d`的含义是？",
    "options": ["动态指定宽度输出整数", "固定宽度10输出整数", "跳过整数读取", "输出十六进制整数"],
    "correctAnswer": 0,
    "explanation": "%*d中的*表示宽度由参数动态指定。需要在格式字符串后面提供一个整数参数来指定宽度。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 42;\n    int width = 8;\n    \n    printf(\"%*d\\n\", width, num);  // 输出: '      42' (前面有6个空格)\n    printf(\"%*d\\n\", 5, num);       // 输出: '   42' (前面有3个空格)\n    return 0;\n}"
  },
  {
    "id": 4,
    "question": "printf中%f和%lf的关系是？",
    "options": ["%f用于float，%lf用于double", "两者都可用于double，效果相同", "%f用于double，%lf用于float", "不能混合使用"],
    "correctAnswer": 1,
    "explanation": "在printf函数中，%f和%lf都可以用于输出double类型，效果完全相同。但在scanf中，%f用于float，%lf用于double。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    double d = 3.14159;\n    float f = 2.71828f;\n    \n    printf(\"使用%%f输出double: %f\\n\", d);    // 输出: 3.141590\n    printf(\"使用%%lf输出double: %lf\\n\", d);   // 输出: 3.141590\n    printf(\"使用%%f输出float: %f\\n\", f);     // 输出: 2.718280\n    return 0;\n}"
  },
  {
    "id": 5,
    "question": "scanf中`%*d`的作用是？",
    "options": ["读取整数并存储", "跳过一个整数的读取", "读取整数前两位", "输出整数"],
    "correctAnswer": 1,
    "explanation": "scanf中的*表示赋值抑制符，用于跳过对应输入项的读取，不会将读取的值存储到变量中。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b;\n    \n    printf(\"请输入三个整数: \");\n    scanf(\"%d%*d%d\", &a, &b);  // 输入: 10 20 30\n    \n    printf(\"a = %d, b = %d\\n\", a, b);  // 输出: a = 10, b = 30 (跳过了20)\n    return 0;\n}"
  },
  {
    "id": 6,
    "question": "printf让整数左对齐，需用哪个修饰符？",
    "options": ["+", "-", "0", "#"],
    "correctAnswer": 1,
    "explanation": "-修饰符用于左对齐输出。默认情况下，printf使用右对齐。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 42;\n    \n    printf(\"右对齐: '%5d'\\n\", num);   // 输出: '   42'\n    printf(\"左对齐: '%-5d'\\n\", num);  // 输出: '42   '\n    return 0;\n}"
  },
  {
    "id": 7,
    "question": "scanf(\"%s\")读字符串的安全风险是？",
    "options": ["无法读取数字", "读取到换行符", "输入过长导致缓冲区溢出", "只能读取单个字符"],
    "correctAnswer": 2,
    "explanation": "scanf(\"%s\")不会检查输入字符串的长度，如果用户输入超过目标缓冲区大小的字符串，会导致缓冲区溢出，这是严重的安全漏洞。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char str[10];  // 只能存储9个字符+空字符\n    \n    // 危险：如果输入超过9个字符，会导致缓冲区溢出\n    scanf(\"%s\", str);\n    \n    // 更安全的做法：使用fgets或指定最大宽度\n    // scanf(\"%9s\", str);  // 限制最多读取9个字符\n    \n    printf(\"输入: %s\\n\", str);\n    return 0;\n}"
  },
  {
    "id": 8,
    "question": "printf输出带前缀的十六进制（如0x1a），用哪个格式符？",
    "options": ["%x", "%X", "%#x", "%0x"],
    "correctAnswer": 2,
    "explanation": "#修饰符用于在八进制和十六进制输出前添加前缀（0或0x/0X）。%#x输出小写十六进制带0x前缀，%#X输出大写十六进制带0X前缀。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 26;\n    \n    printf(\"普通十六进制: %x\\n\", num);    // 输出: 1a\n    printf(\"带前缀十六进制: %#x\\n\", num);  // 输出: 0x1a\n    printf(\"大写带前缀: %#X\\n\", num);     // 输出: 0X1A\n    return 0;\n}"
  },
  {
    "id": 9,
    "question": "scanf读含空格的字符串（如\"Hello World\"），用哪个格式符？",
    "options": ["%s", "%[^\\n]", "%c", "%d"],
    "correctAnswer": 1,
    "explanation": "%[^\\n]可以读取包含空格的字符串，直到遇到换行符为止。而%s遇到空格、制表符、换行符就会停止读取。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char str1[50], str2[50];\n    \n    printf(\"使用%%s读取: \");\n    scanf(\"%s\", str1);  // 输入: Hello World\n    // str1只包含\"Hello\"\n    \n    // 清空输入缓冲区\n    while (getchar() != '\\n');\n    \n    printf(\"使用%%[^\\n]读取: \");\n    scanf(\"%[^\\n]\", str2);  // 输入: Hello World\n    // str2包含\"Hello World\"\n    \n    printf(\"str1: %s\\n\", str1);  // 输出: Hello\n    printf(\"str2: %s\\n\", str2);  // 输出: Hello World\n    return 0;\n}"
  },
  {
    "id": 10,
    "question": "printf中`%.2f`的含义是？",
    "options": ["宽度为2输出浮点数", "保留2位小数输出浮点数", "输出2个浮点数", "输出浮点数前2位"],
    "correctAnswer": 1,
    "explanation": ".2表示精度，用于指定浮点数的小数位数。%.2f表示保留2位小数输出浮点数。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    double pi = 3.14159;\n    \n    printf(\"默认输出: %f\\n\");      // 输出: 3.141590\n    printf(\"保留2位小数: %.2f\\n\", pi);  // 输出: 3.14\n    printf(\"保留4位小数: %.4f\\n\", pi);  // 输出: 3.1416\n    return 0;\n}"
  }
];
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

            // 检查选项格式（支持数组和对象两种格式）
            if (!Array.isArray(question.options) && typeof question.options !== 'object') {
                throw new Error(`第 ${i + 1} 题选项格式错误`);
            }
            
            const optionsLength = Array.isArray(question.options) 
                ? question.options.length 
                : Object.keys(question.options).length;
            
            if (optionsLength === 0) {
                throw new Error(`第 ${i + 1} 题选项为空`);
            }

            // 检查正确答案是否在选项中
            // 对于数组格式，correctAnswer应该是有效的数组索引
            // 对于对象格式，correctAnswer应该是对象的键
            if (Array.isArray(question.options)) {
                const index = parseInt(question.correctAnswer);
                if (isNaN(index) || index < 0 || index >= question.options.length) {
                    throw new Error(`第 ${i + 1} 题正确答案索引无效`);
                }
            } else {
                if (!(question.correctAnswer in question.options)) {
                    throw new Error(`第 ${i + 1} 题正确答案不在选项中`);
                }
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
            return true;
        } catch (error) {
            console.error('导入题库数据失败:', error);
            return false;
        }
    }
}

// 创建全局实例
window.templateLoader = new TemplateLoader();