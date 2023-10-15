const TelegramUser = require("../model/TelegramUser.js");

async function getTelegramUser(telegramUserId) {
  return new Promise((resolve, reject) => {
    TelegramUser.findOne({ id: telegramUserId })
      .then((user) => {
        if (!user) {
          resolve(null);
        } else {
          resolve(user);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = { getTelegramUser };
