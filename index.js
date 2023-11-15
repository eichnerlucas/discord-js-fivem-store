const { Client, Collection } = require("discord.js");
const express = require('express');
const bodyParser = require('body-parser');
const paymentService = require('./services/paymentService.js');
const app = express()
const port = 80

// Configurar o middleware Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({
    intents: 32767,
});

module.exports = client;

// Global Variables
client.commands = new Collection();
client.slashCommands = new Collection();
client.config = require("./config.json");

const MysqlManager = require('./database.js');

new MysqlManager(client, client.config); //Inicia a database, e salva ela no client

// Initializing the project
require("./handler")(client);

client.login(client.config.token);

app.post('/notifications', async (req, res) => {
    paymentService.handleNotification(client, req.body);
    res.send('Ok');
})


app.listen(port, () => console.log(`App listening on port ${port}!`))

