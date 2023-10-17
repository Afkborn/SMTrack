const fs = require("fs");
const path = require("path");

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

async function getConfig() {
  const configFilePath = path.resolve("config.json");
  let configData = require(configFilePath);
  return configData;
}

async function SPK_updateLastControlTime(configData, newTime) {
  // Değerleri güncelle
  configData.SPK.last_control_time = newTime;
}

async function SPK_updateLastBulten(configData, newTime, newBultenNo, newBultenDate, newBultenLink) {
  // Değerleri güncelle
  
  configData.SPK.last_control_time = newTime;
  configData.SPK.last_bulten_no = newBultenNo;
  configData.SPK.last_bulten_date = newBultenDate;
  configData.SPK.last_bulten_link = newBultenLink;
}

async function CURRENCY_updateLastControlTime(configData, newTime) {
  // Değerleri güncelle
  configData.CURRENCY.last_control_time = newTime;
}


async function BIST_updateLastControlTime(configData, newTime) {
  // Değerleri güncelle
  configData.BIST.last_control_time = newTime;
}

module.exports = {saveConfig, getConfig, SPK_updateLastControlTime, SPK_updateLastBulten, CURRENCY_updateLastControlTime, BIST_updateLastControlTime };
