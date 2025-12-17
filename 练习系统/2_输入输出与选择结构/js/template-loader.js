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
    "question": "以下代码的输出结果是什么？\n\n<C>\nint num;\nchar ch;\nscanf(\"%d\", &num);  /* 输入: 123<回车> */\nscanf(\"%c\", &ch);\nprintf(\"%d\", (int)ch);\n</C>",
    "options": ["`123`", "`10`（换行符的ASCII码）", "`0`", "未定义行为"],
    "correctAnswer": 1,
    "explanation": "`scanf(\"%d\")` 读取整数时会留下换行符在缓冲区中。紧接着的 `scanf(\"%c\")` 会读取这个换行符（ASCII码为10），而不是用户后续输入的字符。这是非常常见的 `scanf` 缓冲区残留问题。解决方法：在 `%c` 前加空格（`scanf(\" %c\", &ch)`）让 scanf 跳过所有空白字符。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num;\n    char ch;\n    \n    printf(\"输入整数: \");\n    scanf(\"%d\", &num);      /* 输入123<回车>，缓冲区剩余'\\n' */\n    \n    printf(\"输入字符: \");\n    scanf(\"%c\", &ch);       /* 直接读到换行符 */\n    printf(\"字符ASCII: %d\\n\", (int)ch);  /* 输出: 10 */\n    \n    /* 正确做法1: 在%c前加空格 */\n    scanf(\" %c\", &ch);      /* 空格让scanf跳过所有空白字符 */\n    \n    /* 正确做法2: 手动清空缓冲区 */\n    while (getchar() != '\\n');\n    scanf(\"%c\", &ch);\n    \n    return 0;\n}"
  },
  {
    "id": 2,
    "question": "`scanf` 读整数后直接用 `%c` 读字符，会出现什么问题？",
    "options": ["程序崩溃", "读取到之前输入的换行符", "自动跳过空白字符", "读取随机字符"],
    "correctAnswer": 1,
    "explanation": "当使用 `scanf` 读取整数后，输入缓冲区中会留下换行符（回车键）。如果紧接着使用 `%c` 读取字符，会读取到这个换行符而不是用户实际输入的字符。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num;\n    char ch;\n    \n    printf(\"请输入一个整数: \");\n    scanf(\"%d\", &num);  // 输入: 123<回车>\n    \n    printf(\"请输入一个字符: \");\n    scanf(\"%c\", &ch);   // 这里会读取到换行符，而不是用户输入的字符\n    \n    printf(\"字符的ASCII码: %d\\n\", ch);  // 输出: 10 (换行符的ASCII码)\n    return 0;\n}"
  },
  {
    "id": 3,
    "question": "`printf` 中 `%*d` 的含义是？",
    "options": ["动态指定宽度输出整数", "固定宽度10输出整数", "跳过整数读取", "输出十六进制整数"],
    "correctAnswer": 0,
    "explanation": "`%*d` 中的 `*` 表示宽度由参数动态指定。需要在格式字符串后面提供一个整数参数来指定宽度。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 42;\n    int width = 8;\n    \n    printf(\"%*d\\n\", width, num);  // 输出: '      42' (前面有6个空格)\n    printf(\"%*d\\n\", 5, num);       // 输出: '   42' (前面有3个空格)\n    return 0;\n}"
  },
  {
    "id": 4,
    "question": "`printf` 中 `%f` 和 `%lf` 的关系是？",
    "options": ["`%f` 用于 `float`，`%lf` 用于 `double`", "两者都可用于 `double`，效果相同", "`%f` 用于 `double`，`%lf` 用于 `float`", "不能混合使用"],
    "correctAnswer": 1,
    "explanation": "在 `printf` 函数中，`%f` 和 `%lf` 都可以用于输出 `double` 类型，效果完全相同。但在 `scanf` 中，`%f` 用于 `float`，`%lf` 用于 `double`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    double d = 3.14159;\n    float f = 2.71828f;\n    \n    printf(\"使用%%f输出double: %f\\n\", d);    // 输出: 3.141590\n    printf(\"使用%%lf输出double: %lf\\n\", d);   // 输出: 3.141590\n    printf(\"使用%%f输出float: %f\\n\", f);     // 输出: 2.718280\n    return 0;\n}"
  },
  {
    "id": 5,
    "question": "`scanf` 中 `%*d` 的作用是？",
    "options": ["读取整数并存储", "跳过一个整数的读取", "读取整数前两位", "输出整数"],
    "correctAnswer": 1,
    "explanation": "`scanf` 中的 `*` 表示赋值抑制符，用于跳过对应输入项的读取，不会将读取的值存储到变量中。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b;\n    \n    printf(\"请输入三个整数: \");\n    scanf(\"%d%*d%d\", &a, &b);  // 输入: 10 20 30\n    \n    printf(\"a = %d, b = %d\\n\", a, b);  // 输出: a = 10, b = 30 (跳过了20)\n    return 0;\n}"
  },
  {
    "id": 6,
    "question": "`printf` 让整数左对齐，需用哪个修饰符？",
    "options": ["`+`", "`-`", "`0`", "`#`"],
    "correctAnswer": 1,
    "explanation": "`-` 修饰符用于左对齐输出。默认情况下，`printf` 使用右对齐。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 42;\n    \n    printf(\"右对齐: '%5d'\\n\", num);   // 输出: '   42'\n    printf(\"左对齐: '%-5d'\\n\", num);  // 输出: '42   '\n    return 0;\n}"
  },
  {
    "id": 7,
    "question": "`scanf(\"%s\")` 读字符串的安全风险是？",
    "options": ["无法读取数字", "读取到换行符", "输入过长导致缓冲区溢出", "只能读取单个字符"],
    "correctAnswer": 2,
    "explanation": "`scanf(\"%s\")` 不会检查输入字符串的长度，如果用户输入超过目标缓冲区大小的字符串，会导致缓冲区溢出，这是严重的安全漏洞。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char str[10];  // 只能存储9个字符+空字符\n    \n    // 危险：如果输入超过9个字符，会导致缓冲区溢出\n    scanf(\"%s\", str);\n    \n    // 更安全的做法：使用fgets或指定最大宽度\n    // scanf(\"%9s\", str);  // 限制最多读取9个字符\n    \n    printf(\"输入: %s\\n\", str);\n    return 0;\n}"
  },
  {
    "id": 8,
    "question": "`printf` 输出带前缀的十六进制（如 `0x1a`），用哪个格式符？",
    "options": ["`%x`", "`%X`", "`%#x`", "`%0x`"],
    "correctAnswer": 2,
    "explanation": "`#` 修饰符用于在八进制和十六进制输出前添加前缀（`0` 或 `0x`/`0X`）。`%#x` 输出小写十六进制带 `0x` 前缀，`%#X` 输出大写十六进制带 `0X` 前缀。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num = 26;\n    \n    printf(\"普通十六进制: %x\\n\", num);    // 输出: 1a\n    printf(\"带前缀十六进制: %#x\\n\", num);  // 输出: 0x1a\n    printf(\"大写带前缀: %#X\\n\", num);     // 输出: 0X1A\n    return 0;\n}"
  },
  {
    "id": 9,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint len = printf(\"Score: %d\", 95);\nprintf(\"\\n返回值: %d\", len);\n</C>",
    "options": ["`返回值: 0`", "`返回值: 95`", "`返回值: 10`", "`返回值: -1`"],
    "correctAnswer": 2,
    "explanation": "`printf` 函数的返回值是成功输出的字符数（不包括结尾的空字符）。`\"Score: 95\"` 共有10个字符（S、c、o、r、e、:、空格、9、5），所以返回10。这个返回值可用于检测输出是否成功，返回负数表示错误。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int len;\n    \n    /* printf返回输出的字符数 */\n    len = printf(\"Score: %d\", 95);  /* 输出10个字符 */\n    printf(\"\\n返回值: %d\\n\", len);   /* 输出: 10 */\n    \n    /* 应用:检测输出是否成功 */\n    len = printf(\"Hello\");\n    if (len < 0) {\n        fprintf(stderr, \"输出失败\\n\");\n    } else {\n        printf(\" - 成功输出%d个字符\\n\", len);\n    }\n    \n    /* 空字符串返回0 */\n    len = printf(\"\");\n    printf(\"空串返回: %d\\n\", len);   /* 输出: 0 */\n    \n    return 0;\n}"
  },
  {
    "id": 10,
    "question": "`printf` 中 `%.2f` 的含义是？",
    "options": ["宽度为2输出浮点数", "保留2位小数输出浮点数", "输出2个浮点数", "输出浮点数前2位"],
    "correctAnswer": 1,
    "explanation": "`.2` 表示精度，用于指定浮点数的小数位数。`%.2f` 表示保留2位小数输出浮点数。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    double pi = 3.14159;\n    \n    printf(\"默认输出: %f\\n\", pi);      // 输出: 3.141590\n    printf(\"保留2位小数: %.2f\\n\", pi);  // 输出: 3.14\n    printf(\"保留4位小数: %.4f\\n\", pi);  // 输出: 3.1416\n    return 0;\n}"
  },
  {
    "id": 11,
    "question": "以下代码存在什么安全问题？\n\n<C>\nchar name[20];\nprintf(\"输入姓名: \");\ngets(name);  /* 或 scanf(\"%s\", name) */\nprintf(name);  /* 直接用用户输入作为格式字符串 */\n</C>",
    "options": ["没有问题", "缓冲区溢出和格式化字符串漏洞", "只有缓冲区溢出风险", "只有格式化字符串风险"],
    "correctAnswer": 1,
    "explanation": "有两个严重安全问题：1) `gets()`/`scanf(\"%s\")` 不检查输入长度，可能导致缓冲区溢出；2) `printf(name)` 直接将用户输入作为格式字符串，如果输入包含 `%x`、`%n` 等格式说明符，攻击者可读取栈内存或写入任意地址。正确做法：`fgets(name, sizeof(name), stdin);` 和 `printf(\"%s\", name);`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char name[20];\n    int secret = 0x12345678;\n    \n    /* 危险代码演示 */\n    printf(\"输入姓名: \");\n    /* gets(name);  C11已废弃，极其危险 */\n    fgets(name, sizeof(name), stdin);  /* 正确做法 */\n    \n    /* 错误：用户输入作为格式字符串 */\n    /* printf(name);  如果输入\"%x %x %x\"可泄露栈数据 */\n    \n    /* 正确做法 */\n    printf(\"姓名: %s\", name);\n    \n    /* 演示格式化字符串漏洞 */\n    printf(\"\\n--- 格式化字符串漏洞演示 ---\\n\");\n    printf(\"如果输入包含%%x: \");\n    /* 攻击输入: %x %x %x */\n    /* 错误的printf(name)会泄露: 12345678 ... */\n    \n    return 0;\n}"
  },
  {
    "id": 12,
    "question": "`scanf` 读取两个用逗号分隔的整数（如 `10,20`），正确的格式是？",
    "options": ["`scanf(\"%d,%d\", &a, &b);`", "`scanf(\"%d %d\", &a, &b);`", "`scanf(\"%d-%d\", &a, &b);`", "`scanf(\"%d.%d\", &a, &b);`"],
    "correctAnswer": 0,
    "explanation": "`scanf` 的格式字符串需要与输入格式完全匹配。如果输入是用逗号分隔的，格式字符串中也必须包含逗号。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b;\n    \n    printf(\"请输入两个用逗号分隔的整数（如10,20）: \");\n    scanf(\"%d,%d\", &a, &b);  // 正确读取 10,20\n    \n    printf(\"a = %d, b = %d\\n\", a, b);\n    return 0;\n}"
  },
  {
    "id": 13,
    "question": "`getchar()` 和 `scanf(\"%c\")` 的主要区别是？",
    "options": ["`getchar()` 只能读取字母", "`getchar()` 不需要取地址符&", "`scanf` 更快", "两者完全相同"],
    "correctAnswer": 1,
    "explanation": "`getchar()` 返回读取的字符，不需要传递变量地址；而 `scanf(\"%c\")` 需要传递字符变量的地址（使用&符号）。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char ch1, ch2;\n    \n    printf(\"使用getchar(): \");\n    ch1 = getchar();  // 直接返回值，不需要&\n    getchar();  // 读取换行符\n    \n    printf(\"使用scanf(): \");\n    scanf(\"%c\", &ch1);  // 需要使用&传递地址\n    \n    printf(\"读取的字符: %c\\n\", ch1);\n    return 0;\n}"
  },
  {
    "id": 14,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint a, b;\nint ret = scanf(\"%d%d\", &a, &b);  /* 输入: 10 abc */\nprintf(\"%d %d %d\", ret, a, b);\n</C>",
    "options": ["`2 10 0`", "`1 10 <未定义>`", "`0 <未定义> <未定义>`", "`-1 <未定义> <未定义>`"],
    "correctAnswer": 1,
    "explanation": "`scanf` 返回成功读取并赋值的项目数。输入 `10 abc` 时，第一个 `%d` 成功读取10，第二个 `%d` 遇到 `abc` 失败，所以返回1。变量 `a` 被赋值为10，`b` 的值未被修改（可能是随机值）。**关键错误**：未检查 `scanf` 返回值就使用变量！正确做法应判断 `ret == 2` 才使用 `a` 和 `b`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = -1, b = -1;  /* 初始化避免未定义行为 */\n    int ret;\n    \n    printf(\"输入两个整数: \");\n    ret = scanf(\"%d%d\", &a, &b);  /* 输入: 10 abc */\n    \n    /* 错误: 不检查返回值直接使用 */\n    /* printf(\"%d %d\\n\", a, b);  b可能是随机值! */\n    \n    /* 正确: 检查返回值 */\n    if (ret == 2) {\n        printf(\"成功读取: %d %d\\n\", a, b);\n    } else {\n        printf(\"输入错误，只成功读取%d个整数\\n\", ret);\n        printf(\"a=%d, b=%d（b未被scanf修改）\\n\", a, b);\n        \n        /* 清空错误输入 */\n        while (getchar() != '\\n');\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 15,
    "question": "`scanf` 读取时如何跳过输入中的空白字符？",
    "options": ["`scanf` 会自动跳过空白字符（除了%c）", "必须使用特殊函数", "不能跳过空白字符", "需要手动清理缓冲区"],
    "correctAnswer": 0,
    "explanation": "`scanf` 在读取大多数类型（如 `%d`、`%f`、`%s`）时会自动跳过前导空白字符。但 `%c` 不会跳过，会读取任何字符包括空格和换行符。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b;\n    char ch;\n    \n    // 自动跳过空白\n    scanf(\"%d %d\", &a, &b);  // 输入: '10    20' 或 '10\\n20' 都可以\n    \n    // %c不跳过空白\n    scanf(\"%c\", &ch);  // 会读取前面的换行符\n    \n    // 强制跳过空白再读取字符\n    scanf(\" %c\", &ch);  // 注意%前面有空格，会跳过空白字符\n    \n    return 0;\n}"
  },
  {
    "id": 16,
    "question": "`printf` 中 `%e` 格式符的作用是？",
    "options": ["输出整数", "输出科学计数法表示的浮点数", "输出八进制", "输出字符"],
    "correctAnswer": 1,
    "explanation": "`%e` 用于以科学计数法（指数形式）输出浮点数，格式为 `[-]d.ddde±dd`。`%E` 则输出大写的 `E`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    double num = 12345.6789;\n    \n    printf(\"普通格式: %f\\n\", num);      // 输出: 12345.678900\n    printf(\"科学计数法: %e\\n\", num);    // 输出: 1.234568e+04\n    printf(\"大写E: %E\\n\", num);         // 输出: 1.234568E+04\n    printf(\"保留2位: %.2e\\n\", num);     // 输出: 1.23e+04\n    return 0;\n}"
  },
  {
    "id": 17,
    "question": "`scanf(\"%3d\", &num)` 的含义是？",
    "options": ["最多读取3个整数", "只读取3位数字", "读取整数并除以3", "输出3个整数"],
    "correctAnswer": 1,
    "explanation": "`%3d` 中的 `3` 表示最大宽度，`scanf` 最多读取3个数字字符来组成整数，即使输入更多数字也只取前3位。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num;\n    \n    printf(\"请输入一个整数: \");\n    scanf(\"%3d\", &num);  // 输入: 123456\n    \n    printf(\"读取的数字: %d\\n\", num);  // 输出: 123 (只读取前3位)\n    \n    // 缓冲区中还剩下: 456\n    scanf(\"%d\", &num);\n    printf(\"继续读取: %d\\n\", num);    // 输出: 456\n    return 0;\n}"
  },
  {
    "id": 18,
    "question": "以下代码的输出结果是什么？\n\n<C>\nfloat a = 0.1f;\ndouble b = 0.1;\nif (a == b) {\n    printf(\"相等\");\n} else {\n    printf(\"不等\");\n}\n</C>",
    "options": ["`相等`", "`不等`", "编译错误", "未定义行为"],
    "correctAnswer": 1,
    "explanation": "浮点数精度陷阱！`float a = 0.1f` 存储的是0.1的单精度近似值，`double b = 0.1` 存储的是0.1的双精度近似值。在比较时，`a` 被提升为 `double`，但这个提升后的值与 `b` 的二进制表示并不完全相同。**关键点**：永远不要用 `==` 直接比较浮点数！应使用误差范围：`fabs(a - b) < 1e-6`。",
    "codeExample": "#include <stdio.h>\n#include <math.h>\n\nint main() {\n    float a = 0.1f;\n    double b = 0.1;\n    \n    /* 错误: 直接比较浮点数 */\n    if (a == b) {\n        printf(\"相等\\n\");\n    } else {\n        printf(\"不等\\n\");  /* 实际输出这个 */\n    }\n    \n    /* 查看精度差异 */\n    printf(\"a = %.20f\\n\", (double)a);  /* 0.10000000149011611938 */\n    printf(\"b = %.20f\\n\", b);          /* 0.10000000000000000555 */\n    \n    /* 正确: 使用误差范围 */\n    const double EPSILON = 1e-6;\n    if (fabs(a - b) < EPSILON) {\n        printf(\"近似相等\\n\");\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 19,
    "question": "`puts()` 和 `printf(\"%s\\n\")` 的主要区别是？",
    "options": ["`puts()` 不自动换行", "`puts()` 更快且自动换行", "`printf` 不能输出字符串", "两者完全相同"],
    "correctAnswer": 1,
    "explanation": "`puts()` 专门用于输出字符串，会自动在末尾添加换行符，且通常比 `printf` 更快，因为它不需要解析格式字符串。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    char str[] = \"Hello, World!\";\n    \n    // 使用puts，自动换行\n    puts(str);  // 输出: Hello, World!\\n\n    \n    // 使用printf，需要手动添加\\n\n    printf(\"%s\\n\", str);  // 输出: Hello, World!\\n\n    \n    // puts更简洁\n    puts(\"简单快速\");\n    \n    return 0;\n}"
  },
  {
    "id": 20,
    "question": "`scanf` 的返回值表示什么？",
    "options": ["读取的字节数", "成功读取并赋值的项目数", "缓冲区剩余字符数", "总是返回1"],
    "correctAnswer": 1,
    "explanation": "`scanf` 返回成功读取并赋值的输入项目数。可以用返回值来判断输入是否成功，返回值小于期望值表示输入失败或格式不匹配。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    int ret;\n    \n    printf(\"请输入三个整数: \");\n    ret = scanf(\"%d %d %d\", &a, &b, &c);\n    \n    printf(\"成功读取 %d 个整数\\n\", ret);\n    \n    if (ret == 3) {\n        printf(\"输入成功: %d, %d, %d\\n\", a, b, c);\n    } else {\n        printf(\"输入失败或不完整\\n\");\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 21,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 2;\nswitch (x) {\n    case 1: printf(\"A\");\n    case 2: printf(\"B\");\n    case 3: printf(\"C\");\n    default: printf(\"D\");\n}\n</C>",
    "options": ["`B`", "`BCD`", "`BD`", "`ABCD`"],
    "correctAnswer": 1,
    "explanation": "这是 `switch` 的 **fall-through（贯穿）** 陷阱！由于每个 `case` 后没有 `break`，匹配到 `case 2` 后会继续执行后面所有的 `case`，包括 `default`。输出 `BCD`。**易错点**：很多人以为会自动break。正确做法是在每个 `case` 末尾加 `break;`（除非故意利用贯穿特性）。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 2;\n    \n    /* 错误: 忘记break导致贯穿 */\n    printf(\"无break: \");\n    switch (x) {\n        case 1: printf(\"A\");\n        case 2: printf(\"B\");  /* 从这里开始执行 */\n        case 3: printf(\"C\");  /* 继续执行 */\n        default: printf(\"D\"); /* 继续执行 */\n    }\n    printf(\"\\n\");  /* 输出: BCD */\n    \n    /* 正确: 每个case后加break */\n    printf(\"有break: \");\n    switch (x) {\n        case 1: printf(\"A\"); break;\n        case 2: printf(\"B\"); break;  /* 执行后跳出 */\n        case 3: printf(\"C\"); break;\n        default: printf(\"D\");\n    }\n    printf(\"\\n\");  /* 输出: B */\n    \n    return 0;\n}"
  },
  {
    "id": 22,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 10;\nif (x = 5) {\n    printf(\"A\");\n} else {\n    printf(\"B\");\n}\n</C>",
    "options": ["`B`", "`A`", "编译错误", "未定义行为"],
    "correctAnswer": 1,
    "explanation": "`x = 5` 是赋值表达式，将5赋值给x并返回5。非零值被视为真，所以执行if分支输出A。常见错误是把赋值`=`误写成判断`==`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 10;\n    \n    // 错误：使用=而不是==\n    if (x = 5) {  // x被赋值为5，表达式值为5（真）\n        printf(\"A\\n\");  // 输出A\n    } else {\n        printf(\"B\\n\");\n    }\n    \n    printf(\"x = %d\\n\", x);  // 输出: x = 5\n    \n    // 正确：使用==比较\n    if (x == 10) {\n        printf(\"x等于10\\n\");\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 23,
    "question": "以下哪个条件判断是错误的？",
    "options": ["`if (x > 0 && x < 10)`", "`if (0 < x < 10)`", "`if (x >= 0 || x <= 100)`", "`if (x != 0)`"],
    "correctAnswer": 1,
    "explanation": "`0 < x < 10` 在C语言中不表示数学中的范围。它会先计算 `0 < x`（结果为0或1），然后用结果与10比较，这不是预期的逻辑。正确写法是 `x > 0 && x < 10`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 5;\n    \n    // 错误写法\n    if (0 < x < 10) {  // 等价于 (0 < x) < 10，即 1 < 10，总是真\n        printf(\"错误判断\\n\");\n    }\n    \n    // 正确写法\n    if (x > 0 && x < 10) {\n        printf(\"正确判断: x在0到10之间\\n\");\n    }\n    \n    // 测试边界情况\n    x = 15;\n    if (0 < x < 10) {\n        printf(\"x=15时仍然为真！\\n\");  // 会输出，因为(0<15)=1, 1<10为真\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 24,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 5, b = 10;\nif (a < b)\n    printf(\"A\");\n    printf(\"B\");\n</C>",
    "options": ["`A`", "`AB`", "`B`", "编译错误"],
    "correctAnswer": 1,
    "explanation": "if语句没有花括号时只控制紧跟的第一条语句。第二个printf不受if控制，总会执行。因此输出AB。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 5, b = 10;\n    \n    // 没有花括号，只控制第一条语句\n    if (a < b)\n        printf(\"A\");      // 受if控制\n        printf(\"B\");      // 不受if控制，总是执行\n    \n    printf(\"\\n\");\n    \n    // 正确写法：使用花括号\n    if (a < b) {\n        printf(\"A\");\n        printf(\"B\");\n    }\n    \n    return 0;\n}"
  },
  {
    "id": 25,
    "question": "`printf` 中 `%p` 格式符的作用是？",
    "options": ["输出百分比", "输出指针地址", "输出小数点", "输出字符"],
    "correctAnswer": 1,
    "explanation": "`%p` 用于输出指针地址，通常以十六进制格式显示。输出格式依赖于编译器和平台。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 100;\n    int *p = &x;\n    \n    printf(\"变量x的值: %d\\n\", x);\n    printf(\"变量x的地址: %p\\n\", (void*)&x);\n    printf(\"指针p的值: %p\\n\", (void*)p);\n    printf(\"指针p的地址: %p\\n\", (void*)&p);\n    \n    return 0;\n}"
  },
  {
    "id": 26,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint ch;\nwhile ((ch = getchar()) != EOF) {\n    if (ch == 'q') break;\n    printf(\"%d \", ch);\n}\n/* 输入: ab<回车>q */\n</C>",
    "options": ["`97 98 113`", "`97 98 10 113`", "`97 98 10`", "`97 98`"],
    "correctAnswer": 2,
    "explanation": "`getchar()` 会读取**所有**字符包括换行符。输入 `ab<回车>` 时，缓冲区内容是 `a`、`b`、`\\n`（ASCII=10）。循环会依次输出：97（'a'）、98（'b'）、10（换行符），然后输入 `q` 时触发 `break` 退出。**易错点**：很多人忘记换行符也会被读取！如果想跳过换行符，需要加判断：`if (ch == '\\n') continue;`。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int ch;\n    \n    printf(\"输入字符（q退出）: \");\n    /* 读取所有字符包括换行符 */\n    while ((ch = getchar()) != EOF) {\n        if (ch == 'q') break;\n        printf(\"%d \", ch);  /* 输入ab<回车>输出: 97 98 10 */\n    }\n    printf(\"\\n\");\n    \n    /* 改进: 跳过换行符 */\n    printf(\"\\n改进版（输入ab<回车>q）: \");\n    while ((ch = getchar()) != EOF) {\n        if (ch == '\\n') continue;  /* 跳过换行符 */\n        if (ch == 'q') break;\n        printf(\"%c \", ch);  /* 只输出字母: a b */\n    }\n    printf(\"\\n\");\n    \n    return 0;\n}"
  },
  {
    "id": 27,
    "question": "`scanf` 读取失败后，如何清空输入缓冲区？",
    "options": ["`fflush(stdin)`（不推荐）", "`while(getchar() != '\\n');`", "`clear()`", "`reset()`"],
    "correctAnswer": 1,
    "explanation": "推荐使用 `while(getchar() != '\\n');` 循环读取并丢弃字符直到换行符，清空输入缓冲区。`fflush(stdin)` 是未定义行为，不推荐使用。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int num;\n    \n    printf(\"请输入一个整数: \");\n    while (scanf(\"%d\", &num) != 1) {\n        printf(\"输入错误，请重新输入: \");\n        // 清空输入缓冲区\n        while (getchar() != '\\n');\n    }\n    \n    printf(\"你输入的整数是: %d\\n\", num);\n    return 0;\n}"
  },
  {
    "id": 28,
    "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 5;\nint b = (a > 3) ? 10 : 20;\nprintf(\"%d\", b);\n</C>",
    "options": ["`5`", "`10`", "`20`", "`15`"],
    "correctAnswer": 1,
    "explanation": "三元运算符 `条件 ? 值1 : 值2`，如果条件为真返回值1，否则返回值2。`a > 3` 为真，所以b被赋值为10。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 5;\n    int b = (a > 3) ? 10 : 20;  // a>3为真，b=10\n    \n    printf(\"b = %d\\n\", b);  // 输出: 10\n    \n    // 三元运算符相当于简化的if-else\n    int c;\n    if (a > 3) {\n        c = 10;\n    } else {\n        c = 20;\n    }\n    printf(\"c = %d\\n\", c);  // 输出: 10\n    \n    return 0;\n}"
  },
  {
    "id": 29,
    "question": "`printf` 中 `%n` 格式符的作用是？",
    "options": ["输出换行符", "将已输出字符数存储到变量", "输出数字", "跳过输出"],
    "correctAnswer": 1,
    "explanation": "`%n` 不会输出任何内容，而是将到目前为止已输出的字符数存储到对应的 `int*` 参数指向的变量中。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int count;\n    \n    printf(\"Hello%nWorld\\n\", &count);\n    printf(\"已输出字符数: %d\\n\", count);  // 输出: 5 (\"Hello\"的长度)\n    \n    int count2;\n    printf(\"ABC%nDEF%nGHI\\n\", &count, &count2);\n    printf(\"第一次: %d, 第二次: %d\\n\", count, count2);  // 3, 6\n    \n    return 0;\n}"
  },
  {
    "id": 30,
    "question": "以下代码有什么问题？\n\n<C>\nif (x = 0); {\n    printf(\"x is zero\");\n}\n</C>",
    "options": ["没有问题", "if后有分号导致空语句", "赋值符号应该是==", "A和B都是问题"],
    "correctAnswer": 3,
    "explanation": "有两个问题：1) `x = 0` 是赋值而不是比较，应该用 `==`；2) if后的分号创建了一个空语句，导致花括号中的代码总是执行。",
    "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 5;\n    \n    // 错误代码\n    if (x = 0);  // 1.赋值非比较 2.分号产生空语句\n    {\n        printf(\"总是执行\\n\");  // 这个总会执行\n    }\n    \n    // 正确写法\n    x = 5;\n    if (x == 0) {  // 使用==比较，没有分号\n        printf(\"x is zero\\n\");\n    }\n    \n    return 0;\n}"
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

            // 检查选项格式（支持数组和对象两种格式）
            if (!Array.isArray(question.options) && typeof question.options !== 'object') {
                throw new Error(`第 ${i + 1} 题选项格式错误`);
            }
            
            const optionsLength = Array.isArray(question.options) 
                ? question.options.length 
                : Object.keys(question.options).length;
            
            if (optionsLength === 0) {
                throw new Error(`第 ${i + 1} 题选项为空`);
            }

            // 检查正确答案是否在选项中
            // 对于数组格式，correctAnswer应该是有效的数组索引
            // 对于对象格式，correctAnswer应该是对象的键
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
            return true;
        } catch (error) {
            console.error('导入题库数据失败:', error);
            return false;
        }
    }
}

// 创建全局实例
window.templateLoader = new TemplateLoader();