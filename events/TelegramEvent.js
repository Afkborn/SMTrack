const TelegramUser = require("../model/TelegramUser.js");

const { log } = require("../common/logging.js");
let globalCtx;


const updateGlobalCtx = (ctx) => {
  globalCtx = ctx;
};
/**
 * Telegram kullanıcısına mesaj gönderen fonksiyon.
 * @param {TelegramUser} user - Telegram kullanıcısı
 * @param {string} message  - Mesaj içeriği
 * @param {string} parse_mode  - Markdown, HTML
 * @returns 
 */
async function sendMessageToTelegramUser(
  user,
  message,
  parse_mode = "Markdown"
) {
  if (!globalCtx) {
    log("CTX set edilmemiş.", sendMessageToTelegramUser);
    return;
  }
  await globalCtx.telegram.sendMessage(user.id, message, {
    parse_mode: parse_mode,
  });
}

/**
 * Tüm Telegram kullanıcılarına mesaj gönderen fonksiyon.
 * @param {string} message - Mesaj içeriği
 * @param {string} parse_mode - Markdown, HTML
 */
async function sendMessageToAllTelegramUsers(message, parse_mode = "Markdown") {
  const users = await TelegramUser.find({});
  users.forEach(function (user) {
    sendMessageToTelegramUser(user, message, parse_mode);
  });
}

module.exports = {
  updateGlobalCtx,
  sendMessageToTelegramUser,
  sendMessageToAllTelegramUsers,
};
