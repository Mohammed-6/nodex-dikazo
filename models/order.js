const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Coupon Schema
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // Ensure uniqueness of coupon code
    },
    discount: {
      type: Number,
      required: true,
    },
    discountType: {
      type: String,
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    // Other fields related to coupons
    minPurchase: {
      type: Number,
      required: false,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Address Schema

const contactDetail = new Schema({
  name: { type: String, required: true },
  mobile: { type: Number, required: true },
});

const addressDetail = new Schema({
  pincode: { type: String, required: true },
  address: { type: String, required: true },
  locality: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  type: { type: String, required: true },
});
const addressSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    isDefault: { type: Boolean, required: false, default: false },
    contactDetail: contactDetail,
    addressDetail: addressDetail,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports.couponSchema = couponSchema;
module.exports.addressSchema = addressSchema;
