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
            console.log('成功加载内置题库，共', this.questions.length, '题');
            return questions; // 返回题库数组而不是布尔值
        } catch (error) {
            console.error('加载题库失败:', error);
            throw error; // 抛出错误以便上层处理
        }
    }

    // 获取内置题库（包含所有题目）
    getBuiltInQuestions() {
        return [
            {
                id: 1,
                question: "以下关于for循环和while循环的说法中，正确的是：",
                options: [
                    "for循环只能用于已知循环次数的情况",
                    "while循环不能用于已知循环次数的情况",
                    "for循环和while循环在功能上完全等价",
                    "for循环适合处理数组等集合类型数据"
                ],
                correctAnswer: 2,
                explanation: "for循环和while循环在功能上是等价的，可以相互转换。for循环通常用于已知循环次数的情况，而while循环通常用于循环次数不确定的情况，但这不是绝对的规则。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // for循环示例\n    for (int i = 0; i < 10; i++) {\n        printf(\"%d \", i);\n    }\n    \n    printf(\"\\n\");\n    \n    // 等价的while循环\n    int i = 0;\n    while (i < 10) {\n        printf(\"%d \", i);\n        i++;\n    }\n    \n    return 0;\n}"
            },
            {
                id: 2,
                question: "在C语言中，for循环的三个表达式可以省略，但分号不能省略。以下哪种写法是正确的？",
                options: [
                    "for (;;); // 死循环",
                    "for (i = 0;; i++); // 死循环",
                    "for (; i < 10;); // 死循环",
                    "所有选项都正确"
                ],
                correctAnswer: 3,
                explanation: "在C语言中，for循环的三个表达式（初始化、条件判断、增量）都可以省略，但分号不能省略。当条件表达式省略时，默认为真，形成死循环。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    \n    // 正确的死循环写法\n    // for (;;) {\n    //     // 循环体\n    // }\n    \n    // 初始化表达式省略\n    i = 0;\n    for (; i < 10; i++) {\n        printf(\"%d \", i);\n    }\n    printf(\"\\n\");\n    \n    // 条件表达式省略（死循环）\n    // for (i = 0;; i++) {\n    //     // 循环体\n    // }\n    \n    // 增量表达式省略\n    i = 0;\n    for (i = 0; i < 10;) {\n        printf(\"%d \", i);\n        i++; // 在循环体内手动递增\n    }\n    \n    return 0;\n}"
            },
            {
                id: 3,
                question: "以下代码片段的输出结果是什么？\n\n```c\nint i = 0;\nfor (i = 1; i < 6; i++) {\n    printf(\"%d \", i);\n}\n```",
                options: [
                    "1 2 3 4 5",
                    "1 2 3 4 5 6",
                    "1 2 3 4 5 6 7",
                    "无限循环"
                ],
                correctAnswer: 0,
                explanation: "当i=5时，条件i<6成立，执行循环体，然后i变为6，条件i<6不成立，循环结束。所以输出结果为1 2 3 4 5。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    for (i = 1; i < 6; i++) {\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 4,
                question: "以下代码片段的输出结果是什么？\n\n```c\nint i;\nfor (i = 10; i > 0; i--) {\n    printf(\"%d \", i);\n}\n```",
                options: [
                    "10 9 8 7 6 5 4 3 2 1",
                    "9 8 7 6 5 4 3 2 1 0",
                    "10 9 8 7 6 5 4 3 2 1 0",
                    "没有输出"
                ],
                correctAnswer: 0,
                explanation: "这是一个递减循环，初始值为10，当i>0时执行循环体，每次循环i减1。所以输出结果为10 9 8 7 6 5 4 3 2 1。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i;\n    for (i = 10; i > 0; i--) {\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 5,
                question: "以下关于do-while循环的说法中，正确的是：",
                options: [
                    "do-while循环至少执行一次循环体",
                    "do-while循环的循环体可能一次都不执行",
                    "do-while循环不能用于已知循环次数的情况",
                    "do-while循环与while循环功能完全相同"
                ],
                correctAnswer: 0,
                explanation: "do-while循环的特点是先执行循环体，然后再判断条件，所以至少会执行一次循环体。而while循环是先判断条件，条件为真才执行循环体，可能一次都不执行。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // do-while循环示例（至少执行一次）\n    int i = 0;\n    do {\n        printf(\"%d \", i);\n        i++;\n    } while (i > 0);\n    \n    // 注意：上面的循环是死循环，因为条件永远为真\n    // 实际使用中应该有适当的退出条件\n    \n    // 更实际的do-while示例\n    int j = 0;\n    do {\n        printf(\"j = %d\\n\", j);\n        j++;\n    } while (j < 3);\n    \n    // while循环示例（可能不执行）\n    int k = 0;\n    while (k > 0) {\n        printf(\"k = %d\\n\", k); // 不会执行\n        k++;\n    }\n    \n    return 0;\n}"
            },
            {
                id: 6,
                question: "以下代码片段的输出结果是什么？\n\n```c\nint i = 0;\nwhile (i < 5) {\n    printf(\"%d \", i++);\n}\n```",
                options: [
                    "0 1 2 3 4 5 6 7 8 9",
                    "0 1 2 3 4",
                    "1 2 3 4 5",
                    "没有输出"
                ],
                correctAnswer: 1,
                explanation: "初始i=0，先判断条件i<5成立，执行循环体输出0，然后i自增为1。继续循环，直到i=5时条件不成立，循环结束。所以输出0 1 2 3 4。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    while (i < 5) {\n        printf(\"%d \", i++);\n    }\n    return 0;\n}"
            },
            {
                id: 7,
                question: "以下关于break语句和continue语句的说法中，正确的是：",
                options: [
                    "break语句可以提前结束循环，而continue语句只是跳过当前循环的剩余部分",
                    "continue语句可以提前结束循环，而break语句只是跳过当前循环的剩余部分",
                    "break语句和continue语句都可以提前结束循环",
                    "break语句和continue语句都只能跳过当前循环的剩余部分"
                ],
                correctAnswer: 0,
                explanation: "break语句用于提前结束循环，跳出循环体；而continue语句用于跳过当前循环的剩余部分，继续执行下一次循环。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // break示例\n    for (int i = 0; i < 10; i++) {\n        if (i == 5) {\n            break; // 当i=5时跳出循环\n        }\n        printf(\"%d \", i); // 输出0 1 2 3 4\n    }\n    \n    printf(\"\\n\");\n    \n    // continue示例\n    for (int i = 0; i < 10; i++) {\n        if (i == 5) {\n            continue; // 当i=5时跳过当前循环的剩余部分\n        }\n        printf(\"%d \", i); // 输出0 1 2 3 4 6 7 8 9\n    }\n    \n    return 0;\n}"
            },
            {
                id: 8,
                question: "以下代码片段的输出结果是什么？\n\n```c\nfor (int i = 1; i <= 10; i++) {\n    if (i > 5) {\n        break;\n    }\n    printf(\"%d \", i);\n}\n```",
                options: [
                    "1 2 3 4 5 6 7 8 9 10",
                    "1 2 3 4 5",
                    "6 7 8 9 10",
                    "没有输出"
                ],
                correctAnswer: 1,
                explanation: "当i=5时，遇到break语句，直接跳出整个循环，不再执行后续的循环体。所以输出1 2 3 4 5。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 10; i++) {\n        if (i > 5) {\n            break;\n        }\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 9,
                question: "以下代码片段的输出结果是什么？\n\n```c\nfor (int i = 1; i <= 10; i++) {\n    if (i % 2 != 0) { // i为奇数\n        continue;\n    }\n    printf(\"%d \", i);\n}\n```",
                options: [
                    "1 2 3 4 5 6 7 8 9 10",
                    "1 2 3 4 5",
                    "2 4 6 8 10",
                    "1 3 5 7 9"
                ],
                correctAnswer: 2,
                explanation: "当i为奇数时，遇到continue语句，跳过当前循环的剩余部分，直接进入下一次循环。所以只有偶数会被输出：2 4 6 8 10。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 10; i++) {\n        if (i % 2 != 0) { // i为奇数\n            continue;\n        }\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 10,
                question: "以下关于嵌套循环的说法中，正确的是：",
                options: [
                    "外层循环每执行一次，内层循环执行全部次数",
                    "内层循环每执行一次，外层循环执行一次",
                    "嵌套循环只能是两层",
                    "嵌套循环的执行次数与内外层循环的顺序无关"
                ],
                correctAnswer: 0,
                explanation: "在嵌套循环中，外层循环的每一次迭代都会触发内层循环的完整执行。例如，外层循环执行n次，内层循环执行m次，那么内层循环体总共会执行n*m次。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 嵌套循环示例\n    for (int i = 0; i < 3; i++) { // 外层循环，执行3次\n        printf(\"外层循环第%d次\\n\", i+1);\n        for (int j = 0; j < 2; j++) { // 内层循环，每次外层循环执行时执行2次\n            printf(\"  内层循环第%d次\\n\", j+1);\n        }\n    }\n    \n    return 0;\n}"
            },
            {
                id: 11,
                question: "以下代码片段的输出结果是什么？\n\n```c\nfor (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 3; j++) {\n        printf(\"%d*%d=%d \", i, j, i*j);\n    }\n    printf(\"\n\");\n}\n```",
                options: [
                    "1 2 3 4 5 6 7 8 9",
                    "9 8 7 6 5 4 3 2 1",
                    "3行3列的乘法表",
                    "错误：变量未初始化"
                ],
                correctAnswer: 2,
                explanation: "这是一个嵌套循环，外层循环控制行数，内层循环控制列数，输出3行3列的乘法表。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 3; i++) {\n        for (int j = 1; j <= 3; j++) {\n            printf(\"%d*%d=%d \", i, j, i*j);\n        }\n        printf(\"\n\");\n    }\n    return 0;\n}"
            },
            {
                id: 12,
                question: "以下关于goto语句的说法中，正确的是：",
                options: [
                    "goto语句可以跳转到程序的任意位置，包括不同函数之间",
                    "goto语句只能在同一函数内部跳转",
                    "goto语句在现代编程中被广泛推荐使用",
                    "goto语句不能用于跳出循环"
                ],
                correctAnswer: 1,
                explanation: "goto语句只能在同一函数内部跳转，不能跨越函数边界。虽然goto语句功能强大，但在现代编程中通常不推荐使用，因为它可能导致代码结构混乱，难以维护。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // goto语句示例（在同一函数内部跳转）\n    for (int i = 0; i < 10; i++) {\n        for (int j = 0; j < 10; j++) {\n            if (i*j > 50) {\n                goto end_loop; // 跳转到标签处，跳出嵌套循环\n            }\n            printf(\"i=%d, j=%d\\n\", i, j);\n        }\n    }\n    \n    end_loop: // 标签\n    printf(\"跳出循环\\n\");\n    \n    return 0;\n}"
            },
            {
                id: 13,
                question: "以下代码片段的输出结果是什么？\n\n```c\n// 死循环\nfor (;;) {\n    printf(\"循环中...\n\");\n    // 没有跳出循环的条件\n}\n```",
                options: [
                    "1 2 3 4 5 6 7 8 9 10",
                    "0 1 2 3 4 5 6 7 8 9",
                    "死循环",
                    "没有输出"
                ],
                correctAnswer: 2,
                explanation: "这是一个典型的死循环，因为循环的三个表达式都被省略了，条件表达式默认为真，所以循环会一直执行下去。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 死循环\n    for (;;) {\n        printf(\"循环中...\\n\");\n        // 没有跳出循环的条件\n        // 为了防止无限输出，这里添加一个break条件\n        static int count = 0;\n        if (++count > 3) break; // 仅用于演示，实际死循环没有这个条件\n    }\n    return 0;\n}"
            },
            {
                id: 14,
                question: "以下关于循环优化的说法中，正确的是：",
                options: [
                    "将循环不变式移出循环可以提高执行效率",
                    "循环嵌套时，应该将迭代次数多的循环放在外层",
                    "使用++i比i++在循环中更高效",
                    "所有选项都正确"
                ],
                correctAnswer: 3,
                explanation: "循环优化的常见技巧包括：将循环不变式（在循环中不发生变化的表达式）移出循环；循环嵌套时，将迭代次数少的循环放在外层，迭代次数多的循环放在内层（缓存局部性原理）；使用++i比i++更高效（不需要创建临时变量）。",
                codeExample: "#include <stdio.h>\n#include <math.h>\n\nint main() {\n    int array[100];\n    int result = 0;\n    \n    // 初始化数组\n    for (int i = 0; i < 100; i++) {\n        array[i] = i;\n    }\n    \n    // 优化前\n    // for (int i = 0; i < 100; i++) {\n    //     result += i * pow(2, 10); // 循环不变式\n    // }\n    \n    // 优化后\n    double powerValue = pow(2, 10); // 将循环不变式移出循环\n    for (int i = 0; i < 100; i++) {\n        result += i * powerValue;\n    }\n    \n    // 缓存局部性优化\n    // 推荐：小循环在外，大循环在内\n    int matrix[10][1000];\n    for (int i = 0; i < 10; i++) { // 小循环\n        for (int j = 0; j < 1000; j++) { // 大循环\n            matrix[i][j] = i + j;\n        }\n    }\n    \n    printf(\"result = %d\\n\", result);\n    \n    return 0;\n}"
            },
            {
                id: 15,
                question: "以下代码片段的输出结果是什么？\n\n```c\nint i = 0;\nwhile (i < 5) {\n    printf(\"%d \", i);\n    // 忘记递增i，导致死循环\n}\n```",
                options: [
                    "1 2 3 4 5",
                    "0 1 2 3 4",
                    "死循环",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是一个死循环，因为在循环体中没有修改循环变量i的值，条件i<5永远为真，所以循环会一直执行下去。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    while (i < 5) {\n        printf(\"%d \", i);\n        // 忘记递增i，导致死循环\n        // 为了演示目的，添加一个递增语句来修复死循环\n        // i++; // 取消注释以修复死循环\n    }\n    return 0;\n}"
            },
            {
                id: 16,
                question: "以下关于循环控制变量的说法中，正确的是：",
                options: [
                    "循环控制变量必须是整型",
                    "循环控制变量可以是任何数据类型",
                    "在循环体内修改循环控制变量是被禁止的",
                    "循环控制变量不能在循环体外使用"
                ],
                correctAnswer: 1,
                explanation: "循环控制变量可以是任何数据类型，只要能进行比较操作。例如，可以使用字符型、浮点型、指针等作为循环控制变量。在循环体内修改循环控制变量是允许的，但需要注意可能导致意外的循环行为。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 使用字符型作为循环控制变量\n    for (char c = 'a'; c <= 'z'; c++) {\n        printf(\"%c \", c);\n    }\n    printf(\"\\n\");\n    \n    // 使用浮点型作为循环控制变量\n    for (double x = 0.0; x < 1.0; x += 0.1) {\n        printf(\"%.1f \", x);\n    }\n    printf(\"\\n\");\n    \n    // 在循环体内修改循环控制变量\n    for (int i = 0; i < 10; i++) {\n        if (i == 5) {\n            i += 2; // 跳过i=6和i=7\n        }\n        printf(\"%d \", i); // 输出0 1 2 3 4 7 8 9\n    }\n    printf(\"\\n\");\n    \n    return 0;\n}"
            },
            {
                id: 17,
                question: "以下代码片段的输出结果是什么？\n\n```c\nfor (int i = 0; i <= 10; i += 2) {\n    printf(\"%d \", i);\n}\n```",
                options: [
                    "1 3 5 7 9",
                    "0 2 4 6 8",
                    "0 2 4 6 8 10",
                    "死循环"
                ],
                correctAnswer: 2,
                explanation: "初始i=0，条件i<=10成立，执行循环体，然后i增加2变为2。继续循环，直到i=10时执行循环体，然后i变为12，条件不成立，循环结束。所以输出0 2 4 6 8 10。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 0; i <= 10; i += 2) {\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 18,
                question: "以下关于循环结构的说法中，错误的是：",
                options: [
                    "可以使用while循环实现的逻辑，都可以使用for循环实现",
                    "可以使用for循环实现的逻辑，都可以使用while循环实现",
                    "do-while循环比while循环效率更高",
                    "循环结构是控制流的重要组成部分"
                ],
                correctAnswer: 2,
                explanation: "for循环和while循环在功能上是等价的，可以相互转换。do-while循环和while循环的效率差异通常可以忽略不计，它们的主要区别在于执行流程（do-while至少执行一次循环体）。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 使用while循环实现的for循环逻辑\n    int i = 0;\n    while (i < 10) {\n        // 循环体\n        printf(\"%d \", i);\n        i++;\n    }\n    printf(\"\\n\");\n    \n    // 使用for循环实现的while循环逻辑\n    int j = 0;\n    for (; j < 10;) {\n        // 循环体\n        printf(\"%d \", j);\n        j++;\n    }\n    printf(\"\\n\");\n    \n    return 0;\n}"
            },
            {
                id: 19,
                question: "以下代码片段的输出结果是什么？\n\n```c\nint i = 0;\ndo {\n    printf(\"%d \", i);\n} while (i++ < 3);\n```",
                options: [
                    "0 1 2 3",
                    "1 2 3 4",
                    "0 1 2 3 4",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "这是一个do-while循环，先执行循环体，然后再判断条件。初始i=0，执行循环体输出0，然后i自增为1。继续循环，直到i=4时执行循环体输出3，然后i变为4，条件i<4不成立，循环结束。所以输出0 1 2 3。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    do {\n        printf(\"%d \", i);\n    } while (i++ < 3);\n    return 0;\n}"
            },
            {
                id: 20,
                question: "以下代码片段的输出结果是什么？\n\n```c\nfor (int i = 0; i < 1000; i++) {\n    if (i == 5) {\n        continue; // 跳过i=5的printf，但i仍会自增\n    }\n    if (i == 10) {\n        i = 5; // 当i=10时，将i重置为5，导致死循环\n    }\n    printf(\"%d \", i);\n}\n```",
                options: [
                    "0 1 2 3 4 5",
                    "1 2 3 4 5 6",
                    "没有输出",
                    "死循环"
                ],
                correctAnswer: 3,
                explanation: "这是一个死循环，因为continue语句只会跳过当前循环的剩余部分，直接进入下一次循环，不会影响循环变量的自增。所以i会一直递增，条件i<1000永远为真。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 0; i < 1000; i++) {\n        if (i == 5) {\n            continue; // 跳过i=5的printf，但i仍会自增\n        }\n        if (i == 10) {\n            i = 5; // 当i=10时，将i重置为5，导致死循环\n        }\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            }
        ];
    }

    // 验证题库数据的有效性
    validateQuestions(questions) {
        if (!Array.isArray(questions)) {
            throw new Error('题库数据必须是数组格式');
        }

        if (questions.length === 0) {
            throw new Error('题库不能为空');
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