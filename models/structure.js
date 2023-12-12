const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const structureSchema = new Schema(
  {
    structureId: { type: String, required: true },
    name: { type: String, required: false },
    homepage: { type: Boolean, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const contentSchema = new Schema(
  {
    parent: { type: String, required: false },
    rowStyle: { type: Object, required: false },
    rowData: { type: Array, required: false },
    propertyData: { type: Array, required: false },
    structureName: { type: String, required: false },
    structureId: { type: String, required: false },
    version: { type: Number, required: false, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports.contentSchema = contentSchema;
module.exports.structureSchema = structureSchema;
