module.exports = {
    findByNameAndDiscordId: async (name, discord_id) => {
        const client = require('../index');

        return await client.db.getSubsByDiscordIdAndScriptName(name, discord_id)
    },

    updateIp: async (discord_id, script, ip) => {
        const client = require('../index');

        return await client.db.updateSubsIp(discord_id, script, ip)
    },

    findByDiscordId: async (discord_id) => {
        const client = require('../index');

        return await client.db.getSubsByDiscordId(discord_id)
    },

    createSubscription: async (discord_id, script) => {
        const client = require('../index');

        return await client.db.createSubscription(discord_id, script)
    },

    deleteSubscriptionByDiscordIdAndScript: async (discord_id, script) => {
        const client = require('../index');

        return await client.db.deleteSubscriptionByDiscordIdAndScript(discord_id, script)
    }
};