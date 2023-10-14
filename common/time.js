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

function getDifferenceFromToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(today - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

module.exports = { getTimeForLog, convertTime, getDifferenceFromToday };
