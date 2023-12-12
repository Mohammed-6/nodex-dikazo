const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const sellerRouter = express.Router();
const bcrypt = require("bcrypt");
const sellerSchema = require("../../models/seller");
// list seller
sellerRouter.post("/list-seller", async function (req, res) {
  var SellerModel = mongoose.model("seller", sellerSchema);
  await SellerModel.find({})
    .then(function (response) {
      res.send({
        type: "success",
        message: "seller list",
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

// add seller
sellerRouter.post("/add-seller", async function (req, res) {
  var SellerModel = mongoose.model("seller", sellerSchema);
  const alldata = req.body;
  delete alldata._id;
  SellerModel.create(alldata)
    .then(() => {
      res.send({
        type: "success",
        message: "seller added successfully",
        data: "successfully added",
      });
    })
    .catch((err) => {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// edit seller
sellerRouter.post("/edit-seller", async function (req, res) {
  var SellerModel = mongoose.model("seller", sellerSchema);
  SellerModel.findOne({ _id: req.body.sellerId }).then((response) => {
    res.send({
      type: "success",
      message: "seller edit successfully",
      data: response,
    });
  });
});

// update seller
sellerRouter.post("/update-seller", async function (req, res) {
  var SellerModel = mongoose.model("seller", sellerSchema);
  const alldata = req.body;
  SellerModel.findByIdAndUpdate({ _id: req.body._id }, alldata)
    .then((resp) => {
      res.send({
        type: "success",
        message: "seller updated successfully",
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

// delete seller
sellerRouter.post("/delete-seller", function (req, res) {
  var SellerModel = mongoose.model("seller", sellerSchema);
  SellerModel.findByIdAndDelete(req.body.sellerId).then(async function () {
    await SellerModel.find({})
      .then(function (response) {
        res.send({
          type: "success",
          message: "seller deleted successfully",
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

module.exports = sellerRouter;
