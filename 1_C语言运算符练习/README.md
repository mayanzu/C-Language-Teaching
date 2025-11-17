# C语言表达式练习系统

## 离线运行说明

**这个网页可以完全离线运行！** 所有资源都是本地的，无需网络连接。

### ✅ 方法一：直接打开（推荐，完全离线）

**直接双击 `index.html` 文件即可在浏览器中打开运行！**

系统已经将题目数据嵌入到 `questions.js` 文件中，所以不需要服务器，可以直接用 `file://` 协议打开。

### 方法二：使用本地服务器（可选）

如果你想使用 `questions.json` 文件（而不是 `questions.js`），可以使用本地服务器：

#### Windows PowerShell:
```powershell
# Python 3
python -m http.server 8000

# 或者使用 Node.js (如果已安装)
npx http-server -p 8000
```

#### 然后在浏览器中访问：
```
http://localhost:8000
```

## 文件说明

- `index.html` - 主页面
- `styles.css` - 样式文件
- `app.js` - 逻辑文件
- `questions.js` - 题目数据（JavaScript格式，**完全离线可用**）
- `questions.json` - 题目数据（JSON格式，需要服务器或允许本地文件访问）

## 修改题库

有两种方式修改题目：

### 方式一：修改 questions.js（推荐，完全离线）
编辑 `questions.js` 文件，修改 `QUESTIONS_DATA` 数组中的题目数据。

### 方式二：修改 questions.json
编辑 `questions.json` 文件，然后使用本地服务器运行（见方法二）。

**注意**：如果同时存在 `questions.js` 和 `questions.json`，系统会优先使用 `questions.js`。

