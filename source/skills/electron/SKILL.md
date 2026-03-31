---
name: electron
description: Expert Electron development for cross-platform desktop applications with security and performance best practices
---

# Electron Specialist

You are an expert Electron developer. Apply these principles for secure, performant desktop apps.

## Core Philosophy

- **Security first** — Never trust renderer processes
- **Process isolation** — Main vs renderer separation
- **Native integration** — System APIs, file access, notifications
- **Cross-platform** — Windows, macOS, Linux support

## Process Model

### Main Process (Node.js)
```javascript
// main.js
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,      // REQUIRED for security
      nodeIntegration: false,       // REQUIRED for security
      sandbox: true                 // Additional isolation
    }
  })
  
  mainWindow.loadFile('index.html')
  // Or for dev: mainWindow.loadURL('http://localhost:3000')
}

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
```

### Preload Script (Bridge)
```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron')

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // One-way: renderer → main
  saveFile: (content) => ipcRenderer.send('save-file', content),
  
  // Two-way: renderer → main → renderer
  openFile: () => ipcRenderer.invoke('open-file'),
  
  // Main → renderer (subscriptions)
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_, version) => callback(version))
  },
  
  // Remove listeners
  removeUpdateListener: () => {
    ipcRenderer.removeAllListeners('update-available')
  }
})
```

### Renderer Process (Web)
```javascript
// renderer.js
async function handleOpen() {
  const content = await window.electronAPI.openFile()
  document.getElementById('content').textContent = content
}

function handleSave() {
  const content = document.getElementById('content').textContent
  window.electronAPI.saveFile(content)
}

// Subscribe to main process events
window.electronAPI.onUpdateAvailable((version) => {
  alert(`Update available: ${version}`)
})
```

## IPC Communication

### Main Process Handlers
```javascript
// main.js
const { ipcMain, dialog } = require('electron')
const fs = require('fs').promises

// Handle invoke (two-way)
ipcMain.handle('open-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (canceled || filePaths.length === 0) {
    return null
  }
  
  return fs.readFile(filePaths[0], 'utf-8')
})

// Handle send (one-way)
ipcMain.on('save-file', async (event, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  })
  
  if (!canceled && filePath) {
    await fs.writeFile(filePath, content)
    event.reply('file-saved', filePath)
  }
})

// Send to renderer
function notifyUpdate(version) {
  mainWindow.webContents.send('update-available', version)
}
```

### Pattern: Request-Response
```javascript
// preload.js
contextBridge.exposeInMainWorld('api', {
  getUser: (id) => ipcRenderer.invoke('get-user', id),
  saveUser: (user) => ipcRenderer.invoke('save-user', user)
})

// main.js
ipcMain.handle('get-user', async (event, id) => {
  try {
    const user = await database.getUser(id)
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// renderer.js
const result = await window.api.getUser('123')
if (result.success) {
  displayUser(result.data)
} else {
  showError(result.error)
}
```

## Native Features

### Menus
```javascript
const { Menu, MenuItem, shell } = require('electron')

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click: () => openFile()
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: () => saveFile()
      },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Documentation',
        click: () => shell.openExternal('https://example.com/docs')
      }
    ]
  }
]

// macOS app menu
if (process.platform === 'darwin') {
  template.unshift({
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
```

### Notifications
```javascript
const { Notification } = require('electron')

function showNotification(title, body) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: path.join(__dirname, 'assets/icon.png')
    })
    
    notification.on('click', () => {
      mainWindow.focus()
    })
    
    notification.show()
  }
}
```

### System Tray
```javascript
const { Tray, Menu, nativeImage } = require('electron')

let tray

function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, 'assets/tray-icon.png')
  )
  
  tray = new Tray(icon)
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ])
  
  tray.setToolTip('My App')
  tray.setContextMenu(contextMenu)
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}
```

### Auto Updater
```javascript
const { autoUpdater } = require('electron-updater')

autoUpdater.autoDownload = false

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available', info.version)
})

autoUpdater.on('download-progress', (progress) => {
  mainWindow.webContents.send('download-progress', progress.percent)
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-ready')
})

// Check for updates
app.whenReady().then(() => {
  autoUpdater.checkForUpdates()
})

// Install update
ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall()
})
```

## Security Best Practices

### ✅ DO
```javascript
// Always use contextIsolation
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true
}

// Validate IPC inputs
ipcMain.handle('read-file', async (event, filePath) => {
  // Validate the path is within allowed directory
  const resolved = path.resolve(filePath)
  const allowedDir = path.resolve(app.getPath('userData'))
  
  if (!resolved.startsWith(allowedDir)) {
    throw new Error('Access denied')
  }
  
  return fs.readFile(resolved, 'utf-8')
})

// Restrict navigation
mainWindow.webContents.on('will-navigate', (event, url) => {
  const parsedUrl = new URL(url)
  if (parsedUrl.origin !== 'https://trusted-site.com') {
    event.preventDefault()
  }
})

// Disable remote module (deprecated but might be enabled)
webPreferences: {
  enableRemoteModule: false
}
```

### ❌ DON'T
```javascript
// Never enable nodeIntegration with untrusted content
webPreferences: {
  nodeIntegration: true  // DANGEROUS!
}

// Never disable contextIsolation
webPreferences: {
  contextIsolation: false  // DANGEROUS!
}

// Never expose Node.js APIs directly
contextBridge.exposeInMainWorld('node', {
  require: require,         // DANGEROUS!
  process: process,         // DANGEROUS!
  fs: require('fs')        // DANGEROUS!
})

// Never load remote content without validation
mainWindow.loadURL(userProvidedUrl)  // DANGEROUS!
```

## Performance

### Lazy Window Creation
```javascript
let settingsWindow = null

function openSettings() {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }
  
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 600,
    parent: mainWindow,
    modal: true
  })
  
  settingsWindow.loadFile('settings.html')
  
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}
```

### Background Processing
```javascript
// Use worker threads for CPU-intensive tasks
const { Worker } = require('worker_threads')

ipcMain.handle('process-data', async (event, data) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', {
      workerData: data
    })
    
    worker.on('message', resolve)
    worker.on('error', reject)
  })
})

// worker.js
const { parentPort, workerData } = require('worker_threads')

const result = heavyComputation(workerData)
parentPort.postMessage(result)
```

### Memory Management
```javascript
// Clean up when window closes
mainWindow.on('closed', () => {
  mainWindow = null  // Allow garbage collection
})

// Limit renderer memory
mainWindow.webContents.session.setPreloads([])
```

## Build & Distribution

### electron-builder config
```json
// package.json
{
  "build": {
    "appId": "com.example.myapp",
    "productName": "My App",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "assets/**/*"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "assets/icon.icns"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "assets/icons"
    },
    "publish": {
      "provider": "github"
    }
  }
}
```

### Code Signing
```bash
# macOS (requires Apple Developer account)
export CSC_NAME="Developer ID Application: Your Name"

# Windows (requires code signing certificate)
export CSC_LINK=path/to/certificate.pfx
export CSC_KEY_PASSWORD=your-password
```

## Anti-Patterns

### ❌ Exposing Node.js to Renderer
```javascript
// Bad: Full Node.js access in renderer
webPreferences: {
  nodeIntegration: true,
  contextIsolation: false
}

// Good: Selective, validated APIs via preload
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  preload: path.join(__dirname, 'preload.js')
}
```

### ❌ Synchronous IPC
```javascript
// Bad: Blocks renderer
const result = ipcRenderer.sendSync('get-data')

// Good: Async communication
const result = await ipcRenderer.invoke('get-data')
```

### ❌ Loading Remote Content Unsafely
```javascript
// Bad: No validation
mainWindow.loadURL(untrustedUrl)

// Good: Whitelist trusted origins
const trustedOrigins = ['https://example.com']
const url = new URL(untrustedUrl)
if (trustedOrigins.includes(url.origin)) {
  mainWindow.loadURL(untrustedUrl)
}
```
