const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const personalInfomration = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  gender: { type: String, required: false },
  dob: { type: String, required: false },
  state: { type: String, required: false },
  city: { type: String, required: false },
  personalAddress: { type: String, required: false },
});

const bankAccountInformation = new Schema({
  bankName: { type: String, required: false },
  accountNumber: { type: String, required: false },
  accountName: { type: String, required: false },
  ifscCode: { type: String, required: false },
});

const shopInformation = new Schema({
  shopName: { type: String, required: false },
  shopAddress: { type: String, required: false },
  shopPhone: { type: String, required: false },
  gst: { type: String, required: false },
  trademark: { type: String, required: false },
});

const socialInformation = new Schema({
  instagram: { type: String, required: false },
  google: { type: String, required: false },
  facebook: { type: String, required: false },
  twitter: { type: String, required: false },
  youtube: { type: String, required: false },
});

const sellerSchema = new Schema(
  {
    oldId: { type: String, required: false },
    personalInfomration: personalInfomration,
    bankAccountInformation: bankAccountInformation,
    shopInformation: shopInformation,
    socialInformation: socialInformation,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = sellerSchema;
