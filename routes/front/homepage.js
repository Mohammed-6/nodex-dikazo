const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const homepageRouter = express.Router();

const { structureSchema, contentSchema } = require("../../models/structure");

homepageRouter.get("/get-homepage-structure", function (req, res) {
  const StructureModel = mongoose.model("structure", structureSchema);
  const ContentModel = mongoose.model("content", contentSchema);

  StructureModel.findOne({ homepage: true }).then((str) => {
    ContentModel.find({ structureId: str.structureId }).then((data) => {
      res.send({ type: "success", structureId: str.structureId, data: data });
    });
  });
});

module.exports = homepageRouter;
