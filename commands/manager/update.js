const fs = require("fs").promises;
const request = require("request");
const path = require("path");

module.exports = {
    name: "update",
    aliases: ['update', 'atualizar'],
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        if (!client.config.owners.includes(message.author.id)) return message.reply("You're not one of my developers!");

        let scriptName = args[0];
        let newPrice = parseFloat(args[1]);

        if (!scriptName || isNaN(newPrice)) {
            return message.channel.send(':x: **Use !update <script> <valor> <arquivo>**');
        }

        let scriptQueryResult = await client.db.getScriptByName(scriptName);
        if (!scriptQueryResult || scriptQueryResult.length === 0) {
            return message.channel.send(`:x: **Script not found!** `);
        }

        let filePath = path.join(__dirname, 'files', `${scriptName}.zip`);
        let fileExists = await checkFileExistence(filePath);
        if (!message.attachments.first() || !fileExists) {
            return message.channel.send(':x: **Attach the script file!**');
        }

        await deleteFile(filePath);
        await downloadFile(message.attachments.first().url, filePath);
        await client.db.query(`UPDATE scripts SET price = ? WHERE name = ?`, [newPrice, scriptName]);
        return message.channel.send(`:white_check_mark: **Script successfully updated!** `);
    },
};

async function checkFileExistence(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
    } catch (err) {
        throw err;
    }
}

function downloadFile(url, path) {
    return new Promise((resolve, reject) => {
        request(url)
            .pipe(fs.createWriteStream(path))
            .on('finish', resolve)
            .on('error', reject);
    });
}