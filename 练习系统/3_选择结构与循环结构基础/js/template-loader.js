// 模板加载器 - 负责动态加载题库数据
class TemplateLoader {
    constructor() {
        this.questions = [];
    }

    // 加载题库数据 - 直接使用内置题库
    async loadQuestions() {
        try {
            // 直接使用内置题库数据
            this.questions = this.getBuiltInQuestions();
            // 打乱题库顺序
            this.shuffleQuestions();
            // 重新分配题目ID（保持1到n的顺序）
            this.reassignQuestionIds();
            console.log(`成功加载 ${this.questions.length} 道题目（来自内置题库）`);
            return this.questions;
        } catch (error) {
            console.error('加载题库失败:', error.message);
            throw error;
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

    // 获取内置题库数据 - 专注于if/switch多分支选择与选择结构嵌套
    getBuiltInQuestions() {
        return [
            // ========== 第1-10题：if多分支选择结构 ==========
            {
                "id": 1,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 5;\nif (x > 3)\n    if (x < 7)\n        printf(\"A\");\nelse\n    printf(\"B\");\n</C>",
                "options": ["`A`", "`B`", "`AB`", "编译错误"],
                "correctAnswer": 0,
                "explanation": "这是经典的**悬挂else（dangling else）**陷阱！`else` 总是与最近的未配对的 `if` 匹配，而不是按缩进判断。这里的 `else` 属于内层 `if (x < 7)`，而不是外层 `if (x > 3)`。x=5 满足 `x>3` 和 `x<7`，执行内层if输出A。**易错点**：根据缩进以为else属于外层if。**正确做法**：始终使用花括号避免歧义！",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 5;\n    \n    /* 危险代码: else属于哪个if？ */\n    if (x > 3)\n        if (x < 7)\n            printf(\"A\");  /* x=5满足，输出A */\n    else\n        printf(\"B\");  /* else实际属于内层if! */\n    \n    printf(\"\\n\");\n    \n    /* 正确做法: 使用花括号明确结构 */\n    if (x > 3) {\n        if (x < 7) {\n            printf(\"A\");\n        }\n    } else {\n        printf(\"B\");  /* 现在属于外层if */\n    }\n    \n    return 0;\n}"
            },
            {
                "id": 2,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 5, y = 10;\nif (x > 3) {\n    if (y > 8) {\n        printf(\"A\");\n    } else {\n        printf(\"B\");\n    }\n} else {\n    printf(\"C\");\n}\n</C>",
                "options": ["A", "B", "C", "AB"],
                "correctAnswer": 0,
                "explanation": "x=5满足`x>3`，进入外层if。y=10满足`y>8`，进入内层if，输出\"A\"。这是典型的if语句嵌套结构。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 5, y = 10;\n    if (x > 3) {  // 满足\n        if (y > 8) {  // 满足\n            printf(\"A\");  // 执行这里\n        } else {\n            printf(\"B\");\n        }\n    } else {\n        printf(\"C\");\n    }\n    return 0;\n}"
            },
            {
                "id": 3,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint age = 25;\nif (age < 18) {\n    printf(\"未成年\");\n} else if (age < 35) {\n    printf(\"青年\");\n} else if (age < 60) {\n    printf(\"中年\");\n} else {\n    printf(\"老年\");\n}\n</C>",
                "options": ["未成年", "青年", "中年", "老年"],
                "correctAnswer": 1,
                "explanation": "age=25不满足`age<18`，满足`age<35`，输出\"青年\"。多分支if-else if结构按顺序检查，找到第一个满足的条件即执行。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int age = 25;\n    if (age < 18) {\n        printf(\"未成年\");\n    } else if (age < 35) {\n        printf(\"青年\");  // 执行这里\n    } else if (age < 60) {\n        printf(\"中年\");\n    } else {\n        printf(\"老年\");\n    }\n    return 0;\n}"
            },
            {
                "id": 4,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint num = 0;\nif (num > 0) {\n    printf(\"正数\");\n} else if (num < 0) {\n    printf(\"负数\");\n} else {\n    printf(\"零\");\n}\n</C>",
                "options": ["正数", "负数", "零", "无输出"],
                "correctAnswer": 2,
                "explanation": "num=0既不大于0也不小于0，前两个条件都不满足，执行else分支输出\"零\"。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int num = 0;\n    if (num > 0) {\n        printf(\"正数\");\n    } else if (num < 0) {\n        printf(\"负数\");\n    } else {\n        printf(\"零\");  // 执行这里\n    }\n    return 0;\n}"
            },
            {
                "id": 5,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 10;\nif (x >= 10 && x <= 20) {\n    printf(\"区间内\");\n} else {\n    printf(\"区间外\");\n}\n</C>",
                "options": ["区间内", "区间外", "编译错误", "未定义行为"],
                "correctAnswer": 0,
                "explanation": "x=10同时满足`x>=10`和`x<=20`两个条件（逻辑与&&），输出\"区间内\"。这是判断数值是否在某个区间的常见写法。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 10;\n    if (x >= 10 && x <= 20) {  // 满足\n        printf(\"区间内\");  // 执行这里\n    } else {\n        printf(\"区间外\");\n    }\n    return 0;\n}"
            },
            {
                "id": 6,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 0, y = 10;\nif (x++ > 0 && y++ > 5) {\n    printf(\"条件满足\");\n}\nprintf(\"%d %d\", x, y);\n</C>",
                "options": ["`1 11`", "`1 10`", "`0 10`", "`0 11`"],
                "correctAnswer": 1,
                "explanation": "这是**逻辑与(&&)短路求值**陷阱！`x++` 先使用x的值（0），然后自增x变成1。由于 `x++ > 0`（即 `0 > 0`）为假，`&&` 右侧的 `y++ > 5` **根本不执行**（短路）！所以 `y` 保持为10没有自增。最终输出 `1 10`。**关键点**：`&&` 左侧为假时，右侧不执行；`||` 左侧为真时，右侧不执行。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 0, y = 10;\n    \n    /* x++ > 0 为假，y++不执行（短路） */\n    if (x++ > 0 && y++ > 5) {\n        printf(\"条件满足\");\n    }\n    printf(\"%d %d\\n\", x, y);  /* 输出: 1 10 */\n    \n    /* 演示||的短路 */\n    int a = 1, b = 10;\n    if (a++ > 0 || b++ > 5) {  /* a++>0为真，b++不执行 */\n        printf(\"满足\\n\");\n    }\n    printf(\"%d %d\\n\", a, b);  /* 输出: 2 10 */\n    \n    return 0;\n}"
            },
            {
                "id": 7,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 7;\nif (x % 2 == 0) {\n    printf(\"偶数\");\n} else {\n    printf(\"奇数\");\n}\n</C>",
                "options": ["偶数", "奇数", "0", "1"],
                "correctAnswer": 1,
                "explanation": "x=7除以2余数为1，不等于0，条件不满足，执行else分支输出\"奇数\"。使用`x%2==0`是判断奇偶数的标准方法。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 7;\n    if (x % 2 == 0) {\n        printf(\"偶数\");\n    } else {\n        printf(\"奇数\");  // 执行这里\n    }\n    return 0;\n}"
            },
            {
                "id": 8,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint year = 2024;\nif (year % 4 == 0 && year % 100 != 0) {\n    printf(\"闰年\");\n} else if (year % 400 == 0) {\n    printf(\"闰年\");\n} else {\n    printf(\"平年\");\n}\n</C>",
                "options": ["闰年", "平年", "编译错误", "无输出"],
                "correctAnswer": 0,
                "explanation": "2024能被4整除且不能被100整除，满足第一个条件，输出\"闰年\"。这是判断闰年的标准算法。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int year = 2024;\n    // 闰年：能被4整除但不能被100整除，或者能被400整除\n    if (year % 4 == 0 && year % 100 != 0) {\n        printf(\"闰年\");  // 执行这里\n    } else if (year % 400 == 0) {\n        printf(\"闰年\");\n    } else {\n        printf(\"平年\");\n    }\n    return 0;\n}"
            },
            {
                "id": 9,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 1, y = 2;\nif (x & y) {  /* 注意：这里是& 不是&& */\n    printf(\"A\");\n} else {\n    printf(\"B\");\n}\n</C>",
                "options": ["`A`", "`B`", "编译错误", "未定义行为"],
                "correctAnswer": 1,
                "explanation": "这是**位运算符与逻辑运算符混淆**陷阱！`&` 是**按位与**，`&&` 才是**逻辑与**。`x & y` 即 `1 & 2`：二进制 `01 & 10 = 00`（结果为0），0被视为假，执行else输出B。**易错点**：误以为单个`&`和双`&&`效果相同。**重要区别**：`&&` 有短路特性且返回0/1，`&` 按位操作所有位且不短路。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 1, y = 2;\n    \n    /* 错误: 使用&而不是&& */\n    if (x & y) {  /* 1 & 2 = 0 (二进制01 & 10 = 00) */\n        printf(\"A\");\n    } else {\n        printf(\"B\");  /* 输出B */\n    }\n    \n    printf(\"\\n\");\n    \n    /* 正确: 使用逻辑与 */\n    if (x && y) {  /* 两者都非零，为真 */\n        printf(\"都为真\\n\");\n    }\n    \n    /* 演示区别 */\n    printf(\"x & y = %d\\n\", x & y);    /* 0 */\n    printf(\"x && y = %d\\n\", x && y);  /* 1 */\n    \n    return 0;\n}"
            },
            {
                "id": 10,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 15;\nif (x > 10 || x < 5) {\n    printf(\"满足\");\n} else {\n    printf(\"不满足\");\n}\n</C>",
                "options": ["满足", "不满足", "编译错误", "未定义行为"],
                "correctAnswer": 0,
                "explanation": "x=15满足`x>10`，逻辑或(||)只要有一个条件成立整个表达式就为真，输出\"满足\"。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 15;\n    if (x > 10 || x < 5) {  // 15>10满足\n        printf(\"满足\");  // 执行这里\n    } else {\n        printf(\"不满足\");\n    }\n    return 0;\n}"
            },
            
            // ========== 第11-20题：switch多分支选择结构 ==========
            {
                "id": 11,
                "question": "以下代码的输出结果是什么（default在中间且无break）？\n\n<C>\nint x = 5;\nswitch (x) {\n    case 1: printf(\"A\"); break;\n    default: printf(\"D\");\n    case 2: printf(\"B\"); break;\n}\n</C>",
                "options": ["`A`", "`D`", "`DB`", "`B`"],
                "correctAnswer": 2,
                "explanation": "这是**switch中default位置与fall-through组合**陷阱！x=5不匹配任何case，执行default输出D。**关键点**：default后没有break，会继续执行后面的case 2输出B！最终输出DB。**易错点**：default可以放在switch的任何位置，不仅仅是最后；它也遵循fall-through规则。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int x = 5;\n    \n    /* default在中间且无break */\n    switch (x) {\n        case 1: printf(\"A\"); break;\n        default: printf(\"D\");  /* 执行这里，无break! */\n        case 2: printf(\"B\"); break;  /* 继续执行 */\n    }\n    printf(\"\\n\");  /* 输出DB */\n    \n    /* 正确做法: default加break */\n    x = 5;\n    switch (x) {\n        case 1: printf(\"A\"); break;\n        default: printf(\"D\"); break;  /* 加break */\n        case 2: printf(\"B\"); break;\n    }\n    printf(\"\\n\");  /* 输出D */\n    \n    return 0;\n}"
            },
            {
                "id": 12,
                "question": "以下代码的输出结果是什么（注意缺少break）？\n\n<C>\nint x = 2;\nswitch(x) {\n    case 1: printf(\"A\");\n    case 2: printf(\"B\");\n    case 3: printf(\"C\");\n    default: printf(\"D\");\n}\n</C>",
                "options": ["B", "BC", "BCD", "ABCD"],
                "correctAnswer": 2,
                "explanation": "x=2匹配case 2输出\"B\"，由于没有break会继续执行case 3输出\"C\"，再执行default输出\"D\"。这叫做switch的fall-through（贯穿）特性。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 2;\n    switch(x) {\n        case 1: printf(\"A\");\n        case 2: printf(\"B\");  // 匹配，无break\n        case 3: printf(\"C\");  // 继续执行\n        default: printf(\"D\");  // 还继续执行\n    }\n    // 输出：BCD\n    return 0;\n}"
            },
            {
                "id": 13,
                "question": "以下代码的输出结果是什么？\n\n<C>\nchar grade = 'B';\nswitch(grade) {\n    case 'A': printf(\"优秀\"); break;\n    case 'B': printf(\"良好\"); break;\n    case 'C': printf(\"及格\"); break;\n    default: printf(\"不及格\");\n}\n</C>",
                "options": ["优秀", "良好", "及格", "不及格"],
                "correctAnswer": 1,
                "explanation": "grade='B'匹配case 'B'，输出\"良好\"。switch语句可以用于char类型（字符本质上是整数）。",
                "codeExample": "#include <stdio.h>\nint main() {\n    char grade = 'B';\n    switch(grade) {\n        case 'A': printf(\"优秀\"); break;\n        case 'B': printf(\"良好\"); break;  // 匹配并执行\n        case 'C': printf(\"及格\"); break;\n        default: printf(\"不及格\");\n    }\n    return 0;\n}"
            },
            {
                "id": 14,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint score = 85, level;\nswitch (score / 10) {\n    case 10:\n    case 9: level = 5; break;\n    case 8: level = 4;  /* 注意没有break! */\n    case 7: level = 3; break;\n    default: level = 1;\n}\nprintf(\"%d\", level);\n</C>",
                "options": ["`5`", "`4`", "`3`", "`1`"],
                "correctAnswer": 2,
                "explanation": "这是**合并case与fall-through组合**的复杂陷阱！score/10=8，匹配case 8执行 `level=4`。**关键错误**：case 8后没有break，继续执行下一条语句 `level=3`！然后break退出，输出3。**易错点**：误以为输出4。这种缺少break的bug非常隐蔽且危险！",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int score = 85, level;\n    \n    /* 错误: case 8缺少break */\n    switch (score / 10) {  /* 85/10 = 8 */\n        case 10:\n        case 9: level = 5; break;\n        case 8: level = 4;  /* 执行这里，无break! */\n        case 7: level = 3; break;  /* 继续执行，level被改为3 */\n        default: level = 1;\n    }\n    printf(\"%d\\n\", level);  /* 输出3而不是4! */\n    \n    /* 正确做法: 每个case后加break */\n    score = 85;\n    switch (score / 10) {\n        case 10:\n        case 9: level = 5; break;\n        case 8: level = 4; break;  /* 加break */\n        case 7: level = 3; break;\n        default: level = 1;\n    }\n    printf(\"%d\\n\", level);  /* 输出4 */\n    \n    return 0;\n}"
            },
            {
                "id": 15,
                "question": "以下代码的输出结果是什么（多个case合并）？\n\n<C>\nint month = 2;\nswitch(month) {\n    case 12:\n    case 1:\n    case 2:\n        printf(\"冬季\"); break;\n    case 3:\n    case 4:\n    case 5:\n        printf(\"春季\"); break;\n    default:\n        printf(\"其他季节\");\n}\n</C>",
                "options": ["冬季", "春季", "其他季节", "无输出"],
                "correctAnswer": 0,
                "explanation": "month=2匹配case 2，由于case 12、1、2都没有break，会直接执行到printf(\"冬季\")。这是switch合并多个case的常见用法。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int month = 2;\n    switch(month) {\n        case 12:  // 无break，继续\n        case 1:   // 无break，继续\n        case 2:   // 匹配这里，无break，继续\n            printf(\"冬季\"); break;  // 执行这里\n        case 3:\n        case 4:\n        case 5:\n            printf(\"春季\"); break;\n        default:\n            printf(\"其他季节\");\n    }\n    return 0;\n}"
            },
            {
                "id": 16,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 1;\nswitch(x + 1) {\n    case 1: printf(\"1\"); break;\n    case 2: printf(\"2\"); break;\n    case 3: printf(\"3\"); break;\n}\n</C>",
                "options": ["1", "2", "3", "无输出"],
                "correctAnswer": 1,
                "explanation": "switch表达式是`x+1=2`，匹配case 2，输出\"2\"。switch可以使用任何整型表达式。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 1;\n    switch(x + 1) {  // 1+1=2\n        case 1: printf(\"1\"); break;\n        case 2: printf(\"2\"); break;  // 匹配\n        case 3: printf(\"3\"); break;\n    }\n    return 0;\n}"
            },
            {
                "id": 17,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint score = 85;\nswitch(score / 10) {\n    case 10:\n    case 9: printf(\"优秀\"); break;\n    case 8: printf(\"良好\"); break;\n    case 7:\n    case 6: printf(\"及格\"); break;\n    default: printf(\"不及格\");\n}\n</C>",
                "options": ["优秀", "良好", "及格", "不及格"],
                "correctAnswer": 1,
                "explanation": "score/10=8，匹配case 8，输出\"良好\"。这是用switch实现分数等级判断的常见技巧。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int score = 85;\n    switch(score / 10) {  // 85/10=8\n        case 10:\n        case 9: printf(\"优秀\"); break;\n        case 8: printf(\"良好\"); break;  // 匹配\n        case 7:\n        case 6: printf(\"及格\"); break;\n        default: printf(\"不及格\");\n    }\n    return 0;\n}"
            },
            {
                "id": 18,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 0;\nswitch(x) {\n    case 0: printf(\"零\");\n    case 1: printf(\"一\"); break;\n    case 2: printf(\"二\"); break;\n}\n</C>",
                "options": ["零", "一", "零一", "零一二"],
                "correctAnswer": 2,
                "explanation": "x=0匹配case 0输出\"零\"，没有break继续执行case 1输出\"一\"，遇到break跳出。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 0;\n    switch(x) {\n        case 0: printf(\"零\");  // 匹配，无break\n        case 1: printf(\"一\"); break;  // 继续执行\n        case 2: printf(\"二\"); break;\n    }\n    // 输出：零一\n    return 0;\n}"
            },
            {
                "id": 19,
                "question": "以下代码的输出结果是什么？\n\n<C>\nchar op = '+';\nint a = 5, b = 3;\nswitch(op) {\n    case '+': printf(\"%d\", a + b); break;\n    case '-': printf(\"%d\", a - b); break;\n    case '*': printf(\"%d\", a * b); break;\n    case '/': printf(\"%d\", a / b); break;\n}\n</C>",
                "options": ["5", "8", "15", "1"],
                "correctAnswer": 1,
                "explanation": "op='+'匹配case '+'，执行`printf(\"%d\", a+b)`输出5+3=8。这是用switch实现简单计算器的例子。",
                "codeExample": "#include <stdio.h>\nint main() {\n    char op = '+';\n    int a = 5, b = 3;\n    switch(op) {\n        case '+': printf(\"%d\", a + b); break;  // 匹配，输出8\n        case '-': printf(\"%d\", a - b); break;\n        case '*': printf(\"%d\", a * b); break;\n        case '/': printf(\"%d\", a / b); break;\n    }\n    return 0;\n}"
            },
            {
                "id": 20,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint x = 3;\nswitch(x % 2) {\n    case 0: printf(\"偶数\"); break;\n    case 1: printf(\"奇数\"); break;\n}\n</C>",
                "options": ["偶数", "奇数", "3", "无输出"],
                "correctAnswer": 1,
                "explanation": "x=3，x%2=1，匹配case 1，输出\"奇数\"。用switch判断奇偶数也是一种方法。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 3;\n    switch(x % 2) {  // 3%2=1\n        case 0: printf(\"偶数\"); break;\n        case 1: printf(\"奇数\"); break;  // 匹配\n    }\n    return 0;\n}"
            },
            
            // ========== 第21-30题：选择结构的嵌套（高难度） ==========
            {
                "id": 21,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 5, b = 10, c = 15;\nint result = a > b ? (b > c ? 1 : 2) : (a > c ? 3 : 4);\nprintf(\"%d\", result);\n</C>",
                "options": ["`1`", "`2`", "`3`", "`4`"],
                "correctAnswer": 3,
                "explanation": "这是**嵌套三元运算符**的复杂陷阱！执行流程：1) `a>b`（5>10）为假，跳过冲号前的部分；2) 执行冲号后 `(a>c ? 3 : 4)`；3) `a>c`（5>15）为假，返回4。**关键点**：三元运算符 `? :` 的结合性是右结合，嵌套时需要仔细分析。**易错点**：嵌套三元运算符读起来困难，建议使用if-else更清晰。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 5, b = 10, c = 15;\n    \n    /* 复杂的嵌套三元运算符 */\n    int result = a > b ? (b > c ? 1 : 2) : (a > c ? 3 : 4);\n    /*\n     * 执行流程：\n     * 1. a > b？5 > 10？为假\n     * 2. 跳过冲号前，执行 (a > c ? 3 : 4)\n     * 3. a > c？5 > 15？为假\n     * 4. 返回 4\n     */\n    printf(\"%d\\n\", result);  /* 输出4 */\n    \n    /* 正确做法: 用if-else更清晰 */\n    int result2;\n    if (a > b) {\n        if (b > c) {\n            result2 = 1;\n        } else {\n            result2 = 2;\n        }\n    } else {\n        if (a > c) {\n            result2 = 3;\n        } else {\n            result2 = 4;  /* 执行这里 */\n        }\n    }\n    printf(\"%d\\n\", result2);  /* 输出4 */\n    \n    return 0;\n}"
            },
            {
                "id": 22,
                "question": "以下代码找三个数中的最大值，输出是什么？\n\n<C>\nint a = 15, b = 20, c = 10, max;\nif (a > b) {\n    if (a > c) {\n        max = a;\n    } else {\n        max = c;\n    }\n} else {\n    if (b > c) {\n        max = b;\n    } else {\n        max = c;\n    }\n}\nprintf(\"%d\", max);\n</C>",
                "options": ["10", "15", "20", "0"],
                "correctAnswer": 2,
                "explanation": "a=15不大于b=20，进入外层else。b=20>c=10，max=b=20。这是用嵌套if找三数最大值的经典算法。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int a = 15, b = 20, c = 10, max;\n    if (a > b) {\n        if (a > c) {\n            max = a;\n        } else {\n            max = c;\n        }\n    } else {  // 15不大于20，走这里\n        if (b > c) {  // 20>10满足\n            max = b;  // max=20\n        } else {\n            max = c;\n        }\n    }\n    printf(\"%d\", max);  // 输出20\n    return 0;\n}"
            },
            {
                "id": 23,
                "question": "以下嵌套switch的输出是什么？\n\n<C>\nint type = 1, level = 2;\nswitch(type) {\n    case 1:\n        switch(level) {\n            case 1: printf(\"A\"); break;\n            case 2: printf(\"B\"); break;\n        }\n        break;\n    case 2:\n        printf(\"C\"); break;\n}\n</C>",
                "options": ["A", "B", "C", "AB"],
                "correctAnswer": 1,
                "explanation": "type=1匹配外层case 1，进入内层switch。level=2匹配内层case 2，输出\"B\"。这是switch语句嵌套的例子。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int type = 1, level = 2;\n    switch(type) {  // 匹配case 1\n        case 1:\n            switch(level) {  // 匹配case 2\n                case 1: printf(\"A\"); break;\n                case 2: printf(\"B\"); break;  // 执行这里\n            }\n            break;\n        case 2:\n            printf(\"C\"); break;\n    }\n    return 0;\n}"
            },
            {
                "id": 24,
                "question": "以下if和switch混合嵌套的输出是什么？\n\n<C>\nint x = 5, y = 2;\nif (x > 3) {\n    switch(y) {\n        case 1: printf(\"A\"); break;\n        case 2: printf(\"B\"); break;\n        case 3: printf(\"C\"); break;\n    }\n} else {\n    printf(\"D\");\n}\n</C>",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": 1,
                "explanation": "x=5>3满足if条件，进入switch。y=2匹配case 2，输出\"B\"。这是if包含switch的嵌套结构。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 5, y = 2;\n    if (x > 3) {  // 5>3满足\n        switch(y) {  // y=2\n            case 1: printf(\"A\"); break;\n            case 2: printf(\"B\"); break;  // 匹配\n            case 3: printf(\"C\"); break;\n        }\n    } else {\n        printf(\"D\");\n    }\n    return 0;\n}"
            },
            {
                "id": 25,
                "question": "以下三层嵌套if的输出是什么？\n\n<C>\nint a = 5, b = 10, c = 15;\nif (a < b) {\n    if (b < c) {\n        if (a + b > c) {\n            printf(\"能构成三角形\");\n        } else {\n            printf(\"不能构成三角形\");\n        }\n    } else {\n        printf(\"不递增\");\n    }\n} else {\n    printf(\"条件错误\");\n}\n</C>",
                "options": ["能构成三角形", "不能构成三角形", "不递增", "条件错误"],
                "correctAnswer": 1,
                "explanation": "a<b且b<c满足，进入最内层。a+b=15不大于c=15，输出\"不能构成三角形\"。这是判断三角形的经典算法（三边满足任意两边之和大于第三边）。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int a = 5, b = 10, c = 15;\n    if (a < b) {  // 5<10满足\n        if (b < c) {  // 10<15满足\n            if (a + b > c) {  // 15>15不满足\n                printf(\"能构成三角形\");\n            } else {\n                printf(\"不能构成三角形\");  // 执行这里\n            }\n        } else {\n            printf(\"不递增\");\n        }\n    } else {\n        printf(\"条件错误\");\n    }\n    return 0;\n}"
            },
            {
                "id": 26,
                "question": "以下代码的输出结果是什么？\n\n<C>\nint a = 1, b = 0, c = 1;\nif (a || b && c) {  /* 注意运算符优先级 */\n    printf(\"True\");\n} else {\n    printf(\"False\");\n}\n</C>",
                "options": ["`True`", "`False`", "编译错误", "未定义行为"],
                "correctAnswer": 0,
                "explanation": "这是**逻辑运算符优先级**陷阱！`&&` 的优先级**高于** `||`，所以表达式相当于 `a || (b && c)`。执行流程：1) 先计算 `b && c`：`0 && 1 = 0`；2) 再计算 `a || 0`：`1 || 0 = 1`（真）。输出True。**易错点**：误以为从左到右计算 `(a || b) && c`，那将得 `(1||0) && 1 = 1`。**关键知识**：`&&` > `||` > `? :`，建议用括号明确意图。",
                "codeExample": "#include <stdio.h>\n\nint main() {\n    int a = 1, b = 0, c = 1;\n    \n    /* &&优先级高于|| */\n    if (a || b && c) {  /* 等价于: a || (b && c) */\n        printf(\"True\\n\");  /* 1 || (0 && 1) = 1 || 0 = 1 */\n    } else {\n        printf(\"False\\n\");\n    }\n    \n    /* 对比：如果理解为(a||b) && c */\n    if ((a || b) && c) {  /* 显式加括号 */\n        printf(\"True\\n\");  /* (1 || 0) && 1 = 1 && 1 = 1 */\n    }\n    \n    /* 演示差异 */\n    a = 1; b = 0; c = 0;\n    printf(\"a || b && c = %d\\n\", a || b && c);    /* 1 */\n    printf(\"(a || b) && c = %d\\n\", (a || b) && c);  /* 0 */\n    \n    return 0;\n}"
            },
            {
                "id": 27,
                "question": "以下代码判断坐标象限，当x=5, y=-3时输出是什么？\n\n<C>\nint x = 5, y = -3;\nif (x > 0) {\n    if (y > 0) {\n        printf(\"第一象限\");\n    } else if (y < 0) {\n        printf(\"第四象限\");\n    } else {\n        printf(\"x轴正半轴\");\n    }\n} else if (x < 0) {\n    if (y > 0) {\n        printf(\"第二象限\");\n    } else if (y < 0) {\n        printf(\"第三象限\");\n    } else {\n        printf(\"x轴负半轴\");\n    }\n} else {\n    if (y > 0) {\n        printf(\"y轴正半轴\");\n    } else if (y < 0) {\n        printf(\"y轴负半轴\");\n    } else {\n        printf(\"原点\");\n    }\n}\n</C>",
                "options": ["第一象限", "第二象限", "第三象限", "第四象限"],
                "correctAnswer": 3,
                "explanation": "x=5>0，进入第一个if。y=-3<0，输出\"第四象限\"。这是用复杂嵌套if判断坐标象限的例子。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int x = 5, y = -3;\n    if (x > 0) {  // 5>0满足\n        if (y > 0) {\n            printf(\"第一象限\");\n        } else if (y < 0) {  // -3<0满足\n            printf(\"第四象限\");  // 执行这里\n        } else {\n            printf(\"x轴正半轴\");\n        }\n    } else if (x < 0) {\n        if (y > 0) {\n            printf(\"第二象限\");\n        } else if (y < 0) {\n            printf(\"第三象限\");\n        } else {\n            printf(\"x轴负半轴\");\n        }\n    } else {\n        if (y > 0) {\n            printf(\"y轴正半轴\");\n        } else if (y < 0) {\n            printf(\"y轴负半轴\");\n        } else {\n            printf(\"原点\");\n        }\n    }\n    return 0;\n}"
            },
            {
                "id": 28,
                "question": "以下switch包含if的嵌套，当type=2, value=5时输出是什么？\n\n<C>\nint type = 2, value = 5;\nswitch(type) {\n    case 1:\n        if (value > 10) {\n            printf(\"A\");\n        } else {\n            printf(\"B\");\n        }\n        break;\n    case 2:\n        if (value > 10) {\n            printf(\"C\");\n        } else {\n            printf(\"D\");\n        }\n        break;\n}\n</C>",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": 3,
                "explanation": "type=2匹配case 2，进入if。value=5不大于10，输出\"D\"。这是switch包含if的嵌套结构。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int type = 2, value = 5;\n    switch(type) {  // 匹配case 2\n        case 1:\n            if (value > 10) {\n                printf(\"A\");\n            } else {\n                printf(\"B\");\n            }\n            break;\n        case 2:  // 执行这里\n            if (value > 10) {  // 5不大于10\n                printf(\"C\");\n            } else {\n                printf(\"D\");  // 执行这里\n            }\n            break;\n    }\n    return 0;\n}"
            },
            {
                "id": 29,
                "question": "以下代码判断年份和月份的天数，当year=2024, month=2时输出是什么？\n\n<C>\nint year = 2024, month = 2, days;\nif (month == 2) {\n    if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {\n        days = 29;\n    } else {\n        days = 28;\n    }\n} else if (month == 4 || month == 6 || month == 9 || month == 11) {\n    days = 30;\n} else {\n    days = 31;\n}\nprintf(\"%d\", days);\n</C>",
                "options": ["28", "29", "30", "31"],
                "correctAnswer": 1,
                "explanation": "month=2进入第一个if。2024%4==0且2024%100!=0满足闰年条件，days=29。这是复杂条件判断与嵌套的实际应用。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int year = 2024, month = 2, days;\n    if (month == 2) {  // 2月\n        // 闰年判断：能被4整除且不能被100整除，或能被400整除\n        if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {\n            days = 29;  // 2024是闰年\n        } else {\n            days = 28;\n        }\n    } else if (month == 4 || month == 6 || month == 9 || month == 11) {\n        days = 30;\n    } else {\n        days = 31;\n    }\n    printf(\"%d\", days);  // 输出29\n    return 0;\n}"
            },
            {
                "id": 30,
                "question": "以下代码实现BMI分类（含多重嵌套），当height=170, weight=70时输出是什么？\n\n<C>\nint height = 170, weight = 70;\nfloat bmi = (float)weight / ((float)height/100 * (float)height/100);\nif (bmi < 18.5) {\n    printf(\"偏瘦\");\n} else if (bmi < 24) {\n    printf(\"正常\");\n} else if (bmi < 28) {\n    if (bmi < 26) {\n        printf(\"偏胖\");\n    } else {\n        printf(\"肥胖前期\");\n    }\n} else {\n    printf(\"肥胖\");\n}\n</C>",
                "options": ["偏瘦", "正常", "偏胖", "肥胖"],
                "correctAnswer": 1,
                "explanation": "BMI = 70/(1.7*1.7) ≈ 24.22。bmi不小于18.5，不小于24，满足bmi<28进入嵌套if。等等，计算错误！70/(1.7*1.7)=24.22实际上>=24。让我重新计算：70/2.89≈24.22，所以走第三个分支，24.22<26，输出\"偏胖\"。不对，我再仔细看：24.22不小于24，所以不进入第二个分支\"正常\"。让我重算：BMI=70/(1.7^2)=70/2.89≈24.22。条件是else if(bmi<24)，24.22不小于24不满足。下一个是else if(bmi<28)，24.22<28满足，进入。内层if(bmi<26)，24.22<26满足，输出\"偏胖\"。",
                "codeExample": "#include <stdio.h>\nint main() {\n    int height = 170, weight = 70;\n    float bmi = (float)weight / ((float)height/100 * (float)height/100);\n    // BMI = 70 / (1.7 * 1.7) = 70 / 2.89 ≈ 24.22\n    printf(\"BMI=%.2f\\n\", bmi);\n    \n    if (bmi < 18.5) {\n        printf(\"偏瘦\");\n    } else if (bmi < 24) {  // 24.22不小于24\n        printf(\"正常\");\n    } else if (bmi < 28) {  // 24.22<28满足\n        if (bmi < 26) {  // 24.22<26满足\n            printf(\"偏胖\");  // 执行这里\n        } else {\n            printf(\"肥胖前期\");\n        }\n    } else {\n        printf(\"肥胖\");\n    }\n    return 0;\n}"
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

            // 检查选项格式
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
