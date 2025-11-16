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
            console.log(`成功加载 ${this.questions.length} 道题目（来自内置题库）`);
            return this.questions;
        } catch (error) {
            console.error('加载题库失败:', error.message);
            throw error;
        }
    }

    // 获取内置题库数据
    getBuiltInQuestions() {
        return [
            {
                "id": 1,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint x = 5;\nswitch(x) {\n    case 1: printf(\"one\"); break;\n    case 3: printf(\"three\"); break;\n    case 5: printf(\"five\"); break;\n    default: printf(\"default\");\n}\n",
                "options": [
                    "one",
                    "three",
                    "five",
                    "default"
                ],
                "correctAnswer": 2,
                "explanation": "x的值为5，匹配case 5，执行printf(\"five\")。由于case 5后面有break语句，所以不会继续执行default分支。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int x = 5;\n    switch(x) {\n        case 1: printf(\"one\"); break;\n        case 3: printf(\"three\"); break;\n        case 5: printf(\"five\"); break;\n        default: printf(\"default\");\n    }\n    return 0;\n}\n// 输出：five\n```"
            },
            {
                "id": 2,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint x = 2;\nswitch(x) {\n    case 1: printf(\"A\");\n    case 2: printf(\"B\");\n    case 3: printf(\"C\"); break;\n    case 4: printf(\"D\");\n    default: printf(\"E\");\n}\n",
                "options": [
                    "B",
                    "BC",
                    "BCE",
                    "ABC"
                ],
                "correctAnswer": 1,
                "explanation": "x的值为2，匹配case 2，执行printf(\"B\")。由于case 2后面没有break语句，会继续执行case 3，输出\"C\"。然后遇到break语句，跳出switch结构。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int x = 2;\n    switch(x) {\n        case 1: printf(\"A\");\n        case 2: printf(\"B\");\n        case 3: printf(\"C\"); break;\n        case 4: printf(\"D\");\n        default: printf(\"E\");\n    }\n    return 0;\n}\n// 输出：BC\n```"
            },
            {
                "id": 3,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint x = 3;\nswitch(x) {\n    default: printf(\"D\");\n    case 1: printf(\"A\"); break;\n    case 2: printf(\"B\");\n    case 3: printf(\"C\");\n}\n",
                "options": [
                    "C",
                    "DC",
                    "DAC",
                    "CD"
                ],
                "correctAnswer": 0,
                "explanation": "switch语句中default的位置不影响匹配顺序。x的值为3，匹配case 3，执行printf(\"C\")。由于case 3后面没有break语句，但已经是最后一个case，所以执行结束。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int x = 3;\n    switch(x) {\n        default: printf(\"D\");\n        case 1: printf(\"A\"); break;\n        case 2: printf(\"B\");\n        case 3: printf(\"C\");\n    }\n    return 0;\n}\n// 输出：C\n```"
            },
            {
                "id": 4,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nchar ch = 'B';\nswitch(ch) {\n    case 'A': printf(\"甲\"); break;\n    case 'B': printf(\"乙\");\n    case 'C': printf(\"丙\"); break;\n    default: printf(\"丁\");\n}\n",
                "options": [
                    "乙",
                    "乙丙",
                    "乙丙丁",
                    "甲乙丙"
                ],
                "correctAnswer": 1,
                "explanation": "ch的值为'B'，匹配case 'B'，执行printf(\"乙\")。由于case 'B'后面没有break语句，会继续执行case 'C'，输出\"丙\"。然后遇到break语句，跳出switch结构。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    char ch = 'B';\n    switch(ch) {\n        case 'A': printf(\"甲\"); break;\n        case 'B': printf(\"乙\");\n        case 'C': printf(\"丙\"); break;\n        default: printf(\"丁\");\n    }\n    return 0;\n}\n// 输出：乙丙\n```"
            },
            {
                "id": 5,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint x = 0;\nfor(int i = 0; i < 5; i++) {\n    x += i;\n}\nprintf(\"%d\", x);\n",
                "options": [
                    "10",
                    "15",
                    "5",
                    "0"
                ],
                "correctAnswer": 0,
                "explanation": "循环执行5次，i的值分别为0、1、2、3、4，x的值为0+0+1+2+3+4=10。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int x = 0;\n    for(int i = 0; i < 5; i++) {\n        x += i; // x = x + i\n        printf(\"i=%d, x=%d\\n\", i, x);\n    }\n    printf(\"最终x=%d\", x);\n    return 0;\n}\n// 输出：10\n```"
            },
            {
                "id": 6,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i;\nfor(i = 1; i <= 5; i++) {\n    if(i % 2 == 0) continue;\n    printf(\"%d \", i);\n}\n",
                "options": [
                    "1 2 3 4 5",
                    "1 3 5",
                    "2 4",
                    "0"
                ],
                "correctAnswer": 1,
                "explanation": "当i为偶数时执行continue，跳过printf语句，继续下一次循环。所以只输出奇数：1、3、5。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i;\n    for(i = 1; i <= 5; i++) {\n        if(i % 2 == 0) { // 判断是否为偶数\n            continue; // 跳过本次循环的剩余部分\n        }\n        printf(\"%d \", i);\n    }\n    return 0;\n}\n// 输出：1 3 5\n```"
            },
            {
                "id": 7,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 0;\nfor(; i < 5; ) {\n    i++;    printf(\"%d \", i);\n}\n",
                "options": [
                    "0 1 2 3 4",
                    "1 2 3 4 5",
                    "0 1 2 3 4 5",
                    "1 2 3 4"
                ],
                "correctAnswer": 1,
                "explanation": "for循环的初始化和更新部分可以省略。循环条件为i < 5，循环体中先执行i++，然后输出i的值。i的值从0开始，循环执行5次，输出1到5。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 0;\n    for(; i < 5; ) { // 初始化和更新部分省略\n        i++; // 在循环体内更新i\n        printf(\"%d \", i);\n    }\n    return 0;\n}\n// 输出：1 2 3 4 5\n```"
            },
            {
                "id": 8,
                "question": "以下代码执行后，循环体执行了多少次？\n\n<C>\nint i;\nfor(i = 1; i <= 10; i += 2) {\n    printf(\"%d \", i);\n}\n",
                "options": [
                    "5",
                    "10",
                    "6",
                    "4"
                ],
                "correctAnswer": 0,
                "explanation": "i的初始值为1，每次增加2，循环条件为i <= 10。i的值依次为1、3、5、7、9，循环执行5次。当i=11时，不满足循环条件，退出循环。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i, count = 0;\n    for(i = 1; i <= 10; i += 2) { // 每次增加2\n        count++; // 统计循环次数\n        printf(\"第%d次循环: i=%d\\n\", count, i);\n    }\n    printf(\"循环体执行了%d次\", count);\n    return 0;\n}\n// 输出：5次\n```"
            },
            {
                "id": 9,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 0;\nwhile(i < 3) {\n    i++;    if(i == 2) break;\n    printf(\"%d \", i);\n}\n",
                "options": [
                    "1",
                    "1 2",
                    "1 3",
                    "0 1"
                ],
                "correctAnswer": 0,
                "explanation": "i的初始值为0，进入while循环，i变为1，输出1。接着i变为2，遇到break语句，跳出循环，不再输出。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 0;\n    while(i < 3) {\n        i++;    printf(\"i=%d \", i);\n        if(i == 2) {\n            printf(\"遇到break，跳出循环\\n\");\n            break; // 跳出循环\n        }\n        printf(\"继续下一次循环\\n\");\n    }\n    return 0;\n}\n// 输出：i=1 继续下一次循环\ni=2 遇到break，跳出循环\n```"
            },
            {
                "id": 10,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 1;\nwhile(i <= 5) {\n    if(i % 2 == 0) {\n        i++;    continue;\n    }\n    printf(\"%d \", i);\n    i++;\n}\n",
                "options": [
                    "1 2 3 4 5",
                    "1 3 5",
                    "2 4",
                    "1 2 3 4"
                ],
                "correctAnswer": 1,
                "explanation": "当i为偶数时，执行i++和continue，跳过printf语句，继续下一次循环。所以只输出奇数：1、3、5。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 1;\n    while(i <= 5) {\n        if(i % 2 == 0) { // 判断是否为偶数\n            i++;    continue; // 跳过本次循环的剩余部分\n        }\n        printf(\"%d \", i);\n        i++;\n    }\n    return 0;\n}\n// 输出：1 3 5\n```"
            },
            {
                "id": 11,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint x = 1;\nint i = 0;\nwhile(i < 5) {\n    if(x % 2 == 1) {\n        x += 2;\n    } else {\n        x *= 2;\n    }\n    i++;\n}\nprintf(\"%d\", x);\n",
                "options": [
                    "7",
                    "14",
                    "15",
                    "28"
                ],
                "correctAnswer": 3,
                "explanation": "循环执行5次，每次根据x的奇偶性更新x的值：\n1. 初始x=1(奇数)，i=0：x=3，i=1\n2. x=3(奇数)，i=1：x=5，i=2\n3. x=5(奇数)，i=2：x=7，i=3\n4. x=7(奇数)，i=3：x=9，i=4\n5. x=9(奇数)，i=4：x=11，i=5\n最终x=11。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int x = 1;\n    int i = 0;\n    while(i < 5) {\n        if(x % 2 == 1) { // x是奇数\n            x += 2;\n        } else { // x是偶数\n            x *= 2;\n        }\n        printf(\"i=%d, x=%d\\n\", i, x);\n        i++;\n    }\n    printf(\"最终x=%d\", x);\n    return 0;\n}\n// 输出：11\n```"
            },
            {
                "id": 12,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 0;\nint sum = 0;\ndo {\n    sum += i;\n    i++;\n} while(i < 5);\nprintf(\"%d\", sum);\n",
                "options": [
                    "10",
                    "15",
                    "5",
                    "0"
                ],
                "correctAnswer": 0,
                "explanation": "do-while循环先执行循环体，再检查条件。循环执行5次，i的值分别为0、1、2、3、4，sum的值为0+0+1+2+3+4=10。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 0;\n    int sum = 0;\n    do {\n        sum += i; // sum = sum + i\n        printf(\"i=%d, sum=%d\\n\", i, sum);\n        i++;\n    } while(i < 5);\n    printf(\"最终sum=%d\", sum);\n    return 0;\n}\n// 输出：10\n```"
            },
            {
                "id": 13,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 5;\ndo {\n    printf(\"%d \", i);\n    i--;\n} while(i > 0);\n",
                "options": [
                    "5 4 3 2 1",
                    "5 4 3 2",
                    "1 2 3 4 5",
                    "无输出"
                ],
                "correctAnswer": 0,
                "explanation": "do-while循环先执行循环体，再检查条件。i的初始值为5，输出5后i变为4，继续循环，直到i=0时退出循环。所以输出5 4 3 2 1。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 5;\n    do {\n        printf(\"%d \", i);\n        i--; // i = i - 1\n    } while(i > 0);\n    return 0;\n}\n// 输出：5 4 3 2 1\n```"
            },
            {
                "id": 14,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 0;\nfor(i = 0; i < 3; i++) {\n    switch(i) {\n        case 0: printf(\"A\");\n        case 1: printf(\"B\"); break;\n        case 2: printf(\"C\");\n        default: printf(\"D\");\n    }\n}\n",
                "options": [
                    "AB B CD",
                    "AB B C",
                    "AB BC CD",
                    "ABC"
                ],
                "correctAnswer": 0,
                "explanation": "外层循环执行3次，i的值分别为0、1、2：\n1. i=0：匹配case 0，输出\"A\"，由于没有break，继续执行case 1，输出\"B\"，遇到break跳出switch。\n2. i=1：匹配case 1，输出\"B\"，遇到break跳出switch。\n3. i=2：匹配case 2，输出\"C\"，由于没有break，继续执行default，输出\"D\"。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 0;\n    for(i = 0; i < 3; i++) {\n        printf(\"i=%d: \", i);\n        switch(i) {\n            case 0: printf(\"A\");\n            case 1: printf(\"B\"); break;\n            case 2: printf(\"C\");\n            default: printf(\"D\");\n        }\n        printf(\"\\n\");\n    }\n    return 0;\n}\n// 输出：i=0: AB\ni=1: B\ni=2: CD\n```"
            },
            {
                "id": 15,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 0;\nwhile(i < 5) {\n    switch(i % 3) {\n        case 0: printf(\"X\"); break;\n        case 1: printf(\"Y\");\n        case 2: printf(\"Z\"); break;\n    }\n    i++;\n}\n",
                "options": [
                    "XYZXYZ",
                    "XYZXYZ",
                    "XYZXZ",
                    "XYYZXZ"
                ],
                "correctAnswer": 2,
                "explanation": "while循环执行5次，i的值分别为0、1、2、3、4：\n1. i=0，i%3=0：输出\"X\"，break。\n2. i=1，i%3=1：输出\"Y\"，由于没有break，继续执行case 2，输出\"Z\"，break。\n3. i=2，i%3=2：输出\"Z\"，break。\n4. i=3，i%3=0：输出\"X\"，break。\n5. i=4，i%3=1：输出\"Y\"，由于没有break，继续执行case 2，输出\"Z\"，break。\n最终输出：XYZXZ。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 0;\n    while(i < 5) {\n        printf(\"i=%d, i%%3=%d: \" , i, i%3);\n        switch(i % 3) {\n            case 0: printf(\"X\"); break;\n            case 1: printf(\"Y\");\n            case 2: printf(\"Z\"); break;\n        }\n        printf(\"\\n\");\n        i++;\n    }\n    return 0;\n}\n// 输出：XYZXZ\n```"
            },
            {
                "id": 16,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 0;\nfor(; i < 3; i++) {\n    if(i == 1) continue;\n    printf(\"%d \", i);\n}\nprintf(\"i=%d\", i);\n",
                "options": [
                    "0 2 i=3",
                    "0 2 i=2",
                    "0 1 2 i=3",
                    "0 2 i=1"
                ],
                "correctAnswer": 0,
                "explanation": "for循环执行3次，i的值分别为0、1、2：\n1. i=0：输出\"0\"。\n2. i=1：执行continue，跳过printf语句，继续下一次循环。\n3. i=2：输出\"2\"。\n循环结束后i=3，输出\"i=3\"。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 0;\n    for(; i < 3; i++) {\n        if(i == 1) {\n            continue; // 跳过本次循环的剩余部分\n        }\n        printf(\"%d \", i);\n    }\n    printf(\"i=%d\", i);\n    return 0;\n}\n// 输出：0 2 i=3\n```"
            },
            {
                "id": 17,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i, j;\nfor(i = 0; i < 2; i++) {\n    for(j = 0; j < 3; j++) {\n        if(i == j) break;\n        printf(\"%d%d \", i, j);\n    }\n}\n",
                "options": [
                    "01 02 10 11 12",
                    "01 02 10",
                    "00 01 02 10 11 12",
                    "00 10 11"
                ],
                "correctAnswer": 1,
                "explanation": "外层循环执行2次，内层循环执行3次：\n1. i=0：\n   - j=0：i==j，执行break，跳出内层循环。\n   - j=1：输出\"01\"。\n   - j=2：输出\"02\"。\n2. i=1：\n   - j=0：输出\"10\"。\n   - j=1：i==j，执行break，跳出内层循环。\n最终输出：01 02 10。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i, j;\n    for(i = 0; i < 2; i++) {\n        for(j = 0; j < 3; j++) {\n            if(i == j) {\n                break; // 跳出内层循环\n            }\n            printf(\"%d%d \", i, j);\n        }\n    }\n    return 0;\n}\n// 输出：01 02 10\n```"
            },
            {
                "id": 18,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 0;\nint count = 0;\nwhile(i < 10) {\n    i += 2;\n    if(i > 5) continue;\n    count++;\n}\nprintf(\"%d\", count);\n",
                "options": [
                    "3",
                    "4",
                    "2",
                    "5"
                ],
                "correctAnswer": 2,
                "explanation": "while循环中，i的初始值为0，每次增加2：\n1. i=0 → i=2 → i≤5 → count=1\n2. i=2 → i=4 → i≤5 → count=2\n3. i=4 → i=6 → i>5 → continue，不增加count\n4. i=6 → i=8 → i>5 → continue，不增加count\n5. i=8 → i=10 → i=10不满足i<10，退出循环\n最终count=2。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 0;\n    int count = 0;\n    while(i < 10) {\n        i += 2; // i = i + 2\n        printf(\"i=%d \", i);\n        if(i > 5) {\n            printf(\"(i>5, 不增加count)\\n\");\n            continue; // 跳过count++\n        }\n        count++;\n        printf(\"count=%d\\n\", count);\n    }\n    printf(\"最终count=%d\", count);\n    return 0;\n}\n// 输出：2\n```"
            },
            {
                "id": 19,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint i = 0;\nwhile(1) {\n    i++;    if(i == 3) break;\n    if(i == 2) continue;\n    printf(\"%d \", i);\n}\n",
                "options": [
                    "1",
                    "1 2",
                    "1 3",
                    "无输出"
                ],
                "correctAnswer": 0,
                "explanation": "这是一个无限循环，但有break和continue控制：\n1. i=1：输出\"1\"。\n2. i=2：执行continue，跳过printf语句，继续下一次循环。\n3. i=3：执行break，跳出循环。\n最终输出：1。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int i = 0;\n    while(1) { // 无限循环\n        i++;    printf(\"i=%d \", i);\n        if(i == 3) {\n            printf(\"遇到break，跳出循环\\n\");\n            break; // 跳出循环\n        }\n        if(i == 2) {\n            printf(\"遇到continue，跳过printf\\n\");\n            continue; // 跳过本次循环的剩余部分\n        }\n        printf(\"输出i\\n\");\n    }\n    return 0;\n}\n// 输出：1\n```"
            },
            {
                "id": 20,
                "question": "以下代码执行后，输出结果是？\n\n<C>\nint x = 10;\nswitch(x / 5) {\n    case 1: printf(\"A\"); break;\n    case 2: printf(\"B\"); break;\n    case 3: printf(\"C\"); break;\n    default: printf(\"D\");\n}\n",
                "options": [
                    "A",
                    "B",
                    "C",
                    "D"
                ],
                "correctAnswer": 1,
                "explanation": "x的值为10，x/5的结果为2，匹配case 2，执行printf(\"B\")。由于case 2后面有break语句，所以不会继续执行其他分支。",
                "codeExample": "```c\n#include <stdio.h>\nint main() {\n    int x = 10;\n    printf(\"x/5 = %d\\n\", x / 5);\n    switch(x / 5) {\n        case 1: printf(\"A\"); break;\n        case 2: printf(\"B\"); break;\n        case 3: printf(\"C\"); break;\n        default: printf(\"D\");\n    }\n    return 0;\n}\n// 输出：B\n```"
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