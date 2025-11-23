// 模板加载器 - 负责动态加载题库数据
class TemplateLoader {
    constructor() {
        this.questions = [];
    }

    // 加载题库数据
    async loadQuestions() {
        try {
            // 直接使用内置题库数据
            this.questions = this.getBuiltInQuestions();
            // 打乱题库顺序
            this.shuffleQuestions();
            // 重新分配题目ID（保持1到n的顺序）
            this.reassignQuestionIds();
            // 规范化题目数据（统一为数组格式）
            this.normalizeQuestions(this.questions);
            console.log(`成功加载 ${this.questions.length} 道题目（来自内置题库）`);
            return this.questions;
        } catch (error) {
            console.warn('加载题库失败:', error.message);
            return [];
        }
    }

    // 打乱题库顺序（Fisher-Yates 洗牌算法）
    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    // 重新分配题目ID
    reassignQuestionIds() {
        this.questions.forEach((q, index) => {
            q.id = index + 1;
        });
    }

    // 获取内置题库数据
    getBuiltInQuestions() {
        return [
  {
    "id": 1,
    "question": "用 `printf` 输出格式说明符本身（如 `%d`），正确写法是？",
    "options": ["`printf(\"%d\");`", "`printf(\"%%d\");`", "`printf(\"%\\\\d\");`", "`printf(\"d\");`"],
    "correctAnswer": 1,
    "explanation": "在C语言中，要输出 `%` 字符本身，需要使用两个连续的 `%` 字符（`%%`）。这是因为 `%` 在 `printf` 中用作格式说明符的起始字符。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"%%d\\n\");  // 输出: %d\n    printf(\"%%f\\n\");  // 输出: %f\n    printf(\"%%s\\n\");  // 输出: %s\n    return 0;\n}"
  },
  {
    "id": 2,
    "question": "`scanf` 读整数后直接用 `%c` 读字符，会出现什么问题？",
    "options": ["程序崩溃", "读取到之前输入的换行符", "自动跳过空白字符", "读取随机字符"],
    "correctAnswer": 1,
    "explanation": "当使用 `scanf` 读取整数后，输入缓冲区中会留下换行符（回车键）。如果紧接着使用 `%c` 读取字符，会读取到这个换行符而不是用户实际输入的字符。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num;\n    char ch;\n    \n    printf(\"请输入一个整数: \");\n    scanf(\"%d\", &num);  // 输入: 123<回车>\n    \n    printf(\"请输入一个字符: \");\n    scanf(\"%c\", &ch);   // 这里会读取到换行符，而不是用户输入的字符\n    \n    printf(\"字符的ASCII码: %d\\n\", ch);  // 输出: 10 (换行符的ASCII码)\n    return 0;\n}"
  },
  {
    "id": 3,
    "question": "`printf` 中 `%*d` 的含义是？",
    "options": ["动态指定宽度输出整数", "固定宽度10输出整数", "跳过整数读取", "输出十六进制整数"],
    "correctAnswer": 0,
    "explanation": "`%*d` 中的 `*` 表示宽度由参数动态指定。需要在格式字符串后面提供一个整数参数来指定宽度。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 42;\n    int width = 8;\n    \n    printf(\"%*d\\n\", width, num);  // 输出: '      42' (前面有6个空格)\n    printf(\"%*d\\n\", 5, num);       // 输出: '   42' (前面有3个空格)\n    return 0;\n}"
  },
  {
    "id": 4,
    "question": "`printf` 中 `%f` 和 `%lf` 的关系是？",
    "options": ["`%f` 用于 `float`，`%lf` 用于 `double`", "两者都可用于 `double`，效果相同", "`%f` 用于 `double`，`%lf` 用于 `float`", "不能混合使用"],
    "correctAnswer": 1,
    "explanation": "在 `printf` 函数中，`%f` 和 `%lf` 都可以用于输出 `double` 类型，效果完全相同。但在 `scanf` 中，`%f` 用于 `float`，`%lf` 用于 `double`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    double d = 3.14159;\n    float f = 2.71828f;\n    \n    printf(\"使用%%f输出double: %f\\n\", d);    // 输出: 3.141590\n    printf(\"使用%%lf输出double: %lf\\n\", d);   // 输出: 3.141590\n    printf(\"使用%%f输出float: %f\\n\", f);     // 输出: 2.718280\n    return 0;\n}"
  },
  {
    "id": 5,
    "question": "`scanf` 中 `%*d` 的作用是？",
    "options": ["读取整数并存储", "跳过一个整数的读取", "读取整数前两位", "输出整数"],
    "correctAnswer": 1,
    "explanation": "`scanf` 中的 `*` 表示赋值抑制符，用于跳过对应输入项的读取，不会将读取的值存储到变量中。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b;\n    \n    printf(\"请输入三个整数: \");\n    scanf(\"%d%*d%d\", &a, &b);  // 输入: 10 20 30\n    \n    printf(\"a = %d, b = %d\\n\", a, b);  // 输出: a = 10, b = 30 (跳过了20)\n    return 0;\n}"
  },
  {
    "id": 6,
    "question": "`printf` 让整数左对齐，需用哪个修饰符？",
    "options": ["`+`", "`-`", "`0`", "`#`"],
    "correctAnswer": 1,
    "explanation": "`-` 修饰符用于左对齐输出。默认情况下，`printf` 使用右对齐。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 42;\n    \n    printf(\"右对齐: '%5d'\\n\", num);   // 输出: '   42'\n    printf(\"左对齐: '%-5d'\\n\", num);  // 输出: '42   '\n    return 0;\n}"
  },
  {
    "id": 7,
    "question": "`scanf(\"%s\")` 读字符串的安全风险是？",
    "options": ["无法读取数字", "读取到换行符", "输入过长导致缓冲区溢出", "只能读取单个字符"],
    "correctAnswer": 2,
    "explanation": "`scanf(\"%s\")` 不会检查输入字符串的长度，如果用户输入超过目标缓冲区大小的字符串，会导致缓冲区溢出，这是严重的安全漏洞。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char str[10];  // 只能存储9个字符+空字符\n    \n    // 危险：如果输入超过9个字符，会导致缓冲区溢出\n    scanf(\"%s\", str);\n    \n    // 更安全的做法：使用fgets或指定最大宽度\n    // scanf(\"%9s\", str);  // 限制最多读取9个字符\n    \n    printf(\"输入: %s\\n\", str);\n    return 0;\n}"
  },
  {
    "id": 8,
    "question": "`printf` 输出带前缀的十六进制（如 `0x1a`），用哪个格式符？",
    "options": ["`%x`", "`%X`", "`%#x`", "`%0x`"],
    "correctAnswer": 2,
    "explanation": "`#` 修饰符用于在八进制和十六进制输出前添加前缀（`0` 或 `0x`/`0X`）。`%#x` 输出小写十六进制带 `0x` 前缀，`%#X` 输出大写十六进制带 `0X` 前缀。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 26;\n    \n    printf(\"普通十六进制: %x\\n\", num);    // 输出: 1a\n    printf(\"带前缀十六进制: %#x\\n\", num);  // 输出: 0x1a\n    printf(\"大写带前缀: %#X\\n\", num);     // 输出: 0X1A\n    return 0;\n}"
  },
  {
    "id": 9,
    "question": "`scanf` 读含空格的字符串（如 `\"Hello World\"`），用哪个格式符？",
    "options": ["`%s`", "`%[^\\n]`", "`%c`", "`%d`"],
    "correctAnswer": 1,
    "explanation": "`%[^\\n]` 可以读取包含空格的字符串，直到遇到换行符为止。而 `%s` 遇到空格、制表符、换行符就会停止读取。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char str1[50], str2[50];\n    \n    printf(\"使用%%s读取: \");\n    scanf(\"%s\", str1);  // 输入: Hello World\n    // str1只包含\"Hello\"\n    \n    // 清空输入缓冲区\n    while (getchar() != '\\n');\n    \n    printf(\"使用%%[^\\n]读取: \");\n    scanf(\"%[^\\n]\", str2);  // 输入: Hello World\n    // str2包含\"Hello World\"\n    \n    printf(\"str1: %s\\n\", str1);  // 输出: Hello\n    printf(\"str2: %s\\n\", str2);  // 输出: Hello World\n    return 0;\n}"
  },
  {
    "id": 10,
    "question": "`printf` 中 `%.2f` 的含义是？",
    "options": ["宽度为2输出浮点数", "保留2位小数输出浮点数", "输出2个浮点数", "输出浮点数前2位"],
    "correctAnswer": 1,
    "explanation": "`.2` 表示精度，用于指定浮点数的小数位数。`%.2f` 表示保留2位小数输出浮点数。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    double pi = 3.14159;\n    \n    printf(\"默认输出: %f\\n\", pi);      // 输出: 3.141590\n    printf(\"保留2位小数: %.2f\\n\", pi);  // 输出: 3.14\n    printf(\"保留4位小数: %.4f\\n\", pi);  // 输出: 3.1416\n    return 0;\n}"
  },
  {
    "id": 11,
    "question": "`printf(\"%05d\", 42)` 的输出结果是什么？",
    "options": ["`42000`", "`00042`", "`42   `", "`  042`"],
    "correctAnswer": 1,
    "explanation": "`0` 标志表示用 `0` 填充，`5` 表示总宽度为5。所以会在数字前面补0，使总宽度达到5位。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"%05d\\n\", 42);     // 输出: 00042\n    printf(\"%05d\\n\", 1234);   // 输出: 01234\n    printf(\"%05d\\n\", 123456); // 输出: 123456 (超过宽度不截断)\n    printf(\"%-05d\\n\", 42);    // 输出: 42    (左对齐时0标志无效)\n    return 0;\n}"
  },
  {
    "id": 12,
    "question": "`scanf` 读取两个用逗号分隔的整数（如 `10,20`），正确的格式是？",
    "options": ["`scanf(\"%d,%d\", &a, &b);`", "`scanf(\"%d %d\", &a, &b);`", "`scanf(\"%d-%d\", &a, &b);`", "`scanf(\"%d.%d\", &a, &b);`"],
    "correctAnswer": 0,
    "explanation": "`scanf` 的格式字符串需要与输入格式完全匹配。如果输入是用逗号分隔的，格式字符串中也必须包含逗号。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b;\n    \n    printf(\"请输入两个用逗号分隔的整数（如10,20）: \");\n    scanf(\"%d,%d\", &a, &b);  // 正确读取 10,20\n    \n    printf(\"a = %d, b = %d\\n\", a, b);\n    return 0;\n}"
  },
  {
    "id": 13,
    "question": "`getchar()` 和 `scanf(\"%c\")` 的主要区别是？",
    "options": ["`getchar()` 只能读取字母", "`getchar()` 不需要取地址符&", "`scanf` 更快", "两者完全相同"],
    "correctAnswer": 1,
    "explanation": "`getchar()` 返回读取的字符，不需要传递变量地址；而 `scanf(\"%c\")` 需要传递字符变量的地址（使用&符号）。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char ch1, ch2;\n    \n    printf(\"使用getchar(): \");\n    ch1 = getchar();  // 直接返回值，不需要&\n    getchar();  // 读取换行符\n    \n    printf(\"使用scanf(): \");\n    scanf(\"%c\", &ch1);  // 需要使用&传递地址\n    \n    printf(\"读取的字符: %c\\n\", ch1);\n    return 0;\n}"
  },
  {
    "id": 14,
    "question": "`printf(\"%+d\", 42)` 的输出是什么？",
    "options": ["`42`", "`+42`", "`-42`", "`错误`"],
    "correctAnswer": 1,
    "explanation": "`+` 标志表示总是显示符号，无论数字是正数还是负数。正数会显示 `+` 号，负数会显示 `-` 号。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"%+d\\n\", 42);   // 输出: +42\n    printf(\"%+d\\n\", -42);  // 输出: -42\n    printf(\"%d\\n\", 42);    // 输出: 42 (不加+标志)\n    printf(\"%+5d\\n\", 42);  // 输出: '  +42'\n    return 0;\n}"
  },
  {
    "id": 15,
    "question": "`scanf` 读取时如何跳过输入中的空白字符？",
    "options": ["`scanf` 会自动跳过空白字符（除了%c）", "必须使用特殊函数", "不能跳过空白字符", "需要手动清理缓冲区"],
    "correctAnswer": 0,
    "explanation": "`scanf` 在读取大多数类型（如 `%d`、`%f`、`%s`）时会自动跳过前导空白字符。但 `%c` 不会跳过，会读取任何字符包括空格和换行符。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b;\n    char ch;\n    \n    // 自动跳过空白\n    scanf(\"%d %d\", &a, &b);  // 输入: '10    20' 或 '10\\n20' 都可以\n    \n    // %c不跳过空白\n    scanf(\"%c\", &ch);  // 会读取前面的换行符\n    \n    // 强制跳过空白再读取字符\n    scanf(\" %c\", &ch);  // 注意%前面有空格，会跳过空白字符\n    \n    return 0;\n}"
  },
  {
    "id": 16,
    "question": "`printf` 中 `%e` 格式符的作用是？",
    "options": ["输出整数", "输出科学计数法表示的浮点数", "输出八进制", "输出字符"],
    "correctAnswer": 1,
    "explanation": "`%e` 用于以科学计数法（指数形式）输出浮点数，格式为 `[-]d.ddde±dd`。`%E` 则输出大写的 `E`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    double num = 12345.6789;\n    \n    printf(\"普通格式: %f\\n\", num);      // 输出: 12345.678900\n    printf(\"科学计数法: %e\\n\", num);    // 输出: 1.234568e+04\n    printf(\"大写E: %E\\n\", num);         // 输出: 1.234568E+04\n    printf(\"保留2位: %.2e\\n\", num);     // 输出: 1.23e+04\n    return 0;\n}"
  },
  {
    "id": 17,
    "question": "`scanf(\"%3d\", &num)` 的含义是？",
    "options": ["最多读取3个整数", "只读取3位数字", "读取整数并除以3", "输出3个整数"],
    "correctAnswer": 1,
    "explanation": "`%3d` 中的 `3` 表示最大宽度，`scanf` 最多读取3个数字字符来组成整数，即使输入更多数字也只取前3位。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num;\n    \n    printf(\"请输入一个整数: \");\n    scanf(\"%3d\", &num);  // 输入: 123456\n    \n    printf(\"读取的数字: %d\\n\", num);  // 输出: 123 (只读取前3位)\n    \n    // 缓冲区中还剩下: 456\n    scanf(\"%d\", &num);\n    printf(\"继续读取: %d\\n\", num);    // 输出: 456\n    return 0;\n}"
  },
  {
    "id": 18,
    "question": "`printf` 中 `%g` 格式符的特点是？",
    "options": ["总是使用科学计数法", "总是使用普通小数格式", "自动选择%f或%e中更短的格式", "只能输出整数"],
    "correctAnswer": 2,
    "explanation": "`%g` 会根据数值大小和精度自动选择 `%f` 或 `%e` 格式中更简洁的一种，并且会去除末尾无意义的零。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    double a = 0.0001234;\n    double b = 1234567.89;\n    double c = 123.456;\n    \n    printf(\"小数: %g\\n\", a);        // 输出: 0.0001234\n    printf(\"大数: %g\\n\", b);        // 输出: 1.23457e+06 (自动用科学计数法)\n    printf(\"普通数: %g\\n\", c);      // 输出: 123.456\n    printf(\"对比%%f: %f\\n\", c);     // 输出: 123.456000\n    return 0;\n}"
  },
  {
    "id": 19,
    "question": "`puts()` 和 `printf(\"%s\\n\")` 的主要区别是？",
    "options": ["`puts()` 不自动换行", "`puts()` 更快且自动换行", "`printf` 不能输出字符串", "两者完全相同"],
    "correctAnswer": 1,
    "explanation": "`puts()` 专门用于输出字符串，会自动在末尾添加换行符，且通常比 `printf` 更快，因为它不需要解析格式字符串。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char str[] = \"Hello, World!\";\n    \n    // 使用puts，自动换行\n    puts(str);  // 输出: Hello, World!\\n\n    \n    // 使用printf，需要手动添加\\n\n    printf(\"%s\\n\", str);  // 输出: Hello, World!\\n\n    \n    // puts更简洁\n    puts(\"简单快速\");\n    \n    return 0;\n}"
  },
  {
    "id": 20,
    "question": "`scanf` 的返回值表示什么？",
    "options": ["读取的字节数", "成功读取并赋值的项目数", "缓冲区剩余字符数", "总是返回1"],
    "correctAnswer": 1,
    "explanation": "`scanf` 返回成功读取并赋值的输入项目数。可以用返回值来判断输入是否成功，返回值小于期望值表示输入失败或格式不匹配。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    int ret;\n    \n    printf(\"请输入三个整数: \");\n    ret = scanf(\"%d %d %d\", &a, &b, &c);\n    \n    printf(\"成功读取 %d 个整数\\n\", ret);\n    \n    if (ret == 3) {\n        printf(\"输入成功: %d, %d, %d\\n\", a, b, c);\n    } else {\n        printf(\"输入失败或不完整\\n\");\n    }\n    \n    return 0;\n}"
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