// Id, class, type, category, title, companyId, companyName, stockCodes, summary,

const mongoose = require("mongoose");

const KAPDisclosureSchema = new mongoose.Schema(
  {
    kapId: {
      type: String,
      required: true,
      unique: true,
    },
    index: {
      type: Number,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    companyKapId: {
      type: String,
    },
    companyMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BISTCompany",
    },
    companyName: {
      type: String,
    },
    stockCodes: {
      type: String,
    },
    summary: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KAPDisclosure", KAPDisclosureSchema);
