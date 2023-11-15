const client = require('../index');

module.exports = {
    findByName: async (name) => {
        const script = await client.db.getScriptName(name);
        return script[0]
    },

    findAll: async () => {
        const scripts = await client.db.getAllScripts();
        return scripts
    },
};