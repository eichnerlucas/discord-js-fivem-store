const subsRepository = require('../../repositories/subsRepository.js');
const MessageEmbedUtil = require('../../utils/MessageEmbed.js');

function createField(script) {
    return {
        name: `Nome:  ${script.script}`,
        value: `IP: ${script.ip || 'Nenhum'}`,
    };
}

module.exports = {
    name: 'subs',
    aliases: ['subs'],
    run: async (client, message, args) => {
        const subscriptions = await subsRepository.findByDiscordId(message.author.id);

        if (!subscriptions)
            return message.channel.send(":x: **Nenhuma assinatura encontrada!**");

        const fields = subscriptions.map(createField);

        const embed = MessageEmbedUtil.create('Assinaturas', null, null, fields);
        return message.channel.send({embeds: [embed]});
    },
};
