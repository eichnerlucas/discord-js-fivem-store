const { MessageEmbed } = require('discord.js');

module.exports = {
    create: (title, description = null, fields = null) => {
        const embed = new MessageEmbed()
            .setTitle(title)
            .setColor(0xAE0028)
            .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
            .setTimestamp()

            
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
