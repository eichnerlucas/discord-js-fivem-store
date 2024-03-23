const subsRepository = require("../repositories/subsRepository");
const MessageEmbed = require("../utils/MessageEmbed");
const IP = require('ip');
const MessageEmbedUtil = require("../utils/MessageEmbed");


async function checkLicense(ip, discord_id, script_name) {
    const client = require("../index");
    const license = await subsRepository.findByNameAndDiscordId(script_name, discord_id);

    if (!license[0]) {
        throw new Error('License not found');
    }

    if (!license[0].ip || license[0].ip !== ip) {
        throw new Error('Invalid IP');
    }

    client.channels.cache.get(process.env.ADMIN_CHANNEL_ID).send({embeds: [MessageEmbed.create("**License Authorized!**", "success", `**Discord ID:**\n\`\`\`${discord_id}\`\`\` \n**IP:**\n\`\`\`${ip}\`\`\` \n**Script:** \n\`\`\`${script_name}\`\`\``)]});
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