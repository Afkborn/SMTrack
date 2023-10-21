/**
 * Zamanı log için uygun formata çeviren fonksiyon.
 * @returns {string} - Zamanı HH:MM:SS:MS olarak döndürür.
 */
function getTimeForLog() {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  return `${hours}:${minutes}:${seconds}:${milliseconds}\t| `;
}

/**
 * Verilen tarih bilgisini dd.mm.yyyy formatına çeviren fonksiyon.
 * @param {string} timeString - Tarih ve saat bilgisi
 * @returns {string} - Tarihi dd.mm.yyyy olarak döndürür.
 */
function convertTime(timeString) {
  const date = new Date(timeString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Verilen tarih bilgisinden bugüne kadar geçen gün sayısını döndüren fonksiyon.
 * @param {string} dateString 
 * @returns {number} - Bugüne kadar geçen gün sayısı
 */
function getDifferenceFromToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(today - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

module.exports = { getTimeForLog, convertTime, getDifferenceFromToday };
