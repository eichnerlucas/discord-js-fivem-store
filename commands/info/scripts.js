const { Message, Client, MessageEmbed } = require("discord.js");

module.exports = {
    name: "scripts",
    aliases: ['scripts'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        await client.db.query("SELECT name, price FROM scripts", async (err, rows) =>{
            if (! rows || rows.length === 0) {
                return message.channel.send(`Não encontrei scripts a venda no momento.`);
            }

            const fields = rows.map((script) => ({
                name: script.name,
                value: "Valor: " + script.price,
            }));
            
            const embed = new MessageEmbed()
                .setTitle(`Scripts (${rows.length})`)
                .setColor(0x00AE86)
                .setTimestamp()
                .addFields(fields)

            return message.channel.send({embeds: [embed]})
            
        })
    }
}