const fs = require("fs");
const path = require("path");

/**
 * Yapılandırma dosyasını kaydeden fonksiyon.
 * @param {string} configFilePath
 * @param {JSON} configData
 */
async function saveConfig(configFilePath, configData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(configFilePath, JSON.stringify(configData, null, 2), (err) => {
      if (err) {
        console.error("Hata oluştu:", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Yapılandırma dosyasını okuyan fonksiyon.
 * @returns {JSON} - Yapılandırma dosyasının içeriğini döndürür.
 */
async function getConfig() {
  const configFilePath = path.resolve("config.json");
  let configData = require(configFilePath);
  return configData;
}

async function SPK_updateLastControlTime(configData, newTime) {
  configData.SPK.last_control_time = newTime;
}

async function SPK_updateLastBulten(
  configData,
  newTime,
  newBultenNo,
  newBultenDate,
  newBultenLink
) {
  configData.SPK.last_control_time = newTime;
  configData.SPK.last_bulten_no = newBultenNo;
  configData.SPK.last_bulten_date = newBultenDate;
  configData.SPK.last_bulten_link = newBultenLink;
}

async function CURRENCY_updateLastControlTime(configData, newTime) {
  configData.CURRENCY.last_control_time = newTime;
}

async function BIST_updateLastControlTime(configData, newTime) {
  configData.BIST.last_control_time = newTime;
}

async function KAP_BIST_Company_updateLastControlTime(configData, newTime) {
  configData.KAP_BIST_COMPANY.last_control_time = newTime;
}

async function KAP_BIST_Company_updateCompanyCount(configData, newCount) {
  configData.KAP_BIST_COMPANY.company_count = newCount;
}

async function KAP_BIST_Disclosures_updateLastControlTime(configData, newTime) {
  configData.KAP_BIST_DISCLOSURES.last_control_time = newTime;
}

async function KAP_BIST_Disclosures_updateLastDisclosureId(configData, newId) {
  configData.KAP_BIST_DISCLOSURES.last_disclosure_id = newId;
}
async function KAP_BIST_DISCLOSURES_DETAIL_DOWNLOADED_updateLastControlTime(configData,newTime) {
  configData.KAP_BIST_DISCLOSURES_DETAIL_DOWNLOADED.last_control_time = newTime;
}

module.exports = {
  saveConfig,
  getConfig,
  SPK_updateLastControlTime,
  SPK_updateLastBulten,
  CURRENCY_updateLastControlTime,
  BIST_updateLastControlTime,
  KAP_BIST_Company_updateLastControlTime,
  KAP_BIST_Company_updateCompanyCount,
  KAP_BIST_Disclosures_updateLastControlTime,
  KAP_BIST_Disclosures_updateLastDisclosureId,
  KAP_BIST_DISCLOSURES_DETAIL_DOWNLOADED_updateLastControlTime
};
