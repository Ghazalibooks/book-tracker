# 🚀 PHASE 28 - APP.JSX UPDATE SCRIPT
# Dieses Script erstellt die komplette neue App.jsx mit allen Phase 28 Features

Write-Host "🚀 Creating PHASE 28 App.jsx..." -ForegroundColor Cyan
Write-Host ""

# Pfad zur aktuellen App.jsx
$currentApp = "src\App.jsx"
$backupApp = "src\App_BACKUP_BEFORE_PHASE28.jsx"

# 1. Backup erstellen
Write-Host "📁 Creating backup..." -ForegroundColor Yellow
Copy-Item $currentApp $backupApp
Write-Host "✅ Backup created: $backupApp" -ForegroundColor Green
Write-Host ""

# 2. Lese die aktuelle App.jsx
Write-Host "📖 Reading current App.jsx..." -ForegroundColor Yellow
$content = Get-Content $currentApp -Raw

# 3. Füge neue Imports hinzu
Write-Host "➕ Adding new imports..." -ForegroundColor Yellow
$newImports = @"
import { AvatarBuilder, SimpleAvatar } from './AvatarBuilder';
import { QuestView, updateQuestProgress } from './QuestSystem';
"@

# Finde die Zeile mit dem letzten Import
$importEndPattern = "} from 'lucide-react';"
$content = $content -replace "($importEndPattern)", "`$1`n$newImports"

# 4. Füge neue State hinzu
Write-Host "➕ Adding new state..." -ForegroundColor Yellow
$newState = @"
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
"@

# Finde die Stelle nach den useState declarations
$statePattern = "const \[showMagicChat, setShowMagicChat\] = useState\(false\);"
$content = $content -replace "($statePattern)", "`$1`n$newState"

# 5. Füge NavBar Link hinzu (vor dem letzten Link)
Write-Host "➕ Adding Quests nav link..." -ForegroundColor Yellow
$questNavLink = @"
        <Link to="/quests" className={`nav-item `${location.pathname === '/quests' ? 'active' : ''}`}>
          <Target size={24} />
          <span>Quests</span>
        </Link>
"@

# Finde Settings Link und füge davor ein
$settingsLinkPattern = '<Link to="/settings"'
$content = $content -replace "(\s+)($settingsLinkPattern)", "`$1$questNavLink`n`$1`$2"

# 6. Füge Quest Route hinzu
Write-Host "➕ Adding Quests route..." -ForegroundColor Yellow
$questRoute = @"
        <Route path="/quests" element={<QuestView user={user} userData={userData} showToast={showToast} />} />
"@

# Finde die letzte Route und füge davor ein
$lastRoutePattern = '<Route path="/challenges"'
$content = $content -replace "(\s+)($lastRoutePattern)", "`$1$questRoute`n`$1`$2"

# 7. Füge Avatar Builder Button in Settings hinzu
Write-Host "➕ Adding Avatar Builder button..." -ForegroundColor Yellow
$avatarButton = @"
      <button onClick={() => setShowAvatarBuilder(true)} className="btn-main" style={{ marginBottom: 15 }}>
        <User size={18} /> Customize Avatar
      </button>
"@

# Finde Account Section in Settings und füge Button hinzu
$accountSectionPattern = '<div style=\{\{ marginBottom: 30 \}\}>'
$content = $content -replace "($accountSectionPattern)", "`$1`n$avatarButton"

# 8. Füge Avatar Builder Modal hinzu (vor dem letzten </BrowserRouter>)
Write-Host "➕ Adding Avatar Builder modal..." -ForegroundColor Yellow
$avatarModal = @"
      {showAvatarBuilder && (
        <AvatarBuilder 
          user={user} 
          userData={userData} 
          onClose={() => setShowAvatarBuilder(false)}
          showToast={showToast}
        />
      )}
"@

# Finde das Ende vor </BrowserRouter>
$browserRouterEndPattern = "</BrowserRouter>"
$content = $content -replace "(\s+)($browserRouterEndPattern)", "`$1$avatarModal`n`$1`$2"

# 9. Speichere die neue App.jsx
Write-Host "💾 Saving new App.jsx..." -ForegroundColor Yellow
$content | Out-File -FilePath $currentApp -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✅ PHASE 28 App.jsx created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Changes made:" -ForegroundColor Cyan
Write-Host "  ✅ Added AvatarBuilder & QuestSystem imports" -ForegroundColor White
Write-Host "  ✅ Added showAvatarBuilder state" -ForegroundColor White
Write-Host "  ✅ Added Quests nav link" -ForegroundColor White
Write-Host "  ✅ Added /quests route" -ForegroundColor White
Write-Host "  ✅ Added Avatar Builder button in Settings" -ForegroundColor White
Write-Host "  ✅ Added Avatar Builder modal" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Backup saved to: $backupApp" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Next: Copy AvatarBuilder.jsx and QuestSystem.jsx to src/" -ForegroundColor Cyan
