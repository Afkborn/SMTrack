const TelegramUser = require("../model/TelegramUser.js");

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
    console.log("ctx is not available");
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
