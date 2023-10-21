const { log } = require("../common/logging.js");
const {
  KAP_BIST_Company_updateCompanyCount,
  KAP_BIST_Company_updateLastControlTime,
} = require("../config/Config");
const BISTCompany = require("../model/BISTCompany.js");
const axios = require("axios");
const cheerio = require("cheerio");
const KEY = "KAP_BIST_COMPANY";

// const createCompanies = async (companiesList) => {
//   for (let i = 0; i < companiesList.length; i++) {
//     const company = companiesList[i];
//     const newCompany = new BISTCompany(company);
//     try {
//       await newCompany.save();
//     } catch (error) {
//       console.log("Şirket" + company + "kaydedilirken hata oluştu.", error);
//     }
//   }
//   log("Şirketler kaydedildi.", createCompanies);
// };

async function syncBISTCompaniesCount(config) {
  const control_enabled = config[KEY]["control_enabled"]; // kontrol etme aktif mi?
  if (control_enabled) {
    const time_control_interval = config[KEY]["time_control_interval"]; // kontrol etme zamanının gelip gelmediğini kontrol eden süre değişkeni
    setInterval(() => {
      let last_control_time = config[KEY]["last_control_time"]; // son kontrol zamanı
      let control_interval = config[KEY]["control_interval"]; // kontrol aralığı
      let current_time_UNIX = new Date().getTime();
      if (current_time_UNIX > control_interval + last_control_time) {
        log("KAP BIST sayısı kontrolü geldi.", syncBISTCompaniesCount);
        let last_company_count = config[KEY]["company_count"]; // şirket sayısı
        axios.get(config[KEY]["company_url"]).then((response) => {
          const $ = cheerio.load(response.data);
          const wContainerSubContainerDiv = $(".w-container.sub-container");
          const wContainerSubContainerDiv2 = $(wContainerSubContainerDiv).find(
            ".w-container.sub-container"
          );
          const companyCount = $(wContainerSubContainerDiv2).find(
            'span[style="font-weight : bold"]'
          );
          const companyCountText = $(companyCount).text().trim() * 1;

          if (last_company_count == companyCountText) {
            log("Yeni şirket yok.", syncBISTCompaniesCount);
            KAP_BIST_Company_updateLastControlTime(
              config,
              new Date().getTime()
            );
            return;
          } else {
            let companiesList = [];
            log("Yeni şirket var, indiriliyor.", syncBISTCompaniesCount);
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
                      syncBISTCompaniesCount
                    );
                  })
                  .catch((error) => {
                    if (error.code === 11000) {
                      return;
                    } else {
                      log(
                        `Şirket ${company.name} kayıt edilirken hata oluştu.`,
                        syncBISTCompaniesCount
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

module.exports = { syncBISTCompaniesCount };
