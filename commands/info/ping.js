const { Message, Client } = require("discord.js");
const scriptRepository = require('../../repositories/scriptRepository.js');

module.exports = {
    name: "ping",
    aliases: ['p'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        scriptRepository.findByName('Teste', (err, script) => {
            console.log('Script:', script);
        });
        message.channel.send(`${client.ws.ping} ping`);
    },
};
