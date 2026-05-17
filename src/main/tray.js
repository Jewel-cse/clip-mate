const { Tray, Menu, app, nativeImage } = require('electron');
const path = require('path');
const { getSettings, updateSettings } = require('./store');

let tray = null;

function createTray(mainWindow, toggleMonitoringCallback) {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);
  tray.setToolTip('ClipMate');

  function rebuildMenu() {
    const settings = getSettings();
    const isMonitoring = settings.monitoringEnabled;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open ClipMate',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring',
        click: () => {
          const newStatus = !isMonitoring;
          updateSettings({ monitoringEnabled: newStatus });
          if (toggleMonitoringCallback) {
            toggleMonitoringCallback(newStatus);
          }
          rebuildMenu();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.isQuiting = true; // Flag to skip hiding window and actually quit
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
  }

  // Handle double click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  rebuildMenu();
  return tray;
}

module.exports = { createTray };
