const { log } = require("../common/logging.js");
const {
  KAP_BIST_DISCLOSURES_DETAIL_DOWNLOADED_updateLastControlTime,
} = require("../config/Config.js");
// const KAPDisclosure = require("../model/KAPDisclosure.js");
const { getUndownloadedDisclosures } = require("../model/KAPDisclosure.js");
require("dotenv").config();
/**
 * KAP tarafından yayınlanan açıklamaların detay bilgilerini ve eklerini indirmeye yarayan fonksiyon. Bu işlemi KAP'dan açıklama çekildikten sonra düzneli olarak kontrol eder ve senkron bir şekilde indirir.
 * @param {object} config - Config.js içerisindeki KAP_BIST_DISCLOSURES_DETAIL_DOWNLOADED değişkeni
 * @returns {void}
 */
const KEY = "KAP_BIST_DISCLOSURES_DETAIL_DOWNLOADED";
async function syncDisclosuresDetail(config) {
  const control_enabled = config[KEY]["control_enabled"]; // kontrol etme aktif mi?
  if (control_enabled) {
    const time_control_interval = config[KEY]["time_control_interval"]; // kontrol etme zamanının gelip gelmediğini kontrol eden süre değişkeni
    setInterval(() => {
      let last_control_time = config[KEY]["last_control_time"]; // son kontrol zamanı
      let control_interval = config[KEY]["control_interval"]; // kontrol aralığı
      let current_time_UNIX = new Date().getTime();
      if (current_time_UNIX > control_interval + last_control_time) {
        log("KAP Disclosures kontrolü geldi.", syncDisclosuresDetail);
        getUndownloadedDisclosures().then((disclosures) => {
          disclosures.forEach((disclosure) => {
            // indirme işlemi yapılacak. indirme işlemi bittikten sonra detailsDownloaded true yapılacak.
          });
        });

        KAP_BIST_DISCLOSURES_DETAIL_DOWNLOADED_updateLastControlTime(
          config,
          new Date().getTime()
        );
      }
    }, time_control_interval);
  }
}

module.exports = { syncDisclosuresDetail };
