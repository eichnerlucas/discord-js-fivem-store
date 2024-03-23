const { Client, Collection } = require("discord.js");
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('./database.js');
const expiredPayments = require('./schedules/expiredPayments.js');
const notificationRoutes = require('./routes/notificationRoutes');
const authRoutes = require('./routes/authRoutes');


// Initialize express app and port from environment variable or default value
const app = express();
// Default to HTTP Port if not specified
const port = 80;

const client = new Client({
    intents: 32767,
});

// Global Variables
client.commands = new Collection();
client.interactions = new Collection();
client.interactionsData = new Collection();
client.slashCommands = new Collection();

const databaseData = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
}

client.db = new Database(databaseData); //Inicia a database, e salva ela no client

// Initializing the project
require("./handler")(client);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/notifications', notificationRoutes);

app.use('/auth', authRoutes);

expiredPayments();

app.listen(port, () => console.log(`App listening on port ${port}!`))

client.login(process.env.TOKEN);

module.exports = client;

// Handles errors and avoids crashes, better to not remove them.
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

