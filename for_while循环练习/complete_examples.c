#include <stdio.h>

// 完整的C语言switch和for循环练习代码示例

// 1. switch语句基础示例
void switch_basic_example() {
    printf("=== 1. switch语句基础示例 ===\n");
    int a = 2;
    switch(a) {
        case 1: printf("A"); break;
        case 2: printf("B"); // 没有break，会继续执行下一个case
        case 3: printf("C"); break;
        default: printf("D");
    }
    printf("\n输出：BC\n\n");
}

// 2. switch贯穿现象示例
void switch_fallthrough_example() {
    printf("=== 2. switch贯穿现象示例 ===\n");
    int a = 2;
    switch(a) {
        case 1: printf("A"); break;
        case 2: printf("B"); // 没有break，会继续执行下一个case
        case 3: printf("C"); break;
        default: printf("D");
    }
    printf("\n输出：BC\n\n");
}

// 3. default分支示例
void switch_default_example() {
    printf("=== 3. default分支示例 ===\n");
    int x = 5;
    switch(x) {
        case 1: printf("一"); break;
        case 2: printf("二"); break;
        default: printf("其他"); // x=5时执行这里
    }
    printf("\n输出：其他\n\n");
}

// 4. switch常量表达式示例
void switch_constant_example() {
    printf("=== 4. switch常量表达式示例 ===\n");
    switch(2) {
        case 1+1:  // 常量表达式正确
            printf("等于2");
            break;
    }
    printf("\n输出：等于2\n\n");
}

// 5. 字符switch示例
void switch_char_example() {
    printf("=== 5. 字符switch示例 ===\n");
    char ch = 'B';
    switch(ch) {
        case 'A': case 'a': printf("优秀"); break;
        case 'B': case 'b': printf("良好"); break;
        default: printf("及格");
    }
    printf("\n输出：良好\n\n");
}

// 6. switch与if-else对比示例
void switch_vs_if_example() {
    printf("=== 6. switch与if-else对比示例 ===\n");
    int score = 85;
    
    // switch只能用于等值判断
    printf("switch方式：");
    switch(score) {
        case 90: printf("A"); break;
        case 85: printf("B"); break;
    }
    
    printf("\nif方式：");
    if (score >= 90) printf("A");
    else if (score >= 80) printf("B");
    
    printf("\n\n");
}

// 7. switch错误用法示例
void switch_error_example() {
    printf("=== 7. switch错误用法示例 ===\n");
    // 错误的代码 - switch表达式不能是浮点型
    // double d = 3.14;
    // switch(d) {  // 错误：switch表达式不能是浮点型
    //     case 3.14: printf("π"); break;
    // }
    
    printf("switch表达式不能是浮点型，应该用if语句：\n");
    double d = 3.14;
    if (d == 3.14) printf("π");
    printf("\n\n");
}

// 8. 成绩等级判断示例
void grade_judgment_example() {
    printf("=== 8. 成绩等级判断示例 ===\n");
    int score = 85;
    switch(score / 10) {  // 85/10=8
        case 10: case 9: printf("A"); break;
        case 8: printf("B"); break;  // 匹配这里
        case 7: printf("C"); break;
        default: printf("D");
    }
    printf("\n输出：B\n\n");
}

// 9. 选择结构嵌套示例
void nested_selection_example() {
    printf("=== 9. 选择结构嵌套示例 ===\n");
    int x = 5, y = 10;
    
    // 在switch中嵌套if
    printf("在switch中嵌套if：");
    switch(x) {
        case 5:
            if (y > 5) printf("x=5且y>5");
            else printf("x=5但y<=5");
            break;
    }
    
    printf("\n在if中嵌套switch：");
    if (x > 0) {
        switch(y) {
            case 10: printf("y=10"); break;
        }
    }
    printf("\n\n");
}

// 10. 复杂嵌套选择结构示例
void complex_nested_example() {
    printf("=== 10. 复杂嵌套选择结构示例 ===\n");
    int x = 3, y = 5;
    if(x > 2) {
        switch(y) {
            case 5: printf("Y=5"); break;
            case 6: printf("Y=6"); break;
        }
    } else {
        printf("X<=2");
    }
    printf("\n输出：Y=5\n\n");
}

// 11. for循环基础示例
void for_loop_basic_example() {
    printf("=== 11. for循环基础示例 ===\n");
    for(int i=1; i<=5; i++) {
        // 表达式1：i=1（初始化）
        // 表达式2：i<=5（条件判断）
        // 表达式3：i++（循环后操作）
        printf("%d ", i);
    }
    printf("\n输出：1 2 3 4 5\n\n");
}

// 12. for循环执行次数分析
void for_loop_count_example() {
    printf("=== 12. for循环执行次数分析 ===\n");
    printf("执行过程：\n");
    for(int i=1; i<=5; i++) {
        printf("i=%d → 输出%d\n", i, i);
    }
    printf("i=6 → 退出循环\n");
    printf("共执行5次\n\n");
}

// 13. 累加求和示例
void sum_example() {
    printf("=== 13. 累加求和示例 ===\n");
    int sum = 0;
    for(int i=1; i<=100; i++) {
        sum += i;
    }
    printf("1+2+...+100=%d\n", sum);
    printf("输出：5050\n\n");
}

// 14. 死循环示例
void infinite_loop_example() {
    printf("=== 14. 死循环示例 ===\n");
    printf("注意：这个示例会无限循环，实际运行时应避免\n");
    // 死循环示例（注释掉避免实际运行）
    /*
    for(int i=1; i<=5; i--) {  // i递减，永远<=5
        printf("%d ", i);
        // 输出：1 0 -1 -2 ... 无限循环
    }
    */
    printf("无限循环示例（已注释）\n\n");
}

// 15. 乘法表示例
void multiplication_example() {
    printf("=== 15. 乘法表示例 ===\n");
    int n = 5;
    for(int i=1; i<=n; i++) {
        printf("%d ", i*2);
    }
    printf("\n输出：2 4 6 8 10\n\n");
}

// 16. for循环表达式详解
void for_loop_expression_example() {
    printf("=== 16. for循环表达式详解 ===\n");
    int i;
    for(i=0; i<3; i++) {
        printf("循环体执行，i=%d\n", i);
    }
    printf("循环结束，i=%d\n", i);
    printf("\n");
}

// 17. break和continue示例
void break_continue_example() {
    printf("=== 17. break和continue示例 ===\n");
    printf("使用break：");
    for(int i=1; i<=5; i++) {
        if(i == 3) break;  // 当i=3时退出循环
        printf("%d ", i);
    }
    printf("\n输出：1 2\n");
    
    printf("使用continue：");
    for(int i=1; i<=5; i++) {
        if(i == 3) continue;  // 当i=3时跳过本次循环
        printf("%d ", i);
    }
    printf("\n输出：1 2 4 5\n\n");
}

// 18. 嵌套循环示例
void nested_loop_example() {
    printf("=== 18. 嵌套循环示例 ===\n");
    for(int i=1; i<=3; i++) {
        for(int j=1; j<=3; j++) {
            printf("(%d,%d) ", i, j);
        }
        printf("\n");
    }
    printf("\n");
}

// 19. 循环控制变量作用域示例
void loop_scope_example() {
    printf("=== 19. 循环控制变量作用域示例 ===\n");
    // C99标准支持在for循环中声明变量
    for(int i=0; i<3; i++) {
        printf("i=%d ", i);
    }
    printf("\n\n");
}

// 20. 综合应用示例
void comprehensive_example() {
    printf("=== 20. 综合应用示例 ===\n");
    // 使用switch和for循环实现菜单系统
    int choice = 2;
    
    switch(choice) {
        case 1:
            printf("执行选项1：打印1-5\n");
            for(int i=1; i<=5; i++) {
                printf("%d ", i);
            }
            break;
            
        case 2:
            printf("执行选项2：计算1-10的平方\n");
            for(int i=1; i<=10; i++) {
                printf("%d^2=%d ", i, i*i);
            }
            break;
            
        default:
            printf("无效选项\n");
    }
    printf("\n\n");
}

int main() {
    printf("C语言switch和for循环完整代码示例\n");
    printf("====================================\n\n");
    
    // 执行所有示例
    switch_basic_example();
    switch_fallthrough_example();
    switch_default_example();
    switch_constant_example();
    switch_char_example();
    switch_vs_if_example();
    switch_error_example();
    grade_judgment_example();
    nested_selection_example();
    complex_nested_example();
    for_loop_basic_example();
    for_loop_count_example();
    sum_example();
    infinite_loop_example();
    multiplication_example();
    for_loop_expression_example();
    break_continue_example();
    nested_loop_example();
    loop_scope_example();
    comprehensive_example();
    
    printf("所有示例执行完成！\n");
    return 0;
}