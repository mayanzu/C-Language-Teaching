$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$exerciseDir = Join-Path $PSScriptRoot "..\switch_for循环练习"
$dataPath = Join-Path $exerciseDir "data\questions.json"
$tmpDir = Join-Path $exerciseDir "tmp_verify"
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

$gcc = 'C:\msys64\mingw64\bin\gcc.exe'

if (-not (Test-Path $gcc)) {
    Write-Host "ERROR: gcc not found at $gcc" -ForegroundColor Red
    exit 2
}

$jsonText = Get-Content $dataPath -Raw -ErrorAction Stop
$questions = ConvertFrom-Json $jsonText

$comparisons = @()

foreach ($q in $questions) {
    $id = $q.id
    # 原始 codeExample 文本（用于抽取期望输出），并确保以字符串处理
    $orig = [string]$q.codeExample

    # 先从原始文本抽取期望输出（支持 '输出:' 与 '输出：'）
    # 必须在任何清理前做，以免修改导致无法匹配
    $expected = ([regex]::Match($orig, '输出[:：]\s*(.*)')).Groups[1].Value.Trim()

    # 清理步骤（强力版本）：
    # 1. 移除 UTF-8 BOM (EF BB BF)
    # 2. 移除所有 Markdown code-fence 行及其标签 (```、```c、```python 等)
    # 3. 移除所有反引号字符
    # 4. 清除制表符、不可见字符
    # 5. 从第一个 #include 或 int/void main 开始截取

    $code = $orig -replace "^\uFEFF", ''                          # 移除 UTF-8 BOM
    $code = $code -replace '```+.*', ''                            # 移除三反引号及其后内容（行尾）
    $code = $code -replace '(?m)^[\s]*```+[\s]*$', ''              # 移除单独的三反引号行 (Multiline)
    $code = $code -replace '`', ''                                 # 移除所有反引号
    $code = $code -replace "`t", ' '                               # 制表符->空格
    $code = $code -replace '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ''  # 移除大部分控制字符（保留 \r\n\t）

    # 按行分割，清理每一行
    $lines = $code -split "`r?`n"
    $cleanLines = @()
    foreach ($line in $lines) {
        # 再次检查该行是否全是反引号或空白
        if ($line -match '^\s*`+\s*$') { continue }
        # 移除某行仅为单个字母 c 的情况（Markdown 语言标签残留）
        if ($line -match '^\s*[cC]\s*$') { continue }
        $cleanLines += $line
    }

    # 再次清理，定位真正的 C 源起点
    $realStartIndex = -1
    for ($i = 0; $i -lt $cleanLines.Count; $i++) {
        $trimmed = $cleanLines[$i].Trim()
        if ($trimmed -match '^#\s*include') { $realStartIndex = $i; break }
        if ($trimmed -match '\bint\s+main\b' -or $trimmed -match '\bvoid\s+main\b') { $realStartIndex = $i; break }
    }

    # 如果找到起点，从该点开始；否则使用整个清理后的代码
    if ($realStartIndex -ge 0) {
        $code = ($cleanLines[$realStartIndex..($cleanLines.Count - 1)] -join "`n")
    } else {
        $code = ($cleanLines -join "`n")
    }

    # 最终检查并去掉开头的空行
    $code = $code -replace '^\s*\n', ''
    $src = Join-Path $tmpDir "tmp_q$id.c"
    $exe = Join-Path $tmpDir "tmp_q$id.exe"

    # 以无 BOM 的 UTF8 编码写入，避免写入文件头 BOM 导致编译器误判
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($src, $code, $utf8NoBom)

    # 编译
    $args = @($src, '-o', $exe)
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $gcc
    $startInfo.Arguments = [String]::Join(' ', ($args | ForEach-Object { '"' + $_ + '"' }))
    $startInfo.RedirectStandardError = $true
    $startInfo.UseShellExecute = $false
    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $startInfo
    $proc.Start() | Out-Null
    $stderr = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()
    $compileCode = $proc.ExitCode

    if ($compileCode -ne 0) {
        $comparisons += [PSCustomObject]@{
            id = $id
            status = 'compile_error'
            compile_stderr = $stderr.Trim()
            expected = $expected
            actual = ''
        }
        continue
    }

    # 运行可执行文件并捕获输出
    $runInfo = New-Object System.Diagnostics.ProcessStartInfo
    $runInfo.FileName = $exe
    $runInfo.RedirectStandardOutput = $true
    $runInfo.RedirectStandardError = $true
    $runInfo.UseShellExecute = $false
    $runProc = New-Object System.Diagnostics.Process
    $runProc.StartInfo = $runInfo
    $runProc.Start() | Out-Null
    $stdout = $runProc.StandardOutput.ReadToEnd()
    $stderrRun = $runProc.StandardError.ReadToEnd()
    $runProc.WaitForExit()
    $runCode = $runProc.ExitCode

    # 如果之前没能从原始文本抽取到 expected，再尝试从清理后的代码中查找
    if ([string]::IsNullOrWhiteSpace($expected)) {
        $expected = ([regex]::Match($code, '输出[:：]\s*(.*)')).Groups[1].Value.Trim()
    }
    $actual = $stdout.Trim()
    $compare = if ($expected -eq '') { 'no_expected' } elseif ($expected -eq $actual) { 'match' } else { 'mismatch' }

    $comparisons += [PSCustomObject]@{
        id = $id
        status = if ($runCode -ne 0) { 'runtime_nonzero' } else { 'ok' }
        expected = $expected
        actual = $actual
        compare = $compare
        compile_stderr = ''
        run_stderr = $stderrRun.Trim()
    }
}

$reportPath = Join-Path $tmpDir 'verify_results.json'
$comparisons | ConvertTo-Json -Depth 5 | Set-Content -Path $reportPath -Encoding UTF8

# 打印简短报告
foreach ($c in $comparisons) {
    Write-Host ("Q{0}: {1} (expected: '{2}' | actual: '{3}')" -f $c.id, $c.compare, $c.expected, $c.actual)
}
Write-Host "\nFull report saved to: $reportPath"
