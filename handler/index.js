const { glob } = require("glob");
const { promisify } = require("util");
const { Client } = require("discord.js");

const globPromise = promisify(glob);

/**
 * @param {Client} client
 */
module.exports = async (client) => {
    // Commands
    const commandFiles = await globPromise(`${process.cwd()}/commands/**/*.js`);
    commandFiles.map((value) => {
        const file = require(value);
        const splitted = value.split("/");
        const directory = splitted[splitted.length - 2];

        if (file.name) {
            const properties = { directory, ...file };
            client.commands.set(file.name, properties);
        }
    });

    // Events
    const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
    eventFiles.map((value) => require(value));

    // Buttons (ou outros elementos de interação com customId)
    const interactionFiles = await globPromise(`${process.cwd()}/interactions/**/*.js`);
    interactionFiles.map((value) => {
    const file = require(value);

    if (file.customId && file.customId) {
        console.log(`Loading interaction: ${file.customId}`)
      client.interactions.set(file.customId, file);
    }
  });

};
