const subsRepository = require('../../repositories/subsRepository.js');
const MessageEmbedUtil = require('../../utils/MessageEmbed.js');
const invalidUsageError = MessageEmbedUtil.create("Uso incorreto", "error", "!ip <script> <ip>");
const ipUpdateSuccessMessage = ":white_check_mark: **IP atualizado com sucesso!**";

const checkArgumentsAndSendMessage = async (args, message) => {
    if (!args[0] || !args[1]) {
        await message.channel.send({embeds: [invalidUsageError]});
        return false;
    }
    return true;
};

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
        if (!await checkArgumentsAndSendMessage(args, message)) return;

        const script = await subsRepository.findByNameAndDiscordId(args[0], message.author.id);
        if (!script) {
            return message.channel.send(`:x: Você não possui o script **${args[0]}**, contate um administrador caso ache que isso seja um engano.`);
        }

        const updated = await subsRepository.updateIp(message.author.id, args[0], args[1]);
        if (!updated) {
            return message.channel.send(`:x: Ocorreu um erro ao atualizar o ip do script **${args[0]}**, contate um administrador.`);
        }

        return message.channel.send(ipUpdateSuccessMessage);
    },
};
