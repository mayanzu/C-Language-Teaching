# C语言教程讲义 - 通用模板使用指南

## 文件结构

```
讲义/
├── template-styles.css     # 通用CSS模板（系统化重构版，含完整分类注释）
├── template.html           # 通用HTML模板（包含所有元素类型的占位示例）
├── tutorial.js             # 公共脚本（复制按钮 + 导航高亮）
├── icons.svg               # SVG图标资源
├── 0_计算机基础与编程入门.html ~ 11_位运算与文件操作.html  # 12个讲义
└── README-template.md      # 本文件
```

---

## 快速开始：新增讲义

### 方法一：基于模板创建（推荐）

1. **复制模板文件**
   ```bash
   cp template.html 11_新章节标题.html
   ```

2. **替换所有占位符** — 搜索 `★` 标记，逐个替换为实际内容

3. **确认资源引用路径**（模板中已预设，同级目录无需修改）：
   ```html
   <link rel="stylesheet" href="template-styles.css">
   <script src="tutorial.js"></script>
   ```

4. **浏览器预览** — 直接双击打开HTML文件即可查看效果

### 方法二：从零创建

创建新HTML文件，必须包含以下基本结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>章节标题 - C语言教程</title>
    <link rel="stylesheet" href="template-styles.css">
</head>
<body>
    <nav class="tutorial-nav">...</nav>
    <main class="tutorial-content">...</main>
    <script src="tutorial.js"></script>
</body>
</html>
```

---

## 模板文件详解

### template.html — 页面结构模板

模板包含以下预置区块，每个区块用 HTML 注释清晰标注：

| 区块 | HTML ID / 类 | 说明 |
|------|-------------|------|
| SVG图标引用 | `.svg-sprite` | 页面顶部隐藏的SVG引用，如需图标保留 |
| 侧边导航栏 | `.tutorial-nav` | 每个li对应一个section锚点，首项默认 `.active` |
| 页面标题 | `.tutorial-header` | h1标题 + 一句话描述 |
| 简介区 | `#intro` | 章节介绍 + callout提示框 |
| 第一节 | `#section-1` | 完整示例：子章节、代码块、表格 |
| 第二节 | `#section-2` | 示例网格卡片 + 警告框 |
| 练习题 | `#practice` | 折叠答案的练习题 + 练习提示 |
| 本章小结 | `#summary` | 重点回顾 + 下一章预告 |

**新增章节步骤：**
1. 复制一个 `<section>` 区块
2. 修改 `id` 属性（如 `id="section-3"`）
3. 在导航栏 `<nav>` 中添加对应链接
4. 替换内容

### template-styles.css — 样式模板

系统化重构版，包含 **16个分类**，顶部完整目录索引。主要特点：

- **设计令牌**：所有颜色、字体、间距使用CSS变量，修改一处全局生效
- **行内代码多场景适配**：段落内、列表内、提示框内、表格内各有微调
- **响应式断点**：1440px / 2560px / 1024px / 768px / 480px / 打印

### tutorial.js — 公共脚本

自动加载的功能（无需手动调用）：

| 功能 | 触发条件 | 效果 |
|------|---------|------|
| 复制按钮 | 存在 `.code-block-title` | 自动在标题栏右侧添加复制按钮 |
| 导航高亮 | 存在 `.tutorial-nav` + `.section` | 滚动时自动高亮当前章节，点击切换 |

---

## 样式类名速查表

### 布局结构

| 类名 | 用途 | 说明 |
|------|------|------|
| `.tutorial-container` | 页面容器 | `display: flex`，包含导航和内容 |
| `.tutorial-nav` | 侧边导航栏 | 固定左侧，220px宽，毛玻璃背景 |
| `.tutorial-content` | 主内容区域 | 左边距220px，最大宽度1000px |
| `.tutorial-header` | 页面标题头部 | h1 + 描述段落，底部边框分隔 |

### 排版层级

| 类名/标签 | 用途 | 说明 |
|------|------|------|
| `.section` | 主要章节 | 每个section对应导航一个锚点，`scroll-margin-top` 支持偏移 |
| `.section-title` | 章节标题 | h2，32px，粗体700 |
| `.subsection` | 子章节 | 一个section内的子分区 |
| `.subsection-title` | 子章节标题 | h3，24px，半粗600 |
| `.subsection-content` | 子章节内容 | 包含段落、列表、代码等，文字颜色 `#6E6E73` |
| `h3:not(.subsection-title)` | 内容区小标题 | 22px，用于知识点小标题 |
| `h4` | 四级标题 | 18px，用于更细的分类 |

### 代码展示

| 类名/选择器 | 用途 | 说明 |
|------|------|------|
| `code` | 行内代码（基础） | 紫色 `#AD3DA4`，浅灰背景，圆角5px，带边框和微阴影 |
| `p code` | 段落内行内代码 | 0.9em字号，适配段落行高 |
| `li code` | 列表项内行内代码 | 0.88em字号，紧凑间距 |
| `.callout code` | 提示框内行内代码 | 半透明白色背景，0.88em字号 |
| `.question-item code` | 练习题内行内代码 | 0.88em字号，紧凑间距 |
| `.example-item code` | 示例卡片内行内代码 | 0.88em字号，紧凑间距 |
| `td code` | 表格内行内代码 | 14px字号，4px圆角，不换行 |
| `.code-block` | 代码块容器 | 浅灰背景，圆角12px，带阴影，hover上浮效果 |
| `.code-block-title` | 代码块标题 | 顶部渐变标题栏，左侧三点装饰，自动添加复制按钮 |

**行内代码使用场景对比：**

```
场景                          写法                          效果
─────────────────────────────────────────────────────────────────
正文中引用函数/关键字          <code>printf</code>           紫色，浅灰背景，圆角边框
表格中展示代码片段            <td><code>a + b</code></td>   14px紧凑样式
提示框中高亮代码              .callout内 <code>...</code>   半透明白底
代码块中的代码                .code-block pre code          无背景/边框（由代码块统一控制）
```

### 语法高亮（span类名）

| 类名 | 颜色 | 用途 | 示例 |
|------|------|------|------|
| `.c-keyword` | 紫色 `#AD3DA4` | 关键字 | `int` `return` `if` `while` `for` |
| `.c-string` | 红色 `#D12F1B` | 字符串 | `"hello"` `'A'` |
| `.c-number` | 蓝色 `#1C00CF` | 数字 | `10` `3.14` `0xFF` |
| `.c-comment` | 灰色 `#5D6C79` | 注释（斜体） | `// 注释` `/* 多行 */` |
| `.c-function` | 青色 `#3E8087` | 函数名 | `printf` `scanf` `main` |
| `.c-operator` | 黑色 `#1D1D1F` | 运算符 | `+` `-` `*` `&&` |
| `.c-preprocessor` | 棕色 `#78492A` | 预处理指令 | `#include` `#define` |
| `.c-variable` | 黑色 | 变量名 | `a` `count` `result` |
| `.line-number` | 灰色 | 行号 | 不可选中，右侧边框分隔 |
| `.highlight-line` | 蓝色高亮 | 高亮行 | 左侧3px蓝色竖线 + 浅蓝背景 |

### 说明提示框（Callouts）

| 类名 | 边框颜色 | 用途 | 场景 |
|------|----------|------|------|
| `.callout-tip` | 蓝色 `#0066CC` | 一般提示说明 | 语法说明、使用技巧 |
| `.callout-warning` | 灰色 `#86868B` | 重要警告信息 | 常见错误、陷阱提醒 |
| `.callout-note` | 灰色 `#86868B` | 新手注意事项 | 入门须知、前置知识 |
| `.callout-success` | 灰色 `#86868B` | 成功提示/正面反馈 | 正确做法、最佳实践 |

**提示框结构规则：**
- 标题用 `<strong>` 标签，自动 `display: block`，15px粗体
- 内容用 `<p>` 或 `<ul>`，16px，颜色 `#6E6E73`
- 可搭配SVG图标：`<svg class="icon" width="16" height="16"><use href="icons.svg#icon-warning"></use></svg>`

### 示例展示

| 类名 | 用途 | 说明 |
|------|------|------|
| `.example-grid` | 示例网格容器 | 3列自适应网格（`minmax(280px, 1fr)`） |
| `.example-item` | 示例卡片 | 白色背景，圆角12px，hover上浮+阴影 |

### 表格

| 类名 | 用途 | 说明 |
|------|------|------|
| `.table-container` | 表格外层容器 | 提供横向滚动，带边框和圆角 |
| `table` | 通用表格 | 100%宽度，紧凑行高 |
| `.comparison-table` | 比较表格 | 特殊宽度设置 |
| `.table-note` | 表格注释 | 表格下方说明文字 |

**表格样式特点：**
- 表头：浅灰背景，大写字母，14px粗体
- 单元格：底部1px边框，hover行高亮
- 最后一行无底部边框

### 练习题

| 类名 | 用途 | 说明 |
|------|------|------|
| `.practice-questions` | 练习题容器 | 白色卡片，圆角16px，带阴影 |
| `.question-item` | 单个题目 | 顶部分隔线，首个无分隔 |
| `.question-item details` | 折叠答案 | 浅灰背景，圆角12px |
| `.question-item summary` | 答案展开按钮 | 蓝色文字，▶ 箭头动画旋转 |
| `.practice-hints` | 练习提示 | 浅灰背景，💡图标列表 |
| `#practice` | 练习章节ID | 带编号圆圈的特殊列表样式 |

**练习题两种布局：**

1. **折叠答案式**（推荐）— 使用 `.practice-questions` + `.question-item` + `<details>`
2. **编号圆圈式** — 设置 `<section id="practice">`，内部 `<ol>` 自动生成蓝色编号圆圈

### 流程图

| 类名 | 用途 | 说明 |
|------|------|------|
| `.flow-diagram` / `.execution-flow` | 流程图容器 | 白色背景，带边框 |
| `.flow-step` | 流程步骤 | 蓝色背景，白色文字 |
| `.flow-decision` | 判断步骤 | 灰色背景，白色文字 |

---

## HTML元素模板片段

### 1. 代码块（带语法高亮）

```html
<div class="code-block">
    <div class="code-block-title">代码标题</div>
    <pre><code><span class="c-comment">// 注释</span>
<span class="c-preprocessor">#include</span> <span class="c-string">&lt;stdio.h&gt;</span>

<span class="c-keyword">int</span> <span class="c-function">main</span>() {
    <span class="c-keyword">int</span> a = <span class="c-number">10</span>;
    <span class="c-function">printf</span>(<span class="c-string">"Hello\n"</span>);
    <span class="c-keyword">return</span> <span class="c-number">0</span>;
}</code></pre>
</div>
```

### 2. 代码块（带高亮行）

```html
<div class="code-block">
    <div class="code-block-title">带高亮行的代码</div>
    <pre><code><span class="c-keyword">int</span> a = <span class="c-number">10</span>;
<span class="highlight-line">    a = a + <span class="c-number">1</span>;  <span class="c-comment">// 这一行被高亮</span></span>
<span class="c-keyword">return</span> a;</code></pre>
</div>
```

### 3. 代码块（带图标标题）

```html
<div class="code-block">
    <div class="code-block-title">
        <svg class="icon" width="16" height="16"><use href="icons.svg#icon-error"></use></svg>
        错误示例
    </div>
    <pre><code>...</code></pre>
</div>
```

可用图标：`icon-warning`（警告）、`icon-check`（正确）、`icon-error`（错误）

### 4. 行内代码

```html
<!-- 段落中使用 -->
<p>在C语言中，使用 <code>printf</code> 函数输出内容。</p>

<!-- 列表中使用 -->
<ul>
    <li><strong>格式符：</strong><code>%d</code> 输出整数</li>
    <li><strong>转义符：</strong><code>\n</code> 换行</li>
</ul>

<!-- 表格中使用 -->
<td><code>a + b</code></td>

<!-- 提示框中使用 -->
<div class="callout-tip">
    <strong>提示：</strong>
    <p>使用 <code>sizeof</code> 查看类型大小。</p>
</div>
```

### 5. 提示框

```html
<!-- 一般提示 -->
<div class="callout-tip">
    <strong>提示标题</strong>
    <p>提示内容</p>
</div>

<!-- 警告 -->
<div class="callout-warning">
    <svg class="icon" width="16" height="16"><use href="icons.svg#icon-warning"></use></svg>
    <strong>警告标题</strong>
    <ul>
        <li>警告项1</li>
        <li>警告项2</li>
    </ul>
</div>

<!-- 新手注意 -->
<div class="callout-note">
    <strong>新手注意：</strong>
    <p>注意事项内容</p>
</div>
```

### 6. 练习题（折叠答案）

```html
<div class="practice-questions">
    <h3 class="subsection-title">练习标题</h3>
    <div class="question-item">
        <p><strong>练习1：</strong> 题目描述，例如写出 <code>printf</code> 的基本用法。</p>
        <details>
            <summary>参考答案</summary>
            <div class="code-block">
                <div class="code-block-title">答案代码</div>
                <pre><code><span class="c-keyword">#include</span> <span class="c-string">&lt;stdio.h&gt;</span>

<span class="c-keyword">int</span> <span class="c-function">main</span>() {
    <span class="c-function">printf</span>(<span class="c-string">"Hello\n"</span>);
    <span class="c-keyword">return</span> <span class="c-number">0</span>;
}</code></pre>
            </div>
        </details>
    </div>
</div>
```

### 7. 练习题（编号圆圈式）

```html
<section id="practice" class="section">
    <h2 class="section-title">练习题</h2>
    <ol>
        <li>题目描述1</li>
        <li>题目描述2</li>
    </ol>
</section>
```

### 8. 表格

```html
<div class="table-container">
    <table>
        <thead>
            <tr>
                <th>列1</th>
                <th>列2</th>
                <th>列3</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>文字内容</td>
                <td><code>代码内容</code></td>
                <td>说明</td>
            </tr>
        </tbody>
    </table>
</div>
<p class="table-note">表格注释说明</p>
```

### 9. 示例网格

```html
<div class="example-grid">
    <div class="example-item">
        <strong>卡片标题1</strong>
        <ul>
            <li>内容项1</li>
            <li>内容项2</li>
        </ul>
    </div>
    <div class="example-item">
        <strong>卡片标题2</strong>
        <ul>
            <li>内容项1</li>
            <li>内容项2</li>
        </ul>
    </div>
    <div class="example-item">
        <strong>卡片标题3</strong>
        <ul>
            <li>内容项1</li>
            <li>内容项2</li>
        </ul>
    </div>
</div>
```

### 10. 流程图

```html
<div class="flow-diagram">
    <div class="flow-step">步骤1：开始</div>
    <div class="flow-decision">判断条件？</div>
    <div class="flow-step">步骤2：执行操作</div>
</div>
```

### 11. 问题分析

```html
<div class="question-analysis">
    <h4>问题分析标题</h4>
    <p>分析内容</p>
</div>
```

### 12. 练习提示

```html
<div class="practice-hints">
    <h3>练习提示</h3>
    <ul>
        <li>提示1</li>
        <li>提示2</li>
        <li>提示3</li>
    </ul>
</div>
```

---

## 新增讲义完整流程

以下是从零创建一篇新讲义的完整步骤：

### 第1步：复制模板

```bash
cp template.html 11_新章节标题.html
```

### 第2步：修改页面头部

```html
<title>新章节标题 - C语言教程</title>
```

### 第3步：修改导航栏

根据实际章节数量增删导航项：

```html
<nav class="tutorial-nav">
    <ul>
        <li><a href="#intro" class="active">简介</a></li>
        <li><a href="#basics">基础概念</a></li>
        <li><a href="#advanced">进阶用法</a></li>
        <li><a href="#practice">练习题</a></li>
        <li><a href="#summary">小结</a></li>
    </ul>
</nav>
```

> **注意**：第一个导航项加 `class="active"`，`tutorial.js` 会自动处理滚动高亮。

### 第4步：修改页面标题

```html
<header class="tutorial-header">
    <h1>新章节标题</h1>
    <p>一句话描述本章学习内容</p>
</header>
```

### 第5步：填充各章节内容

- 复制模板中的 `<section>` 区块，修改 `id` 和内容
- 用上方"HTML元素模板片段"中的代码片段组合内容
- 搜索所有 `★` 标记，替换为实际内容

### 第6步：预览和调试

1. 浏览器直接打开HTML文件预览
2. 检查导航跳转是否正常
3. 检查代码块复制按钮是否工作
4. 检查响应式布局（缩放浏览器窗口）
5. 检查打印预览（`Ctrl+P`）

---

## 语法高亮手动标注指南

由于项目没有使用自动语法高亮库，需要在HTML中手动用 `<span>` 标注。以下是标注规则：

### 常见C语言元素标注示例

| C语言元素 | HTML标注写法 |
|----------|-------------|
| `int`, `return`, `if`, `while` | `<span class="c-keyword">int</span>` |
| `"hello"`, `'A'` | `<span class="c-string">"hello"</span>` |
| `10`, `3.14`, `0xFF` | `<span class="c-number">10</span>` |
| `// 注释`, `/* 多行 */` | `<span class="c-comment">// 注释</span>` |
| `printf`, `scanf`, `main` | `<span class="c-function">printf</span>` |
| `+`, `-`, `*`, `&&`, `==` | `<span class="c-operator">+</span>` |
| `#include`, `#define` | `<span class="c-preprocessor">#include</span>` |
| `a`, `count`, `result` | `<span class="c-variable">a</span>` |

### 标注技巧

1. **先写纯文本代码，再逐行标注** — 避免遗漏
2. **优先标注关键字和字符串** — 这两个最醒目
3. **注释用斜体已足够区分** — `.c-comment` 自带斜体
4. **函数名和变量名可选标注** — 不标注时默认黑色，不影响可读性
5. **HTML特殊字符需转义**：
   - `<` → `&lt;`
   - `>` → `&gt;`
   - `&` → `&amp;`

---

## 设计令牌自定义

如需调整全局风格，修改 `template-styles.css` 中的 `::root` 变量即可：

```css
:root {
    /* 主色调 — 修改此处改变全局蓝色主题 */
    --color-accent-blue: #0066CC;

    /* 正文字号 — 修改此处改变全局文字大小 */
    /* font-size 在 body 上设置为 17px */

    /* 代码字体 — 可替换为其他等宽字体 */
    --font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;

    /* 内容区最大宽度 */
    /* .tutorial-content max-width: 1000px */
}
```

---

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 讲义文件 | `序号_章节标题.html` | `0_计算机基础与编程入门.html` |
| CSS类名 | 小写+连字符 | `.callout-tip`, `.code-block` |
| 语法高亮类 | `.c-` 前缀 | `.c-keyword`, `.c-string` |
| 布局类 | `.tutorial-` 前缀 | `.tutorial-nav`, `.tutorial-content` |
| Section ID | 小写英文+连字符 | `#intro`, `#section-1`, `#practice` |

---

## 常见问题

### Q: 复制按钮不显示？
A: 确保 `tutorial.js` 已正确引入，且代码块使用了 `.code-block` + `.code-block-title` 结构。复制按钮仅在有 `.code-block-title` 时自动注入。

### Q: 导航高亮不工作？
A: 确保 `<nav class="tutorial-nav">` 和 `<section class="section" id="...">` 同时存在，且导航链接的 `href` 与 section 的 `id` 一致。

### Q: 行内代码在代码块中也有背景？
A: 不会。`.code-block code` 样式已重置（`background: transparent; border: none; padding: 0;`），代码块内的行内代码由代码块统一控制样式。

### Q: 如何添加新的提示框类型？
A: 在CSS中仿照 `.callout-tip` 添加新类，设置 `background` 和 `border-left-color` 即可。

### Q: 表格太宽溢出？
A: 将 `<table>` 包裹在 `<div class="table-container">` 中，自动提供横向滚动。
