module.exports = {
    findByName: async (name) => {
        const client = require('../index');

        const script = await client.db.getScriptByName(name);
        return script
    },

    findAll: async () => {
        const client = require('../index');
        
        const scripts = await client.db.getAllScripts();
        return scripts
    },
};