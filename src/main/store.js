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

module.exports = {
  store,
  getClips,
  searchClips,
  saveClip,
  getSettings,
  updateSettings,
};
