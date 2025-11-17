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
            // 规范化题目数据（统一为数组格式）
            this.normalizeQuestions(this.questions);
            console.log(`成功加载 ${this.questions.length} 道题目（来自内置题库）`);
            return this.questions;
        } catch (error) {
            console.warn('加载题库失败:', error.message);
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
        return [
    {
        "id": 1,
        "question": "假设 int a = 10, b = 3;，请问表达式 a / b 的结果是多少？",
        "options": [
            "3.333...",
            "3",
            "1",
            "0"
        ],
        "correctAnswer": 1,
        "explanation": "在C语言中，两个整数相除得到整数结果，10 / 3 = 3（向下取整）。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 10, b = 3;\n    printf(\"%d\\n\", a / b);  // 输出: 3\n    return 0;\n}"
    },
    {
        "id": 2,
        "question": "对于表达式 (1 > 0) || (0 / x)，如果 x 的值为0，在不考虑编译错误的情况下，这个表达式的求值结果和过程是怎样的？",
        "options": [
            "结果为0，因为会发生除零错误。",
            "结果为1，因为第一个子表达式为真，第二个子表达式未求值。",
            "结果为0，因为第二个子表达式的值是0。",
            "结果为1，但会弹出除零错误的警告。"
        ],
        "correctAnswer": 1,
        "explanation": "由于短路求值（short-circuit evaluation），当 || 运算符的第一个操作数为真时，不会计算第二个操作数。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 0;\n    int result = (1 > 0) || (0 / x);  // 结果为1，不会执行除零操作\n    printf(\"%d\\n\", result);  // 输出: 1\n    return 0;\n}"
    },
    {
        "id": 3,
        "question": "假设 int i = 5;，执行语句 int j = i++ + ++i; 后，i 和 j 的值分别是多少？（考虑标准的C语言行为，但请注意此种表达式的未定义行为）",
        "options": [
            "i=7, j=12",
            "i=7, j=13",
            "i=7, j=11",
            "该表达式涉及到对同一个变量的多次修改而没有序列点分隔，属于未定义行为（Undefined Behavior）。"
        ],
        "correctAnswer": 3,
        "explanation": "在同一个表达式中对同一变量进行多次修改（没有序列点分隔）是未定义行为，结果取决于编译器实现。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int i = 5;\n    // 警告：未定义行为！\n    // int j = i++ + ++i;  // 不要这样写！\n    \n    // 正确的写法：\n    int j = i++;\n    j += ++i;\n    printf(\"i=%d, j=%d\\n\", i, j);\n    return 0;\n}"
    },
    {
        "id": 4,
        "question": "假设 int x = 2, y = 3;，执行 x *= y + 5; 后，x 的值是多少？",
        "options": [
            "16",
            "11",
            "13",
            "6"
        ],
        "correctAnswer": 0,
        "explanation": "x *= y + 5 等价于 x = x * (y + 5) = 2 * (3 + 5) = 2 * 8 = 16。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 2, y = 3;\n    x *= y + 5;  // 等价于 x = x * (y + 5)\n    printf(\"%d\\n\", x);  // 输出: 16\n    return 0;\n}"
    },
    {
        "id": 5,
        "question": "下列哪个表达式可以正确判断整数变量 num 是否为偶数？",
        "options": [
            "num % 2 == 0",
            "num / 2 == 0",
            "num & 1 == 0",
            "!(num % 2)"
        ],
        "correctAnswer": 0,
        "explanation": "num % 2 == 0 可以正确判断偶数。注意选项C由于运算符优先级问题，实际是 num & (1 == 0)，这是错误的。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 4;\n    if (num % 2 == 0) {\n        printf(\"%d 是偶数\\n\", num);\n    } else {\n        printf(\"%d 是奇数\\n\", num);\n    }\n    return 0;\n}"
    },
    {
        "id": 6,
        "question": "假设 int a = 1, b = 0;，请问表达式 (a > b) ? a + 1 : b - 1 的结果是多少？",
        "options": [
            "1",
            "2",
            "0",
            "-1"
        ],
        "correctAnswer": 1,
        "explanation": "三元运算符：a > b 为真（1 > 0），所以返回 a + 1 = 1 + 1 = 2。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 1, b = 0;\n    int result = (a > b) ? a + 1 : b - 1;\n    printf(\"%d\\n\", result);  // 输出: 2\n    return 0;\n}"
    },
    {
        "id": 7,
        "question": "在C语言中，int 类型通常占用 4 字节。假设 unsigned int n = 0xAA;（十六进制），表达式 n << 4 的结果（用十六进制表示）是多少？",
        "options": [
            "0xAA0",
            "0x55",
            "0xAA4",
            "0xA"
        ],
        "correctAnswer": 0,
        "explanation": "左移4位相当于乘以16。0xAA << 4 = 0xAA * 16 = 0xAA0。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    unsigned int n = 0xAA;\n    unsigned int result = n << 4;\n    printf(\"0x%X\\n\", result);  // 输出: 0xAA0\n    return 0;\n}"
    },
    {
        "id": 8,
        "question": "假设 int i = 5;，表达式 (double)i / 2 的结果是多少？",
        "options": [
            "2",
            "2.5",
            "2.0",
            "5"
        ],
        "correctAnswer": 1,
        "explanation": "类型转换后，5.0 / 2 = 2.5（double类型）。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int i = 5;\n    double result = (double)i / 2;\n    printf(\"%.1f\\n\", result);  // 输出: 2.5\n    return 0;\n}"
    },
    {
        "id": 9,
        "question": "假设 int p = 5;，请问表达式 p > 0 && p++ > 5 求值后，p 的值是多少？",
        "options": [
            "5",
            "6",
            "7",
            "无法确定"
        ],
        "correctAnswer": 1,
        "explanation": "p > 0 为真，继续计算 p++ > 5（先比较5 > 5为假，然后p变为6）。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int p = 5;\n    int result = p > 0 && p++ > 5;\n    printf(\"p=%d, result=%d\\n\", p, result);  // 输出: p=6, result=0\n    return 0;\n}"
    },
    {
        "id": 10,
        "question": "假设 int a = 1, b = 2, c = 3;，请问表达式 !a || b && !c 的求值结果是多少？",
        "options": [
            "1",
            "0",
            "2",
            "3"
        ],
        "correctAnswer": 1,
        "explanation": "运算符优先级：!a || (b && !c) = !1 || (2 && !3) = 0 || (2 && 0) = 0 || 0 = 0。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 1, b = 2, c = 3;\n    int result = !a || b && !c;\n    printf(\"%d\\n\", result);  // 输出: 0\n    return 0;\n}"
    },
    {
        "id": 11,
        "question": "假设 int a = 1, b = 2;，表达式 a + b * (a - b) 的结果是多少？",
        "options": [
            "0",
            "1",
            "-1",
            "3"
        ],
        "correctAnswer": 2,
        "explanation": "先算括号：a - b = 1 - 2 = -1，然后 b * (-1) = 2 * (-1) = -2，最后 a + (-2) = 1 + (-2) = -1。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 1, b = 2;\n    int result = a + b * (a - b);\n    printf(\"%d\\n\", result);  // 输出: -1\n    return 0;\n}"
    },
    {
        "id": 12,
        "question": "假设 int x = 5;，语句 x = (x > 3) ? 10 : 20; 执行后，x 的值是多少？",
        "options": [
            "5",
            "10",
            "20",
            "3"
        ],
        "correctAnswer": 1,
        "explanation": "x > 3 为真（5 > 3），所以返回10。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 5;\n    x = (x > 3) ? 10 : 20;\n    printf(\"%d\\n\", x);  // 输出: 10\n    return 0;\n}"
    },
    {
        "id": 13,
        "question": "假设 int mask = 0x01;，如何使用位运算符来判断整数变量 data 的最低位（第 0 位）是否为 1？",
        "options": [
            "data & 1",
            "data | 1",
            "data ^ 1",
            "data == mask"
        ],
        "correctAnswer": 0,
        "explanation": "使用按位与运算符 & 可以检查特定位。data & 1 检查最低位是否为1。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int data = 5;  // 二进制: 101\n    if (data & 1) {\n        printf(\"最低位是1\\n\");\n    } else {\n        printf(\"最低位是0\\n\");\n    }\n    return 0;\n}"
    },
    {
        "id": 14,
        "question": "表达式 sizeof(5 / 2) 的结果值是多少？（假设 int 类型占 4 字节）",
        "options": [
            "2",
            "4",
            "8",
            "1"
        ],
        "correctAnswer": 1,
        "explanation": "5 / 2 是整数除法，结果为int类型，sizeof(int) = 4字节。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"%zu\\n\", sizeof(5 / 2));  // 输出: 4\n    return 0;\n}"
    },
    {
        "id": 15,
        "question": "假设 int x = 10;，表达式 x > 10 || (x = 5); 执行后，x 的值是多少？",
        "options": [
            "10",
            "5",
            "1",
            "0"
        ],
        "correctAnswer": 1,
        "explanation": "x > 10 为假（10 > 10），继续计算 x = 5，x被赋值为5。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 10;\n    int result = x > 10 || (x = 5);\n    printf(\"x=%d, result=%d\\n\", x, result);  // 输出: x=5, result=1\n    return 0;\n}"
    },
    {
        "id": 16,
        "question": "假设 int num = 0x8A; (十六进制)，表达式 num >> 3 的结果（十进制）是多少？",
        "options": [
            "17",
            "45",
            "10",
            "69"
        ],
        "correctAnswer": 0,
        "explanation": "0x8A = 138（十进制），右移3位相当于除以8，138 >> 3 = 17。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 0x8A;\n    int result = num >> 3;\n    printf(\"%d\\n\", result);  // 输出: 17\n    return 0;\n}"
    },
    {
        "id": 17,
        "question": "表达式 1 & 2 | 4 的结果是多少？",
        "options": [
            "1",
            "4",
            "5",
            "6"
        ],
        "correctAnswer": 1,
        "explanation": "运算符优先级：1 & 2 | 4 = (1 & 2) | 4 = 0 | 4 = 4。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int result = 1 & 2 | 4;\n    printf(\"%d\\n\", result);  // 输出: 4\n    return 0;\n}"
    },
    {
        "id": 18,
        "question": "下列哪个表达式可以将整数变量 x 的值限制在 [1, 10] 的范围内？",
        "options": [
            "x = (x < 1) ? 1 : (x > 10) ? 10 : x;",
            "x = x < 1 && x > 10 ? x : 10;",
            "x = (x % 10) + 1;",
            "x = (x > 1) ? 10 : 1;"
        ],
        "correctAnswer": 0,
        "explanation": "嵌套三元运算符：如果 x < 1 则设为1，否则如果 x > 10 则设为10，否则保持x不变。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 15;\n    x = (x < 1) ? 1 : (x > 10) ? 10 : x;\n    printf(\"%d\\n\", x);  // 输出: 10\n    return 0;\n}"
    },
    {
        "id": 19,
        "question": "表达式 (int)3.14 + 1.8 的结果类型和值分别是多少？",
        "options": [
            "int, 4",
            "double, 4.8",
            "double, 4.94",
            "int, 5"
        ],
        "correctAnswer": 1,
        "explanation": "(int)3.14 = 3（int），然后 3 + 1.8 提升为double类型，结果为4.8。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    double result = (int)3.14 + 1.8;\n    printf(\"%.1f\\n\", result);  // 输出: 4.8\n    return 0;\n}"
    },
    {
        "id": 20,
        "question": "假设 int a, b, c;，执行语句 a = b = c = 5; 后，a、b、c 的值分别是多少？",
        "options": [
            "a=5, b=5, c=5",
            "a=0, b=0, c=5",
            "a=5, b=0, c=0",
            "未定义行为"
        ],
        "correctAnswer": 0,
        "explanation": "连续赋值从右到左执行：c = 5（返回5），b = 5（返回5），a = 5。所有变量都被赋值为5。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    a = b = c = 5;  // 从右到左：c=5, b=5, a=5\n    printf(\"a=%d, b=%d, c=%d\\n\", a, b, c);  // 输出: a=5, b=5, c=5\n    return 0;\n}"
    },
    {
        "id": 21,
        "question": "假设 int x = 1, y = 2;，执行语句 x = y = x + y; 后，x 和 y 的值分别是多少？",
        "options": [
            "x=3, y=3",
            "x=3, y=2",
            "x=1, y=3",
            "x=2, y=3"
        ],
        "correctAnswer": 0,
        "explanation": "先计算 x + y = 1 + 2 = 3，然后从右到左赋值：y = 3（返回3），x = 3。所以 x=3, y=3。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 1, y = 2;\n    x = y = x + y;  // 先计算 x+y=3，然后 y=3, x=3\n    printf(\"x=%d, y=%d\\n\", x, y);  // 输出: x=3, y=3\n    return 0;\n}"
    },
    {
        "id": 22,
        "question": "假设 int x = 5, y, z;，执行语句 y = z = x++; 后，x、y、z 的值分别是多少？",
        "options": [
            "x=6, y=5, z=5",
            "x=6, y=6, z=6",
            "x=5, y=5, z=5",
            "x=6, y=5, z=6"
        ],
        "correctAnswer": 0,
        "explanation": "x++ 先返回x的值5，然后x变为6。从右到左：z = 5（返回5），y = 5。所以 x=6, y=5, z=5。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 5, y, z;\n    y = z = x++;  // x++返回5，然后x变为6；z=5, y=5\n    printf(\"x=%d, y=%d, z=%d\\n\", x, y, z);  // 输出: x=6, y=5, z=5\n    return 0;\n}"
    },
    {
        "id": 23,
        "question": "假设 int a = 1, b = 0, c = 2;，表达式 a && b || c 的求值结果是多少？",
        "options": [
            "0",
            "1",
            "2",
            "3"
        ],
        "correctAnswer": 1,
        "explanation": "运算符优先级：a && b || c = (a && b) || c = (1 && 0) || 2 = 0 || 2 = 1（非零为真）。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 1, b = 0, c = 2;\n    int result = a && b || c;\n    printf(\"%d\\n\", result);  // 输出: 1\n    return 0;\n}"
    },
    {
        "id": 24,
        "question": "假设 int a = 2, b = 3, c;，执行语句 c = a = b; 后，a、b、c 的值分别是多少？",
        "options": [
            "a=3, b=3, c=3",
            "a=2, b=3, c=2",
            "a=3, b=3, c=2",
            "a=2, b=3, c=3"
        ],
        "correctAnswer": 0,
        "explanation": "从右到左执行：a = b（a被赋值为3，返回3），c = 3。所以 a=3, b=3, c=3。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 2, b = 3, c;\n    c = a = b;  // 从右到左：a=b(3), c=3\n    printf(\"a=%d, b=%d, c=%d\\n\", a, b, c);  // 输出: a=3, b=3, c=3\n    return 0;\n}"
    },
    {
        "id": 25,
        "question": "假设 int a = 1, b = 2, c = 3;，执行语句 a = b = c = a + b + c; 后，a、b、c 的值分别是多少？",
        "options": [
            "a=6, b=6, c=6",
            "a=1, b=2, c=6",
            "a=6, b=3, c=3",
            "a=3, b=3, c=3"
        ],
        "correctAnswer": 0,
        "explanation": "先计算 a + b + c = 1 + 2 + 3 = 6，然后从右到左赋值：c = 6（返回6），b = 6（返回6），a = 6。所以 a=6, b=6, c=6。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 1, b = 2, c = 3;\n    a = b = c = a + b + c;  // 先计算 1+2+3=6，然后 c=6, b=6, a=6\n    printf(\"a=%d, b=%d, c=%d\\n\", a, b, c);  // 输出: a=6, b=6, c=6\n    return 0;\n}"
    },
    {
        "id": 26,
        "question": "假设 int x = 10;，表达式 x > 0 ? (x++) : (x--); 执行后，x 的值是多少？",
        "options": [
            "9",
            "10",
            "11",
            "12"
        ],
        "correctAnswer": 2,
        "explanation": "x > 0 为真（10 > 0），执行 x++，x先使用值10，然后x变为11。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 10;\n    int result = x > 0 ? (x++) : (x--);\n    printf(\"x=%d, result=%d\\n\", x, result);  // 输出: x=11, result=10\n    return 0;\n}"
    },
    {
        "id": 27,
        "question": "表达式 5 / 2.0 的结果类型和值分别是多少？",
        "options": [
            "int, 2",
            "double, 2.5",
            "double, 2.0",
            "int, 3"
        ],
        "correctAnswer": 1,
        "explanation": "2.0是double类型，所以整个表达式提升为double类型，结果为2.5。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    double result = 5 / 2.0;\n    printf(\"%.1f\\n\", result);  // 输出: 2.5\n    return 0;\n}"
    },
    {
        "id": 28,
        "question": "假设 int i = 8;，表达式 i > 10 || ++i 求值后，i 的值是多少？",
        "options": [
            "8",
            "9",
            "10",
            "无法确定"
        ],
        "correctAnswer": 1,
        "explanation": "i > 10 为假（8 > 10），继续计算 ++i，i变为9。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int i = 8;\n    int result = i > 10 || ++i;\n    printf(\"i=%d, result=%d\\n\", i, result);  // 输出: i=9, result=1\n    return 0;\n}"
    },
    {
        "id": 29,
        "question": "假设 int a = 6, b = 2;，表达式 a % b * 2 + 1 的结果是多少？",
        "options": [
            "1",
            "13",
            "3",
            "0"
        ],
        "correctAnswer": 0,
        "explanation": "运算符优先级：先算 a % b = 6 % 2 = 0，然后 0 * 2 = 0，最后 0 + 1 = 1。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 6, b = 2;\n    int result = a % b * 2 + 1;\n    printf(\"%d\\n\", result);  // 输出: 1\n    return 0;\n}"
    },
    {
        "id": 30,
        "question": "表达式 !0 的值是多少？",
        "options": [
            "0",
            "1",
            "-1",
            "不确定"
        ],
        "correctAnswer": 1,
        "explanation": "逻辑非运算符：!0 = 1（0的否定为真，在C语言中真值为1）。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"%d\\n\", !0);  // 输出: 1\n    return 0;\n}"
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