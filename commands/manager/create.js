const fs = require("fs");
const request = require("request");
const {pipeline} = require('stream');
const util = require('util');
const pipelineAsync = util.promisify(pipeline);

const PERMISSION_DENIED_MSG = "você não é um dos meus criadores!";
const INVALID_ARGS_MSG = ':x: **Use !create <script> <valor> e anexe um arquivo!**';
const MISSING_ATTACHMENT_MSG = ':x: **Anexe o arquivo do script!**';
const SCRIPT_CREATION_SUCCESS_MSG = ':white_check_mark: **Script criado com sucesso!** `';
const SCRIPT_CREATION_ERROR = ':x: **Erro ao criar o script!**';
const NON_ZIP_FILE_MSG = ':x: **Apenas arquivos ZIP são permitidos!**';

module.exports = {
    name: "create",
    aliases: ['create', 'criar'],
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} scriptParams
     */
    run: async (client, message, scriptParams) => {
        checkUserPermissions(client, message);
        validateScriptDetails(scriptParams, message);
        await handleScriptFileDownloadAndScriptCreation(client, scriptParams, message);
    }
};

function checkUserPermissions(client, message) {
    if (!client.config.owners.includes(message.author.id)) {
        message.reply(PERMISSION_DENIED_MSG);
        throw new Error(PERMISSION_DENIED_MSG);
    }
}

function validateScriptDetails(scriptParams, message) {
    if (!scriptParams[0] || !scriptParams[1] || !message.attachments.first()) {
        const errorMsg = !scriptParams[0] || !scriptParams[1] ? INVALID_ARGS_MSG : MISSING_ATTACHMENT_MSG;
        message.channel.send(errorMsg);
        throw new Error(errorMsg);
    }
}

async function handleScriptFileDownloadAndScriptCreation(client, scriptParams, message) {
    try {
        const attachment = message.attachments.first();
        validateFileIsZip(attachment.name, message);
        await handleScriptFile(attachment.url, scriptParams[0]);
        const script = await insertScriptRecord(client, scriptParams);
        if (!script) message.channel.send(SCRIPT_CREATION_ERROR);
        message.channel.send(SCRIPT_CREATION_SUCCESS_MSG + scriptParams[0] + '`');
        return true;
    } catch (err) {
        sendErrorMsgOnScriptCreationFailure(message);
    }
}

async function handleScriptFile(fileUrl, scriptName) {
    try {
        const targetPath = `./files/${scriptName}.zip`;
        await pipelineAsync(
            request(fileUrl),
            fs.createWriteStream(targetPath)
        );
    } catch (error) {
        console.error('Algo deu errado ao criar o arquivo:', error.stack);
        throw error;
    }
}

async function insertScriptRecord(client, scriptParams) {
    const scriptName = scriptParams[0];
    const scriptPrice = scriptParams[1];
    try {
        await client.db.createScript(scriptName, scriptPrice);
        return true
    } catch (e) {
        return false;
    }
}

function sendErrorMsgOnScriptCreationFailure(message) {
    message.channel.send(SCRIPT_CREATION_ERROR);
}

function validateFileIsZip(fileName, message) {
    const fileExtension = fileName.split('.').pop();
    if(fileExtension !== 'zip') {
        const errorMsg = NON_ZIP_FILE_MSG;
        message.channel.send(errorMsg);
        throw new Error(errorMsg);
    }
}