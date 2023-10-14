const TelegramUser = require("../model/TelegramUser.js");

async function sendMessageToTelegramUser(bot, user, message) {
  bot.sendMessage(user.id, message);
}

async function sendMessageToAllTelegramUsers(bot, message) {
  const users = await TelegramUser.find({});
  users.forEach(function (user) {
    sendMessageToTelegramUser(bot, user, message);
  });
}

module.exports = { sendMessageToTelegramUser, sendMessageToAllTelegramUsers };
