const {MessageEmbed} = require('discord.js');

const COLORS = {
    SUCCESS: 0x00ae86,
    ERROR: 0xAE0028
};

const AUTHOR = {
    NAME: 'Discord Store',
    ICON_URL: 'https://i.imgur.com/AfFp7pu.png'
};

module.exports = {
    create: (title, type = "success", description = null, fields = null) => {
        const embed = new MessageEmbed()
            .setTitle(title)
            .setAuthor({name: AUTHOR.NAME, iconURL: AUTHOR.ICON_URL})
            .setTimestamp()
            .setColor(type === 'error' ? COLORS.ERROR : COLORS.SUCCESS);

        addDescriptionIfProvided(embed, description);
        addFieldsIfProvided(embed, fields);

        return embed;
    }
}

function addDescriptionIfProvided(embed, description) {
    if (description) {
        embed.setDescription(description);
    }
}

function addFieldsIfProvided(embed, fields) {
    if (fields) {
        embed.addFields(fields);
    }
}