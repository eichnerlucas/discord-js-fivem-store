const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const MessageEmbedUtil = require('../utils/MessageEmbed');
const client = require('../index');

router.post('/', async (req, res) => {
    const client = require('../index');
        try {
            const { body } = req;
            await paymentService.handleNotification(body);
            res.send('Ok');
        } catch(err) {
            const embed = MessageEmbedUtil.create("**Error processing payment**","error", `**Error while processing payment**:\n\n\`\`${err}\`\` \n\n**Req Body:** \n\n\`\`\`${JSON.stringify(req.body, null, 2)}\`\`\``);
            client.channels.cache.get(process.env.ADMIN_CHANNEL_ID).send({embeds: [embed]});
            res.status(500).send('Internal Server Error');
        }
    }
);

module.exports = router;