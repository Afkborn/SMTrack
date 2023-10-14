const TelegramBot = require("node-telegram-bot-api");
const mongoDbConnect = require("./database/mongoDb");
const TelegramUser = require("./model/TelegramUser");
const fs = require("fs");
const { getDifferenceFromToday, getTimeForLog } = require("./common/time");
const {
  checkUserRegistration,
  checkUserAndSendMessage,
} = require("./middleware/auth");
const { getConfig, saveConfig } = require("./config/Config");
const { notifyUsersForNewSPKBulten } = require("./events/SPKBultenEvent");
const path = require("path");
const strings = require("./constants/Strings.js");
require("dotenv").config();

const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token, { polling: true });
let config;

(async () => {
  config = await getConfig();
  notifyUsersForNewSPKBulten(config, bot);
  mongoDbConnect();
})();

// Matches "/start"

// START COMMAND
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
          bot.sendMessage(chatId, strings.SAVE_SUCCESS);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      bot.sendMessage(
        chatId,
        strings.ALREADY_SAVED(
          getDifferenceFromToday(user.createdAt),
          user.username
        )
      );
    }
  });
});
// Listen for the /bulten command without any parameters
bot.onText(/\/bulten$/, (msg) => {
  const chatId = msg.chat.id;
  console.log(config);
  bot.sendMessage(
    chatId,
    strings.LAST_BULTEN_MESSAGE(
      config["SPK"]["last_bulten_no"],
      config["SPK"]["last_bulten_link"]
    ),
    { parse_mode: "Markdown" }
  );
});

bot.onText(/\/bulten (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const bultenNo = match[1];
  const bultenPath = `./data/bultenler/${bultenNo}.pdf`;

  if (fs.existsSync(bultenPath)) {
    bot.sendDocument(chatId, bultenPath);
  } else {
    bot.sendMessage(chatId, strings.BULTEN_NOT_FOUND);
  }
});

// Listen for any kind of message. There are different kinds of messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  checkUserAndSendMessage(bot, msg, strings.NOT_AUTH);
});

bot.on("polling_error", console.log);

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
