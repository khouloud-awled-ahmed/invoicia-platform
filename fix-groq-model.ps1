$files = @(
  "backend\src\document-parser\services\universal-document-parser.service.ts",
  "backend\src\hr-insights\ai-report.service.ts",
  "backend\src\insights\insights.service.ts"
)

$old = "llama-3.3-70b-versatile"
$new = "openai/gpt-oss-120b"

foreach ($f in $files) {
  if (Test-Path $f) {
    $content = Get-Content $f -Raw
    $count = ([regex]::Matches($content, [regex]::Escape($old))).Count
    $content = $content -replace [regex]::Escape($old), $new
    Set-Content -Path $f -Value $content -NoNewline
    Write-Host "Fixed $count occurrence(s) in $f"
  } else {
    Write-Host "NOT FOUND: $f" -ForegroundColor Yellow
  }
}

Write-Host "`nDone. Now restart your backend."
