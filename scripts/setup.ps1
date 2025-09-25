
Param(
  [string]$RepoPath = "$HOME\Desktop\vrabo",     # local clone path of kaglioster-hub/vrabo
  [string]$Branch = "main"
)

Write-Host "== VRABO Supreme • Setup/Sync ==" -ForegroundColor Yellow

# 1) Ensure repo exists
if(-not (Test-Path $RepoPath)) {
  throw "RepoPath not found: $RepoPath. Clone https://github.com/Kaglioster-hub/vrabo first."
}

# 2) Copy files into repo
$src = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = (Resolve-Path (Join-Path $src "..")).Path
Write-Host "Copying files from $root to $RepoPath ..."
robocopy $root $RepoPath /E /NJH /NJS /NFL /NDL /XO | Out-Null

# 3) Install deps
Push-Location $RepoPath
if(Test-Path .\pnpm-lock.yaml){
  Write-Host "Installing dependencies (pnpm i)..."
  pnpm i --no-optional | Out-Host
}else{
  Write-Host "No lockfile found, generating with pnpm i..."
  pnpm i --no-optional | Out-Host
}

# 4) Git commit/push
git add -A
git commit -m "Upgrade: VRABO Supreme Edition — airports API + affiliate links + polished UI" --allow-empty
git push origin $Branch

# 5) Vercel deploy
Write-Host "Deploying on Vercel (--prod) ..." -ForegroundColor Yellow
vercel --prod --confirm

Write-Host "Done. Ensure domain vrabo.it is set as primary in Vercel project settings." -ForegroundColor Green
Pop-Location
