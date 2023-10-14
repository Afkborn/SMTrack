const TelegramUser = require("../model/TelegramUser.js");

async function sendMessageToTelegramUser(
  bot,
  user,
  message,
  parse_mode = "Markdown"
) {
  bot.sendMessage(user.id, message, { parse_mode: parse_mode });
}

async function sendMessageToAllTelegramUsers(
  bot,
  message,
  parse_mode = "Markdown"
) {
  const users = await TelegramUser.find({});
  users.forEach(function (user) {
    sendMessageToTelegramUser(bot, user, message, parse_mode);
  });
}

module.exports = { sendMessageToTelegramUser, sendMessageToAllTelegramUsers };
