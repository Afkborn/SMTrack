const TelegramUser = require("../model/TelegramUser.js");

async function checkUserRegistration(bot, msg, saveIfNotRegistered = false) {
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

module.exports = { checkUserRegistration };
