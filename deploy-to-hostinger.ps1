# ============================================
# IJ Estates - Automated Hostinger Deployment
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  IJ Estates - Hostinger Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the ijestate directory" -ForegroundColor Red
    exit 1
}

# Step 1: Clean old build
Write-Host "[1/5] Cleaning old build..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Path "build" -Recurse -Force
    Write-Host "✓ Old build folder deleted" -ForegroundColor Green
}
if (Test-Path "hostinger-deploy.zip") {
    Remove-Item -Path "hostinger-deploy.zip" -Force
    Write-Host "✓ Old zip file deleted" -ForegroundColor Green
}

# Step 2: Replace favicon files with logo.jpg
Write-Host ""
Write-Host "[2/5] Setting up favicon files with your logo..." -ForegroundColor Yellow
Copy-Item "public\logo.jpg" -Destination "public\favicon.ico" -Force
Write-Host "✓ favicon.ico updated with logo" -ForegroundColor Green

# Step 3: Build React app
Write-Host ""
Write-Host "[3/5] Building React app for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green

# Step 4: Verify critical files
Write-Host ""
Write-Host "[4/5] Verifying build files..." -ForegroundColor Yellow
$criticalFiles = @(
    "build\index.html",
    "build\favicon.ico",
    "build\.htaccess",
    "build\site.webmanifest"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Some critical files are missing!" -ForegroundColor Yellow
    Write-Host "   Build may be incomplete." -ForegroundColor Yellow
}

# Step 5: Create zip file for easy upload
Write-Host ""
Write-Host "[5/5] Creating zip file for upload..." -ForegroundColor Yellow
Compress-Archive -Path "build\*" -DestinationPath "hostinger-deploy.zip" -Force
Write-Host "✓ Zip file created: hostinger-deploy.zip" -ForegroundColor Green

# Build summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Deployment Package Ready!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$buildPath = Resolve-Path "build"
$zipPath = Resolve-Path "hostinger-deploy.zip"
$buildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum
$buildSizeMB = [math]::Round($buildSize / 1MB, 2)
$zipSize = (Get-Item "hostinger-deploy.zip").Length
$zipSizeMB = [math]::Round($zipSize / 1MB, 2)

Write-Host "Build Information:" -ForegroundColor Yellow
Write-Host "  Build folder: $buildPath" -ForegroundColor White
Write-Host "  Build size: $buildSizeMB MB" -ForegroundColor Cyan
Write-Host "  Zip file: $zipPath" -ForegroundColor White
Write-Host "  Zip size: $zipSizeMB MB" -ForegroundColor Cyan
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Upload Instructions" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Upload Zip File (Easiest)" -ForegroundColor Yellow
Write-Host "  1. Log into Hostinger File Manager" -ForegroundColor White
Write-Host "  2. Navigate to public_html directory" -ForegroundColor White
Write-Host "  3. Delete all old files in public_html" -ForegroundColor White
Write-Host "  4. Upload: hostinger-deploy.zip" -ForegroundColor Cyan
Write-Host "  5. Right-click → Extract" -ForegroundColor White
Write-Host "  6. Delete the zip file after extraction" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Upload Build Folder (Manual)" -ForegroundColor Yellow
Write-Host "  1. Log into Hostinger File Manager" -ForegroundColor White
Write-Host "  2. Navigate to public_html directory" -ForegroundColor White
Write-Host "  3. Delete all old files" -ForegroundColor White
Write-Host "  4. Upload ALL contents from 'build' folder" -ForegroundColor Cyan
Write-Host "  5. Make sure favicon.ico is in root!" -ForegroundColor White
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Verification Steps" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After upload, check:" -ForegroundColor Yellow
Write-Host "  ✓ Website loads: https://ijestateandbuilders.tech" -ForegroundColor White
Write-Host "  ✓ Favicon shows your logo (not React icon)" -ForegroundColor White
Write-Host "  ✓ Clear cache: Ctrl+Shift+R" -ForegroundColor White
Write-Host "  ✓ Test in incognito mode" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to open build folder..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
explorer.exe "build"
