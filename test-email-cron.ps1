# Test script for email notification cron endpoint
# Usage: .\test-email-cron.ps1

$cronSecret = "iOiJzdXBhYmFzZSIsInJlZiI6ImZ3cmVrZXd4"
$url = "http://localhost:3000/api/cron/send-notifications"

Write-Host "Testing email notification cron endpoint..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $cronSecret"
        } `
        -UseBasicParsing

    Write-Host "✓ Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Response: $errorBody" -ForegroundColor Red
    }
}
