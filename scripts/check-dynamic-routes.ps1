# Test dynamic routes for Ratlist.gg
# Tests user profiles and player profiles with various scenarios

$baseUrl = "http://localhost:3000"
$passed = 0
$failed = 0

Write-Host "Testing Dynamic Routes..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

function Test-Route {
    param(
        [string]$route,
        [string]$description
    )
    
    try {
        $url = "$baseUrl$route"
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "PASS $route" -ForegroundColor Green
            Write-Host "  -> $description" -ForegroundColor Gray
            return $true
        } else {
            Write-Host "FAIL $route (Status: $($response.StatusCode))" -ForegroundColor Red
            Write-Host "  -> $description" -ForegroundColor Gray
            return $false
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "FAIL $route (404 Not Found)" -ForegroundColor Yellow
            Write-Host "  -> $description" -ForegroundColor Gray
            Write-Host "  -> This is expected if no data exists" -ForegroundColor DarkGray
        } else {
            Write-Host "FAIL $route" -ForegroundColor Red
            Write-Host "  -> $description" -ForegroundColor Gray
            Write-Host "  -> Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        }
        return $false
    }
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "PLAYER PROFILE ROUTES" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Test player routes with different games and player IDs
$playerTests = @(
    @{route="/player/the-finals/TestUser#9999"; desc="The Finals player with valid Embark ID format"},
    @{route="/player/arc-raiders/Player#1234"; desc="Arc Raiders player with valid Embark ID format"},
    @{route="/player/tarkov/test-player-123"; desc="Tarkov player profile"},
    @{route="/player/tarkov/invalid-chars-!!!"; desc="Player ID with special characters"},
    @{route="/player/invalid-game/TestUser#9999"; desc="Invalid game slug"}
)

foreach ($test in $playerTests) {
    if (Test-Route -route $test.route -description $test.desc) {
        $script:passed++
    } else {
        $script:failed++
    }
    Write-Host ""
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "USER PROFILE ROUTES" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Test user routes with different usernames
$userTests = @(
    @{route="/user/testuser"; desc="Simple username"},
    @{route="/user/test-user-123"; desc="Username with hyphens and numbers"},
    @{route="/user/nonexistent-user-xyz"; desc="Nonexistent user (should show 404 or empty state)"}
)

foreach ($test in $userTests) {
    if (Test-Route -route $test.route -description $test.desc) {
        $script:passed++
    } else {
        $script:failed++
    }
    Write-Host ""
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Results:" -ForegroundColor White
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host "  Total:  $($passed + $failed)" -ForegroundColor Gray
Write-Host ""

if ($failed -gt 0) {
    Write-Host "NOTE: Some failures are expected if:" -ForegroundColor Yellow
    Write-Host "  - No test data exists in the database" -ForegroundColor DarkGray
    Write-Host "  - Pages correctly return 404 for nonexistent data" -ForegroundColor DarkGray
    Write-Host "  - Database/auth is not configured" -ForegroundColor DarkGray
    Write-Host ""
}

exit $failed
