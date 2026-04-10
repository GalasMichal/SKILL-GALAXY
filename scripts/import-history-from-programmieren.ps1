#Requires -Version 5.1
<#
  Imports full Git history for Skill Galaxy from the monorepo (programmieren)
  by replaying each commit's skill-galaxy/ tree with git archive (no git subtree).

  Use this on Windows when `git subtree split` fails with fork /0xC0000142 / errno 11.

  Usage:
    cd <skill-galaxy-root>
    .\scripts\import-history-from-programmieren.ps1

  Optional:
    -ProgrammierenRoot "C:\Users\Mike\Desktop\programmieren"
    -TipCommit "538d1a2"   # last monorepo commit that still had skill-galaxy/ tracked
    -Prefix "skill-galaxy"

  After: main = replayed history; previous .git renamed to .git-backup-before-archive-import-<timestamp>
#>
param(
  [string] $ProgrammierenRoot = "",
  [string] $TipCommit = "538d1a2",
  [string] $Prefix = "skill-galaxy"
)

$ErrorActionPreference = "Stop"

$skillRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not $ProgrammierenRoot) {
  $ProgrammierenRoot = (Resolve-Path (Join-Path $skillRoot "..")).Path
}

$monorepoGit = Join-Path $ProgrammierenRoot ".git"
if (-not (Test-Path $monorepoGit)) {
  throw "No .git at ProgrammierenRoot: $ProgrammierenRoot"
}

$skillGit = Join-Path $skillRoot ".git"
if (-not (Test-Path $skillGit)) {
  throw "No .git at SkillGalaxy root: $skillRoot"
}

$extras = @(
  "GIT-STANDALONE.md",
  (Join-Path "scripts" "import-history-from-programmieren.ps1")
)

Write-Host "Monorepo:    $ProgrammierenRoot"
Write-Host "SkillGalaxy: $skillRoot"
Write-Host "Tip commit:  $TipCommit (prefix: $Prefix/)"
Write-Host ""

$tarPath = Join-Path ([System.IO.Path]::GetTempPath()) "sg-archive-import.tar"
$backupGitPath = $null

$stashDir = Join-Path ([System.IO.Path]::GetTempPath()) ("sg-import-stash-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $stashDir -Force | Out-Null
try {
  foreach ($rel in $extras) {
    $src = Join-Path $skillRoot $rel
    if (Test-Path -LiteralPath $src) {
      $dest = Join-Path $stashDir $rel
      $destParent = Split-Path -Parent $dest
      if (-not (Test-Path -LiteralPath $destParent)) {
        New-Item -ItemType Directory -Path $destParent -Force | Out-Null
      }
      Copy-Item -LiteralPath $src -Destination $dest -Force
    }
  }

  $backupGitName = ".git-backup-before-archive-import-" + (Get-Date -Format "yyyyMMdd-HHmmss")
  $backupGitPath = Join-Path $skillRoot $backupGitName
  Rename-Item -LiteralPath $skillGit -NewName $backupGitName
  Write-Host "Backed up nested repo to: $backupGitPath"

  if (Test-Path -LiteralPath $tarPath) {
    Remove-Item -LiteralPath $tarPath -Force
  }

  Push-Location $skillRoot
  try {
    git init -b main
    if ($LASTEXITCODE -ne 0) {
      throw "git init failed (exit $LASTEXITCODE)"
    }

    git config user.name "history-import"
    git config user.email "history-import@local.invalid"

    $pathSpec = $Prefix.TrimEnd("/\") + "/"
    $shas = @(& git -C $ProgrammierenRoot rev-list --reverse "$TipCommit" -- $pathSpec)
    if ($shas.Count -eq 0) {
      throw "No commits from: git rev-list --reverse $TipCommit -- $pathSpec"
    }

    $n = 0
    foreach ($sha in $shas) {
      $n++
      $short = $sha.Substring(0, [Math]::Min(7, $sha.Length))
      Write-Host "[$n/$($shas.Count)] $short"

      Get-ChildItem -LiteralPath $skillRoot -Force |
        Where-Object { $_.Name -ne ".git" } |
        ForEach-Object { Remove-Item -LiteralPath $_.FullName -Recurse -Force }

      $treeRef = "${sha}:${Prefix}"
      & git -C $ProgrammierenRoot archive --format=tar $treeRef -o $tarPath
      if ($LASTEXITCODE -ne 0) {
        throw "git archive failed for $treeRef (exit $LASTEXITCODE)"
      }

      & tar -xf $tarPath -C $skillRoot
      if ($LASTEXITCODE -ne 0) {
        throw "tar extract failed (exit $LASTEXITCODE)"
      }
      Remove-Item -LiteralPath $tarPath -Force -ErrorAction SilentlyContinue

      git add -A
      if ($LASTEXITCODE -ne 0) {
        throw "git add failed (exit $LASTEXITCODE)"
      }

      $ad = (& git -C $ProgrammierenRoot log -1 --format=%ai $sha).Trim()
      $an = (& git -C $ProgrammierenRoot log -1 --format=%an $sha).Trim()
      $ae = (& git -C $ProgrammierenRoot log -1 --format=%ae $sha).Trim()
      $subj = (& git -C $ProgrammierenRoot log -1 --format=%s $sha).Trim()
      $body = git -C $ProgrammierenRoot log -1 --format=%b $sha

      $env:GIT_AUTHOR_DATE = $ad
      $env:GIT_COMMITTER_DATE = $ad
      $env:GIT_AUTHOR_NAME = $an
      $env:GIT_AUTHOR_EMAIL = $ae
      $env:GIT_COMMITTER_NAME = $an
      $env:GIT_COMMITTER_EMAIL = $ae

      $msgPath = [System.IO.Path]::GetTempFileName()
      try {
        $fullMsg = $subj
        if ($body -and $body.Trim().Length -gt 0) {
          $fullMsg += "`r`n`r`n" + $body.TrimEnd()
        }
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($msgPath, $fullMsg, $utf8NoBom)

        $staged = (& git diff --cached --name-only)
        if (-not $staged) {
          git commit --allow-empty -F $msgPath
        }
        else {
          git commit -F $msgPath
        }
        if ($LASTEXITCODE -ne 0) {
          throw "git commit failed at $sha (exit $LASTEXITCODE)"
        }
      }
      finally {
        Remove-Item -LiteralPath $msgPath -Force -ErrorAction SilentlyContinue
      }
    }
  }
  finally {
    Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_AUTHOR_NAME -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_AUTHOR_EMAIL -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_COMMITTER_NAME -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_COMMITTER_EMAIL -ErrorAction SilentlyContinue
    Pop-Location
  }

  foreach ($rel in $extras) {
    $src = Join-Path $stashDir $rel
    if (Test-Path -LiteralPath $src) {
      $dest = Join-Path $skillRoot $rel
      $destParent = Split-Path -Parent $dest
      if (-not (Test-Path -LiteralPath $destParent)) {
        New-Item -ItemType Directory -Path $destParent -Force | Out-Null
      }
      Copy-Item -LiteralPath $src -Destination $dest -Force
    }
  }

  Push-Location $skillRoot
  try {
    git add -A
    $pending = git status --porcelain
    if ($pending) {
      git commit -m "chore: restore standalone repo docs and import script after history replay"
      if ($LASTEXITCODE -ne 0) {
        throw "final git commit failed (exit $LASTEXITCODE)"
      }
    }
  }
  finally {
    Pop-Location
  }
}
finally {
  Remove-Item -LiteralPath $stashDir -Recurse -Force -ErrorAction SilentlyContinue
  if (Test-Path -LiteralPath $tarPath) {
    Remove-Item -LiteralPath $tarPath -Force -ErrorAction SilentlyContinue
  }
}

Write-Host ""
Write-Host "OK. cd `"$skillRoot`"; git log --oneline -25"
if ($backupGitPath) {
  Write-Host "Old repo backup folder: $backupGitPath"
}
