const { globalShortcut } = require('electron');
const { getSettings } = require('./store');

function registerGlobalShortcut(mainWindow) {
  const settings = getSettings();
  const hotkey = settings.hotkey || 'CommandOrControl+Shift+V';

  // Unregister first to avoid duplicates
  globalShortcut.unregisterAll();

  try {
    const isRegistered = globalShortcut.register(hotkey, () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;

      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    if (!isRegistered) {
      console.warn(`Failed to register global shortcut: ${hotkey}`);
    } else {
      console.log(`Global shortcut registered: ${hotkey}`);
    }
  } catch (error) {
    console.error(`Error registering global shortcut ${hotkey}:`, error);
  }
}

function unregisterGlobalShortcut() {
  globalShortcut.unregisterAll();
}

module.exports = { registerGlobalShortcut, unregisterGlobalShortcut };
