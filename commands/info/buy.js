const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");
const scriptRepository = require("../../repositories/scriptRepository");

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
    const erro = new MessageEmbed()
      .setTitle(`Uso incorreto`)
      .setDescription(`!buy <script>`)
      .setColor(0x00ae86)
      .setTimestamp();
    if (!args[0]) {
      return message.channel.send({ embeds: [erro] });
    }
    // if ( message.guild.channels.cache.find(channel => channel.name === `ticket-${message.author.id}`) ) {
    //     return message.reply('Você já tem um ticket criado, feche o antigo para abrir um novo!');
    // }
    const script = await scriptRepository.findByName(args[0]);
    console.log(script);
    if (!script) {
      return message.channel.send(`:x: **Este script não existe!**`);
    }
    let everyoneRole = await message.guild.roles.cache.find(
      (r) => r.name === "@everyone"
    );
    let equipeRole = await message.guild.roles.cache.find(
      (r) => r.name === "Equipe"
    );
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
        parent: "870979800532140114",
      })
      .then(async (channel) => {
        message.channel.send(`:white_check_mark: **Pedido criado!**`);
        let pix = message.guild.emojis.cache?.find(
          (emoji) => emoji.name === "pix"
        );
        let mp = message.guild.emojis.cache?.find(
          (emoji) => emoji.name === "mercadopago"
        );
        pix ? pix : '💰';
        mp ? mp : '💳';
        let helpMenu = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("buy_menu")
            .setPlaceholder("Escolha uma opcao")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
              {
                label: "Pix",
                description: "Método de Pagamento Brasileiro",
                value: "pix",
                emoji: pix,
              },
              // {
              //   label: "MercadoPago",
              //   description: "Método de Pagamento Brasileiro (Cartão)",
              //   value: "cartao",
              //   emoji: mp,
              // },
            ])
        );
        const embed = new MessageEmbed()
          .setTitle(args[0])
          .setDescription(
            `Olá.\nAgradecemos por estar realizando o pedido de **${args[0]}**.\nEscolha um dos métodos de pagamento listado abaixo.\n\n**Métodos de Pagamento**\n- MercadoPago\n- PIX\n\nApós efetuar o pagamento, realize uma captura de tela e envie aqui no canal junto com o seu **nome e email**.\n\n**Para fechar este ticket, reaja com 🔒.**`
          )
          .setColor(0x00ae86)
          .setTimestamp();
        channel.send({ embeds: [embed], components: [helpMenu] });
      });
  },
};
