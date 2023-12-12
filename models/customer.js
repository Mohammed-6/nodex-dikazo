const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerLoginSchema = new Schema(
  {
    customerId: { type: String, required: false },
    phone: { type: String, required: true },
    otp: { type: String, required: false },
    otpVerified: { type: Boolean, required: false },
    verifiedAttempt: { type: Number, required: false },
    accessToken: { type: String, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const customerSchema = new Schema(
  {
    phone: { type: Number, required: true },
    fullname: { type: String, required: false },
    email: { type: String, required: false },
    gender: { type: String, required: false },
    birthday: { type: String, required: false },
    altphone: { type: Number, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const customerWishlistSchema = new Schema(
  {
    customerId: { type: String, required: true },
    productId: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const customerCartSchema = new Schema(
  {
    accessToken: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "product",
    },
    isChecked: { type: Boolean, required: true, default: true },
    variantName: { type: String, required: true },
    quantity: { type: Number, required: false },
    discount: { type: Object, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports.customerLoginSchema = customerLoginSchema;
module.exports.customerSchema = customerSchema;
module.exports.customerWishlistSchema = customerWishlistSchema;
module.exports.customerCartSchema = customerCartSchema;
