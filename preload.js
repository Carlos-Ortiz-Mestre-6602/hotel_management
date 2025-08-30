const { contextBridge, ipcRenderer } = require('electron')

// General
contextBridge.exposeInMainWorld('electronAPI', {
  findInPage: (text, options) => ipcRenderer.invoke('find-in-page', text, options),
  stopFindInPage: (action) => ipcRenderer.invoke('stop-find-in-page', action)
});

// Bookings
contextBridge.exposeInMainWorld('bookingsAPI', {
  getBookings: () => ipcRenderer.invoke('get-bookings'),
  getBookingById: (bookingId) => ipcRenderer.invoke('get-booking-byId', bookingId),
  createBooking: (data) => ipcRenderer.invoke('create-booking', data),
  updateBooking: (data) => ipcRenderer.invoke('update-booking', data),
  getAvailableRooms: (data) => ipcRenderer.invoke('get-available-rooms', data)
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

// Rooms
contextBridge.exposeInMainWorld('roomsAPI', {
  getRooms: () => ipcRenderer.invoke('get-rooms'),
  getRoomById: (roomId) => ipcRenderer.invoke('get-room-byId', roomId),
  createRoom: (data) => ipcRenderer.invoke('create-room', data),
  updateRoom: (data) => ipcRenderer.invoke('update-room', data),
  deleteRoom: (roomId) => ipcRenderer.invoke('delete-room', roomId)
});
