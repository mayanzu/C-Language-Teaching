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
                question: "关于指针数组和数组指针，以下说法正确的是：",
                options: [
                    "`int *p[5]` 是数组指针",
                    "`int (*p)[5]` 是指针数组",
                    "`int *p[5]` 是指针数组，包含5个int指针",
                    "`int (*p)[5]` 和 `int *p[5]` 完全相同"
                ],
                correctAnswer: 2,
                explanation: "`int *p[5]` 是指针数组，包含5个指向int的指针。`int (*p)[5]` 是数组指针，指向一个包含5个int的数组。注意括号的位置改变了含义。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 指针数组：5个指针\n    int a = 1, b = 2, c = 3;\n    int *p[3];\n    p[0] = &a;\n    p[1] = &b;\n    p[2] = &c;\n    printf(\"指针数组: %d %d %d\\n\", *p[0], *p[1], *p[2]);\n    \n    // 数组指针：指向整个数组\n    int arr[5] = {10, 20, 30, 40, 50};\n    int (*ptr)[5] = &arr;\n    printf(\"数组指针: %d %d\\n\", (*ptr)[0], (*ptr)[1]);\n    \n    return 0;\n}"
            },
            {
                id: 2,
                question: "以下代码的输出结果是什么？\n\n<C>\nint arr[3][4] = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};\nint (*p)[4] = arr;\nprintf(\"%d\", *(*(p+1)+2));\n</C>",
                options: [
                    "`3`",
                    "`7`",
                    "`6`",
                    "`11`"
                ],
                correctAnswer: 1,
                explanation: "`p+1` 指向第二行，`*(p+1)` 得到第二行首地址，`*(p+1)+2` 指向第二行第三个元素，`*(*(p+1)+2)` 得到值7。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int arr[3][4] = {{1,2,3,4}, {5,6,7,8}, {9,10,11,12}};\n    int (*p)[4] = arr;  // p指向二维数组\n    \n    printf(\"第0行第0列: %d\\n\", **p);  // 1\n    printf(\"第1行第0列: %d\\n\", *(*(p+1)));  // 5\n    printf(\"第1行第2列: %d\\n\", *(*(p+1)+2));  // 7\n    printf(\"第2行第3列: %d\\n\", *(*(p+2)+3));  // 12\n    \n    return 0;\n}"
            },
            {
                id: 3,
                question: "关于函数指针，以下定义正确的是：",
                options: [
                    "`int *func(int a, int b);` 是函数指针",
                    "`int (*func)(int a, int b);` 是函数指针",
                    "`int *(*func)(int a, int b);` 是函数指针",
                    "以上都正确"
                ],
                correctAnswer: 1,
                explanation: "`int (*func)(int, int)` 是函数指针，指向返回int、接收两个int参数的函数。`int *func(int, int)` 是函数声明，返回int指针。括号很重要。",
                codeExample: "#include <stdio.h>\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint multiply(int a, int b) {\n    return a * b;\n}\n\nint main() {\n    // 函数指针声明\n    int (*func)(int, int);\n    \n    func = add;\n    printf(\"add: %d\\n\", func(3, 4));  // 7\n    \n    func = multiply;\n    printf(\"multiply: %d\\n\", func(3, 4));  // 12\n    \n    return 0;\n}"
            },
            {
                id: 4,
                question: "以下代码的输出结果是什么？\n\n<C>\nchar *str[] = {\"Hello\", \"World\", \"C\"};\nprintf(\"%s\", str[1]);\n</C>",
                options: [
                    "`Hello`",
                    "`World`",
                    "`C`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "`str` 是指针数组，每个元素是指向字符串的指针。`str[1]` 指向第二个字符串\"World\"。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    char *str[] = {\"Hello\", \"World\", \"C\"};\n    \n    printf(\"%s\\n\", str[0]);  // Hello\n    printf(\"%s\\n\", str[1]);  // World\n    printf(\"%s\\n\", str[2]);  // C\n    \n    // 访问单个字符\n    printf(\"%c\\n\", str[1][0]);  // W\n    printf(\"%c\\n\", str[1][1]);  // o\n    \n    return 0;\n}"
            },
            {
                id: 5,
                question: "关于结构体的定义，以下说法正确的是：",
                options: [
                    "结构体名和变量名可以相同",
                    "结构体成员不能是指针",
                    "结构体定义必须在main函数内",
                    "结构体可以包含自己类型的成员"
                ],
                correctAnswer: 0,
                explanation: "结构体名（标签）和变量名属于不同的命名空间，可以相同。结构体成员可以是指针，但不能包含自己类型的完整成员（可以是指针）。",
                codeExample: "#include <stdio.h>\n\nstruct Student {\n    char name[50];\n    int age;\n    struct Student *next;  // 正确：指针\n    // struct Student s;   // 错误：不能包含自己\n};\n\nint main() {\n    struct Student Student;  // 正确：变量名和结构体名相同\n    Student.age = 20;\n    strcpy(Student.name, \"张三\");\n    \n    printf(\"姓名: %s, 年龄: %d\\n\", Student.name, Student.age);\n    \n    return 0;\n}"
            },
            {
                id: 6,
                question: "以下代码的输出结果是什么？\n\n<C>\nstruct Point {\n    int x;\n    int y;\n};\n\nint main() {\n    struct Point p = {10, 20};\n    struct Point *ptr = &p;\n    printf(\"%d %d\", ptr->x, (*ptr).y);\n    return 0;\n}\n</C>",
                options: [
                    "`10 20`",
                    "`20 10`",
                    "编译错误",
                    "`0 0`"
                ],
                correctAnswer: 0,
                explanation: "`ptr->x` 和 `(*ptr).y` 都是访问结构体成员的方式。`->` 用于指针，`.` 用于结构体变量。两种方式等价。",
                codeExample: "#include <stdio.h>\n\nstruct Point {\n    int x;\n    int y;\n};\n\nint main() {\n    struct Point p = {10, 20};\n    struct Point *ptr = &p;\n    \n    // 两种访问方式\n    printf(\"ptr->x = %d\\n\", ptr->x);  // 10\n    printf(\"(*ptr).x = %d\\n\", (*ptr).x);  // 10\n    printf(\"ptr->y = %d\\n\", ptr->y);  // 20\n    printf(\"(*ptr).y = %d\\n\", (*ptr).y);  // 20\n    \n    return 0;\n}"
            },
            {
                id: 7,
                question: "关于 `typedef`，以下说法正确的是：",
                options: [
                    "`typedef` 创建新的数据类型",
                    "`typedef` 为已有类型定义别名",
                    "`typedef` 只能用于结构体",
                    "`typedef` 和 `#define` 完全相同"
                ],
                correctAnswer: 1,
                explanation: "`typedef` 为已有类型定义别名，不创建新类型。可用于任何类型。与 `#define` 不同，`typedef` 由编译器处理，更安全。",
                codeExample: "#include <stdio.h>\n\n// typedef用法\ntypedef int Integer;\ntypedef unsigned long ULONG;\ntypedef char* String;\n\ntypedef struct {\n    int x;\n    int y;\n} Point;\n\nint main() {\n    Integer num = 10;  // 等同于 int num = 10;\n    ULONG id = 12345;\n    String name = \"Alice\";\n    Point p = {5, 10};\n    \n    printf(\"num: %d, id: %lu\\n\", num, id);\n    printf(\"name: %s\\n\", name);\n    printf(\"Point: (%d, %d)\\n\", p.x, p.y);\n    \n    return 0;\n}"
            },
            {
                id: 8,
                question: "以下代码的输出结果是什么？\n\n<C>\ntypedef struct {\n    int a;\n    int b;\n} Data;\n\nint main() {\n    Data d = {10, 20};\n    Data *p = &d;\n    p->a = 30;\n    printf(\"%d %d\", d.a, d.b);\n    return 0;\n}\n</C>",
                options: [
                    "`10 20`",
                    "`30 20`",
                    "`10 30`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "通过指针 `p->a = 30` 修改了结构体d的成员a的值。`typedef` 简化了结构体使用，不需要写 `struct` 关键字。",
                codeExample: "#include <stdio.h>\n\ntypedef struct {\n    int a;\n    int b;\n} Data;\n\nint main() {\n    Data d = {10, 20};\n    Data *p = &d;\n    \n    printf(\"修改前: a=%d, b=%d\\n\", d.a, d.b);\n    p->a = 30;\n    printf(\"修改后: a=%d, b=%d\\n\", d.a, d.b);\n    \n    return 0;\n}"
            },
            {
                id: 9,
                question: "关于结构体数组，以下说法正确的是：",
                options: [
                    "结构体数组不能初始化",
                    "结构体数组元素通过 `->` 访问成员",
                    "结构体数组元素通过 `.` 访问成员",
                    "结构体数组不能作为函数参数"
                ],
                correctAnswer: 2,
                explanation: "结构体数组元素是结构体变量，使用 `.` 访问成员。只有指针才使用 `->`。结构体数组可以初始化和作为函数参数。",
                codeExample: "#include <stdio.h>\n\nstruct Student {\n    char name[20];\n    int score;\n};\n\nint main() {\n    // 结构体数组初始化\n    struct Student students[3] = {\n        {\"Alice\", 90},\n        {\"Bob\", 85},\n        {\"Charlie\", 92}\n    };\n    \n    // 访问元素\n    for (int i = 0; i < 3; i++) {\n        printf(\"%s: %d\\n\", students[i].name, students[i].score);\n    }\n    \n    // 指针访问\n    struct Student *p = students;\n    printf(\"\\n通过指针: %s\\n\", p->name);\n    \n    return 0;\n}"
            },
            {
                id: 10,
                question: "以下代码中，哪个是正确的函数指针数组定义？",
                options: [
                    "`int *func[5](int);`",
                    "`int (*func[5])(int);`",
                    "`int *(func[5])(int);`",
                    "`int func[5](*int);`"
                ],
                correctAnswer: 1,
                explanation: "`int (*func[5])(int)` 定义了一个包含5个函数指针的数组，每个函数接收int参数，返回int。括号顺序很重要。",
                codeExample: "#include <stdio.h>\n\nint add_one(int x) { return x + 1; }\nint mul_two(int x) { return x * 2; }\nint square(int x) { return x * x; }\n\nint main() {\n    // 函数指针数组\n    int (*func[3])(int) = {add_one, mul_two, square};\n    \n    int num = 5;\n    for (int i = 0; i < 3; i++) {\n        printf(\"func[%d](%d) = %d\\n\", i, num, func[i](num));\n    }\n    \n    return 0;\n}"
            },
            {
                id: 11,
                question: "关于指向指针的指针（二级指针），以下说法正确的是：",
                options: [
                    "二级指针只能指向指针变量",
                    "二级指针可以指向任何变量",
                    "二级指针使用 `***` 解引用",
                    "二级指针不能修改原变量的值"
                ],
                correctAnswer: 0,
                explanation: "二级指针 `int **p` 指向指针变量。使用 `**p` 解引用两次访问最终的值。可以通过二级指针修改原变量。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 100;\n    int *p = &x;   // p指向x\n    int **pp = &p;  // pp指向p\n    \n    printf(\"x = %d\\n\", x);\n    printf(\"*p = %d\\n\", *p);\n    printf(\"**pp = %d\\n\", **pp);\n    \n    **pp = 200;  // 通过二级指针修改x\n    printf(\"修改后 x = %d\\n\", x);\n    \n    return 0;\n}"
            },
            {
                id: 12,
                question: "以下代码的输出结果是什么？\n\n<C>\nint *arr[3];\nint a = 10, b = 20, c = 30;\narr[0] = &a; arr[1] = &b; arr[2] = &c;\nprintf(\"%d\", *arr[1]);\n</C>",
                options: [
                    "`10`",
                    "`20`",
                    "`30`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "`arr` 是指针数组，`arr[1]` 存储b的地址，`*arr[1]` 解引用得到b的值20。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int *arr[3];\n    int a = 10, b = 20, c = 30;\n    \n    arr[0] = &a;\n    arr[1] = &b;\n    arr[2] = &c;\n    \n    printf(\"*arr[0] = %d\\n\", *arr[0]);  // 10\n    printf(\"*arr[1] = %d\\n\", *arr[1]);  // 20\n    printf(\"*arr[2] = %d\\n\", *arr[2]);  // 30\n    \n    // 修改值\n    *arr[1] = 200;\n    printf(\"修改后 b = %d\\n\", b);  // 200\n    \n    return 0;\n}"
            },
            {
                id: 13,
                question: "关于链表节点的定义，以下哪个是正确的？",
                options: [
                    "结构体不能包含指向自己的指针",
                    "`struct Node { int data; struct Node next; };`",
                    "`struct Node { int data; struct Node *next; };`",
                    "链表节点必须使用typedef"
                ],
                correctAnswer: 2,
                explanation: "链表节点包含数据和指向下一个节点的指针。不能包含自己类型的完整成员，但可以包含指向自己类型的指针。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node *next;  // 正确：指针\n};\n\nint main() {\n    // 创建三个节点\n    struct Node *head = (struct Node*)malloc(sizeof(struct Node));\n    struct Node *second = (struct Node*)malloc(sizeof(struct Node));\n    struct Node *third = (struct Node*)malloc(sizeof(struct Node));\n    \n    head->data = 1;\n    head->next = second;\n    \n    second->data = 2;\n    second->next = third;\n    \n    third->data = 3;\n    third->next = NULL;\n    \n    // 遍历链表\n    struct Node *current = head;\n    while (current != NULL) {\n        printf(\"%d -> \", current->data);\n        current = current->next;\n    }\n    printf(\"NULL\\n\");\n    \n    free(head); free(second); free(third);\n    return 0;\n}"
            },
            {
                id: 14,
                question: "以下代码的输出结果是什么？\n\n<C>\nstruct Data {\n    int x;\n    int y;\n};\n\nint main() {\n    struct Data arr[3] = {{1,2}, {3,4}, {5,6}};\n    struct Data *p = arr + 1;\n    printf(\"%d\", p->x);\n    return 0;\n}\n</C>",
                options: [
                    "`1`",
                    "`3`",
                    "`5`",
                    "`2`"
                ],
                correctAnswer: 1,
                explanation: "`arr + 1` 指向第二个结构体元素（arr[1]），其x成员的值是3。",
                codeExample: "#include <stdio.h>\n\nstruct Data {\n    int x;\n    int y;\n};\n\nint main() {\n    struct Data arr[3] = {{1,2}, {3,4}, {5,6}};\n    struct Data *p = arr;  // 指向第一个元素\n    \n    printf(\"arr[0]: x=%d, y=%d\\n\", p->x, p->y);\n    \n    p = arr + 1;  // 指向第二个元素\n    printf(\"arr[1]: x=%d, y=%d\\n\", p->x, p->y);\n    \n    p++;  // 指向第三个元素\n    printf(\"arr[2]: x=%d, y=%d\\n\", p->x, p->y);\n    \n    return 0;\n}"
            },
            {
                id: 15,
                question: "关于结构体的大小，以下说法正确的是：",
                options: [
                    "结构体大小等于所有成员大小之和",
                    "结构体大小可能大于所有成员大小之和（因为内存对齐）",
                    "结构体大小总是8的倍数",
                    "结构体大小由最大成员决定"
                ],
                correctAnswer: 1,
                explanation: "由于内存对齐，结构体大小可能大于成员大小之和。编译器会在成员之间插入填充字节以满足对齐要求。",
                codeExample: "#include <stdio.h>\n\nstruct Example1 {\n    char a;   // 1字节\n    int b;    // 4字节\n    char c;   // 1字节\n};  // 实际可能是12字节（有填充）\n\nstruct Example2 {\n    char a;   // 1字节\n    char c;   // 1字节\n    int b;    // 4字节\n};  // 实际可能是8字节（优化排列）\n\nint main() {\n    printf(\"char: %lu字节\\n\", sizeof(char));\n    printf(\"int: %lu字节\\n\", sizeof(int));\n    printf(\"Example1: %lu字节\\n\", sizeof(struct Example1));\n    printf(\"Example2: %lu字节\\n\", sizeof(struct Example2));\n    \n    return 0;\n}"
            },
            {
                id: 16,
                question: "以下代码实现的功能是：\n\n<C>\nvoid swap(int **p1, int **p2) {\n    int *temp = *p1;\n    *p1 = *p2;\n    *p2 = temp;\n}\n</C>",
                options: [
                    "交换两个整数的值",
                    "交换两个指针指向的地址",
                    "交换两个指针变量本身",
                    "代码有错误"
                ],
                correctAnswer: 1,
                explanation: "函数交换两个指针指向的地址。通过二级指针修改一级指针的值（地址）。",
                codeExample: "#include <stdio.h>\n\nvoid swap(int **p1, int **p2) {\n    int *temp = *p1;\n    *p1 = *p2;\n    *p2 = temp;\n}\n\nint main() {\n    int a = 10, b = 20;\n    int *pa = &a, *pb = &b;\n    \n    printf(\"交换前: pa指向%d, pb指向%d\\n\", *pa, *pb);\n    \n    swap(&pa, &pb);  // 传递指针的地址\n    \n    printf(\"交换后: pa指向%d, pb指向%d\\n\", *pa, *pb);\n    \n    return 0;\n}"
            },
            {
                id: 17,
                question: "以下代码的输出结果是什么？\n\n<C>\ntypedef struct Node {\n    int data;\n    struct Node *next;\n} Node;\n\nint main() {\n    Node n1 = {10, NULL};\n    Node n2 = {20, &n1};\n    printf(\"%d\", n2.next->data);\n    return 0;\n}\n</C>",
                options: [
                    "`10`",
                    "`20`",
                    "编译错误",
                    "段错误"
                ],
                correctAnswer: 0,
                explanation: "`n2.next` 指向n1，`n2.next->data` 访问n1的data成员，值为10。这是简单的链表结构。",
                codeExample: "#include <stdio.h>\n\ntypedef struct Node {\n    int data;\n    struct Node *next;\n} Node;\n\nint main() {\n    Node n1 = {10, NULL};\n    Node n2 = {20, &n1};\n    Node n3 = {30, &n2};\n    \n    printf(\"n3.data = %d\\n\", n3.data);\n    printf(\"n3.next->data = %d\\n\", n3.next->data);\n    printf(\"n3.next->next->data = %d\\n\", n3.next->next->data);\n    \n    return 0;\n}"
            },
            {
                id: 18,
                question: "关于函数返回指针，以下说法正确的是：",
                options: [
                    "函数可以返回任何指针",
                    "函数不能返回局部变量的地址",
                    "函数返回的指针不需要检查NULL",
                    "函数返回指针总是安全的"
                ],
                correctAnswer: 1,
                explanation: "函数不应返回局部变量的地址，因为局部变量在函数结束后被销毁。应返回静态变量、全局变量或动态分配的内存地址。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\n// 错误：返回局部变量地址\n// int *wrong() {\n//     int x = 10;\n//     return &x;  // 危险！\n// }\n\n// 正确：返回静态变量地址\nint *method1() {\n    static int x = 10;\n    return &x;\n}\n\n// 正确：返回动态分配的内存\nint *method2() {\n    int *p = (int*)malloc(sizeof(int));\n    if (p != NULL) {\n        *p = 20;\n    }\n    return p;\n}\n\nint main() {\n    int *p1 = method1();\n    printf(\"method1: %d\\n\", *p1);\n    \n    int *p2 = method2();\n    if (p2 != NULL) {\n        printf(\"method2: %d\\n\", *p2);\n        free(p2);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 19,
                question: "以下代码的输出结果是什么？\n\n<C>\nint x = 10, y = 20;\nint *p[] = {&x, &y};\nint **pp = p;\nprintf(\"%d\", **pp);\n</C>",
                options: [
                    "`10`",
                    "`20`",
                    "输出地址",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "`pp` 指向指针数组p的首元素（指向x的指针），`**pp` 解引用两次得到x的值10。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 10, y = 20;\n    int *p[] = {&x, &y};  // 指针数组\n    int **pp = p;  // pp指向数组首元素\n    \n    printf(\"**pp = %d\\n\", **pp);  // 10\n    printf(\"**(pp+1) = %d\\n\", **(pp+1));  // 20\n    \n    // 修改值\n    **pp = 100;\n    printf(\"x = %d\\n\", x);  // 100\n    \n    return 0;\n}"
            },
            {
                id: 20,
                question: "关于结构体指针作为函数参数，以下说法正确的是：",
                options: [
                    "传递结构体指针比传递结构体更高效",
                    "传递结构体指针无法修改原结构体",
                    "传递结构体和指针完全相同",
                    "结构体指针不能作为函数参数"
                ],
                correctAnswer: 0,
                explanation: "传递结构体指针只传递地址（通常4或8字节），而传递结构体需要复制整个结构体。对于大型结构体，使用指针更高效，且可以修改原结构体。",
                codeExample: "#include <stdio.h>\n\nstruct Data {\n    int arr[100];\n    char name[50];\n};\n\n// 传递指针（高效）\nvoid modify_by_pointer(struct Data *p) {\n    p->arr[0] = 999;\n}\n\n// 传递结构体（低效，复制整个结构体）\nvoid modify_by_value(struct Data d) {\n    d.arr[0] = 888;  // 修改的是副本\n}\n\nint main() {\n    struct Data data = {{0}};\n    data.arr[0] = 100;\n    \n    printf(\"原始值: %d\\n\", data.arr[0]);\n    \n    modify_by_value(data);\n    printf(\"传值后: %d\\n\", data.arr[0]);  // 100（未改变）\n    \n    modify_by_pointer(&data);\n    printf(\"传指针后: %d\\n\", data.arr[0]);  // 999（已改变）\n    \n    return 0;\n}"
            },
            {
                id: 21,
                question: "以下代码中存在什么问题？\n\n<C>\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nstruct Node *create() {\n    struct Node node;\n    node.data = 10;\n    node.next = NULL;\n    return &node;\n}\n</C>",
                options: [
                    "没有问题",
                    "返回了局部变量的地址",
                    "结构体定义错误",
                    "指针使用错误"
                ],
                correctAnswer: 1,
                explanation: "函数返回局部变量node的地址，node在函数结束后被销毁，导致悬空指针。应使用动态分配（malloc）。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\n// 错误方法\n// struct Node *wrong_create() {\n//     struct Node node;\n//     node.data = 10;\n//     node.next = NULL;\n//     return &node;  // 危险！\n// }\n\n// 正确方法：动态分配\nstruct Node *correct_create() {\n    struct Node *node = (struct Node*)malloc(sizeof(struct Node));\n    if (node != NULL) {\n        node->data = 10;\n        node->next = NULL;\n    }\n    return node;\n}\n\nint main() {\n    struct Node *n = correct_create();\n    if (n != NULL) {\n        printf(\"data = %d\\n\", n->data);\n        free(n);\n    }\n    \n    return 0;\n}"
            },
            {
                id: 22,
                question: "以下代码的输出结果是什么？\n\n<C>\nstruct Point {\n    int x, y;\n};\n\nint main() {\n    struct Point p1 = {10, 20};\n    struct Point p2 = p1;\n    p2.x = 30;\n    printf(\"%d %d\", p1.x, p2.x);\n    return 0;\n}\n</C>",
                options: [
                    "`10 30`",
                    "`30 30`",
                    "`10 10`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "结构体赋值是值拷贝，p2是p1的副本。修改p2不影响p1。",
                codeExample: "#include <stdio.h>\n\nstruct Point {\n    int x, y;\n};\n\nint main() {\n    struct Point p1 = {10, 20};\n    struct Point p2 = p1;  // 值拷贝\n    \n    printf(\"拷贝后: p1=(%d,%d), p2=(%d,%d)\\n\", p1.x, p1.y, p2.x, p2.y);\n    \n    p2.x = 30;\n    p2.y = 40;\n    printf(\"修改p2后: p1=(%d,%d), p2=(%d,%d)\\n\", p1.x, p1.y, p2.x, p2.y);\n    \n    return 0;\n}"
            },
            {
                id: 23,
                question: "关于 `void*` 指针，以下说法正确的是：",
                options: [
                    "`void*` 可以直接解引用",
                    "`void*` 可以指向任何类型的数据",
                    "`void*` 不能进行指针运算",
                    "B和C都正确"
                ],
                correctAnswer: 3,
                explanation: "`void*` 是通用指针，可以指向任何类型，但不能直接解引用或进行指针运算。使用前需要转换为具体类型。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 10;\n    double y = 3.14;\n    char c = 'A';\n    \n    void *p;  // 通用指针\n    \n    p = &x;\n    printf(\"int: %d\\n\", *(int*)p);  // 转换后使用\n    \n    p = &y;\n    printf(\"double: %.2f\\n\", *(double*)p);\n    \n    p = &c;\n    printf(\"char: %c\\n\", *(char*)p);\n    \n    // 错误示例\n    // printf(\"%d\", *p);  // 错误：void*不能直接解引用\n    // p++;  // 错误：void*不能进行指针运算\n    \n    return 0;\n}"
            },
            {
                id: 24,
                question: "以下代码的输出结果是什么？\n\n<C>\ntypedef int (*FuncPtr)(int, int);\n\nint add(int a, int b) { return a + b; }\nint sub(int a, int b) { return a - b; }\n\nint main() {\n    FuncPtr f = add;\n    printf(\"%d\", f(10, 5));\n    return 0;\n}\n</C>",
                options: [
                    "`15`",
                    "`5`",
                    "`50`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "`FuncPtr` 是函数指针类型别名。`f` 指向 `add` 函数，`f(10, 5)` 调用add返回15。",
                codeExample: "#include <stdio.h>\n\ntypedef int (*FuncPtr)(int, int);\n\nint add(int a, int b) { return a + b; }\nint sub(int a, int b) { return a - b; }\nint mul(int a, int b) { return a * b; }\n\nint main() {\n    FuncPtr f;\n    \n    f = add;\n    printf(\"add(10, 5) = %d\\n\", f(10, 5));\n    \n    f = sub;\n    printf(\"sub(10, 5) = %d\\n\", f(10, 5));\n    \n    f = mul;\n    printf(\"mul(10, 5) = %d\\n\", f(10, 5));\n    \n    return 0;\n}"
            },
            {
                id: 25,
                question: "关于结构体的位域（bit field），以下说法正确的是：",
                options: [
                    "位域可以是任何数据类型",
                    "位域只能是 `int` 或 `unsigned int`",
                    "位域可以节省内存空间",
                    "B和C都正确"
                ],
                correctAnswer: 3,
                explanation: "位域用于精确控制成员占用的位数，可以节省内存。通常只能是整型（int、unsigned int等）。",
                codeExample: "#include <stdio.h>\n\nstruct Flags {\n    unsigned int flag1 : 1;  // 1位\n    unsigned int flag2 : 1;  // 1位\n    unsigned int value : 6;  // 6位\n};  // 总共8位 = 1字节\n\nstruct Normal {\n    unsigned int flag1;\n    unsigned int flag2;\n    unsigned int value;\n};  // 12字节\n\nint main() {\n    printf(\"带位域: %lu字节\\n\", sizeof(struct Flags));\n    printf(\"普通结构体: %lu字节\\n\", sizeof(struct Normal));\n    \n    struct Flags f = {1, 0, 63};\n    printf(\"flag1=%u, flag2=%u, value=%u\\n\", f.flag1, f.flag2, f.value);\n    \n    return 0;\n}"
            },
            {
                id: 26,
                question: "以下代码实现的功能是：\n\n<C>\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nvoid insert_front(struct Node **head, int value) {\n    struct Node *new_node = malloc(sizeof(struct Node));\n    new_node->data = value;\n    new_node->next = *head;\n    *head = new_node;\n}\n</C>",
                options: [
                    "在链表末尾插入节点",
                    "在链表开头插入节点",
                    "删除链表节点",
                    "查找链表节点"
                ],
                correctAnswer: 1,
                explanation: "函数在链表头部插入新节点。使用二级指针修改头指针，新节点的next指向原头节点，然后更新头指针。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nvoid insert_front(struct Node **head, int value) {\n    struct Node *new_node = malloc(sizeof(struct Node));\n    new_node->data = value;\n    new_node->next = *head;\n    *head = new_node;\n}\n\nvoid print_list(struct Node *head) {\n    while (head != NULL) {\n        printf(\"%d -> \", head->data);\n        head = head->next;\n    }\n    printf(\"NULL\\n\");\n}\n\nint main() {\n    struct Node *head = NULL;\n    \n    insert_front(&head, 30);\n    insert_front(&head, 20);\n    insert_front(&head, 10);\n    \n    print_list(head);  // 10 -> 20 -> 30 -> NULL\n    \n    return 0;\n}"
            },
            {
                id: 27,
                question: "以下代码的输出结果是什么？\n\n<C>\nstruct Data {\n    char c;\n    int i;\n};\n\nint main() {\n    struct Data d = {'A', 65};\n    printf(\"%c %d\", d.c, d.i);\n    return 0;\n}\n</C>",
                options: [
                    "`A 65`",
                    "`65 A`",
                    "编译错误",
                    "`A A`"
                ],
                correctAnswer: 0,
                explanation: "结构体初始化时，'A'赋给c，65赋给i。输出时按格式分别输出字符和整数。",
                codeExample: "#include <stdio.h>\n\nstruct Data {\n    char c;\n    int i;\n};\n\nint main() {\n    struct Data d = {'A', 65};\n    \n    printf(\"%%c格式: %c %c\\n\", d.c, d.i);  // A A (65的ASCII是'A')\n    printf(\"%%d格式: %d %d\\n\", d.c, d.i);  // 65 65\n    \n    return 0;\n}"
            },
            {
                id: 28,
                question: "关于联合体（union）和结构体，以下说法正确的是：",
                options: [
                    "联合体和结构体完全相同",
                    "联合体所有成员共享同一块内存",
                    "联合体可以同时存储所有成员的值",
                    "联合体比结构体占用更多空间"
                ],
                correctAnswer: 1,
                explanation: "联合体所有成员共享同一块内存，同一时间只能存储一个成员的值。联合体大小等于最大成员的大小。",
                codeExample: "#include <stdio.h>\n\nunion Data {\n    int i;\n    float f;\n    char str[20];\n};\n\nstruct DataStruct {\n    int i;\n    float f;\n    char str[20];\n};\n\nint main() {\n    printf(\"union大小: %lu\\n\", sizeof(union Data));  // 20\n    printf(\"struct大小: %lu\\n\", sizeof(struct DataStruct));  // 28\n    \n    union Data u;\n    u.i = 10;\n    printf(\"u.i = %d\\n\", u.i);\n    \n    u.f = 3.14;  // 覆盖i的值\n    printf(\"u.f = %.2f\\n\", u.f);\n    printf(\"u.i = %d (被覆盖)\\n\", u.i);\n    \n    return 0;\n}"
            },
            {
                id: 29,
                question: "以下代码的输出结果是什么？\n\n<C>\nint arr[] = {1, 2, 3, 4, 5};\nint *p1 = arr;\nint *p2 = arr + 4;\nprintf(\"%ld\", p2 - p1);\n</C>",
                options: [
                    "`16`（字节差）",
                    "`4`（元素数）",
                    "`20`",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "两个指针相减得到元素个数差，不是字节数差。p2指向arr[4]，p1指向arr[0]，相差4个元素。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int *p1 = arr;\n    int *p2 = arr + 4;\n    \n    printf(\"指针相减: %ld个元素\\n\", p2 - p1);  // 4\n    printf(\"地址差: %ld字节\\n\", (char*)p2 - (char*)p1);  // 16\n    \n    return 0;\n}"
            },
            {
                id: 30,
                question: "以下代码实现的功能是：\n\n<C>\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nint count_nodes(struct Node *head) {\n    int count = 0;\n    while (head != NULL) {\n        count++;\n        head = head->next;\n    }\n    return count;\n}\n</C>",
                options: [
                    "计算链表节点总数",
                    "反转链表",
                    "查找最大值",
                    "删除所有节点"
                ],
                correctAnswer: 0,
                explanation: "函数遍历链表，统计节点数量。每次循环计数加1，指针移向下一个节点，直到遇到NULL。",
                codeExample: "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nint count_nodes(struct Node *head) {\n    int count = 0;\n    while (head != NULL) {\n        count++;\n        head = head->next;\n    }\n    return count;\n}\n\nvoid insert(struct Node **head, int value) {\n    struct Node *new_node = malloc(sizeof(struct Node));\n    new_node->data = value;\n    new_node->next = *head;\n    *head = new_node;\n}\n\nint main() {\n    struct Node *head = NULL;\n    \n    insert(&head, 10);\n    insert(&head, 20);\n    insert(&head, 30);\n    \n    printf(\"链表节点数: %d\\n\", count_nodes(head));\n    \n    return 0;\n}"
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