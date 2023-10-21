const { getTimeForLog } = require("./time");

function log(message, fnc, showFunctionName = true, showTime = true) {
  let time = getTimeForLog();
  let functionName = showFunctionName ? `[${fnc.name}]` : "";
  let logMessage = showTime
    ? `${time}${functionName} ${message}`
    : `${functionName} ${message}`;
  console.log(logMessage);
}

module.exports = { log };
