const TelegramBot = require("node-telegram-bot-api");
const mongoDbConnect = require("./database/mongoDb");
const TelegramUser = require("./model/TelegramUser");
const { convertTime, getTimeForLog } = require("./common/time");
const { checkUserRegistration } = require("./middleware/auth");
const { getConfig, saveConfig } = require("./config/Config");
const { notifyUsersForNewSPKBulten } = require("./events/SPKBultenEvent");
const path = require("path");
require("dotenv").config();

const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token, { polling: true });
let config;

(async () => {
  config = await getConfig();
  notifyUsersForNewSPKBulten(config, bot);
  mongoDbConnect();
})();

// //  "/echo [whatever] " will return [whatever] to the user
// bot.onText(/\/echo (.+)/, (msg, match) => {
//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"
//   bot.sendMessage(chatId, resp);
// });

// Matches "/start"

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  checkUserRegistration(bot, msg, true).then((user) => {
    if (!user) {
      const userId = msg.from.id;
      const firstName = msg.from.first_name;
      const username = msg.from.username;
      const isBot = msg.from.is_bot;
      const languageCode = msg.from.language_code;

      const user = new TelegramUser({
        first_name: firstName,
        username: username,
        id: userId,
        is_bot: isBot,
        language_code: languageCode,
      });

      user
        .save()
        .then((result) => {
          bot.sendMessage(chatId, "Başarıyla kayıt oldun.");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      const createdAt = user.createdAt;

      bot.sendMessage(
        chatId,
        `Sen zaten ${convertTime(createdAt)} tarihinden  beri tanıyorum :)`
      );
    }
  });
});

// Listen for any kind of message. There are different kinds of messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  checkUserRegistration(bot, msg).then((user) => {
    if (!user) {
      bot.sendMessage(
        chatId,
        "Kayıtlı olmadığın için mesajlarını okuyamıyorum. /start komutu ile kayıt olabilirsin."
      );
      return;
    }

    // bot.sendMessage(chatId, "Received your message");
  });
});

// KAPAMA SİNYALİ
process.on("SIGINT", function () {
  if (config) {
    const configFilePath = path.resolve("config.json");
    saveConfig(configFilePath, config).then(() => {
      console.log(
        getTimeForLog() + "Config başarılı bir şekilde kayıt edildi."
      );
      process.exit();
    });
  } else {
    console.log(getTimeForLog() + "Config bulunamadı.");
    process.exit();
  }
});
