const mongoose = require("mongoose");
require("dotenv/config");
const {getTimeForLog} = require("../common/time");

async function mongoDbConnect() {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.MONGO_DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(getTimeForLog() + "Successfully connected to MongoDB Atlas!");
      return true;
    })
    .catch((error) => {
      console.log(getTimeForLog() + "Unable to connect to MongoDB Atlas!");
      console.error(error);
      return false;
    });
}

module.exports = mongoDbConnect;
