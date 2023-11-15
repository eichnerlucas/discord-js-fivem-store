
const subsRepository = require('../../repositories/subsRepository.js');
const MessageEmbedSuccess = require('../../utils/MessageEmbedSuccess.js');

module.exports = {
    name: "subs",
    aliases: ['subs'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        const subscriptions = await subsRepository.findByDiscordId(message.author.id);
        
        if (! subscriptions)
            return message.channel.send(":x: **Nenhuma assinatura encontrada!**");
        
        const fields = subscriptions.map((script) => ({
            name: "Nome:  " + script.script,
            value: "IP: " + (script.ip ? script.ip : "Nenhum")
        }));
        const embed = MessageEmbedSuccess.create("Assinaturas",null, fields);
        return message.channel.send({embeds: [embed]});
    }
}
