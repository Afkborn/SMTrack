const AccessLog = require("../model/AccessLog");

async function logAccess(userID, requestType, requestContent = undefined) {
  const accessLog = new AccessLog({
    userID,
    requestType,
    requestContent,
  });

  return new Promise((resolve, reject) => {
    accessLog
      .save()
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

const userAccessLogMiddleware = (requestType) => {
  return (ctx, next) => {
    const msg = ctx.update.message;
    const user = ctx.user;

    if (msg.text.startsWith("/")) {
      const param = msg.text.split(" ");
      if (param.length > 1) {
        const requestContent = param.slice(1).join(" ");
        logAccess(user._id, requestType, requestContent);
      } else {
        logAccess(user._id, requestType);
      }
    } else {
      logAccess(user._id, requestType, msg.text);
    }

    next();
  };
};

module.exports = { userAccessLogMiddleware, logAccess };
