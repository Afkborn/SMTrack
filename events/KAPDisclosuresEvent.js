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
const BISTCompany = require("../model/BISTCompany.js");
const strings = require("../constants/Strings.js");
const KAPDisclosuresTypes = require("../constants/KAPDisclosuresTypes.js");
const KAPMemberTypes = require("../constants/KAPMemberTypes.js");

async function sendDisclosureToUsers(disclosure) {
  let href = "https://www.kap.org.tr/tr/Bildirim/" + disclosure.index;
  let title = `${disclosure.companyName} ${disclosure.title}`;  
  // sendMessageToAllTelegramUsers(strings.KAP_DISCLOSURE_NEW(title, href));
}

async function handleNoStockCodes(disclosure, config) {
  new KAPDisclosure({
    kapId: disclosure.basic.disclosureId,
    index: disclosure.basic.disclosureIndex,
    class: disclosure.basic.disclosureClass,
    type: disclosure.basic.disclosureType,
    category: disclosure.basic.disclosureCategory,
    title: disclosure.basic.title,
    companyKapId: disclosure.basic.companyId,
    companyName: disclosure.basic.companyName,
    summary: disclosure.summary,
    attachmentsCount: disclosure.basic.attachmentCount,
  })
    .save()
    .then((result) => {
      KAP_BIST_Disclosures_updateLastDisclosureId(config, result.kapId);
      log("KAP açıklaması kaydedildi. " + result.kapId, handleNoStockCodes);
      sendDisclosureToUsers(result);
      // downloadDisclosureDetails(result);
    })
    .catch((error) => {
      if (error.code == 11000) {
        return;
      } else {
        log("KAP açıklaması kaydedilemedi. " + error, handleNoStockCodes);
      }
    });
}

async function handleWithStockCodes(disclosure, config) {
  getBISTCompany(disclosure.basic.stockCodes).then((company) => {
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
        attachmentsCount: disclosure.basic.attachmentCount,
      })
        .save()
        .then((result) => {
          KAP_BIST_Disclosures_updateLastDisclosureId(config, result.kapId);
          log(
            "KAP açıklaması kaydedildi. " + result.kapId,
            handleWithStockCodes
          );
          sendDisclosureToUsers(result);
        })
        .catch((error) => {
          if (error.code == 11000) {
            return;
          } else {
            log("KAP açıklaması kaydedilemedi. " + error, handleWithStockCodes);
          }
        });
    } else {
      BISTCompany({
        name: disclosure.basic.companyName,
        code: disclosure.basic.stockCodes,
        city: "",
        auditor: "",
        href: "",
      })
        .save()
        .catch((error) => {
          if (error.code == 11000) {
            return;
          } else {
            log(
              "KAP açıklaması kaydedilemedi. " + error,
              getDisclosuresByIGS_ODA
            );
          }
        });
      log(
        "KAP açıklaması kaydedilemedi. " +
          disclosure.basic.stockCodes +
          " şirketi bulunamadı.",
        getDisclosuresByIGS_ODA
      );
    }
  });
}

/**
 * Asenkron olarak o güne ait olan KAP açıklamalarını senkronize eden, güncel bir açıklama var ise kullanıcılara bildiren fonksiyon.
 * @param {object} config - Yapılandırma bilgilerini içeren nesne.
 */
async function getDisclosuresByIGS_ODA(config) {
  const control_enabled = config[KEY]["control_enabled"]; // kontrol etme aktif mi?
  if (control_enabled) {
    const time_control_interval = config[KEY]["time_control_interval"]; // kontrol etme zamanının gelip gelmediğini kontrol eden süre değişkeni
    setInterval(() => {
      let last_control_time = config[KEY]["last_control_time"]; // son kontrol zamanı
      let control_interval = config[KEY]["control_interval"]; // kontrol aralığı
      let current_time_UNIX = new Date().getTime();
      if (current_time_UNIX > control_interval + last_control_time) {
        log("KAP Disclosures kontrolü geldi.", getDisclosuresByIGS_ODA);
        KAP_BIST_Disclosures_updateLastControlTime(
          config,
          new Date().getTime()
        );
        let fromDate = getToday_YYYYMMDD(); // bugünün tarihi
        let toDate = getToday_YYYYMMDD(); // bugünün tarihi
        // fromDate toDate aynı çünkü bugünün tarihindeki açıklamaları almak istiyoruz.
        let baseURL = config[KEY]["base_url"]; // KAP API adresi
        let ts = Math.round(Math.random() * 1000000000); // KAP API adresine eklenen ts parametresi, her istekte farklı oluyor, bu yüzden random bir sayı oluşturuyoruz tıpkı KAP'ın sitesindeki gibi.
        let url =
          baseURL +
          "?ts=" +
          ts +
          "&disclosureTypes=" +
          KAPDisclosuresTypes.OzelDurumAciklamasi +
          "&fromDate=" +
          fromDate +
          "&toDate=" +
          toDate +
          "&memberTypes=" +
          KAPMemberTypes.BISTSirketleri;
        axios
          .get(url)
          .then((response) => {
            let disclosures = response.data;
            disclosures.forEach((disclosure) => {
              let stockCodes = disclosure.basic.stockCodes;
              if (stockCodes == "") {
                handleNoStockCodes(disclosure, config);
              } else {
                handleWithStockCodes(disclosure, config);
              }
            });
          })
          .catch((error) => {
            log(
              "KAP açıklamaları alınamadı. " + error,
              getDisclosuresByIGS_ODA
            );
          });
      }
    }, time_control_interval);
  }
}

async function getUndownloadedDisclosures() {
  return new Promise((resolve, reject) => {
    KAPDisclosure.find({ detailsDownloaded: false })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// setDetailsDownloaded
async function setDetailsDownloaded(disclosure, value) {
  return new Promise((resolve, reject) => {
    KAPDisclosure.updateOne(
      { _id: disclosure._id },
      { detailsDownloaded: value }
    )
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = {
  getDisclosuresByIGS_ODA,
  getUndownloadedDisclosures,
  setDetailsDownloaded,
};
