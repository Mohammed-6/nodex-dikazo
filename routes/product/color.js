const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const colorRouter = express.Router();

const { colorSchema } = require("../../models/product");

// list color
colorRouter.post("/list-color", async function (req, res) {
  var ColorModel = mongoose.model("color", colorSchema);
  await ColorModel.find({})
    .then(function (response) {
      res.send({
        type: "success",
        message: "color list",
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

// add color
colorRouter.post("/add-color", async function (req, res) {
  var ColorModel = mongoose.model("color", colorSchema);
  const alldata = req.body;
  delete alldata._id;
  ColorModel.create(alldata)
    .then(() => {
      res.send({
        type: "success",
        message: "color added successfully",
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

// edit color
colorRouter.post("/edit-color", async function (req, res) {
  var ColorModel = mongoose.model("color", colorSchema);
  ColorModel.findOne({ _id: req.body._id }).then((response) => {
    res.send({
      type: "success",
      message: "color edit successfully",
      data: response,
    });
  });
});

// update color
colorRouter.post("/update-color", async function (req, res) {
  var ColorModel = mongoose.model("color", colorSchema);
  const alldata = req.body;
  ColorModel.findByIdAndUpdate({ _id: req.body._id }, alldata)
    .then((resp) => {
      res.send({
        type: "success",
        message: "color updated successfully",
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

// delete color
colorRouter.post("/delete-color", function (req, res) {
  var ColorModel = mongoose.model("color", colorSchema);
  ColorModel.findByIdAndDelete(req.body.colorId).then(async function () {
    await ColorModel.find({})
      .then(function (response) {
        res.send({
          type: "success",
          message: "color deleted successfully",
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
});

module.exports = colorRouter;
