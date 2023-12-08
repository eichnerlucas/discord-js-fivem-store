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

    async deleteChannelsInCategory(category) {
        for (let channel of category.children.values()) {
            await this.deleteChannel(channel);
        }
    },

    run: async (client, message, args) => {
        const categoryId = '870979800532140114';
        const category = message.guild.channels.cache.get(categoryId);
        if (!category || category.type !== 'GUILD_CATEGORY') {
            return message.reply('Categoria não encontrada.');
        }
        await this.deleteChannelsInCategory(category);
        message.reply('Todos os canais dentro da categoria foram excluídos com sucesso.');
    }
};