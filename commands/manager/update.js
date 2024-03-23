const fs = require('fs');
const fsPromises = require('fs').promises;
const request = require("request");
const path = require("path");

const SCRIPT_NOT_FOUND_MSG = ':x: **Script não encontrado!** '
const SCRIPT_UPDATE_SUCCESS_MSG = ':white_check_mark: **Script atualizado com sucesso!** '
const NOT_DEVELOPER_MSG = "Você não é um dos meus desenvolvedores!";
const USAGE_MSG = ':x: **Use !update <script> <valor> <arquivo>**';
const ATTACH_FILE_MSG = ':x: **Anexe um arquivo!**';

const FILE_NON_EXISTING = ':x: **Arquivo não encontrado, ele realmente existe?!**';

module.exports = {
    name: "update",
    aliases: ['update', 'atualizar'],
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        if (process.env.OWNERS !== message.author.id) return message.reply(NOT_DEVELOPER_MSG);

        const [scriptName, updatedPrice] = extractScriptNameAndPrice(args);

        if (!scriptName || isNaN(updatedPrice)) return message.channel.send(USAGE_MSG);

        if (!await isScriptExists(scriptName, client)) return message.channel.send(SCRIPT_NOT_FOUND_MSG);

        const filePath = path.resolve(process.cwd(), 'files', `${scriptName}.zip`);
        if (!message.attachments.first()) {
            return message.channel.send(ATTACH_FILE_MSG);
        }

        if (!await doesFileExist(filePath)) {
            return message.channel.send(FILE_NON_EXISTING);
        }

        await updateScriptVersionAndPrice(message, updatedPrice, filePath, scriptName, client);

        return message.channel.send(SCRIPT_UPDATE_SUCCESS_MSG);
    },
};

function extractScriptNameAndPrice(args) {
    let scriptName = args[0];
    let updatedPrice = parseFloat(args[1]);
    return [scriptName, updatedPrice];
}

async function isScriptExists(scriptName, client) {
    let scriptQueryResult = await client.db.getScriptByName(scriptName);
    return scriptQueryResult && scriptQueryResult.length !== 0;
}

async function updateScriptVersionAndPrice(message, updatedPrice, filePath, scriptName, client) {
    await deleteScriptFile(filePath);
    await downloadFile(message.attachments.first().url, filePath);
    await client.db.updateScriptPrice(scriptName, updatedPrice);
}

async function doesFileExist(filePath) {
    try {
        await fsPromises.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function deleteScriptFile(filePath) {
    try {
        await fsPromises.unlink(filePath);
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