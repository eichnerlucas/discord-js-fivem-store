module.exports = {
    findById: (client, id, callback) => {
        client.db.query(`SELECT * FROM payments WHERE payment_id = ?`, [id], (err, rows) => {
            if (err) {
                console.error('Error in findById:', err);
                return callback(err, null);
            }

            if (!rows || rows.length === 0) {
                return callback(null, null);
            }
            callback(null, rows);
        });
    },
};