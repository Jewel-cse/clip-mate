const { app, BrowserWindow } = require('electron');
const path = require('path');

// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

let registerIpcHandlers;
let startMonitoring;
let stopMonitoring;

try {
  const ipc = require('./ipc-handlers');
  registerIpcHandlers = ipc.registerIpcHandlers;
  
  const clipboardMod = require('./clipboard');
  startMonitoring = clipboardMod.startMonitoring;
  stopMonitoring = clipboardMod.stopMonitoring;
} catch (e) {
  console.error("Error loading modules:", e);
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 480,
    height: 600,
    minWidth: 400,
    minHeight: 400,
    frame: false, // Make window frameless
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/');
    // Open DevTools immediately to catch any renderer errors
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  }

  // Intercept close event to hide instead of quit (Phase 5.6)
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  return mainWindow;
};

const { createTray } = require('./tray');
const { registerGlobalShortcut, unregisterGlobalShortcut } = require('./shortcuts');

app.whenReady().then(() => {
  console.log('App is ready, registering IPC handlers...');
  if (registerIpcHandlers) registerIpcHandlers();
  
  console.log('Creating main window...');
  const mainWindow = createWindow();
  
  console.log('Starting clipboard monitoring...');
  if (startMonitoring) startMonitoring(mainWindow);

  console.log('Creating system tray...');
  createTray(mainWindow);

  console.log('Registering global shortcuts...');
  registerGlobalShortcut(mainWindow);
  
  console.log('App initialized successfully.');
}).catch(err => {
  console.error('Error during app initialization:', err);
});

app.on('will-quit', () => {
  console.log('App is quitting, unregistering shortcuts...');
  unregisterGlobalShortcut();
});

app.on('window-all-closed', () => {
  if (stopMonitoring) stopMonitoring();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
