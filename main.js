const { app, BrowserWindow, ipcMain } = require('electron/main');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Handlers
const bookingsHandler = require('./src/handlers/bookings');
const clientsHandler = require("./src/handlers/clients");
const roomsHandler = require("./src/handlers/rooms");

let db;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {

  let dbPath;

  if (app.isPackaged) {
    dbPath = path.join(process.resourcesPath, 'database.db');
  } else {
    dbPath = path.join(__dirname, 'database.db');
  }

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database', err);
    else console.log('Database connected');
  });

  // Handlers
  ipcMain.handle('find-in-page', (event, text, options) => {
    const webContents = event.sender;
    webContents.findInPage(text, options);
  });

  ipcMain.handle('stop-find-in-page', (event, action) => {
    const webContents = event.sender;
    webContents.stopFindInPage(action);
  });

  bookingsHandler.handler(db);
  clientsHandler.handler(db);
  roomsHandler.handler(db);

  // Create window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})