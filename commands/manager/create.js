const fs = require("fs");
const request = require("request");

const PERMISSION_DENIED_MSG = "você não é um dos meus criadores!";
const INVALID_ARGS_MSG = ':x: **Use !create <script> <valor> e anexe um arquivo!**';
const MISSING_ATTACHMENT_MSG = ':x: **Anexe o arquivo do script!**';
const SCRIPT_CREATION_SUCCESS_MSG = ':white_check_mark: **Script criado com sucesso!** `';

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
        // check user permissions
        if (!client.config.owners.includes(message.author.id)) return message.reply(PERMISSION_DENIED_MSG);
        if (!args[0] || !args[1]) return message.channel.send(INVALID_ARGS_MSG);
        if (!message.attachments.first()) return message.channel.send(MISSING_ATTACHMENT_MSG);

        handleScriptFile(message.attachments.first().url, args[0]);

        await insertScriptRecord(client, args, message);
    }
};

function handleScriptFile(fileUrl, scriptName) {
    let targetPath = `./files/${scriptName}.zip`;
    request(fileUrl).pipe(fs.createWriteStream(targetPath));
}

async function insertScriptRecord(client, args, message) {
    let scriptName = args[0];
    let scriptPrice = args[1];

    let insertQuery = `INSERT INTO scripts (name, price) VALUES("${scriptName}", ${scriptPrice})`;

    client.db.query(insertQuery, async (err, rows) => {
        if (rows && rows.affectedRows >= 1) {
            return message.channel.send(SCRIPT_CREATION_SUCCESS_MSG);
        }
    });
}
