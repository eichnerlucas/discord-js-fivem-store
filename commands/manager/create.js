const fs = require("fs");
const request = require("request");

module.exports = {
    name: "create",
    aliases: ['create', 'criar'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        if ( !client.config.donos.includes(message.author.id) ) return message.reply("você não é um dos meus criadores!");
        
        if (! args[0] || ! args[1])
            return message.channel.send(':x: **Use !create <script> <valor> <arquivo>**');
        
        if (! message.attachments.first())
            return message.channel.send(':x: **Anexe o arquivo do script!**');

        request(message.attachments.first().url).pipe(fs.createWriteStream('./arquivos/' + args[0] + '.zip'))

        client.db.query(`INSERT INTO scripts (name, price) VALUES("${args[0]}", ${args[1]})`, async (err, rows) => {
            if (rows.affectedRows >= 1) {
                return message.channel.send(`:white_check_mark: **Script criado com sucesso!** `);
            }
        });
    }
};
