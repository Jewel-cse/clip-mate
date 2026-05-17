const { clipboard, app } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { saveClip, getSettings } = require('./store');

let lastText = '';
let lastImage = '';
let intervalId = null;

const URL_REGEX = /^(https?:\/\/[^\s]+)/;

function startMonitoring(mainWindow) {
  // Initialize caches only when monitoring starts (app is ready)
  lastText = clipboard.readText();
  lastImage = clipboard.readImage().toDataURL();

  const imagesDir = path.join(app.getPath('userData'), 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  intervalId = setInterval(() => {
    const settings = getSettings();
    if (!settings.monitoringEnabled) return;

    let hasNewClip = false;
    let newClip = null;

    const currentText = clipboard.readText();
    const currentImage = clipboard.readImage();

    // Check if there is new text
    if (currentText && currentText !== lastText) {
      lastText = currentText;
      hasNewClip = true;

      const isLink = URL_REGEX.test(currentText);
      newClip = {
        id: crypto.randomUUID(),
        type: isLink ? 'link' : 'text',
        content: currentText,
        imagePath: null,
        timestamp: new Date().toISOString(),
        charLength: currentText.length,
      };

      // Ensure we update lastImage so we don't save the old image next time
      lastImage = currentImage.toDataURL();
    } 
    // Check if there is a new image (and no new text to take precedence)
    else if (!currentImage.isEmpty() && currentImage.toDataURL() !== lastImage) {
      lastImage = currentImage.toDataURL();
      hasNewClip = true;
      lastText = currentText; // Update text cache

      const imageName = `${crypto.randomUUID()}.png`;
      const imagePath = path.join(imagesDir, imageName);
      fs.writeFileSync(imagePath, currentImage.toPNG());

      newClip = {
        id: crypto.randomUUID(),
        type: 'image',
        content: null,
        imagePath: imagePath,
        timestamp: new Date().toISOString(),
        charLength: 0,
      };
    }

    if (hasNewClip && newClip) {
      saveClip(newClip);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('clip:new', newClip);
      }
    }
  }, 200);
}

function stopMonitoring() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = { startMonitoring, stopMonitoring };
