const client = require('../index');

module.exports = {
    findByNameAndDiscordId: async (name, discord_id) => {
        console.log(client.db)
        const script = await client.db.getSubsByDiscordIdAndScriptName(name, discord_id);
        return script
    },

    updateIp: async (discord_id, script, ip) => {
        const result = await client.db.updateSubsIp(discord_id, script, ip);
        return result
    },

    findByDiscordId: async (discord_id) => {
        const script = await client.db.getScriptByDiscordId(discord_id);
        return script
    },
};