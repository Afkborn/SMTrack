const mongoose = require("mongoose");

const BISTCompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    city: {
      type: String,
    },
    auditor: {
      type: String,
    },
    href: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BISTCompany", BISTCompanySchema);
