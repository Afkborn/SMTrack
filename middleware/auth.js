const TelegramUser = require("../model/TelegramUser.js");

async function checkUserRegistration(bot, msg) {
  const userId = msg.from.id;

  try {
    const user = await TelegramUser.findOne({ id: userId });
    if (!user) {
      return null;
    } else {
      return user;
    }
  } catch (err) {
    console.log(err);
  }
}

async function checkUserAndSendMessage(bot, msg, message) {
  const user = await checkUserRegistration(bot, msg);
  if (!user) {
    bot.sendMessage(msg.chat.id, message);
  }
}

module.exports = { checkUserRegistration, checkUserAndSendMessage };
