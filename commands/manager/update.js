const fs = require("fs");
const request = require("request");

module.exports = {
    name: "update",
    aliases: ['update', 'atualizar'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        if ( !client.config.donos.includes(message.author.id) ) return message.reply("você não é um dos meus criadores!");
        
        if (! args[0] || ! args[1])
            return message.channel.send(':x: **Use !update <script> <valor> <arquivo>**');

        args[1] = parseFloat(args[1])
        if (! Number.isInteger(args[1]))
            return message.channel.send(':x: **Insira um valor válido!**');
        
        if (! message.attachments.first())
            return message.channel.send(':x: **Anexe o arquivo do script!**');
            
        client.db.query (`SELECT name FROM scripts WHERE name = "${args[0]}"`, async (err, rows) => {
            if (! rows || rows.length === 0) {
                return message.channel.send(`:x: **Script não encontrado!** `);
            }

            fs.statSync(`./arquivos/${args[0]}.zip`, (error, exists) => {
                if (error) console.log(error);
                if (! exists) {
                    return message.channel.send(":x: **Arquivo não encontrado, contate um administrador!**")
                }
                fs.unlinkSync(`./arquivos/${args[0]}.zip`, (err) => {
                    if (err) throw err;
                });
            })

            request(message.attachments.first().url).pipe(fs.createWriteStream(`./arquivos/${args[0]}.zip`))

            client.db.query(`UPDATE scripts SET price = ${args[1]} WHERE name = "${args[0]}"`, async (err, rows) => {
                if (rows.affectedRows >= 1) {
                    return message.channel.send(`:white_check_mark: **Script atualizado com sucesso!** `);
                }
            });
        });
    }
};