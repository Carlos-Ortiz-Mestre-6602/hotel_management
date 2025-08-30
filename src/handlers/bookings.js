const { ipcMain } = require('electron/main');

const handler = (db) => {

    ipcMain.handle('get-bookings', async () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT
                            b.*,
                            r.number AS roomName
                        FROM
                            bookings AS b
                        JOIN
                            rooms AS r ON b.roomId = r.id;`;

            db.all(sql, (err, rows) => {
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
                            b.id AS bookingId, b.number, b.startDate, b.endDate, b.status, b.description,
                            r.id AS roomId,
                            c.id AS clientId
                        FROM bookings AS b
                        JOIN client_bookings AS cb ON b.id = cb.bookingId
                        JOIN clients AS c ON cb.clientId = c.id
                        JOIN rooms AS r ON b.roomId = r.id
                        WHERE b.id = ?;`;

            db.all(sql, [bookingId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length === 0) {
                        return resolve(null);
                    }

                    const booking = {
                        id: rows[0].bookingId,
                        number: rows[0].number,
                        startDate: rows[0].startDate,
                        endDate: rows[0].endDate,
                        status: rows[0].status,
                        room: {
                            id: rows[0].roomId
                        },
                        clients: [],
                    };

                    rows.forEach(row => {
                        booking.clients.push({
                            id: row.clientId
                        });
                    });

                    resolve(booking);
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

                const roomId = Number(data.roomId);

                db.run(sql, [data.number, roomId, data.startDate, data.endDate, data.status, data.description], function (err) {
                    if (err) {

                        db.run("ROLLBACK;");
                        reject(err);

                    } else {

                        const bookingId = this.lastID;

                        const clientBookingSql = `
                            INSERT INTO client_bookings (bookingId, clientId)
                            VALUES (?, ?)
                        `;

                        const clientIds = data.clientIds.map(Number);

                        const stmt = db.prepare(clientBookingSql);
                        clientIds.forEach(clientId => {
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
            if (!data.clientIds) return reject("Booking clients requires");

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

    ipcMain.handle('get-available-rooms', async (event, data) => {
        return new Promise((resolve, reject) => {

            const sql = `SELECT *
                        FROM rooms
                        WHERE id NOT IN (
                            SELECT roomId
                            FROM bookings
                            WHERE
                                (bookings.endDate >= ? AND bookings.startDate <= ?)
                        );`;

            db.all(sql, [data.startDate, data.endDate], (err, rows) => {
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