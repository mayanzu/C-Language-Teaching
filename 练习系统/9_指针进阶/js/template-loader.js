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
    "question": "以下代码的输出结果是什么？\n\n<C>\nint *func() {\n    int a = 10;\n    return &a;\n}\n\nint main() {\n    int *p = func();\n    printf(\"%d\", *p);\n    return 0;\n}\n</C>",
    "options": ["`10`", "未定义行为", "`0`", "编译错误"],
    "correctAnswer": 1,
    "explanation": "这是「返回局部变量地址」的致命陷阱！`func`返回局部变量`a`的地址，但`a`在函数返回后栈帧被销毁，该地址变成「悬空指针」。解引用悬空指针是「未定义行为」。「易错点」：1) 局部变量存储在栈上，函数返回后内存被回收；2) 可能偶然输出10，但这是不可靠的；3) 正确做法是返回`malloc`分配的内存或使用`static`变量。",
    "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\n/* 错误：返回局部变量地址 */\n/* int *func_wrong() { int a = 10; return &a; }  悬空指针 */\n\n/* 正确方法1：动态分配 */\nint *func_malloc() {\n    int *p = malloc(sizeof(int));\n    *p = 10;\n    return p;  /* 调用者负责free */\n}\n\n/* 正确方法2：static变量 */\nint *func_static() {\n    static int a = 10;  /* 存储在静态区，不随函数返回销毁 */\n    return &a;\n}\n\nint main() {\n    int *p1 = func_malloc();\n    printf(\"%d\\n\", *p1);  /* 10 */\n    free(p1);\n    \n    int *p2 = func_static();\n    printf(\"%d\\n\", *p2);  /* 10 */\n    return 0;\n}"
},
            {
    "id": 2,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint arr[3][4] = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};\nint **p = (int**)arr;\nprintf(\"%d\", p[1][2]);\n</C>",
    "options": ["`7`", "未定义行为", "`3`", "编译错误"],
    "correctAnswer": 1,
    "explanation": "这是「二级指针与二维数组混淆」的陷阱！`int **p`和`int (*)[4]`是完全不同的类型。`int **p`期望p指向一个「指针数组」，但二维数组`arr`在内存中是连续的，不是指针数组。强制转换后`p[1]`会把arr[0][1]（值为2）当作指针地址，解引用导致「未定义行为」。「易错点」：1) `int **`不能接收`int[3][4]`；2) 正确的类型是`int (*p)[4]`；3) 二维数组≠指针的指针。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int arr[3][4] = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};\n    \n    /* 错误：int**不能接收二维数组 */\n    /* int **p = (int**)arr;  类型不匹配！ */\n    \n    /* 正确：使用数组指针 */\n    int (*p)[4] = arr;\n    printf(\"p[1][2] = %d\\n\", p[1][2]);  /* 7 */\n    \n    /* 内存布局：连续12个int */\n    /* arr[0][0]=1, arr[0][1]=2, ..., arr[2][3]=12 */\n    return 0;\n}"
},
            {
                "id": 3,
                "question": "关于函数指针，以下定义正确的是：",
                "options": ["`int *func(int a, int b);` 是函数指针", "`int (*func)(int a, int b);` 是函数指针", "`int *(*func)(int a, int b);` 是函数指针", "以上都正确"],
                "correctAnswer": 1,
                "explanation": "`int (*func)(int, int)` 是函数指针，指向返回int、接收两个int参数的函数。`int *func(int, int)` 是函数声明，返回int指针。括号很重要。",
                "codeExample": "#include <stdio.h>\n\nint add(int a, int b) { return a + b; }\n\nint multiply(int a, int b) { return a * b; }\n\nint main() {\n    int (*func)(int, int);\n    \n    func = add;\n    printf(\"add: %d\\n\", func(3, 4));  // 7\n    \n    func = multiply;\n    printf(\"multiply: %d\\n\", func(3, 4));  // 12\n    \n    return 0;\n}"
            },
            {
    "id": 4,
    "question": "以下代码的输出结果是什么？\n\n<C>\nchar *str[] = {\"Hello\", \"World\", \"C\"};\nstr[1][0] = 'G';\nprintf(\"%s\", str[1]);\n</C>",
    "options": ["`Gorld`", "未定义行为（可能崩溃）", "`World`", "编译错误"],
    "correctAnswer": 1,
    "explanation": "这是「指针数组中修改字符串常量」的陷阱！`str`是指针数组，每个元素指向字符串常量。字符串常量存储在只读区，`str[1][0]='G'`尝试修改只读内存，这是「未定义行为」。「易错点」：1) `char *str[]`中的字符串是常量，不可修改；2) `char str[][10]`中的字符串是数组副本，可以修改；3) 修改字符串常量通常导致段错误。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    /* 危险：指针数组指向常量区 */\n    char *str[] = {\"Hello\", \"World\", \"C\"};\n    /* str[1][0] = 'G';  未定义行为！ */\n    \n    /* 安全：二维数组，字符串在栈上 */\n    char arr[][10] = {\"Hello\", \"World\", \"C\"};\n    arr[1][0] = 'G';\n    printf(\"%s\\n\", arr[1]);  /* Gorld */\n    \n    /* 区别：\n     * char *s[] = {...}  -> 指向常量区，不可修改\n     * char s[][N] = {...} -> 栈上副本，可修改\n     */\n    return 0;\n}"
},
            {
                "id": 5,
                "question": "以下代码中，哪个是正确的函数指针数组定义？",
                "options": ["`int *func[5](int);`", "`int (*func[5])(int);`", "`int *(func[5])(int);`", "`int func[5](*int);`"],
                "correctAnswer": 1,
                "explanation": "`int (*func[5])(int)` 定义了一个包含5个函数指针的数组，每个函数接收int参数，返回int。括号顺序很重要。",
                "codeExample": "#include <stdio.h>\n\nint add_one(int x) { return x + 1; }\nint mul_two(int x) { return x * 2; }\nint square(int x) { return x * x; }\n\nint main() {\n    int (*func[3])(int) = {add_one, mul_two, square};\n    \n    int num = 5;\n    for (int i = 0; i < 3; i++) {\n        printf(\"func[%d](%d) = %d\\n\", i, num, func[i](num));\n    }\n    \n    return 0;\n}"
            },
            {
    "id": 6,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint *func() {\n    static int x = 0;\n    x++;\n    return &x;\n}\n\nint main() {\n    int *a = func();\n    int *b = func();\n    printf(\"%d %d\", *a, *b);\n    return 0;\n}\n</C>",
    "options": ["`1 2`", "`2 2`", "`1 1`", "未定义行为"],
    "correctAnswer": 1,
    "explanation": "这是「返回static变量指针的别名陷阱」！`static int x`只初始化一次，两次调用`func`都返回同一个`x`的地址。第二次调用使x从1变为2，由于`a`和`b`指向同一个变量，`*a`和`*b`都是2。「易错点」：1) a和b是「别名」（指向同一内存）；2) 任何通过a或b的修改都会影响另一个；3) 这是static变量指针的固有陷阱。",
    "codeExample": "#include <stdio.h>\n\nint *func() {\n    static int x = 0;\n    x++;\n    return &x;  /* 返回同一变量的地址 */\n}\n\nint main() {\n    int *a = func();  /* x=1, a指向x */\n    int *b = func();  /* x=2, b也指向x */\n    printf(\"*a=%d, *b=%d\\n\", *a, *b);  /* 2, 2 */\n    \n    /* a和b指向同一地址 */\n    printf(\"a=%p, b=%p\\n\", (void*)a, (void*)b);  /* 相同 */\n    \n    *a = 100;\n    printf(\"*b=%d\\n\", *b);  /* 100，受影响 */\n    return 0;\n}"
},
            {
                "id": 7,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint *arr[3];\nint a = 10, b = 20, c = 30;\narr[0] = &a; arr[1] = &b; arr[2] = &c;\nprintf(\"%d\", *arr[1]);\n</C>",
                "options": ["`10`", "`20`", "`30`", "编译错误"],
                "correctAnswer": 1,
                "explanation": "`arr` 是指针数组，`arr[1]` 存储b的地址，`*arr[1]` 解引用得到b的值20。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int *arr[3];\n    int a = 10, b = 20, c = 30;\n    \n    arr[0] = &a;\n    arr[1] = &b;\n    arr[2] = &c;\n    \n    printf(\"*arr[0] = %d\\n\", *arr[0]);  // 10\n    printf(\"*arr[1] = %d\\n\", *arr[1]);  // 20\n    printf(\"*arr[2] = %d\\n\", *arr[2]);  // 30\n    \n    return 0;\n}"
            },
            {
    "id": 8,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint add(int a, int b) { return a + b; }\nint (*func)(int) = (int(*)(int))add;\nprintf(\"%d\", func(3, 4));\n</C>",
    "options": ["`7`", "未定义行为", "`3`", "编译错误"],
    "correctAnswer": 1,
    "explanation": "这是「函数指针类型不匹配」的陷阱！`add`的类型是`int(int,int)`，但`func`被强制转换为`int(*)(int)`（只接受1个参数）。通过错误类型的函数指针调用函数是「未定义行为」。「易错点」：1) 函数指针类型必须与函数签名完全匹配；2) 强制类型转换只能绕过编译器检查，不能改变实际行为；3) 调用时参数传递机制不匹配，可能导致栈损坏。",
    "codeExample": "#include <stdio.h>\n\nint add(int a, int b) { return a + b; }\n\nint main() {\n    /* 正确：类型匹配 */\n    int (*f1)(int, int) = add;\n    printf(\"%d\\n\", f1(3, 4));  /* 7 */\n    \n    /* 错误：类型不匹配，强制转换也无法修复 */\n    /* int (*f2)(int) = (int(*)(int))add; */\n    /* f2(3, 4);  未定义行为！ */\n    \n    return 0;\n}"
},
            {
                "id": 9,
                "question": "关于函数返回指针，以下说法正确的是：",
                "options": ["函数可以返回任何指针", "函数不能返回局部变量的地址", "函数返回的指针不需要检查NULL", "函数返回指针总是安全的"],
                "correctAnswer": 1,
                "explanation": "函数不应返回局部变量的地址，因为局部变量在函数结束后被销毁。应返回静态变量、全局变量或动态分配的内存地址。",
                "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\n// 正确：返回静态变量地址\nint *method1() {\n    static int x = 10;\n    return &x;\n}\n\n// 正确：返回动态分配的内存\nint *method2() {\n    int *p = (int*)malloc(sizeof(int));\n    if (p != NULL) *p = 20;\n    return p;\n}\n\nint main() {\n    int *p1 = method1();\n    printf(\"method1: %d\\n\", *p1);\n    \n    int *p2 = method2();\n    if (p2 != NULL) {\n        printf(\"method2: %d\\n\", *p2);\n        free(p2);\n    }\n    \n    return 0;\n}"
            },
            {
    "id": 10,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint arr[3][4] = {0};\nint **p = (int**)arr;\nprintf(\"%zu %zu\", sizeof(arr), sizeof(p));\n</C>",
    "options": ["`48 8`", "`12 8`", "`48 48`", "编译错误"],
    "correctAnswer": 0,
    "explanation": "这是「二维数组与二级指针sizeof差异」的陷阱！`sizeof(arr)`=3×4×4=48字节（整个二维数组）。`sizeof(p)`=8字节（64位指针大小）。虽然`p=(int**)arr`做了强制转换，但sizeof只看声明类型。「易错点」：1) sizeof在编译时确定，不受运行时赋值影响；2) `int[3][4]`和`int**`是完全不同的内存布局；3) 强制转换不改变变量类型。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int arr[3][4] = {0};\n    int **p = (int**)arr;  /* 危险的强制转换 */\n    \n    printf(\"sizeof(arr) = %zu\\n\", sizeof(arr));  /* 48 */\n    printf(\"sizeof(p) = %zu\\n\", sizeof(p));    /* 8 */\n    \n    /* 正确的类型 */\n    int (*q)[4] = arr;\n    printf(\"sizeof(q) = %zu\\n\", sizeof(q));    /* 8(指针) */\n    printf(\"sizeof(*q) = %zu\\n\", sizeof(*q));  /* 16(一行) */\n    return 0;\n}"
},
            {
                "id": 11,
                "question": "关于 `void*` 指针，以下说法正确的是：",
                "options": ["`void*` 可以直接解引用", "`void*` 可以指向任何类型的数据", "`void*` 不能进行指针运算", "B和C都正确"],
                "correctAnswer": 3,
                "explanation": "`void*` 是通用指针，可以指向任何类型，但不能直接解引用或进行指针运算。使用前需要转换为具体类型。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 10;\n    double y = 3.14;\n    void *p;\n    \n    p = &x;\n    printf(\"int: %d\\n\", *(int*)p);\n    \n    p = &y;\n    printf(\"double: %.2f\\n\", *(double*)p);\n    \n    // 错误：不能直接解引用或运算\n    // printf(\"%d\", *p);  // 错误\n    // p++;  // 错误\n    \n    return 0;\n}"
            },
            {
    "id": 12,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint arr[] = {10, 20, 30, 40, 50};\nint *p = arr + 3;\nprintf(\"%d\", p[-2]);\n</C>",
    "options": ["`20`", "`30`", "未定义行为", "编译错误"],
    "correctAnswer": 0,
    "explanation": "这是「负数下标」的陷阱！`p[-2]`等价于`*(p-2)`。p指向arr[3]，`p-2`指向arr[1]，值为20。负数下标在C中是合法的，只要不越界。「易错点」：1) `p[-2]`完全合法，等价于`*(p-2)`；2) 但如果p指向数组首元素，`p[-1]`就是越界访问（UB）；3) 负数下标容易导致越界，需格外小心。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int *p = arr + 3;\n    \n    printf(\"p[-2] = %d\\n\", p[-2]);  /* 20 */\n    printf(\"p[-1] = %d\\n\", p[-1]);  /* 30 */\n    printf(\"p[0] = %d\\n\", p[0]);   /* 40 */\n    printf(\"p[1] = %d\\n\", p[1]);   /* 50 */\n    \n    /* 等价写法 */\n    printf(\"*(p-2) = %d\\n\", *(p-2));  /* 20 */\n    return 0;\n}"
},
            {
                "id": 13,
                "question": "以下代码的输出结果是什么？\n\n<C>\ntypedef int (*FuncPtr)(int, int);\n\nint add(int a, int b) { return a + b; }\nint sub(int a, int b) { return a - b; }\n\nint main() {\n    FuncPtr f = add;\n    printf(\"%d\", f(10, 5));\n    return 0;\n}\n</C>",
                "options": ["`15`", "`5`", "`50`", "编译错误"],
                "correctAnswer": 0,
                "explanation": "`FuncPtr` 是函数指针类型别名。`f` 指向 `add` 函数，`f(10, 5)` 调用add返回15。",
                "codeExample": "#include <stdio.h>\n\ntypedef int (*FuncPtr)(int, int);\n\nint add(int a, int b) { return a + b; }\nint sub(int a, int b) { return a - b; }\n\nint main() {\n    FuncPtr f;\n    \n    f = add;\n    printf(\"add(10, 5) = %d\\n\", f(10, 5));\n    \n    f = sub;\n    printf(\"sub(10, 5) = %d\\n\", f(10, 5));\n    \n    return 0;\n}"
            },
            {
    "id": 14,
    "question": "以下代码的输出结果是什么？\n\n<C>\nvoid get(int **p) {\n    int x = 42;\n    *p = &x;\n}\n\nint main() {\n    int *ptr = NULL;\n    get(&ptr);\n    printf(\"%d\", *ptr);\n    return 0;\n}\n</C>",
    "options": ["`42`", "未定义行为", "`0`", "编译错误"],
    "correctAnswer": 1,
    "explanation": "这是「二级指针指向局部变量」的陷阱！虽然正确使用了二级指针来修改外部指针ptr，但`*p=&x`让ptr指向了`get`函数的局部变量x。函数返回后x被销毁，ptr变成「悬空指针」，解引用是「未定义行为」。「易错点」：1) 二级指针用法正确，但指向的对象生命周期不对；2) 局部变量在函数返回后不存在；3) 应返回`malloc`分配的内存或`static`变量的地址。",
    "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\n/* 错误：指向局部变量 */\n/* void get_wrong(int **p) { int x = 42; *p = &x; }  悬空指针 */\n\n/* 正确方法1：动态分配 */\nvoid get_malloc(int **p) {\n    *p = malloc(sizeof(int));\n    **p = 42;\n}\n\n/* 正确方法2：static变量 */\nvoid get_static(int **p) {\n    static int x = 42;\n    *p = &x;\n}\n\nint main() {\n    int *ptr = NULL;\n    get_malloc(&ptr);\n    printf(\"%d\\n\", *ptr);  /* 42 */\n    free(ptr);\n    return 0;\n}"
},
            {
                "id": 15,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint arr[] = {10, 20, 30, 40, 50};\nint *p = arr + 2;\nprintf(\"%d %d\", *p, *(p - 1));\n</C>",
                "options": ["`30 20`", "`20 10`", "`30 40`", "`20 30`"],
                "correctAnswer": 0,
                "explanation": "`arr + 2`指向arr[2]（值为30），`p - 1`指向arr[1]（值为20）。指针加减运算以元素大小为单位。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int *p = arr + 2;\n    \n    printf(\"*p = %d\\n\", *p);        /* 30 */\n    printf(\"*(p-1) = %d\\n\", *(p-1));  /* 20 */\n    printf(\"*(p+1) = %d\\n\", *(p+1));  /* 40 */\n    \n    return 0;\n}"
            },
            {
    "id": 16,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint arr[] = {10, 20, 30};\nint *p = arr;\nchar *cp = (char*)p;\nprintf(\"%td %td\", p+1 - p, cp+1 - cp);\n</C>",
    "options": ["`1 1`", "`1 4`", "`4 1`", "`4 4`"],
    "correctAnswer": 1,
    "explanation": "这是「指针类型决定步长」的陷阱！`p+1-p`中p是`int*`，步长为4字节，差值为1（1个int）。`cp+1-cp`中cp是`char*`，步长为1字节，差值为1（1个char）。但注意：`p+1-p`和`cp+1-cp`的结果类型都是`ptrdiff_t`，值都是1，但含义不同。「易错点」：1) 指针加减以「指向类型的大小」为单位；2) `int*`步长4字节，`char*`步长1字节；3) 同一地址用不同类型指针运算，结果不同。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int arr[] = {10, 20, 30};\n    int *p = arr;\n    char *cp = (char*)p;\n    \n    printf(\"p+1 = %p, p = %p\\n\", (void*)(p+1), (void*)p);\n    printf(\"cp+1 = %p, cp = %p\\n\", (void*)(cp+1), (void*)cp);\n    \n    /* int*步长4字节 */\n    printf(\"(char*)(p+1) - (char*)p = %td字节\\n\", \n           (char*)(p+1) - (char*)p);  /* 4 */\n    \n    /* char*步长1字节 */\n    printf(\"cp+1 - cp = %td字节\\n\", cp+1 - cp);  /* 1 */\n    return 0;\n}"
},
            {
                "id": 17,
                "question": "以下关于 `const` 与指针的说法，正确的是？",
                "options": ["`const int *p` 表示p本身是常量", "`int * const p` 表示p指向的值是常量", "`const int *p` 表示p指向的值是常量", "`const int * const p` 与 `const int *p` 相同"],
                "correctAnswer": 2,
                "explanation": "`const int *p`（或`int const *p`）：p指向的值不能通过p修改，但p本身可以改变指向。`int * const p`：p本身是常量，不能改变指向，但指向的值可以修改。`const int * const p`：两者都是常量。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 10, b = 20;\n    \n    /* 指向常量的指针 */\n    const int *p1 = &a;\n    /* *p1 = 30; */  /* 错误：不能通过p1修改值 */\n    p1 = &b;         /* 正确：可以改变指向 */\n    \n    /* 常量指针 */\n    int * const p2 = &a;\n    *p2 = 30;        /* 正确：可以修改指向的值 */\n    /* p2 = &b; */   /* 错误：不能改变指向 */\n    \n    /* 都不可变 */\n    const int * const p3 = &a;\n    /* *p3 = 40; */  /* 错误 */\n    /* p3 = &b; */   /* 错误 */\n    \n    printf(\"a=%d, b=%d\\n\", a, b);\n    return 0;\n}"
            },
            {
                "id": 18,
                "question": "以下代码的输出结果是什么？\n\n<C>\nchar str[] = \"Hello\";\nchar *p = str;\np[0] = 'h';\nprintf(\"%s\", str);\n</C>",
                "options": ["`Hello`", "`hello`", "编译错误", "运行时错误"],
                "correctAnswer": 1,
                "explanation": "`p`指向字符数组`str`的首地址，通过`p[0]`可以修改数组内容。因为`str`是数组（非字符串常量），所以修改是合法的。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    char str[] = \"Hello\";  /* 字符数组，可修改 */\n    char *p = str;\n    p[0] = 'h';\n    printf(\"%s\\n\", str);  /* hello */\n    \n    /* 注意区别：字符串常量不可修改 */\n    /* char *q = \"World\"; */\n    /* q[0] = 'w'; */  /* 未定义行为！ */\n    \n    return 0;\n}"
            },
            {
                "id": 19,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint arr[5] = {1, 2, 3, 4, 5};\nint *p = arr;\nprintf(\"%d\", *(p + 3));\nprintf(\"%d\", p[3]);\n</C>",
                "options": ["`44`", "`34`", "`43`", "`33`"],
                "correctAnswer": 0,
                "explanation": "`*(p + 3)`和`p[3]`完全等价，都访问arr[3]，值为4。所以输出两个4，即\"44\"。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int arr[5] = {1, 2, 3, 4, 5};\n    int *p = arr;\n    \n    /* 以下写法等价 */\n    printf(\"*(p+3) = %d\\n\", *(p + 3));  /* 4 */\n    printf(\"p[3] = %d\\n\", p[3]);        /* 4 */\n    printf(\"arr[3] = %d\\n\", arr[3]);    /* 4 */\n    printf(\"3[arr] = %d\\n\", 3[arr]);    /* 4，虽然奇怪但合法 */\n    \n    return 0;\n}"
            },
            {
                "id": 20,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint *create(int val) {\n    int *p = (int *)malloc(sizeof(int));\n    if (p) *p = val;\n    return p;\n}\n\nint main() {\n    int *q = create(42);\n    if (q) {\n        printf(\"%d\", *q);\n        free(q);\n    }\n    return 0;\n}\n</C>",
                "options": ["`42`", "编译错误", "段错误", "未定义行为"],
                "correctAnswer": 0,
                "explanation": "函数返回动态分配的内存地址是安全的，因为堆内存不会在函数返回后自动释放。调用者需要负责`free`释放内存。",
                "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\nint *create(int val) {\n    int *p = (int *)malloc(sizeof(int));\n    if (p) *p = val;\n    return p;\n}\n\nint main() {\n    int *q = create(42);\n    if (q) {\n        printf(\"*q = %d\\n\", *q);  /* 42 */\n        free(q);  /* 调用者负责释放 */\n    }\n    return 0;\n}"
            },
            {
                "id": 21,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a[5] = {10, 20, 30, 40, 50};\nint *p = (int *)(&a + 1) - 1;\nprintf(\"%d\", *p);\n</C>",
                "options": ["`10`", "`50`", "`40`", "未定义行为"],
                "correctAnswer": 1,
                "explanation": "`&a`的类型是`int (*)[5]`（指向整个数组的指针），`&a + 1`跳过整个数组，指向数组之后的位置。`(int *)(&a + 1)`将其转为`int*`，再减1回到数组最后一个元素。`*p` = 50。这是「数组指针与指针运算」的高级陷阱。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[5] = {10, 20, 30, 40, 50};\n    \n    /* &a 是指向整个数组的指针 */\n    printf(\"a = %p\\n\", (void*)a);        /* 数组首元素地址 */\n    printf(\"&a = %p\\n\", (void*)&a);      /* 数组地址（值相同，类型不同） */\n    printf(\"a+1 = %p\\n\", (void*)(a+1));  /* 下一个元素 */\n    printf(\"&a+1 = %p\\n\", (void*)(&a+1));/* 跳过整个数组 */\n    \n    int *p = (int *)(&a + 1) - 1;\n    printf(\"*p = %d\\n\", *p);  /* 50 */\n    \n    return 0;\n}"
            },
            {
                "id": 22,
                "question": "以下哪个声明是指向数组的指针（数组指针）？",
                "options": ["`int *p[5];`", "`int (*p)[5];`", "`int *(p[5]);`", "`int *p();`"],
                "correctAnswer": 1,
                "explanation": "`int (*p)[5]`是数组指针，p指向一个含5个int的数组。`int *p[5]`是指针数组，p是含5个int*的数组。括号决定了结合顺序。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int arr[3][5] = {{1,2,3,4,5},{6,7,8,9,10},{11,12,13,14,15}};\n    \n    /* 数组指针 */\n    int (*p)[5] = arr;  /* p指向arr[0]这一行 */\n    printf(\"**p = %d\\n\", **p);           /* 1 */\n    printf(\"*(*(p+1)+2) = %d\\n\", *(*(p+1)+2));  /* 8 */\n    \n    /* 指针数组 */\n    int a=1, b=2, c=3, d=4, e=5;\n    int *q[5] = {&a, &b, &c, &d, &e};\n    printf(\"*q[2] = %d\\n\", *q[2]);  /* 3 */\n    \n    return 0;\n}"
            },
            {
                "id": 23,
                "question": "以下代码的输出结果是什么？\n\n<C>\nchar *p = \"Hello\";\nchar *q = \"Hello\";\nif (p == q)\n    printf(\"Same\");\nelse\n    printf(\"Diff\");\n</C>",
                "options": ["`Same`", "`Diff`", "编译错误", "未定义行为"],
                "correctAnswer": 0,
                "explanation": "字符串字面量可能被编译器合并（字符串常量池），指向相同内容的指针可能指向同一地址。但这不是C标准保证的，取决于编译器实现。某些编译器可能输出`Diff`。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    char *p = \"Hello\";\n    char *q = \"Hello\";\n    \n    /* 比较地址（编译器可能合并字符串常量） */\n    if (p == q)\n        printf(\"地址相同（编译器合并了字符串常量）\\n\");\n    else\n        printf(\"地址不同\\n\");\n    \n    /* 比较内容（应该用strcmp） */\n    if (strcmp(p, q) == 0)\n        printf(\"内容相同\\n\");\n    \n    /* 注意：字符串常量不可修改 */\n    /* p[0] = 'h'; */  /* 未定义行为！ */\n    \n    return 0;\n}"
            },
            {
                "id": 24,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 10;\nint *p = &a;\nprintf(\"%p %p\", (void*)p, (void*)(&a));\n</C>",
                "options": ["两个地址相同", "两个地址不同", "编译错误", "输出不确定"],
                "correctAnswer": 0,
                "explanation": "`p`存储的是`a`的地址，`&a`也是`a`的地址，两者相同。`%p`用于输出指针地址。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 10;\n    int *p = &a;\n    \n    printf(\"p的值(a的地址): %p\\n\", (void*)p);\n    printf(\"&a的值: %p\\n\", (void*)&a);\n    printf(\"p == &a: %s\\n\", p == &a ? \"是\" : \"否\");\n    \n    printf(\"p自己的地址: %p\\n\", (void*)&p);\n    \n    return 0;\n}"
            },
            {
                "id": 25,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint arr[] = {1, 2, 3};\nint *p = arr;\nprintf(\"%d %d\", *++p, *p);\n</C>",
                "options": ["`1 2`", "`2 2`", "`2 1`", "未定义行为（求值顺序未指定）"],
                "correctAnswer": 3,
                "explanation": "函数参数的求值顺序在C标准中是未指定的。`*++p`先自增p再解引用，`*p`解引用当前p。但两个参数哪个先求值取决于编译器，所以结果是未指定的。应避免在表达式中对同一变量同时修改和读取。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3};\n    int *p = arr;\n    \n    /* 危险！参数求值顺序未指定 */\n    /* printf(\"%d %d\", *++p, *p);  */\n    \n    /* 安全写法：分开操作 */\n    p++;\n    printf(\"%d\\n\", *p);  /* 2 */\n    printf(\"%d\\n\", *p);  /* 2 */\n    \n    return 0;\n}"
            },
            {
                "id": 26,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 100;\nint *p = &x;\nprintf(\"%lu\", sizeof(p));\n</C>",
                "options": ["`4`", "`8`", "取决于平台（32位4，64位8）", "`100`"],
                "correctAnswer": 2,
                "explanation": "指针的大小取决于平台的地址总线宽度。32位系统上指针占4字节，64位系统上占8字节。`sizeof(p)`返回的是指针本身的大小，不是它指向的数据的大小。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 100;\n    int *p = &x;\n    char *q = \"hello\";\n    double *r = NULL;\n    \n    /* 所有指针大小相同（同一平台） */\n    printf(\"sizeof(int*) = %lu\\n\", sizeof(p));\n    printf(\"sizeof(char*) = %lu\\n\", sizeof(q));\n    printf(\"sizeof(double*) = %lu\\n\", sizeof(r));\n    \n    /* 指针大小与指向类型无关 */\n    /* 32位系统: 全部4字节 */\n    /* 64位系统: 全部8字节 */\n    \n    return 0;\n}"
            },
            {
                "id": 27,
                "question": "以下代码的输出结果是什么？\n\n<C>\nvoid modify(int **pp) {\n    int y = 99;\n    *pp = &y;\n}\n\nint main() {\n    int x = 10;\n    int *p = &x;\n    modify(&p);\n    printf(\"%d\", *p);\n    return 0;\n}\n</C>",
                "options": ["`10`", "`99`", "未定义行为（悬空指针）", "编译错误"],
                "correctAnswer": 2,
                "explanation": "`modify`函数将`p`指向了局部变量`y`。函数返回后`y`已被销毁，`p`成为悬空指针，解引用是未定义行为。这是「二级指针与局部变量」的陷阱。",
                "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\n/* 错误：指向局部变量 */\nvoid modify_wrong(int **pp) {\n    int y = 99;\n    *pp = &y;  /* 函数返回后y被销毁 */\n}\n\n/* 正确：使用动态分配 */\nvoid modify_correct(int **pp) {\n    int *new_p = (int*)malloc(sizeof(int));\n    if (new_p) {\n        *new_p = 99;\n        *pp = new_p;\n    }\n}\n\nint main() {\n    int *p = NULL;\n    modify_correct(&p);\n    if (p) {\n        printf(\"*p = %d\\n\", *p);  /* 99 */\n        free(p);\n    }\n    return 0;\n}"
            },
            {
                "id": 28,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint arr[3][2] = {{1,2},{3,4},{5,6}};\nprintf(\"%d\", *(*(arr+1)));\n</C>",
                "options": ["`1`", "`3`", "`2`", "`4`"],
                "correctAnswer": 1,
                "explanation": "二维数组`arr`可以看作「数组的数组」。`arr+1`指向第二行，`*(arr+1)`得到第二行首元素地址，`*(*(arr+1))`得到第二行第一个元素的值3。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int arr[3][2] = {{1,2},{3,4},{5,6}};\n    \n    printf(\"arr[0][0] = %d\\n\", *(*(arr+0)+0));  /* 1 */\n    printf(\"arr[1][0] = %d\\n\", *(*(arr+1)+0));  /* 3 */\n    printf(\"arr[1][1] = %d\\n\", *(*(arr+1)+1));  /* 4 */\n    printf(\"arr[2][1] = %d\\n\", *(*(arr+2)+1));  /* 6 */\n    \n    return 0;\n}"
            },
            {
                "id": 29,
                "question": "以下关于NULL指针的说法，正确的是？",
                "options": ["NULL指针和未初始化指针相同", "解引用NULL指针会返回0", "NULL指针可以安全地用于比较和赋值", "NULL就是0，没有区别"],
                "correctAnswer": 2,
                "explanation": "NULL指针可以安全地用于比较和赋值操作。未初始化指针包含垃圾值，与NULL不同。解引用NULL指针是未定义行为（通常导致段错误）。NULL在C中定义为`((void*)0)`或`0`，但语义上是指「不指向任何对象」。",
                "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *p = NULL;  /* NULL指针 */\n    int *q;         /* 未初始化指针（危险！） */\n    \n    /* 安全的比较和赋值 */\n    if (p == NULL) {\n        printf(\"p是NULL\\n\");\n    }\n    \n    p = (int*)malloc(sizeof(int));\n    if (p != NULL) {\n        *p = 42;\n        printf(\"*p = %d\\n\", *p);\n        free(p);\n    }\n    \n    /* 危险：解引用NULL指针 */\n    /* int *r = NULL; */\n    /* printf(\"%d\", *r); */  /* 段错误！ */\n    \n    return 0;\n}"
            },
            {
                "id": 30,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a[] = {10, 20, 30};\nint *p = a;\nint *q = &a[2];\nprintf(\"%ld\", q - p);\n</C>",
                "options": ["`8`（字节差）", "`2`（元素数）", "`3`", "编译错误"],
                "correctAnswer": 1,
                "explanation": "指针相减的结果是元素个数差。`q`指向a[2]，`p`指向a[0]，两者相距2个元素。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[] = {10, 20, 30};\n    int *p = a;       /* 指向a[0] */\n    int *q = &a[2];  /* 指向a[2] */\n    \n    printf(\"q - p = %ld个元素\\n\", q - p);  /* 2 */\n    printf(\"(char*)q - (char*)p = %ld字节\\n\", (char*)q - (char*)p);  /* 8 */\n    \n    /* 应用：计算元素索引 */\n    int index = q - a;  /* a[2]的索引 */\n    printf(\"索引 = %d\\n\", index);  /* 2 */\n    \n    return 0;\n}"
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
            
            for (const field of requiredFields) {
                if (!(field in question)) {
                    throw new Error(`第 ${i + 1} 题缺少必需字段: ${field}`);
                }
            }

            if (!Array.isArray(question.options) && typeof question.options !== 'object') {
                throw new Error(`第 ${i + 1} 题选项格式错误`);
            }
            
            const optionsLength = Array.isArray(question.options) 
                ? question.options.length 
                : Object.keys(question.options).length;
            
            if (optionsLength === 0) {
                throw new Error(`第 ${i + 1} 题选项为空`);
            }

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

    // 规范化题目
    normalizeQuestions(questions) {
        if (!Array.isArray(questions)) return;
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        
        this.questions = questions.map(q => {
            if (!q || !q.options) return q;
            if (Array.isArray(q.options)) return q;

            const optsObj = q.options;
            const arr = [];
            for (const k of letters) {
                if (k in optsObj) arr.push(optsObj[k]);
            }
            if (arr.length === 0) {
                Object.values(optsObj).forEach(v => arr.push(v));
            }

            let correct = q.correctAnswer;
            if (typeof correct === 'string') {
                const up = correct.toUpperCase();
                const idx = letters.indexOf(up);
                correct = idx !== -1 ? idx : 0;
            }

            return Object.assign({}, q, { options: arr, correctAnswer: correct });
        });
    }

    // 获取题目分类
    getCategories() {
        const categories = new Set();
        this.questions.forEach(q => {
            if (q.category) {
                categories.add(q.category);
            }
        });
        return Array.from(categories);
    }

    // 获取难度统计
    getDifficultyStats() {
        const stats = {};
        this.questions.forEach(q => {
            if (q.difficulty) {
                stats[q.difficulty] = (stats[q.difficulty] || 0) + 1;
            }
        });
        return stats;
    }

    // 导出题库数据
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
