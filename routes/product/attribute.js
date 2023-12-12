const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const attributeRouter = express.Router();
const bcrypt = require("bcrypt");
const { attributeSchema } = require("../../models/product");

// list Attribute
attributeRouter.post("/list-attribute", async function (req, res) {
  var AttributeModel = mongoose.model("attribute", attributeSchema);
  await AttributeModel.find({})
    .then(function (response) {
      res.send({
        type: "success",
        message: "Attribute list",
        data: response,
      });
    })
    .catch(function (err) {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// add Attribute
attributeRouter.post("/add-attribute", async function (req, res) {
  var AttributeModel = mongoose.model("attribute", attributeSchema);
  const alldata = req.body;
  delete alldata._id;
  AttributeModel.create(alldata)
    .then(() => {
      res.send({
        type: "success",
        message: "Attribute added successfully",
        data: "",
      });
    })
    .catch((err) => {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// edit attribute
attributeRouter.post("/edit-attribute", async function (req, res) {
  var AttributeModel = mongoose.model("attribute", attributeSchema);
  AttributeModel.findOne({ _id: req.body._id }).then((response) => {
    res.send({
      type: "success",
      message: "Attribute edit successfully",
      data: response,
    });
  });
});

// update attribute
attributeRouter.post("/update-attribute", async function (req, res) {
  var AttributeModel = mongoose.model("attribute", attributeSchema);
  const alldata = req.body;
  AttributeModel.findByIdAndUpdate({ _id: req.body._id }, alldata)
    .then((resp) => {
      res.send({
        type: "success",
        message: "Attribute updated successfully",
        data: resp,
      });
    })
    .catch((err) => {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// delete attribute
attributeRouter.post("/delete-attribute", function (req, res) {
  var AttributeModel = mongoose.model("attribute", attributeSchema);
  AttributeModel.findByIdAndDelete(req.body.attributeId).then(
    async function () {
      await AttributeModel.find({})
        .then(function (response) {
          res.send({
            type: "success",
            message: "Attribute deleted successfully",
            data: response,
          });
        })
        .catch(function (err) {
          res.send({
            type: "error",
            message: err,
          });
        });
    }
  );
});

module.exports = attributeRouter;
