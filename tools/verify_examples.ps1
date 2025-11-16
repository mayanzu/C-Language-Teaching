$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$exerciseDir = Join-Path $PSScriptRoot "..\C语言运算符练习"
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
    $code = $q.codeExample -join "`n"
    $src = Join-Path $tmpDir "tmp_q$id.c"
    $exe = Join-Path $tmpDir "tmp_q$id.exe"
    $errCompile = Join-Path $tmpDir "tmp_q${id}_compile_err.txt"
    $outRun = Join-Path $tmpDir "tmp_q${id}_out.txt"
    $errRun = Join-Path $tmpDir "tmp_q${id}_run_err.txt"

    Set-Content -Path $src -Value $code -Encoding UTF8

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
            expected = ([regex]::Match($code, '输出:\s*(.*)')).Groups[1].Value.Trim()
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

    $expected = ([regex]::Match($code, '输出:\s*(.*)')).Groups[1].Value.Trim()
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
