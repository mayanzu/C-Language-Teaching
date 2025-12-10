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
                question: "关于指针和地址，以下说法正确的是：",
                options: [
                    "指针就是地址，地址就是指针",
                    "指针是一个变量，用来存储地址",
                    "地址运算符 `&` 用于获取指针的值",
                    "所有类型的指针大小都不同"
                ],
                correctAnswer: 1,
                explanation: "指针是一种特殊的变量，用于存储内存地址。地址是内存中的位置，而指针是存储地址的变量。在大多数系统上，所有类型的指针大小相同（通常是4字节或8字节）。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int a = 10;\n    int *p;  // 定义指针变量\n    p = &a;  // 指针p存储变量a的地址\n    \n    printf(\"a的值: %d\\n\", a);\n    printf(\"a的地址: %p\\n\", (void*)&a);\n    printf(\"p的值(即a的地址): %p\\n\", (void*)p);\n    printf(\"指针大小: %lu字节\\n\", sizeof(p));\n    \n    return 0;\n}"
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
                question: "以下代码的输出结果是什么？\n\n<C>\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(&x, &y);\n    printf(\"%d %d\", x, y);\n    return 0;\n}\n</C>",
                options: [
                    "`5 10`",
                    "`10 5`",
                    "编译错误",
                    "未定义行为"
                ],
                correctAnswer: 1,
                explanation: "通过指针作为函数参数，可以修改原变量的值。`swap` 函数接收x和y的地址，通过解引用交换了它们的值。",
                codeExample: "#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;  // temp = 5\n    *a = *b;        // x = 10\n    *b = temp;      // y = 5\n}\n\nint main() {\n    int x = 5, y = 10;\n    printf(\"交换前: x=%d, y=%d\\n\", x, y);\n    swap(&x, &y);\n    printf(\"交换后: x=%d, y=%d\\n\", x, y);\n    return 0;\n}"
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
                question: "以下代码中，哪个是正确的指针初始化方式？",
                options: [
                    "`int *p = NULL;`",
                    "`int *p = 0;`",
                    "`int x = 10; int *p = &x;`",
                    "以上都正确"
                ],
                correctAnswer: 3,
                explanation: "这三种都是正确的初始化方式。`NULL` 和 `0` 都表示空指针，`&x` 让指针指向变量x。未初始化的指针是野指针，应避免使用。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 方法1: NULL指针\n    int *p1 = NULL;\n    \n    // 方法2: 0（等价于NULL）\n    int *p2 = 0;\n    \n    // 方法3: 指向变量\n    int x = 10;\n    int *p3 = &x;\n    \n    // 检查指针是否为NULL\n    if (p1 == NULL) {\n        printf(\"p1 是空指针\\n\");\n    }\n    \n    if (p3 != NULL) {\n        printf(\"p3 指向有效地址，值为: %d\\n\", *p3);\n    }\n    \n    return 0;\n}"
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
                question: "以下代码的输出结果是什么？\n\n<C>\nchar *str = \"Hello\";\nprintf(\"%c %c\", str[0], *str);\n</C>",
                options: [
                    "`H H`",
                    "`H e`",
                    "`e H`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "`str[0]` 和 `*str` 都访问字符串的第一个字符'H'。这两种写法是等价的。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    char *str = \"Hello\";\n    \n    printf(\"str[0] = %c\\n\", str[0]);  // H\n    printf(\"*str = %c\\n\", *str);      // H\n    printf(\"str[1] = %c\\n\", str[1]);  // e\n    printf(\"*(str+1) = %c\\n\", *(str+1));  // e\n    \n    return 0;\n}"
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
                question: "以下代码中存在什么问题？\n\n<C>\nint *func() {\n    int x = 100;\n    return &x;\n}\n\nint main() {\n    int *p = func();\n    printf(\"%d\", *p);\n    return 0;\n}\n</C>",
                options: [
                    "没有问题",
                    "返回了局部变量的地址，导致悬空指针",
                    "指针类型不匹配",
                    "printf使用错误"
                ],
                correctAnswer: 1,
                explanation: "函数返回局部变量x的地址，但x在函数返回后被销毁，导致悬空指针。应该返回动态分配的内存或static变量的地址。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\n// 错误示例\n// int *wrong() {\n//     int x = 100;\n//     return &x;  // 危险！x被销毁\n// }\n\n// 正确方法1：使用static\nint *method1() {\n    static int x = 100;\n    return &x;  // static变量不会被销毁\n}\n\n// 正确方法2：动态分配\nint *method2() {\n    int *p = (int*)malloc(sizeof(int));\n    *p = 100;\n    return p;  // 返回堆内存地址\n}\n\nint main() {\n    int *p1 = method1();\n    printf(\"method1: %d\\n\", *p1);\n    \n    int *p2 = method2();\n    printf(\"method2: %d\\n\", *p2);\n    free(p2);  // 记得释放\n    \n    return 0;\n}"
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
                question: "以下代码实现的功能是：\n\n<C>\nvoid reverse(int *arr, int size) {\n    int *left = arr;\n    int *right = arr + size - 1;\n    while (left < right) {\n        int temp = *left;\n        *left = *right;\n        *right = temp;\n        left++;\n        right--;\n    }\n}\n</C>",
                options: [
                    "对数组排序",
                    "反转数组元素顺序",
                    "查找数组最大值",
                    "复制数组"
                ],
                correctAnswer: 1,
                explanation: "使用双指针法反转数组。左指针从头开始，右指针从尾开始，交换元素后向中间移动，直到两指针相遇。",
                codeExample: "#include <stdio.h>\n\nvoid reverse(int *arr, int size) {\n    int *left = arr;\n    int *right = arr + size - 1;\n    while (left < right) {\n        int temp = *left;\n        *left = *right;\n        *right = temp;\n        left++;\n        right--;\n    }\n}\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int size = 5;\n    \n    printf(\"原数组: \");\n    for (int i = 0; i < size; i++) {\n        printf(\"%d \", arr[i]);\n    }\n    \n    reverse(arr, size);\n    \n    printf(\"\\n反转后: \");\n    for (int i = 0; i < size; i++) {\n        printf(\"%d \", arr[i]);\n    }\n    \n    return 0;\n}"
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
                question: "关于指针的 `++` 和 `--` 运算，以下说法正确的是：",
                options: [
                    "指针自增移动一个字节",
                    "指针自增移动一个数据类型的大小",
                    "所有指针自增都移动4字节",
                    "指针不能进行自增运算"
                ],
                correctAnswer: 1,
                explanation: "指针自增会根据指向的数据类型自动调整移动距离。`int*` 自增移动4字节，`char*` 自增移动1字节，`double*` 自增移动8字节。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int arr_int[] = {10, 20, 30};\n    char arr_char[] = {'a', 'b', 'c'};\n    double arr_double[] = {1.1, 2.2, 3.3};\n    \n    int *p_int = arr_int;\n    char *p_char = arr_char;\n    double *p_double = arr_double;\n    \n    printf(\"int指针: %p\\n\", (void*)p_int);\n    p_int++;\n    printf(\"自增后: %p (移动%lu字节)\\n\", (void*)p_int, sizeof(int));\n    \n    printf(\"\\nchar指针: %p\\n\", (void*)p_char);\n    p_char++;\n    printf(\"自增后: %p (移动%lu字节)\\n\", (void*)p_char, sizeof(char));\n    \n    return 0;\n}"
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