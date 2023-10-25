const { log } = require("../common/logging.js");
const {
  KAP_BIST_DISCLOSURES_DETAIL_DOWNLOADED_updateLastControlTime,
} = require("../config/Config.js");
const { downloadFile } = require("../common/file.js");
const axios = require("axios");
const cheerio = require("cheerio");
const {
  getUndownloadedDisclosures,
  setDetailsDownloaded,
} = require("./KAPDisclosuresEvent.js");
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
    setInterval(async () => {
      let last_control_time = config[KEY]["last_control_time"]; // son kontrol zamanı
      let control_interval = config[KEY]["control_interval"]; // kontrol aralığı
      let current_time_UNIX = new Date().getTime();
      if (current_time_UNIX > control_interval + last_control_time) {
        log(
          "KAP Disclosures Detail İndirme kontrolü geldi.",
          syncDisclosuresDetail
        );
        KAP_BIST_DISCLOSURES_DETAIL_DOWNLOADED_updateLastControlTime(
          config,
          new Date().getTime()
        );
        const disclosures = await getUndownloadedDisclosures();
        log(
          "İndirilmemiş açıklamalar: " + disclosures.length,
          syncDisclosuresDetail
        );
        for (let i = 0; i < disclosures.length; i++) {
          try {
            await downloadDisclosureDetail(config, disclosures[i]);
          } catch (error) {
            log(
              "KAP açıklaması indirilemedi. Hata: " + error,
              syncDisclosuresDetail
            );
          }
        }
      }
    }, time_control_interval);
  }
}


async function downloadDisclosureDetail(config, disclosure) {
  return new Promise(async (resolve, reject) => {
    let fileName = disclosure.index + ".pdf";
    let fileLoc = "./data/KAPDisclosuresDetails/" + fileName;
    let url = config[KEY]["downloadPdf_url"] + disclosure.index;
    if (disclosure.attachmentsCount === 0) {
      try {
        await downloadFile(url, fileLoc);
        setDetailsDownloaded(disclosure, true);
        resolve("Dosya indirildi.");
      } catch (error) {
        reject(error);
      }
    } else {
      let detailUrl = config[KEY]["detail_url"] + disclosure.index + "#";
      let response = await axios.get(detailUrl);
      let $ = cheerio.load(response.data);
      let attachments = [];
      let modalDiv = $("div.modal-attachments");
      modalDiv.find("a[target='_blank']").each((i, elem) => {
        attachments.push($(elem).attr("href"));
      });
      if (attachments.length > 0) {
        for (let i = 0; i < attachments.length; i++) {
          try {
            let attachmentFileName = disclosure.index + "_" + i + ".pdf";
            let attachmentFileLoc =
              "./data/KAPDisclosuresDetails/" + attachmentFileName;
            let attachmentUrl = "https://www.kap.org.tr" + attachments[i];
            await downloadFile(attachmentUrl, attachmentFileLoc);
          } catch (error) {
            reject(error);
          }
        }
        try {
          await downloadFile(url, fileLoc);
          setDetailsDownloaded(disclosure, true);
          resolve("Dosya indirildi.");
        } catch (error) {
          reject(error);
        }
      } else {
        reject("Çoklu eke sahip açıklama indirilemedi.");
      }
    }
  });
}

module.exports = { syncDisclosuresDetail };
