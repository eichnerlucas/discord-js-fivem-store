const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton } = require("discord.js");
const mercadopago = require("../../utils/mercadopago.js");
const randString = require("../../utils/generateString.js");
const moment = require('moment-timezone');
const scriptRepository = require("../../repositories/scriptRepository.js");
const client = require("../../index");
const MessageEmbedUtil = require("../../utils/MessageEmbed.js");
const moneyFormat = require("../../utils/moneyFormat.js");
const PaymentStatus = require("../../utils/paymentStatus");

// Extracted constant values
const PENDING_PAYMENT_STATUS = PaymentStatus.Pending;
const PIX_PAYMENT_METHOD = "pix";
const REQUEST_EMAIL_ERR = "Timeout - Email not provided within the stipulated time.";
const AGUARDE_MESSAGE = "Aguarde";
const ERROR_TYPE = "error";
const SUCCESS_TYPE = "success";
const ERROR_TITLE = "**Erro ao Gerar Pedido**";

function generateError(ResponseInteraction, errorMessage) {
    const errorEmbed = MessageEmbedUtil.create(ERROR_TITLE, ERROR_TYPE, errorMessage);
    ResponseInteraction.editReply({ embeds: [errorEmbed], components: [], files: [] });
}

function generateSQLQuery(interaction, paymentResult, productName, productPrice, payload) {
    return `INSERT INTO payments (discord_id, channel_id, payment_id, external_ref, 
      script, price, status, type, expire_date) VALUES (
      ${interaction.user.id}, 
      ${interaction.channelId}, 
      ${paymentResult.response.id},
      "${paymentResult.response.external_reference}", 
      "${productName}", 
      "${productPrice}",
      "${PENDING_PAYMENT_STATUS}", 
      "pix", 
      "${payload.date_of_expiration}"
  );`;
}

async function run(interaction) {
    try {
        const selectedScript = await scriptRepository.findByName(interaction.values[0]);
        if (!selectedScript) {
            return interaction.reply({ content: ":x: **Este script não existe!**", ephemeral: true });
        }
        await interaction.deferUpdate()
        const successEmbed = MessageEmbedUtil.create("Insira um email válido!", SUCCESS_TYPE, "Obrigado por criar o pedido, agora insira um **email válido** para a compra, o email será utilizado para notificarmos do seu pagamento!");
        await interaction.editReply({ embeds: [successEmbed], components: [],  });
        const userEmail = await requestEmail(interaction).catch(console.error);
        const generating = MessageEmbedUtil.create(AGUARDE_MESSAGE, SUCCESS_TYPE, "**Processando pagamento...**");
        await interaction.editReply({ embeds: [generating] });

        const { name, price } = selectedScript;
        const paymentParameters = createPayment(name, price, userEmail);
        const paymentResult = await mercadopago.payment.create(paymentParameters);
        if (!paymentResult) {
            return generateError(interaction, `Ocorreu um erro ao realizar seu pedido, informe a um administrador o erro:\\n\\n\\${error.cause[0].description}`);
        }
        const constructedSQLQuery = generateSQLQuery(interaction, paymentResult, name, price, paymentParameters);
        client.db.query(constructedSQLQuery);
        const { qr_code, qr_code_base64 } = paymentResult.response.point_of_interaction.transaction_data;
        const file = new MessageAttachment(new Buffer.from(qr_code_base64, "base64"), `${paymentParameters.external_reference}.png`);
        const embed = MessageEmbedUtil.create(`**Pagamento Gerado com Sucesso**`, "success", constructEmbedDescription(name, userEmail, price, qr_code), null, `attachment://${paymentParameters.external_reference}.png`)
        const button = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId("cancel-pix")
                    .setLabel("Cancelar Pagamento")
                    .setStyle("DANGER")
                    .setDisabled(false)
                    .setEmoji("🚫")
            );
        client.interactionsData.set(`cancel-pix:${interaction.message.channelId}`, { paymentId: paymentResult.response.id });
        await interaction.editReply({ embeds: [embed], files: [file], components: [button] })
        await client.channels.cache.get(interaction.channelId).send(qr_code);
    } catch (error) {
        generateError(interaction, `**Ocorreu um erro ao realizar seu pedido, informe a um administrador o erro:\n\n${error}\n**`);
    }
}

function createPayment(productName, productPrice, userEmail) {
    const futureDate = getFutureDate();
    const formattedDate = formatDate(futureDate);

    return createPayload(productName, productPrice, userEmail, formattedDate);
}

function getFutureDate() {
    return moment().tz("America/Sao_Paulo").add(30, "minutes");
}

function formatDate(date) {
    return date.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}

function createPayload(productName, productPrice, userEmail, formattedDate) {
    return {
        transaction_amount: Number(productPrice),
        description: productName,
        payment_method_id: PIX_PAYMENT_METHOD,
        external_reference: randString(20),
        date_of_expiration: formattedDate,
        payer: { email: userEmail, },
        notification_url: client.config.mercadopago.notification_url,
    };
}

function constructEmbedDescription(name, userEmail, price, qr_code) {
    return `**Nome do Produto:** \`\`${name}\`\`\n\n**Email:** \`\`${userEmail}\`\`\n\n**Valor:** \`\`${moneyFormat(price)}\`\`\n\n**Método de Pagamento: ** 💰 Pix\n\n**Código PIX:** \`\`${qr_code}\`\`\n\n**🛈**: O pagamento expira em **30 minutos**, antes de efetuar o pagamento verifique se ele ainda está disponível.`;
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

let botMessage;
async function requestEmail(interaction, attempts = 0) {
    const filter = (m) => m.author.id === interaction.user.id;
    try {
        const userMessage = await getUserEmail(interaction, filter);
        const userEmail = userMessage.content
        if (validateEmail(userEmail)) {
            if (botMessage) await botMessage.delete();
            await userMessage.delete();
            return userEmail;
        }
        if (botMessage) {
            await botMessage.delete();
        }
        await userMessage.delete();
        botMessage = await interaction.followUp({ content: "O email inserido é inválido, tente novamente:" });
        return await requestEmail(interaction, attempts + 1);
    } catch (error) {
        await interaction.followUp({ content: "Você não inseriu um e-mail a tempo!" });
        throw new Error(REQUEST_EMAIL_ERR);
    }
}

async function getUserEmail(interaction, filter) {
    const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] });
    return collected.first();
}

module.exports = {
    customId: "buy-menu",
    run
};