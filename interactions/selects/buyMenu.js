
const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton } = require("discord.js");
const mercadopago = require("../../utils/mercadopago.js");
const randString = require("../../utils/generateString.js");
const moment = require('moment-timezone');
const scriptRepository = require("../../repositories/scriptRepository.js");
const client = require("../../index");
const MessageEmbedUtil = require("../../utils/MessageEmbed.js");
const moneyFormat = require("../../utils/moneyFormat.js");
const PaymentStatus = require("../../utils/paymentStatus");

function generateError(ResponseInteraction, errorMessage) {
    const errorEmbed = MessageEmbedUtil.create("**Erro ao Gerar Pedido**", "error", errorMessage);
    ResponseInteraction.editReply({ embeds: [errorEmbed], components: [], files: [] })
}

// Function to  generate SQL Query
function generateSQLQuery(interaction, res, productName, productPrice, payload) {
    return `INSERT INTO payments (discord_id, channel_id, payment_id, external_ref, 
      script, price, status, type, expire_date) VALUES (
      ${interaction.user.id}, 
      ${interaction.channelId}, 
      ${res.response.id},
      "${res.response.external_reference}", 
      "${productName}", 
      "${productPrice}",
      "${PaymentStatus.Pending}", 
      "pix", 
      "${payload.date_of_expiration}"
  );`;
}

async function run(interaction) {
    try {
        const script = await scriptRepository.findByName(interaction.values[0]);

        if (! script) {
            return interaction.reply({ content: `:x: **Este script não existe!**`, ephemeral: true });
        }

        await interaction.deferUpdate()

        const errorEmbed = MessageEmbedUtil.create("**Sucesso**", "success", "Obrigado por criar o pedido, agora insira um **email válido** para a compra, o email será utilizado para notificarmos do seu pagamento!");
        await interaction.editReply({ embeds: [errorEmbed], components: [],  })
        const userEmail = await requestEmail(interaction).catch(console.error);

        const generating = MessageEmbedUtil.create("**Aguarde**", "success", "**Processando pagamento...**");
        await interaction.editReply({ embeds: [generating] })
    
        const { name, price } = script;
        const payload = createPayment(name, price, userEmail)

        const res = await mercadopago.payment.create(payload)

        if (!res) {
            return generateError(interaction,`Ocorreu um erro ao realizar seu pedido, informe a um administrador o erro:\\n\\n\\${error.cause[0].description}`)
        }
        const constructedSQLQuery = generateSQLQuery(interaction, res, name, price, payload);
        client.db.query(constructedSQLQuery);
        const { qr_code, qr_code_base64 } = res.response.point_of_interaction.transaction_data
        const file = new MessageAttachment(new Buffer.from(qr_code_base64, 'base64'), `${payload.external_reference}.png`);
        const embed = new MessageEmbed()
            .setTitle(`**Pagamento Gerado com Sucesso**`)
            .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
            .setDescription(`**Nome do Produto:** \`\`${name}\`\`\n\n**Email:** \`\`${userEmail}\`\`\n\n**Valor:** \`\`${moneyFormat(price)}\`\`\n\n**Método de Pagamento: ** 💰 Pix\n\n**Código PIX:** \`\`${qr_code}\`\`\n\n**🛈**: O pagamento expira em **30 minutos**, antes de efetuar o pagamento verifique se ele ainda está disponível.`)
            .setColor(0x00ae86)
            .setImage(`attachment://${payload.external_reference}.png`)
            .setTimestamp();
        const button = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('cancel-pix')
                    .setLabel('Cancelar Pagamento')
                    .setStyle('DANGER')
                    .setDisabled(false)
                    .setEmoji('🚫')
            );

        client.interactionsData.set(`cancel-pix:${interaction.message.channelId}`, { paymentId: res.response.id });
        await interaction.editReply({ embeds: [embed], files: [file], components: [button] })
        //send message to the interaction channelId
        await client.channels.cache.get(interaction.channelId).send(qr_code);
    } catch (error) {
        generateError(interaction, `**Ocorreu um erro ao realizar seu pedido, informe a um administrador o erro:\n\n${error}\n**`);
    }
}

function createPayment(productName, productPrice, userEmail) {
    const futureDate = moment().tz('America/Sao_Paulo').add(30, 'minutes');
    const formattedDate = futureDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ');

    return {
        transaction_amount: Number(productPrice),
        description: productName,
        payment_method_id: 'pix',
        external_reference: randString(20),
        date_of_expiration: formattedDate,
        payer: {
            email: userEmail,
        },
        notification_url: client.config.mercadopago.notification_url,
    };
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

let botMessage;
async function requestEmail(interaction, attempts = 0) {
    const filter = (m) => m.author.id === interaction.user.id;
    try {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
        const userEmail = collected.first().content;
        const userMessage = collected.first()
        if (validateEmail(userEmail)) {
            if (botMessage) await botMessage.delete(); // delete previous bot response.
            await userMessage.delete();
            return userEmail;
        }
        if (botMessage) {
            await botMessage.delete(); // delete previous bot response.
        }
        await userMessage.delete();
        botMessage = await interaction.followUp({ content: 'O email inserido é inválido, tente novamente:' });
        return await requestEmail(interaction, attempts + 1);
    } catch (error) {
        await interaction.followUp({ content: 'Você não inseriu um e-mail a tempo!' });
        throw new Error('Timeout - Email not provided within the stipulated time.');
    }
}

module.exports = {
    customId: "buy-menu",
    run
};
