const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const MessageEmbedUtil = require('../utils/MessageEmbed');
const { handleLicense } = require("../services/subsService");

router.post('/', async (req, res) => {
    const client = require('../index');
    try {
        await handleLicense(req)
        res.json({
            message: 'License Authorized!',
            success: true
        });

    } catch(err) {
        const embed = MessageEmbedUtil.create("**Invalid license**","error", `**Error while confirming license**:\n\n\`\`${err}\`\` \n\n**Req Body:** \n\n\`\`\`${JSON.stringify(req.body, null, 2)}\`\`\``);
        client.channels.cache.get(process.env.ADMIN_CHANNEL_ID).send({embeds: [embed]});
        res.status(404).json({
            message: err.message,
            success: false
        });
    }
});

module.exports = router;