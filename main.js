const { app, BrowserWindow, ipcMain } = require('electron/main')
const sqlite3 = require('sqlite3').verbose()
const path = require('node:path')

let db;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {

  const dbPath = path.join(__dirname, 'database.db');
  
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database', err);
    else console.log('Database connected');
  });

  // Handlers
  getUsersHandler(db);

  // Create window
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Handlers
function getUsersHandler(db) {

  ipcMain.handle('get-users', async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name FROM users', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });

}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

console.log("From server...")