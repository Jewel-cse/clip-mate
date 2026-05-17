const Store = require('electron-store').default || require('electron-store');

const schema = {
  clips: {
    type: 'array',
    default: [],
  },
  settings: {
    type: 'object',
    default: {
      hotkey: 'CommandOrControl+Shift+V',
      retentionLimit: 500,
      theme: 'system',
      monitoringEnabled: true,
    },
  },
};

const store = new Store({ schema });

function getClips() {
  return store.get('clips', []);
}

function searchClips(query) {
  const clips = getClips();
  if (!query) return clips;
  
  const lowerQuery = query.toLowerCase();
  return clips.filter(clip => {
    if (clip.type === 'text' || clip.type === 'link') {
      return clip.content && clip.content.toLowerCase().includes(lowerQuery);
    }
    return false;
  });
}

function saveClip(clip) {
  const clips = getClips();
  clips.unshift(clip); // Add to the beginning

  // Enforce retention limit
  const limit = store.get('settings.retentionLimit', 500);
  if (clips.length > limit) {
    // We should ideally delete the image files from disk for the ones we drop.
    // For now, simply keep the most recent 'limit' clips.
    clips.splice(limit);
  }

  store.set('clips', clips);
  return clips;
}

function getSettings() {
  return store.get('settings');
}

function updateSettings(newSettings) {
  const current = getSettings();
  store.set('settings', { ...current, ...newSettings });
}

function deleteClip(id) {
  const fs = require('fs');
  const clips = getClips();
  const clipIndex = clips.findIndex(c => c.id === id);

  if (clipIndex !== -1) {
    const clip = clips[clipIndex];
    // If it's an image, delete the cached file on disk
    if (clip.type === 'image' && clip.imagePath) {
      try {
        if (fs.existsSync(clip.imagePath)) {
          fs.unlinkSync(clip.imagePath);
        }
      } catch (err) {
        console.error('Failed to delete image file from disk:', err);
      }
    }
    clips.splice(clipIndex, 1);
    store.set('clips', clips);
    return true;
  }
  return false;
}

module.exports = {
  store,
  getClips,
  searchClips,
  saveClip,
  getSettings,
  updateSettings,
  deleteClip,
};
