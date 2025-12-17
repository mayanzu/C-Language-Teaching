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
        return [
  {
    "id": 1,
    "question": "以下代码的输出结果是什么（假设set为32位系统）？\n\n<C>\nvoid func(int arr[]) {\n    printf(\"%d\", sizeof(arr));\n}\n\nint main() {\n    int a[10];\n    printf(\"%d \", sizeof(a));\n    func(a);\n    return 0;\n}\n</C>",
    "options": ["`40 40`", "`40 4`", "`10 10`", "`10 4`"],
    "correctAnswer": 1,
    "explanation": "这是**数组退化为指针**的经典陷阱！在main中，`a`是数组，`sizeof(a)`返回整个数组大小：10×4=40字节。**关键陷阱**：作为函数参数时，`int arr[]`自动退化为指针`int *arr`，`sizeof(arr)`返回指针大小而不是数组大小！32位系统上指针为4字节。输出`40 4`。**易错点**：误以为func内的arr仍是数组。**解决方案**：单独传递数组大小参数。",
    "codeExample": "#include <stdio.h>\n\n/* 数组参数退化为指针 */\nvoid func(int arr[]) {  /* 等价于 int *arr */\n    printf(\"%zu\\n\", sizeof(arr));  /* 输出指针大小4或64 */\n}\n\nint main() {\n    int a[10];\n    \n    /* main中，a是数组 */\n    printf(\"main中: %zu \", sizeof(a));  /* 10*4=40 */\n    \n    /* 传递给函数后退化为指针 */\n    printf(\"func中: \");\n    func(a);  /* 输出4或64 */\n    \n    /* 正确做法：传递大小 */\n    printf(\"数组大小: %zu\\n\", sizeof(a)/sizeof(a[0]));  /* 10 */\n    \n    return 0;\n}"
  },
  {
    "id": 2,
    "question": "若 `int a[5] = {1, 2, 3};`，则 `a[4]` 的值是？",
    "options": ["`0`", "`3`", "随机值", "编译错误"],
    "correctAnswer": 0,
    "explanation": "当数组初始化列表元素少于数组大小时，剩余元素会被自动初始化为0。因此 `a[0]=1, a[1]=2, a[2]=3, a[3]=0, a[4]=0`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[5] = {1, 2, 3};  // 只初始化前3个元素\n    \n    // 输出所有元素\n    for(int i = 0; i < 5; i++) {\n        printf(\"a[%d] = %d\\n\", i, a[i]);\n    }\n    \n    /* 输出结果：\n    a[0] = 1\n    a[1] = 2\n    a[2] = 3\n    a[3] = 0  // 未初始化的元素自动为0\n    a[4] = 0  // 未初始化的元素自动为0\n    */\n    \n    return 0;\n}"
  },
  {
    "id": 3,
    "question": "以下关于二维数组的定义，正确的是？",
    "options": ["`int a[][3] = {{1, 2, 3}, {4, 5, 6}};`", "`int a[2][] = {{1, 2, 3}, {4, 5, 6}};`", "`int a[][] = {{1, 2, 3}, {4, 5, 6}};`", "`int a[2, 3] = {{1, 2, 3}, {4, 5, 6}};`"],
    "correctAnswer": 0,
    "explanation": "选项A正确：二维数组定义时，第一维可以省略（由初始化列表确定），但第二维必须指定。选项B错误：第二维不能省略。选项C错误：两维都不能省略。选项D错误：应使用方括号 `[]`，不是逗号。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    // 正确的定义方式\n    int a[][3] = {{1, 2, 3}, {4, 5, 6}};  // 第一维省略，第二维指定为3\n    \n    // 也可以这样定义\n    int b[2][3] = {{1, 2, 3}, {4, 5, 6}};  // 两维都指定\n    \n    // 错误的定义方式\n    // int c[2][] = {{1, 2, 3}, {4, 5, 6}};  // 错误：第二维不能省略\n    // int d[][] = {{1, 2, 3}, {4, 5, 6}};    // 错误：两维都不能省略\n    // int e[2, 3] = {{1, 2, 3}, {4, 5, 6}}; // 错误：应使用方括号\n    \n    return 0;\n}"
  },
  {
    "id": 4,
    "question": "若 `int a[3][2] = {{1, 2}, {3, 4}, {5, 6}};`，则 `a[1][1]` 的值是？",
    "options": ["`1`", "`2`", "`3`", "`4`"],
    "correctAnswer": 3,
    "explanation": "二维数组 `a[3][2]` 表示3衁2列的数组。`a[1][1]` 表示第2行第2列的元素。数组元素排列如下：\n第1行：`a[0][0]=1, a[0][1]=2`\n第2行：`a[1][0]=3, a[1][1]=4`\n第3行：`a[2][0]=5, a[2][1]=6`\n所以 `a[1][1]` 的值是4。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[3][2] = {{1, 2}, {3, 4}, {5, 6}};\n    \n    // 输出所有元素\n    for(int i = 0; i < 3; i++) {\n        for(int j = 0; j < 2; j++) {\n            printf(\"a[%d][%d] = %d \", i, j, a[i][j]);\n        }\n        printf(\"\\n\");\n    }\n    \n    /* 输出结果：\n    a[0][0] = 1 a[0][1] = 2 \n    a[1][0] = 3 a[1][1] = 4 \n    a[2][0] = 5 a[2][1] = 6 \n    */\n    \n    printf(\"a[1][1] = %d\\n\", a[1][1]);  // 输出：a[1][1] = 4\n    \n    return 0;\n}"
  },
  {
    "id": 5,
    "question": "以下关于字符数组和字符串的说法，正确的是？",
    "options": ["字符串必须以 `'\\0'` 结尾", "字符数组就是字符串", "字符串长度等于数组大小", "字符数组不能存放字符串"],
    "correctAnswer": 0,
    "explanation": "选项A正确：C语言中字符串是以 `'\\0'`（空字符）结尾的字符序列。选项B错误：字符数组不一定是字符串，只有以 `'\\0'` 结尾的字符数组才是字符串。选项C错误：字符串长度是有效字符的数量（不包括 `'\\0'`），通常小于数组大小。选项D错误：字符数组可以存放字符串。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    // 字符数组（也是字符串）\n    char str1[] = \"Hello\";  // 自动添加'\\0'，实际大小为6\n    \n    // 字符数组（不是字符串）\n    char arr[] = {'H', 'e', 'l', 'l', 'o'};  // 没有'\\0'，不是字符串\n    \n    // 字符数组（手动添加'\\0'）\n    char str2[] = {'H', 'e', 'l', 'l', 'o', '\\0'};  // 手动添加'\\0'\n    \n    printf(\"str1长度: %zu, 数组大小: %zu\\n\", strlen(str1), sizeof(str1));\n    // 输出：str1长度: 5, 数组大小: 6\n    \n    // arr不能使用strlen，因为没有'\\0'\n    printf(\"str2长度: %zu, 数组大小: %zu\\n\", strlen(str2), sizeof(str2));\n    // 输出：str2长度: 5, 数组大小: 6\n    \n    return 0;\n}"
  },
  {
    "id": 6,
    "question": "以下代码的输出结果是什么？\n\n<C>\nchar *s1 = \"Hello\";\nchar s2[] = \"Hello\";\ns1[0] = 'h';  /* 修改字符串字面量 */\ns2[0] = 'h';  /* 修改字符数组 */\nprintf(\"%s %s\", s1, s2);\n</C>",
    "options": ["`hello hello`", "`Hello hello`", "未定义行为（崩溃）", "编译错误"],
    "correctAnswer": 2,
    "explanation": "这是**字符串字面量修改**的严重陷阱！`char *s1=\"Hello\"`使s1指向**字符串常量区**，内容只读，修改`s1[0]`是**未定义行为**（通常导致程序崩溃）。`char s2[]=\"Hello\"`会将字符串**复制到栈上的数组**，s2是可写的，修改`s2[0]`合法。**关键区别**：指针指向常量区（只读），数组复制到栈区（可写）。**易错点**：两者看起来相似但内存位置完全不同。**安全建议**：使用`const char *s1=\"Hello\"`防止误修改。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    /* 危险：指向字符串字面量（只读） */\n    char *s1 = \"Hello\";\n    /* s1[0] = 'h';  未定义行为！可能崩溃 */\n    \n    /* 安全：数组存储在栈上（可写） */\n    char s2[] = \"Hello\";\n    s2[0] = 'h';  /* 合法 */\n    printf(\"%s\\n\", s2);  /* 输出: hello */\n    \n    /* 正确做法：使用const防止修改 */\n    const char *s3 = \"Hello\";\n    /* s3[0] = 'h';  编译错误，const保护 */\n    \n    /* 内存位置对比 */\n    printf(\"s1地址: %p (常量区)\\n\", (void*)s1);\n    printf(\"s2地址: %p (栈区)\\n\", (void*)s2);\n    \n    return 0;\n}"
  },
  {
    "id": 7,
    "question": "以下代码执行后，输出结果是？\n\n<C>\nint a[] = {5, 3, 8, 1, 9};\nint i, j, temp;\nfor(i = 0; i < 4; i++) {\n    for(j = 0; j < 4-i; j++) {\n        if(a[j] > a[j+1]) {\n            temp = a[j];\n            a[j] = a[j+1];\n            a[j+1] = temp;\n        }\n    }\n}\nprintf(\"%d\", a[2]);\n</C>",
    "options": ["`3`", "`5`", "`8`", "`9`"],
    "correctAnswer": 0,
    "explanation": "这是一个冒泡排序算法，对数组进行升序排序。原始数组：`{5, 3, 8, 1, 9}`\n排序后数组：`{1, 3, 5, 8, 9}`\n`a[2]` 是排序后数组的第3个元素，值为 `3`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[] = {5, 3, 8, 1, 9};\n    int i, j, temp;\n    \n    // 冒泡排序\n    for(i = 0; i < 4; i++) {\n        for(j = 0; j < 4-i; j++) {\n            if(a[j] > a[j+1]) {\n                temp = a[j];\n                a[j] = a[j+1];\n                a[j+1] = temp;\n            }\n        }\n    }\n    \n    // 输出排序后的数组\n    for(i = 0; i < 5; i++) {\n        printf(\"a[%d] = %d \", i, a[i]);\n    }\n    printf(\"\\n\");\n    \n    printf(\"a[2] = %d\\n\", a[2]);  // 输出：a[2] = 3\n    \n    return 0;\n}"
  },
  {
    "id": 8,
    "question": "以下哪个函数可以计算字符串长度？",
    "options": ["`strlen()`", "`sizeof()`", "`length()`", "`size()`"],
    "correctAnswer": 0,
    "explanation": "选项A正确：`strlen()` 是C标准库中的函数，用于计算字符串长度（不包括结尾的 `'\\0'`）。选项B错误：`sizeof` 是运算符，不是函数，返回变量或类型的大小（字节）。选项C和D错误：`length()` 和 `size()` 不是C标准库中的函数。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str[] = \"Hello World\";\n    \n    // 使用strlen计算字符串长度\n    size_t len = strlen(str);\n    printf(\"字符串长度: %zu\\n\", len);  // 输出：字符串长度: 11\n    \n    // sizeof返回数组大小（包括'\\0'）\n    printf(\"数组大小: %zu\\n\", sizeof(str));  // 输出：数组大小: 12\n    \n    return 0;\n}"
  },
  {
    "id": 9,
    "question": "若 `char str1[10] = \"Hello\", char str2[10];`，以下哪个操作是正确的？",
    "options": ["`str2 = str1;`", "`strcpy(str2, str1);`", "`str2[10] = str1[10];`", "`strcmp(str2, str1);`"],
    "correctAnswer": 1,
    "explanation": "选项B正确：`strcpy()` 是C标准库函数，用于将一个字符串复制到另一个字符串中。选项A错误：不能使用赋值运算符直接复制数组。选项C错误：数组越界访问，`str2[10]` 和 `str1[10]` 都超出了数组范围（有效索引是0-9）。选项D错误：`strcmp()` 是比较字符串的函数，不是复制字符串。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str1[10] = \"Hello\";\n    char str2[10];\n    \n    // 正确的字符串复制方式\n    strcpy(str2, str1);\n    printf(\"str2 = %s\\n\", str2);  // 输出：str2 = Hello\n    \n    // 错误的方式\n    // str2 = str1;  // 错误：不能直接赋值数组\n    \n    // 正确的字符串比较方式\n    if(strcmp(str1, str2) == 0) {\n        printf(\"两个字符串相同\\n\");\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 10,
    "question": "以下关于数组作为函数参数的说法，正确的是？",
    "options": ["数组作为参数传递时会复制整个数组", "数组作为参数传递时传递的是数组首地址", "数组作为参数传递时必须指定数组大小", "数组作为参数传递时不能修改原数组"],
    "correctAnswer": 1,
    "explanation": "选项B正确：数组作为函数参数传递时，实际上传递的是数组的首地址（指针），而不是复制整个数组。因此函数内对数组的修改会影响原数组。选项A错误：不会复制整个数组。选项C错误：可以不指定数组大小，但可以指定第二维的大小（对于二维数组）。选项D错误：可以修改原数组。",
    "codeExample": "#include <stdio.h>\n\n// 数组作为函数参数\nvoid modifyArray(int arr[], int size) {\n    for(int i = 0; i < size; i++) {\n        arr[i] *= 2;  // 修改数组元素\n    }\n}\n\nint main() {\n    int a[] = {1, 2, 3, 4, 5};\n    int size = sizeof(a) / sizeof(a[0]);\n    \n    printf(\"修改前: \");\n    for(int i = 0; i < size; i++) {\n        printf(\"%d \", a[i]);\n    }\n    printf(\"\\n\");\n    \n    modifyArray(a, size);  // 传递数组首地址\n    \n    printf(\"修改后: \");\n    for(int i = 0; i < size; i++) {\n        printf(\"%d \", a[i]);\n    }\n    printf(\"\\n\");\n    \n    return 0;\n}"
  },
  {
    "id": 11,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint a[2][3] = {1, 2, 3, 4, 5, 6};  /* 未用嵌套花括号 */\nint *p = (int *)a;\nprintf(\"%d %d %d\", a[0][1], a[1][0], *(p+3));\n</C>",
    "options": ["`2 4 4`", "`2 3 3`", "`1 4 4`", "`2 4 3`"],
    "correctAnswer": 0,
    "explanation": "这是**多维数组内存布局**陷阱！二维数组在内存中**按行优先连续存储**：`a[0][0]=1, a[0][1]=2, a[0][2]=3, a[1][0]=4, a[1][1]=5, a[1][2]=6`。即使初始化时没用嵌套花括号，编译器按顺序填充。`a[0][1]=2`（第1行第2列），`a[1][0]=4`（第2行第1列），`*(p+3)`指向第4个元素即`a[1][0]=4`。输出`2 4 4`。**关键知识**：`int a[2][3]`在内存中等同于长度为6的一维数组，只是逻辑上分为2行3列。**易错点**：误以为`*(p+3)`=3。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[2][3] = {1, 2, 3, 4, 5, 6};  /* 连续填充 */\n    int *p = (int *)a;\n    \n    /* 内存布局（按行优先） */\n    printf(\"内存顺序: \");\n    for (int i = 0; i < 6; i++) {\n        printf(\"%d \", *(p+i));  /* 1 2 3 4 5 6 */\n    }\n    printf(\"\\n\");\n    \n    /* 二维下标访问 */\n    printf(\"a[0][1]=%d\\n\", a[0][1]);  /* 2 */\n    printf(\"a[1][0]=%d\\n\", a[1][0]);  /* 4 */\n    printf(\"*(p+3)=%d\\n\", *(p+3));    /* 4 */\n    \n    /* 地址验证 */\n    printf(\"&a[1][0]=%p, p+3=%p\\n\", \n           (void*)&a[1][0], (void*)(p+3));  /* 地址相同 */\n    \n    return 0;\n}"
  },
  {
    "id": 12,
    "question": "若 `char str1[20] = \"Programming\", char str2[20] = \"Language\";`，则 `strcat(str1, str2)` 执行后，`str1` 的内容是？",
    "options": ["`ProgrammingLanguage`", "`Language`", "`Programming`", "`Programming Language`"],
    "correctAnswer": 0,
    "explanation": "`strcat()` 函数将第二个字符串连接到第一个字符串的后面（覆盖第一个字符串的 `'\\0'`）。所以 `str1` 的内容变为 `\"ProgrammingLanguage\"`。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str1[20] = \"Programming\";\n    char str2[20] = \"Language\";\n    \n    printf(\"连接前: str1 = %s, str2 = %s\\n\", str1, str2);\n    \n    strcat(str1, str2);  // 将str2连接到str1后面\n    \n    printf(\"连接后: str1 = %s\\n\", str1);  // 输出：连接后: str1 = ProgrammingLanguage\n    \n    return 0;\n}"
  },
  {
    "id": 13,
    "question": "以下哪个函数用于比较两个字符串？",
    "options": ["`strcmp()`", "`strcpy()`", "`strcat()`", "`strlen()`"],
    "correctAnswer": 0,
    "explanation": "选项A正确：`strcmp()` 函数用于比较两个字符串，返回0表示相等，负数表示第一个字符串小于第二个字符串，正数表示第一个字符串大于第二个字符串。选项B错误：`strcpy()` 用于复制字符串。选项C错误：`strcat()` 用于连接字符串。选项D错误：`strlen()` 用于计算字符串长度。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str1[] = \"Hello\";\n    char str2[] = \"World\";\n    char str3[] = \"Hello\";\n    \n    // 比较字符串\n    int result1 = strcmp(str1, str2);\n    int result2 = strcmp(str1, str3);\n    \n    if(result1 == 0) {\n        printf(\"str1和str2相等\\n\");\n    } else if(result1 < 0) {\n        printf(\"str1小于str2\\n\");\n    } else {\n        printf(\"str1大于str2\\n\");\n    }\n    \n    if(result2 == 0) {\n        printf(\"str1和str3相等\\n\");\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 14,
    "question": "以下代码执行后，输出结果是？\n\n<C>\nint a[] = {1, 2, 3, 4, 5};\nint *p = a;\nprintf(\"%d\", *(p+2));\n</C>",
    "options": ["`1`", "`2`", "`3`", "`5`"],
    "correctAnswer": 2,
    "explanation": "数组名 `a` 表示数组首元素的地址，`p` 指向数组首元素。`*(p+2)` 等价于 `a[2]`，即数组的第3个元素，值为 `3`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[] = {1, 2, 3, 4, 5};\n    int *p = a;  // p指向数组首元素\n    \n    // 使用指针访问数组元素\n    printf(\"a[0] = %d\\n\", *p);       // 输出：a[0] = 1\n    printf(\"a[1] = %d\\n\", *(p+1));   // 输出：a[1] = 2\n    printf(\"a[2] = %d\\n\", *(p+2));   // 输出：a[2] = 3\n    \n    // 指针和数组的等价性\n    printf(\"a[2] = %d\\n\", a[2]);     // 输出：a[2] = 3\n    printf(\"a[2] = %d\\n\", *(a+2));   // 输出：a[2] = 3\n    printf(\"a[2] = %d\\n\", p[2]);     // 输出：a[2] = 3\n    \n    return 0;\n}"
  },
  {
    "id": 15,
    "question": "以下哪个函数可以将字符串转换为整数？",
    "options": ["`atoi()`", "`itoa()`", "`strlen()`", "`strcmp()`"],
    "correctAnswer": 0,
    "explanation": "选项A正确：`atoi()` 函数将字符串转换为整数。选项B错误：`itoa()` 不是标准C库函数（某些编译器可能支持）。选项C错误：`strlen()` 计算字符串长度。选项D错误：`strcmp()` 比较字符串。",
    "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    char str1[] = \"12345\";\n    char str2[] = \"-6789\";\n    \n    // 将字符串转换为整数\n    int num1 = atoi(str1);\n    int num2 = atoi(str2);\n    \n    printf(\"%s -> %d\\n\", str1, num1);  // 输出：12345 -> 12345\n    printf(\"%s -> %d\\n\", str2, num2);  // 输出：-6789 -> -6789\n    \n    // 计算两数之和\n    printf(\"Sum: %d\\n\", num1 + num2);  // 输出：Sum: 5556\n    \n    return 0;\n}"
  },
  {
    "id": 16,
    "question": "以下代码的运行结果是什么？\n\n<C>\nint a[5] = {1, 2, 3, 4, 5};\nint b = 100;\na[10] = 99;  /* 数组越界写入 */\nprintf(\"%d %d\", a[10], b);\n</C>",
    "options": ["`99 100`", "编译错误", "运行时崩溃或随机值", "`0 0`"],
    "correctAnswer": 2,
    "explanation": "这是**数组越界不报错**的危险陷阱！C语言编译器**不检查数组边界**，`a[10]`访问超出数组范围的内存。`a[10]=99`可能覆盖其他变量（如b）、栈帧、返回地址等，导致**未定义行为**：程序可能崩溃、输出随机值、或看似正常运行但隐藏严重bug。**关键危险**：1) 编译通过不代表正确；2) 可能破坏其他数据；3) 难以调试（表现不确定）。**防范**：1) 手动检查索引范围；2) 使用边界检查工具；3) 开启编译器警告。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[5] = {1, 2, 3, 4, 5};\n    int b = 100;\n    \n    /* 危险：数组越界写入 */\n    printf(\"越界前b=%d\\n\", b);\n    a[10] = 99;  /* 未定义行为！可能覆盖b或其他内存 */\n    printf(\"越界后b=%d\\n\", b);  /* b可能被改变 */\n    printf(\"a[10]=%d\\n\", a[10]);  /* 读取也是未定义行为 */\n    \n    /* 正确做法：检查边界 */\n    int index = 10;\n    if (index >= 0 && index < 5) {\n        a[index] = 99;\n    } else {\n        printf(\"错误：索引%d越界！\\n\", index);\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 17,
    "question": "若 `char str[10];`，以下哪个输入函数可以安全地读取字符串到 `str` 中？",
    "options": ["`fgets(str, 10, stdin);`", "`gets(str);`", "`scanf(\\\"%s\\\", str);`", "`strcpy(str, \\\"input\\\");`"],
    "correctAnswer": 0,
    "explanation": "选项A正确：`fgets()` 函数可以指定最大读取字符数，防止缓冲区溢出，是安全的输入函数。选项B错误：`gets()` 函数不检查缓冲区大小，容易导致缓冲区溢出，已被弃用。选项C错误：`scanf(\\\"%s\\\")` 不检查缓冲区大小，可能导致缓冲区溢出。选项D错误：`strcpy()` 不是输入函数，是复制函数。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str[10];\n    \n    printf(\"请输入字符串（最多9个字符）: \");\n    fgets(str, 10, stdin);  // 安全地读取输入，最多读取9个字符+1个'\\0'\n    \n    // 移除可能的换行符\n    size_t len = strlen(str);\n    if(len > 0 && str[len-1] == '\\n') {\n        str[len-1] = '\\0';\n    }\n    \n    printf(\"你输入的字符串是: %s\\n\", str);\n    \n    return 0;\n}"
  },
  {
    "id": 18,
    "question": "以下代码执行后，输出结果是？\n\n<C>\nchar str[] = \\\"Hello World\\\";\nint count = 0;\nfor(int i = 0; str[i] != '\\\\0'; i++) {\n    if(str[i] == 'l') {\n        count++;\n    }\n}\nprintf(\\\"%d\\\", count);\n</C>",
    "options": ["`2`", "`3`", "`4`", "`5`"],
    "correctAnswer": 1,
    "explanation": "这段代码统计字符串 `\\\"Hello World\\\"` 中字符 `'l'` 出现的次数。字符串中 `'l'` 出现了3次（第3、4和10个字符），所以 `count=3`。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str[] = \"Hello World\";\n    int count = 0;\n    \n    // 统计字符'l'出现的次数\n    for(int i = 0; str[i] != '\\0'; i++) {\n        if(str[i] == 'l') {\n            count++;\n        }\n    }\n    \n    printf(\"字符'l'出现的次数: %d\\n\", count);  // 输出：字符'l'出现的次数: 3\n    \n    // 输出字符串及其长度\n    printf(\"字符串: %s\\n\", str);\n    printf(\"字符串长度: %zu\\n\", strlen(str));  // 输出：字符串长度: 11\n    \n    return 0;\n}"
  },
  {
    "id": 19,
    "question": "以下关于数组初始化的说法，正确的是？",
    "options": ["`int a[5] = {};` 是合法的初始化方式", "`int a[];` 是合法的数组定义", "`int a[5] = {1, 2, 3, 4, 5, 6};` 是合法的初始化方式", "`int a[5] = {1, 2, 3};` 其余元素会被初始化为0"],
    "correctAnswer": 3,
    "explanation": "选项D正确：当初始化列表元素少于数组大小时，剩余元素会被初始化为 `0`。选项A错误：`{}` 不是合法的初始化语法，应使用 `{0}`。选项B错误：定义数组时必须指定大小或提供初始化列表。选项C错误：初始化元素数量不能超过数组大小。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    // 正确的初始化方式\n    int a[5] = {1, 2, 3};  // a[3]和a[4]自动初始化为0\n    \n    // 输出数组元素\n    for(int i = 0; i < 5; i++) {\n        printf(\"a[%d] = %d\\n\", i, a[i]);\n    }\n    \n    /* 输出结果：\n    a[0] = 1\n    a[1] = 2\n    a[2] = 3\n    a[3] = 0\n    a[4] = 0\n    */\n    \n    // 其他初始化方式\n    int b[5] = {0};  // 所有元素初始化为0\n    int c[] = {1, 2, 3, 4, 5};  // 大小由初始化列表确定为5\n    \n    return 0;\n}"
  },
  {
    "id": 20,
    "question": "以下代码执行后，输出结果是？\n\n<C>\nint a[5] = {1, 2, 3, 4, 5};\nint max = a[0];\nfor(int i = 1; i < 5; i++) {\n    if(a[i] > max) {\n        max = a[i];\n    }\n}\nprintf(\\\"%d\\\", max);\n</C>",
    "options": ["`1`", "`3`", "`5`", "编译错误"],
    "correctAnswer": 2,
    "explanation": "这段代码找出数组中的最大值。初始 `max=a[0]=1`，然后依次比较 `a[1]=2, a[2]=3, a[3]=4, a[4]=5`，每次发现更大的值就更新 `max`。最终 `max=5`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[5] = {1, 2, 3, 4, 5};\n    int max = a[0];\n    \n    // 找出数组中的最大值\n    for(int i = 1; i < 5; i++) {\n        if(a[i] > max) {\n            max = a[i];\n        }\n    }\n    \n    printf(\"数组中的最大值: %d\\n\", max);  // 输出：数组中的最大值: 5\n    \n    return 0;\n}"
  },
  {
    "id": 21,
    "question": "以下代码的运行结果是什么？\n\n<C>\nchar dest[5];\nchar src[] = \"HelloWorld\";  /* 10个字符+\\0 */\nstrcpy(dest, src);\nprintf(\"%s\", dest);\n</C>",
    "options": ["`Hello`", "`HelloWorld`", "缓冲区溢出（崩溃或随机行为）", "编译错误"],
    "correctAnswer": 2,
    "explanation": "这是**strcpy缓冲区溢出**的经典漏洞！`dest`只有5字节，但`src`需要11字节（10字符+\\0）。`strcpy`不检查目标缓冲区大小，会**越界写入**6个字节，覆盖dest后面的内存，导致**栈破坏、程序崩溃、或被利用执行恶意代码**。**真实危害**：历史上大量安全漏洞源于此（如缓冲区溢出攻击）。**安全替代**：1) `strncpy(dest, src, sizeof(dest)-1)`；2) `snprintf(dest, sizeof(dest), \"%s\", src)`；3) 使用更安全的字符串库。**关键教训**：永远检查缓冲区边界！",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char dest[5];\n    char src[] = \"HelloWorld\";  /* 需要11字节 */\n    \n    /* 危险：strcpy不检查大小 */\n    /* strcpy(dest, src);  缓冲区溢出！ */\n    \n    /* 安全做法1: strncpy */\n    strncpy(dest, src, sizeof(dest) - 1);\n    dest[sizeof(dest) - 1] = '\\0';  /* 确保结尾 */\n    printf(\"截断后: %s\\n\", dest);  /* 输出: Hell */\n    \n    /* 安全做法2: snprintf */\n    char dest2[5];\n    snprintf(dest2, sizeof(dest2), \"%s\", src);\n    printf(\"snprintf: %s\\n\", dest2);  /* 输出: Hell */\n    \n    /* 检查是否截断 */\n    if (strlen(src) >= sizeof(dest)) {\n        printf(\"警告：源字符串过长！\\n\");\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 22,
    "question": "以下代码执行后，输出结果是？\n\n<C>\nchar str1[10] = \\\"Hello\\\";\nchar str2[10];\nstrncpy(str2, str1, 3);\nstr2[3] = '\\\\0';\nprintf(\\\"%s\\\", str2);\n</C>",
    "options": ["`Hello`", "`Hel`", "`Hell`", "未定义行为"],
    "correctAnswer": 1,
    "explanation": "`strncpy()` 函数复制指定数量的字符。这里复制了3个字符 `'H', 'e', 'l'` 到 `str2` 中，然后手动添加 `'\\\\0'` 作为字符串结束符。所以 `str2` 的内容是 `\\\"Hel\\\"`。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str1[10] = \"Hello\";\n    char str2[10];\n    \n    // 复制前3个字符\n    strncpy(str2, str1, 3);\n    \n    // 手动添加字符串结束符\n    str2[3] = '\\0';\n    \n    printf(\"str2 = %s\\n\", str2);  // 输出：str2 = Hel\n    \n    // 如果不手动添加'\\0'，输出可能不正确\n    strncpy(str2, str1, 3);\n    printf(\"未添加'\\\\0'时的str2: %s\\n\", str2);  // 输出可能不正确\n    \n    return 0;\n}"
  },
  {
    "id": 23,
    "question": "以下关于二维数组作为函数参数的说法，正确的是？",
    "options": ["`void func(int a[][]);`", "`void func(int a[3][]);`", "`void func(int a[][3]);`", "`void func(int a[][]);`"],
    "correctAnswer": 2,
    "explanation": "选项C正确：二维数组作为函数参数时，第一维可以省略，但第二维必须指定。选项A和B错误：第二维不能省略。选项D错误：两维都不能省略。",
    "codeExample": "#include <stdio.h>\n\n// 正确的二维数组参数声明\nvoid printArray(int a[][3], int rows) {\n    for(int i = 0; i < rows; i++) {\n        for(int j = 0; j < 3; j++) {\n            printf(\"%d \", a[i][j]);\n        }\n        printf(\"\\n\");\n    }\n}\n\nint main() {\n    int a[2][3] = {{1, 2, 3}, {4, 5, 6}};\n    \n    printArray(a, 2);  // 传递二维数组\n    \n    return 0;\n}"
  },
  {
    "id": 24,
    "question": "以下代码执行后，输出结果是？\n\n<C>\nint a[] = {5, 4, 3, 2, 1};\nint temp;\nfor(int i = 0; i < 2; i++) {\n    temp = a[i];\n    a[i] = a[4-i];\n    a[4-i] = temp;\n}\nprintf(\\\"%d %d\\\", a[0], a[4]);\n</C>",
    "options": ["`1 5`", "`5 1`", "`4 2`", "`2 4`"],
    "correctAnswer": 0,
    "explanation": "这段代码实现了数组前半部分和后半部分的交换。原始数组：`{5, 4, 3, 2, 1}`\n第一次循环 `(i=0)`：交换 `a[0]` 和 `a[4]`，数组变为 `{1, 4, 3, 2, 5}`\n第二次循环 `(i=1)`：交换 `a[1]` 和 `a[3]`，数组变为 `{1, 2, 3, 4, 5}`\n所以 `a[0]=1, a[4]=5`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[] = {5, 4, 3, 2, 1};\n    int temp;\n    \n    // 输出原始数组\n    printf(\"原始数组: \");\n    for(int i = 0; i < 5; i++) {\n        printf(\"%d \", a[i]);\n    }\n    printf(\"\\n\");\n    \n    // 交换数组前半部分和后半部分\n    for(int i = 0; i < 2; i++) {\n        temp = a[i];\n        a[i] = a[4-i];\n        a[4-i] = temp;\n    }\n    \n    // 输出交换后的数组\n    printf(\"交换后数组: \");\n    for(int i = 0; i < 5; i++) {\n        printf(\"%d \", a[i]);\n    }\n    printf(\"\\n\");\n    \n    printf(\"a[0] = %d, a[4] = %d\\n\", a[0], a[4]);  // 输出：a[0] = 1, a[4] = 5\n    \n    return 0;\n}"
  },
  {
    "id": 25,
    "question": "以下哪个函数可以查找字符串中的子串？",
    "options": ["`strstr()`", "`strchr()`", "`strcmp()`", "`strlen()`"],
    "correctAnswer": 0,
    "explanation": "选项A正确：`strstr()` 函数用于在一个字符串中查找另一个字符串（子串）首次出现的位置。选项B错误：`strchr()` 函数查找字符在字符串中首次出现的位置。选项C错误：`strcmp()` 比较两个字符串。选项D错误：`strlen()` 计算字符串长度。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str[] = \"Hello World\";\n    char substr[] = \"World\";\n    \n    // 查找子串\n    char *result = strstr(str, substr);\n    \n    if(result != NULL) {\n        printf(\"找到子串: %s\\n\", result);  // 输出：找到子串: World\n        printf(\"子串位置: %ld\\n\", result - str);  // 输出：子串位置: 6\n    } else {\n        printf(\"未找到子串\\n\");\n    }\n    \n    // 查找不存在的子串\n    char *notFound = strstr(str, \"Python\");\n    if(notFound == NULL) {\n        printf(\"未找到子串: Python\\n\");\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 26,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint a[5] = {1, 2, 3, 4, 5};\nint *p = a + 2;  /* p指向a[2] */\nprintf(\"%d %d %d\", p[-1], p[0], p[1]);\n</C>",
    "options": ["`1 2 3`", "`2 3 4`", "`3 4 5`", "未定义行为"],
    "correctAnswer": 1,
    "explanation": "这是**数组指针算术**的灵活运用！`p=a+2`使p指向`a[2]=3`。指针下标可以是负数：`p[-1]`等价于`*(p-1)`即`a[1]=2`，`p[0]`等价于`*p`即`a[2]=3`，`p[1]`等价于`*(p+1)`即`a[3]=4`。输出`2 3 4`。**关键知识**：1) `p[i]`等价于`*(p+i)`；2) i可以为负数（只要不越界）；3) `&a[i]`等价于`a+i`。**易错点**：误以为负数下标非法。**实际应用**：滑动窗口算法、双向遍历等。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a[5] = {1, 2, 3, 4, 5};\n    int *p = a + 2;  /* p指向a[2]=3 */\n    \n    /* 指针下标可以为负数 */\n    printf(\"p[-2]=%d\\n\", p[-2]);  /* a[0]=1 */\n    printf(\"p[-1]=%d\\n\", p[-1]);  /* a[1]=2 */\n    printf(\"p[0]=%d\\n\",  p[0]);   /* a[2]=3 */\n    printf(\"p[1]=%d\\n\",  p[1]);   /* a[3]=4 */\n    printf(\"p[2]=%d\\n\",  p[2]);   /* a[4]=5 */\n    \n    /* 等价表达式 */\n    printf(\"\\n等价验证:\\n\");\n    printf(\"p[1] = %d\\n\", p[1]);    /* 4 */\n    printf(\"*(p+1) = %d\\n\", *(p+1));  /* 4 */\n    printf(\"a[3] = %d\\n\", a[3]);    /* 4 */\n    \n    return 0;\n}"
  },
  {
    "id": 27,
    "question": "以下关于数组指针的说法，正确的是？",
    "options": ["`int *p[5];` 定义了一个包含5个指针的数组", "`int (*p)[5];` 定义了一个包含5个指针的数组", "`int *p[5];` 和 `int (*p)[5];` 是等价的", "数组指针和指针数组是同一个概念"],
    "correctAnswer": 0,
    "explanation": "选项A正确：`int *p[5];` 定义了一个包含5个指针的数组（指针数组）。选项B错误：`int (*p)[5];` 定义了一个指向包含5个整数的数组的指针（数组指针）。选项C错误：两者不等价。选项D错误：数组指针和指针数组是不同的概念。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 1, b = 2, c = 3, d = 4, e = 5;\n    \n    // 指针数组：包含5个指针的数组\n    int *p_arr[5] = {&a, &b, &c, &d, &e};\n    \n    // 数组指针：指向包含5个整数的数组的指针\n    int arr[5] = {10, 20, 30, 40, 50};\n    int (*p_arr_ptr)[5] = &arr;\n    \n    // 使用指针数组\n    printf(\"指针数组:\\n\");\n    for(int i = 0; i < 5; i++) {\n        printf(\"*p_arr[%d] = %d\\n\", i, *p_arr[i]);\n    }\n    \n    // 使用数组指针\n    printf(\"\\n数组指针:\\n\");\n    for(int i = 0; i < 5; i++) {\n        printf(\"(*p_arr_ptr)[%d] = %d\\n\", i, (*p_arr_ptr)[i]);\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 28,
    "question": "以下代码能正常运行吗？\n\n<C>\nchar a[] = \"Hello\";\nchar *p = \"Hello\";\na = \"World\";  /* 重新赋值数组 */\np = \"World\";  /* 重新赋值指针 */\nprintf(\"%s %s\", a, p);\n</C>",
    "options": ["`World World`", "`Hello World`", "编译错误（a不能重新赋值）", "`Hello Hello`"],
    "correctAnswer": 2,
    "explanation": "这是**字符数组与字符指针**的本质区别陷阱！`char a[]=\"Hello\"`中，a是**数组名**，是**常量**（代表数组首地址），**不能被重新赋值**。`a=\"World\"`编译错误。`char *p=\"Hello\"`中，p是**指针变量**，可以重新赋值指向其他字符串。`p=\"World\"`合法。**关键区别**：1) 数组名是常量，指针是变量；2) `sizeof(a)`=6，`sizeof(p)`=4/8（指针大小）；3) a在栈上分配内存，p指向常量区。**易错点**：误以为数组和指针完全等价。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char a[] = \"Hello\";  /* 数组，内容在栈上 */\n    char *p = \"Hello\";   /* 指针，指向常量区 */\n    \n    /* 错误：数组名不能重新赋值 */\n    /* a = \"World\";  编译错误！ */\n    \n    /* 正确：修改数组内容 */\n    strcpy(a, \"World\");  /* 合法 */\n    printf(\"a=%s\\n\", a);  /* 输出: World */\n    \n    /* 正确：指针重新赋值 */\n    p = \"World\";  /* 合法，改变指向 */\n    printf(\"p=%s\\n\", p);  /* 输出: World */\n    \n    /* 大小差异 */\n    printf(\"sizeof(a)=%zu\\n\", sizeof(a));  /* 6 */\n    printf(\"sizeof(p)=%zu\\n\", sizeof(p));  /* 4或8 */\n    \n    return 0;\n}"
  },
  {
    "id": 29,
    "question": "以下哪个函数可以将字符串转换成浮点数？",
    "options": ["`atof()`", "`atoi()`", "`strlen()`", "`strcmp()`"],
    "correctAnswer": 0,
    "explanation": "选项A正确：`atof()` 函数将字符串转换为浮点数。选项B错误：`atoi()` 将字符串转换为整数。选项C错误：`strlen()` 计算字符串长度。选项D错误：`strcmp()` 比较字符串。",
    "codeExample": "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    char str1[] = \"123.456\";\n    char str2[] = \"-78.9\";\n    \n    // 将字符串转换为浮点数\n    double num1 = atof(str1);\n    double num2 = atof(str2);\n    \n    printf(\"%s -> %.3f\\n\", str1, num1);  // 输出：123.456 -> 123.456\n    printf(\"%s -> %.1f\\n\", str2, num2);  // 输出：-78.9 -> -78.9\n    \n    // 计算两数之和\n    printf(\"Sum: %.3f\\n\", num1 + num2);  // 输出：Sum: 44.556\n    \n    return 0;\n}"
  },
  {
    "id": 30,
    "question": "以下代码执行后，输出结果是？\n\n<C>\nchar str1[10] = \\\"Hello\\\";\nchar str2[10] = \\\"World\\\";\nif(strcmp(str1, str2) > 0) {\n    printf(\\\"1\\\");\n} else if(strcmp(str1, str2) < 0) {\n    printf(\\\"-1\\\");\n} else {\n    printf(\\\"0\\\");\n}\n</C>",
    "options": ["`1`", "`-1`", "`0`", "编译错误"],
    "correctAnswer": 1,
    "explanation": "`strcmp()` 函数比较两个字符串。当第一个字符串小于第二个字符串时，返回负数；当第一个字符串大于第二个字符串时，返回正数；当两个字符串相等时，返回0。`\\\"Hello\\\"` 小于 `\\\"World\\\"` (按字典序)，所以 `strcmp(str1, str2) < 0`，输出 `-1`。",
    "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str1[10] = \"Hello\";\n    char str2[10] = \"World\";\n    \n    // 比较字符串\n    int result = strcmp(str1, str2);\n    \n    printf(\"strcmp(\\\"Hello\\\", \\\"World\\\") = %d\\n\", result);\n    \n    if(result > 0) {\n        printf(\"1\\n\");\n    } else if(result < 0) {\n        printf(\"-1\\n\");  // 输出：-1\n    } else {\n        printf(\"0\\n\");\n    }\n    \n    // 更多比较示例\n    printf(\"strcmp(\\\"World\\\", \\\"Hello\\\") = %d\\n\", strcmp(\"World\", \"Hello\"));\n    printf(\"strcmp(\\\"Hello\\\", \\\"Hello\\\") = %d\\n\", strcmp(\"Hello\", \"Hello\"));\n    \n    return 0;\n}"
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
            this.normalizeQuestions(this.questions);
        } catch (error) {
            console.error('导入题库失败:', error);
        }
    }
}

// 创建全局实例
window.templateLoader = new TemplateLoader();
