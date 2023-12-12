const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pageCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    seoMetaTags: {
      url: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: false },
      image: { type: String, required: false },
    },
    category: { type: Array, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = pageCategorySchema;
