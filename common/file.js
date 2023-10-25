const axios = require("axios");
const fs = require("fs");

/**
 *
 * @param {string} url - İndirilecek dosyanın url'i
 * @param {string} path  - İndirilecek dosyanın kaydedileceği yol
 * @param {number} timeout - İndirme işleminin timeout süresi
 * @returns
 */
const downloadFile = async (url, path, timeout = 2) => {
  const writer = fs.createWriteStream(path);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: timeout * 1000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    },
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};


module.exports = { downloadFile };
