# 快速开始指南

## 🚀 快速使用

### 方法1：直接替换题库数据

1. 将你的题库数据保存为 `data/questions.json`
2. 打开 `index.html` 即可开始练习

### 方法2：使用现有题库转换

如果你有现有的 `questions.js` 文件：

1. 打开 `tools/converter.html`
2. 粘贴 `questions.js` 文件内容
3. 点击"转换数据"，然后"下载JSON"
4. 将下载的JSON文件放入 `data` 文件夹

## 📋 题库数据格式

题库数据应为JSON数组格式，每个题目包含以下字段：

```json
{
  "id": 1,
  "question": "问题描述",
  "options": {
    "A": "选项A",
    "B": "选项B", 
    "C": "选项C",
    "D": "选项D"
  },
  "correctAnswer": "A",
  "explanation": "答案解析",
  "codeExample": "代码示例"
}
```

### 可选字段（增强功能）

```json
{
  "category": "表达式运算",      // 题目分类
  "difficulty": "中等",          // 难度级别
  "tags": ["运算符", "优先级"]    // 标签
}
```

## 🔧 自定义配置

### 修改页面标题

编辑 `index.html` 中的标题：

```html
<title>你的练习系统标题</title>
<h1>你的练习系统标题</h1>
```

### 修改样式主题

编辑 `css/styles.css` 文件，主要颜色变量：

```css
/* 主色调 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 按钮颜色 */
.btn-primary { background: #667eea; }
```

### 添加更多功能

在 `js/app.js` 中可以扩展功能：

- 添加题目分类筛选
- 实现随机出题
- 添加计时功能
- 保存学习进度

## 📁 文件结构说明

```
template/
├── data/                    # 题库数据
│   └── questions.json       # 题库数据文件
├── css/                     # 样式文件
│   └── styles.css          # 主样式文件
├── js/                      # JavaScript逻辑
│   ├── app.js              # 主应用逻辑
│   └── template-loader.js  # 数据加载器
├── tools/                   # 工具文件
│   ├── converter.js        # 数据转换工具
│   └── converter.html      # 转换器界面
├── index.html              # 主页面
├── README.md               # 详细说明
└── QUICK_START.md         # 本文件
```

## 🌐 部署说明

### 本地使用

直接双击 `index.html` 文件即可在浏览器中打开。

### 服务器部署

将整个 `template` 文件夹上传到Web服务器即可。

### 注意事项

- 如果使用本地文件系统，某些浏览器可能限制跨域请求
- 建议使用本地服务器（如 `python -m http.server`）
- 确保 `data/questions.json` 文件存在且格式正确

## 🐛 故障排除

### 题目加载失败

1. 检查 `data/questions.json` 文件是否存在
2. 验证JSON格式是否正确
3. 查看浏览器控制台错误信息

### 样式显示异常

1. 检查CSS文件路径是否正确
2. 确保所有资源文件都在正确位置

### 转换工具无法使用

1. 确保 `questions.js` 格式正确
2. 检查JavaScript语法是否正确

## 📞 技术支持

如有问题，请检查：

1. 浏览器控制台错误信息
2. 题库数据格式是否正确
3. 文件路径是否配置正确

---

**祝你使用愉快！** 🎉