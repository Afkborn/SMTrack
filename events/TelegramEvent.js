const TelegramUser = require("../model/TelegramUser.js");

const { log } = require("../common/logging.js");
let globalCtx;

const updateGlobalCtx = (ctx) => {
  globalCtx = ctx;
};

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
