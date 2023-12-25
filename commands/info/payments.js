const { MessageEmbed } = require("discord.js");
const moneyFormat = require('./../../utils/moneyFormat');
const MessageEmbedUtil = require('../../utils/MessageEmbed');
const EMPTY_PAYMENTS_MSG = "**Empty Payments**";
const PAYMENTS_PAGE_TITLE = "Payments Page: ";
const SUCCESS_COLOR = '#0099ff';
const LIMIT = 5;
const REACTIONS = ['⬅️', '➡️'];
const REACTION_TIME = 60000;

module.exports = {
    name: "payments",
    aliases: ['pagamentos', 'payment'],
    run: async (client, message, args) => {
        let page = 1;
        let offset = (page - 1) * LIMIT;
        const discordUserId = message.author.id;
        let collector;

        const fetchPayments = () => getPayments(client, discordUserId, offset);
        const updateEmbed = async (msg) => updateMessageEmbed(msg, fetchPayments, page);

        try {
            const embed = MessageEmbedUtil.create("Loading payments...", "success")
            const msg = await message.channel.send({ embeds: [embed]});
            await makeReactions(msg);
            await updateEmbed(msg);
            collector = msg.createReactionCollector({
                filter: (reaction, user) => REACTIONS.includes(reaction.emoji.name) && !user.bot,
                time: REACTION_TIME,
            });
            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === REACTIONS[0]) {
                    if (page > 1) {
                        page--;
                        offset = (page - 1) * LIMIT;
                        await updateEmbed(msg);
                    }
                } else {
                    page++;
                    offset = (page - 1) * LIMIT;
                    await updateEmbed(msg);
                }
                await reaction.users.remove(user.id);
            });
            collector.on('end', () => {
                msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
            });
        } catch (error) {
            console.error('Error sending/embedding message:', error);
        }
    },
};

function getPayments(client, discordUserId, offset) {
    return new Promise((resolve, reject) => {
        client.db.query('SELECT payment_id, script, status, type, price FROM payments WHERE discord_id = ? ORDER BY id DESC LIMIT ?, ?', [discordUserId, offset, LIMIT], (err, results) => {
            if (err) reject(err);
            else if(results.length === 0) resolve('No payments found');
            else resolve(results);
        });
    });
}

function formatPaymentDescription(results) {
    return results.map(result => `Payment ID: **${result.payment_id}**\nScript: ${result.script}\nValue: ${moneyFormat(result.price)}\nStatus: ${result.status}\nType: ${result.type}`).join('\n\n');
}

async function updateMessageEmbed(msg, fetchPayments, page) {
    try {
        const results = await fetchPayments();

        if (typeof results === 'string') {
            const embed = MessageEmbedUtil.create(EMPTY_PAYMENTS_MSG, "error", "No payments were found for your DiscordId")
            await msg.edit({ embeds: [embed] });
            await msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
        } else {
            const desc = formatPaymentDescription(results);
            const embed = MessageEmbedUtil.create(PAYMENTS_PAGE_TITLE + page, "success", desc)
            await msg.edit({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error fetching payments:', error);
    }
}

async function makeReactions(msg) {
    for (let i = 0; i < REACTIONS.length; i++) {
        await msg.react(REACTIONS[i]);
    }
}