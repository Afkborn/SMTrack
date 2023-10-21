const axios = require("axios");
const fs = require("fs");

/**
 * 
 * @param {string} url - İndirilecek dosyanın url'i
 * @param {string} path  - İndirilecek dosyanın kaydedileceği yol
 * @returns 
 */
const downloadFile = async (url, path) => {
  const writer = fs.createWriteStream(path);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

module.exports = { downloadFile };
