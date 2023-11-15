const { MessageEmbed } = require("discord.js");

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
    if ( !client.config.donos.includes(message.author.id) ) return message.reply("você não é um dos meus criadores!");

    if ( !args[0] ) return message.reply("**Use !sub <argumento> <@pessoa>**");
    switch (args[0]) {
      case "add":
        if ( !args[1] || !args[2] || !message.mentions.users.first().id || args[2] !== `<@${message.mentions.users.first().id}>` ) return message.reply("**Use !sub add <script> <@pessoa>**");
        await client.db.query(
            `SELECT script FROM subs WHERE discord_id = "${
                message.mentions.users.first().id
            }" AND script = "${args[1]}"`,
            async (err, rows) => {
              if ( rows && rows.length >= 1 ) {
                return message.channel.send(`:x: **Assinatura já encontrada!** `)
              }

              if ( !rows || rows.length === 0 ) {
                let role = message.guild.roles.cache.find(
                    (r) => r.name === "Cliente"
                );
                let usuario = message.mentions.members.first();
                usuario.roles.add(role).catch(console.error);
                await client.db.query(
                    `INSERT INTO subs (discord_id, script) VALUES("${
                        message.mentions.users.first().id
                    }", "${args[1]}")`,
                    async (err, rows) => {
                      if ( rows.affectedRows === 1 ) {
                        return message.channel.send(
                            `:white_check_mark: **Assinatura adicionada!** `
                        );
                      }
                    }
                );
              }
            }
        );
        break;
      case "remove":
        if ( !args[1] || !args[2] || !message.mentions.users.first().id || args[2] !== `<@${message.mentions.users.first().id}>` ) return message.reply("**Use !sub remove <script> <@pessoa>**");
        await client.db.query(
            `SELECT script, ip FROM subs WHERE discord_id = "${
                message.mentions.users.first().id
            }" AND script = "${args[1]}"`,
            async (err, rows) => {
              if ( !rows || rows.length === 0 ) {
                return message.channel.send(
                    `:x: **Assinatura não encontrada!** `
                );
              }
              if ( rows.length >= 1 ) {
                await client.db.query(
                    `DELETE FROM subs WHERE discord_id = "${
                        message.mentions.users.first().id
                    }" AND script = "${args[1]}"`,
                    async (err, rows) => {
                      if ( !rows.affectedRows ) {
                        return message.channel.send(
                            `:x: **Ocorreu um erro, contate um Administrador!** `
                        );
                      }
                      if ( rows.affectedRows >= 1 ) {
                        return message.channel.send(
                            `:white_check_mark: **Assinatura removida!** `
                        );
                      }
                    }
                );
              }
            }
        );
        break;
      case "list":
        if ( !args[1] || !message.mentions.users.first().id ) return message.reply("**Use !sub list <@pessoa>**");
        await client.db.query(
            `SELECT script, ip FROM subs WHERE discord_id = ${
                message.mentions.users.first().id
            }`,
            async (err, rows) => {
              if ( err ) throw err;
              if ( !rows || rows.length === 0 ) {
                return message.channel.send(
                    `:x: **Este usuário não possui scripts!** `
                );
              }
              const embed = new MessageEmbed()
                  .setTitle(`Assinaturas (${rows.length})`)
                  .setColor(0x00ae86)
                  .addField(
                      `Nome`,
                      rows.map((x) => x.script),
                      true
                  )
                  .addField(
                      `IP`,
                      rows.map((x) => (x.ip ? x.ip : "Nenhum")),
                      true
                  );
              return message.channel.send({embeds: [embed]});
            }
        );
        break;
      default:
        return message.channel.send(
            `:x: **Não encontrei ${args[0]} dentro do comando sub!** `
        );
    }
  }
}
