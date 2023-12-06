const {Message, Client, MessageEmbed} = require("discord.js");
const scriptsRepository = require("../../repositories/scriptRepository");
const MessageEmbedUtil = require("../../utils/MessageEmbed");
const moneyFormat = require("../../utils/moneyFormat");


function createField(script) {
    return {
        name: script.name,
        value: `Valor: ${moneyFormat(script.price)}`,
    };
}

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
        if (!scripts?.length) {
            return message.channel.send(":x: **Nenhum script encontrado!**");
        }

        const embedTitle = `Scripts (${scripts.length})`; // title definition extracted

        const scriptsFields = scripts.map(createField);

        const embed = MessageEmbedUtil.create(embedTitle, null, null, scriptsFields);

        return message.channel.send({embeds: [embed]});
    }
}