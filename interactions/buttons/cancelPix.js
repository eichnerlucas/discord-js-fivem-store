const client = require("../../index");
const mercadopago = require("../../utils/mercadopago.js");
const MessageEmbedUtil = require("../../utils/MessageEmbed.js");
const paymentRepository = require("../../repositories/paymentRepository.js");

// Extracted function
const editReplyWithEmbed = async (interaction, embedMessage) => {
    await interaction.editReply({
        embeds: [embedMessage],
        components: [],
        files: []
    });
};

async function run(interaction) {
    try {
        const generatingEmbedMessage = MessageEmbedUtil.create("**Aguarde**", "success", "**Cancelando pagamento...**");
        await interaction.deferUpdate();

        await editReplyWithEmbed(interaction, generatingEmbedMessage);

        const { paymentId } = client.interactionsData.get(interaction.customId + `:${interaction.message.channelId}`);
        const response = await mercadopago.payment.cancel(paymentId);
        const { status, external_reference } = response.response;

        await paymentRepository.updateStatusByExternalRef(external_reference, status);

        const canceledEmbedMessage = MessageEmbedUtil.create("**Pedido cancelado com sucesso**", "success", `**Lamentamos que não tenha dado tudo certo na sua compra, esperamos vê-lo em breve...**`);

        await editReplyWithEmbed(interaction, canceledEmbedMessage);

        client.interactionsData.delete(interaction.customId + `:${interaction.message.channelId}`);
    } catch (error) {
        const errorEmbed = MessageEmbedUtil.create("**Erro ao Cancelar Pagamento**", "error", `**Ocorreu um erro ao cancelar seu pedido, informe a um administrador o erro:\n\`\`${error}\`\`**`);
        await editReplyWithEmbed(interaction, errorEmbed);
    }
}

module.exports = {
    customId: 'cancel-pix',
    run
}