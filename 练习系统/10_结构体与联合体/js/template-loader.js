// 模板加载器 - 负责动态加载题库数据
class TemplateLoader {
    constructor() {
        this.questions = [];
    }

    // 加载题库数据
    async loadQuestions() {
        try {
            this.questions = this.getBuiltInQuestions();
            this.shuffleQuestions();
            this.reassignQuestionIds();
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
                "question": "关于结构体的定义，以下说法正确的是：",
                "options": ["结构体名和变量名可以相同", "结构体成员不能是指针", "结构体定义必须在main函数内", "结构体可以包含自己类型的成员"],
                "correctAnswer": 0,
                "explanation": "结构体名（标签）和变量名属于不同的命名空间，可以相同。结构体成员可以是指针，但不能包含自己类型的完整成员（可以是指针）。",
                "codeExample": "#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    char name[50];\n    int age;\n    struct Student *next;  // 正确：指针\n    // struct Student s;   // 错误：不能包含自己\n};\n\nint main() {\n    struct Student Student;  // 正确：变量名和结构体名相同\n    Student.age = 20;\n    strcpy(Student.name, \"张三\");\n    printf(\"姓名: %s, 年龄: %d\\n\", Student.name, Student.age);\n    return 0;\n}"
            },
            {
                "id": 2,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nint main() {\n    struct Node n1 = {10, NULL};\n    struct Node n2 = {20, &n1};\n    struct Node *p = &n2;\n    printf(\"%d\", p->next->data);\n    p->next = p->next->next;\n    printf(\" %d\", p->data);\n    return 0;\n}\n</C>",
                "options": ["`10 20`", "`20 10`", "段错误（崩溃）", "`10 10`"],
                "correctAnswer": 0,
                "explanation": "初始：p指向n2，n2.next指向n1。`p->next->data`是`n1.data` = 10。`p->next=p->next->next`将n2的next改为NULL。但`p->data`仍是`n2.data` = 20，因为修改的是n2的next成员，不是p本身。",
                "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nint main() {\n    struct Node n1 = {10, NULL};\n    struct Node n2 = {20, &n1};\n    struct Node *p = &n2;\n    \n    printf(\"p->next->data = %d\\n\", p->next->data);  /* 10 */\n    \n    /* 修改链接 */\n    p->next = p->next->next;  /* n2.next = NULL */\n    printf(\"p->data = %d\\n\", p->data);  /* 20 */\n    \n    /* 危险！现在p->next是NULL */\n    if (p->next != NULL) {\n        printf(\"%d\", p->next->data);\n    } else {\n        printf(\"链表已断开\\n\");\n    }\n    \n    return 0;\n}"
            },
            {
                "id": 3,
                "question": "关于 `typedef`，以下说法正确的是：",
                "options": ["`typedef` 创建新的数据类型", "`typedef` 为已有类型定义别名", "`typedef` 只能用于结构体", "`typedef` 和 `#define` 完全相同"],
                "correctAnswer": 1,
                "explanation": "`typedef` 为已有类型定义别名，不创建新类型。可用于任何类型。与 `#define` 不同，`typedef` 由编译器处理，更安全。",
                "codeExample": "#include <stdio.h>\n\ntypedef int Integer;\ntypedef unsigned long ULONG;\ntypedef char* String;\n\ntypedef struct {\n    int x;\n    int y;\n} Point;\n\nint main() {\n    Integer num = 10;\n    ULONG id = 12345;\n    String name = \"Alice\";\n    Point p = {5, 10};\n    \n    printf(\"num: %d, id: %lu\\n\", num, id);\n    printf(\"name: %s\\n\", name);\n    printf(\"Point: (%d, %d)\\n\", p.x, p.y);\n    \n    return 0;\n}"
            },
            {
                "id": 4,
                "question": "以下代码的输出结果是什么？\n\n<C>\ntypedef struct {\n    int a;\n    int b;\n} Data;\n\nint main() {\n    Data d = {10, 20};\n    Data *p = &d;\n    p->a = 30;\n    printf(\"%d %d\", d.a, d.b);\n    return 0;\n}\n</C>",
                "options": ["`10 20`", "`30 20`", "`10 30`", "编译错误"],
                "correctAnswer": 1,
                "explanation": "通过指针 `p->a = 30` 修改了结构体d的成员a的值。`typedef` 简化了结构体使用，不需要写 `struct` 关键字。",
                "codeExample": "#include <stdio.h>\n\ntypedef struct {\n    int a;\n    int b;\n} Data;\n\nint main() {\n    Data d = {10, 20};\n    Data *p = &d;\n    \n    printf(\"修改前: a=%d, b=%d\\n\", d.a, d.b);\n    p->a = 30;\n    printf(\"修改后: a=%d, b=%d\\n\", d.a, d.b);\n    \n    return 0;\n}"
            },
            {
                "id": 5,
                "question": "关于结构体数组，以下说法正确的是：",
                "options": ["结构体数组不能初始化", "结构体数组元素通过 `->` 访问成员", "结构体数组元素通过 `.` 访问成员", "结构体数组不能作为函数参数"],
                "correctAnswer": 2,
                "explanation": "结构体数组元素是结构体变量，使用 `.` 访问成员。只有指针才使用 `->`。结构体数组可以初始化和作为函数参数。",
                "codeExample": "#include <stdio.h>\n\nstruct Student {\n    char name[20];\n    int score;\n};\n\nint main() {\n    struct Student students[3] = {\n        {\"Alice\", 90},\n        {\"Bob\", 85},\n        {\"Charlie\", 92}\n    };\n    \n    for (int i = 0; i < 3; i++) {\n        printf(\"%s: %d\\n\", students[i].name, students[i].score);\n    }\n    \n    // 指针访问\n    struct Student *p = students;\n    printf(\"通过指针: %s\\n\", p->name);\n    \n    return 0;\n}"
            },
            {
                "id": 6,
                "question": "关于链表节点的定义，以下哪个是正确的？",
                "options": ["结构体不能包含指向自己的指针", "`struct Node { int data; struct Node next; };`", "`struct Node { int data; struct Node *next; };`", "链表节点必须使用typedef"],
                "correctAnswer": 2,
                "explanation": "链表节点包含数据和指向下一个节点的指针。不能包含自己类型的完整成员，但可以包含指向自己类型的指针。",
                "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nint main() {\n    struct Node *head = malloc(sizeof(struct Node));\n    struct Node *second = malloc(sizeof(struct Node));\n    struct Node *third = malloc(sizeof(struct Node));\n    \n    head->data = 1; head->next = second;\n    second->data = 2; second->next = third;\n    third->data = 3; third->next = NULL;\n    \n    struct Node *current = head;\n    while (current != NULL) {\n        printf(\"%d -> \", current->data);\n        current = current->next;\n    }\n    printf(\"NULL\\n\");\n    \n    free(head); free(second); free(third);\n    return 0;\n}"
            },
            {
                "id": 7,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct Data {\n    int x;\n    int y;\n};\n\nint main() {\n    struct Data arr[3] = {{1,2}, {3,4}, {5,6}};\n    struct Data *p = arr + 1;\n    printf(\"%d\", p->x);\n    return 0;\n}\n</C>",
                "options": ["`1`", "`3`", "`5`", "`2`"],
                "correctAnswer": 1,
                "explanation": "`arr + 1` 指向第二个结构体元素（arr[1]），其x成员的值是3。",
                "codeExample": "#include <stdio.h>\n\nstruct Data {\n    int x;\n    int y;\n};\n\nint main() {\n    struct Data arr[3] = {{1,2}, {3,4}, {5,6}};\n    struct Data *p = arr;\n    \n    printf(\"arr[0]: x=%d, y=%d\\n\", p->x, p->y);\n    \n    p = arr + 1;\n    printf(\"arr[1]: x=%d, y=%d\\n\", p->x, p->y);\n    \n    p++;\n    printf(\"arr[2]: x=%d, y=%d\\n\", p->x, p->y);\n    \n    return 0;\n}"
            },
            {
                "id": 8,
                "question": "关于结构体的大小，以下说法正确的是：",
                "options": ["结构体大小等于所有成员大小之和", "结构体大小可能大于所有成员大小之和（因为内存对齐）", "结构体大小总是8的倍数", "结构体大小由最大成员决定"],
                "correctAnswer": 1,
                "explanation": "由于内存对齐，结构体大小可能大于成员大小之和。编译器会在成员之间插入填充字节以满足对齐要求。",
                "codeExample": "#include <stdio.h>\n\nstruct Example1 {\n    char a;   // 1字节\n    int b;    // 4字节\n    char c;   // 1字节\n};  // 可能12字节（有填充）\n\nstruct Example2 {\n    char a;   // 1字节\n    char c;   // 1字节\n    int b;    // 4字节\n};  // 可能8字节（优化排列）\n\nint main() {\n    printf(\"Example1: %lu字节\\n\", sizeof(struct Example1));\n    printf(\"Example2: %lu字节\\n\", sizeof(struct Example2));\n    \n    return 0;\n}"
            },
            {
                "id": 9,
                "question": "以下代码的输出结果是什么？\n\n<C>\ntypedef struct Node {\n    int data;\n    struct Node *next;\n} Node;\n\nint main() {\n    Node n1 = {10, NULL};\n    Node n2 = {20, &n1};\n    printf(\"%d\", n2.next->data);\n    return 0;\n}\n</C>",
                "options": ["`10`", "`20`", "编译错误", "段错误"],
                "correctAnswer": 0,
                "explanation": "`n2.next` 指向n1，`n2.next->data` 访问n1的data成员，值为10。这是简单的链表结构。",
                "codeExample": "#include <stdio.h>\n\ntypedef struct Node {\n    int data;\n    struct Node *next;\n} Node;\n\nint main() {\n    Node n1 = {10, NULL};\n    Node n2 = {20, &n1};\n    Node n3 = {30, &n2};\n    \n    printf(\"n3.data = %d\\n\", n3.data);\n    printf(\"n3.next->data = %d\\n\", n3.next->data);\n    printf(\"n3.next->next->data = %d\\n\", n3.next->next->data);\n    \n    return 0;\n}"
            },
            {
                "id": 10,
                "question": "关于结构体指针作为函数参数，以下说法正确的是：",
                "options": ["传递结构体指针比传递结构体更高效", "传递结构体指针无法修改原结构体", "传递结构体和指针完全相同", "结构体指针不能作为函数参数"],
                "correctAnswer": 0,
                "explanation": "传递结构体指针只传递地址（通常4或8字节），而传递结构体需要复制整个结构体。对于大型结构体，使用指针更高效，且可以修改原结构体。",
                "codeExample": "#include <stdio.h>\n\nstruct Data {\n    int arr[100];\n    char name[50];\n};\n\nvoid modify_by_pointer(struct Data *p) {\n    p->arr[0] = 999;\n}\n\nvoid modify_by_value(struct Data d) {\n    d.arr[0] = 888;  // 修改的是副本\n}\n\nint main() {\n    struct Data data = {{0}};\n    data.arr[0] = 100;\n    \n    modify_by_value(data);\n    printf(\"传值后: %d\\n\", data.arr[0]);  // 100\n    \n    modify_by_pointer(&data);\n    printf(\"传指针后: %d\\n\", data.arr[0]);  // 999\n    \n    return 0;\n}"
            },
            {
                "id": 11,
                "question": "以下代码在32位系统上的输出最可能是多少？\n\n<C>\nstruct Data1 {\n    char a;\n    int b;\n    char c;\n};\n\nstruct Data2 {\n    char a;\n    char c;\n    int b;\n};\n\nint main() {\n    printf(\"%d %d\", sizeof(struct Data1), sizeof(struct Data2));\n    return 0;\n}\n</C>",
                "options": ["`6 6`", "`12 8`", "`8 8`", "`12 12`"],
                "correctAnswer": 1,
                "explanation": "32位系统int需4字节对齐。Data1：char(1)+填充(3)+int(4)+char(1)+填充(3)=12字节。Data2：char(1)+char(1)+填充(2)+int(4)=8字节。成员顺序影响结构体大小。",
                "codeExample": "#include <stdio.h>\n#include <stddef.h>\n\nstruct Data1 {\n    char a;\n    int b;\n    char c;\n};\n\nstruct Data2 {\n    char a;\n    char c;\n    int b;\n};\n\n#pragma pack(push, 1)\nstruct Data3 {\n    char a;\n    int b;\n    char c;\n};\n#pragma pack(pop)\n\nint main() {\n    printf(\"Data1: %lu bytes\\n\", sizeof(struct Data1));  /* 12 */\n    printf(\"Data2: %lu bytes\\n\", sizeof(struct Data2));  /* 8 */\n    printf(\"Data3 (packed): %lu bytes\\n\", sizeof(struct Data3));  /* 6 */\n    \n    return 0;\n}"
            },
            {
                "id": 12,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct Point {\n    int x, y;\n};\n\nint main() {\n    struct Point p1 = {10, 20};\n    struct Point p2 = p1;\n    p2.x = 30;\n    printf(\"%d %d\", p1.x, p2.x);\n    return 0;\n}\n</C>",
                "options": ["`10 30`", "`30 30`", "`10 10`", "编译错误"],
                "correctAnswer": 0,
                "explanation": "结构体赋值是值拷贝，p2是p1的副本。修改p2不影响p1。",
                "codeExample": "#include <stdio.h>\n\nstruct Point {\n    int x, y;\n};\n\nint main() {\n    struct Point p1 = {10, 20};\n    struct Point p2 = p1;  // 值拷贝\n    \n    printf(\"拷贝后: p1=(%d,%d), p2=(%d,%d)\\n\", p1.x, p1.y, p2.x, p2.y);\n    \n    p2.x = 30;\n    p2.y = 40;\n    printf(\"修改p2后: p1=(%d,%d), p2=(%d,%d)\\n\", p1.x, p1.y, p2.x, p2.y);\n    \n    return 0;\n}"
            },
            {
                "id": 13,
                "question": "关于结构体的位域（bit field），以下说法正确的是：",
                "options": ["位域可以是任何数据类型", "位域只能是 `int` 或 `unsigned int`", "位域可以节省内存空间", "B和C都正确"],
                "correctAnswer": 3,
                "explanation": "位域用于精确控制成员占用的位数，可以节省内存。通常只能是整型（int、unsigned int等）。",
                "codeExample": "#include <stdio.h>\n\nstruct Flags {\n    unsigned int flag1 : 1;\n    unsigned int flag2 : 1;\n    unsigned int value : 6;\n};  // 总共8位 = 1字节\n\nstruct Normal {\n    unsigned int flag1;\n    unsigned int flag2;\n    unsigned int value;\n};  // 12字节\n\nint main() {\n    printf(\"带位域: %lu字节\\n\", sizeof(struct Flags));\n    printf(\"普通结构体: %lu字节\\n\", sizeof(struct Normal));\n    \n    struct Flags f = {1, 0, 63};\n    printf(\"flag1=%u, flag2=%u, value=%u\\n\", f.flag1, f.flag2, f.value);\n    \n    return 0;\n}"
            },
            {
                "id": 14,
                "question": "以下删除链表节点的代码有什么问题？\n\n<C>\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nvoid delete_node(struct Node *head, int value) {\n    struct Node *p = head;\n    while (p != NULL && p->next != NULL) {\n        if (p->next->data == value) {\n            p->next = p->next->next;\n            return;\n        }\n        p = p->next;\n    }\n}\n</C>",
                "options": ["没有问题", "无法删除第一个节点", "存在内存泄漏", "B和C都正确"],
                "correctAnswer": 3,
                "explanation": "两个问题：1) 无法删除第一个节点，因为从p->next开始检查；2) 内存泄漏，跳过节点但未释放其内存。正确做法：使用二级指针或特殊处理头节点，并free被删节点。",
                "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\n/* 正确版本：使用二级指针 */\nvoid delete_correct(struct Node **head, int value) {\n    struct Node **p = head;\n    while (*p != NULL) {\n        if ((*p)->data == value) {\n            struct Node *temp = *p;\n            *p = (*p)->next;\n            free(temp);\n            return;\n        }\n        p = &((*p)->next);\n    }\n}\n\nint main() {\n    /* 测试代码略 */\n    return 0;\n}"
            },
            {
                "id": 15,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct Data {\n    char c;\n    int i;\n};\n\nint main() {\n    struct Data d = {'A', 65};\n    printf(\"%c %d\", d.c, d.i);\n    return 0;\n}\n</C>",
                "options": ["`A 65`", "`65 A`", "编译错误", "`A A`"],
                "correctAnswer": 0,
                "explanation": "结构体初始化时，'A'赋给c，65赋给i。输出时按格式分别输出字符和整数。",
                "codeExample": "#include <stdio.h>\n\nstruct Data {\n    char c;\n    int i;\n};\n\nint main() {\n    struct Data d = {'A', 65};\n    \n    printf(\"%%c格式: %c %c\\n\", d.c, d.i);  // A A (65的ASCII是'A')\n    printf(\"%%d格式: %d %d\\n\", d.c, d.i);  // 65 65\n    \n    return 0;\n}"
            },
            {
                "id": 16,
                "question": "以下代码的输出结果是什么？\n\n<C>\nunion Data {\n    int i;\n    char c[4];\n};\n\nint main() {\n    union Data d;\n    d.i = 0x12345678;\n    printf(\"%02X\", (unsigned char)d.c[0]);\n    return 0;\n}\n</C>",
                "options": ["`12`", "`78`", "`56`", "`34`"],
                "correctAnswer": 1,
                "explanation": "联合体成员共享内存。在小端系统（x86/x64），int值0x12345678存储为：低地址78 56 34 12高地址。`d.c[0]`访问最低地址字节，即0x78。",
                "codeExample": "#include <stdio.h>\n\nunion Data {\n    int i;\n    char c[4];\n};\n\nint main() {\n    union Data d;\n    d.i = 0x12345678;\n    \n    /* 小端系统输出 */\n    printf(\"c[0]=%02X\\n\", (unsigned char)d.c[0]);  /* 78 */\n    printf(\"c[1]=%02X\\n\", (unsigned char)d.c[1]);  /* 56 */\n    printf(\"c[2]=%02X\\n\", (unsigned char)d.c[2]);  /* 34 */\n    printf(\"c[3]=%02X\\n\", (unsigned char)d.c[3]);  /* 12 */\n    \n    /* 检测字节序 */\n    union { int i; char c; } test;\n    test.i = 1;\n    printf(\"%s系统\\n\", test.c == 1 ? \"小端\" : \"大端\");\n    \n    return 0;\n}"
            },
            {
                "id": 17,
                "question": "以下代码实现的功能是：\n\n<C>\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nint count_nodes(struct Node *head) {\n    int count = 0;\n    while (head != NULL) {\n        count++;\n        head = head->next;\n    }\n    return count;\n}\n</C>",
                "options": ["计算链表节点总数", "反转链表", "查找最大值", "删除所有节点"],
                "correctAnswer": 0,
                "explanation": "函数遍历链表，统计节点数量。每次循环计数加1，指针移向下一个节点，直到遇到NULL。",
                "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nint count_nodes(struct Node *head) {\n    int count = 0;\n    while (head != NULL) {\n        count++;\n        head = head->next;\n    }\n    return count;\n}\n\nint main() {\n    struct Node *head = NULL;\n    \n    /* 构建链表 */\n    for (int i = 3; i >= 1; i--) {\n        struct Node *n = malloc(sizeof(struct Node));\n        n->data = i * 10;\n        n->next = head;\n        head = n;\n    }\n    \n    printf(\"链表节点数: %d\\n\", count_nodes(head));\n    \n    return 0;\n}"
            },
            {
                "id": 18,
                "question": "以下关于联合体（union）的说法，正确的是？",
                "options": ["联合体的所有成员同时占用内存", "联合体的大小等于最大成员的大小", "联合体可以同时存储多个成员的值", "联合体和结构体完全相同"],
                "correctAnswer": 1,
                "explanation": "联合体的所有成员共享同一块内存，大小等于最大成员的大小（可能还需要考虑对齐）。同一时刻只能使用一个成员。",
                "codeExample": "#include <stdio.h>\n\nunion Data {\n    int i;\n    float f;\n    char c;\n};\n\nint main() {\n    union Data d;\n    \n    printf(\"union大小: %lu\\n\", sizeof(d));  /* 通常4字节 */\n    \n    d.i = 42;\n    printf(\"d.i = %d\\n\", d.i);  /* 42 */\n    \n    d.f = 3.14f;\n    printf(\"d.f = %f\\n\", d.f);  /* 3.14 */\n    /* d.i的值现在被覆盖了 */\n    \n    return 0;\n}"
            },
            {
                "id": 19,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct Point {\n    int x;\n    int y;\n};\n\nstruct Point create_point(int a, int b) {\n    struct Point p = {a, b};\n    return p;\n}\n\nint main() {\n    struct Point pt = create_point(3, 4);\n    printf(\"%d %d\", pt.x, pt.y);\n    return 0;\n}\n</C>",
                "options": ["`3 4`", "编译错误", "未定义行为", "`0 0`"],
                "correctAnswer": 0,
                "explanation": "C语言允许函数返回结构体。`create_point`返回一个结构体值，赋给pt。这是合法的，虽然可能有拷贝开销。",
                "codeExample": "#include <stdio.h>\n\nstruct Point {\n    int x;\n    int y;\n};\n\nstruct Point create_point(int a, int b) {\n    struct Point p = {a, b};\n    return p;\n}\n\nint main() {\n    struct Point pt = create_point(3, 4);\n    printf(\"pt = (%d, %d)\\n\", pt.x, pt.y);  /* (3, 4) */\n    \n    return 0;\n}"
            },
            {
                "id": 20,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct S {\n    int a;\n    char b;\n    double c;\n};\n\nint main() {\n    struct S s = {1, 'A', 3.14};\n    struct S *p = &s;\n    printf(\"%d %c %.2f\", p->a, (*p).b, p->c);\n    return 0;\n}\n</C>",
                "options": ["`1 A 3.14`", "编译错误", "未定义行为", "`1 65 3.14`"],
                "correctAnswer": 0,
                "explanation": "`p->a`和`(*p).a`完全等价，都是通过指针访问结构体成员。`p->`是`(*p).`的语法糖。",
                "codeExample": "#include <stdio.h>\n\nstruct S {\n    int a;\n    char b;\n    double c;\n};\n\nint main() {\n    struct S s = {1, 'A', 3.14};\n    struct S *p = &s;\n    \n    /* 两种访问方式等价 */\n    printf(\"p->a = %d\\n\", p->a);\n    printf(\"(*p).a = %d\\n\", (*p).a);\n    \n    return 0;\n}"
            },
            {
                "id": 21,
                "question": "以下关于枚举（enum）与结构体（struct）的区别，正确的是？",
                "options": ["枚举成员可以有不同类型", "枚举成员本质上是整数常量", "枚举和结构体完全相同", "枚举不能定义新类型"],
                "correctAnswer": 1,
                "explanation": "枚举的成员本质上是整数常量，从0开始递增（除非指定）。结构体可以包含不同类型的成员变量。枚举定义的是一组命名常量。",
                "codeExample": "#include <stdio.h>\n\nenum Color { RED, GREEN, BLUE };  /* 0, 1, 2 */\nenum Status { OK=200, NOT_FOUND=404 };  /* 指定值 */\n\nstruct Student {\n    char name[20];\n    int age;\n    enum Color favorite;\n};\n\nint main() {\n    enum Color c = GREEN;\n    printf(\"GREEN = %d\\n\", c);  /* 1 */\n    printf(\"OK = %d\\n\", OK);    /* 200 */\n    \n    struct Student s = {\"Alice\", 20, BLUE};\n    printf(\"%s likes color %d\\n\", s.name, s.favorite);\n    \n    return 0;\n}"
            },
            {
                "id": 22,
                "question": "以下代码的输出结果是什么？\n\n<C>\nunion {\n    struct {\n        unsigned char a:4;\n        unsigned char b:4;\n    } parts;\n    unsigned char whole;\n} u;\n\nint main() {\n    u.whole = 0xAB;\n    printf(\"%X %X\", u.parts.a, u.parts.b);\n    return 0;\n}\n</C>",
                "options": ["`A B`", "`B A`", "`AB 0`", "未定义行为"],
                "correctAnswer": 1,
                "explanation": "这是「联合体嵌套位域」的高级用法。`u.whole = 0xAB`，在小端系统中，低4位(B=11)存放在`parts.a`，高4位(A=10)存放在`parts.b`。输出`B A`。注意位域的存储顺序依赖于编译器实现。",
                "codeExample": "#include <stdio.h>\n\nunion {\n    struct {\n        unsigned char a:4;\n        unsigned char b:4;\n    } parts;\n    unsigned char whole;\n} u;\n\nint main() {\n    u.whole = 0xAB;\n    \n    printf(\"whole = 0x%02X\\n\", u.whole);  /* AB */\n    printf(\"parts.a = 0x%X\\n\", u.parts.a);   /* B */\n    printf(\"parts.b = 0x%X\\n\", u.parts.b);   /* A */\n    \n    /* 注意：位域顺序依赖编译器 */\n    /* 这不是可移植的代码 */\n    \n    return 0;\n}"
            },
            {
                "id": 23,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct Complex {\n    double real;\n    double imag;\n};\n\nvoid add(struct Complex *result, struct Complex a, struct Complex b) {\n    result->real = a.real + b.real;\n    result->imag = a.imag + b.imag;\n}\n\nint main() {\n    struct Complex c1 = {1.0, 2.0};\n    struct Complex c2 = {3.0, 4.0};\n    struct Complex c3;\n    add(&c3, c1, c2);\n    printf(\"%.1f+%.1fi\", c3.real, c3.imag);\n    return 0;\n}\n</C>",
                "options": ["`4.0+6.0i`", "`1.0+2.0i`", "`3.0+4.0i`", "编译错误"],
                "correctAnswer": 0,
                "explanation": "`add`函数通过指针参数返回结果。c1和c2按值传递（拷贝），result通过指针修改c3。1.0+3.0=4.0，2.0+4.0=6.0。",
                "codeExample": "#include <stdio.h>\n\nstruct Complex {\n    double real;\n    double imag;\n};\n\nvoid add(struct Complex *result, struct Complex a, struct Complex b) {\n    result->real = a.real + b.real;\n    result->imag = a.imag + b.imag;\n}\n\nint main() {\n    struct Complex c1 = {1.0, 2.0};\n    struct Complex c2 = {3.0, 4.0};\n    struct Complex c3;\n    \n    add(&c3, c1, c2);\n    printf(\"结果: %.1f+%.1fi\\n\", c3.real, c3.imag);\n    \n    return 0;\n}"
            },
            {
                "id": 24,
                "question": "以下关于结构体初始化的说法，错误的是？",
                "options": ["`struct Point p = {1, 2};` 是正确的", "`struct Point p = {.y=2, .x=1};` 是C99指定初始化器", "`struct Point p = {};` 会将所有成员初始化为0", "`struct Point p;` 后所有成员都有确定值"],
                "correctAnswer": 3,
                "explanation": "局部结构体变量未初始化时，成员的值是不确定的（垃圾值）。全局或静态结构体变量会自动初始化为零。`struct Point p = {};`在C中不合法，应该用`struct Point p = {0};`。",
                "codeExample": "#include <stdio.h>\n\nstruct Point {\n    int x;\n    int y;\n};\n\nint main() {\n    struct Point p1 = {1, 2};      /* 顺序初始化 */\n    struct Point p2 = {.y=2, .x=1}; /* C99指定初始化 */\n    struct Point p3 = {0};          /* 全部初始化为0 */\n    struct Point p4;                /* 值不确定！ */\n    \n    printf(\"p1: (%d, %d)\\n\", p1.x, p1.y);\n    printf(\"p2: (%d, %d)\\n\", p2.x, p2.y);\n    printf(\"p3: (%d, %d)\\n\", p3.x, p3.y);\n    /* printf(\"p4: (%d, %d)\\n\", p4.x, p4.y); */  /* 不确定值 */\n    \n    return 0;\n}"
            },
            {
                "id": 25,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct A {\n    int x;\n};\nstruct B {\n    struct A a;\n    int y;\n};\n\nint main() {\n    struct B b = {{10}, 20};\n    printf(\"%d %d\", b.a.x, b.y);\n    return 0;\n}\n</C>",
                "options": ["`10 20`", "编译错误", "`0 20`", "`10 0`"],
                "correctAnswer": 0,
                "explanation": "结构体可以嵌套。`b.a.x`访问嵌套结构体A的成员x，值为10。嵌套结构体用花括号嵌套初始化。",
                "codeExample": "#include <stdio.h>\n\nstruct A {\n    int x;\n};\n\nstruct B {\n    struct A a;\n    int y;\n};\n\nint main() {\n    struct B b = {{10}, 20};\n    \n    printf(\"b.a.x = %d\\n\", b.a.x);  /* 10 */\n    printf(\"b.y = %d\\n\", b.y);      /* 20 */\n    \n    /* C99指定初始化器 */\n    struct B c = {.a = {.x = 30}, .y = 40};\n    printf(\"c.a.x = %d, c.y = %d\\n\", c.a.x, c.y);\n    \n    return 0;\n}"
            },
            {
                "id": 26,
                "question": "以下代码的输出结果是什么？\n\n<C>\nunion Data {\n    int i;\n    float f;\n};\n\nint main() {\n    union Data d;\n    d.i = 1092616192;\n    printf(\"%f\", d.f);\n    return 0;\n}\n</C>",
                "options": ["`1092616192.000000`", "`12.340000`（近似）", "编译错误", "未定义行为"],
                "correctAnswer": 1,
                "explanation": "联合体成员共享内存。整数1092616192的二进制表示与float 12.34的二进制表示相同（IEEE 754）。通过不同类型解读同一内存内容，这是「类型双关」（type punning）技术。",
                "codeExample": "#include <stdio.h>\n\nunion Data {\n    int i;\n    float f;\n};\n\nint main() {\n    union Data d;\n    d.f = 12.34f;\n    printf(\"作为float: %f\\n\", d.f);\n    printf(\"作为int: %d\\n\", d.i);\n    \n    /* 反向：用整数设置，以浮点解读 */\n    d.i = 1092616192;\n    printf(\"作为float: %f\\n\", d.f);  /* ~12.34 */\n    \n    return 0;\n}"
            },
            {
                "id": 27,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct S {\n    char c;\n    int i;\n};\n\nint main() {\n    struct S arr[2] = {{'A', 1}, {'B', 2}};\n    struct S *p = arr;\n    printf(\"%c %d\", (p+1)->c, (p+1)->i);\n    return 0;\n}\n</C>",
                "options": ["`A 1`", "`B 2`", "编译错误", "未定义行为"],
                "correctAnswer": 1,
                "explanation": "`p+1`指向arr[1]，即第二个结构体元素。`(p+1)->c` = 'B'，`(p+1)->i` = 2。指针算术自动按结构体大小偏移。",
                "codeExample": "#include <stdio.h>\n\nstruct S {\n    char c;\n    int i;\n};\n\nint main() {\n    struct S arr[2] = {{'A', 1}, {'B', 2}};\n    struct S *p = arr;\n    \n    printf(\"arr[0]: %c %d\\n\", p->c, p->i);\n    printf(\"arr[1]: %c %d\\n\", (p+1)->c, (p+1)->i);\n    \n    return 0;\n}"
            },
            {
                "id": 28,
                "question": "以下关于匿名结构体的说法，正确的是？",
                "options": ["匿名结构体不能定义变量", "匿名结构体可以作为其他结构体的成员", "匿名结构体必须使用typedef", "C语言不支持匿名结构体"],
                "correctAnswer": 1,
                "explanation": "C11标准支持匿名结构体作为其他结构体的成员，可以简化嵌套访问。匿名结构体也可以结合typedef使用。",
                "codeExample": "#include <stdio.h>\n\nstruct Person {\n    char name[20];\n    struct {  /* 匿名结构体 */\n        int year;\n        int month;\n        int day;\n    };  /* 无成员名 */\n};\n\nint main() {\n    struct Person p = {\"Alice\", .year=2000, .month=5, .day=15};\n    \n    /* 直接访问匿名结构体成员 */\n    printf(\"%s: %d-%d-%d\\n\", p.name, p.year, p.month, p.day);\n    \n    return 0;\n}"
            },
            {
                "id": 29,
                "question": "以下代码的输出结果是什么？\n\n<C>\nstruct Point {\n    int x, y;\n};\n\nint main() {\n    struct Point p1 = {10, 20};\n    struct Point p2;\n    p2 = p1;\n    p2.x = 30;\n    printf(\"%d %d\", p1.x, p2.x);\n    return 0;\n}\n</C>",
                "options": ["`10 30`", "`30 30`", "`10 10`", "编译错误"],
                "correctAnswer": 0,
                "explanation": "C语言支持结构体之间的直接赋值，这是值拷贝。p2=p1后，p2是p1的副本。修改p2.x不影响p1.x。注意：如果结构体包含指针成员，直接赋值只拷贝地址（浅拷贝）。",
                "codeExample": "#include <stdio.h>\n#include <string.h>\n\nstruct Point {\n    int x, y;\n};\n\nint main() {\n    struct Point p1 = {10, 20};\n    struct Point p2;\n    \n    p2 = p1;  /* 结构体直接赋值（值拷贝） */\n    p2.x = 30;\n    \n    printf(\"p1: (%d, %d)\\n\", p1.x, p1.y);  /* (10, 20) */\n    printf(\"p2: (%d, %d)\\n\", p2.x, p2.y);  /* (30, 20) */\n    \n    return 0;\n}"
            },
            {
                "id": 30,
                "question": "以下代码的输出结果是什么？\n\n<C>\nenum Result { FAIL=0, PASS=1 };\nstruct Score {\n    int value;\n    enum Result result;\n};\n\nint main() {\n    struct Score s = {85, PASS};\n    if (s.value >= 60)\n        s.result = PASS;\n    else\n        s.result = FAIL;\n    printf(\"%d %d\", s.value, s.result);\n    return 0;\n}\n</C>",
                "options": ["`85 1`", "`85 0`", "`85 PASS`", "编译错误"],
                "correctAnswer": 0,
                "explanation": "枚举值PASS=1。85>=60为真，所以s.result=PASS=1。结构体可以包含枚举类型作为成员。",
                "codeExample": "#include <stdio.h>\n\nenum Result { FAIL=0, PASS=1 };\n\nstruct Score {\n    int value;\n    enum Result result;\n};\n\nint main() {\n    struct Score s = {85, FAIL};\n    \n    if (s.value >= 60)\n        s.result = PASS;\n    else\n        s.result = FAIL;\n    \n    printf(\"成绩: %d, 结果: %s\\n\", s.value, \n           s.result == PASS ? \"通过\" : \"不通过\");\n    \n    return 0;\n}"
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
            if (q.category) categories.add(q.category);
        });
        return Array.from(categories);
    }

    // 获取难度统计
    getDifficultyStats() {
        const stats = {};
        this.questions.forEach(q => {
            if (q.difficulty) stats[q.difficulty] = (stats[q.difficulty] || 0) + 1;
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
