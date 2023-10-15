const mongoose = require("mongoose");

const TelegramUserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    is_bot: {
      type: Boolean,
      required: true,
    },
    language_code: {
      type: String,
      required: true,
    },
    access_log_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TelegramUser", TelegramUserSchema);
