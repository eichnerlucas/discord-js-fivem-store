module.exports = {
    findByName: async (name) => {
        const client = require('../index');

        const script = await client.db.getScriptByName(name);
        return script[0]
    },

    findAll: async () => {
        const client = require('../index');

        return await client.db.getAllScripts()
    },
};