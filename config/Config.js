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

async function updateLastControlTime(configData, newTime) {
  // Değerleri güncelle
  configData.SPK.last_control_time = newTime;
}

async function updateLastBulten(configData, newTime, newBultenNo, newBultenDate) {
  // Değerleri güncelle
  
  configData.SPK.last_control_time = newTime;
  configData.SPK.last_bulten_no = newBultenNo;
  configData.SPK.last_bulten_date = newBultenDate;
}

module.exports = {saveConfig, getConfig, updateLastControlTime, updateLastBulten };
