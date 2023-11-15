const { MessageEmbed } = require('discord.js');

module.exports = {
    create: (title, type = "success", description = null, fields = null) => {
        const embed = new MessageEmbed()
            .setTitle(title)
            .setColor(0x00ae86)
            .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
            .setTimestamp();

        if (type === 'error') {
            embed.setColor(0xAE0028);
        }

        // Adiciona a descrição apenas se ela for fornecida
        if (description) {
            embed.setDescription(description);
        }

        // Adiciona os campos apenas se eles forem fornecidos
        if (fields) {
            embed.addFields(fields);
        }

        return embed;
    }
}