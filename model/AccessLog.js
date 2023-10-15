const mongoose = require("mongoose");

const AccessLogSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TelegramUser",
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  requestType: {
    type: Number,
    default: 0,
  },
  requestContent: {
    type: String,
  },
});

module.exports = mongoose.model("AccessLog", AccessLogSchema);
