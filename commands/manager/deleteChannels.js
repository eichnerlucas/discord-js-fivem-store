const fs = require("fs");

module.exports = {
    name: "delete-channels",
    aliases: ['delete-channels'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        // Obtém a categoria pela ID (substitua 'CategoriaID' pela ID da categoria desejada)
            const categoryId = '870979800532140114';
            const category = message.guild.channels.cache.get(categoryId);

            // Verifica se a categoria existe
            if (!category || category.type !== 'GUILD_CATEGORY') {
                return message.reply('Categoria não encontrada.');
            }

            // Itera sobre os canais na categoria e os exclui
            category.children.forEach(async (channel) => {
            try {
                await channel.delete();
            } catch (error) {
                console.error(`Erro ao excluir canal ${channel.name}: ${error.message}`);
            }
            });

            message.reply('Todos os canais dentro da categoria foram excluídos com sucesso.');
    }
};