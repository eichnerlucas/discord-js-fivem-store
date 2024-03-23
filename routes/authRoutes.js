const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const MessageEmbedUtil = require('../utils/MessageEmbed');
const client = require('../index');
const { handleLicense } = require("../services/subsService");

router.post('/', async (req, res) => {
    try {
        await handleLicense(req)
        res.send('License Authorized!');
    } catch(err) {
        res.status(404).send(err);
    }
});

module.exports = router;