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
                "question": "以下哪个是合法的C语言变量名？",
                "options": ["`2name`", "`_score`", "`int`", "`my-name`"],
                "correctAnswer": 1,
                "explanation": "变量名必须以字母或下划线开头，不能以数字开头。`2name`以数字开头，`int`是关键字，`my-name`包含连字符（应使用下划线）。`_score`以下划线开头，是合法的。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int _score = 90;     /* 合法 */\n    int student_name = 0; /* 合法 */\n    /* int 2name = 0; */   /* 非法：以数字开头 */\n    /* int int = 0; */     /* 非法：关键字 */\n    /* int my-name = 0; */ /* 非法：包含连字符 */\n    printf(\"_score = %d\\n\", _score);\n    return 0;\n}"
            },
            {
        "id": 2,
        "question": "以下代码的输出是什么？\n\n<C>\nint a = 2147483647;\na = a + 1;\nprintf(\"%d\", a);\n</C>",
        "options": ["`2147483648`", "`-2147483648`", "`0`", "未定义行为"],
        "correctAnswer": 1,
        "explanation": "这是「有符号整数溢出」的经典陷阱！`int`在32位系统上最大值是2147483647（`INT_MAX`），加1后发生溢出，结果回绕到最小值-2147483648（`INT_MIN`）。「易错点」：1) 有符号整数溢出在C标准中是未定义行为，但大多数系统采用补码表示，结果回绕；2) 无符号整数溢出则是明确定义的回绕行为；3) 这种bug很难发现，因为编译器通常不会警告。",
        "codeExample": "#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    int a = INT_MAX;  /* 2147483647 */\n    printf(\"INT_MAX = %d\\n\", a);\n    printf(\"INT_MAX+1 = %d\\n\", a+1);  /* -2147483648! 回绕 */\n    \n    /* 无符号溢出是明确定义的 */\n    unsigned int b = UINT_MAX;  /* 4294967295 */\n    printf(\"UINT_MAX+1 = %u\\n\", b+1);  /* 0 回绕 */\n    \n    return 0;\n}"
    },
            {
                "id": 3,
                "question": "以下代码的输出结果是什么？\n\n<C>\nchar c = 200;\nprintf(\"%d\", c);\n</C>",
                "options": ["`200`", "`-56`", "编译错误", "未定义行为"],
                "correctAnswer": 1,
                "explanation": "`char`类型的范围取决于是否有符号。在有符号`char`（大多数平台默认）中，范围是-128到127。200超出了这个范围，发生溢出。200 - 256 = -56，所以输出-56。这是「整数溢出与符号」的经典陷阱。",
                "codeExample": "#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    char c = 200;  /* 溢出！200 > 127 */\n    printf(\"%%d格式: %d\\n\", c);   /* -56 */\n    printf(\"%%u格式: %u\\n\", (unsigned char)c);  /* 200 */\n    \n    /* 正确做法 */\n    unsigned char uc = 200;  /* 无符号char范围0-255 */\n    printf(\"unsigned char: %d\\n\", uc);  /* 200 */\n    \n    printf(\"char范围: %d ~ %d\\n\", CHAR_MIN, CHAR_MAX);\n    return 0;\n}"
            },
            {
        "id": 4,
        "question": "以下代码的输出是什么？\n\n<C>\nchar a = 'a';\nchar b = 97;\nif (a == b)\n    printf(\"相等\");\nelse\n    printf(\"不相等\");\n</C>",
        "options": ["`不相等`", "`相等`", "编译错误", "运行时错误"],
        "correctAnswer": 1,
        "explanation": "这是「字符与ASCII码等价」的陷阱！在C语言中，`char`本质上是小整数。`'a'`的ASCII码值就是97，所以`a == b`为真。「易错点」：1) 误以为字符`'a'`和数字`97`是不同类型不能比较；2) C语言中`char`就是整型，`'a'`和`97`完全等价；3) `char c = 'a'`和`char c = 97`效果完全相同。「关键理解」：字符在C中用其ASCII码值存储，字符常量`'a'`就是整数97的另一种写法。",
        "codeExample": "#include <stdio.h>\n\nint main() {\n    char a = 'a';\n    char b = 97;\n    printf(\"a == b: %s\\n\", a == b ? \"是\" : \"否\");  /* 是 */\n    printf(\"'a' = %d\\n\", 'a');   /* 97 */\n    printf(\"97 = %c\\n\", 97);    /* a */\n    \n    /* 字符运算 */\n    printf(\"'a'+1 = %c\\n\", 'a'+1);  /* b */\n    printf(\"'A'+32 = %c\\n\", 'A'+32); /* a(大小写转换) */\n    \n    return 0;\n}"
    },
            {
                "id": 5,
                "question": "以下代码的输出结果是什么？\n\n<C>\nfloat f = 3.14f;\nprintf(\"%d\", (int)f);\n</C>",
                "options": ["`3`", "`3.14`", "`3.0`", "编译错误"],
                "correctAnswer": 0,
                "explanation": "浮点数强制转换为整数时，直接截断小数部分（不是四舍五入）。3.14截断后为3。注意：如果需要四舍五入，应使用`(int)(f + 0.5)`或`round()`函数。",
                "codeExample": "#include <stdio.h>\n#include <math.h>\n\nint main() {\n    float f = 3.14f;\n    \n    /* 强制转换：截断小数 */\n    printf(\"(int)3.14 = %d\\n\", (int)f);          /* 3 */\n    printf(\"(int)3.99 = %d\\n\", (int)3.99f);      /* 3，不是4！ */\n    \n    /* 四舍五入 */\n    printf(\"round(3.14) = %.0f\\n\", round(3.14)); /* 3 */\n    printf(\"round(3.5) = %.0f\\n\", round(3.5));   /* 4 */\n    \n    return 0;\n}"
            },
            {
                "id": 6,
                "question": "`const int x = 10;` 之后可以执行 `x = 20;` 吗？",
                "options": ["可以，x的值变为20", "不可以，x是常量不能修改", "可以，但x的值不变", "编译通过但运行时错误"],
                "correctAnswer": 1,
                "explanation": "`const`修饰的变量在初始化后不能被修改。尝试修改`const`变量会导致编译错误。`const`的作用是告诉编译器这个变量不应被修改，编译器会进行检查。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    const int x = 10;\n    printf(\"x = %d\\n\", x);\n    \n    /* x = 20; */ /* 编译错误：不能修改const变量 */\n    \n    /* 但可以通过指针绕过（不推荐！） */\n    int *p = (int*)&x;\n    *p = 20;  /* 未定义行为，不要这样做！ */\n    printf(\"x = %d\\n\", x);\n    \n    return 0;\n}"
            },
            {
        "id": 7,
        "question": "以下代码的输出是什么？\n\n<C>\ndouble d = 0.1 + 0.2;\nif (d == 0.3)\n    printf(\"相等\");\nelse\n    printf(\"不相等\");\n</C>",
        "options": ["`相等`", "`不相等`", "编译错误", "运行时错误"],
        "correctAnswer": 1,
        "explanation": "这是「浮点数精度」的经典陷阱！0.1和0.2在二进制中无法精确表示，`0.1+0.2`的实际结果约为0.30000000000000004，不等于0.3。「易错点」：1) 永远不要用`==`比较浮点数；2) 浮点数在计算机中用二进制存储，0.1、0.2等十进制小数无法精确表示；3) 正确做法是判断差值是否小于一个很小的数（如`fabs(d-0.3) < 1e-9`）。「教训」：浮点数比较必须使用容差法。",
        "codeExample": "#include <stdio.h>\n#include <math.h>\n\nint main() {\n    double d = 0.1 + 0.2;\n    printf(\"0.1 + 0.2 = %.17f\\n\", d);  /* 0.30000000000000004 */\n    printf(\"d == 0.3: %s\\n\", d == 0.3 ? \"是\" : \"否\");  /* 否 */\n    \n    /* 正确的浮点数比较方法 */\n    double eps = 1e-9;\n    if (fabs(d - 0.3) < eps) {\n        printf(\"近似相等\\n\");\n    }\n    \n    /* 更多浮点陷阱 */\n    float f = 123456789.0f;\n    printf(\"f = %.0f\\n\", f);  /* 123456792! 精度丢失 */\n    \n    return 0;\n}"
    },
            {
                "id": 8,
                "question": "`sizeof(char)` 的值一定是？",
                "options": ["1", "2", "4", "取决于平台"],
                "correctAnswer": 0,
                "explanation": "C标准规定`sizeof(char)`的值始终为1，这是唯一有保证大小的类型。其他类型如`int`、`long`的大小则取决于平台。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    /* sizeof(char) 始终为1 */\n    printf(\"sizeof(char) = %lu\\n\", sizeof(char));   /* 1 */\n    \n    /* 其他类型大小因平台而异 */\n    printf(\"sizeof(int) = %lu\\n\", sizeof(int));    /* 通常4 */\n    printf(\"sizeof(long) = %lu\\n\", sizeof(long));  /* 4或8 */\n    printf(\"sizeof(double) = %lu\\n\", sizeof(double)); /* 通常8 */\n    \n    return 0;\n}"
            },
            {
                "id": 9,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 010;\nprintf(\"%d\", a);\n</C>",
                "options": ["`10`", "`8`", "`2`", "编译错误"],
                "correctAnswer": 1,
                "explanation": "以`0`开头的整数字面量是八进制数。`010`的八进制等于十进制的8。这是常见的「八进制字面量」陷阱。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 010;     /* 八进制：1*8+0 = 8 */\n    int b = 10;      /* 十进制：10 */\n    int c = 0x10;    /* 十六进制：1*16+0 = 16 */\n    \n    printf(\"010(八进制) = %d\\n\", a);   /* 8 */\n    printf(\"10(十进制) = %d\\n\", b);    /* 10 */\n    printf(\"0x10(十六进制) = %d\\n\", c); /* 16 */\n    \n    /* 不同进制输出 */\n    printf(\"八进制: %o\\n\", b);   /* 12 */\n    printf(\"十六进制: %x\\n\", b); /* a */\n    \n    return 0;\n}"
            },
            {
                "id": 10,
                "question": "以下哪个是正确的浮点数常量？",
                "options": ["`3.14f`", "`3.14d`", "`f3.14`", "`3.14F`"],
                "correctAnswer": 0,
                "explanation": "`3.14f`是正确的`float`类型常量。`f`或`F`后缀表示`float`类型，不加后缀默认是`double`类型。`d`或`D`后缀不是C语言的合法后缀（那是Java的语法）。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    float f1 = 3.14f;     /* float常量 */\n    float f2 = 3.14F;     /* 也可以 */\n    double d1 = 3.14;     /* double常量（默认） */\n    double d2 = 3.14l;    /* long double */\n    \n    printf(\"float: %f\\n\", f1);\n    printf(\"double: %lf\\n\", d1);\n    \n    /* sizeof验证 */\n    printf(\"sizeof(3.14f) = %lu\\n\", sizeof(3.14f));  /* 4 */\n    printf(\"sizeof(3.14) = %lu\\n\", sizeof(3.14));    /* 8 */\n    \n    return 0;\n}"
            },
            {
                "id": 11,
                "question": "以下代码的输出结果是什么？\n\n<C>\nunsigned int a = -1;\nprintf(\"%u\", a);\n</C>",
                "options": ["`-1`", "`4294967295`（32位系统）", "编译错误", "0"],
                "correctAnswer": 1,
                "explanation": "将-1赋给`unsigned int`时，-1的补码表示（全1）被解释为无符号数。在32位系统上，这是2^32-1 = 4294967295。这是「有符号与无符号转换」的经典陷阱。",
                "codeExample": "#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    unsigned int a = -1;\n    printf(\"%%u格式: %u\\n\", a);    /* 4294967295 */\n    printf(\"%%d格式: %d\\n\", (int)a); /* -1 */\n    \n    /* 原理解释 */\n    printf(\"UINT_MAX = %u\\n\", UINT_MAX); /* 4294967295 */\n    \n    /* 更安全的做法 */\n    unsigned int b = 100;\n    int c = -1;\n    /* if (c < 0) 错误！c被隐式转为unsigned比较 */\n    if (c < (int)b) {  /* 显式转换 */\n        printf(\"c小于b\\n\");\n    }\n    \n    return 0;\n}"
            },
            {
                "id": 12,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 5;\n{\n    int x = 10;\n    printf(\"%d \", x);\n}\nprintf(\"%d\", x);\n</C>",
                "options": ["`10 10`", "`5 5`", "`10 5`", "编译错误"],
                "correctAnswer": 2,
                "explanation": "内层代码块定义了新的局部变量x，遮蔽了外层的x。在内层块中x是10，离开内层块后外层x恢复可见，值为5。这是「变量遮蔽」现象。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 5;\n    printf(\"外层x = %d\\n\", x);  /* 5 */\n    \n    {\n        int x = 10;  /* 遮蔽外层x */\n        printf(\"内层x = %d\\n\", x);  /* 10 */\n    }\n    \n    printf(\"外层x = %d\\n\", x);  /* 5，未变 */\n    \n    return 0;\n}"
            },
            {
                "id": 13,
                "question": "C语言中，`'A'` 和 `\"A\"` 的区别是？",
                "options": ["没有区别", "`'A'`是字符，`\"A\"`是字符串", "`'A'`占2字节，`\"A\"`占1字节", "`'A'`是整数，`\"A\"`也是整数"],
                "correctAnswer": 1,
                "explanation": "`'A'`是字符常量，类型为`int`，占4字节（在大多数平台），值为65。`\"A\"`是字符串常量，包含字符'A'和末尾的'\\0'，占2字节。这是常见混淆点。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    char c = 'A';        /* 字符常量 */\n    char s[] = \"A\";      /* 字符串 */\n    \n    printf(\"'A'的值: %d\\n\", 'A');          /* 65 */\n    printf(\"sizeof('A'): %lu\\n\", sizeof('A'));   /* 4 (int) */\n    printf(\"sizeof(\\\"A\\\"): %lu\\n\", sizeof(\"A\")); /* 2 (含'\\0') */\n    \n    /* 字符串末尾有'\\0' */\n    printf(\"s[0]='%c', s[1]='%d'\\n\", s[0], s[1]); /* A, 0 */\n    \n    return 0;\n}"
            },
            {
                "id": 14,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 32767;\nshort b = a + 1;\nprintf(\"%d\", b);\n</C>",
                "options": ["`32768`", "`-32768`", "`0`", "未定义行为"],
                "correctAnswer": 1,
                "explanation": "如果`short`是16位有符号类型，其最大值是32767。32767+1=32768超出了`short`的范围，发生溢出。32768的二进制表示在有符号16位中是-32768。这是「整数溢出」的经典例子。",
                "codeExample": "#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    int a = 32767;\n    short b = a + 1;  /* 溢出！ */\n    \n    printf(\"a = %d\\n\", a);   /* 32767 */\n    printf(\"b = %d\\n\", b);   /* -32768 */\n    \n    /* SHRT_MAX的值 */\n    printf(\"SHRT_MAX = %d\\n\", SHRT_MAX);  /* 32767 */\n    printf(\"SHRT_MIN = %d\\n\", SHRT_MIN);  /* -32768 */\n    \n    /* 安全的加法 */\n    if (a < SHRT_MAX) {\n        short c = a + 1;  /* 安全 */\n        printf(\"安全: %d\\n\", c);\n    }\n    \n    return 0;\n}"
            },
            {
                "id": 15,
                "question": "以下哪个关键字用于声明变量为只读？",
                "options": ["`static`", "`const`", "`volatile`", "`extern`"],
                "correctAnswer": 1,
                "explanation": "`const`关键字声明变量为只读，初始化后不能修改。`static`控制作用域和生命周期，`volatile`告诉编译器不要优化对该变量的访问，`extern`声明外部链接的变量。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    const int MAX = 100;     /* 只读变量 */\n    static int count = 0;    /* 静态局部变量 */\n    volatile int port = 0;   /* 易变变量（硬件寄存器） */\n    \n    printf(\"MAX = %d\\n\", MAX);\n    /* MAX = 200; */  /* 编译错误 */\n    \n    count++;\n    printf(\"count = %d\\n\", count);\n    \n    return 0;\n}"
            },
            {
                "id": 16,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 5, b = 2;\nfloat c = a / b;\nprintf(\"%.1f\", c);\n</C>",
                "options": ["`2.5`", "`2.0`", "`3.0`", "编译错误"],
                "correctAnswer": 1,
                "explanation": "这是「整数除法」陷阱！`a / b`是两个整数相除，结果也是整数（截断小数），得到2。然后再赋值给`float`类型c，变为2.0。要得到2.5，需要将其中一个操作数转为浮点：`(float)a / b`或`a / (float)b`或`a * 1.0 / b`。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 5, b = 2;\n    \n    /* 整数除法 */\n    float c1 = a / b;          /* 2.0 */\n    printf(\"整数除法: %.1f\\n\", c1);\n    \n    /* 浮点除法 */\n    float c2 = (float)a / b;   /* 2.5 */\n    printf(\"浮点除法: %.1f\\n\", c2);\n    \n    float c3 = a * 1.0 / b;   /* 2.5 */\n    printf(\"另一种: %.1f\\n\", c3);\n    \n    return 0;\n}"
            },
            {
                "id": 17,
                "question": "以下代码的输出结果是什么？\n\n<C>\nchar ch = '0';\nprintf(\"%d\", ch);\n</C>",
                "options": ["`0`", "`48`", "编译错误", "未定义行为"],
                "correctAnswer": 1,
                "explanation": "字符`'0'`的ASCII码值是48，不是0。`'0'`和`0`是不同的：`'0'`是字符常量（值48），`0`是整数常量（值0）。要将数字字符转为对应数值，可以`ch - '0'`。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    char ch = '0';\n    \n    printf(\"字符'0'的ASCII值: %d\\n\", ch);  /* 48 */\n    printf(\"字符'0'本身: %c\\n\", ch);        /* 0 */\n    printf(\"数字0的ASCII值: %d\\n\", 0);      /* 0 */\n    \n    /* 数字字符转数值 */\n    char digit = '7';\n    int value = digit - '0';  /* 7 */\n    printf(\"字符'7'转为数值: %d\\n\", value);\n    \n    return 0;\n}"
            },
            {
                "id": 18,
                "question": "`short`、`int`、`long` 的大小关系是？",
                "options": ["`short` ≤ `int` ≤ `long`", "`short` < `int` < `long`", "三者大小相同", "`short` = 2, `int` = 4, `long` = 8"],
                "correctAnswer": 0,
                "explanation": "C标准规定：`sizeof(short)` ≤ `sizeof(int)` ≤ `sizeof(long)`。不保证严格小于。例如在某些64位系统上，`int`和`long`可能都是8字节。但`short`至少2字节，`int`至少2字节，`long`至少4字节。",
                "codeExample": "#include <stdio.h>\n#include <limits.h>\n\nint main() {\n    printf(\"short: %lu 字节, 范围: %d ~ %d\\n\", \n           sizeof(short), SHRT_MIN, SHRT_MAX);\n    printf(\"int: %lu 字节, 范围: %d ~ %d\\n\", \n           sizeof(int), INT_MIN, INT_MAX);\n    printf(\"long: %lu 字节, 范围: %ld ~ %ld\\n\", \n           sizeof(long), LONG_MIN, LONG_MAX);\n    \n    /* 标准保证的关系 */\n    printf(\"\\nshort <= int <= long: \");\n    if (sizeof(short) <= sizeof(int) && sizeof(int) <= sizeof(long))\n        printf(\"成立\\n\");\n    \n    return 0;\n}"
            },
            {
                "id": 19,
                "question": "以下代码的输出结果是什么？\n\n<C>\ndouble d = 3.14;\nint i = d;\nprintf(\"%d\", i);\n</C>",
                "options": ["`3`", "`3.14`", "`3.0`", "编译错误"],
                "correctAnswer": 0,
                "explanation": "浮点数赋值给整数变量时，会隐式进行类型转换，小数部分被截断（不是四舍五入）。3.14变为3。虽然会丢失精度，但编译器允许这种隐式转换（可能会发出警告）。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    double d = 3.14;\n    int i = d;  /* 隐式转换，截断小数 */\n    \n    printf(\"d = %lf\\n\", d);  /* 3.140000 */\n    printf(\"i = %d\\n\", i);    /* 3 */\n    \n    /* 更明确的写法 */\n    int j = (int)d;  /* 显式转换 */\n    printf(\"j = %d\\n\", j);    /* 3 */\n    \n    /* 注意负数 */\n    double neg = -3.99;\n    int k = (int)neg;\n    printf(\"k = %d\\n\", k);    /* -3，不是-4 */\n    \n    return 0;\n}"
            },
            {
                "id": 20,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 0x1F;\nprintf(\"%d\", a);\n</C>",
                "options": ["`1F`", "`31`", "`15`", "`32`"],
                "correctAnswer": 1,
                "explanation": "`0x1F`是十六进制字面量。1×16+15=31。`0x`前缀表示十六进制，F在十六进制中表示15。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 0x1F;  /* 十六进制：1*16+15 = 31 */\n    \n    printf(\"十进制: %d\\n\", a);    /* 31 */\n    printf(\"十六进制: %x\\n\", a);   /* 1f */\n    printf(\"八进制: %o\\n\", a);     /* 37 */\n    \n    /* 常见十六进制值 */\n    printf(\"0xFF = %d\\n\", 0xFF);   /* 255 */\n    printf(\"0x10 = %d\\n\", 0x10);   /* 16 */\n    \n    return 0;\n}"
            },
            {
                "id": 21,
                "question": "以下关于`volatile`关键字的说法，正确的是？",
                "options": ["`volatile`变量可以被编译器优化掉", "`volatile`告诉编译器该变量可能被意外修改", "`volatile`和`const`不能同时使用", "`volatile`使变量变为全局变量"],
                "correctAnswer": 1,
                "explanation": "`volatile`告诉编译器该变量可能被程序之外的因素（如硬件、信号处理程序、其他线程）修改，编译器不应优化对该变量的读写。`volatile`和`const`可以同时使用，表示变量只读但可能被外部修改（如硬件状态寄存器）。",
                "codeExample": "#include <stdio.h>\n\n/* 模拟硬件寄存器地址 */\nvolatile const int *hw_status = (volatile const int*)0x1000;\n\nint main() {\n    volatile int flag = 0;\n    \n    /* 编译器不会优化掉对flag的检查 */\n    while (flag == 0) {\n        /* 等待外部修改flag */\n        /* 没有volatile，编译器可能优化为死循环 */\n    }\n    \n    printf(\"flag changed!\\n\");\n    return 0;\n}"
            },
            {
                "id": 22,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 5;\ndouble b = a;\nprintf(\"%.1f\", b);\n</C>",
                "options": ["`5.0`", "`5`", "编译错误", "未定义行为"],
                "correctAnswer": 0,
                "explanation": "整数赋值给浮点变量时，会自动进行类型提升，整数值5变为5.0。这种转换不会丢失精度（在`double`的表示范围内）。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 5;\n    double b = a;  /* 自动类型提升 */\n    \n    printf(\"a = %d\\n\", a);     /* 5 */\n    printf(\"b = %.1f\\n\", b);   /* 5.0 */\n    \n    /* 各种类型转换 */\n    char c = 'A';\n    int i = c;      /* char -> int，值为65 */\n    double d = i;   /* int -> double */\n    \n    printf(\"c='%c', i=%d, d=%.1f\\n\", c, i, d);\n    \n    return 0;\n}"
            },
            {
                "id": 23,
                "question": "以下哪种写法可以正确定义两个整型变量？",
                "options": ["`int a, b;`", "`int a; b;`", "`int a b;`", "`int a && b;`"],
                "correctAnswer": 0,
                "explanation": "`int a, b;`在一行中定义两个整型变量。C语言使用逗号分隔同一类型的多个变量声明。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a, b;         /* 正确：定义两个int变量 */\n    int c = 1, d = 2; /* 正确：定义并初始化 */\n    \n    /* int a; b; */   /* 错误：b未声明类型 */\n    /* int a b; */     /* 错误：语法错误 */\n    \n    a = 10;\n    b = 20;\n    printf(\"a=%d, b=%d, c=%d, d=%d\\n\", a, b, c, d);\n    \n    return 0;\n}"
            },
            {
                "id": 24,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 10;\nprintf(\"%f\", a);\n</C>",
                "options": ["`10.000000`", "`0.000000`", "编译错误", "输出不确定（未定义行为）"],
                "correctAnswer": 3,
                "explanation": "使用`%f`格式符输出`int`类型是未定义行为！`printf`不会进行类型转换，它会按照格式符的要求去读取栈上的数据。`%f`期望读取8字节的`double`，但`int`只占4字节，导致读取了错误的内存内容，输出结果不确定。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 10;\n    \n    /* 错误！格式符与类型不匹配 */\n    /* printf(\"%f\", a);  未定义行为！ */\n    \n    /* 正确做法：使用对应的格式符 */\n    printf(\"整数: %d\\n\", a);         /* 10 */\n    printf(\"转浮点: %f\\n\", (double)a); /* 10.000000 */\n    \n    /* 格式符与类型必须匹配 */\n    double d = 3.14;\n    printf(\"double: %lf\\n\", d);      /* 3.140000 */\n    /* printf(\"%d\", d); */             /* 未定义行为！ */\n    \n    return 0;\n}"
            },
            {
                "id": 25,
                "question": "以下代码的输出结果是什么？\n\n<C>\nenum Color { RED, GREEN, BLUE };\nenum Color c = GREEN;\nprintf(\"%d\", c);\n</C>",
                "options": ["`GREEN`", "`1`", "`2`", "编译错误"],
                "correctAnswer": 1,
                "explanation": "`enum`的成员默认从0开始递增。`RED=0`，`GREEN=1`，`BLUE=2`。枚举值本质上是整数，用`%d`输出时会显示其整数值。",
                "codeExample": "#include <stdio.h>\n\nenum Color { RED, GREEN, BLUE };  /* 0, 1, 2 */\nenum Weekday { MON=1, TUE, WED, THU, FRI, SAT, SUN }; /* 从1开始 */\n\nint main() {\n    enum Color c = GREEN;\n    printf(\"GREEN = %d\\n\", c);  /* 1 */\n    printf(\"RED = %d\\n\", RED);   /* 0 */\n    printf(\"BLUE = %d\\n\", BLUE); /* 2 */\n    \n    /* 可以指定起始值 */\n    printf(\"MON = %d\\n\", MON);   /* 1 */\n    printf(\"SUN = %d\\n\", SUN);   /* 7 */\n    \n    return 0;\n}"
            },
            {
                "id": 26,
                "question": "`signed` 和 `unsigned` 的区别是？",
                "options": ["`unsigned`不能表示0", "`signed`可以表示负数，`unsigned`只能表示非负数", "`unsigned`占更多内存", "两者没有区别"],
                "correctAnswer": 1,
                "explanation": "`signed`类型的最高位用作符号位，可以表示正数、负数和零。`unsigned`类型没有符号位，所有位都用于表示数值，只能表示非负数，但正数范围扩大了一倍。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    signed int a = -10;     /* 有符号，可表示负数 */\n    unsigned int b = 10;    /* 无符号，只能非负 */\n    \n    /* 范围对比 */\n    printf(\"signed int: %d ~ %d\\n\", -2147483647-1, 2147483647);\n    printf(\"unsigned int: 0 ~ %u\\n\", 4294967295u);\n    \n    /* 注意：无符号减法 */\n    unsigned int x = 3, y = 5;\n    if (x < y) {\n        /* unsigned int diff = y - x;  正确: 2 */\n        /* unsigned int diff = x - y;  会下溢! */\n        printf(\"x - y 会下溢，结果很大\\n\");\n    }\n    \n    return 0;\n}"
            },
            {
                "id": 27,
                "question": "以下代码的输出结果是什么？\n\n<C>\nlong x = 100L;\nprintf(\"%ld\", x);\n</C>",
                "options": ["`100`", "`100L`", "编译错误", "未定义行为"],
                "correctAnswer": 0,
                "explanation": "`100L`是`long`类型的整数字面量。`L`后缀表示`long`类型。`%ld`是`long`对应的格式符。输出结果为100。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    long x = 100L;       /* long字面量 */\n    long long y = 100LL; /* long long字面量 */\n    unsigned long z = 100UL; /* unsigned long字面量 */\n    \n    printf(\"long: %ld\\n\", x);         /* 100 */\n    printf(\"long long: %lld\\n\", y);   /* 100 */\n    printf(\"unsigned long: %lu\\n\", z); /* 100 */\n    \n    return 0;\n}"
            },
            {
                "id": 28,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 1;\nint b = a++;\nprintf(\"%d %d\", a, b);\n</C>",
                "options": ["`1 2`", "`2 1`", "`1 1`", "`2 2`"],
                "correctAnswer": 1,
                "explanation": "`a++`是后置自增，先使用a的当前值（1）赋给b，然后a自增为2。所以b=1，a=2。后置`++`返回的是修改前的值。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 1;\n    \n    /* 后置自增：先用后增 */\n    int b = a++;  /* b=1(旧值), a=2(新值) */\n    printf(\"a=%d, b=%d\\n\", a, b);  /* 2, 1 */\n    \n    /* 前置自增：先增后用 */\n    int c = 1;\n    int d = ++c;  /* c=2(新值), d=2(新值) */\n    printf(\"c=%d, d=%d\\n\", c, d);  /* 2, 2 */\n    \n    return 0;\n}"
            },
            {
                "id": 29,
                "question": "以下代码中，哪种初始化方式是错误的？",
                "options": ["`int a = 0;`", "`int a = {0};`", "`int a(0);`", "`int a{};`（C99后）"],
                "correctAnswer": 2,
                "explanation": "`int a(0);`是C++的初始化语法，不是C语言的语法。C语言使用`=`赋值初始化、`{}`列表初始化。C99后支持`int a = {0};`和`int a = 0;`。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 0;     /* C语言标准赋值初始化 */\n    int b = {0};   /* C语言列表初始化 */\n    /* int c(0); */ /* C++语法，C语言不支持 */\n    \n    /* C99指定初始化器 */\n    int arr[5] = {[2] = 10};  /* 第3个元素为10，其余为0 */\n    \n    printf(\"a=%d, b=%d\\n\", a, b);\n    printf(\"arr[2]=%d\\n\", arr[2]);\n    \n    return 0;\n}"
            },
            {
                "id": 30,
                "question": "以下代码的输出结果是什么？\n\n<C>\n_Bool flag = 5;\nprintf(\"%d\", flag);\n</C>",
                "options": ["`5`", "`1`", "`0`", "编译错误"],
                "correctAnswer": 1,
                "explanation": "C99引入的`_Bool`类型（或通过`<stdbool.h>`使用`bool`），任何非零值赋给它都会变为1，零值变为0。所以5赋给`_Bool`变量后变为1。",
                "codeExample": "#include <stdio.h>\n#include <stdbool.h>\n\nint main() {\n    /* C99原生布尔类型 */\n    _Bool flag1 = 5;   /* 1 */\n    _Bool flag2 = 0;   /* 0 */\n    _Bool flag3 = -3;  /* 1 */\n    \n    printf(\"flag1 = %d\\n\", flag1);  /* 1 */\n    printf(\"flag2 = %d\\n\", flag2);  /* 0 */\n    printf(\"flag3 = %d\\n\", flag3);  /* 1 */\n    \n    /* 使用stdbool.h更方便 */\n    bool b1 = true;   /* 1 */\n    bool b2 = false;  /* 0 */\n    printf(\"b1=%d, b2=%d\\n\", b1, b2);\n    \n    return 0;\n}"
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

    // 规范化题目：将对象格式的 options 转为数组格式，正确答案转为索引
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
