const { Telegraf } = require("telegraf");
const mongoDbConnect = require("./database/mongoDb");
const TelegramUser = require("./model/TelegramUser");
const fs = require("fs");
const { getDifferenceFromToday, getTimeForLog } = require("./common/time");
const { updateGlobalCtx } = require("./events/TelegramEvent");
const { userRegistrationMiddleware } = require("./middleware/auth");
const { userAccessLogMiddleware } = require("./middleware/log");
const { getConfig, saveConfig } = require("./config/Config");
const { notifyUsersForNewSPKBulten } = require("./events/SPKBultenEvent");
const { getTelegramUser } = require("./events/TelegramUserEvent");
const path = require("path");
const strings = require("./constants/Strings.js");
const requestType = require("./constants/RequestTypes.js");
require("dotenv").config();
mongoDbConnect();

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
let config;
(async () => {
  config = await getConfig();
  updateGlobalCtx(bot.context);
  notifyUsersForNewSPKBulten(config);
})();

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
          user.first_name
        )
      );
    }
  });
});

bot.command(
  "bulten",
  userRegistrationMiddleware,
  userAccessLogMiddleware(requestType.REQTYP_BULTEN),
  (ctx) => {
    const msg = ctx.update.message;
    if (msg.text.split(" ").length > 1) {
      const bultenNo = msg.text.split(" ")[1];
      const bultenPath = `./data/bultenler/${bultenNo}.pdf`;
      if (fs.existsSync(bultenPath)) {
        ctx.replyWithDocument({ source: bultenPath });
      } else {
        ctx.reply("Bülten bulunamadı.");
      }
    } else {
      ctx.reply(
        strings.LAST_BULTEN_MESSAGE(
          config.SPK.last_bulten_no,
          config.SPK.last_bulten_link
        ),
        { parse_mode: "Markdown" }
      );
    }
  }
);

bot.start(
  userRegistrationMiddleware,
  (ctx) => {
    ctx.reply("Welcome");
  }
);

bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("sticker", (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));

bot.launch();

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
