const { getTimeForLog } = require("../common/time.js");
const { BIST_updateLastControlTime } = require("../config/Config.js");

// const strings = require("../constants/Strings.js");
// const axios = require("axios");
// const cheerio = require("cheerio");

let KEY = "BIST";
async function syncBISTData(config) {
  const control_enabled = config[KEY]["control_enabled"]; // kontrol etme aktif mi?
  if (control_enabled) {
    const time_control_interval = config[KEY]["time_control_interval"]; // kontrol etme zamanının gelip gelmediğini kontrol eden süre değişkeni
    setInterval(() => {
      let last_control_time = config[KEY]["last_control_time"]; // son kontrol zamanı
      let control_interval = config[KEY]["control_interval"]; // kontrol aralığı
      let current_time_UNIX = new Date().getTime();
      if (current_time_UNIX > control_interval + last_control_time) {
        console.log(getTimeForLog() + "BIST kontrolü geldi.");

        // KUR KONTROLÜ VAKIFBANK API İZİN VERİLDİĞİNDE YAPILACAK

        BIST_updateLastControlTime(config, new Date().getTime());
      }
    }, time_control_interval);
  }
}

module.exports = { syncBISTData };