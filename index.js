const { Client, Collection, MessageEmbed } = require("discord.js");
const express = require('express');
const bodyParser = require('body-parser');
const paymentService = require('./services/paymentService.js');
const Database = require('./database.js');
const config = require('./config.json');
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

client.db = new Database(config.database.user, config.database.password, config.database.name, config.database.host); //Inicia a database, e salva ela no client

// Initializing the project
require("./handler")(client);

app.post('/notifications', async (req, res) => {
    try {
        const { body } = req;
        paymentService.handleNotification(body);
        res.send('Ok');
    } catch (error) {
        console.log(error);
        const embed = new MessageEmbed()
            .setTitle(`**Erro ao processar webhook**`)
            .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
            .setDescription(`**Ocorreu um erro ao processar o webhook**:\n\n\`\`${error}\`\` \n**Req Body:** \n\n\`\`\`${JSON.stringify(req.body, null, 2)}\`\`\``)
            .setColor(0x00ae86)
            .setTimestamp();
        client.channels.cache.get(client.config.adminChannel).send({embeds: [embed]});
        res.status(500).send('Error');
    }
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

client.login(client.config.token);

