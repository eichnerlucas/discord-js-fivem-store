const {MessageEmbed} = require("discord.js");

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
        const erro = new MessageEmbed()
            .setTitle(`Uso incorreto`)
            .setDescription(`!ip <script> <ip>`)
            .setColor(0x00ae86)
            .setTimestamp();
        if (! args[0] || !args[1]) return message.channel.send({embeds: [erro]});
        client.db.query(`SELECT script, ip FROM subs WHERE discord_id = "${message.author.id}" AND script = "${args[0]}" `, async (err, rows) => {
            if (! rows || rows.length === 0) {
                message.channel.send(`:x: Você não possui o script **${args[0]}**, contate um administrador caso ache que isso seja um engano.`);
            }
            client.db.query(`UPDATE subs SET ip = "${args[1]}" WHERE discord_id = "${message.author.id}" AND script = "${args[0]}"`, async (err, rows) => {
                if (rows.affectedRows >= 1) {
                    return message.channel.send(`:white_check_mark: **IP atualizado para o script** **__${args[0]}__** `);
                }
            });
        });
    },
}
