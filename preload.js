const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getClients: () => ipcRenderer.invoke('get-clients'),
})
