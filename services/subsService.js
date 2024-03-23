const subsRepository = require("../repositories/subsRepository");
const MessageEmbed = require("../utils/MessageEmbed");
const IP = require('ip');
const MessageEmbedUtil = require("../utils/MessageEmbed");
const client = require("../index");


async function checkLicense(ip, discord_id, script_name) {
    const license = await subsRepository.findByNameAndDiscordId(script_name, discord_id);

    if (!license) {
        throw new Error('License not found');
    }

    if (!license.ip || license.ip !== ip) {
        throw new Error('Invalid IP');
    }

    return license
}

module.exports = {
    handleLicense: async (req) => {
        try {
            const { discord_id, script } = req.body;
            if (! discord_id || ! script) {
                new Error('Invalid request body');
            }
            const ipAddress = IP.address();
            await checkLicense(ipAddress, discord_id, script);
        } catch (error) {
            const embed = MessageEmbedUtil.create("**Erro ao validar licensa**","error", `**Ocorreu um erro ao validar a licensa**:\n\n\`\`${error}\`\` \n\n**Req Body:** \n\n\`\`\`${JSON.stringify(req.body, null, 2)}\`\`\``);
            client.channels.cache.get(process.env.ADMIN_CHANNEL_ID).send({embeds: [embed]});
            throw error;
        }
    }
}