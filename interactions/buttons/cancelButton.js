const client = require("../../index");
const mercadopago = require("../../utils/mercadopago.js");
const MessageEmbedUtil = require("../../utils/MessageEmbedUtil.js");
const paymentRepository = require("../../repositories/paymentRepository.js");

async function run(interaction) {
    try {
        const generating = MessageEmbedUtil.create("**Aguarde**", "success", "**Cancelando pagamento...**");
        await interaction.deferUpdate();
    
        await interaction.editReply({
            embeds: [generating],
            components: [],
            files: []
        });
    
        const { paymentId } = client.interactionsData.get(interaction.customId + `:${interaction.message.channelId}`);
        const response = await mercadopago.payment.cancel(paymentId);
        const { status, external_reference } = response.response;
    
        paymentRepository.updateStatusByExternalRef(external_reference, status);
    
        const canceled = MessageEmbedUtil.create("**Pedido cancelado com sucesso**", "success", `**Lamentamos que não tenha dado tudo certo na sua compra, esperamos vê-lo em breve...**`);
    
        // Editar a resposta original
        await interaction.editReply({
            embeds: [canceled],
            components: [],
            files: []
        });
    
        client.interactionsData.delete(interaction.customId + `:${interaction.channelId}`);
    } catch (error) {
        const errorEmbed = MessageEmbedUtil.create("**Erro ao Cancelar Pagamento**", "error", `**Ocorreu um erro ao cancelar seu pedido, informe a um administrador o erro:\n\`\`${error}\`\`**`);
        interaction.editReply({ embeds: [errorEmbed], components: [], files: [] });
    }
}

module.exports = { 
    customId: 'cancel-pix',
    run
 }