import os
import json
import re
import subprocess

# 配置
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXERCISE_DIR = os.path.join(ROOT, 'C语言运算符练习')
QUESTIONS_JSON = os.path.join(EXERCISE_DIR, 'data', 'questions.json')
GCC = r"C:\msys64\mingw64\bin\gcc.exe"  # 来自工作区任务
TMP_DIR = os.path.join(EXERCISE_DIR, 'tmp_verify')

os.makedirs(TMP_DIR, exist_ok=True)

with open(QUESTIONS_JSON, 'r', encoding='utf-8') as f:
    questions = json.load(f)

results = []

def extract_expected(code):
    # 在 codeExample 中查找注释 '输出:' 后的文本（取第一处）
    m = re.search(r'输出:\s*(.*)', code)
    if not m:
        # 有时使用英文 'Output:' 或无注释，返回空
        m = re.search(r'Output:\s*(.*)', code, re.I)
    if m:
        return m.group(1).strip()
    return ''

for q in questions:
    qid = q.get('id')
    code = q.get('codeExample', '')
    src_path = os.path.join(TMP_DIR, f'tmp_q{qid}.c')
    exe_path = os.path.join(TMP_DIR, f'tmp_q{qid}.exe')

    with open(src_path, 'w', encoding='utf-8') as sf:
        sf.write(code)

    compile_proc = subprocess.run([GCC, src_path, '-o', exe_path], capture_output=True, text=True)
    if compile_proc.returncode != 0:
        results.append({
            'id': qid,
            'status': 'compile_error',
            'compile_stderr': compile_proc.stderr.strip()
        })
        continue

    run_proc = subprocess.run([exe_path], capture_output=True, text=True)
    if run_proc.returncode != 0:
        # 有些示例会返回非零但依旧有输出（例如未定义行为示例被注释掉的情况）
        results.append({
            'id': qid,
            'status': 'runtime_nonzero',
            'returncode': run_proc.returncode,
            'stdout': run_proc.stdout.strip(),
            'stderr': run_proc.stderr.strip()
        })
        # 仍继续收集 stdout
    else:
        results.append({
            'id': qid,
            'status': 'ok',
            'stdout': run_proc.stdout.strip()
        })

# 比较实际输出与注释中的预期（若存在）
comparisons = []
for q, r in zip(questions, results):
    expected = extract_expected(q.get('codeExample',''))
    actual = r.get('stdout','').strip()
    match = None
    if expected == '':
        match = 'no_expected'
    else:
        # 简单字符串比较，忽略首尾空白
        match = 'match' if actual == expected else 'mismatch'
    comparisons.append({
        'id': q.get('id'),
        'expected': expected,
        'actual': actual,
        'compare': match,
        'raw_result': r
    })

OUTPUT_PATH = os.path.join(TMP_DIR, 'verify_results.json')
with open(OUTPUT_PATH, 'w', encoding='utf-8') as of:
    json.dump({'comparisons': comparisons}, of, ensure_ascii=False, indent=2)

# 打印简短报告
for c in comparisons:
    print(f"Q{c['id']}: compare={c['compare']}; expected={c['expected']!r}; actual={c['actual']!r}")

print('\nFull report saved to:', OUTPUT_PATH)
