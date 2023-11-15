const client = require("../index");
const config = require("../config.json");
const mercadopago = require("../utils/mercadopago");

client.on("ready", () => {
    console.log(`${client.user.tag} is up and ready to go!`)
    client.user.setPresence({ activities: [{ name: 'licenses' }] });
});

