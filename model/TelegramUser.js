const mongoose = require("mongoose");
/**
 * Telegram kullanıcısını tutan schema.
 */
const TelegramUserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
    },
    username: {
      type: String,
    },
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    is_bot: {
      type: Boolean,
      required: true,
    },
    language_code: {
      type: String,
      required: true,
    },
    access_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TelegramUser", TelegramUserSchema);
