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
        "id": 3,
        "question": "以下哪个 `main` 函数的定义是正确的？",
        "options": ["`void main() { }`", "`int main() { return 0; }`", "`main() { }`", "`int Main() { return 0; }`"],
        "correctAnswer": 1,
        "explanation": "C标准规定 `main` 函数的返回类型必须是 `int`。`void main()` 不符合标准（某些编译器允许但不可移植）。`main()` 在C89中隐式返回int但C99后不合法。`Main()` 大写M不是程序入口。「易错点」：1) `void main()` 在VC++中能编译但不符合标准；2) C语言区分大小写，`Main` ≠ `main`；3) 省略返回类型在C99后非法。",
        "codeExample": "#include <stdio.h>\n\n/* 正确写法 */\nint main() {\n    printf(\"Hello\\n\");\n    return 0;  /* 返回0表示成功 */\n}\n\n/* 错误写法 */\n/* void main() { }  不符合C标准 */\n/* main() { }       C99后不合法 */\n/* int Main() { }   不是程序入口 */"
    },
    {
        "id": 5,
        "question": "以下代码能否正确编译？为什么？\n\n<C>\n#include <stdio.h>\nint main() {\n    printf(\"%d\", sqrt(25));\n    return 0;\n}\n</C>",
        "options": ["能编译，输出5", "不能编译，缺少 `#include <math.h>`", "能编译，但输出0", "能编译，但输出随机值"],
        "correctAnswer": 1,
        "explanation": "这是「头文件依赖」的常见陷阱！`sqrt()` 函数声明在 `<math.h>` 中，不在 `<stdio.h>` 中。缺少 `<math.h>` 会导致编译器不知道 `sqrt` 的函数原型。「易错点」：1) 误以为 `<stdio.h>` 包含所有常用函数；2) 即使编译器隐式声明 `sqrt`（C89允许），参数类型不匹配也会导致错误结果；3) 使用 `gcc` 编译时还需加 `-lm` 链接数学库。「教训」：每个库函数都需要包含对应的头文件。",
        "codeExample": "#include <stdio.h>\n#include <math.h>  /* 必须包含！sqrt在这里声明 */\n\nint main() {\n    /* 缺少math.h时：编译器不认识sqrt */\n    printf(\"sqrt(25) = %.0f\\n\", sqrt(25));  /* 5 */\n    \n    /* 常见头文件与函数对应： */\n    /* stdio.h  -> printf, scanf, fopen */\n    /* math.h   -> sqrt, pow, sin, cos */\n    /* string.h -> strlen, strcpy, strcmp */\n    /* stdlib.h -> malloc, free, atoi */\n    return 0;\n}"
    },
    {
        "id": 8,
        "question": "1KB（千字节）等于多少字节（Byte）？",
        "options": ["`1000`", "`1024`", "`512`", "`2048`"],
        "correctAnswer": 1,
        "explanation": "计算机中的单位换算：1KB = 1024字节，1MB = 1024KB，1GB = 1024MB。注意这里使用的是1024（2¹⁰），而不是十进制的1000。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"数据单位换算:\\n\");\n    printf(\"1 KB = 1024 字节\\n\");\n    printf(\"1 MB = 1024 KB\\n\");\n    printf(\"1 GB = 1024 MB\\n\");\n    return 0;\n}"
    },
    {
        "id": 9,
        "question": "以下代码中，哪一行会导致编译错误？\n\n<C>\nint mian() {        /* 第1行 */\n    printf(\"Hello\");  /* 第2行 */\n    return 0;          /* 第3行 */\n}                      /* 第4行 */\n</C>",
        "options": ["第1行", "第2行", "第3行", "第4行"],
        "correctAnswer": 0,
        "explanation": "第1行的 `mian` 拼写错误！正确的入口函数名是 `main`。`mian` 不是C语言的保留字或标准函数名，编译器会将其视为普通函数，但缺少 `main` 函数会导致链接错误。",
        "codeExample": "#include <stdio.h>\n\n/* 错误：mian拼写错误 */\n/* int mian() {  */\n\n/* 正确：main才是入口函数 */\nint main() {\n    printf(\"Hello\\n\");\n    return 0;\n}"
    },
    {
        "id": 10,
        "question": "以下哪种错误是「程序语法正确，但执行时出现问题」（如除以零）？",
        "options": ["语法错误", "运行时错误", "逻辑错误", "编译错误"],
        "correctAnswer": 1,
        "explanation": "运行时错误（Runtime Error）：程序语法正确，但执行时出现问题。例如除以零、数组越界、内存访问错误等。语法错误/编译错误在编译时就能发现，逻辑错误是结果不符合预期但程序不会崩溃。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 10, b = 0;\n    /* 运行时错误：除以零！语法正确但执行时崩溃 */\n    /* int c = a / b; */\n    \n    /* 正确做法：检查除数 */\n    if (b != 0) {\n        int c = a / b;\n        printf(\"%d\\n\", c);\n    } else {\n        printf(\"错误：除数不能为零\\n\");\n    }\n    return 0;\n}"
    },
    {
        "id": 11,
        "question": "以下代码的输出结果是什么？\n\n<C>\nprintf(\"Hello\\0World\");\n</C>",
        "options": ["`HelloWorld`", "`Hello`", "`Hello\\0World`", "编译错误"],
        "correctAnswer": 1,
        "explanation": "这是「`\\0`空字符截断输出」的陷阱！`\\0`是字符串结束标志，`printf`的`%s`格式遇到`\\0`就停止输出。所以只输出`Hello`，`World`不会被输出。「易错点」：1) 误以为`\\0`会原样输出；2) `\\0`和`0`不同：`\\0`是空字符（ASCII码0），`0`是数字字符（ASCII码48）；3) C语言所有字符串都以`\\0`结尾，这是字符串处理函数判断结束的依据。",
        "codeExample": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    /* \\\\0截断输出 */\n    printf(\"输出: %s\\n\", \"Hello\\0World\");  /* 只输出Hello */\n    \n    /* sizeof vs strlen */\n    char str[] = \"Hello\\0World\";\n    printf(\"sizeof: %zu\\n\", sizeof(str));   /* 12(含末尾\\\\0) */\n    printf(\"strlen: %zu\\n\", strlen(str));   /* 5(遇到第一个\\\\0停止) */\n    \n    /* \\\\0和0的区别 */\n    printf(\"'\\\\0'的ASCII: %d\\n\", '\\0');   /* 0 */\n    printf(\"'0'的ASCII: %d\\n\", '0');     /* 48 */\n    \n    return 0;\n}"
    },
    {
        "id": 12,
        "question": "在VC++2010中，建议初学者使用哪个快捷键来运行程序（避免窗口一闪而过）？",
        "options": ["F5", "Ctrl+F5", "F7", "Ctrl+F7"],
        "correctAnswer": 1,
        "explanation": "F5是「开始调试」，程序运行后会立即关闭窗口。Ctrl+F5是「开始执行（不调试）」，程序执行完毕后会显示\"按任意键继续...\"，方便查看输出结果。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    /* 使用Ctrl+F5运行，窗口不会一闪而过 */\n    return 0;\n}"
    },
    {
        "id": 13,
        "question": "以下哪个是C语言中正确的多行注释？",
        "options": ["`<!-- 注释 -->`", "`/* 注释 */`", "`// 注释 //`", "`# 注释 #`"],
        "correctAnswer": 1,
        "explanation": "C语言的注释有两种：1.多行注释 `/* ... */`，可以跨越多行；2.单行注释 `// ...`，从//到行尾都是注释。`<!-- -->` 是HTML注释，`#` 是预处理指令前缀不是注释。",
        "codeExample": "#include <stdio.h>\n\n/* 这是多行注释\n   可以写多行\n   用于详细说明 */\n\nint main() {\n    // 这是单行注释\n    printf(\"注释示例\\n\");\n    return 0;\n}"
    },
    {
        "id": 14,
        "question": "`return 0;` 在 `main` 函数中的作用是什么？",
        "options": ["结束程序并返回0给操作系统，表示程序正常结束", "返回0给printf函数", "删除程序", "重新启动程序"],
        "correctAnswer": 0,
        "explanation": "`return 0;` 在main函数中表示程序正常结束，向操作系统返回0。返回0表示成功，返回非0值通常表示程序出现了某种错误。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"程序开始\\n\");\n    return 0;  /* 程序正常结束，返回0 */\n}"
    },
    {
        "id": 15,
        "question": "关于进程和程序的说法，正确的是？",
        "options": ["程序是动态的，进程是静态的", "程序存储在内存中，进程存储在硬盘上", "程序是静态的代码文件，进程是程序运行时的动态实例", "一个程序只能产生一个进程"],
        "correctAnswer": 2,
        "explanation": "程序是静态的代码文件，存储在磁盘上；进程是程序运行时的动态实例，存在于内存中。一个程序可以产生多个进程（如同时打开多个浏览器窗口）。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    /* 这个程序运行时就是一个进程 */\n    printf(\"程序 vs 进程:\\n\");\n    printf(\"程序: 静态代码文件(磁盘)\\n\");\n    printf(\"进程: 运行时的实例(内存)\\n\");\n    return 0;\n}"
    },
    {
        "id": 16,
        "question": "在C语言中，`int` 类型通常占用多少个字节？",
        "options": ["`1`", "`2`", "`4`", "`8`"],
        "correctAnswer": 2,
        "explanation": "在大多数现代计算机上（32位和64位系统），`int` 类型占用4个字节（32位），能表示的范围大约是-21亿到+21亿。可以使用 `sizeof(int)` 来查看具体字节数。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"int占用 %zu 字节\\n\", sizeof(int));   /* 通常输出4 */\n    printf(\"char占用 %zu 字节\\n\", sizeof(char));  /* 输出1 */\n    printf(\"double占用 %zu 字节\\n\", sizeof(double)); /* 通常输出8 */\n    return 0;\n}"
    },
    {
        "id": 17,
        "question": "以下哪个是C语言源代码文件的扩展名？",
        "options": ["`.cpp`", "`.java`", "`.c`", "`.py`"],
        "correctAnswer": 2,
        "explanation": "C语言源代码文件使用 `.c` 扩展名。`.cpp` 是C++源文件，`.java` 是Java源文件，`.py` 是Python源文件。虽然VC++2010是C++编译器，但将文件保存为 `.c` 扩展名，编译器会按C语言规则编译。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"C语言源文件扩展名: .c\\n\");\n    printf(\"C++源文件扩展名: .cpp\\n\");\n    printf(\"头文件扩展名: .h\\n\");\n    return 0;\n}"
    },
    {
        "id": 18,
        "question": "以下关于操作系统的说法，错误的是？",
        "options": ["操作系统管理计算机硬件与软件资源", "操作系统是用户与计算机硬件之间的桥梁", "操作系统只负责管理硬件，不管理软件", "操作系统提供文件管理功能"],
        "correctAnswer": 2,
        "explanation": "操作系统的核心功能包括：处理器管理、存储管理、文件管理和设备管理。它既管理硬件也管理软件资源，是用户与计算机硬件之间的桥梁。选项C说\"只负责管理硬件\"是错误的。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"操作系统核心功能:\\n\");\n    printf(\"1. 处理器管理\\n\");\n    printf(\"2. 存储管理\\n\");\n    printf(\"3. 文件管理\\n\");\n    printf(\"4. 设备管理\\n\");\n    return 0;\n}"
    },
    {
        "id": 19,
        "question": "以下代码缺少什么才能正确编译？\n\n<C>\nint main() {\n    printf(\"Hello\");\n    return 0;\n}\n</C>",
        "options": ["缺少变量声明", "缺少 `#include <stdio.h>`", "缺少分号", "缺少注释"],
        "correctAnswer": 1,
        "explanation": "使用 `printf` 函数必须包含 `<stdio.h>` 头文件。没有这个头文件，编译器不认识 `printf` 函数，会报编译错误。这是一个初学者最常犯的错误之一。",
        "codeExample": "#include <stdio.h>  /* 必须包含这个头文件 */\n\nint main() {\n    printf(\"Hello\\n\");\n    return 0;\n}"
    },
    {
        "id": 20,
        "question": "以下哪种情况属于「逻辑错误」？",
        "options": ["忘记写分号", "变量名拼写错误", "计算圆面积时公式写成了 `pi*r*r*r`", "缺少头文件"],
        "correctAnswer": 2,
        "explanation": "逻辑错误是程序能运行，但结果不符合预期。公式写成 `pi*r*r*r` 是把面积公式 `pi*r*r` 写错了，程序能运行但结果不正确。其他选项都是编译错误，程序无法生成。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    double r = 5.0;\n    double pi = 3.14159;\n    \n    /* 逻辑错误：面积公式写错 */\n    /* double area = pi * r * r * r; */\n    \n    /* 正确的面积公式 */\n    double area = pi * r * r;\n    printf(\"圆面积: %.2f\\n\", area);\n    return 0;\n}"
    },
    {
        "id": 21,
        "question": "1个字节（Byte）由多少个二进制位（bit）组成？",
        "options": ["`4`", "`8`", "`16`", "`32`"],
        "correctAnswer": 1,
        "explanation": "1个字节 = 8个二进制位（bit）。因此1个字节可以表示0-255之间的256种状态。这是计算机存储的基本单位。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"1 字节 = 8 位\\n\");\n    printf(\"1 个字节可表示: 0~255\\n\");\n    printf(\"char 类型占 1 字节\\n\");\n    return 0;\n}"
    },
    {
        "id": 22,
        "question": "以下代码的输出是什么？\n\n<C>\nint i = 1;\nint j = i++ + i++;\nprintf(\"%d %d\", i, j);\n</C>",
        "options": ["`3 2`", "`3 3`", "未定义行为", "`2 2`"],
        "correctAnswer": 2,
        "explanation": "这是「序列点」的经典陷阱！在同一表达式中对同一变量多次修改是「未定义行为」。`i++ + i++` 中 `i` 被修改了两次，两次修改之间没有序列点。「易错点」：1) 不同编译器可能给出不同结果（2、3等）；2) C标准规定这是未定义行为，任何结果都是可能的；3) 类似的还有 `a[i] = i++`、`f(i++, i++)` 等。「规则」：在两个序列点之间，同一变量的值最多只能被修改一次。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int i = 1;\n    \n    /* 未定义行为！i被修改两次 */\n    /* int j = i++ + i++;  不同编译器结果不同 */\n    \n    /* 正确写法：分开操作 */\n    int a = i++;  /* a=1, i=2 */\n    int b = i++;  /* b=2, i=3 */\n    printf(\"i=%d, a+b=%d\\n\", i, a+b);  /* i=3, a+b=3 */\n    \n    /* 其他未定义行为示例： */\n    /* a[i] = i++;          未定义行为 */\n    /* printf(\"%d %d\", i++, i++);  未定义行为 */\n    return 0;\n}"
    },
    {
        "id": 23,
        "question": "在VC++2010中创建C语言项目时，为什么要把文件扩展名改为 `.c`？",
        "options": ["`.cpp` 扩展名无法编译", "让编译器按C语言规则编译，而不是C++规则", "`.c` 文件占用空间更小", "`.c` 文件运行速度更快"],
        "correctAnswer": 1,
        "explanation": "VC++2010是C++编译器，但完全兼容C语言。将文件保存为 `.c` 扩展名，编译器会按C语言规则编译；保存为 `.cpp` 则按C++规则编译。两者语法有差异，初学C语言应使用 `.c` 扩展名。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"文件扩展名说明:\\n\");\n    printf(\".c  -> C语言源文件\\n\");\n    printf(\".cpp -> C++源文件\\n\");\n    printf(\".h  -> 头文件\\n\");\n    return 0;\n}"
    },
    {
        "id": 24,
        "question": "以下哪个不属于计算机的输入设备？",
        "options": ["键盘", "鼠标", "显示器", "扫描仪"],
        "correctAnswer": 2,
        "explanation": "输入设备用于向计算机输入数据，包括键盘、鼠标、扫描仪等。显示器是输出设备，用于显示处理结果给用户看。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"输入设备: 键盘、鼠标、扫描仪\\n\");\n    printf(\"输出设备: 显示器、打印机、音箱\\n\");\n    return 0;\n}"
    },
    {
        "id": 25,
        "question": "以下代码的输出是什么？\n\n<C>\n#include <stdio.h>\nint main() {\n    printf(\"Hello\");\n    printf(\"World\");\n    return 0;\n}\n</C>",
        "options": ["`Hello` 和 `World` 分两行显示", "`HelloWorld`（在同一行）", "`Hello World`（中间有空格）", "编译错误"],
        "correctAnswer": 1,
        "explanation": "两个 `printf` 之间没有 `\\n` 换行符，所以 \"Hello\" 和 \"World\" 会在同一行紧挨着输出，结果为 \"HelloWorld\"。要换行需要加 `\\n`。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    /* 没有换行，输出在同一行 */\n    printf(\"Hello\");\n    printf(\"World\");\n    /* 输出: HelloWorld */\n    \n    printf(\"\\n\");  /* 换行 */\n    \n    /* 有换行，输出在不同行 */\n    printf(\"Hello\\n\");\n    printf(\"World\\n\");\n    /* 输出:\n       Hello\n       World */\n    return 0;\n}"
    },
    {
        "id": 26,
        "question": "关于算法的说法，错误的是？",
        "options": ["算法必须在有限步骤内结束", "算法的每一步都必须有明确的含义", "算法可以没有输出", "算法的每一步都必须是可以执行的"],
        "correctAnswer": 2,
        "explanation": "算法的五个特征：有穷性（有限步骤内结束）、确定性（每步有明确含义）、可行性（每步可执行）、输入（零个或多个输入）、输出（一个或多个输出）。算法必须有输出，没有输出的算法没有意义。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    /* 一个简单的算法：求两数之和 */\n    int a = 3, b = 5;\n    int sum = a + b;  /* 步骤1：计算 */\n    printf(\"%d\\n\", sum);  /* 步骤2：输出（必须有输出） */\n    return 0;\n}"
    },
    {
        "id": 27,
        "question": "以下哪个是「编译错误」的例子？",
        "options": ["计算结果不正确", "除以零导致程序崩溃", "`printf` 语句末尾忘记写分号", "程序陷入死循环"],
        "correctAnswer": 2,
        "explanation": "编译错误是代码语法有问题，编译器无法生成程序。忘记写分号是典型的编译错误。A是逻辑错误，B是运行时错误，D也是逻辑错误（程序能运行但行为不对）。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    /* 编译错误：缺少分号 */\n    /* printf(\"Hello\")  */\n    \n    /* 正确写法 */\n    printf(\"Hello\\n\");  /* 末尾必须有分号 */\n    return 0;\n}"
    },
    {
        "id": 28,
        "question": "以下哪个文件是C语言编译后链接生成的最终文件？",
        "options": ["`.c` 源文件", "`.obj` 目标文件", "`.exe` 可执行文件", "`.h` 头文件"],
        "correctAnswer": 2,
        "explanation": "开发流程：源代码(.c) → 编译 → 目标文件(.obj) → 链接 → 可执行文件(.exe)。`.exe` 是链接后生成的最终可执行文件，双击即可运行。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    printf(\"文件类型说明:\\n\");\n    printf(\".c   -> 源代码文件\\n\");\n    printf(\".obj -> 编译后的目标文件\\n\");\n    printf(\".exe -> 链接后的可执行文件\\n\");\n    return 0;\n}"
    },
    {
        "id": 29,
        "question": "在调试程序时，「设置断点」的作用是什么？",
        "options": ["删除代码", "让程序执行到断点处暂停，方便观察变量值", "加快程序运行速度", "自动修复错误"],
        "correctAnswer": 1,
        "explanation": "断点是调试的基本工具，在代码某行设置断点后，程序运行到该行会暂停执行，此时可以查看变量值、单步执行等，帮助定位程序错误。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 10;     /* 可以在这里设置断点 */\n    int b = 20;     /* 观察a和b的值 */\n    int c = a + b;  /* 观察c的值 */\n    printf(\"%d\\n\", c);\n    return 0;\n}"
    },
    {
        "id": 30,
        "question": "以下关于变量命名规范的说法，正确的是？",
        "options": ["变量名可以用数字开头", "变量名可以使用C语言关键字（如int、float）", "变量名区分大小写，`Age` 和 `age` 是不同的变量", "变量名中可以包含空格"],
        "correctAnswer": 2,
        "explanation": "C语言变量命名规则：1.可用字母、数字、下划线；2.不能以数字开头；3.不能使用关键字；4.区分大小写；5.不能包含空格。所以 `Age` 和 `age` 是两个不同的变量。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    int age = 18;      /* 正确 */\n    int Age = 20;      /* 正确，且与age不同 */\n    /* int 2nd = 5;    错误：不能数字开头 */\n    /* int int = 10;   错误：不能用关键字 */\n    /* int my name=5;  错误：不能有空格 */\n    \n    printf(\"age=%d, Age=%d\\n\", age, Age);\n    return 0;\n}"
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