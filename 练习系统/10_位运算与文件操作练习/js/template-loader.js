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
            // 打乱题库顺序
            console.log('[TemplateLoader] 打乱题库顺序...');
            this.shuffleQuestions();
            // 重新分配题目ID（保持1到n的顺序）
            this.reassignQuestionIds();
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
                id: 1,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 5;  // 二进制: 0101\nint y = 3;  // 二进制: 0011\nprintf(\"%d\", x & y);\n</C>",
                options: [
                    "`1`",
                    "`3`",
                    "`5`",
                    "`7`"
                ],
                correctAnswer: 0,
                explanation: "按位与运算（&）：对应位都是1时结果为1。0101 & 0011 = 0001，十进制为1。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 5;  // 0101\n    int y = 3;  // 0011\n    \n    printf(\"x & y = %d\\n\", x & y);   // 0001 = 1\n    printf(\"x | y = %d\\n\", x | y);   // 0111 = 7\n    printf(\"x ^ y = %d\\n\", x ^ y);   // 0110 = 6\n    printf(\"~x = %d\\n\", ~x);         // 按位取反\n    \n    return 0;\n}"
            },
            {
                id: 2,
                question: "关于按位或运算（|），以下说法正确的是：",
                options: [
                    "只有对应位都是1时结果为1",
                    "只有对应位都是0时结果为0",
                    "对应位有一个是1时结果为1",
                    "对应位不同时结果为1"
                ],
                correctAnswer: 2,
                explanation: "按位或（|）：对应位有至少一个是1时结果为1，两个都是0时结果为0。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int a = 12;  // 1100\n    int b = 10;  // 1010\n    \n    int result = a | b;  // 1110 = 14\n    printf(\"%d | %d = %d\\n\", a, b, result);\n    \n    // 常用于设置标志位\n    int flags = 0;\n    flags = flags | 1;  // 设置第0位\n    flags = flags | 4;  // 设置第2位\n    printf(\"flags = %d (二进制: 0101)\\n\", flags);\n    \n    return 0;\n}"
            },
            {
                id: 3,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 8;  // 二进制: 1000\nprintf(\"%d\", x >> 2);\n</C>",
                options: [
                    "`2`",
                    "`4`",
                    "`16`",
                    "`32`"
                ],
                correctAnswer: 0,
                explanation: "右移运算（>>）：将二进制位向右移动。1000 >> 2 = 0010，十进制为2。右移n位相当于除以2^n。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 8;  // 1000\n    \n    printf(\"x >> 1 = %d\\n\", x >> 1);  // 0100 = 4\n    printf(\"x >> 2 = %d\\n\", x >> 2);  // 0010 = 2\n    printf(\"x >> 3 = %d\\n\", x >> 3);  // 0001 = 1\n    \n    // 等价于除法\n    printf(\"x / 2 = %d\\n\", x / 2);\n    printf(\"x / 4 = %d\\n\", x / 4);\n    \n    return 0;\n}"
            },
            {
                id: 4,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 3;  // 二进制: 0011\nprintf(\"%d\", x << 2);\n</C>",
                options: [
                    "`6`",
                    "`9`",
                    "`12`",
                    "`1`"
                ],
                correctAnswer: 2,
                explanation: "左移运算（<<）：将二进制位向左移动。0011 << 2 = 1100，十进制为12。左移n位相当于乘以2^n。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 3;  // 0011\n    \n    printf(\"x << 1 = %d\\n\", x << 1);  // 0110 = 6\n    printf(\"x << 2 = %d\\n\", x << 2);  // 1100 = 12\n    printf(\"x << 3 = %d\\n\", x << 3);  // 11000 = 24\n    \n    // 等价于乘法\n    printf(\"x * 2 = %d\\n\", x * 2);\n    printf(\"x * 4 = %d\\n\", x * 4);\n    \n    return 0;\n}"
            },
            {
                id: 5,
                question: "关于按位异或运算（^），以下说法正确的是：",
                options: [
                    "对应位相同时结果为1",
                    "对应位不同时结果为1",
                    "对应位都是1时结果为1",
                    "对应位都是0时结果为1"
                ],
                correctAnswer: 1,
                explanation: "按位异或（^）：对应位不同时结果为1，相同时结果为0。常用于交换变量、加密等。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int a = 5;  // 0101\n    int b = 3;  // 0011\n    \n    printf(\"a ^ b = %d\\n\", a ^ b);  // 0110 = 6\n    \n    // 异或性质：a ^ a = 0, a ^ 0 = a\n    printf(\"a ^ a = %d\\n\", a ^ a);  // 0\n    printf(\"a ^ 0 = %d\\n\", a ^ 0);  // 5\n    \n    // 交换两个数（不用临时变量）\n    int x = 10, y = 20;\n    x = x ^ y;\n    y = x ^ y;  // y = (x^y) ^ y = x\n    x = x ^ y;  // x = (x^y) ^ x = y\n    printf(\"交换后: x=%d, y=%d\\n\", x, y);\n    \n    return 0;\n}"
            },
            {
                id: 6,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 7;  // 二进制: 0111\nprintf(\"%d\", ~x);\n</C>",
                options: [
                    "`-8`",
                    "`-7`",
                    "`7`",
                    "`8`"
                ],
                correctAnswer: 0,
                explanation: "按位取反（~）：所有位取反。对于有符号整数，~x = -(x+1)。~7 = -8。这涉及补码表示。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 7;\n    printf(\"~%d = %d\\n\", x, ~x);  // -8\n    \n    // 验证公式: ~x = -(x+1)\n    printf(\"-(x+1) = %d\\n\", -(x+1));\n    \n    // 其他例子\n    printf(\"~0 = %d\\n\", ~0);    // -1\n    printf(\"~(-1) = %d\\n\", ~(-1));  // 0\n    \n    return 0;\n}"
            },
            {
                id: 7,
                question: "以下代码实现的功能是：\n\n<C>\nint check_bit(int num, int pos) {\n    return (num >> pos) & 1;\n}\n</C>",
                options: [
                    "设置第pos位为1",
                    "清除第pos位为0",
                    "检查第pos位是否为1",
                    "翻转第pos位"
                ],
                correctAnswer: 2,
                explanation: "将num右移pos位后，最低位就是原第pos位。与1做与运算得到该位的值（0或1）。",
                codeExample: "#include <stdio.h>\n\nint check_bit(int num, int pos) {\n    return (num >> pos) & 1;\n}\n\nint set_bit(int num, int pos) {\n    return num | (1 << pos);\n}\n\nint clear_bit(int num, int pos) {\n    return num & ~(1 << pos);\n}\n\nint toggle_bit(int num, int pos) {\n    return num ^ (1 << pos);\n}\n\nint main() {\n    int x = 5;  // 0101\n    \n    printf(\"x = %d (0101)\\n\", x);\n    printf(\"第0位: %d\\n\", check_bit(x, 0));  // 1\n    printf(\"第1位: %d\\n\", check_bit(x, 1));  // 0\n    printf(\"第2位: %d\\n\", check_bit(x, 2));  // 1\n    \n    printf(\"\\n设置第1位: %d\\n\", set_bit(x, 1));  // 7 (0111)\n    printf(\"清除第0位: %d\\n\", clear_bit(x, 0));  // 4 (0100)\n    printf(\"翻转第1位: %d\\n\", toggle_bit(x, 1));  // 7 (0111)\n    \n    return 0;\n}"
            },
            {
                id: 8,
                question: "关于文件操作函数 `fopen`，以下说法正确的是：",
                options: [
                    "`fopen` 失败时返回0",
                    "`fopen` 失败时返回NULL",
                    "`fopen` 失败时返回-1",
                    "`fopen` 永远不会失败"
                ],
                correctAnswer: 1,
                explanation: "`fopen` 失败时返回NULL指针。使用前应检查返回值，避免对NULL指针操作导致程序崩溃。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen(\"test.txt\", \"r\");\n    \n    if (fp == NULL) {\n        printf(\"文件打开失败\\n\");\n        return 1;\n    }\n    \n    printf(\"文件打开成功\\n\");\n    \n    // 使用文件...\n    \n    fclose(fp);\n    return 0;\n}"
            },
            {
                id: 9,
                question: "以下哪个是正确的文件打开模式？",
                options: [
                    "`\"r\"` - 读取模式，文件不存在则创建",
                    "`\"w\"` - 写入模式，文件存在则覆盖",
                    "`\"a\"` - 追加模式，文件不存在则报错",
                    "`\"x\"` - 独占模式"
                ],
                correctAnswer: 1,
                explanation: "`\"r\"` 读取，文件不存在返回NULL；`\"w\"` 写入，文件存在则清空；`\"a\"` 追加，文件不存在则创建。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 读取模式（文件必须存在）\n    FILE *fp1 = fopen(\"input.txt\", \"r\");\n    \n    // 写入模式（清空或创建）\n    FILE *fp2 = fopen(\"output.txt\", \"w\");\n    \n    // 追加模式（不清空，追加到末尾）\n    FILE *fp3 = fopen(\"log.txt\", \"a\");\n    \n    // 读写模式\n    FILE *fp4 = fopen(\"data.txt\", \"r+\");\n    \n    // 关闭文件\n    if (fp1) fclose(fp1);\n    if (fp2) fclose(fp2);\n    if (fp3) fclose(fp3);\n    if (fp4) fclose(fp4);\n    \n    return 0;\n}"
            },
            {
                id: 10,
                question: "以下代码的功能是：\n\n<C>\nFILE *fp = fopen(\"data.txt\", \"w\");\nif (fp != NULL) {\n    fputc('A', fp);\n    fclose(fp);\n}\n</C>",
                options: [
                    "从文件读取一个字符",
                    "向文件写入一个字符",
                    "向文件写入一个字符串",
                    "删除文件"
                ],
                correctAnswer: 1,
                explanation: "`fputc` 向文件写入一个字符。这段代码创建文件并写入字符'A'。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 写入单个字符\n    FILE *fp = fopen(\"test.txt\", \"w\");\n    if (fp != NULL) {\n        fputc('H', fp);\n        fputc('e', fp);\n        fputc('l', fp);\n        fputc('l', fp);\n        fputc('o', fp);\n        fclose(fp);\n    }\n    \n    // 读取单个字符\n    fp = fopen(\"test.txt\", \"r\");\n    if (fp != NULL) {\n        int ch;\n        while ((ch = fgetc(fp)) != EOF) {\n            putchar(ch);\n        }\n        fclose(fp);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 11,
                question: "关于 `fgetc` 函数，以下说法正确的是：",
                options: [
                    "`fgetc` 返回类型是 `char`",
                    "`fgetc` 返回类型是 `int`",
                    "`fgetc` 不能检测文件结束",
                    "`fgetc` 只能读取ASCII字符"
                ],
                correctAnswer: 1,
                explanation: "`fgetc` 返回 `int` 类型，因为需要能表示EOF（通常是-1）。如果返回char，无法区分EOF和字符0xFF。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen(\"input.txt\", \"r\");\n    if (fp == NULL) {\n        printf(\"文件打开失败\\n\");\n        return 1;\n    }\n    \n    int ch;  // 注意：int类型，不是char\n    while ((ch = fgetc(fp)) != EOF) {\n        putchar(ch);\n    }\n    \n    if (feof(fp)) {\n        printf(\"\\n到达文件末尾\\n\");\n    }\n    \n    fclose(fp);\n    return 0;\n}"
            },
            {
                id: 12,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 10;\nint y = x >> 1;\nint z = x << 1;\nprintf(\"%d %d\", y, z);\n</C>",
                options: [
                    "`5 20`",
                    "`5 10`",
                    "`10 20`",
                    "`20 5`"
                ],
                correctAnswer: 0,
                explanation: "`x >> 1` 相当于除以2，结果为5。`x << 1` 相当于乘以2，结果为20。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 10;\n    \n    int y = x >> 1;  // 10 / 2 = 5\n    int z = x << 1;  // 10 * 2 = 20\n    \n    printf(\"y = %d, z = %d\\n\", y, z);\n    \n    // 更多例子\n    printf(\"x >> 2 = %d (除以4)\\n\", x >> 2);  // 2\n    printf(\"x << 2 = %d (乘以4)\\n\", x << 2);  // 40\n    \n    return 0;\n}"
            },
            {
                id: 13,
                question: "关于 `fclose` 函数，以下说法正确的是：",
                options: [
                    "不关闭文件不会有问题",
                    "关闭文件后可以继续使用文件指针",
                    "应该在文件使用完毕后调用 `fclose`",
                    "`fclose` 会删除文件"
                ],
                correctAnswer: 2,
                explanation: "应该及时关闭文件以释放资源和刷新缓冲区。关闭后不能再使用该文件指针，除非重新打开。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen(\"test.txt\", \"w\");\n    if (fp == NULL) {\n        return 1;\n    }\n    \n    fprintf(fp, \"Hello, World!\\n\");\n    \n    // 关闭文件（重要！）\n    fclose(fp);\n    \n    // 错误：关闭后不能再使用\n    // fprintf(fp, \"More text\");  // 危险！\n    \n    // 需要重新打开\n    fp = fopen(\"test.txt\", \"a\");\n    if (fp != NULL) {\n        fprintf(fp, \"Appended text\\n\");\n        fclose(fp);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 14,
                question: "以下代码实现的功能是：\n\n<C>\nint count = 0;\nint n = 15;  // 二进制: 1111\nwhile (n) {\n    count += n & 1;\n    n >>= 1;\n}\nprintf(\"%d\", count);\n</C>",
                options: [
                    "计算n的二进制中1的个数",
                    "计算n的二进制位数",
                    "计算n的值",
                    "将n转换为二进制"
                ],
                correctAnswer: 0,
                explanation: "遍历n的每一位，检查最低位是否为1（n & 1），然后右移。统计所有1的个数。15的二进制是1111，有4个1。",
                codeExample: "#include <stdio.h>\n\nint count_bits(int n) {\n    int count = 0;\n    while (n) {\n        count += n & 1;  // 检查最低位\n        n >>= 1;         // 右移一位\n    }\n    return count;\n}\n\nint main() {\n    printf(\"15的1的个数: %d\\n\", count_bits(15));  // 4\n    printf(\"7的1的个数: %d\\n\", count_bits(7));    // 3\n    printf(\"8的1的个数: %d\\n\", count_bits(8));    // 1\n    printf(\"0的1的个数: %d\\n\", count_bits(0));    // 0\n    \n    return 0;\n}"
            },
            {
                id: 15,
                question: "关于 `fprintf` 和 `fscanf`，以下说法正确的是：",
                options: [
                    "`fprintf` 只能写入字符串",
                    "`fprintf` 类似 `printf`，但输出到文件",
                    "`fscanf` 不能从文件读取",
                    "`fprintf` 和 `printf` 完全相同"
                ],
                correctAnswer: 1,
                explanation: "`fprintf` 是格式化输出到文件，第一个参数是文件指针。`fscanf` 是从文件格式化输入。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 写入文件\n    FILE *fp = fopen(\"data.txt\", \"w\");\n    if (fp != NULL) {\n        fprintf(fp, \"Name: %s\\n\", \"Alice\");\n        fprintf(fp, \"Age: %d\\n\", 25);\n        fprintf(fp, \"Score: %.2f\\n\", 95.5);\n        fclose(fp);\n    }\n    \n    // 读取文件\n    fp = fopen(\"data.txt\", \"r\");\n    if (fp != NULL) {\n        char name[50];\n        int age;\n        float score;\n        \n        fscanf(fp, \"Name: %s\\n\", name);\n        fscanf(fp, \"Age: %d\\n\", &age);\n        fscanf(fp, \"Score: %f\\n\", &score);\n        \n        printf(\"读取: %s, %d, %.2f\\n\", name, age, score);\n        fclose(fp);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 16,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 0b1010;  // 二进制字面量\nint y = 0x0A;    // 十六进制字面量\nprintf(\"%d %d\", x, y);\n</C>",
                options: [
                    "`10 10`",
                    "`1010 10`",
                    "`10 0A`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "`0b1010` 是二进制表示（某些编译器支持），等于10。`0x0A` 是十六进制表示，也等于10。两者都输出10。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int a = 10;      // 十进制\n    int b = 012;     // 八进制（前缀0）\n    int c = 0x0A;    // 十六进制（前缀0x）\n    int d = 0b1010;  // 二进制（某些编译器支持）\n    \n    printf(\"十进制: %d\\n\", a);    // 10\n    printf(\"八进制: %d\\n\", b);    // 10\n    printf(\"十六进制: %d\\n\", c);  // 10\n    printf(\"二进制: %d\\n\", d);    // 10\n    \n    // 不同格式输出\n    printf(\"\\n以不同格式输出10:\\n\");\n    printf(\"十进制: %d\\n\", 10);\n    printf(\"八进制: %o\\n\", 10);\n    printf(\"十六进制: %x\\n\", 10);\n    \n    return 0;\n}"
            },
            {
                id: 17,
                question: "关于位掩码（bit mask），以下说法正确的是：",
                options: [
                    "位掩码用于删除文件",
                    "位掩码用于选择性操作某些位",
                    "位掩码只能是0或1",
                    "位掩码不能用于设置标志位"
                ],
                correctAnswer: 1,
                explanation: "位掩码用于选择性地操作某些位，常用于标志位管理、权限控制等场景。",
                codeExample: "#include <stdio.h>\n\n// 定义标志位\n#define FLAG_READ   0x01  // 0001\n#define FLAG_WRITE  0x02  // 0010\n#define FLAG_EXEC   0x04  // 0100\n#define FLAG_ADMIN  0x08  // 1000\n\nint main() {\n    int permissions = 0;\n    \n    // 设置权限\n    permissions |= FLAG_READ;   // 添加读权限\n    permissions |= FLAG_WRITE;  // 添加写权限\n    \n    printf(\"权限值: %d\\n\", permissions);  // 3 (0011)\n    \n    // 检查权限\n    if (permissions & FLAG_READ) {\n        printf(\"有读权限\\n\");\n    }\n    \n    if (permissions & FLAG_EXEC) {\n        printf(\"有执行权限\\n\");\n    } else {\n        printf(\"无执行权限\\n\");\n    }\n    \n    // 清除权限\n    permissions &= ~FLAG_WRITE;\n    printf(\"清除写权限后: %d\\n\", permissions);  // 1\n    \n    return 0;\n}"
            },
            {
                id: 18,
                question: "以下代码的功能是：\n\n<C>\nFILE *fp = fopen(\"input.txt\", \"r\");\nif (fp != NULL) {\n    fseek(fp, 0, SEEK_END);\n    long size = ftell(fp);\n    printf(\"%ld\", size);\n    fclose(fp);\n}\n</C>",
                options: [
                    "读取文件内容",
                    "获取文件大小",
                    "删除文件",
                    "移动文件"
                ],
                correctAnswer: 1,
                explanation: "`fseek(fp, 0, SEEK_END)` 移动到文件末尾，`ftell(fp)` 返回当前位置（即文件大小）。",
                codeExample: "#include <stdio.h>\n\nlong get_file_size(const char *filename) {\n    FILE *fp = fopen(filename, \"r\");\n    if (fp == NULL) {\n        return -1;\n    }\n    \n    fseek(fp, 0, SEEK_END);  // 移动到末尾\n    long size = ftell(fp);   // 获取位置（文件大小）\n    fclose(fp);\n    \n    return size;\n}\n\nint main() {\n    long size = get_file_size(\"test.txt\");\n    if (size >= 0) {\n        printf(\"文件大小: %ld 字节\\n\", size);\n    } else {\n        printf(\"无法获取文件大小\\n\");\n    }\n    \n    return 0;\n}"
            },
            {
                id: 19,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 13;  // 1101\nint y = x & (x - 1);\nprintf(\"%d\", y);\n</C>",
                options: [
                    "`12`",
                    "`13`",
                    "`14`",
                    "`0`"
                ],
                correctAnswer: 0,
                explanation: "`x & (x-1)` 会清除x二进制中最右边的1。13是1101，12是1100，1101 & 1100 = 1100 = 12。这是常用技巧。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 13;  // 1101\n    printf(\"x = %d (1101)\\n\", x);\n    \n    int y = x & (x - 1);  // 清除最右边的1\n    printf(\"x & (x-1) = %d (1100)\\n\", y);\n    \n    // 应用：判断是否为2的幂\n    int is_power_of_2 = (x > 0) && ((x & (x - 1)) == 0);\n    printf(\"13是2的幂? %s\\n\", is_power_of_2 ? \"是\" : \"否\");\n    \n    x = 16;  // 10000\n    is_power_of_2 = (x > 0) && ((x & (x - 1)) == 0);\n    printf(\"16是2的幂? %s\\n\", is_power_of_2 ? \"是\" : \"否\");\n    \n    return 0;\n}"
            },
            {
                id: 20,
                question: "关于 `feof` 和 `ferror`，以下说法正确的是：",
                options: [
                    "`feof` 检测文件打开是否成功",
                    "`feof` 检测是否到达文件末尾",
                    "`ferror` 用于关闭文件",
                    "`ferror` 检测文件大小"
                ],
                correctAnswer: 1,
                explanation: "`feof` 检测是否到达文件末尾，`ferror` 检测文件操作是否出错。都返回非零表示条件为真。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen(\"test.txt\", \"r\");\n    if (fp == NULL) {\n        printf(\"文件打开失败\\n\");\n        return 1;\n    }\n    \n    int ch;\n    while ((ch = fgetc(fp)) != EOF) {\n        putchar(ch);\n    }\n    \n    // 检查是EOF还是错误\n    if (feof(fp)) {\n        printf(\"\\n到达文件末尾\\n\");\n    }\n    \n    if (ferror(fp)) {\n        printf(\"读取文件时出错\\n\");\n    }\n    \n    fclose(fp);\n    return 0;\n}"
            },
            {
                id: 21,
                question: "以下代码实现的功能是：\n\n<C>\nint swap_bits(int x) {\n    int even = x & 0xAAAAAAAA;  // 偶数位\n    int odd = x & 0x55555555;   // 奇数位\n    return (even >> 1) | (odd << 1);\n}\n</C>",
                options: [
                    "交换两个数",
                    "交换相邻的位",
                    "反转所有位",
                    "清除所有位"
                ],
                correctAnswer: 1,
                explanation: "提取偶数位和奇数位，然后交换它们的位置。0xAAAAAAAA是10101010...，0x55555555是01010101...。",
                codeExample: "#include <stdio.h>\n\nint swap_bits(int x) {\n    int even = x & 0xAAAAAAAA;  // 提取偶数位\n    int odd = x & 0x55555555;   // 提取奇数位\n    return (even >> 1) | (odd << 1);  // 交换\n}\n\nvoid print_binary(int x) {\n    for (int i = 31; i >= 0; i--) {\n        printf(\"%d\", (x >> i) & 1);\n        if (i % 4 == 0) printf(\" \");\n    }\n    printf(\"\\n\");\n}\n\nint main() {\n    int x = 23;  // 10111\n    printf(\"原始值 %d:\\n\", x);\n    print_binary(x);\n    \n    int result = swap_bits(x);\n    printf(\"\\n交换后 %d:\\n\", result);\n    print_binary(result);\n    \n    return 0;\n}"
            },
            {
                id: 22,
                question: "关于文本文件和二进制文件，以下说法正确的是：",
                options: [
                    "文本文件只能包含字母",
                    "二进制文件不能用文本编辑器打开",
                    "文本模式和二进制模式在所有系统上完全相同",
                    "二进制模式用 `\"rb\"` 或 `\"wb\"` 打开"
                ],
                correctAnswer: 3,
                explanation: "二进制模式在文件模式后加'b'（如\"rb\", \"wb\"）。在Windows上，文本模式会转换换行符，二进制模式不会。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 文本模式\n    FILE *fp_text = fopen(\"text.txt\", \"w\");\n    if (fp_text) {\n        fprintf(fp_text, \"Hello\\nWorld\\n\");\n        fclose(fp_text);\n    }\n    \n    // 二进制模式\n    FILE *fp_bin = fopen(\"data.bin\", \"wb\");\n    if (fp_bin) {\n        int numbers[] = {1, 2, 3, 4, 5};\n        fwrite(numbers, sizeof(int), 5, fp_bin);\n        fclose(fp_bin);\n    }\n    \n    // 读取二进制文件\n    fp_bin = fopen(\"data.bin\", \"rb\");\n    if (fp_bin) {\n        int numbers[5];\n        fread(numbers, sizeof(int), 5, fp_bin);\n        for (int i = 0; i < 5; i++) {\n            printf(\"%d \", numbers[i]);\n        }\n        fclose(fp_bin);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 23,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 5;\nint y = 9;\nint z = x | y;\nprintf(\"%d\", z);\n</C>",
                options: [
                    "`1`",
                    "`4`",
                    "`13`",
                    "`14`"
                ],
                correctAnswer: 2,
                explanation: "5是0101，9是1001，按位或：0101 | 1001 = 1101，十进制为13。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 5;   // 0101\n    int y = 9;   // 1001\n    \n    printf(\"x | y = %d\\n\", x | y);   // 1101 = 13\n    printf(\"x & y = %d\\n\", x & y);   // 0001 = 1\n    printf(\"x ^ y = %d\\n\", x ^ y);   // 1100 = 12\n    \n    return 0;\n}"
            },
            {
                id: 24,
                question: "关于 `fread` 和 `fwrite`，以下说法正确的是：",
                options: [
                    "只能用于文本文件",
                    "用于二进制文件的块读写",
                    "不能读写结构体",
                    "比 `fgetc` 和 `fputc` 慢"
                ],
                correctAnswer: 1,
                explanation: "`fread` 和 `fwrite` 用于块读写，特别适合二进制数据和结构体。比逐字节读写更高效。",
                codeExample: "#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    char name[50];\n    int age;\n    float score;\n};\n\nint main() {\n    struct Student s1 = {\"Alice\", 20, 95.5};\n    \n    // 写入结构体\n    FILE *fp = fopen(\"student.dat\", \"wb\");\n    if (fp) {\n        fwrite(&s1, sizeof(struct Student), 1, fp);\n        fclose(fp);\n    }\n    \n    // 读取结构体\n    struct Student s2;\n    fp = fopen(\"student.dat\", \"rb\");\n    if (fp) {\n        fread(&s2, sizeof(struct Student), 1, fp);\n        printf(\"姓名: %s, 年龄: %d, 成绩: %.1f\\n\", \n               s2.name, s2.age, s2.score);\n        fclose(fp);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 25,
                question: "以下代码实现的功能是：\n\n<C>\nint reverse_bits(int x) {\n    int result = 0;\n    for (int i = 0; i < 32; i++) {\n        result = (result << 1) | (x & 1);\n        x >>= 1;\n    }\n    return result;\n}\n</C>",
                options: [
                    "反转整数的二进制位",
                    "计算整数的绝对值",
                    "交换两个整数",
                    "清除所有位"
                ],
                correctAnswer: 0,
                explanation: "逐位提取x的最低位，添加到result的最低位，然后result左移。遍历所有位后完成反转。",
                codeExample: "#include <stdio.h>\n\nint reverse_bits(int x) {\n    int result = 0;\n    for (int i = 0; i < 32; i++) {\n        result = (result << 1) | (x & 1);\n        x >>= 1;\n    }\n    return result;\n}\n\nvoid print_binary(unsigned int x) {\n    for (int i = 31; i >= 0; i--) {\n        printf(\"%d\", (x >> i) & 1);\n        if (i % 8 == 0) printf(\" \");\n    }\n    printf(\"\\n\");\n}\n\nint main() {\n    unsigned int x = 43261596;  // 00000010100101000001111010011100\n    printf(\"原始值:\\n\");\n    print_binary(x);\n    \n    unsigned int reversed = reverse_bits(x);\n    printf(\"\\n反转后:\\n\");\n    print_binary(reversed);\n    \n    return 0;\n}"
            },
            {
                id: 26,
                question: "关于 `rewind` 函数，以下说法正确的是：",
                options: [
                    "`rewind` 删除文件",
                    "`rewind` 将文件指针移到开头",
                    "`rewind` 关闭文件",
                    "`rewind` 创建新文件"
                ],
                correctAnswer: 1,
                explanation: "`rewind(fp)` 等价于 `fseek(fp, 0, SEEK_SET)`，将文件位置指针移到文件开头。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen(\"test.txt\", \"w+\");\n    if (fp == NULL) return 1;\n    \n    // 写入数据\n    fprintf(fp, \"Line 1\\n\");\n    fprintf(fp, \"Line 2\\n\");\n    fprintf(fp, \"Line 3\\n\");\n    \n    // 回到文件开头\n    rewind(fp);\n    \n    // 读取数据\n    char buffer[100];\n    while (fgets(buffer, sizeof(buffer), fp)) {\n        printf(\"%s\", buffer);\n    }\n    \n    fclose(fp);\n    return 0;\n}"
            },
            {
                id: 27,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 0;\nx = x | (1 << 2);\nx = x | (1 << 5);\nprintf(\"%d\", x);\n</C>",
                options: [
                    "`7`",
                    "`36`",
                    "`32`",
                    "`4`"
                ],
                correctAnswer: 1,
                explanation: "设置第2位和第5位为1。`1 << 2` 是4（100），`1 << 5` 是32（100000），合并后是36（100100）。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 0;\n    \n    printf(\"初始: x = %d\\n\", x);\n    \n    x = x | (1 << 2);  // 设置第2位\n    printf(\"设置第2位: x = %d (100)\\n\", x);\n    \n    x = x | (1 << 5);  // 设置第5位\n    printf(\"设置第5位: x = %d (100100)\\n\", x);\n    \n    // 检查某位是否设置\n    if (x & (1 << 2)) {\n        printf(\"第2位已设置\\n\");\n    }\n    \n    return 0;\n}"
            },
            {
                id: 28,
                question: "关于文件定位函数，以下说法正确的是：",
                options: [
                    "`SEEK_SET` 表示从文件末尾开始",
                    "`SEEK_CUR` 表示从当前位置开始",
                    "`SEEK_END` 表示从文件开头开始",
                    "文件定位只能用于文本文件"
                ],
                correctAnswer: 1,
                explanation: "`SEEK_SET` 从文件开头，`SEEK_CUR` 从当前位置，`SEEK_END` 从文件末尾。可用于文本和二进制文件。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    FILE *fp = fopen(\"test.txt\", \"w+\");\n    if (fp == NULL) return 1;\n    \n    fprintf(fp, \"0123456789\");\n    \n    // 从开头偏移5\n    fseek(fp, 5, SEEK_SET);\n    printf(\"位置: %ld\\n\", ftell(fp));  // 5\n    \n    // 从当前位置偏移2\n    fseek(fp, 2, SEEK_CUR);\n    printf(\"位置: %ld\\n\", ftell(fp));  // 7\n    \n    // 从末尾偏移-3\n    fseek(fp, -3, SEEK_END);\n    printf(\"位置: %ld\\n\", ftell(fp));  // 7\n    \n    fclose(fp);\n    return 0;\n}"
            },
            {
                id: 29,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 60;  // 0011 1100\nint y = 13;  // 0000 1101\nprintf(\"%d\", x ^ y);\n</C>",
                options: [
                    "`49`",
                    "`12`",
                    "`61`",
                    "`73`"
                ],
                correctAnswer: 0,
                explanation: "按位异或：0011 1100 ^ 0000 1101 = 0011 0001，十进制为49。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 60;  // 0011 1100\n    int y = 13;  // 0000 1101\n    \n    printf(\"x = %d (0011 1100)\\n\", x);\n    printf(\"y = %d (0000 1101)\\n\", y);\n    printf(\"x ^ y = %d (0011 0001)\\n\", x ^ y);\n    \n    // 异或的应用：简单加密\n    int key = 123;\n    int data = 456;\n    int encrypted = data ^ key;\n    int decrypted = encrypted ^ key;  // 解密\n    printf(\"\\n原始: %d, 加密: %d, 解密: %d\\n\", \n           data, encrypted, decrypted);\n    \n    return 0;\n}"
            },
            {
                id: 30,
                question: "以下代码实现的功能是：\n\n<C>\nvoid copy_file(const char *src, const char *dst) {\n    FILE *in = fopen(src, \"rb\");\n    FILE *out = fopen(dst, \"wb\");\n    if (in && out) {\n        int ch;\n        while ((ch = fgetc(in)) != EOF) {\n            fputc(ch, out);\n        }\n    }\n    if (in) fclose(in);\n    if (out) fclose(out);\n}\n</C>",
                options: [
                    "删除文件",
                    "重命名文件",
                    "复制文件",
                    "合并文件"
                ],
                correctAnswer: 2,
                explanation: "从源文件读取每个字节，写入目标文件，实现文件复制。使用二进制模式确保所有文件类型都能正确复制。",
                codeExample: "#include <stdio.h>\n\nvoid copy_file(const char *src, const char *dst) {\n    FILE *in = fopen(src, \"rb\");\n    FILE *out = fopen(dst, \"wb\");\n    \n    if (in == NULL) {\n        printf(\"无法打开源文件\\n\");\n        return;\n    }\n    \n    if (out == NULL) {\n        printf(\"无法创建目标文件\\n\");\n        fclose(in);\n        return;\n    }\n    \n    int ch;\n    int count = 0;\n    while ((ch = fgetc(in)) != EOF) {\n        fputc(ch, out);\n        count++;\n    }\n    \n    printf(\"复制了 %d 字节\\n\", count);\n    \n    fclose(in);\n    fclose(out);\n}\n\nint main() {\n    copy_file(\"source.txt\", \"destination.txt\");\n    printf(\"文件复制完成\\n\");\n    return 0;\n}"
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