const { Message, Client, MessageEmbed } = require("discord.js");
const scriptsRepository = require("../../repositories/scriptRepository");

module.exports = {
    name: "scripts",
    aliases: ['scripts'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        const scripts = await scriptsRepository.findAll();

        if (! scripts)
            return message.channel.send(":x: **Nenhum script encontrado!**");


        const fields = scripts.map((script) => ({
            name: script.name,
            value: "Valor: " + script.price,
        }));
            
        const embed = new MessageEmbed()
            .setTitle(`Scripts (${scripts.length})`)
            .setColor(0x00AE86)
            .setTimestamp()
            .addFields(fields)

        return message.channel.send({embeds: [embed]})
    }
}