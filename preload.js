const { contextBridge, ipcRenderer } = require('electron')

// General
contextBridge.exposeInMainWorld('electronAPI', {
  findInPage: (text, options) => ipcRenderer.invoke('find-in-page', text, options),
  stopFindInPage: (action) => ipcRenderer.invoke('stop-find-in-page', action)
});

// Clients
contextBridge.exposeInMainWorld('clientsAPI', {
  getClients: () => ipcRenderer.invoke('get-clients'),
  getClientById: (clientId) => ipcRenderer.invoke('get-client-byId', clientId),
  getCountries: () => ipcRenderer.invoke('get-countries'),
  createClient: (data) => ipcRenderer.invoke('create-client', data),
  updateClient: (data) => ipcRenderer.invoke('update-client', data),
  deleteClient: (clientId) => ipcRenderer.invoke('delete-client', clientId)
});
