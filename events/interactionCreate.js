const client = require("../index");
const buyMenu = require("../interactions/select/buyMenu.js");

client.on('interactionCreate', async (interaction) => {
    const { customId }  = interaction;
    try {
        if (interaction.isSelectMenu()) {
            await client.interactions.get(customId).run(interaction);
        }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
    }
  });
