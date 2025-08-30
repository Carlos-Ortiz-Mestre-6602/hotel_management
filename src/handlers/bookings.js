const { ipcMain } = require('electron/main');

const handler = (db) => {

    ipcMain.handle('get-bookings', async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM bookings;', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });

    ipcMain.handle('get-booking-byId', async (event, bookingId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT
                            b.*,
                            r.*,
                            c.*
                        FROM
                            bookings AS b
                        JOIN
                            client_bookings AS cb ON b.id = cb.bookingId
                        JOIN
                            clients AS c ON cb.clientId = c.id
                        JOIN
                            rooms AS r ON b.roomId = r.id 
                        WHERE b.id = ?`;
            db.get(sql, [bookingId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    });

    ipcMain.handle('create-booking', async (event, data) => {
        return new Promise((resolve, reject) => {
            if (!data.clientIds) return reject("Booking clients requires");

            db.serialize(() => {
                db.run("BEGIN TRANSACTION;");

                const sql = 'INSERT INTO bookings (number, roomId, startDate, endDate, status, description) VALUES (?, ?, ?, ?, ?, ?)';

                db.run(sql, [data.number, data.roomId, data.startDate, data.endDate, data.status, data.description], function (err) {
                    if (err) {

                        db.run("ROLLBACK;");
                        reject(err);

                    } else {

                        const bookingId = this.lastID;

                        const clientBookingSql = `
                            INSERT INTO client_bookings (bookingId, clientId)
                            VALUES (?, ?)
                        `;

                        const stmt = db.prepare(clientBookingSql);
                        data.clientIds.forEach(clientId => {
                            stmt.run(bookingId, clientId, (err) => {
                                if (err) {
                                    db.run("ROLLBACK;");
                                    return reject(err);
                                }
                            });
                        });
                        stmt.finalize();

                        db.run("COMMIT;", (err) => {
                            if (err) {
                                db.run("ROLLBACK;");
                                return reject(err);
                            }
                            resolve(bookingId);
                        });
                    }
                });
            });

        });
    });

    ipcMain.handle('update-booking', async (event, data) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION;");

                const bookingId = Number(data.id);

                // 1. Actualizar la tabla `bookings`
                const sql = `
                    UPDATE bookings
                    SET number = ?, roomId = ?, startDate = ?, endDate = ?, status = ?, description = ?
                    WHERE id = ?
                `;

                db.run(
                    sql,
                    [data.number, data.roomId, data.startDate, data.endDate, data.status, data.description, bookingId],
                    (err) => {
                        if (err) {
                            db.run("ROLLBACK;");
                            return reject(err);
                        }

                        // 2. Eliminar los clientes antiguos de la tabla de unión
                        const deleteClientsSql = `
                            DELETE FROM client_bookings
                            WHERE bookingId = ?
                        `;

                        db.run(deleteClientsSql, [bookingId], (err) => {
                            if (err) {
                                db.run("ROLLBACK;");
                                return reject(err);
                            }

                            // 3. Insertar los nuevos clientes en la tabla de unión
                            const insertClientSql = `
                                INSERT INTO client_bookings (bookingId, clientId)
                                VALUES (?, ?)
                            `;
                            
                            const stmt = db.prepare(insertClientSql);
                            data.clientIds.forEach(clientId => {
                                stmt.run(bookingId, clientId, (err) => {
                                    if (err) {
                                        db.run("ROLLBACK;");
                                        return reject(err);
                                    }
                                });
                            });
                            stmt.finalize();

                            db.run("COMMIT;", (err) => {
                                if (err) {
                                    db.run("ROLLBACK;");
                                    return reject(err);
                                }
                                resolve();
                            });
                        });
                    }
                );
            });

        });
    });

}

module.exports = {
    handler
}