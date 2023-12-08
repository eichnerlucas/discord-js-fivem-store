const discordClient = require("../index");
const ERROR_MESSAGE = 'Erro ao executar o comando.';

const handleInteractionError = async (interaction, error) => {
    console.error(error);
    await interaction.reply({content: ERROR_MESSAGE, ephemeral: true});
};

discordClient.on('interactionCreate', async (interaction) => {
    const {customId} = interaction;
    try {
        await discordClient.interactions.get(customId).run(interaction);
    } catch (error) {
        await handleInteractionError(interaction, error);
    }
});
