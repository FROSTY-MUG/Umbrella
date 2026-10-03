# Umbrella OS -- PowerShell CLI Wrapper
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PyScript = Join-Path $ScriptDir "umbrella.py"
& python $PyScript @args
