const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "subs",
    aliases: ['subs'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        client.db.query(
            `SELECT script, ip FROM subs WHERE discord_id = "${message.author.id}"`,
            async (err, rows) => {
                if (err) throw err;
                if (!rows || rows.length === 0) {
                    return message.channel.send(`:negative_squared_cross_mark: **Você não possui nenhum script!** `);
                }
                const fields = rows.map((script) => ({
                    name: "Nome:  " + script.script,
                    value: "IP: " + (script.ip ? script.ip : "Nenhum")
                }));
                const embed = new MessageEmbed()
                    .setTitle(`Assinaturas (${rows.length})`)
                    .setColor(0x00ae86)
                    .addFields(fields)
                return message.channel.send({embeds: [embed]});
            }
        );
    }
}
