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
        s;
        reject(err);
      });
  });
}



module.exports = { logAccess };
