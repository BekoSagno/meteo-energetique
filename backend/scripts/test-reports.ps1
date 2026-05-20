# Test consensus — POST /api/reports (anonyme, sans OTP)
# Prerequis : npm run dev (backend) + npm run db:seed

$BaseUrl = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3000" }
$Lat = 9.558
$Lng = -13.647

function Write-Step($msg) {
  Write-Host ""
  Write-Host "=== $msg ===" -ForegroundColor Cyan
}

function Submit-Report($body) {
  $json = $body | ConvertTo-Json
  Write-Host "POST /api/reports $json"
  return Invoke-RestMethod -Uri "$BaseUrl/api/reports" -Method Post -Body $json -ContentType "application/json"
}

function Get-CurrentStatus {
  return Invoke-RestMethod -Uri "$BaseUrl/api/sectors/current?lat=$Lat&lng=$Lng" -Method Get
}

Write-Step "1. Etat initial"
$before = Get-CurrentStatus
Write-Host "Etat actuel : $($before.powerStatus.currentState)" -ForegroundColor Yellow

Write-Step "2. Trois signalements TOTAL_DARKNESS (anonymes)"
for ($i = 1; $i -le 3; $i++) {
  $res = Submit-Report @{
    reportType = "TOTAL_DARKNESS"
    lat        = $Lat
    lng        = $Lng
  }
  Write-Host "Clic $i - reached=$($res.consensus.reached) count=$($res.consensus.reportCount)" -ForegroundColor Green
  if ($i -lt 3) { Start-Sleep -Milliseconds 300 }
}

Write-Step "3. Etat apres consensus (attendu OFFLINE)"
$after = Get-CurrentStatus
$state = $after.powerStatus.currentState
if ($state -eq "OFFLINE") {
  Write-Host "SUCCES : secteur OFFLINE." -ForegroundColor Green
} else {
  Write-Host "ECHEC : etat=$state (attendu OFFLINE)." -ForegroundColor Red
  exit 1
}

Write-Step "4. Reset ONLINE (3x STABLE_RETURN)"
for ($i = 1; $i -le 3; $i++) {
  Submit-Report @{
    reportType = "STABLE_RETURN"
    lat        = $Lat
    lng        = $Lng
  } | Out-Null
}
$reset = Get-CurrentStatus
Write-Host "Etat apres reset : $($reset.powerStatus.currentState)" -ForegroundColor Yellow

Write-Host ""
Write-Host "Tests termines." -ForegroundColor Cyan
