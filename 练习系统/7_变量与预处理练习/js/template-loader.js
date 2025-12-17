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
                question: "以下代码的输出结果是什么？\n\n<C>\n#define INC(x) x++\n\nint main() {\n    int a = 5;\n    int b = INC(a);  /* 宏展开后的副作用 */\n    printf(\"%d %d\", a, b);\n    return 0;\n}\n</C>",
                options: [
                    "`6 6`",
                    "`6 5`",
                    "`5 5`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "这是**宏定义副作用**的经典陷阱！`INC(a)`展开为`a++`，这是一个**表达式**不是语句。`int b = a++`先将a的当前值5赋给b，然后a自增为6。输出`6 5`。**关键误区**：误以为宏会像函数一样先执行再返回。**宏本质**：文本替换，`INC(a)`直接替换成`a++`。**易错点**：后缀++先用后增，b得到自增前的值。**正确写法**：如需返回新值应用`++x`或真函数。**教训**：宏只是文本替换，没有函数的语义。",
                codeExample: "#include <stdio.h>\n\n/* 宏的副作用 */\n#define INC(x) x++\n\nint main() {\n    int a = 5;\n    \n    /* 宏展开: int b = a++; */\n    int b = INC(a);\n    printf(\"a=%d, b=%d\\n\", a, b);  /* 6, 5 */\n    \n    /* 正确做法：使用函数 */\n    int inc_func(int *p) {\n        return ++(*p);\n    }\n    \n    int c = 10;\n    int d = inc_func(&c);\n    printf(\"c=%d, d=%d\\n\", c, d);  /* 11, 11 */\n    \n    return 0;\n}"
            },
            {
                id: 2,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 5;\n\nvoid func() {\n    int x = 10;\n    x++;\n    printf(\"%d \", x);\n}\n\nint main() {\n    func();\n    printf(\"%d\", x);\n    return 0;\n}\n</C>",
                options: [
                    "`11 11`",
                    "`11 5`",
                    "`10 5`",
                    "`6 5`"
                ],
                correctAnswer: 1,
                explanation: "函数内的局部变量 `x` 隐藏了全局变量 `x`。`func()` 中对局部 `x` 自增后输出11，但不影响全局 `x`，所以 `main` 中输出全局 `x` 的值5。",
                codeExample: "#include <stdio.h>\n\nint x = 5;  // 全局变量\n\nvoid func() {\n    int x = 10;  // 局部变量，隐藏全局x\n    x++;\n    printf(\"func中局部x: %d\\n\", x);  // 11\n}\n\nint main() {\n    func();\n    printf(\"main中全局x: %d\\n\", x);  // 5\n    return 0;\n}"
            },
            {
                id: 3,
                question: "关于 `#define` 宏定义，以下说法错误的是：",
                options: [
                    "宏定义在预处理阶段进行文本替换",
                    "宏定义不进行类型检查",
                    "宏定义必须以分号结尾",
                    "宏定义可以定义常量和带参数的宏"
                ],
                correctAnswer: 2,
                explanation: "宏定义**不需要**以分号结尾。宏是预处理器的文本替换，不进行语法检查。加分号会导致替换时多出分号，可能引起错误。",
                codeExample: "#include <stdio.h>\n\n// 正确：不加分号\n#define PI 3.14159\n#define MAX(a, b) ((a) > (b) ? (a) : (b))\n\n// 错误示例\n// #define VALUE 100;  // 分号会被替换进去\n\nint main() {\n    printf(\"PI = %f\\n\", PI);\n    printf(\"MAX(5, 10) = %d\\n\", MAX(5, 10));\n    \n    // 如果定义时加了分号\n    // int x = VALUE;  // 会变成: int x = 100;;（语法错误）\n    \n    return 0;\n}"
            },
            {
                id: 4,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define SQUARE(x) x * x\n\nint main() {\n    int result = SQUARE(2 + 3);\n    printf(\"%d\", result);\n    return 0;\n}\n</C>",
                options: [
                    "`25`",
                    "`11`",
                    "`10`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "宏是简单的文本替换。`SQUARE(2 + 3)` 展开为 `2 + 3 * 2 + 3`，由于乘法优先级高于加法，计算结果是 `2 + 6 + 3 = 11`。正确的宏定义应该加括号：`#define SQUARE(x) ((x) * (x))`",
                codeExample: "#include <stdio.h>\n\n// 错误的宏定义\n#define SQUARE_WRONG(x) x * x\n\n// 正确的宏定义\n#define SQUARE_RIGHT(x) ((x) * (x))\n\nint main() {\n    printf(\"SQUARE_WRONG(2+3) = %d\\n\", SQUARE_WRONG(2 + 3));  // 11\n    printf(\"SQUARE_RIGHT(2+3) = %d\\n\", SQUARE_RIGHT(2 + 3));  // 25\n    \n    // 展开过程：\n    // SQUARE_WRONG(2+3) → 2+3 * 2+3 → 2+6+3 = 11\n    // SQUARE_RIGHT(2+3) → ((2+3) * (2+3)) → 5*5 = 25\n    \n    return 0;\n}"
            },
            {
                id: 5,
                question: "关于 `static` 局部变量，以下说法正确的是：",
                options: [
                    "`static` 局部变量的作用域扩展到整个程序",
                    "`static` 局部变量在函数调用之间保持其值",
                    "`static` 局部变量存储在栈上",
                    "`static` 局部变量每次函数调用都会重新初始化"
                ],
                correctAnswer: 1,
                explanation: "`static` 局部变量的作用域仍然限于函数内部，但其生存期延长到整个程序运行期间，存储在静态存储区（不是栈）。它只初始化一次，在函数调用之间保持其值。",
                codeExample: "#include <stdio.h>\n\nvoid counter() {\n    static int count = 0;  // 只初始化一次\n    count++;\n    printf(\"count = %d\\n\", count);\n}\n\nint main() {\n    counter();  // count = 1\n    counter();  // count = 2（保持上次的值）\n    counter();  // count = 3\n    return 0;\n}"
            },
            {
                id: 6,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 10;\n\nvoid func() {\n    printf(\"%d \", x);\n    int x = 20;  /* 定义在使用之后 */\n    printf(\"%d\", x);\n}\n\nint main() {\n    func();\n    return 0;\n}\n</C>",
                options: [
                    "`10 20`",
                    "`20 20`",
                    "编译错误或警告",
                    "`10 10`"
                ],
                correctAnswer: 2,
                explanation: "这是**变量作用域与声明位置**的陷阱！在C89/C90中，**所有变量必须在代码块开头声明**，不能在使用后声明。现代编译器（C99+）允许在任意位置声明，但这里`int x=20`在第一个printf之后声明，**整个函数中的x都指向局部x**（从声明处开始有效），第一个printf访问未初始化的局部x是**未定义行为**。**VC2010行为**：编译错误，不允许混合声明。**关键规则**：局部变量的作用域从声明处到代码块结束，但编译器会在整个代码块中隐藏同名全局变量。",
                codeExample: "#include <stdio.h>\n\nint x = 10;  /* 全局变量 */\n\nvoid func_wrong() {\n    /* C89: 变量必须在开头声明 */\n    printf(\"%d \", x);  /* 访问哪个x？ */\n    int x = 20;  /* VC2010编译错误！ */\n    printf(\"%d\", x);\n}\n\nvoid func_correct() {\n    int x = 20;  /* 正确：开头声明 */\n    printf(\"%d \", x);  /* 20 */\n    printf(\"%d\", x);  /* 20 */\n}\n\nvoid func_global() {\n    printf(\"%d \", x);  /* 10（全局） */\n    printf(\"%d\", x);  /* 10 */\n}\n\nint main() {\n    /* func_wrong();  错误 */\n    func_correct();  /* 20 20 */\n    func_global();   /* 10 10 */\n    return 0;\n}"
            },
            {
                id: 7,
                question: "关于 `#include` 指令，以下说法正确的是：",
                options: [
                    "`#include <file.h>` 和 `#include \"file.h\"` 完全相同",
                    "`#include <file.h>` 在系统目录中搜索头文件",
                    "`#include \"file.h\"` 只能包含当前目录的文件",
                    "`#include` 可以包含C源文件（.c）但不推荐"
                ],
                correctAnswer: 1,
                explanation: "`#include <file.h>` 在系统头文件目录中搜索，用于标准库头文件。`#include \"file.h\"` 先在当前目录搜索，然后在系统目录搜索，用于自定义头文件。虽然可以包含.c文件，但强烈不推荐，应该包含.h头文件。",
                codeExample: "#include <stdio.h>      // 系统头文件，尖括号\n#include <string.h>     // 系统头文件\n// #include \"myheader.h\"   // 自定义头文件，双引号\n\n// 包含.c文件是可以的，但不推荐\n// #include \"helper.c\"  // 不推荐！会导致重复定义\n\nint main() {\n    printf(\"Hello\\n\");\n    return 0;\n}"
            },
            {
                id: 8,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define PRINT(x) printf(\"%d\\n\", x)\n\nint main() {\n    int a = 5;\n    PRINT(a++);\n    printf(\"%d\", a);\n    return 0;\n}\n</C>",
                options: [
                    "`5` 然后 `6`",
                    "`6` 然后 `6`",
                    "`5` 然后 `5`",
                    "未定义行为"
                ],
                correctAnswer: 0,
                explanation: "`PRINT(a++)` 展开为 `printf(\"%d\\n\", a++)`。后缀 `a++` 先使用当前值5，然后自增。所以第一次输出5，之后 `a` 变为6。",
                codeExample: "#include <stdio.h>\n\n#define PRINT(x) printf(\"%d\\n\", x)\n\nint main() {\n    int a = 5;\n    PRINT(a++);  // 展开为: printf(\"%d\\n\", a++);\n    // 输出5，然后a变为6\n    printf(\"a = %d\\n\", a);  // 6\n    return 0;\n}"
            },
            {
                id: 9,
                question: "关于 `extern` 关键字，以下说法正确的是：",
                options: [
                    "`extern` 用于声明外部变量，不分配存储空间",
                    "`extern` 变量只能在全局作用域声明",
                    "`extern` 可以用于函数定义",
                    "`extern` 变量必须初始化"
                ],
                correctAnswer: 0,
                explanation: "`extern` 用于声明在其他文件中定义的全局变量或函数，告诉编译器该变量或函数在别处定义，不分配新的存储空间。`extern` 声明不应该初始化（初始化会变成定义）。",
                codeExample: "// file1.c\nint global_var = 100;  // 定义并初始化\n\nvoid print_var() {\n    printf(\"%d\\n\", global_var);\n}\n\n// file2.c\nextern int global_var;  // 声明，不分配空间\nextern void print_var();  // 函数声明\n\nint main() {\n    printf(\"%d\\n\", global_var);  // 访问file1.c中的变量\n    print_var();\n    return 0;\n}"
            },
            {
                id: 10,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define ADD(a, b) a + b\n\nint main() {\n    int result = 2 * ADD(3, 4);\n    printf(\"%d\", result);\n    return 0;\n}\n</C>",
                options: [
                    "`14`",
                    "`10`",
                    "`7`",
                    "`20`"
                ],
                correctAnswer: 1,
                explanation: "宏展开为 `2 * 3 + 4`，由于乘法优先级高于加法，结果是 `6 + 4 = 10`。正确的宏应该是 `#define ADD(a, b) ((a) + (b))`，这样会得到 `2 * (3 + 4) = 14`。",
                codeExample: "#include <stdio.h>\n\n#define ADD_WRONG(a, b) a + b\n#define ADD_RIGHT(a, b) ((a) + (b))\n\nint main() {\n    printf(\"2 * ADD_WRONG(3, 4) = %d\\n\", 2 * ADD_WRONG(3, 4));  // 10\n    printf(\"2 * ADD_RIGHT(3, 4) = %d\\n\", 2 * ADD_RIGHT(3, 4));  // 14\n    \n    // 展开过程：\n    // 2 * ADD_WRONG(3, 4) → 2 * 3 + 4 = 10\n    // 2 * ADD_RIGHT(3, 4) → 2 * ((3) + (4)) = 14\n    \n    return 0;\n}"
            },
            {
                id: 11,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define DEBUG 0\n\nint main() {\n    #ifdef DEBUG\n        printf(\"Debug\\n\");\n    #else\n        printf(\"Release\\n\");\n    #endif\n    return 0;\n}\n</C>",
                options: [
                    "`Debug`",
                    "`Release`",
                    "无输出",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "这是**#ifdef与#if的区别**陷阱！`#ifdef DEBUG`检查`DEBUG`**是否被定义**（不管值是什么），因为`#define DEBUG 0`已定义DEBUG，所以条件为真，输出`Debug`。**关键误区**：误以为`#ifdef`会检查值。**正确区分**：`#ifdef DEBUG`等价于`#if defined(DEBUG)`，只检查是否定义；`#if DEBUG`才检查值是否非零。**实际应用**：要根据值判断应用`#if DEBUG`；要检查是否定义用`#ifdef DEBUG`。**陷阱根源**：DEBUG=0仍然是已定义的。",
                codeExample: "#include <stdio.h>\n\n#define DEBUG 0\n/* #define RELEASE */  /* 未定义 */\n\nint main() {\n    /* #ifdef: 检查是否定义 */\n    #ifdef DEBUG\n        printf(\"DEBUG已定义\\n\");  /* 输出！ */\n    #endif\n    \n    /* #if: 检查值 */\n    #if DEBUG\n        printf(\"DEBUG为真\\n\");  /* 不输出 */\n    #else\n        printf(\"DEBUG为假\\n\");  /* 输出！ */\n    #endif\n    \n    /* #ifndef: 检查是否未定义 */\n    #ifndef RELEASE\n        printf(\"RELEASE未定义\\n\");  /* 输出！ */\n    #endif\n    \n    /* 正确写法 */\n    #if defined(DEBUG) && DEBUG == 1\n        printf(\"Debug mode level 1\\n\");\n    #endif\n    \n    return 0;\n}"
            },
            {
                id: 12,
                question: "以下代码中，哪个变量具有最长的生存期？\n\n<C>\nint global = 1;  // A\n\nvoid func() {\n    static int s = 2;  // B\n    int local = 3;     // C\n}\n\nint main() {\n    int m = 4;  // D\n    return 0;\n}\n</C>",
                options: [
                    "变量 `global` 和 `s` 的生存期相同且最长",
                    "变量 `global` 的生存期最长",
                    "变量 `s` 的生存期最长",
                    "所有变量生存期相同"
                ],
                correctAnswer: 0,
                explanation: "全局变量和 `static` 变量都存储在静态存储区，生存期是整个程序运行期间。普通局部变量存储在栈上，函数返回时销毁。",
                codeExample: "#include <stdio.h>\n\nint global = 1;  // 全局变量，程序开始到结束\n\nvoid func() {\n    static int s = 2;  // static局部变量，程序开始到结束\n    int local = 3;     // 普通局部变量，函数调用期间\n    printf(\"func: local=%d\\n\", local);\n}  // local在此销毁\n\nint main() {\n    int m = 4;  // 局部变量，main执行期间\n    func();\n    func();\n    return 0;\n}  // m在此销毁"
            },
            {
                id: 13,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define SWAP(a, b) { int t = a; a = b; b = t; }\n\nint main() {\n    int x = 5, y = 10;\n    if (x < y)\n        SWAP(x, y);\n    printf(\"%d %d\", x, y);\n    return 0;\n}\n</C>",
                options: [
                    "`10 5`",
                    "`5 10`",
                    "编译错误",
                    "未定义行为"
                ],
                correctAnswer: 2,
                explanation: "宏展开后变成：`if (x < y) { int t = x; x = y; y = t; };`，注意 `if` 后面跟的是代码块，然后是分号。这会导致编译错误。正确的宏应该使用 `do { ... } while(0)` 包装。",
                codeExample: "#include <stdio.h>\n\n// 错误的宏定义\n// #define SWAP_WRONG(a, b) { int t = a; a = b; b = t; }\n\n// 正确的宏定义\n#define SWAP_RIGHT(a, b) do { int t = a; a = b; b = t; } while(0)\n\nint main() {\n    int x = 5, y = 10;\n    \n    if (x < y)\n        SWAP_RIGHT(x, y);  // 正确\n    \n    printf(\"%d %d\\n\", x, y);  // 10 5\n    \n    return 0;\n}"
            },
            {
                id: 14,
                question: "关于 `register` 关键字，以下说法正确的是：",
                options: [
                    "`register` 变量一定存储在寄存器中",
                    "`register` 变量可以取地址",
                    "`register` 是对编译器的建议，可能被忽略",
                    "`register` 只能用于全局变量"
                ],
                correctAnswer: 2,
                explanation: "`register` 是对编译器的建议，建议将变量存储在寄存器中以提高访问速度。但编译器可以忽略这个建议。`register` 变量不能取地址（因为寄存器没有地址），只能用于局部变量。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    register int fast_var = 100;  // 建议存储在寄存器\n    \n    // fast_var++;  // 可以正常使用\n    printf(\"%d\\n\", fast_var);\n    \n    // int *p = &fast_var;  // 错误！不能取地址\n    \n    // 现代编译器优化很好，register关键字很少使用\n    \n    return 0;\n}"
            },
            {
                id: 15,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define PRINT printf\n\nint main() {\n    PRINT(\"Hello \");\n    PRINT(\"World\\n\");\n    return 0;\n}\n</C>",
                options: [
                    "`Hello World`",
                    "编译错误",
                    "`PRINT(\"Hello \") PRINT(\"World\\n\")`",
                    "无输出"
                ],
                correctAnswer: 0,
                explanation: "宏定义可以为函数或关键字创建别名。`PRINT` 被替换为 `printf`，代码正常执行，输出 `Hello World`。",
                codeExample: "#include <stdio.h>\n\n#define PRINT printf\n#define MAX_SIZE 100\n#define BEGIN {\n#define END }\n\nint main() BEGIN\n    PRINT(\"Hello \");\n    PRINT(\"World\\n\");\n    \n    int arr[MAX_SIZE];  // 使用宏定义的常量\n    PRINT(\"数组大小: %d\\n\", MAX_SIZE);\n    \n    return 0;\nEND"
            },
            {
                id: 16,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define MUL(a, b) a * b\n\nint main() {\n    int result = MUL(2 + 3, 4 + 5);\n    printf(\"%d\", result);\n    return 0;\n}\n</C>",
                options: [
                    "`45`",
                    "`19`",
                    "`20`",
                    "`35`"
                ],
                correctAnswer: 1,
                explanation: "这是**宏定义缺少括号**的经典陷阱！`MUL(2+3, 4+5)`展开为`2+3*4+5`。**计算过程**：根据运算符优先级，乘法先于加法，`3*4=12`，然后`2+12+5=19`。**正确宏定义**：`#define MUL(a,b) ((a)*(b))`，展开为`((2+3)*(4+5))=5*9=45`。**陷阱本质**：宏是文本替换，不加括号会破坏运算优先级。**黄金法则**：1)参数加括号；2)整体加括号；3)多行宏用do-while(0)。**易错场景**：`10/MUL(2,3)`若无外括号变成`10/2*3=15`而非`10/6`。",
                codeExample: "#include <stdio.h>\n\n/* 错误：缺少括号 */\n#define MUL_WRONG(a, b) a * b\n\n/* 正确：参数和整体都加括号 */\n#define MUL_RIGHT(a, b) ((a) * (b))\n\nint main() {\n    /* 陷阱1：参数是表达式 */\n    printf(\"MUL_WRONG(2+3, 4+5) = %d\\n\",\n           MUL_WRONG(2+3, 4+5));  /* 19 */\n    printf(\"MUL_RIGHT(2+3, 4+5) = %d\\n\",\n           MUL_RIGHT(2+3, 4+5));  /* 45 */\n    \n    /* 陷阱2：整体参与运算 */\n    printf(\"10 / MUL_WRONG(2, 3) = %d\\n\",\n           10 / MUL_WRONG(2, 3));  /* 10/2*3=15 */\n    printf(\"10 / MUL_RIGHT(2, 3) = %d\\n\",\n           10 / MUL_RIGHT(2, 3));  /* 10/6=1 */\n    \n    return 0;\n}"
            },
            {
                id: 17,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 10;\n\nvoid func() {\n    extern int x;\n    x = 20;\n}\n\nint main() {\n    func();\n    printf(\"%d\", x);\n    return 0;\n}\n</C>",
                options: [
                    "`10`",
                    "`20`",
                    "编译错误",
                    "未定义行为"
                ],
                correctAnswer: 1,
                explanation: "`func` 中的 `extern int x;` 声明引用全局变量 `x`，对它的修改影响全局变量。所以 `func()` 将全局 `x` 改为20，`main` 中输出20。",
                codeExample: "#include <stdio.h>\n\nint x = 10;  // 全局变量\n\nvoid func() {\n    extern int x;  // 声明引用全局x\n    printf(\"func修改前: x=%d\\n\", x);  // 10\n    x = 20;  // 修改全局x\n    printf(\"func修改后: x=%d\\n\", x);  // 20\n}\n\nint main() {\n    func();\n    printf(\"main中: x=%d\\n\", x);  // 20\n    return 0;\n}"
            },
            {
                id: 18,
                question: "关于 `#if` 条件编译，以下代码的输出结果是什么？\n\n<C>\n#define VERSION 2\n\nint main() {\n    #if VERSION == 1\n        printf(\"Version 1\\n\");\n    #elif VERSION == 2\n        printf(\"Version 2\\n\");\n    #else\n        printf(\"Unknown\\n\");\n    #endif\n    return 0;\n}\n</C>",
                options: [
                    "`Version 1`",
                    "`Version 2`",
                    "`Unknown`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "`#if` 可以比较宏的值。`VERSION` 定义为2，所以匹配 `#elif VERSION == 2`，输出 `Version 2`。只有匹配的分支会被编译。",
                codeExample: "#include <stdio.h>\n\n#define VERSION 2\n#define DEBUG 0\n\nint main() {\n    #if VERSION == 1\n        printf(\"Version 1\\n\");\n    #elif VERSION == 2\n        printf(\"Version 2\\n\");\n    #else\n        printf(\"Unknown version\\n\");\n    #endif\n    \n    #if DEBUG\n        printf(\"Debug mode enabled\\n\");\n    #else\n        printf(\"Release mode\\n\");\n    #endif\n    \n    return 0;\n}"
            },
            {
                id: 19,
                question: "以下代码中，变量 `count` 的值是多少？\n\n<C>\nvoid increment() {\n    static int count = 0;\n    count++;\n}\n\nint main() {\n    increment();\n    increment();\n    increment();\n    // count的值是多少？\n    return 0;\n}\n</C>",
                options: [
                    "`0`（无法访问）",
                    "`1`",
                    "`3`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "虽然 `count` 的值确实是3，但由于 `count` 是 `increment` 函数的局部变量，在 `main` 函数中无法直接访问。`static` 只改变生存期，不改变作用域。",
                codeExample: "#include <stdio.h>\n\nvoid increment() {\n    static int count = 0;\n    count++;\n    printf(\"count = %d\\n\", count);\n}\n\nint main() {\n    increment();  // count = 1\n    increment();  // count = 2\n    increment();  // count = 3\n    \n    // printf(\"%d\", count);  // 错误！count不在作用域内\n    \n    return 0;\n}"
            },
            {
                id: 20,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define STR(x) #x\n\nint main() {\n    printf(\"%s\", STR(Hello World));\n    return 0;\n}\n</C>",
                options: [
                    "`Hello World`",
                    "`\"Hello World\"`",
                    "`Hello`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "`#x` 是字符串化运算符，将宏参数转换为字符串字面量。`STR(Hello World)` 展开为 `\"Hello World\"`，所以输出 `Hello World`。",
                codeExample: "#include <stdio.h>\n\n#define STR(x) #x\n#define CONCAT(a, b) a##b  // ##是连接运算符\n\nint main() {\n    printf(\"%s\\n\", STR(Hello World));  // \"Hello World\"\n    printf(\"%s\\n\", STR(123));          // \"123\"\n    \n    int xy = 100;\n    printf(\"%d\\n\", CONCAT(x, y));      // xy → 100\n    \n    return 0;\n}"
            },
            {
                id: 21,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid func(int reset) {\n    static int count = 0;  /* static局部变量 */\n    if (reset) count = 0;\n    count++;\n    printf(\"%d \", count);\n}\n\nint main() {\n    func(0);\n    func(0);\n    func(1);  /* 重置 */\n    func(0);\n    return 0;\n}\n</C>",
                options: [
                    "`1 2 0 1`",
                    "`1 2 1 2`",
                    "`0 1 0 1`",
                    "`1 1 1 1`"
                ],
                correctAnswer: 1,
                explanation: "这是**static局部变量生命周期**的陷阱！`static int count=0`**只在第一次调用时初始化**，之后保持值。**执行过程**：1)第一次调用：count初始化为0，不重置，count++得1，输出1；2)第二次：count保持1（不重新初始化），不重置，count++得2，输出2；3)第三次：count保持2，reset为真执行count=0，然后count++得1，输出1；4)第四次：count保持1，不重置，count++得2，输出2。**关键知识**：static变量初始化语句只执行一次。**易错点**：误以为每次调用都会执行`static int count=0`。",
                codeExample: "#include <stdio.h>\n\nvoid func(int reset) {\n    static int count = 0;  /* 只初始化一次 */\n    printf(\"进入时count=%d, \", count);\n    \n    if (reset) {\n        count = 0;\n        printf(\"重置, \");\n    }\n    \n    count++;\n    printf(\"输出count=%d\\n\", count);\n}\n\nint main() {\n    printf(\"第1次: \"); func(0);  /* 1 */\n    printf(\"第2次: \"); func(0);  /* 2 */\n    printf(\"第3次: \"); func(1);  /* 重置后1 */\n    printf(\"第4次: \"); func(0);  /* 2 */\n    \n    /* 对比：非static变量 */\n    void func2() {\n        int count = 0;  /* 每次都初始化 */\n        count++;\n        printf(\"%d \", count);  /* 总是1 */\n    }\n    \n    return 0;\n}"
            },
            {
                id: 22,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define MAX(a, b) ((a) > (b) ? (a) : (b))\n\nint main() {\n    int x = 5, y = 10;\n    int z = MAX(x++, y++);\n    printf(\"%d %d %d\", x, y, z);\n    return 0;\n}\n</C>",
                options: [
                    "`6 11 10`",
                    "`6 12 10`",
                    "`7 11 10`",
                    "`6 11 11`"
                ],
                correctAnswer: 1,
                explanation: "宏展开为 `((x++) > (y++) ? (x++) : (y++))`。比较时 x=5, y=10，y较大。然后执行 `y++`（第三次），所以 x++ 执行一次变为6，y++ 执行两次（比较时一次，返回时一次）变为12。z得到11（y++返回自增前的值）。",
                codeExample: "#include <stdio.h>\n\n#define MAX(a, b) ((a) > (b) ? (a) : (b))\n\nint main() {\n    int x = 5, y = 10;\n    \n    // 宏展开: ((x++) > (y++) ? (x++) : (y++))\n    // 第1步: x++（5）> y++（10）？ 假\n    // 第2步: 执行 y++，返回10（自增前的值）\n    // 结果: x=6（自增1次），y=12（自增2次），z=11\n    \n    int z = MAX(x++, y++);\n    printf(\"x=%d, y=%d, z=%d\\n\", x, y, z);\n    \n    return 0;\n}"
            },
            {
                id: 23,
                question: "以下代码能否正常编译和运行？\n\n<C>\n#define SIZE 10\n\nint main() {\n    int arr[SIZE];\n    SIZE = 20;\n    printf(\"%d\", SIZE);\n    return 0;\n}\n</C>",
                options: [
                    "可以正常运行，输出 `20`",
                    "编译错误：不能修改宏定义",
                    "运行时错误",
                    "输出 `10`"
                ],
                correctAnswer: 1,
                explanation: "宏是预处理阶段的文本替换，不是变量。`SIZE = 20;` 会被展开为 `10 = 20;`，这是语法错误（不能给字面量赋值）。宏定义后不能像变量那样赋值修改。",
                codeExample: "#include <stdio.h>\n\n#define SIZE 10\n\nint main() {\n    int arr[SIZE];  // 正确：展开为 int arr[10];\n    \n    // SIZE = 20;  // 错误！展开为 10 = 20;\n    \n    // 如果需要可变的大小，应该使用变量\n    int size = 10;\n    // int arr2[size];  // C99支持变长数组\n    size = 20;  // 可以修改\n    \n    printf(\"%d\\n\", SIZE);  // 10\n    printf(\"%d\\n\", size);  // 20\n    \n    return 0;\n}"
            },
            {
                id: 24,
                question: "关于头文件，以下做法正确的是：",
                options: [
                    "在头文件中定义全局变量",
                    "在头文件中定义函数",
                    "在头文件中声明函数和定义宏",
                    "在头文件中包含大量的实现代码"
                ],
                correctAnswer: 2,
                explanation: "头文件应该包含声明（函数原型、extern变量声明）、宏定义、类型定义等，不应该包含定义（函数实现、全局变量定义），否则多次包含会导致重复定义错误。",
                codeExample: "// myheader.h（正确做法）\n#ifndef MYHEADER_H\n#define MYHEADER_H\n\n// 函数声明（不是定义）\nvoid myFunction();\n\n// extern变量声明\nextern int global_var;\n\n// 宏定义\n#define MAX_SIZE 100\n\n// 类型定义\ntypedef struct {\n    int x, y;\n} Point;\n\n#endif\n\n// myheader.c（实现文件）\n#include \"myheader.h\"\n\nint global_var = 10;  // 定义\n\nvoid myFunction() {   // 实现\n    // ...\n}"
            },
            {
                id: 25,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define DOUBLE(x) (x) + (x)\n\nint main() {\n    int result = 5 * DOUBLE(3);\n    printf(\"%d\", result);\n    return 0;\n}\n</C>",
                options: [
                    "`30`",
                    "`21`",
                    "`18`",
                    "`11`"
                ],
                correctAnswer: 1,
                explanation: "宏展开为 `5 * (3) + (3)`，按优先级计算：`5 * 3 + 3 = 15 + 3 = 18`。等等，让我重新计算...应该是 `(5 * 3) + 3 = 15 + 6 = 21`。正确的宏应该整体加括号：`#define DOUBLE(x) ((x) + (x))`。",
                codeExample: "#include <stdio.h>\n\n#define DOUBLE_WRONG(x) (x) + (x)\n#define DOUBLE_RIGHT(x) ((x) + (x))\n\nint main() {\n    // 错误宏: 5 * DOUBLE_WRONG(3) → 5 * (3) + (3)\n    //         → 5*3 + 3 = 15 + 3 = 18\n    printf(\"DOUBLE_WRONG: %d\\n\", 5 * DOUBLE_WRONG(3));  // 18\n    \n    // 正确宏: 5 * DOUBLE_RIGHT(3) → 5 * ((3) + (3))\n    //         → 5 * 6 = 30\n    printf(\"DOUBLE_RIGHT: %d\\n\", 5 * DOUBLE_RIGHT(3));  // 30\n    \n    return 0;\n}"
            },
            {
                id: 26,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define MAX(a, b) ((a) > (b) ? (a) : (b))\n\nint main() {\n    int x = 5, y = 10;\n    int z = MAX(x++, y++);  /* 宏参数有副作用 */\n    printf(\"%d %d %d\", x, y, z);\n    return 0;\n}\n</C>",
                options: [
                    "`6 11 10`",
                    "`6 12 11`",
                    "`7 11 10`",
                    "`6 11 11`"
                ],
                correctAnswer: 1,
                explanation: "这是**宏参数多次求值**的危险陷阱！宏展开为`((x++)>(y++) ? (x++) : (y++))`。**执行过程**：1)比较：`x++`（5>10?假，x得6），`y++`（y得11）；2)因5<10，执行冒号后的`y++`，y再次自增得12，返回自增前的值11给z。**最终**：x自增1次得6，y自增2次得12，z=11。**陷阱本质**：宏是文本替换，参数在宏体中出现几次就求值几次。**正确做法**：1)不在宏参数中使用++/--；2)使用inline函数(C99)或普通函数。**黄金原则**：带副作用的表达式不要传给宏。",
                codeExample: "#include <stdio.h>\n\n#define MAX(a, b) ((a) > (b) ? (a) : (b))\n\n/* 正确做法：使用函数 */\nint max_func(int a, int b) {\n    return a > b ? a : b;\n}\n\nint main() {\n    int x = 5, y = 10;\n    \n    /* 宏的危险用法 */\n    int z1 = MAX(x++, y++);\n    printf(\"宏: x=%d, y=%d, z=%d\\n\", x, y, z1);\n    /* x=6（1次++），y=12（2次++），z=11 */\n    \n    /* 函数的正确行为 */\n    int a = 5, b = 10;\n    int z2 = max_func(a++, b++);\n    printf(\"函数: a=%d, b=%d, z=%d\\n\", a, b, z2);\n    /* a=6（1次++），b=11（1次++），z=10 */\n    \n    return 0;\n}"
            },
            {
                id: 27,
                question: "以下关于 `#define` 和 `const` 的说法，正确的是：",
                options: [
                    "`#define` 定义的常量有类型，`const` 没有",
                    "`const` 常量在预处理阶段替换，`#define` 在编译阶段",
                    "`#define` 不占用内存，`const` 变量占用内存",
                    "`#define` 和 `const` 完全等价"
                ],
                correctAnswer: 2,
                explanation: "`#define` 是预处理器的文本替换，不占内存，无类型检查。`const` 是真正的变量，有类型，占用内存，编译器可以进行类型检查。`const` 更安全，`#define` 更灵活。",
                codeExample: "#include <stdio.h>\n\n#define MAX_SIZE 100  // 预处理替换，不占内存\nconst int buf_size = 100;  // 真正的变量，占内存\n\nint main() {\n    int arr1[MAX_SIZE];  // 正确\n    // int arr2[buf_size];  // C语言中可能不行（C++可以）\n    \n    // #define没有类型检查\n    // MAX_SIZE = 200;  // 错误：10 = 200\n    \n    // const有类型检查\n    // buf_size = 200;  // 错误：不能修改const变量\n    \n    printf(\"MAX_SIZE: %d\\n\", MAX_SIZE);\n    printf(\"buf_size: %d\\n\", buf_size);\n    \n    return 0;\n}"
            },
            {
                id: 28,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define STR(x) #x\n#define XSTR(x) STR(x)\n#define VALUE 100\n\nint main() {\n    printf(\"%s \", STR(VALUE));\n    printf(\"%s\", XSTR(VALUE));\n    return 0;\n}\n</C>",
                options: [
                    "`VALUE VALUE`",
                    "`100 100`",
                    "`VALUE 100`",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是**宏字符串化的展开顺序**陷阱！`#x`将参数**原样转为字符串**，不展开宏。`STR(VALUE)`直接字符串化参数VALUE，得到\"VALUE\"。`XSTR(VALUE)`先展开VALUE为100，然后传给STR(100)，再字符串化得到\"100\"。**关键规则**：1)#直接字符串化，不展开宏；2)宏嵌套时外层宏先展开参数。**实际应用**：要展开宏后字符串化需要两层宏。**易错点**：误以为#会先展开宏。**记忆诀窍**：#是\"拍照\"，拍下原样；要展开后拍照，需先\"洗照片\"（外层宏）。",
                codeExample: "#include <stdio.h>\n\n#define STR(x) #x  /* 直接字符串化 */\n#define XSTR(x) STR(x)  /* 先展开再字符串化 */\n#define VALUE 100\n#define MAX 200\n\nint main() {\n    /* 直接字符串化 */\n    printf(\"%s\\n\", STR(VALUE));  /* \"VALUE\" */\n    printf(\"%s\\n\", STR(100));    /* \"100\" */\n    printf(\"%s\\n\", STR(a+b));   /* \"a+b\" */\n    \n    /* 先展开再字符串化 */\n    printf(\"%s\\n\", XSTR(VALUE));  /* \"100\" */\n    printf(\"%s\\n\", XSTR(MAX));    /* \"200\" */\n    \n    /* 实际应用：调试宏 */\n    #define DEBUG_VAR(v) printf(#v \" = %d\\n\", v)\n    int num = 42;\n    DEBUG_VAR(num);  /* \"num = 42\" */\n    DEBUG_VAR(VALUE);  /* \"VALUE = 100\" */\n    \n    return 0;\n}"
            },
            {
                id: 29,
                question: "以下代码中，哪个是正确的条件编译写法？",
                options: [
                    "`#if defined(DEBUG) && DEBUG == 1`",
                    "`#ifdef DEBUG && DEBUG == 1`",
                    "`#if DEBUG`",
                    "A和C都正确"
                ],
                correctAnswer: 3,
                explanation: "`#if defined(DEBUG)` 检查是否定义，`#if DEBUG` 检查值（未定义时当作0）。`#ifdef` 只能检查是否定义，不能进行逻辑运算。A和C都是正确的写法，B语法错误。",
                codeExample: "#include <stdio.h>\n\n#define DEBUG 1\n\nint main() {\n    // 正确写法1\n    #if defined(DEBUG) && DEBUG == 1\n        printf(\"Debug mode 1\\n\");\n    #endif\n    \n    // 正确写法2\n    #if DEBUG\n        printf(\"Debug mode 2\\n\");\n    #endif\n    \n    // 正确写法3\n    #ifdef DEBUG\n        printf(\"Debug defined\\n\");\n    #endif\n    \n    // 错误写法\n    // #ifdef DEBUG && DEBUG == 1  // 语法错误！\n    //     printf(\"Error\\n\");\n    // #endif\n    \n    return 0;\n}"
            },
            {
                id: 30,
                question: "以下代码的输出结果是什么？\n\n<C>\n#define PRINT(format, value) printf(format, value)\n\nint main() {\n    int x = 10;\n    PRINT(\"Value: %d\\n\", x);\n    PRINT(\"Doubled: %d\\n\", x * 2);\n    return 0;\n}\n</C>",
                options: [
                    "`Value: 10` 和 `Doubled: 20`",
                    "编译错误",
                    "只输出 `Value: 10`",
                    "未定义行为"
                ],
                correctAnswer: 0,
                explanation: "这是带参数的宏的正确用法。宏展开后变成两个 `printf` 调用，分别输出 `Value: 10` 和 `Doubled: 20`。宏参数可以是表达式。",
                codeExample: "#include <stdio.h>\n\n#define PRINT(format, value) printf(format, value)\n#define DEBUG_PRINT(var) printf(#var \" = %d\\n\", var)\n\nint main() {\n    int x = 10;\n    \n    // 基本使用\n    PRINT(\"Value: %d\\n\", x);        // Value: 10\n    PRINT(\"Doubled: %d\\n\", x * 2);  // Doubled: 20\n    \n    // 使用字符串化\n    DEBUG_PRINT(x);      // x = 10\n    DEBUG_PRINT(x * 2);  // x * 2 = 20\n    \n    return 0;\n}"
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