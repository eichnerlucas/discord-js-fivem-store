const client = require('../index');

module.exports = {
    findByName: (name, callback) => {
        client.db.query(`SELECT * FROM scripts WHERE name = ?`, [name], (err, rows) => {
            if (err) {
                console.error('Error in findByName:', err);
                return callback(err, null);
            }

            if (!rows || rows.length === 0) {
                return callback(null, null);
            }

            const script = rows[0];
            callback(null, script[0]);
        });
    },
};