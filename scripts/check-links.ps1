#!/usr/bin/env pwsh
# Quick Link Checker for Ratlist.gg
# Checks that key pages load without errors

$baseUrl = "http://localhost:3000"
$routes = @(
    "/",
    "/browse",
    "/games",
    "/faq",
    "/auth/sign-in",
    "/report",
    "/terms",
    "/privacy",
    "/guidelines",
    "/contact"
)

# Note: Dynamic routes need actual data to test
# These would need to be tested manually or with E2E tests:
# - /user/{username} (e.g., /user/testuser)
# - /player/{game}/{playerId} (e.g., /player/the-finals/Player#1234)
# - /dashboard (requires authentication)
# - /moderator/flags (requires moderator role)
# - /admin/dashboard, /admin/users, /admin/audit (requires admin role)

Write-Host ""
Write-Host "Checking Ratlist.gg Routes..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

$passed = 0
$failed = 0
$errors = @()

foreach ($route in $routes) {
    $url = "$baseUrl$route"
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "PASS $route" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "WARN $route (Status: $($response.StatusCode))" -ForegroundColor Yellow
            $failed++
            $errors += "$route - Status $($response.StatusCode)"
        }
    } catch {
        Write-Host "FAIL $route (Error: $($_.Exception.Message))" -ForegroundColor Red
        $failed++
        $errors += "$route - $($_.Exception.Message)"
    }
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host ("=" * 50) -ForegroundColor Gray
Write-Host ""
Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "  Total:  $($passed + $failed)" -ForegroundColor Gray

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Yellow
    foreach ($err in $errors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
}

Write-Host ""

# Exit with error code if any tests failed
exit $failed
