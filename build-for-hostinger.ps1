# Build Script for Hostinger Deployment
# Run this script to build your React app for Hostinger

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  IJ Estates - Hostinger Build Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the ijestate directory" -ForegroundColor Red
    exit 1
}

Write-Host "[1/4] Cleaning old build..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Path "build" -Recurse -Force
    Write-Host "✓ Old build folder deleted" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/4] Building React app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completed successfully" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Verifying .htaccess file..." -ForegroundColor Yellow
if (Test-Path "build\.htaccess") {
    Write-Host "✓ .htaccess found in build folder" -ForegroundColor Green
} else {
    Write-Host "✗ Warning: .htaccess not found in build folder!" -ForegroundColor Red
    Write-Host "  The file should be in public/.htaccess and copied automatically" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/4] Build summary:" -ForegroundColor Yellow
$buildPath = Resolve-Path "build"
Write-Host "  Build location: $buildPath" -ForegroundColor White
Write-Host "  Build size: " -NoNewline -ForegroundColor White

$buildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum
$buildSizeMB = [math]::Round($buildSize / 1MB, 2)
Write-Host "$buildSizeMB MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Build Complete! Ready for Upload" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open Hostinger File Manager" -ForegroundColor White
Write-Host "2. Navigate to public_html directory" -ForegroundColor White
Write-Host "3. Delete all old files from public_html" -ForegroundColor White
Write-Host "4. Upload ALL files from the 'build' folder" -ForegroundColor White
Write-Host "5. Verify .htaccess is uploaded (enable 'Show Hidden Files')" -ForegroundColor White
Write-Host "6. Test your website routes by refreshing pages" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open build folder..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
explorer.exe "build"
