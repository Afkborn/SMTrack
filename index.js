const { Telegraf } = require("telegraf");
const mongoDbConnect = require("./database/mongoDb");
const TelegramUser = require("./model/TelegramUser");
const fs = require("fs");
const { getDifferenceFromToday, getTimeForLog } = require("./common/time");
const { updateGlobalCtx } = require("./events/TelegramEvent");
const { userRegistrationMiddleware } = require("./middleware/auth");
const { getConfig, saveConfig } = require("./config/Config");
const { notifyUsersForNewSPKBulten } = require("./events/SPKBultenEvent");
const { getTelegramUser } = require("./events/TelegramUserEvent");
const path = require("path");
const strings = require("./constants/Strings.js");
require("dotenv").config();
mongoDbConnect();

let config;
(async () => {
  config = await getConfig();
})();

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);

bot.command("setGlobalContext", (ctx) => {
  updateGlobalCtx(ctx);
  notifyUsersForNewSPKBulten(config);
});

bot.command("kayit", (ctx) => {
  const msg = ctx.update.message;
  getTelegramUser(msg.from.id).then((user) => {
    if (!user) {
      const telegramUser = new TelegramUser({
        id: msg.from.id,
        is_bot: msg.from.is_bot,
        first_name: msg.from.first_name,
        username: msg.from.username,
        language_code: msg.from.language_code,
      });
      telegramUser
        .save()
        .then(() => {
          ctx.reply(strings.AUTH_SUCCESS);
        })
        .catch((error) => {
          console.log(error);
          ctx.reply(strings.AUTH_FAIL);
        });
    } else {
      ctx.reply(
        strings.ALREADY_AUTH(
          getDifferenceFromToday(user.createdAt),
          user.username
        )
      );
    }
  });
});

bot.start(userRegistrationMiddleware, (ctx) => {
  ctx.reply("Welcome");
});

bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("sticker", (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));

bot.launch();

// Listen for the /bulten command without any parameters
// bot.onText(/\/bulten$/, userRegistrationMiddleware(bot), (msg) => {
//   const chatId = msg.chat.id;
//   console.log(config);
//   bot.sendMessage(
//     chatId,
//     strings.LAST_BULTEN_MESSAGE(
//       config["SPK"]["last_bulten_no"],
//       config["SPK"]["last_bulten_link"]
//     ),
//     { parse_mode: "Markdown" }
//   );
// });

// bot.onText(
//   /\/bulten (.+)/,
//   userRegistrationMiddleware(bot),
//   async (msg, match) => {
//     // checkUserAndSendMessage(bot, msg, strings.NOT_AUTH);
//     const chatId = msg.chat.id;
//     const bultenNo = match[1];
//     const bultenPath = `./data/bultenler/${bultenNo}.pdf`;

//     if (fs.existsSync(bultenPath)) {
//       bot.sendDocument(chatId, bultenPath);
//     } else {
//       bot.sendMessage(chatId, strings.BULTEN_NOT_FOUND);
//     }
//   }
// );

// KAPAMA SİNYALİ
process.on("SIGINT", function () {
  if (config) {
    const configFilePath = path.resolve("config.json");
    saveConfig(configFilePath, config).then(() => {
      console.log(
        getTimeForLog() + "Config başarılı bir şekilde kayıt edildi."
      );
      bot.stop("SIGINT");
      process.exit();
    });
  } else {
    console.log(getTimeForLog() + "Config bulunamadı.");
    bot.stop("SIGINT");
    process.exit();
  }
});

process.once("SIGTERM", () => bot.stop("SIGTERM"));
