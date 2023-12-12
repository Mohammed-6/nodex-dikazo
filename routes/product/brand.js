const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const brandRouter = express.Router();
const bcrypt = require("bcrypt");

const { brandSchema } = require("../../models/product");

// list Brand
brandRouter.post("/list-brand", async function (req, res) {
  var BrandModel = mongoose.model("brand", brandSchema);
  await BrandModel.find({})
    .then(function (response) {
      res.send({
        type: "success",
        message: "Brand list",
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

// add Brand
brandRouter.post("/add-brand", async function (req, res) {
  var BrandModel = mongoose.model("brand", brandSchema);
  const alldata = req.body;
  delete alldata._id;
  BrandModel.create(alldata)
    .then(() => {
      res.send({
        type: "success",
        message: "Brand added successfully",
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

// edit user
brandRouter.post("/edit-brand", async function (req, res) {
  var BrandModel = mongoose.model("brand", brandSchema);
  BrandModel.findOne({ _id: req.body._id }).then((response) => {
    res.send({
      type: "success",
      message: "Brand edit successfully",
      data: response,
    });
  });
});

// update user
brandRouter.post("/update-brand", async function (req, res) {
  var BrandModel = mongoose.model("brand", brandSchema);
  const alldata = req.body;
  BrandModel.findByIdAndUpdate({ _id: req.body._id }, alldata)
    .then((resp) => {
      res.send({
        type: "success",
        message: "Brand updated successfully",
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

// delete clinic user
brandRouter.post("/delete-brand", function (req, res) {
  var BrandModel = mongoose.model("brand", brandSchema);
  BrandModel.findByIdAndDelete(req.body.brandId).then(async function () {
    await BrandModel.find({})
      .then(function (response) {
        res.send({
          type: "success",
          message: "Brand deleted successfully",
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

module.exports = brandRouter;
