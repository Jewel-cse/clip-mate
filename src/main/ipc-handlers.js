const { ipcMain, clipboard, BrowserWindow } = require('electron');
const { getClips, searchClips } = require('./store');

function registerIpcHandlers() {
  ipcMain.handle('ping:pong', async (event, message) => {
    // Phase 2.5: Add input validation
    if (typeof message !== 'string') {
      throw new Error('Invalid argument: message must be a string');
    }
    
    console.log('Main process received ping with message:', message);
    return `pong: ${message}`;
  });

  ipcMain.handle('clips:get-all', async () => {
    return getClips();
  });

  ipcMain.handle('clips:search', async (event, query) => {
    if (typeof query !== 'string') {
      throw new Error('Invalid argument: query must be a string');
    }
    return searchClips(query);
  });

  ipcMain.handle('clips:copy', async (event, id) => {
    const clips = getClips();
    const clip = clips.find(c => c.id === id);
    
    if (clip) {
      if (clip.type === 'text' || clip.type === 'link') {
        clipboard.writeText(clip.content);
      } else if (clip.type === 'image') {
        // To write image back to clipboard, we need to read it using nativeImage
        const { nativeImage } = require('electron');
        const image = nativeImage.createFromPath(clip.imagePath);
        clipboard.writeImage(image);
      }
      return { success: true };
    }
    return { success: false, error: 'Clip not found' };
  });

  ipcMain.handle('window:hide', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.hide();
    }
  });

  ipcMain.handle('settings:get', async () => {
    const { getSettings } = require('./store');
    return getSettings();
  });

  ipcMain.handle('settings:update', async (event, newSettings) => {
    if (typeof newSettings !== 'object') {
      throw new Error('Invalid argument: settings must be an object');
    }
    const { getSettings, updateSettings } = require('./store');
    const oldSettings = getSettings();
    updateSettings(newSettings);

    // If hotkey has changed, re-register it (Phase 6.4)
    if (newSettings.hotkey && newSettings.hotkey !== oldSettings.hotkey) {
      const { registerGlobalShortcut } = require('./shortcuts');
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        registerGlobalShortcut(win);
      }
    }
    return { success: true };
  });
}

module.exports = { registerIpcHandlers };
