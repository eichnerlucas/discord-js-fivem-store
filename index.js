const { Client, Collection, MessageEmbed } = require("discord.js");
const express = require('express');
const bodyParser = require('body-parser');
const paymentService = require('./services/paymentService.js');
const Database = require('./database.js');
const config = require('./config.json');
const MessageEmbedUtil = require('./utils/MessageEmbedUtil.js');
const app = express()
const port = 80

// Configurar o middleware Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({
    intents: 32767,
});

// Global Variables
client.commands = new Collection();
client.interactions = new Collection();
client.interactionsData = new Collection();
client.slashCommands = new Collection();
client.config = require("./config.json");

const databaseData = {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name
}

client.db = new Database(databaseData); //Inicia a database, e salva ela no client

// Initializing the project
require("./handler")(client);

app.post('/notifications', async (req, res) => {
    try {
        const { body } = req;
        paymentService.handleNotification(body);
        res.send('Ok');
    } catch (error) {
        const embed = MessageEmbedUtil.create("**Erro ao processar webhook**","error", `**Ocorreu um erro ao processar o webhook**:\n\n\`\`${error}\`\` \n\n**Req Body:** \n\n\`\`\`${JSON.stringify(req.body, null, 2)}\`\`\``);
        client.channels.cache.get(client.config.adminChannel).send({embeds: [embed]});
        res.status(500).send('Internal Server Error');
    }
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

client.login(client.config.token);

module.exports = client;

// Handles errors and avoids crashes, better to not remove them.
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

