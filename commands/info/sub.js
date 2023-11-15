const { MessageEmbed } = require("discord.js");
const subs = require("./subs");
const subsRepository = require("../../repositories/subsRepository");
const MessageEmbedSuccess = require("../../utils/MessageEmbedSuccess");
const scriptRepository = require("../../repositories/scriptRepository");

module.exports = {
  name: "sub",
  aliases: ['sub'],
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    if (!client.config.donos.includes(message.author.id)) return message.reply("você não é um dos meus criadores!");

    if (!args[0]) return message.reply("**Use !sub <argumento> <@pessoa>**");
    switch (args[0]) {
      case "add":
        if (!args[1] || !args[2] || !message.mentions.users.first() || !message.mentions.users.first().id || args[2] !== `<@${message.mentions.users.first().id}>`) return message.reply("**Use !sub add <script> <@pessoa>**");
        const scriptArgs = await scriptRepository.findByName(args[1]);

        if (!scriptArgs) {
          return message.channel.send(`:x: **Este script não existe!** `)
        }

        const scriptAdd = await subsRepository.findByNameAndDiscordId(args[1], message.mentions.users.first().id);

        if (scriptAdd) {
          return message.channel.send(`:x: **Assinatura já encontrada!** `)
        }

        let role = message.guild.roles.cache.find(
          (r) => r.name === "Cliente"
        );
        let usuario = message.mentions.members.first();
        usuario.roles.add(role).catch(console.error);
        const add = await subsRepository.createSubscription(message.mentions.users.first().id, args[1]);
        message.channel.send(`:white_check_mark: **Assinatura adicionada com sucesso!** `);
        break;
      case "remove":
        if (!args[1] || !args[2] || !message.mentions.users.first() || !message.mentions.users.first().id || args[2] !== `<@${message.mentions.users.first().id}>`) return message.reply("**Use !sub remove <script> <@pessoa>**");
        const script = await subsRepository.findByNameAndDiscordId(args[1], message.mentions.users.first().id);

        if (!script) {
          return message.channel.send(`:x: **Assinatura não encontrada!** `)
        }

        const deleted = await subsRepository.deleteSubscriptionByDiscordIdAndScript(message.mentions.users.first().id, args[1]);

        if (!deleted) {
          return message.channel.send(`:x: **Ocorreu um erro ao remover a assinatura!** `)
        }

        return message.channel.send(`:white_check_mark: **Assinatura removida com sucesso!** `);
      case "list":
        if (!args[1] || !message.mentions.users.first() || !message.mentions.users.first().id) return message.reply("**Use !sub list <@pessoa>**");
        const scripts = await subsRepository.findByDiscordId(message.mentions.users.first().id);

        if (!scripts) {
          return message.channel.send(`:x: **Nenhuma assinatura encontrada!**`);
        }
        const fields = scripts.map((script) => ({
          name: "Nome:  " + script.script,
          value: "IP: " + (script.ip ? script.ip : "Nenhum")
        }));
        const embed = MessageEmbedSuccess.create("Assinaturas", null, fields);
        return message.channel.send({ embeds: [embed] });
      default:
        return message.channel.send(
          `:x: **Não encontrei ${args[0]} dentro do comando sub!** `
        );
    }
  }
}
