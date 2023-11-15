const {MessageEmbed} = require("discord.js");
const subsRepository = require('../../repositories/subsRepository.js');

module.exports = {
    name: "ip",
    aliases: ['ip'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        const erro = new MessageEmbed()
            .setTitle(`Uso incorreto`)
            .setDescription(`!ip <script> <ip>`)
            .setColor(0x00ae86)
            .setTimestamp();
        if (! args[0] || !args[1]) return message.channel.send({embeds: [erro]});

        const script = await subsRepository.findByNameAndDiscordId(args[0], message.author.id);
        if (! script) {
            return message.channel.send(`:x: Você não possui o script **${args[0]}**, contate um administrador caso ache que isso seja um engano.`);
        }

        const updated = await subsRepository.updateIp(message.author.id, args[0], args[1]);
        if (! updated) {
            return message.channel.send(`:x: Ocorreu um erro ao atualizar o ip do script **${args[0]}**, contate um administrador.`);
        }

        return message.channel.send(`:white_check_mark: **IP atualizado com sucesso!**`);
    },
}
