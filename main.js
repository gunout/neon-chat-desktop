const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

// Fonction améliorée pour trouver le index.html
function getIndexPath() {
  const possiblePaths = [
    // Développement local
    path.join(__dirname, 'public/index.html'),
    // Build Linux/Windows
    path.join(__dirname, '../public/index.html'),
    // Build ASAR (Linux/Windows)
    path.join(__dirname, 'resources/app/public/index.html'),
    // Build macOS
    path.join(__dirname, '../Resources/public/index.html')
  ]

  // Vérification des chemins avec message de debug
  for (const tryPath of possiblePaths) {
    console.log(`Testing path: ${tryPath}`)
    if (fs.existsSync(tryPath)) {
      console.log(`Found index.html at: ${tryPath}`)
      return tryPath
    }
  }

  // Message d'erreur détaillé si non trouvé
  const errorPaths = possiblePaths.map(p => `- ${p}`).join('\n')
  throw new Error(`Could not find index.html. Searched in:\n${errorPaths}`)
}

function createWindow() {
  // Configuration de la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    },
    title: 'NEON-CHAT // CYBERPUNK 2077',
    backgroundColor: '#0a0a12',
    show: false // Cache la fenêtre jusqu'au chargement complet
  })

  // Gestion des erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDesc) => {
    console.error(`Failed to load: ${errorCode} - ${errorDesc}`)
  })

  // Charge le fichier HTML
  try {
    mainWindow.loadFile(getIndexPath())
  } catch (error) {
    console.error('Failed to load index.html:', error.message)
    app.quit()
    return
  }

  // Affiche la fenêtre une fois prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // Développement seulement
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Gestion de la fermeture
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Gestion du lifecycle de l'app
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})