const mercadopago = require("../utils/mercadopago");
const paymentRepository = require("../repositories/paymentRepository");
const subsRepository = require("../repositories/subsRepository");
const MessageEmbed = require("../utils/MessageEmbed");

const discordMessages = {
    approved: "<@${discord_id}>, seu pagamento já foi encontrado e sua licença para o script **${script}** já foi gerada, para verificar utilize o comando **!subs**.",
    pending: "Seu pagamento está pendente!",
    rejected: ":x: **Seu pagamento foi rejeitado!**",
};

// Função para atualizar o banco de dados com o status do pagamento
const updateDatabase = async (payment_id, status) => {
    try {
        await paymentRepository.updateStatus(payment_id, status);
        console.log(`Database updated for payment_id: ${payment_id} - Status: ${status}`);
    } catch (error) {
        console.error('Error updating database:', error);
        throw error;
    }
};

// Função para enviar mensagem no canal do Discord
const sendDiscordMessage = async (channel_id, message) => {
    try {
        const client = require('../index');

        const channel = client.channels.cache.get(channel_id);

        const messages = await channel.messages.fetch({ limit: 1 });

        const botMessage = messages.filter(msg => msg.author.id === client.user.id);

        if (! botMessage) {
            return message.reply('Não foi possível encontrar a última mensagem enviada pelo bot.');
        }

        const embed = MessageEmbed("**Pagamento aprovado!**", "success", message);
        await botMessage.edit({ embeds: [embed], files: [], components: [] });
        console.log('Discord message sent:', message);
    } catch (error) {
        console.error('Error sending Discord message:', error);
        throw error;
    }
};

const createSubscription = (discord_id, script) => {
    try {
        subsRepository.createSubscription(discord_id, script);
        console.log('Subscription created:', script);
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
}


module.exports = {
    handleNotification: async (req) => {
        try {
            const payment_id = req.data.id;

            if (!payment_id || req.action === "payment.created") {
                return null;
            }

            const payment = await paymentRepository.findById(payment_id)

            const paymentMP = await mercadopago.payment.findById(payment_id);

            // if (paymentReq.response.status === "pending") {
            //     console.log('Payment is pending, returning...');
            //     return;
            // }

            const discordId = payment[0].discord_id;
            const script = payment[0].script;

            // Atualizar o banco de dados com o status do pagamento
            await updateDatabase(payment_id, paymentMP.response.status);

            // Enviar mensagem no canal do Discord com o status do pagamento
            let discordMessage = discordMessages[paymentMP.response.status];

            discordMessage = discordMessage.replace("${discord_id}", discordId).replace("${script}", script);

            sendDiscordMessage(payment[0].channel_id, paymentMP.response.status);

            createSubscription(discordId, script);
        } catch (error) {
            throw error;
        }
    },
};
