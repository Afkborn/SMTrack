const TelegramUser = require("../model/TelegramUser.js");
/**
 * Telegram kullanıcısını döndüren fonksiyon.
 * @param {number} telegramUserId - Telegram kullanıcısı id'si
 * @returns  {Promise<TelegramUser>} - Telegram kullanıcısı
 */
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

/**
 * Telegram kullanıcısının erişim sayısını arttıran fonksiyon.
 * @param {TelegramUser} user  -- Telegram kullanıcısı
 * @param {number} count - Eklenecek sayı
 * @returns
 */
async function increaseAccessCount(user, count = 1) {
  return new Promise((resolve, reject) => {
    user.access_count += count;
    user
      .save()
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = { getTelegramUser, increaseAccessCount };
