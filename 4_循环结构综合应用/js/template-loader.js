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

    // 获取内置题库（包含所有题目）
    getBuiltInQuestions() {
        return [
            {
                id: 1,
                question: "以下关于 `for` 循环和 `while` 循环的说法中，正确的是：",
                options: [
                    "`for` 循环只能用于已知循环次数的情况",
                    "`while` 循环不能用于已知循环次数的情况",
                    "`for` 循环和 `while` 循环在功能上完全等价",
                    "`for` 循环适合处理数组等集合类型数据"
                ],
                correctAnswer: 2,
                explanation: "`for` 循环和 `while` 循环在功能上是等价的，可以相互转换。`for` 循环通常用于已知循环次数的情况，而 `while` 循环通常用于循环次数不确定的情况，但这不是绝对的规则。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // for循环示例\n    for (int i = 0; i < 10; i++) {\n        printf(\"%d \", i);\n    }\n    \n    printf(\"\\n\");\n    \n    // 等价的while循环\n    int i = 0;\n    while (i < 10) {\n        printf(\"%d \", i);\n        i++;\n    }\n    \n    return 0;\n}"
            },
            {
                id: 2,
                question: "在C语言中，`for` 循环的三个表达式可以省略，但分号不能省略。以下哪种写法是正确的？",
                options: [
                    "`for (;;);` // 死循环",
                    "`for (i = 0;; i++);` // 死循环",
                    "`for (; i < 10;);` // 死循环",
                    "所有选项都正确"
                ],
                correctAnswer: 3,
                explanation: "在C语言中，`for` 循环的三个表达式（初始化、条件判断、增量）都可以省略，但分号不能省略。当条件表达式省略时，默认为真，形成死循环。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    \n    // 正确的死循环写法\n    // for (;;) {\n    //     // 循环体\n    // }\n    \n    // 初始化表达式省略\n    i = 0;\n    for (; i < 10; i++) {\n        printf(\"%d \", i);\n    }\n    printf(\"\\n\");\n    \n    // 条件表达式省略（死循环）\n    // for (i = 0;; i++) {\n    //     // 循环体\n    // }\n    \n    // 增量表达式省略\n    i = 0;\n    for (i = 0; i < 10;) {\n        printf(\"%d \", i);\n        i++; // 在循环体内手动递增\n    }\n    \n    return 0;\n}"
            },
            {
                id: 3,
                question: "以下代码片段的输出结果是什么？\n\n<C>\nint i = 0;\nfor (i = 1; i < 6; i++) {\n    printf(\"%d \", i);\n}\n</C>",
                options: [
                    "`1 2 3 4 5`",
                    "`1 2 3 4 5 6`",
                    "`1 2 3 4 5 6 7`",
                    "无限循环"
                ],
                correctAnswer: 0,
                explanation: "当 `i=5` 时，条件 `i<6` 成立，执行循环体，然后 `i` 变为6，条件 `i<6` 不成立，循环结束。所以输出结果为 `1 2 3 4 5`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    for (i = 1; i < 6; i++) {\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 4,
                question: "以下代码片段的输出结果是什么？\n\n<C>\nint i;\nfor (i = 10; i > 0; i--) {\n    printf(\"%d \", i);\n}\n</C>",
                options: [
                    "`10 9 8 7 6 5 4 3 2 1`",
                    "`9 8 7 6 5 4 3 2 1 0`",
                    "`10 9 8 7 6 5 4 3 2 1 0`",
                    "没有输出"
                ],
                correctAnswer: 0,
                explanation: "这是一个递减循环，初始值为10，当 `i>0` 时执行循环体，每次循环 `i` 减1。所以输出结果为 `10 9 8 7 6 5 4 3 2 1`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i;\n    for (i = 10; i > 0; i--) {\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 5,
                question: "以下关于 `do-while` 循环的说法中，正确的是：",
                options: [
                    "`do-while` 循环至少执行一次循环体",
                    "`do-while` 循环的循环体可能一次都不执行",
                    "`do-while` 循环不能用于已知循环次数的情况",
                    "`do-while` 循环与 `while` 循环功能完全相同"
                ],
                correctAnswer: 0,
                explanation: "`do-while` 循环的特点是先执行循环体，然后再判断条件，所以至少会执行一次循环体。而 `while` 循环是先判断条件，条件为真才执行循环体，可能一次都不执行。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // do-while循环示例（至少执行一次）\n    int i = 0;\n    do {\n        printf(\"%d \", i);\n        i++;\n    } while (i > 0);\n    \n    // 注意：上面的循环是死循环，因为条件永远为真\n    // 实际使用中应该有适当的退出条件\n    \n    // 更实际的do-while示例\n    int j = 0;\n    do {\n        printf(\"j = %d\\n\", j);\n        j++;\n    } while (j < 3);\n    \n    // while循环示例（可能不执行）\n    int k = 0;\n    while (k > 0) {\n        printf(\"k = %d\\n\", k); // 不会执行\n        k++;\n    }\n    \n    return 0;\n}"
            },
            {
                id: 6,
                question: "以下代码片段的输出结果是什么？\n\n<C>\nint i = 0;\nwhile (i < 5) {\n    printf(\"%d \", i++);\n}\n</C>",
                options: [
                    "`0 1 2 3 4 5 6 7 8 9`",
                    "`0 1 2 3 4`",
                    "`1 2 3 4 5`",
                    "没有输出"
                ],
                correctAnswer: 1,
                explanation: "初始 `i=0`，先判断条件 `i<5` 成立，执行循环体输出0，然后 `i` 自增为1。继续循环，直到 `i=5` 时条件不成立，循环结束。所以输出 `0 1 2 3 4`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    while (i < 5) {\n        printf(\"%d \", i++);\n    }\n    return 0;\n}"
            },
            {
                id: 7,
                question: "以下关于 `break` 语句和 `continue` 语句的说法中，正确的是：",
                options: [
                    "`break` 语句可以提前结束循环，而 `continue` 语句只是跳过当前循环的剩余部分",
                    "`continue` 语句可以提前结束循环，而 `break` 语句只是跳过当前循环的剩余部分",
                    "`break` 语句和 `continue` 语句都可以提前结束循环",
                    "`break` 语句和 `continue` 语句都只能跳过当前循环的剩余部分"
                ],
                correctAnswer: 0,
                explanation: "`break` 语句用于提前结束循环，跳出循环体；而 `continue` 语句用于跳过当前循环的剩余部分，继续执行下一次循环。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // break示例\n    for (int i = 0; i < 10; i++) {\n        if (i == 5) {\n            break; // 当i=5时跳出循环\n        }\n        printf(\"%d \", i); // 输出0 1 2 3 4\n    }\n    \n    printf(\"\\n\");\n    \n    // continue示例\n    for (int i = 0; i < 10; i++) {\n        if (i == 5) {\n            continue; // 当i=5时跳过当前循环的剩余部分\n        }\n        printf(\"%d \", i); // 输出0 1 2 3 4 6 7 8 9\n    }\n    \n    return 0;\n}"
            },
            {
                id: 8,
                question: "以下代码片段的输出结果是什么？\n\n<C>\nfor (int i = 1; i <= 10; i++) {\n    if (i > 5) {\n        break;\n    }\n    printf(\"%d \", i);\n}\n</C>",
                options: [
                    "`1 2 3 4 5 6 7 8 9 10`",
                    "`1 2 3 4 5`",
                    "`6 7 8 9 10`",
                    "没有输出"
                ],
                correctAnswer: 1,
                explanation: "当 `i=5` 时，遇到 `break` 语句，直接跳出整个循环，不再执行后续的循环体。所以输出 `1 2 3 4 5`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 10; i++) {\n        if (i > 5) {\n            break;\n        }\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 9,
                question: "以下代码片段的输出结果是什么？\n\n<C>\nfor (int i = 1; i <= 10; i++) {\n    if (i % 2 != 0) { // i为奇数\n        continue;\n    }\n    printf(\"%d \", i);\n}\n</C>",
                options: [
                    "`1 2 3 4 5 6 7 8 9 10`",
                    "`1 2 3 4 5`",
                    "`2 4 6 8 10`",
                    "`1 3 5 7 9`"
                ],
                correctAnswer: 2,
                explanation: "当 `i` 为奇数时，遇到 `continue` 语句，跳过当前循环的剩余部分，直接进入下一次循环。所以只有偶数会被输出：`2 4 6 8 10`。",
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
                explanation: "在嵌套循环中，外层循环的每一次迭代都会触发内层循环的完整执行。例如，外层循环执行 `n` 次，内层循环执行 `m` 次，那么内层循环体总共会执行 `n*m` 次。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 嵌套循环示例\n    for (int i = 0; i < 3; i++) { // 外层循环，执行3次\n        printf(\"外层循环第%d次\\n\", i+1);\n        for (int j = 0; j < 2; j++) { // 内层循环，每次外层循环执行时执行2次\n            printf(\"  内层循环第%d次\\n\", j+1);\n        }\n    }\n    \n    return 0;\n}"
            },
            {
                id: 11,
                question: "以下代码片段的输出结果是什么？\n\n<C>\nfor (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 3; j++) {\n        printf(\"%d*%d=%d \", i, j, i*j);\n    }\n    printf(\"\\n\");\n}\n</C>",
                options: [
                    "`1 2 3 4 5 6 7 8 9`",
                    "`9 8 7 6 5 4 3 2 1`",
                    "3行3列的乘法表",
                    "错误：变量未初始化"
                ],
                correctAnswer: 2,
                explanation: "这是一个嵌套循环，外层循环控制行数，内层循环控制列数，输出3行3列的乘法表。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 3; i++) {\n        for (int j = 1; j <= 3; j++) {\n            printf(\"%d*%d=%d \", i, j, i*j);\n        }\n        printf(\"\n\");\n    }\n    return 0;\n}"
            },
            {
                id: 12,
                question: "以下关于 `goto` 语句的说法中，正确的是：",
                options: [
                    "`goto` 语句可以跳转到程序的任意位置，包括不同函数之间",
                    "`goto` 语句只能在同一函数内部跳转",
                    "`goto` 语句在现代编程中被广泛推荐使用",
                    "`goto` 语句不能用于跳出循环"
                ],
                correctAnswer: 1,
                explanation: "`goto` 语句只能在同一函数内部跳转，不能跨越函数边界。虽然 `goto` 语句功能强大，但在现代编程中通常不推荐使用，因为它可能导致代码结构混乱，难以维护。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // goto语句示例（在同一函数内部跳转）\n    for (int i = 0; i < 10; i++) {\n        for (int j = 0; j < 10; j++) {\n            if (i*j > 50) {\n                goto end_loop; // 跳转到标签处，跳出嵌套循环\n            }\n            printf(\"i=%d, j=%d\\n\", i, j);\n        }\n    }\n    \n    end_loop: // 标签\n    printf(\"跳出循环\\n\");\n    \n    return 0;\n}"
            },
            {
                id: 13,
                question: "以下代码片段的输出结果是什么？\n\n<C>\n// 死循环\nfor (;;) {\n    printf(\"循环中...\\n\");\n    // 没有跳出循环的条件\n}\n</C>",
                options: [
                    "`1 2 3 4 5 6 7 8 9 10`",
                    "`0 1 2 3 4 5 6 7 8 9`",
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
                    "使用 `++i` 比 `i++` 在循环中更高效",
                    "所有选项都正确"
                ],
                correctAnswer: 3,
                explanation: "循环优化的常见技巧包括：将循环不变式（在循环中不发生变化的表达式）移出循环；循环嵌套时，将迭代次数少的循环放在外层，迭代次数多的循环放在内层（缓存局部性原理）；使用 `++i` 比 `i++` 更高效（不需要创建临时变量）。",
                codeExample: "#include <stdio.h>\n#include <math.h>\n\nint main() {\n    int array[100];\n    int result = 0;\n    \n    // 初始化数组\n    for (int i = 0; i < 100; i++) {\n        array[i] = i;\n    }\n    \n    // 优化前\n    // for (int i = 0; i < 100; i++) {\n    //     result += i * pow(2, 10); // 循环不变式\n    // }\n    \n    // 优化后\n    double powerValue = pow(2, 10); // 将循环不变式移出循环\n    for (int i = 0; i < 100; i++) {\n        result += i * powerValue;\n    }\n    \n    // 缓存局部性优化\n    // 推荐：小循环在外，大循环在内\n    int matrix[10][1000];\n    for (int i = 0; i < 10; i++) { // 小循环\n        for (int j = 0; j < 1000; j++) { // 大循环\n            matrix[i][j] = i + j;\n        }\n    }\n    \n    printf(\"result = %d\\n\", result);\n    \n    return 0;\n}"
            },
            {
                id: 15,
                question: "以下代码片段的输出结果是什么？\n\n<C>\nint i = 0;\nwhile (i < 5) {\n    printf(\"%d \", i);\n    // 忘记递增i，导致死循环\n}\n</C>",
                options: [
                    "`1 2 3 4 5`",
                    "`0 1 2 3 4`",
                    "死循环",
                    "编译错误"
                ],
                correctAnswer: 2,
                explanation: "这是一个死循环，因为在循环体中没有修改循环变量 `i` 的值，条件 `i<5` 永远为真，所以循环会一直执行下去。",
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
                question: "以下代码片段的输出结果是什么？\n\n<C>\nfor (int i = 0; i <= 10; i += 2) {\n    printf(\"%d \", i);\n}\n</C>",
                options: [
                    "`1 3 5 7 9`",
                    "`0 2 4 6 8`",
                    "`0 2 4 6 8 10`",
                    "死循环"
                ],
                correctAnswer: 2,
                explanation: "初始 `i=0`，条件 `i<=10` 成立，执行循环体，然后 `i` 增加2变为2。继续循环，直到 `i=10` 时执行循环体，然后 `i` 变为12，条件不成立，循环结束。所以输出 `0 2 4 6 8 10`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 0; i <= 10; i += 2) {\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 18,
                question: "以下关于循环结构的说法中，错误的是：",
                options: [
                    "可以使用 `while` 循环实现的逻辑，都可以使用 `for` 循环实现",
                    "可以使用 `for` 循环实现的逻辑，都可以使用 `while` 循环实现",
                    "`do-while` 循环比 `while` 循环效率更高",
                    "循环结构是控制流的重要组成部分"
                ],
                correctAnswer: 2,
                explanation: "`for` 循环和 `while` 循环在功能上是等价的，可以相互转换。`do-while` 循环和 `while` 循环的效率差异通常可以忽略不计，它们的主要区别在于执行流程（`do-while` 至少执行一次循环体）。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // 使用while循环实现的for循环逻辑\n    int i = 0;\n    while (i < 10) {\n        // 循环体\n        printf(\"%d \", i);\n        i++;\n    }\n    printf(\"\\n\");\n    \n    // 使用for循环实现的while循环逻辑\n    int j = 0;\n    for (; j < 10;) {\n        // 循环体\n        printf(\"%d \", j);\n        j++;\n    }\n    printf(\"\\n\");\n    \n    return 0;\n}"
            },
            {
                id: 19,
                question: "以下代码片段的输出结果是什么？\n\n<C>\nint i = 0;\ndo {\n    printf(\"%d \", i);\n} while (i++ < 3);\n</C>",
                options: [
                    "`0 1 2 3`",
                    "`1 2 3 4`",
                    "`0 1 2 3 4`",
                    "编译错误"
                ],
                correctAnswer: 0,
                explanation: "这是一个 `do-while` 循环，先执行循环体，然后再判断条件。初始 `i=0`，执行循环体输出0，然后 `i` 自增为1。继续循环，直到 `i=4` 时执行循环体输出3，然后 `i` 变为4，条件 `i<4` 不成立，循环结束。所以输出 `0 1 2 3`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0;\n    do {\n        printf(\"%d \", i);\n    } while (i++ < 3);\n    return 0;\n}"
            },
            {
                id: 20,
                question: "以下代码片段的输出结果是什么？\n\n<C>\nfor (int i = 0; i < 1000; i++) {\n    if (i == 5) {\n        continue; // 跳过i=5的printf，但i仍会自增\n    }\n    if (i == 10) {\n        i = 5; // 当i=10时，将i重置为5，导致死循环\n    }\n    printf(\"%d \", i);\n}\n</C>",
                options: [
                    "`0 1 2 3 4 5`",
                    "`1 2 3 4 5 6`",
                    "没有输出",
                    "死循环"
                ],
                correctAnswer: 3,
                explanation: "这是一个死循环，因为 `continue` 语句只会跳过当前循环的剩余部分，直接进入下一次循环，不会影响循环变量的自增。所以 `i` 会一直递增，条件 `i<1000` 永远为真。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 0; i < 1000; i++) {\n        if (i == 5) {\n            continue; // 跳过i=5的printf，但i仍会自增\n        }\n        if (i == 10) {\n            i = 5; // 当i=10时，将i重置为5，导致死循环\n        }\n        printf(\"%d \", i);\n    }\n    return 0;\n}"
            },
            {
                id: 21,
                question: "以下代码片段中，三重嵌套循环的执行次数是多少？\n\n<C>\nint count = 0;\nfor (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 2; j++) {\n        for (int k = 1; k <= 4; k++) {\n            count++;\n        }\n    }\n}\nprintf(\"%d\", count);\n</C>",
                options: [
                    "`9`",
                    "`24`",
                    "`12`",
                    "`8`"
                ],
                correctAnswer: 1,
                explanation: "三重嵌套循环的总执行次数 = 外层次数 × 中层次数 × 内层次数 = 3 × 2 × 4 = 24。每个层级独立循环，内层循环会完整执行外层每次迭代的所有组合。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int count = 0;\n    for (int i = 1; i <= 3; i++) {\n        for (int j = 1; j <= 2; j++) {\n            for (int k = 1; k <= 4; k++) {\n                count++;\n                printf(\"i=%d, j=%d, k=%d, count=%d\\n\", i, j, k, count);\n            }\n        }\n    }\n    printf(\"总执行次数: %d\\n\", count);\n    return 0;\n}"
            },
            {
                id: 22,
                question: "关于 `do-while` 与 `while` 循环的本质区别，以下说法正确的是：",
                options: [
                    "`do-while` 条件判断在循环末尾，至少执行一次循环体",
                    "`while` 循环效率更高，应优先使用",
                    "`do-while` 不能与 `break` 和 `continue` 一起使用",
                    "`do-while` 循环只能用于菜单驱动程序"
                ],
                correctAnswer: 0,
                explanation: "`do-while` 的核心特性是「先执行后判断」，保证循环体至少执行一次，适用于需要先执行一次操作再判断是否继续的场景（如输入验证）。`while` 是「先判断后执行」，条件不满足时可能一次都不执行。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    // do-while适用场景：输入验证\n    int num;\n    do {\n        printf(\"请输入1-10之间的数字: \");\n        scanf(\"%d\", &num);\n    } while (num < 1 || num > 10);\n    \n    // while循环可能一次都不执行\n    int i = 10;\n    while (i < 5) {\n        printf(\"不会执行\\n\");\n        i++;\n    }\n    \n    return 0;\n}"
            },
            {
                id: 23,
                question: "以下代码输出结果是什么？\n\n<C>\nint i = 0, sum = 0;\nwhile (i <= 10) {\n    if (i % 2 == 0) {\n        i++;\n        continue;\n    }\n    sum += i;\n    i++;\n}\nprintf(\"%d\", sum);\n</C>",
                options: [
                    "`25`（1+3+5+7+9）",
                    "`30`（1+3+5+7+9+11）",
                    "`55`（所有数之和）",
                    "死循环"
                ],
                correctAnswer: 0,
                explanation: "只有奇数会被累加到sum中。i=0,2,4,6,8,10时遇到continue跳过累加。i=1,3,5,7,9时执行累加，sum = 1+3+5+7+9 = 25。i=11时不满足while条件，循环结束。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int i = 0, sum = 0;\n    while (i <= 10) {\n        if (i % 2 == 0) {\n            i++;\n            continue;\n        }\n        sum += i;\n        printf(\"累加 %d, sum = %d\\n\", i, sum);\n        i++;\n    }\n    printf(\"最终结果: %d\\n\", sum);\n    return 0;\n}"
            },
            {
                id: 24,
                question: "以下代码中，变量 `x` 的最终值是多少？\n\n<C>\nint x = 1;\nfor (int i = 1; i < 5; i++) {\n    x *= i;\n}\nprintf(\"%d\", x);\n</C>",
                options: [
                    "`10`",
                    "`24`（1×1×2×3×4）",
                    "`120`",
                    "`5`"
                ],
                correctAnswer: 1,
                explanation: "这是计算阶乘的循环。x初始为1，依次乘以1,2,3,4。计算过程：1×1=1, 1×2=2, 2×3=6, 6×4=24。结果为4的阶乘24。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int x = 1;\n    for (int i = 1; i < 5; i++) {\n        x *= i;\n        printf(\"i=%d, x=%d\\n\", i, x);\n    }\n    printf(\"最终x的值: %d\\n\", x);\n    return 0;\n}"
            },
            {
                id: 25,
                question: "以下嵌套循环输出多少个星号？\n\n<C>\nfor (int i = 1; i <= 5; i++) {\n    for (int j = 1; j <= i; j++) {\n        printf(\"*\");\n    }\n    printf(\"\\n\");\n}\n</C>",
                options: [
                    "`5`个星号",
                    "`10`个星号",
                    "`15`个星号（1+2+3+4+5）",
                    "`25`个星号"
                ],
                correctAnswer: 2,
                explanation: "这是打印直角三角形的经典模式。外层循环控制行数（5行），内层循环控制每行星号数（第i行打印i个星号）。总数 = 1+2+3+4+5 = 15个星号。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int total = 0;\n    for (int i = 1; i <= 5; i++) {\n        for (int j = 1; j <= i; j++) {\n            printf(\"*\");\n            total++;\n        }\n        printf(\" (第%d行: %d个)\\n\", i, i);\n    }\n    printf(\"总共: %d个星号\\n\", total);\n    return 0;\n}"
            },
            {
                id: 26,
                question: "以下代码的输出结果是什么？\n\n<C>\nint n = 5;\nwhile (n > 0) {\n    printf(\"%d \", n);\n    n -= 2;\n}\n</C>",
                options: [
                    "`5 3 1`",
                    "`5 3 1 -1`",
                    "`5 4 3 2 1`",
                    "`5 3`"
                ],
                correctAnswer: 0,
                explanation: "每次循环n减2。n=5输出5，n=3输出3，n=1输出1，n=-1不满足n>0，循环结束。输出：`5 3 1`。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int n = 5;\n    while (n > 0) {\n        printf(\"%d \", n);\n        n -= 2;\n    }\n    printf(\"\\n最终n=%d\\n\", n);\n    return 0;\n}"
            },
            {
                id: 27,
                question: "以下代码中，`break` 语句只跳出哪一层循环？\n\n<C>\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 3; j++) {\n        if (j == 1) break;\n        printf(\"i=%d, j=%d\\n\", i, j);\n    }\n}\n</C>",
                options: [
                    "跳出外层 `for (i)` 循环",
                    "跳出内层 `for (j)` 循环",
                    "跳出所有循环",
                    "编译错误，break不能用于嵌套循环"
                ],
                correctAnswer: 1,
                explanation: "`break` 只跳出其所在的最内层循环。此代码中break在内层循环，每次j=1时跳出内层循环，外层循环继续。输出：i=0,j=0; i=1,j=0; i=2,j=0 共3次。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 0; i < 3; i++) {\n        printf(\"外层循环 i=%d 开始\\n\", i);\n        for (int j = 0; j < 3; j++) {\n            if (j == 1) {\n                printf(\"  内层break在j=%d\\n\", j);\n                break;\n            }\n            printf(\"  i=%d, j=%d\\n\", i, j);\n        }\n    }\n    return 0;\n}"
            },
            {
                id: 28,
                question: "以下代码实现的功能是什么？\n\n<C>\nint num = 12345, reversed = 0;\nwhile (num != 0) {\n    reversed = reversed * 10 + num % 10;\n    num /= 10;\n}\nprintf(\"%d\", reversed);\n</C>",
                options: [
                    "计算数字位数",
                    "反转数字，输出 `54321`",
                    "计算数字各位之和",
                    "判断数字是否为回文数"
                ],
                correctAnswer: 1,
                explanation: "这是反转整数的经典算法。通过 `num % 10` 获取最后一位，加到 `reversed` 的末尾，然后 `num /= 10` 去掉最后一位。重复直到num为0。12345 → 54321。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int num = 12345, reversed = 0;\n    printf(\"原数字: %d\\n\", num);\n    \n    while (num != 0) {\n        int digit = num % 10;\n        reversed = reversed * 10 + digit;\n        printf(\"取出 %d, reversed = %d\\n\", digit, reversed);\n        num /= 10;\n    }\n    \n    printf(\"反转结果: %d\\n\", reversed);\n    return 0;\n}"
            },
            {
                id: 29,
                question: "以下代码中，`continue` 语句对循环计数器 `i` 的影响是什么？\n\n<C>\nfor (int i = 0; i < 10; i++) {\n    if (i % 3 == 0) continue;\n    printf(\"%d \", i);\n}\n</C>",
                options: [
                    "`continue` 会跳过 `i++`，导致死循环",
                    "`continue` 不影响 `i++`，正常自增",
                    "`i` 会被重置为0",
                    "编译错误"
                ],
                correctAnswer: 1,
                explanation: "在 `for` 循环中，`continue` 跳过循环体剩余部分后，会继续执行增量表达式 `i++`。所以i正常自增，跳过3的倍数，输出：1 2 4 5 7 8。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    for (int i = 0; i < 10; i++) {\n        if (i % 3 == 0) {\n            printf(\"跳过%d\\n\", i);\n            continue;\n        }\n        printf(\"%d \", i);\n    }\n    printf(\"\\n循环正常结束\\n\");\n    return 0;\n}"
            },
            {
                id: 30,
                question: "以下哪个循环结构在C语言中是不存在的？",
                options: [
                    "`for-each` 循环（如 `for (item in array)`）",
                    "`do-while` 循环",
                    "`while` 循环",
                    "`for` 循环"
                ],
                correctAnswer: 0,
                explanation: "C语言没有 `for-each` 或 `for-in` 这样的高级循环语法。遍历数组需要使用传统的 `for` 循环配合索引。C++11、Java、Python等语言才有基于范围的for循环。",
                codeExample: "#include <stdio.h>\n\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int len = sizeof(arr) / sizeof(arr[0]);\n    \n    // C语言遍历数组的标准方式\n    for (int i = 0; i < len; i++) {\n        printf(\"%d \", arr[i]);\n    }\n    \n    // C语言没有这样的语法:\n    // for (int item in arr) { // 错误！\n    //     printf(\"%d \", item);\n    // }\n    \n    return 0;\n}"
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