const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fs = require("fs");
const path = require("path");
const homepageRouter = express.Router();

const { structureSchema, contentSchema } = require("../../models/structure");
const { menuSchema } = require("../../models/product");

homepageRouter.get("/get-homepage-structure", function (req, res) {
  const StructureModel = mongoose.model("structure", structureSchema);
  const ContentModel = mongoose.model("content", contentSchema);

  StructureModel.findOne({ homepage: true }).then((str) => {
    ContentModel.find({ structureId: str.structureId }).then((data) => {
      res.send({ type: "success", structureId: str.structureId, data: data });
    });
  });
});

homepageRouter.get("/get-page-structure/:pageid", function (req, res) {
  const pageid = req.params.pageid;
  const StructureModel = mongoose.model("structure", structureSchema);
  const ContentModel = mongoose.model("content", contentSchema);

  StructureModel.findOne({ structureId: pageid }).then((str) => {
    ContentModel.find({ structureId: str.structureId }).then((data) => {
      res.send({ type: "success", structureId: str.structureId, data: data });
    });
  });
});

homepageRouter.get("/load-header", function (req, res) {
  const MenuModel = mongoose.model("menulist", menuSchema);
  const filePath = path.join(__dirname, "../../public", "keywords.json");

  MenuModel.find({}).then(async (men) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      const jsonData = JSON.parse(data);
      const excludeProductId = jsonData.map(({ productId, ...rest }) => rest);
      res.send({
        type: "success",
        data: { keyword: excludeProductId, menu: men },
      });
    });
  });
});

module.exports = homepageRouter;
