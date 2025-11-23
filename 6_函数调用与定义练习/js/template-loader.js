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
                question: "以下关于函数定义的说法，正确的是：",
                options: [
                    "函数定义必须写在 `main()` 函数之前",
                    "函数定义可以嵌套，即在一个函数内部定义另一个函数",
                    "函数定义由函数头和函数体两部分组成",
                    "函数定义时必须指定返回值，不能为 `void`"
                ],
                correctAnswer: 2,
                explanation: "C语言中，函数定义由函数头（包括返回类型、函数名、参数列表）和函数体（用花括号包围的语句块）组成。函数可以定义在main之前或之后（需要声明），C语言不支持函数嵌套定义，函数可以返回void表示无返回值。",
                codeExample: "#include <stdio.h>\n\n// 函数定义：函数头 + 函数体\nint add(int a, int b) {  // 函数头\n    return a + b;         // 函数体\n}\n\nvoid greet() {            // void表示无返回值\n    printf(\"Hello!\\n\");\n}\n\nint main() {\n    printf(\"%d\\n\", add(3, 5));\n    greet();\n    return 0;\n}"
            },
            {
                id: 2,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid func(int x) {\n    x = x + 10;\n}\n\nint main() {\n    int a = 5;\n    func(a);\n    printf(\"%d\", a);\n    return 0;\n}\n</C>",
                options: [
                    "`5`",
                    "`15`",
                    "`10`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "C语言中，基本数据类型作为参数传递时采用**值传递**方式。函数 `func` 接收的是变量 `a` 的副本，对 `x` 的修改不会影响原变量 `a`。所以输出仍然是 `5`。",
                codeExample: "#include <stdio.h>\n\nvoid func(int x) {\n    x = x + 10;  // 修改的是副本\n    printf(\"函数内x=%d\\n\", x);  // 15\n}\n\nint main() {\n    int a = 5;\n    func(a);  // 传递a的副本\n    printf(\"main中a=%d\\n\", a);  // 5（不变）\n    return 0;\n}"
            },
            {
                id: 3,
                question: "以下哪个库函数用于计算字符串长度？",
                options: [
                    "`strlen()`",
                    "`sizeof()`",
                    "`length()`",
                    "`strsize()`"
                ],
                correctAnswer: 0,
                explanation: "`strlen()` 是C标准库函数，定义在 `<string.h>` 中，用于计算字符串的实际长度（不包括'\\0'）。`sizeof()` 是运算符，返回数据类型或变量的字节数。C语言没有 `length()` 和 `strsize()` 函数。",
                codeExample: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str[] = \"Hello\";\n    \n    printf(\"strlen(str) = %lu\\n\", strlen(str));  // 5（字符数）\n    printf(\"sizeof(str) = %lu\\n\", sizeof(str));  // 6（包括'\\0'）\n    \n    return 0;\n}"
            },
            {
                id: 4,
                question: "以下代码的输出结果是什么？\n\n<C>\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    printf(\"%d\", factorial(4));\n    return 0;\n}\n</C>",
                options: [
                    "`10`",
                    "`24`",
                    "`120`",
                    "栈溢出错误"
                ],
                correctAnswer: 1,
                explanation: "这是递归计算阶乘的函数。`factorial(4)` 计算过程：4×3×2×1 = 24。递归终止条件是 `n <= 1` 时返回1。",
                codeExample: "#include <stdio.h>\n\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    // factorial(4)的递归过程：\n    // 4 * factorial(3)\n    // 4 * 3 * factorial(2)\n    // 4 * 3 * 2 * factorial(1)\n    // 4 * 3 * 2 * 1 = 24\n    printf(\"%d\\n\", factorial(4));  // 24\n    return 0;\n}"
            },
            {
                id: 5,
                question: "关于函数声明（函数原型），以下说法错误的是：",
                options: [
                    "函数声明可以省略参数名，只保留参数类型",
                    "函数声明必须以分号结尾",
                    "函数声明和函数定义可以多次出现",
                    "函数声明通常放在调用之前，定义可以在调用之后"
                ],
                correctAnswer: 2,
                explanation: "函数声明可以多次出现，但函数定义只能出现一次。函数声明告诉编译器函数的接口，函数定义提供具体实现。重复定义会导致编译错误。",
                codeExample: "#include <stdio.h>\n\n// 函数声明（可以多次）\nint add(int, int);  // 可以省略参数名\nint add(int a, int b);  // 也可以带参数名\n\nint main() {\n    printf(\"%d\\n\", add(3, 5));\n    return 0;\n}\n\n// 函数定义（只能一次）\nint add(int a, int b) {\n    return a + b;\n}\n\n// int add(int x, int y) { return x + y; }  // 错误：重复定义"
            },
            {
                id: 6,
                question: "以下代码的输出结果是什么？\n\n<C>\nint global = 10;\n\nvoid func() {\n    int global = 20;\n    printf(\"%d \", global);\n}\n\nint main() {\n    printf(\"%d \", global);\n    func();\n    return 0;\n}\n</C>",
                options: [
                    "`10 10`",
                    "`10 20`",
                    "`20 20`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "局部变量会隐藏同名的全局变量。在 `func()` 函数内，局部变量 `global` 隐藏了全局变量 `global`，所以函数内输出20。而 `main()` 中访问的是全局变量，输出10。",
                codeExample: "#include <stdio.h>\n\nint global = 10;  // 全局变量\n\nvoid func() {\n    int global = 20;  // 局部变量，隐藏全局变量\n    printf(\"%d \", global);  // 输出局部变量：20\n}\n\nint main() {\n    printf(\"%d \", global);  // 输出全局变量：10\n    func();\n    printf(\"%d\", global);  // 仍然是全局变量：10\n    return 0;\n}"
            },
            {
                id: 7,
                question: "以下哪个函数调用是正确的？已知函数原型为 `int max(int a, int b);`",
                options: [
                    "`int result = max(5, 10);`",
                    "`max(5, 10);`",
                    "`printf(\"%d\", max(5, 10));`",
                    "以上都正确"
                ],
                correctAnswer: 3,
                explanation: "函数返回值可以被使用（赋值给变量、作为参数传递）也可以被忽略。选项A将返回值赋值，选项B忽略返回值（合法但浪费），选项C将返回值作为printf的参数，这三种调用方式都是语法正确的。",
                codeExample: "#include <stdio.h>\n\nint max(int a, int b) {\n    return a > b ? a : b;\n}\n\nint main() {\n    // 方式1：接收返回值\n    int result = max(5, 10);\n    printf(\"%d\\n\", result);\n    \n    // 方式2：忽略返回值（合法但不常用）\n    max(5, 10);\n    \n    // 方式3：返回值作为参数\n    printf(\"%d\\n\", max(5, 10));\n    \n    return 0;\n}"
            },
            {
                id: 8,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(&x, &y);\n    printf(\"%d %d\", x, y);\n    return 0;\n}\n</C>",
                options: [
                    "`5 10`",
                    "`10 5`",
                    "`0 0`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "通过指针传递参数（地址传递），函数可以修改原变量的值。`swap` 函数接收 `x` 和 `y` 的地址，通过解引用修改它们的值，成功交换了两个变量。",
                codeExample: "#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;  // temp = 5\n    *a = *b;        // x = 10\n    *b = temp;      // y = 5\n}\n\nint main() {\n    int x = 5, y = 10;\n    printf(\"交换前：x=%d, y=%d\\n\", x, y);\n    swap(&x, &y);  // 传递地址\n    printf(\"交换后：x=%d, y=%d\\n\", x, y);\n    return 0;\n}"
            },
            {
                id: 9,
                question: "`pow(2, 3)` 函数调用的返回值是什么？（假设已包含 `<math.h>`）",
                options: [
                    "`5`",
                    "`6`",
                    "`8.0`",
                    "`9`"
                ],
                correctAnswer: 2,
                explanation: "`pow(x, y)` 是数学库函数，计算 x 的 y 次方，返回类型是 `double`。`pow(2, 3)` 计算 2³ = 8.0。",
                codeExample: "#include <stdio.h>\n#include <math.h>\n\nint main() {\n    double result = pow(2, 3);  // 2的3次方 = 8.0\n    printf(\"%.1f\\n\", result);   // 8.0\n    \n    // pow返回double类型\n    printf(\"pow(2, 10) = %.0f\\n\", pow(2, 10));  // 1024.0\n    \n    return 0;\n}"
            },
            {
                id: 10,
                question: "以下代码的输出结果是什么？\n\n<C>\nint count = 0;\n\nvoid increment() {\n    count++;\n}\n\nint main() {\n    increment();\n    increment();\n    increment();\n    printf(\"%d\", count);\n    return 0;\n}\n</C>",
                options: [
                    "`0`",
                    "`1`",
                    "`3`",
                    "未定义行为"
                ],
                correctAnswer: 2,
                explanation: "全局变量 `count` 在所有函数中共享。每次调用 `increment()` 都会使 `count` 加1。调用3次后，`count` 的值为3。",
                codeExample: "#include <stdio.h>\n\nint count = 0;  // 全局变量\n\nvoid increment() {\n    count++;  // 修改全局变量\n    printf(\"count = %d\\n\", count);\n}\n\nint main() {\n    increment();  // count = 1\n    increment();  // count = 2\n    increment();  // count = 3\n    printf(\"最终 count = %d\\n\", count);\n    return 0;\n}"
            },
            {
                id: 11,
                question: "以下关于递归函数的说法，错误的是：",
                options: [
                    "递归函数必须有递归终止条件",
                    "递归调用时，每次调用都会在栈上分配新的局部变量空间",
                    "递归总是比循环效率高",
                    "递归深度过大可能导致栈溢出"
                ],
                correctAnswer: 2,
                explanation: "递归通常比循环效率低，因为函数调用有开销（保存寄存器、分配栈空间等）。递归的优点是代码简洁易懂，适合处理树、图等递归结构。对于简单的重复操作，循环通常更高效。",
                codeExample: "#include <stdio.h>\n\n// 递归实现：代码简洁但效率较低\nint fib_recursive(int n) {\n    if (n <= 1) return n;\n    return fib_recursive(n-1) + fib_recursive(n-2);  // 重复计算多次\n}\n\n// 循环实现：效率高\nint fib_iterative(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1, c;\n    for (int i = 2; i <= n; i++) {\n        c = a + b;\n        a = b;\n        b = c;\n    }\n    return b;\n}\n\nint main() {\n    printf(\"递归: %d\\n\", fib_recursive(10));\n    printf(\"循环: %d\\n\", fib_iterative(10));\n    return 0;\n}"
            },
            {
                id: 12,
                question: "以下代码的输出结果是什么？\n\n<C>\nint func(int n) {\n    if (n == 0) return 0;\n    if (n == 1) return 1;\n    return func(n-1) + func(n-2);\n}\n\nint main() {\n    printf(\"%d\", func(5));\n    return 0;\n}\n</C>",
                options: [
                    "`3`",
                    "`5`",
                    "`8`",
                    "`13`"
                ],
                correctAnswer: 1,
                explanation: "这是斐波那契数列的递归实现。`func(5)` 计算过程：func(5) = func(4) + func(3) = (func(3) + func(2)) + (func(2) + func(1)) = 5。斐波那契数列：0, 1, 1, 2, 3, 5, 8...",
                codeExample: "#include <stdio.h>\n\nint func(int n) {\n    if (n == 0) return 0;\n    if (n == 1) return 1;\n    return func(n-1) + func(n-2);\n}\n\nint main() {\n    // 斐波那契数列\n    for (int i = 0; i <= 5; i++) {\n        printf(\"func(%d) = %d\\n\", i, func(i));\n    }\n    // 输出：0, 1, 1, 2, 3, 5\n    return 0;\n}"
            },
            {
                id: 13,
                question: "关于 `main` 函数的参数，以下说法正确的是：",
                options: [
                    "`main` 函数不能有参数",
                    "`main` 函数可以有 `int argc, char *argv[]` 参数来接收命令行参数",
                    "`main` 函数的参数只能是整型",
                    "`main` 函数必须返回 `void`"
                ],
                correctAnswer: 1,
                explanation: "`main` 函数可以有两个标准参数：`int argc`（参数个数）和 `char *argv[]`（参数数组）。`argc` 包括程序名本身，`argv[0]` 是程序名，`argv[1]` 到 `argv[argc-1]` 是命令行参数。`main` 应返回 `int`。",
                codeExample: "#include <stdio.h>\n\nint main(int argc, char *argv[]) {\n    printf(\"参数个数: %d\\n\", argc);\n    for (int i = 0; i < argc; i++) {\n        printf(\"argv[%d] = %s\\n\", i, argv[i]);\n    }\n    return 0;\n}\n\n// 运行: ./program hello world\n// 输出:\n// 参数个数: 3\n// argv[0] = ./program\n// argv[1] = hello\n// argv[2] = world"
            },
            {
                id: 14,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid modify(int arr[]) {\n    arr[0] = 100;\n}\n\nint main() {\n    int nums[] = {1, 2, 3};\n    modify(nums);\n    printf(\"%d\", nums[0]);\n    return 0;\n}\n</C>",
                options: [
                    "`1`",
                    "`100`",
                    "`0`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "数组作为参数传递时，传递的是数组的地址（指针），而不是数组的副本。因此函数内对数组元素的修改会影响原数组。`modify` 函数修改了 `nums[0]` 的值为100。",
                codeExample: "#include <stdio.h>\n\nvoid modify(int arr[]) {\n    arr[0] = 100;  // 修改原数组\n    printf(\"函数内: arr[0] = %d\\n\", arr[0]);\n}\n\nint main() {\n    int nums[] = {1, 2, 3};\n    printf(\"修改前: nums[0] = %d\\n\", nums[0]);\n    modify(nums);  // 传递数组地址\n    printf(\"修改后: nums[0] = %d\\n\", nums[0]);\n    return 0;\n}"
            },
            {
                id: 15,
                question: "`strcpy(dest, src)` 函数的作用是：",
                options: [
                    "比较两个字符串是否相等",
                    "将 `src` 字符串复制到 `dest`",
                    "连接两个字符串",
                    "计算字符串长度"
                ],
                correctAnswer: 1,
                explanation: "`strcpy()` 是字符串复制函数，将源字符串 `src`（包括'\\0'）复制到目标字符串 `dest`。需要确保 `dest` 有足够的空间。注意：`strcpy` 不检查边界，容易造成缓冲区溢出。",
                codeExample: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char src[] = \"Hello\";\n    char dest[20];  // 确保足够大\n    \n    strcpy(dest, src);  // 复制src到dest\n    printf(\"dest = %s\\n\", dest);  // Hello\n    \n    // 注意：dest必须足够大\n    // char small[3];\n    // strcpy(small, src);  // 危险！缓冲区溢出\n    \n    return 0;\n}"
            },
            {
                id: 16,
                question: "以下代码能否正常编译和运行？\n\n<C>\nint add(int a, int b);\n\nint main() {\n    printf(\"%d\", add(3, 5));\n    return 0;\n}\n\nint add(int a, int b) {\n    return a + b;\n}\n</C>",
                options: [
                    "可以正常编译和运行",
                    "编译错误：函数未定义",
                    "链接错误",
                    "运行时错误"
                ],
                correctAnswer: 0,
                explanation: "可以正常运行。函数声明（第1行）告诉编译器函数的接口，使得 `main` 中可以调用它。函数定义（最后）提供具体实现。这是典型的函数声明与定义分离的写法。",
                codeExample: "#include <stdio.h>\n\n// 函数声明（放在前面）\nint add(int a, int b);\n\nint main() {\n    // 可以调用，因为已声明\n    printf(\"%d\\n\", add(3, 5));\n    return 0;\n}\n\n// 函数定义（放在后面）\nint add(int a, int b) {\n    return a + b;\n}"
            },
            {
                id: 17,
                question: "以下代码的输出结果是什么？\n\n<C>\nint func(int x) {\n    static int count = 0;\n    count++;\n    return count;\n}\n\nint main() {\n    printf(\"%d \", func(1));\n    printf(\"%d \", func(2));\n    printf(\"%d\", func(3));\n    return 0;\n}\n</C>",
                options: [
                    "`1 1 1`",
                    "`1 2 3`",
                    "`0 0 0`",
                    "`3 3 3`"
                ],
                correctAnswer: 1,
                explanation: "`static` 局部变量在函数调用之间保持其值。`count` 只初始化一次（第一次调用时），之后每次调用函数都会保留上次的值。三次调用分别输出1、2、3。",
                codeExample: "#include <stdio.h>\n\nint func(int x) {\n    static int count = 0;  // 只初始化一次\n    count++;\n    printf(\"第%d次调用，count=%d\\n\", x, count);\n    return count;\n}\n\nint main() {\n    func(1);  // count = 1\n    func(2);  // count = 2（保留上次的值）\n    func(3);  // count = 3\n    return 0;\n}"
            },
            {
                id: 18,
                question: "关于函数返回值，以下说法错误的是：",
                options: [
                    "函数可以返回基本数据类型（int、float等）",
                    "函数可以返回指针",
                    "函数可以返回数组",
                    "函数可以返回结构体"
                ],
                correctAnswer: 2,
                explanation: "C语言中，函数不能直接返回数组，但可以返回指向数组的指针。函数可以返回基本类型、指针和结构体。如果需要返回数组，可以返回指针或使用结构体包装。",
                codeExample: "#include <stdio.h>\n\n// 错误：不能直接返回数组\n// int[] getArray() { ... }\n\n// 正确：返回指向数组的指针\nint* getArray() {\n    static int arr[3] = {1, 2, 3};  // static确保返回后仍有效\n    return arr;\n}\n\n// 正确：返回结构体包装数组\ntypedef struct {\n    int data[3];\n} Array;\n\nArray getArrayStruct() {\n    Array arr = {{1, 2, 3}};\n    return arr;\n}\n\nint main() {\n    int *p = getArray();\n    printf(\"%d\\n\", p[0]);\n    return 0;\n}"
            },
            {
                id: 19,
                question: "`sqrt(16.0)` 函数调用的返回值是什么？（假设已包含 `<math.h>`）",
                options: [
                    "`4`",
                    "`4.0`",
                    "`256.0`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "`sqrt()` 是数学库函数，计算平方根，返回类型是 `double`。`sqrt(16.0)` 返回 4.0。",
                codeExample: "#include <stdio.h>\n#include <math.h>\n\nint main() {\n    double result = sqrt(16.0);  // 4.0\n    printf(\"%.1f\\n\", result);\n    \n    // 其他常用数学函数\n    printf(\"sqrt(25) = %.0f\\n\", sqrt(25.0));    // 5.0\n    printf(\"sqrt(2) = %.2f\\n\", sqrt(2.0));      // 1.41\n    printf(\"pow(2,4) = %.0f\\n\", pow(2, 4));     // 16.0\n    \n    return 0;\n}"
            },
            {
                id: 20,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid func(int a, int b, int c) {\n    printf(\"%d %d %d\", a, b, c);\n}\n\nint main() {\n    func(1, 2, 3);\n    return 0;\n}\n</C>",
                options: [
                    "`1 2 3`",
                    "`3 2 1`",
                    "`1 3 2`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "参数按照从左到右的顺序传递给函数。`func(1, 2, 3)` 中，a=1, b=2, c=3，按顺序输出。",
                codeExample: "#include <stdio.h>\n\nvoid func(int a, int b, int c) {\n    printf(\"a=%d, b=%d, c=%d\\n\", a, b, c);\n}\n\nint main() {\n    func(1, 2, 3);  // 按顺序传递参数\n    func(10, 20, 30);\n    return 0;\n}"
            },
            {
                id: 21,
                question: "以下代码中，哪个函数声明与定义不匹配？\n\n声明：`int calc(int x, int y);`\n\n定义选项：",
                options: [
                    "`int calc(int x, int y) { return x + y; }`",
                    "`int calc(int a, int b) { return a * b; }`",
                    "`float calc(int x, int y) { return x / y; }`",
                    "A和B都匹配"
                ],
                correctAnswer: 2,
                explanation: "函数声明和定义的返回类型、函数名、参数类型和个数必须一致。参数名可以不同（A和B都匹配），但返回类型必须相同。选项C的返回类型是 `float`，与声明的 `int` 不匹配。",
                codeExample: "#include <stdio.h>\n\n// 声明\nint calc(int x, int y);\n\nint main() {\n    printf(\"%d\\n\", calc(10, 5));\n    return 0;\n}\n\n// 正确：参数名可以不同\nint calc(int a, int b) {\n    return a + b;\n}\n\n// 错误：返回类型不匹配\n// float calc(int x, int y) { return x / y; }"
            },
            {
                id: 22,
                question: "以下关于 `return` 语句的说法，错误的是：",
                options: [
                    "`return` 语句可以出现在函数的任何位置",
                    "`void` 函数中可以使用 `return;` 提前退出",
                    "一个函数只能有一个 `return` 语句",
                    "`return` 语句会立即终止函数执行"
                ],
                correctAnswer: 2,
                explanation: "一个函数可以有多个 `return` 语句（例如在不同的条件分支中）。`return` 会立即终止函数并返回到调用处。`void` 函数可以使用 `return;`（不带值）提前退出。",
                codeExample: "#include <stdio.h>\n\n// 多个return语句\nint max(int a, int b) {\n    if (a > b) return a;  // 第一个return\n    return b;              // 第二个return\n}\n\n// void函数的return\nvoid printSign(int n) {\n    if (n > 0) {\n        printf(\"正数\\n\");\n        return;  // 提前退出\n    }\n    if (n < 0) {\n        printf(\"负数\\n\");\n        return;\n    }\n    printf(\"零\\n\");\n}\n\nint main() {\n    printf(\"%d\\n\", max(5, 10));\n    printSign(-5);\n    return 0;\n}"
            },
            {
                id: 23,
                question: "以下代码的输出结果是什么？\n\n<C>\nint sum(int n) {\n    if (n == 1) return 1;\n    return n + sum(n - 1);\n}\n\nint main() {\n    printf(\"%d\", sum(5));\n    return 0;\n}\n</C>",
                options: [
                    "`5`",
                    "`10`",
                    "`15`",
                    "`120`"
                ],
                correctAnswer: 2,
                explanation: "这是递归计算1到n的和。`sum(5)` = 5 + sum(4) = 5 + 4 + sum(3) = ... = 5+4+3+2+1 = 15。",
                codeExample: "#include <stdio.h>\n\nint sum(int n) {\n    printf(\"sum(%d) 被调用\\n\", n);\n    if (n == 1) return 1;\n    return n + sum(n - 1);\n}\n\nint main() {\n    // sum(5)的递归过程：\n    // 5 + sum(4)\n    // 5 + 4 + sum(3)\n    // 5 + 4 + 3 + sum(2)\n    // 5 + 4 + 3 + 2 + sum(1)\n    // 5 + 4 + 3 + 2 + 1 = 15\n    printf(\"结果: %d\\n\", sum(5));\n    return 0;\n}"
            },
            {
                id: 24,
                question: "关于形式参数和实际参数，以下说法正确的是：",
                options: [
                    "形参和实参必须同名",
                    "形参是函数定义时声明的参数，实参是调用时传入的参数",
                    "形参和实参的类型可以不同",
                    "实参的个数可以少于形参"
                ],
                correctAnswer: 1,
                explanation: "形式参数（形参）是函数定义时声明的参数，实际参数（实参）是函数调用时传入的具体值。形参和实参的名字可以不同，但类型和个数必须匹配（除非使用可变参数）。",
                codeExample: "#include <stdio.h>\n\n// x, y是形式参数\nint add(int x, int y) {\n    return x + y;\n}\n\nint main() {\n    int a = 5, b = 10;\n    // a, b是实际参数\n    int result = add(a, b);\n    printf(\"%d\\n\", result);\n    \n    // 也可以直接传字面量作为实参\n    printf(\"%d\\n\", add(3, 7));\n    \n    return 0;\n}"
            },
            {
                id: 25,
                question: "`strcmp(str1, str2)` 函数返回0表示什么？",
                options: [
                    "`str1` 小于 `str2`",
                    "`str1` 大于 `str2`",
                    "`str1` 等于 `str2`",
                    "函数执行出错"
                ],
                correctAnswer: 2,
                explanation: "`strcmp()` 比较两个字符串。返回值：0表示相等，负数表示str1<str2，正数表示str1>str2。比较是按字典序（ASCII码）进行的。",
                codeExample: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str1[] = \"Hello\";\n    char str2[] = \"Hello\";\n    char str3[] = \"World\";\n    \n    printf(\"strcmp(str1, str2) = %d\\n\", strcmp(str1, str2));  // 0（相等）\n    printf(\"strcmp(str1, str3) = %d\\n\", strcmp(str1, str3));  // 负数（H < W）\n    printf(\"strcmp(str3, str1) = %d\\n\", strcmp(str3, str1));  // 正数（W > H）\n    \n    if (strcmp(str1, str2) == 0) {\n        printf(\"str1 和 str2 相等\\n\");\n    }\n    \n    return 0;\n}"
            },
            {
                id: 26,
                question: "以下代码中存在什么问题？\n\n<C>\nint* createArray() {\n    int arr[5] = {1, 2, 3, 4, 5};\n    return arr;\n}\n\nint main() {\n    int *p = createArray();\n    printf(\"%d\", p[0]);\n    return 0;\n}\n</C>",
                options: [
                    "没有问题",
                    "返回了局部数组的地址，导致悬空指针",
                    "数组大小声明错误",
                    "指针类型不匹配"
                ],
                correctAnswer: 1,
                explanation: "局部数组 `arr` 在函数返回后被销毁，返回其地址会导致悬空指针。解决方法：使用 `static` 数组、动态分配内存（malloc）、或通过参数传递数组。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\n// 错误：返回局部数组地址\n// int* wrong() {\n//     int arr[5] = {1, 2, 3, 4, 5};\n//     return arr;  // 危险！arr被销毁\n// }\n\n// 正确方法1：使用static\nint* method1() {\n    static int arr[5] = {1, 2, 3, 4, 5};\n    return arr;  // static数组不会被销毁\n}\n\n// 正确方法2：动态分配\nint* method2() {\n    int *arr = (int*)malloc(5 * sizeof(int));\n    for (int i = 0; i < 5; i++) arr[i] = i + 1;\n    return arr;  // 记得在使用后free\n}\n\nint main() {\n    int *p1 = method1();\n    printf(\"%d\\n\", p1[0]);\n    \n    int *p2 = method2();\n    printf(\"%d\\n\", p2[0]);\n    free(p2);  // 释放内存\n    \n    return 0;\n}"
            },
            {
                id: 27,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid test(int x) {\n    printf(\"%d \", ++x);\n}\n\nint main() {\n    int a = 5;\n    test(a);\n    printf(\"%d\", a);\n    return 0;\n}\n</C>",
                options: [
                    "`5 5`",
                    "`6 5`",
                    "`6 6`",
                    "`5 6`"
                ],
                correctAnswer: 1,
                explanation: "`++x` 在函数内先自增再输出，所以输出6。但由于是值传递，`x` 是 `a` 的副本，对 `x` 的修改不影响 `a`，所以 `a` 仍然是5。",
                codeExample: "#include <stdio.h>\n\nvoid test(int x) {\n    printf(\"函数内++x前: %d\\n\", x);  // 5\n    printf(\"函数内++x后: %d\\n\", ++x);  // 6\n}\n\nint main() {\n    int a = 5;\n    test(a);  // 传递a的副本\n    printf(\"main中a: %d\\n\", a);  // 5（不变）\n    return 0;\n}"
            },
            {
                id: 28,
                question: "以下哪个不是C标准库函数？",
                options: [
                    "`printf()`",
                    "`scanf()`",
                    "`print()`",
                    "`strlen()`"
                ],
                correctAnswer: 2,
                explanation: "`print()` 不是C标准库函数。C语言使用 `printf()` 进行格式化输出。`printf()` 在 `<stdio.h>` 中，`scanf()` 也在 `<stdio.h>` 中用于输入，`strlen()` 在 `<string.h>` 中用于计算字符串长度。",
                codeExample: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    // 正确的库函数\n    printf(\"Hello\\n\");  // 输出函数\n    \n    int num;\n    // scanf(\"%d\", &num);  // 输入函数\n    \n    char str[] = \"test\";\n    printf(\"长度: %lu\\n\", strlen(str));  // 字符串长度\n    \n    // print();  // 错误！没有这个函数\n    \n    return 0;\n}"
            },
            {
                id: 29,
                question: "以下代码中，哪个函数调用会导致编译错误？\n\n已知函数原型：`void process(int *p);`",
                options: [
                    "`int x = 10; process(&x);`",
                    "`int arr[5]; process(arr);`",
                    "`process(NULL);`",
                    "`int x = 10; process(x);`"
                ],
                correctAnswer: 3,
                explanation: "函数期望接收 `int*` 类型（指针），选项D传递的是 `int` 类型的值，类型不匹配导致编译错误。正确的应该是 `process(&x)`。选项B中数组名会自动转换为指针。",
                codeExample: "#include <stdio.h>\n\nvoid process(int *p) {\n    if (p != NULL) {\n        printf(\"%d\\n\", *p);\n    }\n}\n\nint main() {\n    int x = 10;\n    process(&x);  // 正确：传递地址\n    \n    int arr[5] = {1, 2, 3, 4, 5};\n    process(arr);  // 正确：数组名是指针\n    \n    process(NULL);  // 正确：NULL是有效的指针值\n    \n    // process(x);  // 错误：类型不匹配\n    \n    return 0;\n}"
            },
            {
                id: 30,
                question: "以下代码的输出结果是什么？\n\n<C>\nint func(int a, int b) {\n    return a > b ? a : b;\n}\n\nint main() {\n    int x = 5, y = 10;\n    printf(\"%d\", func(func(x, y), func(15, 8)));\n    return 0;\n}\n</C>",
                options: [
                    "`10`",
                    "`15`",
                    "`8`",
                    "`5`"
                ],
                correctAnswer: 1,
                explanation: "函数嵌套调用：先计算内层，`func(5, 10)` 返回10，`func(15, 8)` 返回15，然后计算 `func(10, 15)` 返回15。函数返回两数中的较大值。",
                codeExample: "#include <stdio.h>\n\nint func(int a, int b) {\n    int result = a > b ? a : b;\n    printf(\"func(%d, %d) = %d\\n\", a, b, result);\n    return result;\n}\n\nint main() {\n    int x = 5, y = 10;\n    // 计算过程：\n    // func(x, y) = func(5, 10) = 10\n    // func(15, 8) = 15\n    // func(10, 15) = 15\n    printf(\"最终结果: %d\\n\", func(func(x, y), func(15, 8)));\n    return 0;\n}"
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