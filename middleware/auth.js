const { getTelegramUser } = require("../events/TelegramUserEvent.js");
const strings = require("../constants/Strings.js");

/**
 * Kullanıcının kayıtlı olup olmadığını kontrol eden middleware.
 * @returns ctx.user olarak kullanıcıyı ekler.
 */
const userRegistrationMiddleware = (ctx, next) => {
  const msg = ctx.update.message;
  getTelegramUser(msg.from.id)
    .then((user) => {
      if (!user) {
        ctx.reply(strings.NOT_AUTH);
      } else {
        ctx.user = user; // ctx nesnesine kullanıcıyı ekledik.
        next();
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = { userRegistrationMiddleware };
