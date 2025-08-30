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

    ipcMain.handle('get-client-byId', async (event, clientId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM clients WHERE id = ?`;
            db.get(sql, [clientId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    });

    ipcMain.handle('get-countries', async () => {
        return new Promise((resolve, reject) => {
            fetch("https://restcountries.com/v3.1/all?fields=name,cca2").then(response => response.json()).then(resolve).catch(reject)
        });
    });

    ipcMain.handle('create-client', async (event, data) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO clients (fullname, identification, country, gender, age, description) VALUES (?, ?, ?, ?, ?, ?)';

            db.run(sql, [data.fullname, data.identification, data.country, data.gender, data.age, data.description], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });

        });
    });

    ipcMain.handle('update-client', async (event, data) => {
        return new Promise((resolve, reject) => {
            if (!data.id) return reject('No valid id')

            const clientId = Number(data.id)

            const sql = `UPDATE clients SET fullname = ?, identification = ?, country = ?, gender = ?, age = ?, description = ? WHERE id = ?`;

            db.run(sql, [data.fullname, data.identification, data.country, data.gender, data.age, data.description, clientId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });

        });
    });

    ipcMain.handle('delete-client', async (event, clientId) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM clients WHERE id = ?`;

            db.run(sql, [clientId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve(clientId);
                    } else {
                        reject("Client not found");
                    }
                }
            });

        });
    });

}

module.exports = {
    handler
}