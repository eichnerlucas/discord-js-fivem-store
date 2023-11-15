const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton} = require("discord.js");
const client = require("../index");
const mercadopago = require("../utils/mercadopago");
const randString = require("../utils/generateString.js");
const moment = require('moment-timezone');

client.on("interactionCreate", async (interaction) => {
    // Select Menu Handling
    if (!interaction.isSelectMenu()) return;
    if(interaction.customId !== 'buy_menu') return;

    client.db.query(`SELECT name, price FROM scripts WHERE name = "${interaction.message.embeds[0].title}"`, async (err, rows) => {
        if ( !rows || rows.length === 0 ) {
            const embed = new MessageEmbed()
                .setTitle(`**Erro ao processar pedido**`)
                .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
                .setDescription(`**Contate um administrador!**`)
                .setColor(0x00ae86)
                .setTimestamp();
            return interaction.editReply({embeds: [embed]})
        }
        const { name, price } = rows[0];
        if ( interaction.values[0] === "pix" ) {
            await interaction.deferUpdate()
            // Obtenha a data e hora atual com o fuso horário desejado
            const now = moment().tz('America/Sao_Paulo');

            // Adicione 30 minutos à data atual
            const futureDate = now.add(30, 'minutes');

            // Formate a data no formato especificado
            const formattedDate = futureDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
            const payment_data = {
                transaction_amount: price,
                description: name,
                payment_method_id: 'pix',
                external_reference : randString(20),
                date_of_expiration: formattedDate,
                payer: {
                    email: 'ricardina6539@uorak.com',
                    identification: {
                        type: 'CPF',
                        number: '48913238098'
                    },
                }
            };
            await interaction.message.edit({components: []})

            const generating = new MessageEmbed()
                .setTitle(`**Aguarde**`)
                .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
                .setDescription("**Processando pagamento...**")
                .setColor(0x00ae86)
                .setTimestamp();
            await interaction.editReply({embeds: [generating]})

            await mercadopago.payment.create(payment_data).then(res => {
                const id = res.response.id;
                client.db.query(`INSERT INTO payments (discord_id, channel_id, payment_id, external_ref, script, price, status, type) VALUES (${interaction.user.id}, ${interaction.channelId}, ${id},"${res.response.external_reference}", "${name}", "${price}","pending", "pix")`)
                let pix = interaction.message.guild.emojis.cache?.find(emoji => emoji.name === 'pix');
                pix ? pix : pix = '💰';
                const {qr_code, qr_code_base64} = res.response.point_of_interaction.transaction_data
                const buf = new Buffer.from(qr_code_base64, 'base64');
                const file = new MessageAttachment(buf, `${payment_data.external_reference}.png`);
                const embed = new MessageEmbed()
                    .setTitle(`**Pagamento Gerado com Sucesso**`)
                    .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
                    .setDescription(`**Nome do Produto:** \`\`${name}\`\`\n\n**Valor:** \`\`R$${price}\`\`\n\n**Método de Pagamento: ** ${pix} Pix\n\n**Código PIX:** \`\`${qr_code}\`\`\n\n**🛈**: O pagamento expira em **30 minutos**, antes de efetuar o pagamento verifique se ele ainda está disponível.`)
                    .setColor(0x00ae86)
                    .setImage(`attachment://${payment_data.external_reference}.png`)
                    .setTimestamp();
                const button = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('cancel-pix')
                            .setLabel('Cancelar Pagamento')
                            .setStyle('DANGER'),
                    );

                
                interaction.editReply({embeds: [embed], files: [file], components: [button]}).then(message => {
                    const filter = i => i.customId === 'cancel-pix' && i.user.id === interaction.user.id;
                    const collector = message.createMessageComponentCollector({ filter, time: 1800000 });
                    collector.on('collect', async (collected) => {
                        if (collected.customId === 'cancel-pix') {
                            await collected.deferUpdate()
                            await mercadopago.payment.cancel(id).then(response => {
                                const { status, external_reference } = response.response
                                client.db.query(`UPDATE payments SET status = "${status}" WHERE external_ref = "${external_reference}";`)
                                const canceled = new MessageEmbed()
                                    .setTitle(`**Pedido cancelado com sucesso**`)
                                    .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
                                    .setDescription("**Lamentamos que não tenha dado tudo certo na sua compra, esperamos vê-lo em breve...**")
                                    .setColor(0x00ae86)
                                    .setTimestamp();
                                interaction.editReply({embeds: [canceled], components: [], files: []})
                            }).catch(error => {
                                console.log(error)
                            })
                        }
                    })
                })
            }).catch(error => {
                const errorEmbed = new MessageEmbed()
                    .setTitle(`**Erro ao Gerar Pedido**`)
                    .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
                    .setDescription(`**Ocorreu um erro ao realizar seu pedido, informe a um administrador o erro**:\n\`\`${error.cause[0].description}\`\``)
                    .setColor(0x00ae86)
                    .setTimestamp();
                interaction.editReply({embeds: [errorEmbed], components: [], files: []})
            })
        }

        if ( interaction.values[0] === "cartao" ) {
            await interaction.deferUpdate()
            const preference = {
                items: [
                    {
                        title: rows[0].name,
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: rows[0].price
                    }
                ],
                external_reference : randString(20),
            };
            await interaction.message.edit({components: []})

            const generating = new MessageEmbed()
                .setTitle(`**Aguarde**`)
                .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
                .setDescription("**Processando pagamento...**")
                .setColor(0x00ae86)
                .setTimestamp();
            await interaction.editReply({embeds: [generating]})
            let mp = interaction.message.guild.emojis.cache?.find(emoji => emoji.name === 'mercadopago');
            await mercadopago.preferences.create(preference).then(res => {
               console.log(res.response)
                client.db.query(`INSERT INTO payments (discord_id, channel_id, payment_id, script, price, status, type) VALUES (${interaction.user.id}, ${interaction.channelId}, "${res.response.external_reference}", "${name}", "${price}", "pending", "creditcard")`)
                const embed = new MessageEmbed()
                    .setTitle(`**Pagamento Gerado com Sucesso**`)
                    .setAuthor({ name: 'Discord Store', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
                    .setDescription(`**Nome do Produto:** \`\`${name}\`\`\n\n**Valor:** \`\`R$${price}\`\`\n\n**Método de Pagamento: ** ${mp} MercadoPago\n\n**🛈**: O pagamento expira em **2 dias**, antes de efetuar o pagamento verifique se ele ainda está disponível.`)
                    .setColor(0x00ae86)
                    .setTimestamp();

                const button = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setLabel('Link de Pagamento')
                            .setURL(`${res.body.init_point}`)
                            .setStyle('LINK')
                    );
                interaction.editReply({embeds: [embed], components: [button]})
            }).catch(error => {
                console.log(error)
            })
        }
    })
});
