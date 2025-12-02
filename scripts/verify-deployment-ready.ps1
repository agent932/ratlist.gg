# Project Cleanup and Verification Script
# Verifies the project is ready for GitHub and Vercel deployment

param(
    [switch]$Fix,
    [switch]$Verbose
)

Write-Host "`n=== Ratlist.gg - Project Cleanup & Verification ===" -ForegroundColor Cyan
Write-Host "Checking project structure and configuration...`n" -ForegroundColor Yellow

$errors = @()
$warnings = @()
$passed = @()

# Function to check file exists
function Test-FileExists {
    param($path, $description)
    if (Test-Path $path) {
        $script:passed += "[PASS] $description"
        return $true
    } else {
        $script:errors += "[FAIL] Missing: $description ($path)"
        return $false
    }
}

# Function to check file does not exist
function Test-FileNotExists {
    param($path, $description)
    if (-not (Test-Path $path)) {
        $script:passed += "[PASS] $description"
        return $true
    } else {
        $script:warnings += "[WARN] Found: $description ($path)"
        return $false
    }
}

Write-Host "1. Checking Essential Files..." -ForegroundColor Cyan

# Essential project files
Test-FileExists "package.json" "package.json" | Out-Null
Test-FileExists "package-lock.json" "package-lock.json" | Out-Null
Test-FileExists "tsconfig.json" "TypeScript configuration" | Out-Null
Test-FileExists "next.config.mjs" "Next.js configuration" | Out-Null
Test-FileExists "tailwind.config.ts" "Tailwind configuration" | Out-Null
Test-FileExists ".gitignore" ".gitignore" | Out-Null
Test-FileExists ".env.example" ".env.example template" | Out-Null
Test-FileExists "README.md" "README documentation" | Out-Null
Test-FileExists "LICENSE" "LICENSE file" | Out-Null
Test-FileExists "CONTRIBUTING.md" "Contributing guidelines" | Out-Null

Write-Host "`n2. Checking GitHub Files..." -ForegroundColor Cyan

Test-FileExists ".github/workflows/ci.yml" "GitHub Actions CI workflow" | Out-Null
Test-FileExists ".github/PULL_REQUEST_TEMPLATE.md" "PR template" | Out-Null
Test-FileExists ".github/ISSUE_TEMPLATE/bug_report.md" "Bug report template" | Out-Null
Test-FileExists ".github/ISSUE_TEMPLATE/feature_request.md" "Feature request template" | Out-Null

Write-Host "`n3. Checking Documentation..." -ForegroundColor Cyan

Test-FileExists "docs/README.md" "Documentation index" | Out-Null
Test-FileExists "docs/deployment.md" "Deployment guide" | Out-Null
Test-FileExists "docs/testing" "Testing documentation" | Out-Null
Test-FileExists "docs/analysis" "Analysis documentation" | Out-Null

Write-Host "`n4. Checking Security..." -ForegroundColor Cyan

# Check for sensitive files that shouldn't be committed
Test-FileNotExists ".env.local" "No .env.local in repo" | Out-Null
Test-FileNotExists ".env.development.local" "No .env.development.local in repo" | Out-Null
Test-FileNotExists ".env.production.local" "No .env.production.local in repo" | Out-Null

# Check .gitignore contents
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    $requiredPatterns = @(
        "node_modules/",
        ".env*.local",
        ".next/",
        ".vercel",
        ".supabase/"
    )
    
    foreach ($pattern in $requiredPatterns) {
        if ($gitignoreContent -match [regex]::Escape($pattern)) {
            $passed += "[PASS] .gitignore includes '$pattern'"
        } else {
            $warnings += "[WARN] .gitignore missing pattern: $pattern"
        }
    }
}

Write-Host "`n5. Checking Source Code..." -ForegroundColor Cyan

$requiredDirs = @(
    @{Path="app"; Name="App directory (Next.js)"},
    @{Path="components"; Name="Components directory"},
    @{Path="lib"; Name="Lib directory"},
    @{Path="supabase/migrations"; Name="Database migrations"}
)

foreach ($dir in $requiredDirs) {
    Test-FileExists $dir.Path $dir.Name | Out-Null
}

Write-Host "`n6. Checking Build Configuration..." -ForegroundColor Cyan

# Check package.json scripts
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $requiredScripts = @("dev", "build", "start", "lint", "test")
    
    foreach ($script in $requiredScripts) {
        if ($packageJson.scripts.$script) {
            $passed += "[PASS] package.json has '$script' script"
        } else {
            $warnings += "[WARN] package.json missing '$script' script"
        }
    }
}

Write-Host "`n7. Running Build Tests..." -ForegroundColor Cyan

# Test TypeScript compilation
Write-Host "  -> Running TypeScript check..." -ForegroundColor Gray
$tscResult = & npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    $passed += "[PASS] TypeScript compiles without errors"
} else {
    $errors += "[FAIL] TypeScript compilation failed"
    if ($Verbose) {
        Write-Host $tscResult -ForegroundColor Red
    }
}

# Test linting
Write-Host "  -> Running ESLint..." -ForegroundColor Gray
$lintResult = & npm run lint 2>&1
if ($LASTEXITCODE -eq 0) {
    $passed += "[PASS] No linting errors"
} else {
    $warnings += "[WARN] Linting issues found"
    if ($Verbose) {
        Write-Host $lintResult -ForegroundColor Yellow
    }
}

# Test build
Write-Host "  -> Testing production build..." -ForegroundColor Gray
$buildResult = & npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    $passed += "[PASS] Production build succeeds"
} else {
    $errors += "[FAIL] Production build failed"
    if ($Verbose) {
        Write-Host $buildResult -ForegroundColor Red
    }
}

Write-Host "`n8. Checking Git Status..." -ForegroundColor Cyan

if (Test-Path ".git") {
    $gitStatus = & git status --porcelain
    if ($gitStatus) {
        $warnings += "[WARN] Uncommitted changes detected"
        if ($Verbose) {
            Write-Host "  Uncommitted files:" -ForegroundColor Yellow
            $gitStatus | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        }
    } else {
        $passed += "[PASS] No uncommitted changes"
    }
    
    # Check for large files
    $largeFiles = & git ls-files | ForEach-Object {
        $size = (Get-Item $_).Length
        if ($size -gt 1MB) {
            [PSCustomObject]@{
                File = $_
                Size = [math]::Round($size / 1MB, 2)
            }
        }
    }
    
    if ($largeFiles) {
        foreach ($file in $largeFiles) {
            $warnings += "[WARN] Large file in repo: $($file.File) - $($file.Size) MB"
        }
    } else {
        $passed += "[PASS] No large files in repository"
    }
}

# Results Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan

if ($passed.Count -gt 0) {
    Write-Host "`nPASSED ($($passed.Count)):" -ForegroundColor Green
    $passed | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
}

if ($warnings.Count -gt 0) {
    Write-Host "`nWARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}

if ($errors.Count -gt 0) {
    Write-Host "`nERRORS ($($errors.Count)):" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host "`nProject is NOT ready for deployment." -ForegroundColor Red
    exit 1
} else {
    Write-Host "`nProject is ready for GitHub and Vercel!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Commit any remaining changes: git add -A && git commit -m 'your message'" -ForegroundColor White
    Write-Host "  2. Push to GitHub: git push" -ForegroundColor White
    Write-Host "  3. Connect to Vercel: https://vercel.com/new" -ForegroundColor White
    Write-Host "  4. Add environment variables in Vercel dashboard" -ForegroundColor White
    Write-Host "  5. Deploy!`n" -ForegroundColor White
}
