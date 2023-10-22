const { log } = require("../common/logging.js");
const { getToday_YYYYMMDD } = require("../common/time.js");
const KAPDisclosure = require("../model/KAPDisclosure.js");
const axios = require("axios");
const KEY = "KAP_BIST_DISCLOSURES";
const { sendMessageToAllTelegramUsers } = require("../events/TelegramEvent.js");
const { getBISTCompany } = require("./BISTCompanyEvent.js");
const {
  KAP_BIST_Disclosures_updateLastControlTime,
  KAP_BIST_Disclosures_updateLastDisclosureId,
} = require("../config/Config.js");
const strings = require("../constants/Strings.js");
// const KAP_MemberTypes = require("../constants/KAPMemberTypes.js");
// const KAP_DisclosureTypes = require("../constants/KAPDisclosuresTypes.js");

/**
 * Asenkron olarak o güne ait olan KAP açıklamalarını senkronize eden, güncel bir açıklama var ise kullanıcılara bildiren fonksiyon.
 * @param {object} config - Yapılandırma bilgilerini içeren nesne.
 */
async function getDisclosures(config) {
  const control_enabled = config[KEY]["control_enabled"]; // kontrol etme aktif mi?
  if (control_enabled) {
    const time_control_interval = config[KEY]["time_control_interval"]; // kontrol etme zamanının gelip gelmediğini kontrol eden süre değişkeni
    setInterval(() => {
      let last_control_time = config[KEY]["last_control_time"]; // son kontrol zamanı
      let control_interval = config[KEY]["control_interval"]; // kontrol aralığı
      let current_time_UNIX = new Date().getTime();
      if (current_time_UNIX > control_interval + last_control_time) {
        log("KAP Disclosures kontrolü geldi.", getDisclosures);
        let fromDate = getToday_YYYYMMDD(); // bugünün tarihi
        let toDate = getToday_YYYYMMDD(); // bugünün tarihi
        // fromDate toDate aynı çünkü bugünün tarihindeki açıklamaları almak istiyoruz.
        let baseURL = config[KEY]["base_url"]; // KAP API adresi
        let url = baseURL + "?fromDate=" + fromDate + "&toDate=" + toDate;

        axios.get(url).then((response) => {
          let disclosures = response.data;
          disclosures.forEach((disclosure) => {
            let stockCodes = disclosure.basic.stockCodes;
            if (stockCodes == "") {
              console.log(
                "StockCodes boş geldi. KapId: " + disclosure.basic.disclosureId
              );
            } else {
              getBISTCompany(stockCodes).then((company) => {
                if (company) {
                  new KAPDisclosure({
                    kapId: disclosure.basic.disclosureId,
                    index: disclosure.basic.disclosureIndex,
                    class: disclosure.basic.disclosureClass,
                    type: disclosure.basic.disclosureType,
                    category: disclosure.basic.disclosureCategory,
                    title: disclosure.basic.title,
                    companyKapId: disclosure.basic.companyId,
                    companyMongoId: company._id,
                    companyName: disclosure.basic.companyName,
                    stockCodes: disclosure.basic.stockCodes,
                    summary: disclosure.summary,
                  })
                    .save()
                    .then((result) => {
                      KAP_BIST_Disclosures_updateLastDisclosureId(
                        config,
                        result.kapId
                      );
                      log(
                        "KAP açıklaması kaydedildi. " + result.kapId,
                        getDisclosures
                      );
                      let href =
                        "https://www.kap.org.tr/tr/Bildirim/" + result.index;
                      let title = `${result.companyName} ${result.title}`; 
                      sendMessageToAllTelegramUsers(
                        strings.KAP_DISCLOSURE_NEW(title, href)
                      );
                    })
                    .catch((error) => {
                      if (error.code == 11000) {
                        log(
                          "KAP açıklaması zaten kayıtlı. " +
                            error.keyValue.kapId,
                          getDisclosures
                        );
                      } else {
                        log(
                          "KAP açıklaması kaydedilemedi. " + error,
                          getDisclosures
                        );
                      }
                    });
                } else {
                  log(
                    "KAP açıklaması kaydedilemedi. " +
                      stockCodes +
                      " şirketi bulunamadı.",
                    getDisclosures
                  );
                }
              });
              KAP_BIST_Disclosures_updateLastControlTime(
                config,
                new Date().getTime()
              );
            }
          });
        });
      }
    }, time_control_interval);
  }
}

module.exports = {
  getDisclosures,
};
