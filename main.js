const { app, BrowserWindow, ipcMain } = require('electron/main');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Handlers
const clientsHandler = require("./src/handlers/clients");

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
  clientsHandler.handler(db);

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