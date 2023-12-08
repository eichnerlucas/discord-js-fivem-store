const {glob} = require('glob');
const {promisify} = require('util');
const globPromise = promisify(glob);

function retrieveDirectoryName(path) {
    const pathParts = path.split('/');
    return pathParts[pathParts.length - 2];
}

async function loadFiles(client, path, callback) {
    const files = await globPromise(`${process.cwd()}/${path}`);
    return files.map(callback);
}

function handleCommand(client, path) {
    const file = require(path);
    const directory = retrieveDirectoryName(path);
    if (file.name) {
        const properties = {directory, ...file};
        client.commands.set(file.name, properties);
    }
}

function handleInteraction(client, path) {
    const file = require(path);
    if (file.customId) {
        console.log(`Loading interaction: ${file.customId}`);
        client.interactions.set(file.customId, file);
    }
}

/*
 * Exported function now with extracted functions,
 * explict intent, and reduced boilerplate.
 */
module.exports = async (client) => {
    await loadFiles(client, 'commands/**/*.js', (path) => handleCommand(client, path));
    await loadFiles(client, 'events/*.js', require);
    await loadFiles(client, 'interactions/**/*.js', (path) => handleInteraction(client, path));
};
