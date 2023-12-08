const discordClient = require("../index");

const activity = {
    activities: [{name: 'automatizando compras via MP'}],
    status: 'online',
    type: 'WATCHING'
};

function startDiscordClient() {
    console.log(`${discordClient.user.tag} initialized!`)
    discordClient.user.setPresence(activity);
}

discordClient.on("ready", startDiscordClient);

