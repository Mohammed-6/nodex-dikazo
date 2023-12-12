const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const structureRouter = express.Router();

const { structureSchema, contentSchema } = require("../../models/structure");

structureRouter.post("/create-structure", function (req, res) {
  const StructureModel = mongoose.model("structure", structureSchema);
  StructureModel.countDocuments({ structureId: req.body.structureId }).then(
    (count) => {
      if (count === 0) {
        StructureModel.create(req.body).then((resp) => {
          res.send({
            type: "success",
            message: "Content created successfully",
            data: resp,
          });
        });
      } else {
        res.send({
          type: "success",
          message: "Content already created",
        });
      }
    }
  );
});

structureRouter.post("/list-structure", function (req, res) {
  const StructureModel = mongoose.model("structure", structureSchema);
  StructureModel.find({}).then((resp) => {
    res.send({
      type: "success",
      message: "successfully",
      data: resp,
    });
  });
});

structureRouter.post("/update-structure", function (req, res) {
  const StructureModel = mongoose.model("structure", structureSchema);
  StructureModel.findOneAndUpdate(
    {
      structureId: req.body.structureId,
    },
    { $set: req.body }
  ).then((resp) => {
    res.send({
      type: "success",
      message: "Structure updated successfully",
      data: resp,
    });
  });
});

structureRouter.post("/get-structure", function (req, res) {
  const StructureModel = mongoose.model("structure", structureSchema);
  StructureModel.findOne({
    structureId: req.body.structureId,
  }).then((resp) => {
    res.send({
      type: "success",
      message: "Structure get successfully",
      data: resp,
    });
  });
});

structureRouter.post("/homepage-update-structure", async function (req, res) {
  const StructureModel = mongoose.model("structure", structureSchema);
  await StructureModel.findOneAndUpdate(
    {
      structureId: req.body.structureId,
    },
    { $set: req.body }
  ).then(async (resp) => {
    await StructureModel.find({}).then((datas) => {
      res.send({
        type: "success",
        message: "Structure updated successfully",
        data: datas,
      });
    });
  });
});

structureRouter.post("/delete-structure", function (req, res) {
  const StructureModel = mongoose.model("structure", structureSchema);
  StructureModel.findOneAndDelete({ structureId: req.body.structureId }).then(
    (ress) => {
      StructureModel.find({}).then((resp) => {
        res.send({
          type: "success",
          message: "successfully",
          data: resp,
        });
      });
    }
  );
});

structureRouter.post("/create-content", function (req, res) {
  const ContentModel = mongoose.model("content", contentSchema);
  ContentModel.create(req.body).then((resp) => {
    res.send({
      type: "success",
      message: "Content created successfully",
      data: resp,
    });
  });
});

structureRouter.post("/get-content", function (req, res) {
  const ContentModel = mongoose.model("content", contentSchema);
  ContentModel.countDocuments({
    structureId: req.body.structureId,
    parent: req.body.parent,
  }).then((count) => {
    if (count === 0) {
      ContentModel.create(req.body).then((resp) => {
        res.send({
          type: "success",
          message: "Content created successfully",
          data: [resp],
        });
      });
    } else {
      ContentModel.find({
        structureId: req.body.structureId,
        parent: req.body.parent,
      }).then((resp) => {
        res.send({
          type: "success",
          message: "Content created successfully",
          data: resp,
        });
      });
    }
  });
});

structureRouter.post("/update-content", function (req, res) {
  const ContentModel = mongoose.model("content", contentSchema);
  ContentModel.findOneAndUpdate(
    {
      structureId: req.body.structureId,
      structureName: req.body.structureName,
    },
    { $set: req.body }
  ).then((resp) => {
    res.send({
      type: "success",
      message: "Content updated successfully",
      data: resp,
    });
  });
});

module.exports = structureRouter;
