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
                question: "以下代码的运行结果是什么？\n\n<C>\nint *p;\nprintf(\"%d\", *p);\n</C>",
                options: [
                    "`0`",
                    "编译错误",
                    "未定义行为（可能崩溃）",
                    "输出随机值"
                ],
                correctAnswer: 2,
                explanation: "这是**野指针**的经典陷阱！指针p声明后未初始化，其值是**随机的垃圾值**（可能指向任意内存）。对野指针解引用`*p`是**严重的未定义行为**，可能导致：1) 程序崩溃（访问非法内存）；2) 读取随机数据；3) 破坏其他数据；4) 安全漏洞。**关键原则**：指针使用前必须初始化！可初始化为NULL、已有变量地址或动态分配内存。**易错点**：误以为未初始化指针默认为NULL。**防范措施**：养成习惯`int *p = NULL;`或立即赋值。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    /* 危险：野指针 */\n    int *p1;  /* 未初始化，值随机 */\n    /* printf(\\\"%d\\\", *p1);  未定义行为！可能崩溃 */\n    \n    /* 安全做法1：初始化为NULL */\n    int *p2 = NULL;\n    if (p2 != NULL) {  /* 使用前检查 */\n        printf(\\\"%d\\\\n\\\", *p2);\n    } else {\n        printf(\\\"p2是空指针\\\\n\\\");\n    }\n    \n    /* 安全做法2：指向已有变量 */\n    int x = 42;\n    int *p3 = &x;  /* 立即初始化 */\n    printf(\\\"*p3=%d\\\\n\\\", *p3);  /* 安全 */\n    \n    /* 安全做法3：动态分配 */\n    int *p4 = (int*)malloc(sizeof(int));\n    if (p4 != NULL) {\n        *p4 = 100;\n        printf(\\\"*p4=%d\\\\n\\\", *p4);\n        free(p4);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 2,
                question: "以下代码的输出结果是什么？\n\n<C>\nint a = 100;\nint *p = &a;\nprintf(\"%d\", *p);\n</C>",
                options: [
                    "输出变量a的地址",
                    "`100`",
                    "编译错误",
                    "未定义行为"
                ],
                correctAnswer: 1,
                explanation: "`*p` 是解引用操作，获取指针p所指向地址中存储的值。由于p指向a，`*p` 就是a的值100。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int a = 100;\n    int *p = &a;  // p指向a\n    \n    printf(\"*p = %d\\n\", *p);  // 解引用，输出100\n    printf(\"p = %p\\n\", (void*)p);  // 输出地址\n    printf(\"&a = %p\\n\", (void*)&a);  // a的地址\n    \n    return 0;\n}"
            },
            {
                id: 3,
                question: "地址运算符 `&` 的作用是：",
                options: [
                    "获取变量的值",
                    "获取变量的地址",
                    "定义指针变量",
                    "解引用指针"
                ],
                correctAnswer: 1,
                explanation: "`&` 是取地址运算符，用于获取变量的内存地址。`*` 是解引用运算符，用于访问指针所指向的值。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 50;\n    int *ptr;\n    \n    ptr = &x;  // &x 获取x的地址\n    \n    printf(\"x的值: %d\\n\", x);\n    printf(\"x的地址: %p\\n\", (void*)&x);\n    printf(\"ptr存储的地址: %p\\n\", (void*)ptr);\n    printf(\"*ptr的值: %d\\n\", *ptr);  // 解引用\n    \n    return 0;\n}"
            },
            {
                id: 4,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 10, y = 20;\nint *p = &x;\n*p = 30;\nprintf(\"%d %d\", x, y);\n</C>",
                options: [
                    "`10 20`",
                    "`30 20`",
                    "`10 30`",
                    "`30 30`"
                ],
                correctAnswer: 1,
                explanation: "指针p指向x，`*p = 30` 通过指针修改了x的值为30。y没有被修改，仍然是20。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 10, y = 20;\n    int *p = &x;  // p指向x\n    \n    printf(\"修改前: x=%d, y=%d\\n\", x, y);\n    *p = 30;  // 通过指针修改x的值\n    printf(\"修改后: x=%d, y=%d\\n\", x, y);\n    \n    return 0;\n}"
            },
            {
                id: 5,
                question: "关于指针的定义，以下哪个是正确的？",
                options: [
                    "`int *p, q;` 定义了两个指针变量",
                    "`int* p, q;` 定义了两个指针变量",
                    "`int *p, *q;` 定义了两个指针变量",
                    "以上都正确"
                ],
                correctAnswer: 2,
                explanation: "在C语言中，`*` 属于变量而不是类型。`int *p, q;` 中p是指针，q是整型变量。要定义两个指针，需要写成 `int *p, *q;`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 只有p是指针，q是整型\n    int *p, q;\n    \n    // 两个都是指针\n    int *p1, *p2;\n    \n    int x = 10, y = 20;\n    p1 = &x;\n    p2 = &y;\n    \n    printf(\"*p1 = %d, *p2 = %d\\n\", *p1, *p2);\n    \n    return 0;\n}"
            },
            {
                id: 6,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid swap(int *a, int *b) {\n    int *temp = a;  /* 交换指针 */\n    a = b;\n    b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    int *p1 = &x, *p2 = &y;\n    swap(p1, p2);\n    printf(\"%d %d\", x, y);\n    return 0;\n}\n</C>",
                options: [
                    "`10 5`",
                    "`5 10`",
                    "编译错误",
                    "未定义行为"
                ],
                correctAnswer: 1,
                explanation: "这是**指针值传递vs地址传递**的经典陷阱！函数`swap`接收的是指针的**副本**（值传递），交换a和b只是交换了局部副本，**不影响main中的p1和p2**，更不影响x和y。原变量x=5, y=10保持不变。**关键误区**：误以为传指针就能改变指针本身。**正确理解**：传指针可改变指向的值（*p），但不能改变指针本身（p）。要改变指针本身需传**指针的指针**`void swap(int **a, int **b)`。**对比**：若写`*a=10`可改变x，但`a=...`只改变局部副本。",
                codeExample: "#include <stdio.h>\n\n/* 错误：交换指针副本 */\nvoid swap_wrong(int *a, int *b) {\n    int *temp = a;\n    a = b;  /* 只改变局部副本！ */\n    b = temp;\n}\n\n/* 正确1：交换指向的值 */\nvoid swap_value(int *a, int *b) {\n    int temp = *a;\n    *a = *b;  /* 改变原变量 */\n    *b = temp;\n}\n\n/* 正确2：用指针的指针 */\nvoid swap_ptr(int **a, int **b) {\n    int *temp = *a;\n    *a = *b;  /* 改变原指针 */\n    *b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    int *p1 = &x, *p2 = &y;\n    \n    swap_wrong(p1, p2);\n    printf(\\\"错误方法: x=%d, y=%d\\\\n\\\", x, y);  /* 5 10 */\n    \n    swap_value(&x, &y);\n    printf(\\\"正确1: x=%d, y=%d\\\\n\\\", x, y);  /* 10 5 */\n    \n    swap_ptr(&p1, &p2);\n    printf(\\\"正确2: *p1=%d, *p2=%d\\\\n\\\", *p1, *p2);  /* 5 10 */\n    \n    return 0;\n}"
            },
            {
                id: 7,
                question: "以下代码中存在什么问题？\n\n<C>\nint *p;\n*p = 100;\n</C>",
                options: [
                    "没有问题",
                    "指针未初始化就使用，导致未定义行为",
                    "赋值语法错误",
                    "指针类型不匹配"
                ],
                correctAnswer: 1,
                explanation: "指针p没有初始化，其值是未知的（野指针）。对未初始化的指针解引用会导致未定义行为，可能崩溃。应该先让指针指向有效的内存地址。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 错误：野指针\n    // int *p;\n    // *p = 100;  // 危险！p指向未知位置\n    \n    // 正确方法1：指向已有变量\n    int x;\n    int *p1 = &x;\n    *p1 = 100;  // 安全\n    \n    // 正确方法2：动态分配内存\n    int *p2 = (int*)malloc(sizeof(int));\n    *p2 = 100;  // 安全\n    free(p2);\n    \n    printf(\"x = %d\\n\", x);\n    return 0;\n}"
            },
            {
                id: 8,
                question: "以下代码的输出结果是什么？\n\n<C>\nint arr[5] = {10, 20, 30, 40, 50};\nint *p = arr;\nprintf(\"%d\", *(p + 2));\n</C>",
                options: [
                    "`10`",
                    "`20`",
                    "`30`",
                    "`12`（arr的地址加2）"
                ],
                correctAnswer: 2,
                explanation: "数组名arr可以作为指向第一个元素的指针。`p + 2` 指向第三个元素（arr[2]），`*(p + 2)` 解引用得到值30。指针算术会根据数据类型自动调整。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int arr[5] = {10, 20, 30, 40, 50};\n    int *p = arr;  // p指向arr[0]\n    \n    printf(\"*p = %d (arr[0])\\n\", *p);\n    printf(\"*(p+1) = %d (arr[1])\\n\", *(p+1));\n    printf(\"*(p+2) = %d (arr[2])\\n\", *(p+2));\n    printf(\"p[2] = %d (等价写法)\\n\", p[2]);\n    \n    return 0;\n}"
            },
            {
                id: 9,
                question: "关于指针和数组，以下说法错误的是：",
                options: [
                    "数组名可以看作常量指针",
                    "数组名不能被赋值或修改",
                    "`arr[i]` 等价于 `*(arr + i)`",
                    "数组名和指针完全相同"
                ],
                correctAnswer: 3,
                explanation: "数组名和指针类似但不完全相同。数组名是常量指针，不能修改；而指针变量可以修改。`sizeof(arr)` 返回整个数组大小，`sizeof(p)` 只返回指针大小。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int arr[5] = {1, 2, 3, 4, 5};\n    int *p = arr;\n    \n    printf(\"sizeof(arr) = %lu\\n\", sizeof(arr));  // 20 (5个int)\n    printf(\"sizeof(p) = %lu\\n\", sizeof(p));      // 8 (指针大小)\n    \n    p = p + 1;  // 合法：指针可以修改\n    // arr = arr + 1;  // 错误：数组名不能修改\n    \n    printf(\"arr[2] = %d\\n\", arr[2]);\n    printf(\"*(arr+2) = %d\\n\", *(arr+2));  // 等价\n    \n    return 0;\n}"
            },
            {
                id: 10,
                question: "以下代码的输出结果是什么？\n\n<C>\nchar str[] = \"Hello\";\nchar *p = str;\np++;\nprintf(\"%c\", *p);\n</C>",
                options: [
                    "`H`",
                    "`e`",
                    "`l`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "指针p初始指向字符串的第一个字符'H'，`p++` 后指向第二个字符'e'，`*p` 输出'e'。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    char str[] = \"Hello\";\n    char *p = str;  // p指向'H'\n    \n    printf(\"*p = %c\\n\", *p);  // H\n    p++;  // p移动到下一个字符\n    printf(\"*p = %c\\n\", *p);  // e\n    p++;  // 继续移动\n    printf(\"*p = %c\\n\", *p);  // l\n    \n    return 0;\n}"
            },
            {
                id: 11,
                question: "以下代码的输出结果是什么？\n\n<C>\nint a[5] = {1, 2, 3, 4, 5};\nint *p = a;\nprintf(\"%d %d\", *p++, *++p);\n</C>",
                options: [
                    "`1 2`",
                    "`1 3`",
                    "`2 3`",
                    "未定义行为"
                ],
                correctAnswer: 3,
                explanation: "这是**序列点与副作用**的严重陷阱！在同一个表达式中对p进行两次修改（`*p++`和`*++p`）且无序列点分隔，**求值顺序未定义**，导致**未定义行为**。不同编译器、优化级别可能产生不同结果。**关键问题**：1) `*p++`先取值再p自增；2) `*++p`先p自增再取值；3) 两者对p的修改冲突。**正确做法**：分开写`printf(\\\"%d\\\", *p++); printf(\\\"%d\\\", *p);`。**易错点**：误以为从左到右求值。**类似陷阱**：`i = i++`、`a[i] = i++`等。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int a[5] = {1, 2, 3, 4, 5};\n    int *p = a;\n    \n    /* 危险：未定义行为 */\n    /* printf(\\\"%d %d\\\", *p++, *++p);  结果不确定！ */\n    \n    /* 正确做法：分开操作 */\n    printf(\\\"第1个元素: %d\\\\n\\\", *p);  /* 1 */\n    p++;  /* 移动到下一个 */\n    printf(\\\"第2个元素: %d\\\\n\\\", *p);  /* 2 */\n    \n    /* 理解各种运算符 */\n    p = a;  /* 重置 */\n    int val1 = *p++;  /* 先取值(1)，后p自增 */\n    printf(\\\"*p++: val=%d, *p=%d\\\\n\\\", val1, *p);  /* 1, 2 */\n    \n    p = a;  /* 重置 */\n    int val2 = *++p;  /* 先p自增，后取值(2) */\n    printf(\\\"*++p: val=%d, *p=%d\\\\n\\\", val2, *p);  /* 2, 2 */\n    \n    p = a;  /* 重置 */\n    int val3 = (*p)++;  /* 先取a[0]的值(1)，后a[0]自增为2 */\n    printf(\\\"(*p)++: val=%d, a[0]=%d\\\\n\\\", val3, a[0]);  /* 1, 2 */\n    \n    return 0;\n}"
            },
            {
                id: 12,
                question: "以下代码的输出结果是什么？\n\n<C>\nint a = 10;\nint *p = &a;\n*p = *p + 5;\nprintf(\"%d\", a);\n</C>",
                options: [
                    "`10`",
                    "`15`",
                    "`5`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "指针p指向a，`*p = *p + 5` 等价于 `a = a + 5`，所以a的值变为15。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int a = 10;\n    int *p = &a;\n    \n    printf(\"修改前: a = %d\\n\", a);\n    *p = *p + 5;  // 通过指针修改a\n    printf(\"修改后: a = %d\\n\", a);\n    printf(\"*p = %d\\n\", *p);\n    \n    return 0;\n}"
            },
            {
                id: 13,
                question: "关于 `const` 和指针，以下说法正确的是：",
                options: [
                    "`const int *p` 表示指针不能改变",
                    "`int * const p` 表示指针指向的值不能改变",
                    "`const int * const p` 表示指针和值都不能改变",
                    "`const` 对指针没有作用"
                ],
                correctAnswer: 2,
                explanation: "`const int *p` 表示指针指向的值不能通过p修改（常量指针），但p可以指向其他地址。`int * const p` 表示指针本身不能改变（指针常量），但可以修改指向的值。`const int * const p` 两者都不能改变。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 10, y = 20;\n    \n    // 指向常量的指针\n    const int *p1 = &x;\n    // *p1 = 30;  // 错误：不能修改\n    p1 = &y;  // 正确：指针可以改变\n    \n    // 常量指针\n    int * const p2 = &x;\n    *p2 = 30;  // 正确：可以修改值\n    // p2 = &y;  // 错误：指针不能改变\n    \n    // 指向常量的常量指针\n    const int * const p3 = &x;\n    // *p3 = 40;  // 错误\n    // p3 = &y;   // 错误\n    \n    return 0;\n}"
            },
            {
                id: 14,
                question: "以下代码的输出结果是什么？\n\n<C>\nint arr[] = {1, 2, 3, 4, 5};\nint *p = &arr[2];\nprintf(\"%d %d\", *(p-1), *(p+1));\n</C>",
                options: [
                    "`1 3`",
                    "`2 4`",
                    "`3 5`",
                    "`2 3`"
                ],
                correctAnswer: 1,
                explanation: "指针p指向arr[2]（值为3）。`*(p-1)` 是arr[1]（值为2），`*(p+1)` 是arr[3]（值为4）。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int *p = &arr[2];  // p指向3\n    \n    printf(\"*p = %d\\n\", *p);      // 3\n    printf(\"*(p-1) = %d\\n\", *(p-1));  // 2\n    printf(\"*(p+1) = %d\\n\", *(p+1));  // 4\n    printf(\"*(p-2) = %d\\n\", *(p-2));  // 1\n    \n    return 0;\n}"
            },
            {
                id: 15,
                question: "以下代码实现的功能是：\n\n<C>\nvoid modify(int *p) {\n    *p = *p * 2;\n}\n\nint main() {\n    int x = 5;\n    modify(&x);\n    printf(\"%d\", x);\n    return 0;\n}\n</C>",
                options: [
                    "输出 `5`",
                    "输出 `10`",
                    "编译错误",
                    "输出 `0`"
                ],
                correctAnswer: 1,
                explanation: "函数 `modify` 通过指针参数修改了原变量x的值，将5乘以2得到10。这是指针作为函数参数实现值修改的典型应用。",
                codeExample: "#include <stdio.h>\n\nvoid modify(int *p) {\n    printf(\"函数内修改前: *p = %d\\n\", *p);\n    *p = *p * 2;\n    printf(\"函数内修改后: *p = %d\\n\", *p);\n}\n\nint main() {\n    int x = 5;\n    printf(\"调用前: x = %d\\n\", x);\n    modify(&x);\n    printf(\"调用后: x = %d\\n\", x);\n    return 0;\n}"
            },
            {
                id: 16,
                question: "以下代码的输出结果是什么？\n\n<C>\nchar *s1 = \"Hello\";\nchar *s2 = \"Hello\";\nif (s1 == s2) {\n    printf(\"相同\");\n} else {\n    printf(\"不同\");\n}\n</C>",
                options: [
                    "一定输出`相同`",
                    "一定输出`不同`",
                    "编译器优化决定，可能相同或不同",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是**指针比较vs字符串比较**的陷阱！`s1 == s2`比较的是**指针地址**，而非字符串内容。大多数编译器会进行**字符串常量池优化**，将相同字面量存储在同一地址，此时s1和s2指向同一内存，输出\\\"相同\\\"。但这是**未保证的实现细节**，不同编译器或优化级别可能不同。**正确做法**：用`strcmp(s1,s2)==0`比较内容。**关键区别**：`==`比较地址，`strcmp`比较内容。**易错点**：误以为`==`能比较字符串。**安全原则**：永远用`strcmp`比较字符串！",
                codeExample: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char *s1 = \\\"Hello\\\";\n    char *s2 = \\\"Hello\\\";\n    char s3[] = \\\"Hello\\\";\n    char s4[] = \\\"Hello\\\";\n    \n    /* 指针比较（地址） */\n    if (s1 == s2) {\n        printf(\\\"s1和s2地址相同（编译器优化）\\\\n\\\");\n    }\n    \n    if (s3 == s4) {\n        printf(\\\"不会执行\\\\n\\\");\n    } else {\n        printf(\\\"s3和s4是不同数组，地址不同\\\\n\\\");\n    }\n    \n    /* 正确：内容比较 */\n    if (strcmp(s1, s2) == 0) {\n        printf(\\\"s1和s2内容相同\\\\n\\\");  /* 总是执行 */\n    }\n    \n    if (strcmp(s3, s4) == 0) {\n        printf(\\\"s3和s4内容相同\\\\n\\\");  /* 总是执行 */\n    }\n    \n    /* 打印地址对比 */\n    printf(\\\"s1地址: %p\\\\n\\\", (void*)s1);\n    printf(\\\"s2地址: %p\\\\n\\\", (void*)s2);  /* 可能与s1相同 */\n    printf(\\\"s3地址: %p\\\\n\\\", (void*)s3);\n    printf(\\\"s4地址: %p\\\\n\\\", (void*)s4);  /* 必与s3不同 */\n    \n    return 0;\n}"
            },
            {
                id: 17,
                question: "关于指针运算，以下说法错误的是：",
                options: [
                    "指针可以加上或减去整数",
                    "两个指针可以相减",
                    "两个指针可以相加",
                    "指针可以进行关系比较"
                ],
                correctAnswer: 2,
                explanation: "指针不能相加，因为两个地址相加没有实际意义。但指针可以减去整数（向前移动）、加上整数（向后移动）、两个指针相减（计算距离）、以及进行关系比较。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int *p1 = &arr[1];\n    int *p2 = &arr[4];\n    \n    // 合法操作\n    int *p3 = p1 + 2;  // 指针加整数\n    int *p4 = p2 - 1;  // 指针减整数\n    int diff = p2 - p1;  // 指针相减，结果为3\n    \n    printf(\"diff = %d\\n\", diff);\n    \n    if (p1 < p2) {\n        printf(\"p1 在 p2 前面\\n\");\n    }\n    \n    // 非法操作\n    // int *p5 = p1 + p2;  // 错误：指针不能相加\n    \n    return 0;\n}"
            },
            {
                id: 18,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 10;\nint *p = &x;\nint **pp = &p;\nprintf(\"%d\", **pp);\n</C>",
                options: [
                    "`10`",
                    "输出p的地址",
                    "输出x的地址",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "`pp` 是指向指针的指针（二级指针）。`*pp` 得到p的值（即x的地址），`**pp` 再解引用得到x的值10。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 10;\n    int *p = &x;     // p指向x\n    int **pp = &p;   // pp指向p\n    \n    printf(\"x = %d\\n\", x);\n    printf(\"*p = %d\\n\", *p);    // 通过p访问x\n    printf(\"**pp = %d\\n\", **pp);  // 通过pp访问x\n    \n    // 层级关系\n    printf(\"&x = %p\\n\", (void*)&x);\n    printf(\"p = %p\\n\", (void*)p);\n    printf(\"*pp = %p\\n\", (void*)*pp);\n    \n    return 0;\n}"
            },
            {
                id: 19,
                question: "以下哪个函数原型可以通过指针修改数组？",
                options: [
                    "`void func(int arr[]);`",
                    "`void func(int *arr);`",
                    "`void func(int arr[], int size);`",
                    "以上都可以"
                ],
                correctAnswer: 3,
                explanation: "这三种写法在函数参数中都是等价的，数组名作为参数时会退化为指针。所以都可以通过指针修改原数组。",
                codeExample: "#include <stdio.h>\n\n// 三种等价的函数声明\nvoid func1(int arr[]) {\n    arr[0] = 100;\n}\n\nvoid func2(int *arr) {\n    arr[0] = 200;\n}\n\nvoid func3(int arr[], int size) {\n    for (int i = 0; i < size; i++) {\n        arr[i] *= 2;\n    }\n}\n\nint main() {\n    int nums[] = {1, 2, 3, 4, 5};\n    \n    func1(nums);\n    printf(\"func1后: nums[0] = %d\\n\", nums[0]);\n    \n    func2(nums);\n    printf(\"func2后: nums[0] = %d\\n\", nums[0]);\n    \n    func3(nums, 5);\n    printf(\"func3后: \");\n    for (int i = 0; i < 5; i++) {\n        printf(\"%d \", nums[i]);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 20,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid increment(int *p) {\n    (*p)++;\n}\n\nint main() {\n    int x = 5;\n    increment(&x);\n    increment(&x);\n    printf(\"%d\", x);\n    return 0;\n}\n</C>",
                options: [
                    "`5`",
                    "`6`",
                    "`7`",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "每次调用 `increment` 函数，x的值增加1。调用两次后，x从5变为7。注意 `(*p)++` 的括号，确保先解引用再自增。",
                codeExample: "#include <stdio.h>\n\nvoid increment(int *p) {\n    (*p)++;  // 括号很重要\n    printf(\"函数内: *p = %d\\n\", *p);\n}\n\nint main() {\n    int x = 5;\n    printf(\"初始: x = %d\\n\", x);\n    \n    increment(&x);\n    printf(\"第1次调用后: x = %d\\n\", x);\n    \n    increment(&x);\n    printf(\"第2次调用后: x = %d\\n\", x);\n    \n    return 0;\n}"
            },
            {
                id: 21,
                question: "以下代码的运行结果是什么？\n\n<C>\nint *func() {\n    int x = 100;\n    return &x;\n}\n\nint main() {\n    int *p = func();\n    int y = 200;  /* 新变量 */\n    printf(\"%d\", *p);\n    return 0;\n}\n</C>",
                options: [
                    "输出`100`",
                    "输出`200`",
                    "未定义行为（可能输出随机值或崩溃）",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是**悬空指针（dangling pointer）**的严重陷阱！`func()`返回局部变量x的地址，但**x在函数返回时被销毁**，其栈空间被释放。p指向的是**已失效的内存**，解引用`*p`是**未定义行为**。**可能结果**：1) 碰巧输出100（栈未被覆盖）；2) 输出200（y覆盖了x的位置）；3) 输出随机值；4) 程序崩溃。**根本问题**：局部变量生命周期仅在函数内。**正确做法**：1) 返回static变量；2) 返回动态分配内存；3) 通过参数传出。**易错点**：误以为返回地址就能访问。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\n/* 错误：返回局部变量地址 */\nint *wrong() {\n    int x = 100;\n    return &x;  /* 危险！x被销毁 */\n}\n\n/* 正确1：使用static */\nint *method1() {\n    static int x = 100;  /* static生命周期整个程序 */\n    return &x;\n}\n\n/* 正确2：动态分配 */\nint *method2() {\n    int *p = (int*)malloc(sizeof(int));\n    if (p != NULL) {\n        *p = 100;\n    }\n    return p;  /* 堆内存，调用者需free */\n}\n\n/* 正确3：通过参数传出 */\nvoid method3(int *out) {\n    *out = 100;  /* 修改调用者的变量 */\n}\n\nint main() {\n    /* 危险演示 */\n    /* int *p1 = wrong(); */\n    /* printf(\\\"%d\\\\n\\\", *p1);  未定义行为！ */\n    \n    /* 正确用法 */\n    int *p2 = method1();\n    printf(\\\"method1: %d\\\\n\\\", *p2);\n    \n    int *p3 = method2();\n    if (p3 != NULL) {\n        printf(\\\"method2: %d\\\\n\\\", *p3);\n        free(p3);  /* 必须释放 */\n    }\n    \n    int result;\n    method3(&result);\n    printf(\\\"method3: %d\\\\n\\\", result);\n    \n    return 0;\n}"
            },
            {
                id: 22,
                question: "以下代码的输出结果是什么？\n\n<C>\nchar str[] = \"abcde\";\nchar *p = str + 2;\nprintf(\"%s\", p);\n</C>",
                options: [
                    "`abcde`",
                    "`cde`",
                    "`c`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "指针p指向str[2]（字符'c'）。`printf(\"%s\", p)` 从p指向的位置开始输出字符串，直到遇到'\\0'，所以输出\"cde\"。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    char str[] = \"abcde\";\n    char *p = str + 2;  // p指向'c'\n    \n    printf(\"整个字符串: %s\\n\", str);\n    printf(\"从p开始: %s\\n\", p);  // cde\n    printf(\"单个字符: %c\\n\", *p);  // c\n    \n    return 0;\n}"
            },
            {
                id: 23,
                question: "关于 `NULL` 指针，以下说法正确的是：",
                options: [
                    "`NULL` 指针可以安全地解引用",
                    "`NULL` 指针不占用内存空间",
                    "使用指针前应检查是否为 `NULL`",
                    "`NULL` 和未初始化的指针相同"
                ],
                correctAnswer: 2,
                explanation: "`NULL` 指针表示不指向任何有效内存，解引用NULL会导致程序崩溃。使用指针前应检查是否为NULL。NULL指针和未初始化的指针不同，未初始化的指针是野指针，更危险。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *p1 = NULL;  // 空指针\n    int *p2;         // 野指针（未初始化）\n    \n    // 安全的指针使用\n    if (p1 != NULL) {\n        printf(\"%d\\n\", *p1);  // 不会执行\n    } else {\n        printf(\"p1 是空指针\\n\");\n    }\n    \n    // 动态分配后检查\n    int *p3 = (int*)malloc(sizeof(int));\n    if (p3 != NULL) {\n        *p3 = 100;\n        printf(\"*p3 = %d\\n\", *p3);\n        free(p3);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 24,
                question: "以下代码的输出结果是什么？\n\n<C>\nint arr[] = {10, 20, 30};\nint *p = arr;\nprintf(\"%d\", *p++);\n</C>",
                options: [
                    "`10`",
                    "`20`",
                    "`11`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "`*p++` 由于后缀++优先级高，先取值（*p=10），然后指针p自增指向下一个元素。所以输出10。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int arr[] = {10, 20, 30};\n    int *p = arr;\n    \n    printf(\"第1次: %d\\n\", *p++);  // 10, p指向arr[1]\n    printf(\"第2次: %d\\n\", *p++);  // 20, p指向arr[2]\n    printf(\"第3次: %d\\n\", *p);    // 30\n    \n    return 0;\n}"
            },
            {
                id: 25,
                question: "以下哪个操作是非法的？",
                options: [
                    "`int *p = (int*)malloc(sizeof(int));`",
                    "`int *p; p = NULL;`",
                    "`int arr[5]; int *p = arr;`",
                    "`int *p; int x = *p;`"
                ],
                correctAnswer: 3,
                explanation: "选项D中，指针p未初始化就解引用，这是未定义行为，可能导致程序崩溃。其他选项都是合法的指针操作。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // 合法操作\n    int *p1 = (int*)malloc(sizeof(int));\n    if (p1) {\n        *p1 = 100;\n        free(p1);\n    }\n    \n    int *p2;\n    p2 = NULL;  // 合法\n    \n    int arr[5] = {1, 2, 3, 4, 5};\n    int *p3 = arr;  // 合法\n    \n    // 非法操作\n    // int *p4;\n    // int x = *p4;  // 危险！p4未初始化\n    \n    return 0;\n}"
            },
            {
                id: 26,
                question: "以下代码哪行会导致编译错误？\n\n<C>\nint x = 10, y = 20;\nconst int *p1 = &x;\nint * const p2 = &x;\n*p1 = 30;  /* A */\np1 = &y;  /* B */\n*p2 = 30;  /* C */\np2 = &y;  /* D */\n</C>",
                options: [
                    "`A`和`D`",
                    "`B`和`C`",
                    "`A`和`C`",
                    "`B`和`D`"
                ],
                correctAnswer: 0,
                explanation: "这是**const指针修饰位置**的经典陷阱！**理解口诀**：const在*左边修饰值（指向的内容），const在*右边修饰指针（地址本身）。`const int *p1`（const在*左）：**指向常量的指针**，不能通过p1修改值（A错误），但p1可指向其他地址（B正确）。`int * const p2`（const在*右）：**常量指针**，p2不能改变指向（D错误），但可修改指向的值（C正确）。**记忆技巧**：从右向左读，`int * const`=\"常量的指针到int\"。**易错点**：混淆两种const位置的含义。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 10, y = 20;\n    \n    /* 1. 指向常量的指针（const int *） */\n    const int *p1 = &x;\n    /* *p1 = 30;  错误！不能修改指向的值 */\n    p1 = &y;  /* 正确：可以改变指针 */\n    printf(\"p1现在指向y: %d\\n\", *p1);\n    \n    /* 2. 常量指针（int * const） */\n    int * const p2 = &x;\n    *p2 = 30;  /* 正确：可以修改指向的值 */\n    /* p2 = &y;  错误！不能改变指针 */\n    printf(\"x被修改为: %d\\n\", x);\n    \n    /* 3. 指向常量的常量指针（const int * const） */\n    const int * const p3 = &x;\n    /* *p3 = 40;  错误！ */\n    /* p3 = &y;   错误！ */\n    printf(\"p3只读: %d\\n\", *p3);\n    \n    /* 4. 理解const位置 */\n    /* const在*左边：修饰值 */\n    const int *p4;  /* 等价于 int const *p4 */\n    /* const在*右边：修饰指针 */\n    int * const p5 = &x;\n    \n    return 0;\n}"
            },
            {
                id: 27,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 10, y = 20;\nint *p = &x;\np = &y;\nprintf(\"%d\", *p);\n</C>",
                options: [
                    "`10`",
                    "`20`",
                    "`30`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "指针p先指向x，然后重新指向y。最后 `*p` 输出y的值20。指针变量可以改变指向。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 10, y = 20;\n    int *p = &x;\n    \n    printf(\"p指向x: *p = %d\\n\", *p);  // 10\n    \n    p = &y;  // p改为指向y\n    printf(\"p指向y: *p = %d\\n\", *p);  // 20\n    \n    *p = 30;  // 修改y的值\n    printf(\"修改后: y = %d\\n\", y);    // 30\n    \n    return 0;\n}"
            },
            {
                id: 28,
                question: "以下代码的输出结果是什么？\n\n<C>\nint a[5] = {1, 2, 3, 4, 5};\nint *p = a;\nprintf(\"%d %d %d\", *p, *(p+2), p[3]);\n</C>",
                options: [
                    "`1 2 3`",
                    "`1 3 4`",
                    "`0 2 3`",
                    "`1 3 5`"
                ],
                correctAnswer: 1,
                explanation: "这是**数组与指针等价性**的题目。`*p`即`a[0]=1`；`*(p+2)`即`a[2]=3`；`p[3]`即`*(p+3)`即`a[3]=4`。输出`1 3 4`。**关键规则**：1) `p[i]`完全等价于`*(p+i)`；2) 数组名a在表达式中退化为指向首元素的指针；3) `&a[i]`等价于`a+i`。**易错点**：误以为`p[3]`=5（第3个元素是下标2）。**记忆**：C语言数组下标从0开始，p[3]是第4个元素。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int a[5] = {1, 2, 3, 4, 5};\n    int *p = a;  /* p指向a[0] */\n    \n    /* 等价表达式演示 */\n    printf(\"a[0] = %d, *p = %d, p[0] = %d\\n\", a[0], *p, p[0]);\n    printf(\"a[2] = %d, *(p+2) = %d, p[2] = %d\\n\", a[2], *(p+2), p[2]);\n    printf(\"a[3] = %d, *(a+3) = %d, p[3] = %d\\n\", a[3], *(a+3), p[3]);\n    \n    /* 地址等价性 */\n    printf(\"\\n地址验证:\\n\");\n    printf(\"&a[0] = %p, a = %p, p = %p\\n\", \n           (void*)&a[0], (void*)a, (void*)p);\n    printf(\"&a[2] = %p, a+2 = %p, p+2 = %p\\n\", \n           (void*)&a[2], (void*)(a+2), (void*)(p+2));\n    \n    /* 下标计数 */\n    printf(\"\\n下标说明:\\n\");\n    for (int i = 0; i < 5; i++) {\n        printf(\"a[%d] = %d\\n\", i, a[i]);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 29,
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid set_to_zero(int *p) {\n    if (p != NULL) {\n        *p = 0;\n    }\n}\n\nint main() {\n    int x = 100;\n    set_to_zero(&x);\n    printf(\"%d\", x);\n    return 0;\n}\n</C>",
                options: [
                    "`100`",
                    "`0`",
                    "编译错误",
                    "未定义行为"
                ],
                correctAnswer: 1,
                explanation: "函数 `set_to_zero` 检查指针非空后，将指针指向的值设为0。通过指针修改了原变量x的值。",
                codeExample: "#include <stdio.h>\n\nvoid set_to_zero(int *p) {\n    if (p != NULL) {\n        printf(\"函数内修改前: *p = %d\\n\", *p);\n        *p = 0;\n        printf(\"函数内修改后: *p = %d\\n\", *p);\n    }\n}\n\nint main() {\n    int x = 100;\n    printf(\"调用前: x = %d\\n\", x);\n    set_to_zero(&x);\n    printf(\"调用后: x = %d\\n\", x);\n    \n    // NULL指针测试\n    set_to_zero(NULL);  // 安全，不会执行修改\n    \n    return 0;\n}"
            },
            {
                id: 30,
                question: "以下代码的输出结果是什么？\n\n<C>\nint a = 1, b = 2, c = 3;\nint *p = &a;\n*p = 10;\np = &b;\n*p = 20;\np = &c;\n*p = 30;\nprintf(\"%d %d %d\", a, b, c);\n</C>",
                options: [
                    "`1 2 3`",
                    "`10 2 3`",
                    "`10 20 3`",
                    "`10 20 30`"
                ],
                correctAnswer: 3,
                explanation: "指针p依次指向a、b、c，并通过解引用分别修改它们的值为10、20、30。所以最终输出 `10 20 30`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int a = 1, b = 2, c = 3;\n    int *p = &a;\n    \n    printf(\"初始: a=%d, b=%d, c=%d\\n\", a, b, c);\n    \n    *p = 10;\n    printf(\"修改a后: a=%d, b=%d, c=%d\\n\", a, b, c);\n    \n    p = &b;\n    *p = 20;\n    printf(\"修改b后: a=%d, b=%d, c=%d\\n\", a, b, c);\n    \n    p = &c;\n    *p = 30;\n    printf(\"修改c后: a=%d, b=%d, c=%d\\n\", a, b, c);\n    \n    return 0;\n}"
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