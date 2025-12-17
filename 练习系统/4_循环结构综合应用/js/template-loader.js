// 模板加载器 - 负责动态加载题库数据
class TemplateLoader {
    constructor() {
        this.questions = [];
        // 移除外部JSON依赖，不再需要dataPath
    }

    // 简化loadQuestions方法，直接使用内置题库
    loadQuestions() {
        try {
            const questions = this.getBuiltInQuestions();
            this.validateQuestions(questions);
            this.questions = questions;
            // 打乱题库顺序
            this.shuffleQuestions();
            // 重新分配题目ID（保持1到n的顺序）
            this.reassignQuestionIds();
            console.log('成功加载内置题库，共', this.questions.length, '题');
            return this.questions; // 返回题库数组而不是布尔值
        } catch (error) {
            console.error('加载题库失败:', error);
            throw error; // 抛出错误以便上层处理
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

    // 获取内置题库 - 专注于while/do-while循环、break/continue、循环嵌套
    getBuiltInQuestions() {
        return [
            // ========== 第1-8题：while循环基础 ==========
            {
                id: 1,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 0;\nwhile (i++ < 5) {\n    printf(\"%d \", i);\n}\n</C>",
                options: ["`1 2 3 4 5`", "`0 1 2 3 4`", "`0 1 2 3 4 5`", "`1 2 3 4 5 6`"],
                correctAnswer: 0,
                explanation: "这是**后缀自增在循环条件中**的陷阱！`i++<5`先用i的值（0）比较，然后i自增为1。执行流程：1) i=0比较0<5真，i变1，输出1；2) i=1比较1<5真，i变2，输出2；...；5) i=4比较4<5真，i变5，输出5；6) i=5比较5<5假，退出。**关键点**：后缀++先使用再自增，所以判断时用旧值，输出时用新值。**易错点**：误以为从0开始输出或从1到6。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    \n    /* 后缀自增：先比较后自增 */\n    while (i++ < 5) {  /* 先用i值比较，再i自增 */\n        printf(\"%d \", i);  /* 输出自增后的值 */\n    }\n    printf(\"\\n最终i=%d\\n\", i);  /* 输出6 */\n    \n    /* 对比：前缀自增 */\n    int j = 0;\n    while (++j < 5) {  /* 先自增，再比较 */\n        printf(\"%d \", j);  /* 输出1 2 3 4 */\n    }\n    printf(\"\\n最终j=%d\\n\", j);  /* 输出5 */\n    \n    return 0;\n}"
            },
            {
                id: 2,
                question: "以下代码执行后sum的值是多少？\n\n<C>\nint i = 1, sum = 0;\nwhile (i <= 10) {\n    sum += i;\n    i++;\n}\nprintf(\"%d\", sum);\n</C>",
                options: ["45", "55", "10", "0"],
                correctAnswer: 1,
                explanation: "while循环累加1到10的所有整数：1+2+3+...+10=55。这是while循环求和的经典应用。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1, sum = 0;\n    while (i <= 10) {\n        sum += i;  // sum = sum + i\n        i++;\n    }\n    printf(\"%d\", sum);  // 输出55\n    return 0;\n}"
            },
            {
                id: 3,
                question: "以下代码的输出结果是什么？\n\n<C>\nint n = 5;\nwhile (n > 0) {\n    printf(\"%d \", n);\n    n--;\n}\n</C>",
                options: ["5 4 3 2 1", "1 2 3 4 5", "5 4 3 2", "无限循环"],
                correctAnswer: 0,
                explanation: "while循环从n=5开始递减，每次输出n并减1，直到n=0时停止。输出5 4 3 2 1。",
                codeExample: "#include <stdio.h>\nint main() {\n    int n = 5;\n    while (n > 0) {\n        printf(\"%d \", n);  // 输出5 4 3 2 1\n        n--;\n    }\n    return 0;\n}"
            },
            {
                id: 4,
                question: "以下代码会输出什么？\n\n<C>\nint i = 0;\nwhile (i < 3) {\n    printf(\"%d \", i);\n    i += 2;\n}\n</C>",
                options: ["0 2", "0 1 2", "0 2 4", "无输出"],
                correctAnswer: 0,
                explanation: "i从0开始，每次增加2。i=0时输出0，i变为2；i=2时输出2，i变为4；i=4不满足i<3，循环结束。输出0 2。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 0;\n    while (i < 3) {\n        printf(\"%d \", i);  // 输出0 2\n        i += 2;\n    }\n    return 0;\n}"
            },
            {
                id: 5,
                question: "以下while循环执行多少次？\n\n<C>\nint count = 0, i = 10;\nwhile (i >= 5) {\n    count++;\n    i -= 2;\n}\nprintf(\"%d\", count);\n</C>",
                options: ["2", "3", "4", "5"],
                correctAnswer: 1,
                explanation: "i从10开始，每次减2。i=10(>=5)执行1次，i=8(>=5)执行2次，i=6(>=5)执行3次，i=4(<5)停止。共3次。",
                codeExample: "#include <stdio.h>\nint main() {\n    int count = 0, i = 10;\n    while (i >= 5) {\n        count++;\n        printf(\"第%d次，i=%d\\n\", count, i);\n        i -= 2;\n    }\n    printf(\"共执行%d次\", count);  // 输出3\n    return 0;\n}"
            },
            {
                id: 6,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i;\nfor (i = 0; i < 5; i++) {\n    printf(\"%d \", i);\n    i++;  /* 循环体内也自增 */\n}\n</C>",
                options: ["`0 2 4`", "`0 1 2 3 4`", "`0 1 2 3 4 5`", "无限循环"],
                correctAnswer: 0,
                explanation: "这是**循环体内修改循环变量**的陷阱！每次迭代：1) 循环体内`i++`使i增1；2) for语句的`i++`再增1，所以i每次增2。执行流程：i=0输出0，体内i变1，for的i++使i变2；i=2<5输出2，体内i变3，for的i++使i变4；i=4<5输出4，体内i变5，for的i++使i变6；i=6不<5退出。**易错点**：忘记for语句本身也有i++。**重要规则**：避免在循环体内修改循环变量！",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i;\n    \n    /* 危险：循环体内修改循环变量 */\n    for (i = 0; i < 5; i++) {\n        printf(\"%d \", i);  /* 输出0 2 4 */\n        i++;  /* 体内自增，加上for的i++，每次增2 */\n    }\n    printf(\"\\n最终i=%d\\n\", i);  /* i=6 */\n    \n    /* 正确做法：不在体内修改i */\n    for (i = 0; i < 5; i++) {\n        printf(\"%d \", i);  /* 输出0 1 2 3 4 */\n    }\n    \n    return 0;\n}"
            },
            {
                id: 7,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 1;\nwhile (i <= 10) {\n    if (i % 2 == 0) {\n        printf(\"%d \", i);\n    }\n    i++;\n}\n</C>",
                options: ["2 4 6 8 10", "1 3 5 7 9", "1 2 3 4 5", "无输出"],
                correctAnswer: 0,
                explanation: "while循环从1到10，只有当i是偶数时才输出。输出2 4 6 8 10。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1;\n    while (i <= 10) {\n        if (i % 2 == 0) {\n            printf(\"%d \", i);  // 输出偶数\n        }\n        i++;\n    }\n    return 0;\n}"
            },
            {
                id: 8,
                question: "以下代码判断条件有什么问题？\n\n<C>\nint i = 5;\nwhile (i) {\n    printf(\"%d \", i);\n    i--;\n}\n</C>",
                options: ["会死循环", "会输出5到1", "会输出5到0", "编译错误"],
                correctAnswer: 1,
                explanation: "while(i)等价于while(i!=0)。i从5递减到1，每个都不为0输出；i=0时循环停止。输出5 4 3 2 1。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 5;\n    while (i) {  // 等价于 while(i != 0)\n        printf(\"%d \", i);  // 输出5 4 3 2 1\n        i--;\n    }\n    return 0;\n}"
            },
            
            // ========== 第9-16题：do-while循环基础 ==========
            {
                id: 9,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 1;\ndo {\n    printf(\"%d \", i);\n    i++;\n} while (i <= 5);\n</C>",
                options: ["1 2 3 4 5", "2 3 4 5 6", "1 2 3 4", "无输出"],
                correctAnswer: 0,
                explanation: "do-while先执行循环体再判断条件。从i=1开始输出并自增，直到i>5停止。输出1 2 3 4 5。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1;\n    do {\n        printf(\"%d \", i);  // 先执行\n        i++;\n    } while (i <= 5);  // 后判断\n    return 0;\n}"
            },
            {
                id: 10,
                question: "while和do-while的关键区别是什么？\n\n<C>\nint i = 10;\nwhile (i < 5) {\n    printf(\"A\");\n}\n\nint j = 10;\ndo {\n    printf(\"B\");\n} while (j < 5);\n</C>",
                options: ["都输出A和B", "都不输出", "只输出B", "只输出A"],
                correctAnswer: 2,
                explanation: "while先判断条件(i<5不满足)，循环体不执行。do-while先执行循环体输出B，再判断条件(j<5不满足)，不再执行。do-while至少执行一次。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 10;\n    while (i < 5) {  // 条件不满足，不执行\n        printf(\"A\");\n    }\n    \n    int j = 10;\n    do {\n        printf(\"B\");  // 至少执行一次\n    } while (j < 5);  // 条件不满足，不再执行\n    \n    return 0;\n}"
            },
            {
                id: 11,
                question: "以下代码的输出结果是什么？\n\n<C>\nint count = 0;\nint flag = 0;\ndo {\n    count++;\n} while (flag);\nprintf(\"%d\", count);\n</C>",
                options: ["`0`", "`1`", "无限循环", "编译错误"],
                correctAnswer: 1,
                explanation: "这是**do-while至少执行一次**的经典陷阱！即使条件`while(flag)`一开始就为假（flag=0），do-while仍会先执行一次循环体，使count变为1，然后判断条件flag=0为假，退出循环。输出1。**关键区别**：while循环条件为假时一次不执行，do-while即使条件为假也至少执行一次。**应用场景**：菜单系统、至少需要执行一次的输入验证。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int count = 0;\n    int flag = 0;\n    \n    /* do-while至少执行一次 */\n    do {\n        count++;\n        printf(\"执行了一次\\n\");\n    } while (flag);  /* flag=0为假，但已执行过一次 */\n    printf(\"count=%d\\n\", count);  /* 输出1 */\n    \n    /* 对比：while一次都不执行 */\n    int count2 = 0;\n    while (flag) {  /* flag=0，一次都不执行 */\n        count2++;\n    }\n    printf(\"count2=%d\\n\", count2);  /* 输出0 */\n    \n    return 0;\n}"
            },
            {
                id: 12,
                question: "以下代码的输出结果是什么？\n\n<C>\nint n = 0;\ndo {\n    printf(\"%d \", n);\n    n++;\n} while (n < 0);\n</C>",
                options: ["0", "无输出", "0 1", "无限循环"],
                correctAnswer: 0,
                explanation: "do-while至少执行一次循环体，输出0后n变为1。判断n<0不满足，循环结束。只输出0。",
                codeExample: "#include <stdio.h>\nint main() {\n    int n = 0;\n    do {\n        printf(\"%d \", n);  // 至少执行一次，输出0\n        n++;\n    } while (n < 0);  // 1<0不满足，结束\n    return 0;\n}"
            },
            {
                id: 13,
                question: "以下do-while循环执行多少次？\n\n<C>\nint count = 0, i = 5;\ndo {\n    count++;\n    i--;\n} while (i > 0);\nprintf(\"%d\", count);\n</C>",
                options: ["4", "5", "6", "0"],
                correctAnswer: 1,
                explanation: "i从5开始，每次递减。i=5执行1次，i=4执行2次，i=3执行3次，i=2执行4次，i=1执行5次，i=0不满足i>0停止。共5次。",
                codeExample: "#include <stdio.h>\nint main() {\n    int count = 0, i = 5;\n    do {\n        count++;\n        printf(\"第%d次，i=%d\\n\", count, i);\n        i--;\n    } while (i > 0);\n    printf(\"共执行%d次\", count);  // 输出5\n    return 0;\n}"
            },
            {
                id: 14,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 10;\ndo {\n    printf(\"%d \", i);\n    i -= 3;\n} while (i > 0);\n</C>",
                options: ["10 7 4 1", "10 7 4", "10 7", "10"],
                correctAnswer: 1,
                explanation: "i从10开始，每次减3。输出10(i=7>0继续)，输出7(i=4>0继续)，输出4(i=1>0继续)，输出1(i=-2不大于0停止)。等等重新分析：i=10输出10，i=7>0继续输出7，i=4>0继续输出4，i=1>0继续输出1，i=-2<=0停止。所以输出10 7 4 1。不对，让我再看：do{print i; i-=3}while(i>0)。i=10打印10，i变7，7>0继续；i=7打印7，i变4，4>0继续；i=4打印4，i变1，1>0继续；i=1打印1，i变-2，-2不>0停止。输出10 7 4 1。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 10;\n    do {\n        printf(\"%d \", i);\n        i -= 3;\n    } while (i > 0);\n    // 输出：10 7 4 1\n    return 0;\n}"
            },
            {
                id: 15,
                question: "以下代码打印倒数，输出结果是什么？\n\n<C>\nint countdown = 3;\ndo {\n    printf(\"%d... \", countdown);\n    countdown--;\n} while (countdown > 0);\nprintf(\"发射!\");\n</C>",
                options: ["3... 2... 1... 发射!", "2... 1... 发射!", "3... 2... 发射!", "发射!"],
                correctAnswer: 0,
                explanation: "do-while从3倒数到1，每次输出当前数字并递减，最后输出\"发射!\"。这是do-while实现倒计时的经典应用。",
                codeExample: "#include <stdio.h>\nint main() {\n    int countdown = 3;\n    do {\n        printf(\"%d... \", countdown);\n        countdown--;\n    } while (countdown > 0);\n    printf(\"发射!\");\n    // 输出：3... 2... 1... 发射!\n    return 0;\n}"
            },
            {
                id: 16,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i, j;\nfor (i = 0, j = 10; i < j; i++, j--) {\n    printf(\"%d \", i + j);\n}\n</C>",
                options: ["`10 10 10 10 10`", "`10 8 6 4 2`", "`0 2 4 6 8`", "`10`"],
                correctAnswer: 0,
                explanation: "这是**逗号表达式在for循环中**的巧妙应用！for循环的初始化、更新部分都可以包含多个表达式（用逗号分隔）。执行流程：1) i=0,j=10，i+j=10；2) i=1,j=9，i+j=10；3) i=2,j=8，i+j=10；4) i=3,j=7，i+j=10；5) i=4,j=6，i+j=10；6) i=5,j=5不满足i<j退出。输出5个10。**关键点**：i递增的同时j递减，和保持不变。**应用**：双指针技巧、数组两端向中间遍历。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i, j;\n    \n    /* 逗号表达式：i递增j递减 */\n    for (i = 0, j = 10; i < j; i++, j--) {\n        printf(\"i=%d, j=%d, 和=%d\\n\", i, j, i + j);\n    }\n    /* 输出：\n     * i=0, j=10, 和=10\n     * i=1, j=9,  和=10\n     * i=2, j=8,  和=10\n     * i=3, j=7,  和=10\n     * i=4, j=6,  和=10\n     */\n    \n    printf(\"循环后i=%d, j=%d\\n\", i, j);  /* i=5, j=5 */\n    \n    return 0;\n}"
            },
            
            // ========== 第17-23题：break和continue的使用 ==========
            {
                id: 17,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 1;\nwhile (i <= 10) {\n    if (i == 5) {\n        break;\n    }\n    printf(\"%d \", i);\n    i++;\n}\n</C>",
                options: ["1 2 3 4", "1 2 3 4 5", "1 2 3 4 5 6", "无输出"],
                correctAnswer: 0,
                explanation: "当i=5时执行break跳出循环，之前输出了1 2 3 4。break用于立即终止循环。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1;\n    while (i <= 10) {\n        if (i == 5) {\n            printf(\"遇到5，跳出循环\\n\");\n            break;  // 终止循环\n        }\n        printf(\"%d \", i);\n        i++;\n    }\n    // 输出：1 2 3 4 遇到5，跳出循环\n    return 0;\n}"
            },
            {
                id: 18,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 1;\nwhile (i <= 10) {\n    i++;\n    if (i % 2 == 0) {\n        continue;\n    }\n    printf(\"%d \", i);\n}\n</C>",
                options: ["3 5 7 9 11", "2 4 6 8 10", "1 3 5 7 9", "1 2 3 4 5"],
                correctAnswer: 0,
                explanation: "i先自增再判断。i为偶数时continue跳过printf，只输出奇数。i从2开始，输出3 5 7 9 11。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1;\n    while (i <= 10) {\n        i++;  // 先自增：2,3,4...\n        if (i % 2 == 0) {\n            continue;  // 偶数跳过\n        }\n        printf(\"%d \", i);  // 输出奇数：3 5 7 9 11\n    }\n    return 0;\n}"
            },
            {
                id: 19,
                question: "以下代码找第一个能被7整除的数，输出是什么？\n\n<C>\nint i = 1;\nwhile (i <= 100) {\n    if (i % 7 == 0) {\n        printf(\"%d\", i);\n        break;\n    }\n    i++;\n}\n</C>",
                options: ["7", "14", "21", "0"],
                correctAnswer: 0,
                explanation: "从1开始找，第一个能被7整除的是7，输出7后break跳出循环。这是break用于查找的典型应用。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1;\n    while (i <= 100) {\n        if (i % 7 == 0) {\n            printf(\"找到第一个能被7整除的数：%d\", i);\n            break;  // 找到后立即退出\n        }\n        i++;\n    }\n    return 0;\n}"
            },
            {
                id: 20,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 0;\nwhile (i < 10) {\n    i++;\n    if (i == 3 || i == 7) {\n        continue;\n    }\n    printf(\"%d \", i);\n}\n</C>",
                options: ["1 2 4 5 6 8 9 10", "1 2 3 4 5 6 7 8 9 10", "0 1 2 4 5 6 8 9", "1 2 4 5 6 8 9"],
                correctAnswer: 0,
                explanation: "i先自增，当i=3或i=7时continue跳过输出。输出除3和7外的1到10：1 2 4 5 6 8 9 10。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 0;\n    while (i < 10) {\n        i++;\n        if (i == 3 || i == 7) {\n            printf(\"跳过%d\\n\", i);\n            continue;\n        }\n        printf(\"%d \", i);\n    }\n    // 输出：1 2 跳过3 4 5 6 跳过7 8 9 10\n    return 0;\n}"
            },
            {
                id: 21,
                question: "以下代码计算1到100中偶数之和，输出是什么？\n\n<C>\nint i = 1, sum = 0;\nwhile (i <= 100) {\n    if (i % 2 != 0) {\n        i++;\n        continue;\n    }\n    sum += i;\n    i++;\n}\nprintf(\"%d\", sum);\n</C>",
                options: ["2550", "5050", "2500", "2450"],
                correctAnswer: 0,
                explanation: "奇数时continue跳过累加，只累加偶数2+4+6+...+100=2550。等差数列求和：(2+100)×50÷2=2550。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1, sum = 0;\n    while (i <= 100) {\n        if (i % 2 != 0) {  // 奇数\n            i++;\n            continue;  // 跳过累加\n        }\n        sum += i;  // 只累加偶数\n        i++;\n    }\n    printf(\"1到100偶数和=%d\", sum);  // 输出2550\n    return 0;\n}"
            },
            {
                id: 22,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 0;\ndo {\n    i++;\n    if (i == 3) {\n        break;\n    }\n    printf(\"%d \", i);\n} while (i < 5);\n</C>",
                options: ["1 2", "1 2 3", "1", "0 1 2"],
                correctAnswer: 0,
                explanation: "do-while中，i=1输出1，i=2输出2，i=3时break跳出。输出1 2。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 0;\n    do {\n        i++;\n        if (i == 3) {\n            break;  // i=3时跳出\n        }\n        printf(\"%d \", i);\n    } while (i < 5);\n    // 输出：1 2\n    return 0;\n}"
            },
            {
                id: 23,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 1;\nwhile (i <= 5) {\n    if (i == 2) {\n        i++;\n        continue;\n    }\n    printf(\"%d \", i);\n    i++;\n}\n</C>",
                options: ["1 3 4 5", "1 2 3 4 5", "1 3 5", "1 4 5"],
                correctAnswer: 0,
                explanation: "i=1输出1，i=2时先自增为3再continue跳过输出，i=3输出3，i=4输出4，i=5输出5。输出1 3 4 5。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1;\n    while (i <= 5) {\n        if (i == 2) {\n            i++;  // 必须先自增，否则死循环\n            continue;\n        }\n        printf(\"%d \", i);\n        i++;\n    }\n    // 输出：1 3 4 5\n    return 0;\n}"
            },
            
            // ========== 第24-30题：循环嵌套（高难度） ==========
            {
                id: 24,
                question: "以下嵌套while循环的输出结果是什么？\n\n<C>\nint i = 1, j;\nwhile (i <= 3) {\n    j = 1;\n    while (j <= 2) {\n        printf(\"%d%d \", i, j);\n        j++;\n    }\n    i++;\n}\n</C>",
                options: ["11 12 21 22 31 32", "11 21 31 12 22 32", "11 12 13 21 22 23", "11 22 33"],
                correctAnswer: 0,
                explanation: "外层循环i从1到3，每次外层循环时内层循环j从1到2。输出所有i-j组合：11 12 21 22 31 32。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1, j;\n    while (i <= 3) {\n        j = 1;\n        while (j <= 2) {\n            printf(\"%d%d \", i, j);\n            j++;\n        }\n        i++;\n    }\n    // 输出：11 12 21 22 31 32\n    return 0;\n}"
            },
            {
                id: 25,
                question: "以下嵌套循环打印矩形，输出多少个星号？\n\n<C>\nint i = 1, j;\nwhile (i <= 3) {\n    j = 1;\n    while (j <= 4) {\n        printf(\"*\");\n        j++;\n    }\n    printf(\"\\n\");\n    i++;\n}\n</C>",
                options: ["7", "12", "10", "9"],
                correctAnswer: 1,
                explanation: "外层循环3次(行)，内层循环每次4次(列)，共输出3×4=12个星号。这是嵌套循环打印矩形的例子。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1, j, count = 0;\n    while (i <= 3) {\n        j = 1;\n        while (j <= 4) {\n            printf(\"*\");\n            count++;\n            j++;\n        }\n        printf(\"\\n\");\n        i++;\n    }\n    printf(\"共%d个星号\", count);  // 输出12\n    return 0;\n}"
            },
            {
                id: 26,
                question: "以下嵌套循环的输出结果是什么？\n\n<C>\nint i, j;\nfor (i = 0; i < 2; i++) {\n    for (j = 0; j < 3; j++) {\n        if (j == 1) continue;\n        printf(\"%d%d \", i, j);\n    }\n}\n</C>",
                options: ["`00 02 10 12`", "`00 01 02 10 11 12`", "`00 10`", "`02 12`"],
                correctAnswer: 0,
                explanation: "这是**嵌套循环中continue作用域**陷阱！`continue`只跳过**当前迭代**，继续**同层**循环的下一次迭代。执行流程：i=0时：j=0输出00，j=1时continue跳过，j=2输出02；i=1时：j=0输出10，j=1时continue跳过，j=2输出12。输出`00 02 10 12`。**关键区别**：continue跳过剩余代码但继续循环，break直接退出循环。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i, j;\n    \n    /* continue只跳过当前迭代 */\n    printf(\"输出：\");\n    for (i = 0; i < 2; i++) {\n        for (j = 0; j < 3; j++) {\n            if (j == 1) continue;  /* 跳过j=1，继续ad=2 */\n            printf(\"%d%d \", i, j);\n        }\n    }\n    printf(\"\\n\");  /* 输出00 02 10 12 */\n    \n    /* 对比break */\n    printf(\"使用break：\");\n    for (i = 0; i < 2; i++) {\n        for (j = 0; j < 3; j++) {\n            if (j == 1) break;  /* j=1时退出内层 */\n            printf(\"%d%d \", i, j);\n        }\n    }\n    printf(\"\\n\");  /* 输出00 10 */\n    \n    return 0;\n}"
            },
            {
                id: 27,
                question: "以下嵌套循环中break只跳出哪一层？\n\n<C>\nint i = 1, j;\nwhile (i <= 3) {\n    j = 1;\n    while (j <= 3) {\n        if (j == 2) {\n            break;\n        }\n        printf(\"%d%d \", i, j);\n        j++;\n    }\n    i++;\n}\n</C>",
                options: ["11 21 31", "11 12 21 22 31 32", "11", "无输出"],
                correctAnswer: 0,
                explanation: "break只跳出内层while循环。每次内层循环j=1输出，j=2时break退出内层循环，外层循环继续。输出11 21 31。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1, j;\n    while (i <= 3) {\n        j = 1;\n        while (j <= 3) {\n            if (j == 2) {\n                printf(\"(内层break) \");\n                break;  // 只跳出内层循环\n            }\n            printf(\"%d%d \", i, j);\n            j++;\n        }\n        i++;\n    }\n    // 输出：11 (内层break) 21 (内层break) 31 (内层break)\n    return 0;\n}"
            },
            {
                id: 28,
                question: "以下代码的输出结果是什么？\n\n<C>\nint i = 5;\nwhile (i = 0) {  /* 注意：=而不是== */\n    printf(\"%d \", i);\n}\nprintf(\"结束\");\n</C>",
                options: ["`5 4 3 2 1 0 结束`", "无限循环", "`结束`", "编译错误"],
                correctAnswer: 2,
                explanation: "这是**循环条件中赋值与比较混淆**的危险陷阱！`while(i=0)`是**赋值表达式**，将i赋值为0，并返回0（假）。循环条件一开始就为假，循环体**一次都不执行**，直接输出“结束”。**致命错误**：写成`while(i=0)`而不是`while(i==0)`或`while(i!=0)`。**防范方法**：1) 开启编译器警告；2) 使用Yoda条件：`if(0==i)`而不是`if(i==0)`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 5;\n    \n    /* 错误：赋值而不是比较 */\n    while (i = 0) {  /* i被赋值为0，表达式值为0（假） */\n        printf(\"%d \", i);  /* 不执行 */\n    }\n    printf(\"结束\\n\");  /* 直接输出 */\n    printf(\"i的值为: %d\\n\", i);  /* i=0（被修改了） */\n    \n    /* 正确写法 */\n    i = 5;\n    while (i != 0) {  /* 使用比较运算符 */\n        printf(\"%d \", i);\n        i--;\n    }\n    printf(\"\\n正确结束\\n\");\n    \n    /* 防御性编程：Yoda条件 */\n    if (0 == i) {  /* 写成i=0会编译错误 */\n        printf(\"安全\\n\");\n    }\n    \n    return 0;\n}"
            },
            {
                id: 29,
                question: "以下三层嵌套while，最内层循环总共执行多少次？\n\n<C>\nint i = 1, j, k, count = 0;\nwhile (i <= 2) {\n    j = 1;\n    while (j <= 2) {\n        k = 1;\n        while (k <= 2) {\n            count++;\n            k++;\n        }\n        j++;\n    }\n    i++;\n}\nprintf(\"%d\", count);\n</C>",
                options: ["2", "4", "6", "8"],
                correctAnswer: 3,
                explanation: "三层循环各执行2次，最内层总执行次数=2×2×2=8次。这是三层嵌套循环的计数问题。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1, j, k, count = 0;\n    while (i <= 2) {  // 外层2次\n        j = 1;\n        while (j <= 2) {  // 中层每次2次\n            k = 1;\n            while (k <= 2) {  // 内层每次2次\n                count++;\n                printf(\"i=%d,j=%d,k=%d count=%d\\n\", i, j, k, count);\n                k++;\n            }\n            j++;\n        }\n        i++;\n    }\n    printf(\"最内层共执行%d次\", count);  // 输出8\n    return 0;\n}"
            },
            {
                id: 30,
                question: "以下嵌套循环使用continue，输出是什么？\n\n<C>\nint i = 1, j;\nwhile (i <= 3) {\n    j = 1;\n    while (j <= 3) {\n        if (i == j) {\n            j++;\n            continue;\n        }\n        printf(\"%d%d \", i, j);\n        j++;\n    }\n    i++;\n}\n</C>",
                options: ["12 13 21 23 31 32", "11 22 33", "12 21 23 31 32", "11 12 13 21 22 23"],
                correctAnswer: 0,
                explanation: "当i==j时(对角线位置)跳过输出。不输出11、22、33，输出其余组合：12 13 21 23 31 32。",
                codeExample: "#include <stdio.h>\nint main() {\n    int i = 1, j;\n    while (i <= 3) {\n        j = 1;\n        while (j <= 3) {\n            if (i == j) {\n                printf(\"(%d%d跳过) \", i, j);\n                j++;\n                continue;\n            }\n            printf(\"%d%d \", i, j);\n            j++;\n        }\n        i++;\n    }\n    // 输出：(11跳过) 12 13 21 (22跳过) 23 31 32 (33跳过)\n    return 0;\n}"
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

            // 检查正确答案
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
