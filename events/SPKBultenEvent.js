const { getTimeForLog } = require("../common/time.js");
const {
  getConfig,
  updateLastControlTime,
  updateLastBulten,
} = require("../config/Config.js");
const { downloadFile } = require("../common/file.js");
const { sendMessageToAllTelegramUsers } = require("../events/TelegramEvent.js");
const strings = require("../constants/Strings.js");

const axios = require("axios");
const cheerio = require("cheerio");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // SSL sertifikası olmayan siteler için


async function notifyUsersForNewSPKBulten(config) {
  
  const bulten_control_enabled = config["SPK"]["bulten_control_enabled"];

  if (bulten_control_enabled) {
    const bulten_time_control_interval =
      config["SPK"]["bulten_time_control_interval"];

    setInterval(() => {
      let last_control_time = config["SPK"]["last_control_time"];
      let bulten_control_interval = config["SPK"]["bulten_control_interval"];
      let current_time_UNIX = new Date().getTime();
      if (current_time_UNIX > bulten_control_interval + last_control_time) {
        console.log(getTimeForLog() + "Bülten kontrolü geldi.");
        let last_bulten_no = config["SPK"]["last_bulten_no"];
        axios
          .get(config["SPK"]["bulten_url"])
          .then((response) => {
            const $ = cheerio.load(response.data);
            const bultenListDiv = $(".liste");
            const bultenLinks = bultenListDiv.find("a");

            const link = bultenLinks[0];
            const href = $(link).attr("href");
            const liste_baslik = $(link).find(".liste-baslik");
            const baslik_text = liste_baslik
              .text()
              .trim()
              .replace("Bülten No : ", "")
              .replace("/", "-");
            const liste_icerik = $(link).find(".liste-icerik");
            const icerik_text = liste_icerik
              .text()
              .trim()
              .replace("Yayımlanma : ", "");

            if (last_bulten_no == baslik_text) {
              console.log(getTimeForLog() + "Yeni bülten yok.");

              updateLastControlTime(config, new Date().getTime());
              return;
            } else {
              console.log(getTimeForLog() + "Yeni bülten var, indiriliyor. ");

              sendMessageToAllTelegramUsers(
                strings.NEW_BULTEN_MESSAGE(baslik_text, href)
              );

              downloadFile(href, `./data/bultenler/${baslik_text}.pdf`)
                .then(() => {
                  console.log(
                    `${getTimeForLog()}${baslik_text} numaralı bülten indirildi.`
                  );

                  updateLastBulten(
                    config,
                    new Date().getTime(),
                    baslik_text,
                    icerik_text,
                    href
                  );
                })
                .catch((error) => {
                  console.error(
                    getTimeForLog() + "Dosya indirme sırasında hata oluştu:",
                    error
                  );
                });
            }
          })
          .catch((error) => {
            console.error("Hata oluştu:", error);
          });
      }
    }, bulten_time_control_interval);
  }
}

module.exports = { notifyUsersForNewSPKBulten };
