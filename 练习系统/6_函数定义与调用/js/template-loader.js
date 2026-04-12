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
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid update(int *p) {\n    int val = 100;\n    p = &val;  /* 修改指针本身 */\n}\n\nint main() {\n    int a = 5;\n    int *ptr = &a;\n    update(ptr);\n    printf(\"%d\", *ptr);\n    return 0;\n}\n</C>",
                options: [
                    "`100`",
                    "`5`",
                    "未定义行为",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "这是「指针参数修改」的经典陷阱！函数参数是「值传递」，`p`是`ptr`的副本。修改`p=&val`只改变「局部指针p」的指向，不影响`main`中的`ptr`。`ptr`仍指向`a`，输出`5`。「关键误区」：误以为修改指针参数会改变外部指针。「正确做法」：使用二级指针`void update(int **p) { *p = &val; }`或返回指针。「易错点」：`*p=100`才能修改指向的值。",
                codeExample: "#include <stdio.h>\n\n/* 错误：只修改了指针副本 */\nvoid update_wrong(int *p) {\n    int val = 100;\n    p = &val;  /* 只改变局部p */\n}\n\n/* 正确1：修改指针指向的值 */\nvoid update_value(int *p) {\n    *p = 100;  /* 修改*p的值 */\n}\n\n/* 正确2：使用二级指针 */\nvoid update_pointer(int **pp) {\n    static int val = 100;\n    *pp = &val;  /* 修改外部指针 */\n}\n\nint main() {\n    int a = 5;\n    int *ptr = &a;\n    \n    update_wrong(ptr);\n    printf(\"wrong: %d\\n\", *ptr);  /* 5 */\n    \n    update_value(ptr);\n    printf(\"value: %d\\n\", *ptr);  /* 100 */\n    \n    update_pointer(&ptr);\n    printf(\"pointer: %d\\n\", *ptr);  /* 100 */\n    \n    return 0;\n}"
            },
            {
                id: 2,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid func(int a[]) {\n    a[0] = 100;\n}\n\nint main() {\n    int arr[] = {1, 2, 3};\n    func(arr);\n    printf(\"%d\", arr[0]);\n    return 0;\n}\n</C>",
                options: [
                    "`1`",
                    "`100`",
                    "编译错误",
                    "未定义行为"
                ],
                correctAnswer: 1,
                explanation: "这是「数组参数传递」的陷阱！数组作为参数传递时，传递的是首地址（指针），不是值拷贝。函数内通过`a[0]=100`修改的是原数组的内容。「易错点」：1) 数组参数看似值传递，实际是指针传递；2) 函数内修改数组元素会影响原数组；3) `int a[]`等价于`int *a`，都是指针。「对比」：基本类型（int等）是值传递，数组是指针传递。",
                codeExample: "#include <stdio.h>\n\nvoid func(int a[]) {  /* 等价于 int *a */\n    a[0] = 100;  /* 修改原数组！ */\n}\n\nint main() {\n    int arr[] = {1, 2, 3};\n    func(arr);\n    printf(\"arr[0] = %d\\n\", arr[0]);  /* 100 */\n    \n    /* 对比：基本类型是值传递 */\n    int x = 5;\n    /* void f(int n) { n = 100; } */\n    /* f(x); printf(\"%d\", x);  仍然是5 */\n    return 0;\n}"
            },
            {
                id: 3,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 10;\nvoid func(int x) {\n    printf(\"%d \", x);\n}\n\nint main() {\n    func(20);\n    printf(\"%d\", x);\n    return 0;\n}\n</C>",
                options: [
                    "`20 10`",
                    "`10 20`",
                    "`20 20`",
                    "`10 10`"
                ],
                correctAnswer: 0,
                explanation: "这是「局部变量遮蔽全局变量」的陷阱！`func`的参数`x`遮蔽了全局变量`x`，在`func`内`x`指的是参数(20)。`main`中直接使用`x`指的是全局变量(10)。「易错点」：1) 局部变量和全局变量同名时，局部变量优先；2) 函数参数也是局部变量，会遮蔽同名全局变量；3) 在函数内无法直接访问被遮蔽的全局变量。",
                codeExample: "#include <stdio.h>\n\nint x = 10;  /* 全局变量 */\n\nvoid func(int x) {  /* 参数x遮蔽全局x */\n    printf(\"func内x=%d\\n\", x);  /* 20(参数) */\n}\n\nint main() {\n    func(20);\n    printf(\"main中x=%d\\n\", x);  /* 10(全局) */\n    \n    int x = 30;  /* 局部x遮蔽全局x */\n    printf(\"局部x=%d\\n\", x);  /* 30 */\n    return 0;\n}"
            },
            {
                id: 4,
                question: "以下代码的输出结果是什么？\n\n<C>\nint func(int a, int b) {\n    return a++ + ++b;\n}\n\nint main() {\n    int x = 3, y = 4;\n    int result = func(x, y);\n    printf(\"%d %d %d\", result, x, y);\n    return 0;\n}\n</C>",
                options: [
                    "`8 3 4`",
                    "`8 4 5`",
                    "`7 3 4`",
                    "`8 3 5`"
                ],
                correctAnswer: 0,
                explanation: "这是「函数参数求值+自增」的陷阱！1) C语言函数参数是「值传递」，`a`和`b`是`x`和`y`的副本；2) `a++`先用a=3再增为4，`++b`先增为5再使用，所以返回3+5=8；3) 但`x`和`y`不受影响，因为修改的是副本。「易错点」：1) 函数内对参数的自增不影响外部变量；2) `a++`和`++b`在return表达式中的求值顺序是确定的（同一表达式内）。",
                codeExample: "#include <stdio.h>\n\nint func(int a, int b) {\n    return a++ + ++b;  /* a=3(后增), b=5(前增), 返回8 */\n}\n\nint main() {\n    int x = 3, y = 4;\n    int result = func(x, y);  /* 值传递，x/y不变 */\n    printf(\"result=%d, x=%d, y=%d\\n\", result, x, y);  /* 8,3,4 */\n    return 0;\n}"
            },
            {
                id: 5,
                question: "以下代码的输出结果是什么？\n\n<C>\nint func() {\n    return 1, 2, 3;\n}\n\nint main() {\n    int x = func();\n    printf(\"%d\", x);\n    return 0;\n}\n</C>",
                options: [
                    "`1`",
                    "`3`",
                    "`6`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "这是「逗号表达式作为返回值」的陷阱！`return 1, 2, 3`中，逗号运算符从左到右依次求值，返回最右边的值3。「易错点」：1) 逗号运算符的结果是最后一个表达式的值；2) `return 1, 2, 3`不是返回多个值，而是返回逗号表达式的结果3；3) C语言函数只能返回一个值。「关键区别」：`return (1, 2, 3)`和`return 1, 2, 3`效果相同。",
                codeExample: "#include <stdio.h>\n\nint func() {\n    return 1, 2, 3;  /* 逗号表达式，返回3 */\n}\n\nint main() {\n    printf(\"%d\\n\", func());  /* 3 */\n    \n    /* 逗号表达式示例 */\n    int a = (1, 2, 3);  /* a = 3 */\n    int b = (printf(\"Hi\"), 5);  /* 先输出Hi，b = 5 */\n    printf(\"a=%d, b=%d\\n\", a, b);\n    return 0;\n}"
            },
            {
                id: 6,
                question: "以下代码的运行结果是什么？\n\n<C>\nint* createNumber() {\n    int num = 42;\n    return &num;  /* 返回局部变量地址 */\n}\n\nint main() {\n    int *p = createNumber();\n    printf(\"%d\", *p);\n    return 0;\n}\n</C>",
                options: [
                    "`42`",
                    "`0`",
                    "未定义行为（可能崩溃或随机值）",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是「返回局部变量地址」的致命错误！`num`是栈上的局部变量，函数返回后「栈帧被销毁」，`&num`指向的内存被释放或覆盖。访问`*p`是「未定义行为」，可能输出42（碰巧未覆盖）、随机值、或崩溃。「关键危险」：指针悬空（dangling pointer）。「正确做法」：1) 返回`static int`；2) 使用`malloc`动态分配；3) 传入缓冲区指针。「编译器警告」：现代编译器会警告此错误。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\n/* 危险：返回局部变量地址 */\nint* create_wrong() {\n    int num = 42;\n    return &num;  /* 栈被销毁！ */\n}\n\n/* 正确1：使用static */\nint* create_static() {\n    static int num = 42;  /* 静态存储 */\n    return &num;\n}\n\n/* 正确2：使用malloc */\nint* create_malloc() {\n    int *p = (int*)malloc(sizeof(int));\n    *p = 42;\n    return p;  /* 调用者需free */\n}\n\n/* 正确3：传入缓冲区 */\nvoid create_buffer(int *buf) {\n    *buf = 42;\n}\n\nint main() {\n    /* int *p1 = create_wrong();  危险！ */\n    \n    int *p2 = create_static();\n    printf(\"%d\\n\", *p2);  /* 42 */\n    \n    int *p3 = create_malloc();\n    printf(\"%d\\n\", *p3);  /* 42 */\n    free(p3);\n    \n    int num;\n    create_buffer(&num);\n    printf(\"%d\\n\", num);  /* 42 */\n    \n    return 0;\n}"
            },
            {
                id: 7,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid swap(int *a, int *b) {\n    int *temp = a;\n    a = b;\n    b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(&x, &y);\n    printf(\"%d %d\", x, y);\n    return 0;\n}\n</C>",
                options: [
                    "`5 10`",
                    "`10 5`",
                    "未定义行为",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "这是「交换指针副本而非交换值」的经典陷阱！`swap`函数交换的是指针`a`和`b`的副本，而不是交换它们指向的值。`a=b`只改变了局部指针a的指向，不影响main中的x和y。「易错点」：1) 交换指针副本≠交换指针指向的值；2) 要交换值需要用`int temp=*a; *a=*b; *b=temp;`；3) 要交换外部指针需要用二级指针。「关键理解」：指针参数也是值传递，修改指针本身不影响外部。",
                codeExample: "#include <stdio.h>\n\n/* 错误：交换指针副本 */\nvoid swap_wrong(int *a, int *b) {\n    int *temp = a; a = b; b = temp;  /* 只交换了副本 */\n}\n\n/* 正确：交换指针指向的值 */\nvoid swap_right(int *a, int *b) {\n    int temp = *a; *a = *b; *b = temp;  /* 交换值 */\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap_wrong(&x, &y);\n    printf(\"wrong: %d %d\\n\", x, y);  /* 5 10 */\n    \n    swap_right(&x, &y);\n    printf(\"right: %d %d\\n\", x, y);  /* 10 5 */\n    return 0;\n}"
            },
            {
                id: 8,
                question: "以下代码的输出结果是什么？\n\n<C>\nint func(int a, int b) {\n    return a > b ? a : b;\n}\n\nint main() {\n    printf(\"%d\", func(func(3, 5), func(2, 8)));\n    return 0;\n}\n</C>",
                options: [
                    "`5`",
                    "`8`",
                    "`3`",
                    "未定义行为"
                ],
                correctAnswer: 1,
                explanation: "这是「函数嵌套调用」的陷阱！先计算内层：`func(3,5)`返回5，`func(2,8)`返回8。然后外层：`func(5,8)`返回8。「易错点」：1) 函数参数的求值顺序是未指定的，但这里无论先算哪个内层func，结果都一样；2) 如果两个内层调用有副作用（如修改同一全局变量），结果可能不确定；3) 函数返回值可以直接作为另一个函数的参数。",
                codeExample: "#include <stdio.h>\n\nint func(int a, int b) {\n    return a > b ? a : b;\n}\n\nint main() {\n    /* 嵌套调用 */\n    int result = func(func(3, 5), func(2, 8));\n    /* 等价于：func(5, 8) = 8 */\n    printf(\"%d\\n\", result);  /* 8 */\n    return 0;\n}"
            },
            {
                id: 9,
                question: "以下代码的输出结果是什么？\n\n<C>\nint func(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int (*pf)(int, int) = func;\n    printf(\"%d\", pf(3, 4));\n    return 0;\n}\n</C>",
                options: [
                    "`7`",
                    "编译错误",
                    "未定义行为",
                    "`0`"
                ],
                correctAnswer: 0,
                explanation: "这是「函数指针调用」的陷阱！`int (*pf)(int, int) = func`定义了一个函数指针pf，指向func。通过函数指针调用`pf(3,4)`和直接调用`func(3,4)`效果完全相同，返回7。「易错点」：1) 函数名就是函数的地址，不需要`&`运算符；2) `pf(3,4)`和`(*pf)(3,4)`等价；3) 函数指针常用于回调函数和策略模式。",
                codeExample: "#include <stdio.h>\n\nint add(int a, int b) { return a + b; }\nint sub(int a, int b) { return a - b; }\n\nint main() {\n    int (*pf)(int, int) = add;  /* 函数指针 */\n    printf(\"add: %d\\n\", pf(3, 4));     /* 7 */\n    printf(\"add: %d\\n\", (*pf)(3, 4));  /* 7，等价写法 */\n    \n    pf = sub;  /* 指向另一个函数 */\n    printf(\"sub: %d\\n\", pf(3, 4));     /* -1 */\n    return 0;\n}"
            },
            {
                id: 10,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid func(int a, int b) {\n    printf(\"%d %d\", a, b);\n}\n\nint main() {\n    func(1);\n    return 0;\n}\n</C>",
                options: [
                    "`1 0`",
                    "`1 随机值`",
                    "编译错误或未定义行为",
                    "`1`"
                ],
                correctAnswer: 2,
                explanation: "这是「函数参数不匹配」的陷阱！`func`需要2个参数，但调用时只传了1个。C89中这是未定义行为（参数类型不匹配），C99中这是编译错误。「易错点」：1) 如果没有函数声明，编译器不会检查参数个数；2) 有函数声明时，参数不匹配会编译错误；3) C语言不像C++那样支持函数重载和默认参数。「教训」：始终在使用函数前声明函数原型。",
                codeExample: "#include <stdio.h>\n\n/* 有声明：编译器会检查参数 */\nvoid func(int a, int b);\n\nint main() {\n    /* func(1);  编译错误：参数太少 */\n    func(1, 2);  /* 正确 */\n    return 0;\n}\n\nvoid func(int a, int b) {\n    printf(\"%d %d\\n\", a, b);\n}"
            },
            {
                id: 11,
                question: "以下代码的运行结果是什么？\n\n<C>\nint factorial(int n) {\n    return n * factorial(n - 1);  /* 缺少终止条件 */\n}\n\nint main() {\n    printf(\"%d\", factorial(5));\n    return 0;\n}\n</C>",
                options: [
                    "`120`",
                    "`0`",
                    "栈溢出（程序崩溃）",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是「递归无终止条件」的致命错误！递归函数「缺少基准情張」，会无限调用`factorial(4)\u2192factorial(3)\u2192...\u2192factorial(-\u221e)`，每次调用在栈上分配帧，最终「栈空间耗尽」导致**Stack Overflow**崩溃。「正确写法」：`if (n <= 1) return 1;`在递归前检查。「关键教训」：每个递归必须有明确的终止条件。「调试提示」：现代编译器可能警告“函数缺少return”。",
                codeExample: "#include <stdio.h>\n\n/* 错误：缺少终止条件 */\n/* int factorial_wrong(int n) {\n    return n * factorial_wrong(n - 1);  无限递归！\n} */\n\n/* 正确：有终止条件 */\nint factorial(int n) {\n    if (n <= 1) return 1;  /* 基准情張 */\n    return n * factorial(n - 1);\n}\n\n/* 另一种错误：条件错误 */\n/* int factorial_bad(int n) {\n    if (n == 0) return 1;\n    return n * factorial_bad(n - 1);  \n    factorial_bad(-1)会死循环！\n} */\n\nint main() {\n    /* factorial_wrong(5);  崩溃！ */\n    \n    printf(\"%d\\n\", factorial(5));  /* 120 */\n    \n    /* 递归深度限制 */\n    /* factorial(100000);  可能栈溢出 */\n    \n    return 0;\n}"
            },
            {
                id: 12,
                question: "以下代码的输出结果是什么？\n\n<C>\nint func(int n) {\n    static int count = 0;\n    count += n;\n    return count;\n}\n\nint main() {\n    printf(\"%d \", func(1));\n    printf(\"%d \", func(2));\n    printf(\"%d\", func(3));\n    return 0;\n}\n</C>",
                options: [
                    "`1 2 3`",
                    "`1 3 6`",
                    "`0 0 0`",
                    "`1 2 6`"
                ],
                correctAnswer: 1,
                explanation: "这是「static局部变量在函数中」的陷阱！`static int count = 0`只初始化一次，后续调用不会重新初始化。第一次：count=0+1=1；第二次：count=1+2=3；第三次：count=3+3=6。「易错点」：1) 误以为每次调用函数count都重置为0；2) `static`变量在函数调用之间保持其值；3) `static`变量存储在静态区，不是栈上。",
                codeExample: "#include <stdio.h>\n\nint func(int n) {\n    static int count = 0;  /* 只初始化一次！ */\n    count += n;\n    return count;\n}\n\nint main() {\n    printf(\"%d \", func(1));  /* 1 */\n    printf(\"%d \", func(2));  /* 3 */\n    printf(\"%d\\n\", func(3));  /* 6 */\n    \n    /* 对比：无static */\n    /* int func2(int n) { int count = 0; count += n; return count; } */\n    /* func2(1)=1, func2(2)=2, func2(3)=3 */\n    return 0;\n}"
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
                question: "以下代码的输出结果是什么？\n\n<C>\nint func(int n) {\n    if (n == 0) return 0;\n    return n + func(--n);\n}\n\nint main() {\n    printf(\"%d\", func(5));\n    return 0;\n}\n</C>",
                options: [
                    "`15`",
                    "`10`",
                    "未定义行为",
                    "`14`"
                ],
                correctAnswer: 2,
                explanation: "这是「递归中修改参数导致未定义行为」的陷阱！`return n + func(--n)`中，`n`和`--n`在同一表达式中，`n`被读取的同时也被`--n`修改，两者之间没有序列点，这是「未定义行为」。「易错点」：1) 误以为先读取n再递减，结果为5+4+3+2+1=15；2) 实际上编译器可能先执行`--n`再读取n，结果为4+3+2+1+0=10；3) 不同编译器结果不同。「正确写法」：`return n + func(n-1)`。",
                codeExample: "#include <stdio.h>\n\n/* 危险：未定义行为 */\n/* int func_wrong(int n) { */\n/*     if (n == 0) return 0; */\n/*     return n + func_wrong(--n);  未定义行为！ */\n/* } */\n\n/* 正确：不修改n */\nint func_right(int n) {\n    if (n == 0) return 0;\n    return n + func_right(n - 1);  /* n不变，传n-1 */\n}\n\nint main() {\n    printf(\"%d\\n\", func_right(5));  /* 15 */\n    return 0;\n}"
            }
            ,
            {
                id: 16,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid swap(int *a, int *b) {\n    int *temp = a;\n    a = b;\n    b = temp;  /* 交换指针而非值 */\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(&x, &y);\n    printf(\"%d %d\", x, y);\n    return 0;\n}\n</C>",
                options: [
                    "`10 5`",
                    "`5 10`",
                    "`0 0`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "这是「指针交换vs值交换」的经典陷阱！`swap`函数交换的是「局部指针变量a和b」，而非它们「指向的值」。`a=b`只是让局部指针a指向y，不改变x的值。输出`5 10`不变。「正确写法」：`int temp=*a; *a=*b; *b=temp;`交换值。「关键区别」：`a=b`改变指针，`*a=*b`改变指向的值。「易错点」：误以为指针参数能自动交换值。",
                codeExample: "#include <stdio.h>\n\n/* 错误：只交换了指针 */\nvoid swap_wrong(int *a, int *b) {\n    int *temp = a;\n    a = b;  /* 只改变局部指针 */\n    b = temp;\n}\n\n/* 正确：交换指针指向的值 */\nvoid swap_correct(int *a, int *b) {\n    int temp = *a;  /* 临时变量存值 */\n    *a = *b;        /* 修改*a的值 */\n    *b = temp;      /* 修改*b的值 */\n}\n\nint main() {\n    int x = 5, y = 10;\n    \n    printf(\"交换前: x=%d, y=%d\\n\", x, y);\n    \n    swap_wrong(&x, &y);\n    printf(\"错误方法: x=%d, y=%d\\n\", x, y);  /* 5 10 */\n    \n    swap_correct(&x, &y);\n    printf(\"正确方法: x=%d, y=%d\\n\", x, y);  /* 10 5 */\n    \n    return 0;\n}"
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
                explanation: "参数按照从左到右的顺序传递给函数。`func(1, 2, 3)` 中，a = 1, b = 2, c = 3，按顺序输出。",
                codeExample: "#include <stdio.h>\n\nvoid func(int a, int b, int c) {\n    printf(\"a=%d, b=%d, c=%d\\n\", a, b, c);\n}\n\nint main() {\n    func(1, 2, 3);  // 按顺序传递参数\n    func(10, 20, 30);\n    return 0;\n}"
            },
            {
                id: 21,
                question: "以下代码的输出结果是什么？\n\n<C>\nchar* getString() {\n    return \"Hello\";  /* 返回字符串字面量 */\n}\n\nint main() {\n    char *s = getString();\n    s[0] = 'h';  /* 修改返回的字符串 */\n    printf(\"%s\", s);\n    return 0;\n}\n</C>",
                options: [
                    "`hello`",
                    "`Hello`",
                    "未定义行为（崩溃）",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是「字符串字面量修改」与「函数返回指针」的组合陷阱！`\"Hello\"`是「字符串常量」，存储在「只读内存区」。`getString()`返回指向它的指针是合法的，但`s[0]='h'`尝试「修改只读内存」是「未定义行为」，通常导致「段错误崩溃」。「正确做法」：使用`const char*`防止修改，或返回可写缓冲区。「关键知识」：字符串字面量在程序整个生命周期存在，可安全返回。",
                codeExample: "#include <stdio.h>\n#include <string.h>\n\n/* 危险：返回字面量后修改 */\nchar* get_wrong() {\n    return \"Hello\";  /* 只读区 */\n}\n\n/* 正确1：使用const */\nconst char* get_const() {\n    return \"Hello\";  /* 编译器防止修改 */\n}\n\n/* 正确2：返回可写缓冲区 */\nchar* get_buffer() {\n    static char buf[] = \"Hello\";  /* 可写 */\n    return buf;\n}\n\n/* 正确3：传入缓冲区 */\nvoid get_copy(char *dest, int size) {\n    strncpy(dest, \"Hello\", size-1);\n    dest[size-1] = '\\0';\n}\n\nint main() {\n    /* char *s1 = get_wrong();\n       s1[0] = 'h';  崩溃！ */\n    \n    const char *s2 = get_const();\n    /* s2[0] = 'h';  编译错误 */\n    printf(\"%s\\n\", s2);\n    \n    char *s3 = get_buffer();\n    s3[0] = 'h';  /* 合法 */\n    printf(\"%s\\n\", s3);\n    \n    char buf[20];\n    get_copy(buf, sizeof(buf));\n    buf[0] = 'h';\n    printf(\"%s\\n\", buf);\n    \n    return 0;\n}"
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
                question: "以下代码的运行结果是什么？\n\n<C>\nint* createArray() {\n    int arr[5] = {1, 2, 3, 4, 5};\n    return arr;  /* 返回局部数组地址 */\n}\n\nint main() {\n    int *p = createArray();\n    printf(\"%d\", p[0]);\n    return 0;\n}\n</C>",
                options: [
                    "`1`",
                    "`0`",
                    "未定义行为（崩溃或随机值）",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是「返回局部数组地址」的经典错误！局部数组`arr`在栈上分配，函数返回后「栈帧被销毁」，`arr`的内存被释放。返回的指针`p`指向「已释放的内存」，访问`p[0]`是「未定义行为」，可能输出1(碰巧未覆盖)、随机值、或崩溃。「解决方案」：1) 使用`static`数组；2) `malloc`动态分配；3) 传入缓冲区指针。「关键警告」：编译器通常会警告「returning address of local variable」。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\n/* 错误：返回局部数组地址 */\n/* int* create_wrong() {\n    int arr[5] = {1, 2, 3, 4, 5};\n    return arr;  栈被销毁！\n} */\n\n/* 正确1：使用static */\nint* create_static() {\n    static int arr[5] = {1, 2, 3, 4, 5};\n    return arr;  /* 静态存储区 */\n}\n\n/* 正确2：动态分配 */\nint* create_malloc() {\n    int *arr = (int*)malloc(5 * sizeof(int));\n    int i;\n    for (i = 0; i < 5; i++) arr[i] = i + 1;\n    return arr;  /* 调用者需free */\n}\n\n/* 正确3：传入缓冲区 */\nvoid create_buffer(int *buf, int size) {\n    int i;\n    for (i = 0; i < size; i++) buf[i] = i + 1;\n}\n\nint main() {\n    /* int *p1 = create_wrong();\n       printf(\"%d\\n\", p1[0]);  危险！ */\n    \n    int *p2 = create_static();\n    printf(\"%d\\n\", p2[0]);  /* 1 */\n    \n    int *p3 = create_malloc();\n    printf(\"%d\\n\", p3[0]);  /* 1 */\n    free(p3);\n    \n    int buf[5];\n    create_buffer(buf, 5);\n    printf(\"%d\\n\", buf[0]);  /* 1 */\n    \n    return 0;\n}"
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
                question: "以下代码的输出结果是什么？\n\n<C>\nint add(int a, int b) { return a + b; }\nint sub(int a, int b) { return a - b; }\n\nint main() {\n    int (*op)(int, int);  /* 函数指针 */\n    op = add;\n    printf(\"%d \", op(10, 5));\n    op = sub;\n    printf(\"%d\", op(10, 5));\n    return 0;\n}\n</C>",
                options: [
                    "`15 5`",
                    "`10 10`",
                    "`5 15`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "这是「函数指针」的基础应用。`int (*op)(int, int)`声明了一个指向「返回int、接受两个int参数的函数」的指针。`op=add`使op指向add函数，`op(10,5)`调用add返回15。`op=sub`后op指向sub，`op(10,5)`调用sub返回5。输出`15 5`。「关键语法」：`(*op)`中的括号必须，`int *op(int,int)`是返回指针的函数。「应用」：回调函数、策略模式、函数表驱动。",
                codeExample: "#include <stdio.h>\n\nint add(int a, int b) { return a + b; }\nint sub(int a, int b) { return a - b; }\nint mul(int a, int b) { return a * b; }\n\nint main() {\n    int i;\n    /* 函数指针声明 */\n    int (*op)(int, int);\n    \n    /* 函数指针数组 */\n    int (*ops[])(int, int) = {add, sub, mul};\n    const char *names[] = {\"+\", \"-\", \"*\"};\n    \n    /* 使用函数指针 */\n    op = add;\n    printf(\"add: %d\\n\", op(10, 5));  /* 15 */\n    \n    op = sub;\n    printf(\"sub: %d\\n\", op(10, 5));  /* 5 */\n    \n    /* 遍历函数表 */\n    for (i = 0; i < 3; i++) {\n        printf(\"10 %s 5 = %d\\n\", names[i], ops[i](10, 5));\n    }\n    /* 输出: 15, 5, 50 */\n    \n    return 0;\n}"
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