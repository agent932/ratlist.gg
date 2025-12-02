# Check Menu Rendering Diagnostic Script
# This script helps debug why the desktop menu isn't showing

Write-Host "`n=== Menu Rendering Diagnostic ===" -ForegroundColor Cyan
Write-Host "Checking Header component configuration...`n" -ForegroundColor Yellow

# Check if the component file exists
$headerPath = "components\layout\Header.tsx"
if (Test-Path $headerPath) {
    Write-Host "✓ Header component exists at: $headerPath" -ForegroundColor Green
    
    # Check for the desktop nav classes
    $content = Get-Content $headerPath -Raw
    
    if ($content -match 'hidden md:flex') {
        Write-Host "✓ Desktop navigation uses 'hidden md:flex' classes" -ForegroundColor Green
        Write-Host "  This means: Hidden on mobile, visible as flexbox on medium+ screens (≥768px)`n" -ForegroundColor Gray
    } else {
        Write-Host "✗ Could not find 'hidden md:flex' classes" -ForegroundColor Red
    }
    
    # Check if nav element exists
    if ($content -match '<nav className="hidden md:flex') {
        Write-Host "✓ Desktop <nav> element found with correct classes`n" -ForegroundColor Green
    } else {
        Write-Host "✗ Desktop <nav> element not found or missing classes`n" -ForegroundColor Red
    }
    
} else {
    Write-Host "✗ Header component not found!" -ForegroundColor Red
    exit 1
}

# Check Tailwind config
$tailwindPath = "tailwind.config.ts"
if (Test-Path $tailwindPath) {
    Write-Host "✓ Tailwind config exists" -ForegroundColor Green
    
    $tailwindContent = Get-Content $tailwindPath -Raw
    if ($tailwindContent -match "components/\*\*/\*\.{ts,tsx}") {
        Write-Host "✓ Tailwind is scanning components directory`n" -ForegroundColor Green
    } else {
        Write-Host "⚠ Tailwind config may not be scanning components directory`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Tailwind config not found!`n" -ForegroundColor Red
}

# Check if dev server is running
Write-Host "Checking dev server status..." -ForegroundColor Yellow
$ports = @(3000, 3001, 3002)
$serverRunning = $false

foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 304) {
            Write-Host "✓ Dev server is running on port $port" -ForegroundColor Green
            $serverRunning = $true
            $serverPort = $port
            break
        }
    } catch {
        # Port not responding, try next
    }
}

if (-not $serverRunning) {
    Write-Host "✗ Dev server is not running. Run 'npm run dev' first.`n" -ForegroundColor Red
    Write-Host "Run this command to start the server:" -ForegroundColor Yellow
    Write-Host "  npm run dev`n" -ForegroundColor Cyan
} else {
    Write-Host "`n=== Manual Testing Instructions ===" -ForegroundColor Cyan
    Write-Host "1. Open browser to: http://localhost:$serverPort" -ForegroundColor White
    Write-Host "2. Open DevTools (F12)" -ForegroundColor White
    Write-Host "3. Check the Elements tab for the <nav> element" -ForegroundColor White
    Write-Host "4. Look for: <nav class='hidden md:flex items-center gap-1'>" -ForegroundColor White
    Write-Host "`n5. In the Console tab, run this command:" -ForegroundColor Yellow
    Write-Host @"
   document.querySelector("nav.hidden.md\\:flex")
"@ -ForegroundColor Cyan
    Write-Host "`n6. It should return the nav element, not null" -ForegroundColor White
    Write-Host "`n7. Check computed styles:" -ForegroundColor Yellow
    Write-Host @"
   const nav = document.querySelector("nav.hidden.md\\:flex");
   if (nav) {
     const styles = window.getComputedStyle(nav);
     console.log("Display:", styles.display);
     console.log("Visibility:", styles.visibility);
     console.log("Width:", styles.width);
   }
"@ -ForegroundColor Cyan
    Write-Host "`n8. Expected values for desktop (width ≥ 768px):" -ForegroundColor White
    Write-Host "   - Display: flex" -ForegroundColor Green
    Write-Host "   - Visibility: visible" -ForegroundColor Green
    Write-Host "   - Width: auto or specific pixel value" -ForegroundColor Green
    
    Write-Host "`n=== Potential Issues to Check ===" -ForegroundColor Cyan
    Write-Host "1. Browser window is too narrow (< 768px wide)" -ForegroundColor White
    Write-Host "   → Resize browser to at least 768px wide" -ForegroundColor Gray
    Write-Host "`n2. CSS not loading properly" -ForegroundColor White
    Write-Host "   → Check Network tab for failed CSS requests" -ForegroundColor Gray
    Write-Host "`n3. Tailwind classes not compiling" -ForegroundColor White
    Write-Host "   → Check terminal for build errors" -ForegroundColor Gray
    Write-Host "`n4. Custom CSS overriding Tailwind" -ForegroundColor White
    Write-Host "   → Search globals.css for nav or header rules" -ForegroundColor Gray
    Write-Host "`n5. React hydration issues" -ForegroundColor White
    Write-Host "   → Check Console for hydration errors" -ForegroundColor Gray
}

Write-Host "`n=== Quick Fix Checklist ===" -ForegroundColor Cyan
Write-Host "[ ] Browser window is wider than 768px" -ForegroundColor White
Write-Host "[ ] Dev server is running without errors" -ForegroundColor White
Write-Host "[ ] No console errors in browser DevTools" -ForegroundColor White
Write-Host "[ ] Tailwind CSS is loading (check Network tab)" -ForegroundColor White
Write-Host "[ ] Hard refresh the page (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "[ ] Clear browser cache and reload" -ForegroundColor White

Write-Host "`n"
