const {
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");
const scriptRepository = require("../../repositories/scriptRepository");
const MessageEmbedUtil = require("../../utils/MessageEmbed");

module.exports = {
  name: "buy",
  aliases: ["comprar"],
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    try {
      const erro = MessageEmbedUtil.create("Uso incorreto", "error", "!buy <script>");
      if (!args[0]) {
        return message.channel.send({ embeds: [erro] });
      }

      const script = await scriptRepository.findByName(args[0]);

      if (!script) {
        return message.channel.send(`:x: **Este script não existe!**`);
      }
      
      let everyoneRole = await message.guild.roles.cache.find(
        (r) => r.name === "@everyone"
      );
      let equipeRole = await message.guild.roles.cache.find(
        (r) => r.name === "Equipe"
      );

      const parentName = 'tickets';
      const parent = message.guild.channels.cache.find(
        (channel) => channel.type === 'GUILD_CATEGORY' && channel.name.toLowerCase() === parentName
      );
      if (! parent) {
        console.log('Erro: O parent com o nome de tickets não foi encontrado. O ticket será criado sem parent.')
      }
      message.guild.channels
        .create(`ticket-${message.author.id}`, {
          permissionOverwrites: [
            {
              id: message.author.id,
              allow: [
                "SEND_MESSAGES",
                "VIEW_CHANNEL",
                "READ_MESSAGE_HISTORY",
              ],
            },
            {
              id: equipeRole.id,
              allow: [
                "VIEW_CHANNEL",
                "SEND_MESSAGES",
                "READ_MESSAGE_HISTORY",
                "MANAGE_MESSAGES",
              ],
            },
            {
              id: everyoneRole.id,
              deny: ["VIEW_CHANNEL"],
            },
          ],
          type: "text",
          parent: parent ? parent : null,
        })
        .then(async (channel) => {
          message.channel.send(`:white_check_mark: **Pedido criado!**`);
          let pix = message.guild.emojis.cache?.find(
            (emoji) => emoji.name === "pix"
          );
          pix ? pix : '💰';
          let helpMenu = new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("buy-menu")
              .setPlaceholder("Escolha uma opcao")
              .setMinValues(1)
              .setMaxValues(1)
              .addOptions([
                {
                  label: "Pix",
                  description: "Método de Pagamento Brasileiro",
                  value: script.name,
                  emoji: pix,
                },
              ])
          );
          const embed = MessageEmbedUtil.create(
            "**Pedido de Compra**",
            null,
            `Olá <@${message.author.id}>.\nAgradecemos por estar realizando o pedido de **${args[0]}**.\nEscolha um dos métodos de pagamento listado abaixo.\n\n**Métodos de Pagamento**\n- PIX\n\nApós efetuar o pagamento, realize uma captura de tela e envie aqui no canal junto com o seu **nome e email**.\n\n**Para fechar este ticket, reaja com 🔒.**`
          );
          const sentMessage = await channel.send({ content: `<@${message.author.id}>`,embeds: [embed], components: [helpMenu] });
  
          await sentMessage.react('🔒');
          const filter = (reaction, user) => reaction.emoji.name === '🔒' && user.id === message.author.id;
          const collector = sentMessage.createReactionCollector({ filter });
  
          collector.on('collect', async () => {
            const newParentName = 'tickets-fechados'; // Substitua pelo nome correto do novo parent
            const newParent = message.guild.channels.cache.find(
              (channel) => channel.type === 'GUILD_CATEGORY' && channel.name.toLowerCase() === newParentName
            );
            
            if (! newParent) {
              console.log('Erro: O novo parent não foi encontrado. O ticket será deletado.')
              return await channel.delete();
            }

            await channel.send('**Este ticket será fechado em 1 minuto.**');
            setTimeout(async () => {
              await channel.edit({ parent: newParent });
              await channel.permissionOverwrites.edit(message.author.id, {
                SEND_MESSAGES: false,
                VIEW_CHANNEL: false,
                READ_MESSAGE_HISTORY: false,
              });
              //TODO: cancelar pagamento no banco de dados e no mercadopago!
            }, 60000);
          });
        });
    } catch (err) {
      console.log("Erro ao criar ticket: " + err)
      message.channel.send(`:x: **Ocorreu um erro ao criar o ticket!**`);
    }
  },
};
