const { getTimeForLog } = require("./time");

/**
 * 
 * @param {string} message - Log mesajı
 * @param {Function} fnc  - Gelen fonksiyon, log mesajının başına yazılır.
 * @param {boolean} showFunctionName  - Fonksiyon adını göster (opsiyonel) (default: true)
 * @param {boolean} showTime  - Zamanı göster (opsiyonel) (default: true)
 */
function log(message, fnc, showFunctionName = true, showTime = true) {
  let time = getTimeForLog();
  let functionName = showFunctionName ? `[${fnc.name}]` : "";
  let logMessage = showTime
    ? `${time}${functionName} ${message}`
    : `${functionName} ${message}`;
  console.log(logMessage);
}

module.exports = { log };
