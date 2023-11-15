const client = require('../index');

module.exports = {
    findByName: async (name) => {
        const script = await client.db.getScriptByName(name);
        return script
    },

    findAll: async () => {
        const scripts = await client.db.getAllScripts();
        return scripts
    },
};