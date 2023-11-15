const mercadopago = require("../utils/mercadopago");
const paymentRepository = require("../repositories/paymentRepository");

const discordMessages = {
    approved: "<@${discord_id}>, seu pagamento já foi encontrado e sua licença para o script **${script}** já foi gerada, para verificar utilize o comando **!subs**.",
    pending: "Seu pagamento está pendente!",
    rejected: ":x: **Seu pagamento foi rejeitado!**",
};

// Função para atualizar o banco de dados com o status do pagamento
const updateDatabase = async (client, payment_id, status) => {
    try {
        client.db.query('UPDATE payments SET status = ? WHERE payment_id = ?', [status, payment_id]);
        console.log(`Database updated for payment_id: ${payment_id} - Status: ${status}`);
    } catch (error) {
        console.error('Error updating database:', error);
        throw error;
    }
};

// Função para enviar mensagem no canal do Discord
const sendDiscordMessage = (client, channel_id, message) => {
    try {
        const channel = client.channels.cache.get(channel_id);
        channel.send(message);
        console.log('Discord message sent:', message);
    } catch (error) {
        console.error('Error sending Discord message:', error);
        throw error;
    }
};

const createSubscription = (client, discord_id, script) => {
    try {
        client.db.query(`INSERT INTO subs (discord_id, script) VALUES("${discord_id}", "${script}")`)
        console.log('Subscription created:', script);
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
}


module.exports = {
    handleNotification: async (client, req) => {
        const payment_id = req.data.id;

        try {

            if (! payment_id || req.action === "payment.created" ) {
                return null;
            }

            paymentRepository.findById(client, payment_id, async (err, rows) =>{

                const payment = await mercadopago.payment.findById(payment_id);

                if (payment.response.status === "pending") {
                    console.log('Payment is pending, returning...');
                    return;
                }

                const discordId = rows[0].discord_id;
                const script = rows[0].script;

                // Atualizar o banco de dados com o status do pagamento
                await updateDatabase(client, payment_id, payment.response.status);

                // Enviar mensagem no canal do Discord com o status do pagamento
                let discordMessage = discordMessages[payment.response.status];

                discordMessage = discordMessage.replace("${discord_id}", discordId).replace("${script}", script);

                sendDiscordMessage(client, rows[0].channel_id, discordMessage);

                createSubscription(client, discordId, script)
            })

            
        } catch (error) {
            console.error(error);
        }
    },
};
