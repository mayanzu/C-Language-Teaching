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
                question: "以下代码的输出结果是什么？\n\n<C>\nint main() {\n    int x = 2, y = 3;\n    if (x & y == 2)  /* 陷阱：优先级 */\n        printf(\"True\");\n    else\n        printf(\"False\");\n    return 0;\n}\n</C>",
                options: [
                    "`True`",
                    "`False`",
                    "编译错误",
                    "未定义行为"
                ],
                correctAnswer: 1,
                explanation: "这是**位运算与关系运算符优先级**陷阱！`==`优先级高于`&`，表达式被解析为`x & (y==2)`而非`(x&y)==2`。**执行过程**：1)`y==2`为假(0)；2)`x&0`=0；3)if(0)为假，输出False。**正确写法**：`if((x&y)==2)`。**关键误区**：误以为&优先级高于==。**优先级表**：算术>移位>关系>位运算>逻辑。**实际案例**：`if(flags&MASK==MASK)`是常见错误，应写`if((flags&MASK)==MASK)`。**记忆技巧**：位运算优先级很低，几乎总需要括号。**类似陷阱**：`a|b==c`、`a^b!=0`等都需要加括号。",
                codeExample: "#include <stdio.h>\n\n#define FLAG_READ  0x01\n#define FLAG_WRITE 0x02\n\nint main() {\n    int x = 2, y = 3;\n    \n    /* 错误：& 优先级低于 == */\n    if (x & y == 2)  /* 解析为: x & (y==2) = 2 & 0 = 0 */\n        printf(\"错误写法: True\\n\");\n    else\n        printf(\"错误写法: False\\n\");  /* 输出此行 */\n    \n    /* 正确：加括号 */\n    if ((x & y) == 2)  /* (2&3)==2 → 2==2 → True */\n        printf(\"正确写法: True\\n\");  /* 输出此行 */\n    else\n        printf(\"正确写法: False\\n\");\n    \n    /* 实际应用场景 */\n    int permissions = FLAG_READ | FLAG_WRITE;  /* 3 (0011) */\n    \n    /* 错误检查 */\n    if (permissions & FLAG_READ == FLAG_READ)  /* 错误！ */\n        printf(\"有读权限(错误)\\n\");\n    else\n        printf(\"无读权限(错误)\\n\");  /* 误判 */\n    \n    /* 正确检查 */\n    if ((permissions & FLAG_READ) == FLAG_READ)  /* 正确 */\n        printf(\"有读权限(正确)\\n\");  /* 输出 */\n    \n    /* 更简洁写法 */\n    if (permissions & FLAG_READ)  /* 非零即真 */\n        printf(\"有读权限(简洁)\\n\");\n    \n    return 0;\n}"
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
                question: "以下代码的输出结果是什么？\n\n<C>\nint main() {\n    signed char x = -4;  /* 11111100 (8位补码) */\n    int y = x >> 1;  /* 算术右移 */\n    printf(\"%d\", y);\n    return 0;\n}\n</C>",
                options: [
                    "`-2`",
                    "`2`",
                    "`126`",
                    "未定义行为"
                ],
                correctAnswer: 0,
                explanation: "这是**有符号数右移的符号扩展**陷阱！对于**有符号负数**，右移是**算术右移**（符号扩展），左侧填充符号位1。-4的二进制(8位)是11111100，右移1位后11111110，仍是负数-2。**无符号数右移**是**逻辑右移**，左侧填充0。**关键知识**：1)C标准未明确规定有符号数右移行为，但大多数编译器实现为算术右移；2)无符号数保证逻辑右移；3)左移对有符号和无符号都是逻辑左移（右侧填0）。**实际应用**：除以2的幂用右移需注意符号，`x>>1`对负数不等于`x/2`（向零舍入vs向下舍入）。**安全做法**：需要除法语义时用除法，不用右移。**易错点**：误以为右移总是填0。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    /* 有符号数右移 */\n    signed char x = -4;  /* 11111100 */\n    printf(\"x = %d (11111100)\\n\", x);\n    \n    int y = x >> 1;  /* 算术右移: 11111110 = -2 */\n    printf(\"x >> 1 = %d\\n\", y);  /* -2 */\n    printf(\"x / 2 = %d\\n\", x / 2);  /* -2 */\n    \n    /* 无符号数右移 */\n    unsigned char ux = 252;  /* 11111100 */\n    printf(\"\\nux = %u (11111100)\\n\", ux);\n    \n    unsigned int uy = ux >> 1;  /* 逻辑右移: 01111110 = 126 */\n    printf(\"ux >> 1 = %u\\n\", uy);  /* 126 */\n    printf(\"ux / 2 = %u\\n\", ux / 2);  /* 126 */\n    \n    /* 陷阱对比 */\n    signed char s = -8;\n    unsigned char u = 248;  /* 相同位模式 */\n    \n    printf(\"\\n有符号 -8 >> 2 = %d\\n\", s >> 2);  /* -2 (填充1) */\n    printf(\"无符号 248 >> 2 = %u\\n\", u >> 2);  /* 62 (填充0) */\n    \n    /* 左移：都是逻辑左移 */\n    printf(\"\\n-4 << 1 = %d\\n\", -4 << 1);  /* -8 */\n    printf(\"252 << 1 = %u\\n\", 252u << 1);  /* 504 */\n    \n    return 0;\n}"
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
                question: "以下代码可能产生什么问题？\n\n<C>\nFILE *fp = fopen(\"binary.dat\", \"rb\");\nif (fp != NULL) {\n    char ch;  /* 错误：应该是int */\n    while ((ch = fgetc(fp)) != EOF) {\n        putchar(ch);\n    }\n    fclose(fp);\n}\n</C>",
                options: [
                    "没有问题",
                    "无法读取文件",
                    "可能死循环（遇到0xFF字节）",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是**fgetc返回类型错误**的经典陷阱！`fgetc`返回`int`而非`char`，因为需要表示EOF(通常-1)和所有字节值(0-255)。**问题根源**：若文件包含字节0xFF(255)，`fgetc`返回255，赋值给`char`（有符号8位）后变成-1，而`EOF`也是-1，导致误判为文件结束或死循环（取决于char是否有符号）。**执行场景**：1)读到0xFF字节；2)255转为signed char变成-1；3)-1==EOF误判结束，或-1!=EOF继续循环输出0xFF；4)二进制文件常含0xFF。**正确写法**：`int ch`。**为什么返回int**：需要257个值(0-255+EOF)，char只能表示256个。**类似陷阱**：getchar、fgetc、getc都返回int。**易错点**：误以为\"读字符\"就用char。",
                codeExample: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    /* 创建包含0xFF的测试文件 */\n    FILE *fp = fopen(\"test.bin\", \"wb\");\n    if (fp) {\n        unsigned char data[] = {0x41, 0x42, 0xFF, 0x43, 0x44};  /* AB<0xFF>CD */\n        fwrite(data, 1, 5, fp);\n        fclose(fp);\n    }\n    \n    printf(\"=== 错误写法（char） ===\\n\");\n    fp = fopen(\"test.bin\", \"rb\");\n    if (fp) {\n        char ch;  /* 错误！ */\n        int count = 0;\n        while ((ch = fgetc(fp)) != EOF && count++ < 10) {  /* 可能死循环 */\n            printf(\"读到: 0x%02X\\n\", (unsigned char)ch);\n        }\n        if (count >= 10) printf(\"检测到死循环！\\n\");\n        fclose(fp);\n    }\n    \n    printf(\"\\n=== 正确写法（int） ===\\n\");\n    fp = fopen(\"test.bin\", \"rb\");\n    if (fp) {\n        int ch;  /* 正确！ */\n        while ((ch = fgetc(fp)) != EOF) {\n            printf(\"读到: 0x%02X\\n\", ch);\n        }\n        printf(\"正常读取完毕\\n\");\n        fclose(fp);\n    }\n    \n    /* EOF值 */\n    printf(\"\\nEOF = %d\\n\", EOF);  /* 通常是-1 */\n    printf(\"0xFF as signed char = %d\\n\", (char)0xFF);  /* -1 */\n    printf(\"0xFF as int = %d\\n\", 0xFF);  /* 255 */\n    \n    return 0;\n}"
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
                question: "以下代码在32位系统上的行为是什么？\n\n<C>\nint main() {\n    int x = 1;\n    int y = x << 31;  /* 左移31位 */\n    printf(\"%d\", y);\n    return 0;\n}\n</C>",
                options: [
                    "`2147483648`",
                    "`-2147483648`",
                    "未定义行为",
                    "`0`"
                ],
                correctAnswer: 2,
                explanation: "这是**有符号整数左移溢出**的未定义行为陷阱！C标准规定，**有符号数左移导致符号位变化是未定义行为**(UB)。1<<31在32位int上会设置符号位，结果未定义。**问题分析**：1)int是有符号类型；2)左移31位后，1进入符号位；3)C89/C99标准：有符号溢出是UB；4)实际行为：可能得到负数、崩溃或被编译器优化掉。**正确做法**：使用无符号类型`unsigned int x=1; unsigned int y=x<<31;`结果是0x80000000(2147483648u)。**相关规则**：1)无符号数左移溢出是良定义的（模运算）；2)右移超过位宽是UB；3)移位负数是UB。**实际案例**：`1<<31`常用于位掩码，必须写`1U<<31`。**编译器行为**：GCC可能优化为-2147483648，但不可依赖。**检测工具**：UBSan能检测此类UB。",
                codeExample: "#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    printf(\"int位数: %lu\\n\", sizeof(int) * 8);\n    \n    /* 未定义行为：有符号左移溢出 */\n    int x = 1;\n    /* int y = x << 31;  危险！UB！ */\n    \n    /* 正确：使用无符号数 */\n    unsigned int ux = 1;\n    unsigned int uy = ux << 31;\n    printf(\"1U << 31 = %u (0x%X)\\n\", uy, uy);  /* 2147483648 */\n    \n    /* 位掩码的正确写法 */\n    unsigned int mask = 1U << 31;  /* 最高位 */\n    printf(\"最高位掩码: 0x%08X\\n\", mask);\n    \n    /* 其他UB场景 */\n    /* int a = 1 << 32;   超出位宽，UB */\n    /* int b = 1 << -1;  负数移位，UB */\n    /* int c = INT_MAX + 1;  有符号溢出，UB */\n    \n    /* 无符号数的良定义行为 */\n    unsigned int u1 = UINT_MAX + 1;  /* 模运算，结果0 */\n    printf(\"UINT_MAX + 1 = %u\\n\", u1);  /* 0 */\n    \n    unsigned int u2 = 255U;\n    unsigned int u3 = u2 << 25;  /* 溢出但良定义 */\n    printf(\"255U << 25 = %u\\n\", u3);\n    \n    /* 安全检查 */\n    int shift = 31;\n    if (shift >= 0 && shift < 32) {\n        unsigned int result = 1U << shift;\n        printf(\"1U << %d = %u\\n\", shift, result);\n    }\n    \n    return 0;\n}"
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
                question: "以下代码的执行结果是什么？\n\n<C>\nFILE *fp = fopen(\"data.txt\", \"w\");\nif (fp) {\n    fprintf(fp, \"First line\\n\");\n    fclose(fp);\n}\n\nfp = fopen(\"data.txt\", \"w+\");  /* 再次打开 */\nif (fp) {\n    fprintf(fp, \"Second line\\n\");\n    fclose(fp);\n}\n/* data.txt的最终内容是什么？ */\n</C>",
                options: [
                    "First line (第一行)\nSecond line (第二行)",
                    "仅 Second line",
                    "First line (覆盖失败)",
                    "文件打开失败"
                ],
                correctAnswer: 1,
                explanation: "这是**文件打开模式w/w+清空文件**的陷阱！**关键知识**：`\"w\"`和`\"w+\"`模式都会**清空已存在文件**。第一次写入\"First line\"后关闭，第二次以`\"w+\"`打开时**文件被清空**，然后写入\"Second line\"，最终文件只有第二行。**模式区别**：`\"w\"`只写；`\"w+\"`读写但清空；`\"r+\"`读写不清空；`\"a\"`/`\"a+\"`追加不清空。**易错场景**：1)误用w+想读写不清空(应用r+)；2)想追加用了w(应用a)；3)检查文件存在后用w打开(被清空)。**正确做法**：需要保留内容用`\"r+\"`或`\"a\"`；需要读写且可能不存在先检查再选模式。**实际案例**：配置文件更新误用w+丢失数据。**记忆口诀**：w开头都清空，r开头都保留，a开头都追加。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    /* 初始写入 */\n    FILE *fp = fopen(\"test.txt\", \"w\");\n    if (fp) {\n        fprintf(fp, \"Line 1\\nLine 2\\nLine 3\\n\");\n        fclose(fp);\n        printf(\"初始写入完成\\n\");\n    }\n    \n    /* 错误：w+会清空文件 */\n    printf(\"\\n=== 使用w+模式 ===\\n\");\n    fp = fopen(\"test.txt\", \"w+\");  /* 文件被清空！ */\n    if (fp) {\n        fprintf(fp, \"New content\\n\");\n        fclose(fp);\n    }\n    /* 文件现在只有\"New content\" */\n    \n    /* 正确：r+模式保留内容 */\n    printf(\"\\n=== 使用r+模式 ===\\n\");\n    fp = fopen(\"test.txt\", \"w\");  /* 重新初始化 */\n    fprintf(fp, \"Line 1\\nLine 2\\nLine 3\\n\");\n    fclose(fp);\n    \n    fp = fopen(\"test.txt\", \"r+\");  /* 不清空 */\n    if (fp) {\n        fseek(fp, 0, SEEK_END);  /* 移到末尾 */\n        fprintf(fp, \"Line 4\\n\");  /* 追加 */\n        fclose(fp);\n    }\n    /* 文件有4行 */\n    \n    /* 追加模式 */\n    printf(\"\\n=== 使用a模式 ===\\n\");\n    fp = fopen(\"test.txt\", \"a\");  /* 追加，不清空 */\n    if (fp) {\n        fprintf(fp, \"Line 5\\n\");\n        fclose(fp);\n    }\n    \n    /* 读取验证 */\n    printf(\"\\n=== 最终内容 ===\\n\");\n    fp = fopen(\"test.txt\", \"r\");\n    if (fp) {\n        char line[100];\n        while (fgets(line, sizeof(line), fp)) {\n            printf(\"%s\", line);\n        }\n        fclose(fp);\n    }\n    \n    /* 模式对照表 */\n    printf(\"\\n=== 模式说明 ===\\n\");\n    printf(\"r  : 读，文件必须存在\\n\");\n    printf(\"r+ : 读写，不清空，文件必须存在\\n\");\n    printf(\"w  : 写，清空或创建\\n\");\n    printf(\"w+ : 读写，清空或创建\\n\");\n    printf(\"a  : 追加，不清空，创建\\n\");\n    printf(\"a+ : 读写追加，不清空，创建\\n\");\n    \n    return 0;\n}"
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
                question: "以下代码存在什么问题？\n\n<C>\nFILE *fp = fopen(\"large.dat\", \"rb\");\nif (fp) {\n    fseek(fp, 5000000000L, SEEK_SET);  /* 5GB偏移 */\n    int data;\n    fread(&data, sizeof(int), 1, fp);  /* 读取数据 */\n    printf(\"%d\", data);\n    fclose(fp);\n}\n</C>",
                options: [
                    "没有问题",
                    "未检查fseek返回值，可能seek失败",
                    "文件太大无法打开",
                    "fread用法错误"
                ],
                correctAnswer: 1,
                explanation: "这是**未检查fseek返回值**的陷阱！`fseek`失败时返回非零值，但代码未检查。**失败场景**：1)偏移超出文件大小(文本模式或某些系统)；2)文件不可seek(管道、终端)；3)32位系统long不足以表示大偏移。**问题后果**：seek失败后文件位置未变，fread读取错误位置或失败，data未初始化或是垃圾值。**正确做法**：1)检查`fseek`返回值；2)检查`fread`返回值；3)大文件用`fseeko`(off_t类型)；4)检查`ftell`返回-1L表示错误。**标准规定**：fseek成功返回0，失败返回非零。**实际案例**：seek超出2GB在某些系统失败；seek管道总失败。**完整检查**：`if(fseek(fp,pos,SEEK_SET)!=0||fread(&data,sizeof(int),1,fp)!=1)`。**易错点**：误以为fseek总成功。",
                codeExample: "#include <stdio.h>\n#include <errno.h>\n#include <string.h>\n\nint main() {\n    /* 创建测试文件 */\n    FILE *fp = fopen(\"test.dat\", \"wb\");\n    if (fp) {\n        int data = 12345;\n        fwrite(&data, sizeof(int), 1, fp);\n        fclose(fp);\n    }\n    \n    /* 错误示范：不检查返回值 */\n    printf(\"=== 错误示范 ===\\n\");\n    fp = fopen(\"test.dat\", \"rb\");\n    if (fp) {\n        fseek(fp, 1000000L, SEEK_SET);  /* 超出文件大小 */\n        int data = -1;\n        fread(&data, sizeof(int), 1, fp);  /* 可能读取失败 */\n        printf(\"读到: %d\\n\", data);  /* 可能是垃圾值 */\n        fclose(fp);\n    }\n    \n    /* 正确示范：检查所有返回值 */\n    printf(\"\\n=== 正确示范 ===\\n\");\n    fp = fopen(\"test.dat\", \"rb\");\n    if (fp == NULL) {\n        perror(\"fopen失败\");\n        return 1;\n    }\n    \n    long offset = 1000000L;\n    if (fseek(fp, offset, SEEK_SET) != 0) {\n        perror(\"fseek失败\");\n        printf(\"无法seek到位置 %ld\\n\", offset);\n        fclose(fp);\n        return 1;\n    }\n    \n    int data;\n    size_t nread = fread(&data, sizeof(int), 1, fp);\n    if (nread != 1) {\n        if (feof(fp)) {\n            printf(\"到达文件末尾\\n\");\n        } else if (ferror(fp)) {\n            perror(\"fread失败\");\n        }\n        fclose(fp);\n        return 1;\n    }\n    \n    printf(\"成功读到: %d\\n\", data);\n    fclose(fp);\n    \n    /* 演示ftell错误检查 */\n    printf(\"\\n=== ftell检查 ===\\n\");\n    fp = fopen(\"test.dat\", \"rb\");\n    if (fp) {\n        long pos = ftell(fp);\n        if (pos == -1L) {\n            perror(\"ftell失败\");\n        } else {\n            printf(\"当前位置: %ld\\n\", pos);\n        }\n        fclose(fp);\n    }\n    \n    return 0;\n}"
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
                question: "以下代码在Windows系统上的行为是什么？\n\n<C>\nFILE *fp = fopen(\"test.txt\", \"w\");  /* 文本模式 */\nif (fp) {\n    fwrite(\"A\\nB\\nC\", 5, 1, fp);  /* 写5字节 */\n    fclose(fp);\n}\n/* 文件实际大小是多少字节？ */\n</C>",
                options: [
                    "`5`字节",
                    "`6`字节",
                    "`7`字节",
                    "取决于系统"
                ],
                correctAnswer: 3,
                explanation: "这是**文本模式vs二进制模式的换行符转换**陷阱！在**Windows**，文本模式会将`\\n`(LF)转换为`\\r\\n`(CRLF)，5字节变7字节(A\\r\\nB\\r\\nC)。在**Unix/Linux**，不转换，仍是5字节。**关键区别**：1)**文本模式(\"w\")**：写入时LF→CRLF(Win)，读取时CRLF→LF；行尾转换；2)**二进制模式(\"wb\")**：不转换，原样读写。**问题场景**：1)用文本模式写二进制数据→数据损坏(0x0A被扩展)；2)用fwrite写文本→字节数与预期不符；3)跨平台文件→换行符不一致。**正确做法**：1)文本用fprintf+文本模式；2)二进制用fwrite+二进制模式；3)跨平台统一用二进制模式。**实际案例**：图片用文本模式打开损坏；网络协议混用模式导致长度错误。**检测方法**：文本模式ftell可能不准确。**记忆要点**：Windows文本模式会转换，Unix不转换；二进制模式都不转换。",
                codeExample: "#include <stdio.h>\n#include <string.h>\n\nlong get_file_size(const char *filename) {\n    FILE *fp = fopen(filename, \"rb\");\n    if (!fp) return -1;\n    fseek(fp, 0, SEEK_END);\n    long size = ftell(fp);\n    fclose(fp);\n    return size;\n}\n\nint main() {\n    const char *data = \"A\\nB\\nC\";  /* 5字节 */\n    \n    /* 文本模式写入 */\n    printf(\"=== 文本模式 ===\\n\");\n    FILE *fp = fopen(\"text_mode.txt\", \"w\");  /* 文本模式 */\n    if (fp) {\n        size_t written = fwrite(data, 1, 5, fp);\n        printf(\"写入字节数: %zu\\n\", written);  /* 返回5 */\n        fclose(fp);\n    }\n    long size = get_file_size(\"text_mode.txt\");\n    printf(\"文件实际大小: %ld字节\\n\", size);  /* Windows:7, Unix:5 */\n    \n    /* 二进制模式写入 */\n    printf(\"\\n=== 二进制模式 ===\\n\");\n    fp = fopen(\"binary_mode.bin\", \"wb\");  /* 二进制模式 */\n    if (fp) {\n        size_t written = fwrite(data, 1, 5, fp);\n        printf(\"写入字节数: %zu\\n\", written);  /* 返回5 */\n        fclose(fp);\n    }\n    size = get_file_size(\"binary_mode.bin\");\n    printf(\"文件实际大小: %ld字节\\n\", size);  /* 都是5 */\n    \n    /* 读取对比 */\n    printf(\"\\n=== 读取对比 ===\\n\");\n    unsigned char buffer[20];\n    \n    fp = fopen(\"text_mode.txt\", \"rb\");  /* 用二进制读文本文件 */\n    if (fp) {\n        size_t nread = fread(buffer, 1, 20, fp);\n        printf(\"文本模式文件实际内容(%zu字节): \", nread);\n        for (size_t i = 0; i < nread; i++) {\n            if (buffer[i] == '\\r') printf(\"<CR>\");\n            else if (buffer[i] == '\\n') printf(\"<LF>\");\n            else printf(\"%c\", buffer[i]);\n        }\n        printf(\"\\n\");\n        fclose(fp);\n    }\n    \n    /* 二进制数据错误示例 */\n    printf(\"\\n=== 陷阱演示：二进制数据用文本模式 ===\\n\");\n    unsigned char bin_data[] = {0x41, 0x0A, 0x42, 0x0A, 0x43};  /* 含0x0A */\n    \n    fp = fopen(\"wrong.dat\", \"w\");  /* 错误：文本模式 */\n    if (fp) {\n        fwrite(bin_data, 1, 5, fp);\n        fclose(fp);\n    }\n    printf(\"原始数据5字节，错误模式写入后: %ld字节\\n\",\n           get_file_size(\"wrong.dat\"));  /* Windows:7字节，数据损坏！ */\n    \n    fp = fopen(\"correct.dat\", \"wb\");  /* 正确：二进制模式 */\n    if (fp) {\n        fwrite(bin_data, 1, 5, fp);\n        fclose(fp);\n    }\n    printf(\"原始数据5字节，正确模式写入后: %ld字节\\n\",\n           get_file_size(\"correct.dat\"));  /* 都是5字节 */\n    \n    return 0;\n}"
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