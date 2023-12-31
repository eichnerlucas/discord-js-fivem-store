const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const MessageEmbedUtil = require('../utils/MessageEmbed');
const client = require('../index');

router.post('/', async (req, res) => {
        try {
            const { body } = req;
            await paymentService.handleNotification(body);
            res.send('Ok');
        } catch(err) {
            const embed = MessageEmbedUtil.create("**Erro ao processar webhook**","error", `**Ocorreu um erro ao processar o webhook**:\n\n\`\`${error}\`\` \n\n**Req Body:** \n\n\`\`\`${JSON.stringify(req.body, null, 2)}\`\`\``);
            client.channels.cache.get(client.config.adminChannel).send({embeds: [embed]});
            res.status(500).send('Internal Server Error');
        }
    }
);

module.exports = router;