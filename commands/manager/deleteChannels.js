module.exports = {
    name: "delete-channels",
    aliases: ['delete-channels'],

    async deleteChannel(channel) {
        try {
            await channel.delete();
        } catch (error) {
            console.error(`Erro ao excluir canal ${channel.name}: ${error.message}`);
        }
    },

    deleteChannelsInCategory: async function(category) {
        for (let channel of category.children.values()) {
            await this.deleteChannel(channel);
        }
    },

    run: async function(client, message, args) {
        const category = message.guild.channels.cache.get(client.config.ticketParentId);
        if (!category || category.type !== 'GUILD_CATEGORY') {
            return message.reply('Categoria não encontrada.');
        }
        await this.deleteChannelsInCategory(category);
        message.reply('Todos os canais dentro da categoria foram excluídos com sucesso.');
    }
};