const client = require("../index");
const buyMenu = require("../interactions/buyMenu.js");

client.on("interactionCreate", async (interaction) => {
    // Select Menu Handling
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'buy_menu') {
        return buyMenu.handleInteraction(interaction);
    }

    return interaction.reply({ content: `:x: **Este menu não existe!**`, ephemeral: true });

});
