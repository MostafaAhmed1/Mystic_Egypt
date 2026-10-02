# scripts/package-release.ps1 — LOCAL build + packaging (artifact-based deploy, Sept 2026).
#
# Builds the Next.js app locally, then packages ONLY the compiled standalone bundle
# (server.js + .next/server + .next/static + public/ + traced node_modules) into a
# tarball for upload to the VPS. NO source, NO dev node_modules, NO .env files.
#
# The NEXT_PUBLIC_* parity problem is handled here:
#   `next build` bakes .env.production's NEXT_PUBLIC_* into client JS. The server's
#   .env.production holds the LIVE values, so this script pulls them from the VPS and
#   injects them as build-time env vars BEFORE running next build. A local .env
#   mismatch would otherwise ship a different GA ID to production.
#
# Usage:
#   powershell -File scripts/package-release.ps1 [-Server root@72.61.209.105] [-Tag <optional>]
#
# Output:  releases/mystic-egypt-<tag>.tar.gz   (typically ~40-45 MB)

param(
    [string]$Server = "root@72.61.209.105",
    [string]$Tag = ""
)

$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path "$PSScriptRoot\..")

# --- resolve a stable tag ---
if (-not $Tag) {
    $sha = (git rev-parse --short HEAD 2>$null)
    $Tag = if ($sha) { "$(Get-Date -Format yyyy-MM-dd)-$sha" } else { (Get-Date -Format "yyyy-MM-dd-HHmmss") }
}
Write-Host "[1/5] tag = $Tag" -ForegroundColor Cyan

# --- 1. Pull LIVE NEXT_PUBLIC_* values from the VPS (never printed) ---
Write-Host "[2/5] fetching NEXT_PUBLIC build values from $Server ..." -ForegroundColor Cyan
$nextPublicKeys = @("NEXT_PUBLIC_GA_ID", "NEXT_PUBLIC_WHATSAPP_NUMBER",
                    "NEXT_PUBLIC_PHONE_UK", "NEXT_PUBLIC_PHONE_EG",
                    "NEXT_PUBLIC_META_PIXEL_ID")
# Parse BOTH .env.production (higher priority in Next) and .env; let .env.production win.
$lines = ssh $Server 'grep -hE "^NEXT_PUBLIC" /var/www/mysticegypt/.env.production /var/www/mysticegypt/.env 2>/dev/null' 2>$null
$parsed = @{}
foreach ($line in $lines) {
    $m = [regex]::Match($line, '^(NEXT_PUBLIC_[A-Z_]+)="?([^"]*)"?\s*$')
    if ($m.Success) { $parsed[$m.Groups[1].Value] = $m.Groups[2].Value }
}
$prodLines = ssh $Server 'grep -hE "^NEXT_PUBLIC" /var/www/mysticegypt/.env.production 2>/dev/null' 2>$null
$prodKeys = @()
foreach ($line in $prodLines) {
    $m = [regex]::Match($line, '^(NEXT_PUBLIC_[A-Z_]+)=')
    if ($m.Success) { $prodKeys += $m.Groups[1].Value }
}
foreach ($k in $nextPublicKeys) {
    if ($parsed.ContainsKey($k)) {
        [System.Environment]::SetEnvironmentVariable($k, $parsed[$k], "Process")
        $src = if ($prodKeys -contains $k) { ".env.production" } else { ".env" }
        Write-Host "  $k = [injected from $src, $(($parsed[$k]).Length) chars]" -ForegroundColor Green
    }
}
if (-not $parsed.ContainsKey("NEXT_PUBLIC_GA_ID")) {
    throw "Could not fetch NEXT_PUBLIC_* from $Server — refusing to build with local (possibly wrong) values."
}

# --- 2. Build locally ---
Write-Host "[3/5] npm run build ..." -ForegroundColor Cyan
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
npm run build
if ($LASTEXITCODE -ne 0) { throw "build failed" }

# --- 3. Assemble the release bundle (exports only what the runtime needs) ---
$rel = Join-Path $PWD "releases"
$work = Join-Path $rel "app-$Tag"
Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $work -Force | Out-Null
Write-Host "[4/5] assembling bundle ..." -ForegroundColor Cyan

# standalone = server.js + .next/server + traced node_modules + package.json
Copy-Item ".next\standalone\*" $work -Recurse -Force
# static assets (NOT included in standalone output)
New-Item -ItemType Directory -Path "$work\.next" -Force | Out-Null
Copy-Item ".next\static" "$work\.next\static" -Recurse -Force
# public assets (llms.txt, .well-known, locales, favicons) — EXCEPT uploads,
# which are bind-mounted from the host at runtime and must stay local-only.
if (Test-Path "$work\public") { Remove-Item "$work\public" -Recurse -Force }
Copy-Item "public" "$work\public" -Recurse -Force
if (Test-Path "$work\public\uploads") { Remove-Item "$work\public\uploads" -Recurse -Force }

# NEVER ship .env files (they were copied by next build into standalone) — the
# container receives env at runtime via --env-file .env.container.
Get-ChildItem $work -Force -File -Filter ".env*" | Remove-Item -Force
Remove-Item "$work\.git" -Recurse -Force -ErrorAction SilentlyContinue

# sanity: the two required runtime pieces exist
if (-not (Test-Path "$work\server.js")) { throw "server.js missing" }
if (-not (Test-Path "$work\.next\server")) { throw ".next/server missing" }
if (-not (Test-Path "$work\.next\static")) { throw ".next/static missing" }

# --- 4. Create tarball (tar on Win10+ = libarchive) ---
Write-Host "[5/5] creating tarball ..." -ForegroundColor Cyan
$tar = Join-Path $rel "mystic-egypt-$Tag.tar.gz"
Push-Location $work
try { & tar.exe -czf $tar "." | Out-Host }
finally { Pop-Location }
if (-not (Test-Path $tar)) { throw "tarball not created" }
$size = [math]::Round((Get-Item $tar).Length / 1MB, 1)
Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "bundle => $tar ($size MB)" -ForegroundColor Green
Write-Host "EXPORT: releases\mystic-egypt-$Tag.tar.gz" -ForegroundColor Green