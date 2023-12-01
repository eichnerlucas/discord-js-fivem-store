const client = require("../index");
const config = require("../config.json");
const mercadopago = require("../utils/mercadopago");

client.on("ready", () => {
    console.log(`${client.user.tag} inicializado!`)
    client.user.setPresence({
        activities: [{ name: 'automatizando compras via MP' }],
        status: 'online', // Status pode ser 'online', 'idle', 'dnd' (não perturbe), ou 'invisible'
        type: 'WATCHING' // Pode ser 'PLAYING', 'STREAMING', 'LISTENING' ou 'WATCHING'
      });
});

