const mongoose = require("mongoose");
/**
 * BIST şirketlerini tutan schema.
 */
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
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("BISTCompany", BISTCompanySchema);
