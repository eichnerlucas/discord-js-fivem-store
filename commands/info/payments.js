const { MessageEmbed } = require("discord.js");
const moneyFormat = require('./../../utils/moneyFormat')

module.exports = {
    name: "payments",
    aliases: ['pagamentos', 'payment'],

    run: async (client, message, args) => {
        let page = 1;
        const limit = 5;

        let offset = (page - 1) * limit;
        const discordUserId = message.author.id;

        const fetchPayments = () => new Promise((resolve, reject) => {
            client.db.query('SELECT payment_id, script, status, type, price FROM payments WHERE discord_id = ? ORDER BY id DESC LIMIT ?, ?', [discordUserId, offset, limit], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        const updateEmbed = async (msg) => {
            try {
                let results = await fetchPayments();

                const desc = results.map(result => `Payment ID: **${result.payment_id}**\nScript: ${result.script}\nValue: ${moneyFormat(result.price)}\nStatus: ${result.status}\nType: ${result.type}`).join('\n\n');
                const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`Payments Page: ${page}`)
                    .setDescription(desc);

                await msg.edit({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching payments:', error);
            }
        }

        try {
            const msg = await message.channel.send('Loading payments...');
            await updateEmbed(msg);

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot,
                time: 60000,
            });

            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === '⬅️') {
                    if (page > 1) {
                        page--;
                        offset = (page - 1) * limit;
                        await updateEmbed(msg);
                    }
                } else {
                    page++;
                    offset = (page - 1) * limit;
                    await updateEmbed(msg);
                }
                await reaction.users.remove(user.id);
            });

            await msg.react('⬅️');
            await msg.react('➡️');

            collector.on('end', () => {
                msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
            });
        } catch (error) {
            console.error('Error sending/embedding message:', error);
        }
    },
};