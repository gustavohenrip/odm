const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('adm', {
  getBackendInfo: () => ipcRenderer.invoke('adm:getBackendInfo'),
  onClipboardUrl: (handler) => {
    const listener = (_e, url) => handler(url);
    ipcRenderer.on('adm:urlFromClipboard', listener);
    return () => ipcRenderer.removeListener('adm:urlFromClipboard', listener);
  },
  onPauseAll: (handler) => {
    ipcRenderer.on('adm:pauseAll', handler);
    return () => ipcRenderer.removeListener('adm:pauseAll', handler);
  },
  onResumeAll: (handler) => {
    ipcRenderer.on('adm:resumeAll', handler);
    return () => ipcRenderer.removeListener('adm:resumeAll', handler);
  },
  onUpdateAvailable: (handler) => {
    ipcRenderer.on('adm:updateAvailable', handler);
    return () => ipcRenderer.removeListener('adm:updateAvailable', handler);
  },
});
