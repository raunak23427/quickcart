$files = Get-ChildItem 'frontend\src\components\*.jsx' | Where-Object {
    (Get-Content $_.FullName -Raw) -match 'http://localhost:5000'
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Add import if not already present
    if ($content -notmatch 'import API_BASE_URL from') {
        $content = "import API_BASE_URL from '../api.js';" + "`n" + $content
    }

    # Replace all occurrences of the hardcoded URL
    $content = $content -replace 'http://localhost:5000', '${API_BASE_URL}'

    Set-Content $file.FullName $content -NoNewline
    Write-Host "Patched: $($file.Name)"
}
Write-Host "Done."
