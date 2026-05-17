const { ipcMain, clipboard, BrowserWindow } = require('electron');
const { getClips, searchClips } = require('./store');

function registerIpcHandlers() {
  ipcMain.handle('ping:pong', async (event, message) => {
    // Stage 2.5/7.3: Solid argument validation
    if (typeof message !== 'string' || message.length > 500) {
      throw new Error('Invalid argument: message must be a string <= 500 chars');
    }
    
    console.log('Main process received ping with message:', message);
    return `pong: ${message}`;
  });

  ipcMain.handle('clips:get-all', async () => {
    return getClips();
  });

  ipcMain.handle('clips:search', async (event, query) => {
    if (typeof query !== 'string' || query.length > 100) {
      throw new Error('Invalid argument: query must be a string <= 100 chars');
    }
    return searchClips(query);
  });

  ipcMain.handle('clips:copy', async (event, id) => {
    if (typeof id !== 'string' || id.length !== 36) {
      throw new Error('Invalid argument: id must be a UUID v4 string of 36 characters');
    }

    const clips = getClips();
    const clip = clips.find(c => c.id === id);
    
    if (clip) {
      if (clip.type === 'text' || clip.type === 'link') {
        clipboard.writeText(clip.content);
      } else if (clip.type === 'image') {
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
    if (typeof newSettings !== 'object' || newSettings === null) {
      throw new Error('Invalid argument: settings must be a non-null object');
    }

    // Harden settings attributes
    const { hotkey, retentionLimit, theme, monitoringEnabled } = newSettings;
    
    if (hotkey !== undefined && (typeof hotkey !== 'string' || hotkey.length > 100)) {
      throw new Error('Invalid argument: hotkey must be a string <= 100 characters');
    }

    if (retentionLimit !== undefined && (typeof retentionLimit !== 'number' || retentionLimit < 10 || retentionLimit > 2000)) {
      throw new Error('Invalid argument: retentionLimit must be a number between 10 and 2000');
    }

    if (theme !== undefined && !['light', 'dark', 'system'].includes(theme)) {
      throw new Error('Invalid argument: theme must be one of light, dark, system');
    }

    if (monitoringEnabled !== undefined && typeof monitoringEnabled !== 'boolean') {
      throw new Error('Invalid argument: monitoringEnabled must be a boolean');
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
