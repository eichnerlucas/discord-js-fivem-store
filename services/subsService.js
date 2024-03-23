const subsRepository = require("../repositories/subsRepository");
const MessageEmbed = require("../utils/MessageEmbed");
const IP = require('ip');
const MessageEmbedUtil = require("../utils/MessageEmbed");
const client = require("../index");


async function checkLicense(ip, discord_id, script_name) {
    const license = await subsRepository.findByNameAndDiscordId(script_name, discord_id);

    if (!license[0]) {
        throw new Error('License not found');
    }

    if (!license[0].ip || license[0].ip !== ip) {
        throw new Error('Invalid IP');
    }

    return license[0]
}

module.exports = {
    handleLicense: async (req) => {
        try {
            const { discord_id, script } = req.body;
            if (! discord_id || ! script) {
                throw new Error('Invalid request body');
            }
            const ipAddress = IP.address();
            await checkLicense(ipAddress, discord_id, script);
        } catch (error) {
            throw error;
        }
    }
}