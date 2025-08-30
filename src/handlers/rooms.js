const { ipcMain } = require('electron/main');

const handler = (db) => {

    ipcMain.handle('get-rooms', async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM rooms;', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });

    ipcMain.handle('get-room-byId', async (event, roomId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM rooms WHERE id = ?`;
            db.get(sql, [roomId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    });

    ipcMain.handle('create-room', async (event, data) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO rooms (number, type, price, status, condition, cleanedAt, description) VALUES (?, ?, ?, ?, ?, ?, ?)';

            db.run(sql, [data.number, data.type, data.price, data.status, data.condition, data.cleanedAt, data.description], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });

        });
    });

    ipcMain.handle('update-room', async (event, data) => {
        return new Promise((resolve, reject) => {
            if (!data.id) return reject('No valid id')

            const roomId = Number(data.id)

            const sql = `UPDATE rooms SET number = ?, type = ?, price = ?, status = ?, condition = ?, cleanedAt = ?, description = ? WHERE id = ?`;

            db.run(sql, [data.number, data.type, data.price, data.status, data.condition, data.cleanedAt, data.description, roomId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });

        });
    });

    ipcMain.handle('delete-room', async (event, roomId) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM rooms WHERE id = ?`;

            db.run(sql, [roomId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve(roomId);
                    } else {
                        reject("Room not found");
                    }
                }
            });

        });
    });

}

module.exports = {
    handler
}