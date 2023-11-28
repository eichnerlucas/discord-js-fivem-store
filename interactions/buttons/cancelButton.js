const client = require("../../index");
const mercadopago = require("../../utils/mercadopago.js");
const MessageEmbedUtil = require("../../utils/MessageEmbedUtil.js");

async function run(interaction) {
    const { paymentId } = client.interactionsData.get(interaction.customId);
    const response = await mercadopago.payment.cancel(paymentId)
    const { status, external_reference } = response.response
    client.db.query(`UPDATE payments SET status = "${status}" WHERE external_ref = "${external_reference}";`)
    const canceled = MessageEmbedUtil.create("**Pedido cancelado com sucesso**", "success", `**Lamentamos que não tenha dado tudo certo na sua compra, esperamos vê-lo em breve...**`);
    await interaction.deferUpdate()
    interaction.editReply({ embeds: [canceled], components: [], files: [] })
    client.interactionsData.delete(interaction.customId);
}

module.exports = { 
    customId: 'cancel-pix',
    run
 }