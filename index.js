const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const mongoDbConnect = require("./database/mongoDb");
const TelegramUser = require("./model/TelegramUser");
const fs = require("fs");
const { getDifferenceFromToday, getTimeForLog } = require("./common/time");
const { updateGlobalCtx } = require("./events/TelegramEvent");
const { userRegistrationMiddleware } = require("./middleware/auth");
const { userAccessLogMiddleware } = require("./middleware/log");
const { getConfig, saveConfig } = require("./config/Config");
const { notifyUsersForNewSPKBulten } = require("./events/SPKBultenEvent");
const { syncCurrencyData } = require("./events/CurrencyEvent");
const { syncBISTData } = require("./events/BISTEvent");
const {
  syncBISTCompanies,
  getBISTCompany,
  getBISTCompanies,
} = require("./events/BISTCompanyEvent");
const { getDisclosures } = require("./events/KAPDisclosuresEvent");
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
  updateGlobalCtx(bot.telegram);
  notifyUsersForNewSPKBulten(config);
  syncCurrencyData(config);
  syncBISTData(config);
  syncBISTCompanies(config);
  getDisclosures(config);
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

bot.command(
  "bist",
  userRegistrationMiddleware,
  userAccessLogMiddleware(requestType.REQTYP_BIST),
  (ctx) => {
    const msg = ctx.update.message;
    if (msg.text.split(" ").length > 1) {
      const companyCode = msg.text.split(" ")[1];
      getBISTCompany(companyCode).then((company) => {
        if (company) {
          if (company.href) {
            let href = config.KAP_BIST_COMPANY.base_url + company.href;
            ctx.reply(strings.BIST_DETAIL(company.name, href), {
              parse_mode: "Markdown",
            });
          } else {
            ctx.reply(
              strings.BIST_DETAIL(
                company.name,
                "https://www.kap.org.tr/tr/bist-sirketler"
              ),
              { parse_mode: "Markdown" }
            );
          }
        } else {
          ctx.reply("Şirket bulunamadı.");
        }
      });
    } else {
      ctx.reply(strings.BIST_NO_PARAMS(config.KAP_BIST_COMPANY.company_count), {
        parse_mode: "Markdown",
      });
    }
  }
);

bot.command(
  "bistlist",
  userRegistrationMiddleware,
  userAccessLogMiddleware(requestType.REQTYP_BISTLIST),
  (ctx) => {
    const msg = ctx.update.message;
    if (msg.text.split(" ").length > 1) {
      const firstLetter = msg.text.split(" ")[1];
      getBISTCompanies(firstLetter).then((companies) => {
        if (companies) {
          let companiesText = "";
          companies.forEach((company) => {
            companiesText += `*${company.code}* - ${company.name}\n`;
          });
          ctx.reply(strings.BIST_LIST(firstLetter, companiesText), {
            parse_mode: "Markdown",
          });
        } else {
          ctx.reply("Şirket bulunamadı.");
        }
      });
    } else {
      ctx.reply(strings.BIST_FIRST_LETTER_REQ);
    }
  }
);

bot.on(
  message("text"),
  userRegistrationMiddleware,
  userAccessLogMiddleware(requestType.REQTYP_MESSAGE),
  (ctx) => {
    // console.log(ctx.update.message.text);
  }
);

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
