const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipmate', {
  ping: (message) => ipcRenderer.invoke('ping:pong', message),
  getAllClips: () => ipcRenderer.invoke('clips:get-all'),
  searchClips: (query) => ipcRenderer.invoke('clips:search', query),
  copyClip: (id) => ipcRenderer.invoke('clips:copy', id),
  deleteClip: (id) => ipcRenderer.invoke('clips:delete', id),
  clearAllClips: () => ipcRenderer.invoke('clips:clear-all'),
  hideWindow: () => ipcRenderer.invoke('window:hide'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
  onNewClip: (callback) => {
    ipcRenderer.on('clip:new', (event, clip) => callback(clip));
    // Provide a way to remove the listener if needed
    return () => ipcRenderer.removeAllListeners('clip:new');
  },
});
