const subsRepository = require("../../repositories/subsRepository");
const MessageEmbedUtil = require("../../utils/MessageEmbed");
const scriptRepository = require("../../repositories/scriptRepository");

function checkPermission(client, message) {
  if (!client.config.donos.includes(message.author.id)) {
    message.reply("você não é um dos meus criadores!");
    return false;
  }
  return true;
}

function checkArgs(args, message) {
  if (!args[0]) {
    message.reply("**Use !sub <argumento> <@pessoa>**");
    return false;
  }
  return true;
}

module.exports = {
  name: "sub",
  aliases: ['sub'],
  run: async (client, message, args) => {
    if (!checkPermission(client, message) || !checkArgs(args)) {
      return;
    }
    const commandHandlers = {
      "add": handleAdd,
      "remove": handleRemove,
      "list": handleList
    };
    const handler = commandHandlers[args[0]];

    if (!handler) {
      return handleUnrecognizedCommand(message, args);
    }
    await handler(message, args);
  }
};

async function handleAdd(message, args) {
  const mentionedUser = getMentionedUserWithIdInArgs(args, message);
  if (!mentionedUser || !args[2] || args[2] !== `<@${mentionedUser}>`) {
    return replyForInvalidArguments(message, "add <script> <@pessoa>");
  }
  const scriptArgs = await scriptRepository.findByName(args[1]);
  if (!scriptArgs) {
    return sendScriptNotFoundError(message);
  }
  const scriptAdd = await subsRepository.findByNameAndDiscordId(args[1], mentionedUser);
  if (scriptAdd) {
    return sendSubscriptionAlreadyExistsError(message);
  }
  await addSubscriptionForUserWithRole(message, mentionedUser, args);
  message.channel.send(`:white_check_mark: **Assinatura adicionada com sucesso!** `);
}

async function handleList(message, args) {
  const mentionedUser = getMentionedUserWithIdInArgs(args, message);
  if (!mentionedUser || !args[1]) {
    return replyForInvalidArguments(message, "list <@pessoa>");
  }

  const scripts = await subsRepository.findByDiscordId(mentionedUser);

  if (!scripts) {
    return sendNoSubscriptionsFoundError(message);
  }
  const fields = scripts.map((script) => ({
    name: "Nome:  " + script.script,
    value: "IP: " + (script.ip ? script.ip : "Nenhum")
  }));
  const embed = MessageEmbedUtil.create("Assinaturas", null, null, fields);
  return message.channel.send({ embeds: [embed] });
}

async function handleRemove(message, args) {
  const mentionedUser = getMentionedUserWithIdInArgs(args, message);
  if (!mentionedUser || !args[2] || args[2] !== `<@${mentionedUser.id}>`) {
    return replyForInvalidArguments(message, "remove <script> <@pessoa>");
  }
  const script = await subsRepository.findByNameAndDiscordId(args[1], mentionedUser);
  if (!script) {
    return sendSubscriptionNotFoundError(message);
  }
  const deleted = await subsRepository.deleteSubscriptionByDiscordIdAndScript(mentionedUser, args[1]);
  if (!deleted) {
    return sendSubscriptionRemovalError(message);
  }
  return message.channel.send(`:white_check_mark: **Assinatura removida com sucesso!** `);
}

function getMentionedUserWithIdInArgs(args, message) {
  return message.mentions &&
      message.mentions.users.first() &&
      message.mentions.users.first().id;
}

function replyForInvalidArguments(message, correctSyntax) {
  return message.reply(`**Use !sub ${correctSyntax}**`);
}

function sendScriptNotFoundError(message) {
  return message.channel.send(`:x: **Este script não existe!** `);
}

function sendSubscriptionAlreadyExistsError(message) {
  return message.channel.send(`:x: **Assinatura já encontrada!** `);
}

async function addSubscriptionForUserWithRole(message, mentionedUser, args) {
  let role = message.guild.roles.cache.find(
      (r) => r.name === "Cliente"
  );
  let usuario = message.mentions.members.first();
  usuario.roles.add(role).catch(console.error);
  await subsRepository.createSubscription(mentionedUser.id, args[1]);
}

function handleUnrecognizedCommand(message, args) {
  return message.channel.send(`:x: **Não encontrei ${args[0]} dentro do comando sub!** `);
}

function sendSubscriptionNotFoundError(message) {
  return message.channel.send(`:x: **Assinatura não encontrada!** `);
}

function sendSubscriptionRemovalError(message) {
  return message.channel.send(`:x: **Ocorreu um erro ao remover a assinatura!** `);
}

function sendNoSubscriptionsFoundError(message) {
  return message.channel.send(`:x: **Nenhuma assinatura encontrada!**`);
}
