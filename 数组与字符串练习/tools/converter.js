// 题库数据转换工具
// 用于将现有的questions.js转换为模板所需的JSON格式

class QuestionConverter {
    constructor() {
        this.convertedData = [];
    }

    // 从questions.js文件内容转换
    convertFromJSFile(jsContent) {
        try {
            // 提取QUESTIONS_DATA数组
            const match = jsContent.match(/const QUESTIONS_DATA = (\[.*?\]);/s);
            if (!match) {
                throw new Error('未找到QUESTIONS_DATA数组');
            }

            // 使用JSON解析（需要先处理JavaScript对象）
            const jsonStr = match[1]
                .replace(/(\w+):/g, '"$1":')  // 键名加引号
                .replace(/'/g, '\\'')          // 转义单引号
                .replace(/\\n/g, '\\\\n')     // 转义换行符
                .replace(/\\"/g, '\\\\"');    // 转义双引号

            const questions = JSON.parse(jsonStr);
            this.convertedData = questions;
            
            console.log(`成功转换 ${questions.length} 道题目`);
            return questions;
            
        } catch (error) {
            console.error('转换失败:', error);
            throw error;
        }
    }

    // 验证转换后的数据
    validateConvertedData() {
        const requiredFields = ['id', 'question', 'options', 'correctAnswer', 'explanation', 'codeExample'];
        
        for (let i = 0; i < this.convertedData.length; i++) {
            const question = this.convertedData[i];
            
            // 检查必需字段
            for (const field of requiredFields) {
                if (!(field in question)) {
                    throw new Error(`第 ${i + 1} 题缺少必需字段: ${field}`);
                }
            }

            // 检查选项格式
            if (typeof question.options !== 'object' || Object.keys(question.options).length === 0) {
                throw new Error(`第 ${i + 1} 题选项格式错误`);
            }

            // 检查正确答案是否在选项中
            if (!(question.correctAnswer in question.options)) {
                throw new Error(`第 ${i + 1} 题正确答案不在选项中`);
            }
        }

        return true;
    }

    // 导出为JSON文件
    exportToJSON() {
        return JSON.stringify(this.convertedData, null, 2);
    }

    // 保存到文件
    saveToFile(filename = 'questions.json') {
        const jsonData = this.exportToJSON();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 批量转换多个文件
    async convertMultipleFiles(fileContents) {
        const results = [];
        
        for (const [filename, content] of Object.entries(fileContents)) {
            try {
                const questions = this.convertFromJSFile(content);
                results.push({
                    filename,
                    success: true,
                    count: questions.length,
                    data: questions
                });
            } catch (error) {
                results.push({
                    filename,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }
}

// 创建简单的Web界面用于转换
function createConverterUI() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2>题库数据转换工具</h2>
            <textarea id="js-input" placeholder="粘贴questions.js文件内容..." style="width: 100%; height: 200px; margin: 10px 0; padding: 10px;"></textarea>
            <button onclick="convertData()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">转换数据</button>
            <button onclick="downloadJSON()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">下载JSON</button>
            <div id="result" style="margin-top: 20px;"></div>
        </div>
    `;

    document.body.appendChild(container);
}

// 全局转换函数
window.convertData = function() {
    const jsInput = document.getElementById('js-input');
    const resultDiv = document.getElementById('result');
    
    if (!jsInput.value.trim()) {
        resultDiv.innerHTML = '<p style="color: red;">请输入questions.js文件内容</p>';
        return;
    }

    try {
        const converter = new QuestionConverter();
        const questions = converter.convertFromJSFile(jsInput.value);
        converter.validateConvertedData();
        
        window.currentConverter = converter; // 保存转换器实例
        
        resultDiv.innerHTML = `
            <p style="color: green;">✅ 转换成功！共转换 ${questions.length} 道题目</p>
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto;">${converter.exportToJSON()}</pre>
        `;
        
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">❌ 转换失败: ${error.message}</p>`;
    }
};

window.downloadJSON = function() {
    if (!window.currentConverter) {
        alert('请先转换数据');
        return;
    }
    
    window.currentConverter.saveToFile();
};

// 如果直接打开此文件，创建转换界面
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', createConverterUI);
}

// 导出供Node.js使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionConverter;
}