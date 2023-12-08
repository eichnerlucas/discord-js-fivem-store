const client = require("../index");
const SPACE_PATTERN = / +/g;

function processMessageContent(message) {
    return message.content
        .slice(client.config.prefix.length)
        .trim()
        .split(SPACE_PATTERN);
}

function extractCommandFromMessage(message) {
    const commandName = processMessageContent(message)[0];
    return client.commands.get(commandName.toLowerCase())
        || client.commands.find(command => command.aliases?.includes(commandName.toLowerCase()));
}

client.on("messageCreate", async (message) => {
    if (
        message.author.bot ||
        !message.guild ||
        !message.content.toLowerCase().startsWith(client.config.prefix)
    ) {
        return;
    }
    const command = extractCommandFromMessage(message);
    if (!command) return;
    const commandArguments = processMessageContent(message).slice(1);
    await command.run(client, message, commandArguments);
});
