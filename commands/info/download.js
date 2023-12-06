const {MessageAttachment} = require("discord.js");
const fs = require("fs");
const subsRepository = require('../../repositories/subsRepository.js');

module.exports = {
    name: "download",
    aliases: ['downloads'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        if (!validateArguments(args)) {
            return message.channel.send(':x: **Use !download <script>**');
        }

        const script = await findScript(args, message);

        if (!script) {
            return sendMessageScriptNotFound(args, message);
        }

        await processFile(args, message);
    }
};

function validateArguments(args) {
    return args[0];
}

async function findScript(args, message) {
    return await subsRepository.findByNameAndDiscordId(args[0], message.author.id);
}

function sendMessageScriptNotFound(args, message) {
    return message.channel.send(`:x: Você não possui o script **${args[0]}**, contate um administrador caso ache que isso seja um engano.`);
}

function processFile(args, message) {
    fs.stat(`./files/${args[0]}.zip`, (error, exists) => {
        if (error) console.log(error);
        if (!exists) {
            return message.channel.send(":x: **Arquivo não encontrado, contate um administrador!**")
        }
        const scriptAtt = new MessageAttachment(`./files/${args[0]}.zip`, `${args[0]}.zip`)
        message.channel.send(":white_check_mark: **Download enviado no seu privado!**")
        message.author.send({files: [scriptAtt]})
    });
}
