$ErrorActionPreference="Stop"
$source="$env:LOCALAPPDATA\Comfy-Desktop\ComfyUI-Shared\output\cosyvoice_benchmark_30"
$destination=Join-Path $PSScriptRoot "audio"
if(-not(Test-Path $source)){throw "Could not find $source"}
$candidates=Get-Content (Join-Path $PSScriptRoot "candidates.json") -Raw|ConvertFrom-Json
foreach($c in $candidates){$name=[IO.Path]::GetFileNameWithoutExtension($c.audio);$match=Get-ChildItem $source -File|Where-Object{$_.BaseName -like "$name*"}|Sort-Object LastWriteTime -Descending|Select-Object -First 1;if(-not $match){throw "Missing $name"};Copy-Item $match.FullName (Join-Path $destination "$name.flac") -Force}
Write-Host "Done. Copied 20 bilingual candidates. Max-Diamand audio was excluded." -ForegroundColor Green
