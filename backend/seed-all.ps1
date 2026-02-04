# Tüm seed dosyalarını sırayla çalıştıran PowerShell scripti
Write-Host "🌱 Starting comprehensive database seeding..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$seedFiles = @(
    "seed-tyt-matematik.ts",
    "seed-tyt-fizik.ts",
    "seed-tyt-kimya.ts",
    "seed-tyt-biyoloji.ts",
    "seed-tyt-tarih.ts",
    "seed-tyt-cografya.ts",
    "seed-tyt-felsefe.ts",
    "seed-tyt-din.ts",
    "seed-tyt-turkce.ts",
    "seed-tyt-geometri.ts",
    "seed-ayt-matematik.ts",
    "seed-ayt-fizik.ts",
    "seed-ayt-kimya.ts",
    "seed-ayt-biyoloji.ts",
    "seed-ayt-edebiyat.ts",
    "seed-ayt-tarih1.ts",
    "seed-ayt-cografya1.ts",
    "seed-ayt-felsefe.ts",
    "seed-ayt-din.ts",
    "seed-ayt-geometri.ts",
    "seed-lgs-matematik.ts",
    "seed-lgs-fen.ts",
    "seed-lgs-turkce.ts",
    "seed-lgs-inkilap.ts",
    "seed-lgs-din.ts",
    "seed-lgs-ingilizce.ts",
    "seed-ydt-ingilizce.ts",
    "seed-common-activities.ts",
    "seed-special-subjects.ts",
    "seed-lms.ts"
)

$totalFiles = $seedFiles.Count
$currentFile = 0
$failedFiles = @()

foreach ($file in $seedFiles) {
    $currentFile++
    Write-Host "[$currentFile/$totalFiles] Running $file..." -ForegroundColor Cyan
    
    $result = npx ts-node "prisma/$file" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $file completed" -ForegroundColor Green
    } else {
        Write-Host "❌ $file failed" -ForegroundColor Red
        $failedFiles += $file
    }
    
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($failedFiles.Count -eq 0) {
    Write-Host "✅ All seed files completed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Completed with errors. Failed files:" -ForegroundColor Yellow
    foreach ($file in $failedFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    exit 1
}
