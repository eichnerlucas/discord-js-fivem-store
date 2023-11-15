module.exports = {
    findByNameAndDiscordId: async (name, discord_id) => {
        const client = require('../index');

        const script = await client.db.getSubsByDiscordIdAndScriptName(name, discord_id);
        return script
    },

    updateIp: async (discord_id, script, ip) => {
        const client = require('../index');

        const result = await client.db.updateSubsIp(discord_id, script, ip);
        return result
    },

    findByDiscordId: async (discord_id) => {
        const client = require('../index');

        const script = await client.db.getScriptByDiscordId(discord_id);
        return script
    },

    createSubscription: async (discord_id, script) => {
        const client = require('../index');
        
        const result = await client.db.createSubscription(discord_id, script);
        return result
    }
};