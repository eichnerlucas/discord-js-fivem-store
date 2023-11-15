const client = require('../index');

module.exports = {
    findByNameAndDiscordId: (name, discord_id, callback) => {
        client.db.query(`SELECT script FROM subs WHERE discord_id = ? AND script = ?`, [discord_id, name], (err, rows) => {
            if (err) {
                console.error('Error in findByNameAndDiscordId:', err);
                return callback(err, null);
            }

            if (!rows || rows.length === 0) {
                return callback(null, null);
            }
        
            callback(null, rows);
        });
    },
};