const { Message, Client, MessageEmbed } = require("discord.js");
const scriptsRepository = require("../../repositories/scriptRepository");
const MessageEmbedSuccess = require("../../utils/MessageEmbedSuccess.js");

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
            value: "Valor: R$" + script.price,
        }));
        const embed = MessageEmbedSuccess.create(`Scripts (${scripts.length})`, null, fields);

        return message.channel.send({embeds: [embed]})
    }
}