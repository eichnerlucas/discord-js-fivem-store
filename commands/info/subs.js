const { MessageEmbed } = require('discord.js');
const subsRepository = require('../../repositories/subsRepository.js');

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
        const embed = new MessageEmbed()
            .setTitle(`Assinaturas (${subscriptions.length})`)
            .setColor(0x00ae86)
            .addFields(fields)
        return message.channel.send({embeds: [embed]});
    }
}
