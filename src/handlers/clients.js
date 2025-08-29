const { ipcMain } = require('electron/main')

const handler = (db) => {

    ipcMain.handle('get-clients', async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM clients;', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });

}

module.exports = {
    handler
}