const client = require("../index");

client.on('interactionCreate', async (interaction) => {
    const { customId }  = interaction;
    try {
    	await client.interactions.get(customId).run(interaction);
    } catch (error) {
    	console.error(error);
    	await interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
    }
});
