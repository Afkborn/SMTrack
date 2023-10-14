function getTimeForLog() {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  return `${hours}:${minutes}:${seconds}:${milliseconds}\t| `;
}

function convertTime(timeString) {
  const date = new Date(timeString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

module.exports = {getTimeForLog, convertTime};
