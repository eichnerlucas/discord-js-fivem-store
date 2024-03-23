const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const MessageEmbedUtil = require('../utils/MessageEmbed');
const { handleLicense } = require("../services/subsService");

router.post('/', async (req, res) => {
    const client = require('../index');
    try {
        await handleLicense(req)
        res.send('License Authorized!');
    } catch(err) {
        const embed = MessageEmbedUtil.create("**Erro ao validar licensa**","error", `**Ocorreu um erro ao validar a licensa**:\n\n\`\`${err}\`\` \n\n**Req Body:** \n\n\`\`\`${JSON.stringify(req.body, null, 2)}\`\`\``);
        client.channels.cache.get(process.env.ADMIN_CHANNEL_ID).send({embeds: [embed]});
        res.status(404).send(err.message);
    }
});

module.exports = router;