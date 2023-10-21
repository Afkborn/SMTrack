const { log } = require("../common/logging.js");
const {
  KAP_BIST_Company_updateCompanyCount,
  KAP_BIST_Company_updateLastControlTime,
} = require("../config/Config.js");
const BISTCompany = require("../model/BISTCompany.js");
const axios = require("axios");
const cheerio = require("cheerio");
const KEY = "KAP_BIST_COMPANY";

/**
 * Asenkron olarak BIST şirketlerini senkronize eden fonksiyon.
 * @param {object} config - Yapılandırma bilgilerini içeren nesne.
 */
async function syncBISTCompanies(config) {
  const control_enabled = config[KEY]["control_enabled"]; // kontrol etme aktif mi?
  if (control_enabled) {
    const time_control_interval = config[KEY]["time_control_interval"]; // kontrol etme zamanının gelip gelmediğini kontrol eden süre değişkeni
    setInterval(() => {
      let last_control_time = config[KEY]["last_control_time"]; // son kontrol zamanı
      let control_interval = config[KEY]["control_interval"]; // kontrol aralığı
      let current_time_UNIX = new Date().getTime();
      if (current_time_UNIX > control_interval + last_control_time) {
        log("KAP BIST sayısı kontrolü geldi.", syncBISTCompanies);
        let last_company_count = config[KEY]["company_count"]; // şirket sayısı
        axios
          .get(config[KEY]["base_url"] + config[KEY]["sirketler_url"])
          .then((response) => {
            const $ = cheerio.load(response.data);
            const wContainerSubContainerDiv = $(".w-container.sub-container");
            const wContainerSubContainerDiv2 = $(
              wContainerSubContainerDiv
            ).find(".w-container.sub-container");
            const companyCount = $(wContainerSubContainerDiv2).find(
              'span[style="font-weight : bold"]'
            );
            const companyCountText = $(companyCount).text().trim() * 1;

            if (last_company_count == companyCountText) {
              log("Yeni şirket yok.", syncBISTCompanies);
              KAP_BIST_Company_updateLastControlTime(
                config,
                new Date().getTime()
              );
              return;
            } else {
              let companiesList = [];
              log("Yeni şirket var, indiriliyor.", syncBISTCompanies);
              const companyLetterListDivs = $(wContainerSubContainerDiv2).find(
                "div[class='column-type7 wmargin']"
              );
              companyLetterListDivs.each(function (i, companyLetterListDiv) {
                //w-clearfix w-inline-block comp-row
                const companyListDiv = $(companyLetterListDiv).find(
                  "div[class='w-clearfix w-inline-block comp-row']"
                );
                companyListDiv.each(function (i, companyDiv) {
                  const companyAttrList = $(companyDiv).find("[class='vcell']");
                  const code = $(companyAttrList[0]).text().trim();
                  const href = $(companyAttrList[0]).attr("href");
                  const name = $(companyAttrList[1]).text().trim();
                  const city = $(companyAttrList[2]).text().trim();
                  const auditor = $(companyAttrList[3]).text().trim();
                  const company = new BISTCompany({
                    code,
                    name,
                    city,
                    auditor,
                    href,
                  });

                  company
                    .save()
                    .then(() => {
                      log(
                        `Şirket ${company.name} kayıt edildi.`,
                        syncBISTCompanies
                      );
                    })
                    .catch((error) => {
                      if (error.code === 11000) {
                        return;
                      } else {
                        log(
                          `Şirket ${company.name} kayıt edilirken hata oluştu.`,
                          syncBISTCompanies
                        );
                      }
                    });
                });
              });

              KAP_BIST_Company_updateCompanyCount(config, companyCountText);
              KAP_BIST_Company_updateLastControlTime(
                config,
                new Date().getTime()
              );
            }
          });
      }
    }, time_control_interval);
  }
}

/**
 * Şirket bilgilerini veritabanından çeken fonksiyon.
 * @param {string} code - Şirket kodu
 * @returns  {Promise} - Şirket bilgilerini döndürür.
 */
async function getBISTCompany(code) {
  return new Promise((resolve, reject) => {
    BISTCompany.findOne({ code: code })
      .then((company) => {
        if (!company) {
          resolve(null);
        } else {
          resolve(company);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Şirket bilgilerini veritabanından çeken fonksiyon.
 * @param {string} firstLetter - Şirket kodunun ilk harfi
 * @returns  {Promise} - Şirket bilgilerini döndürür.
 */
async function getBISTCompanies(firstLetter = null) {
  return new Promise((resolve, reject) => {
    if (firstLetter) {
      BISTCompany.find({ code: { $regex: "^" + firstLetter } })
        .then((companies) => {
          if (!companies) {
            resolve(null);
          } else {
            resolve(companies);
          }
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      BISTCompany.find({})
        .then((companies) => {
          if (!companies) {
            resolve(null);
          } else {
            resolve(companies);
          }
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
}

module.exports = { syncBISTCompanies, getBISTCompany, getBISTCompanies };
