const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const orderRouter = express.Router();
const bcrypt = require("bcrypt");
const { couponSchema } = require("../../models/order");

// list Attribute
orderRouter.post("/list-coupon", async function (req, res) {
  var CouponModel = mongoose.model("coupon", couponSchema);
  await CouponModel.find({})
    .then(function (response) {
      res.send({
        type: "success",
        message: "Coupon list",
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
orderRouter.post("/add-coupon", async function (req, res) {
  var CouponModel = mongoose.model("coupon", couponSchema);
  const alldata = req.body;
  delete alldata._id;
  CouponModel.create(alldata)
    .then(() => {
      res.send({
        type: "success",
        message: "Coupon added successfully",
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
orderRouter.post("/edit-coupon", async function (req, res) {
  var CouponModel = mongoose.model("coupon", couponSchema);
  CouponModel.findOne({ _id: req.body._id }).then((response) => {
    res.send({
      type: "success",
      message: "Coupon edit successfully",
      data: response,
    });
  });
});

// update attribute
orderRouter.post("/update-coupon", async function (req, res) {
  var CouponModel = mongoose.model("coupon", couponSchema);
  const alldata = req.body;
  CouponModel.findByIdAndUpdate({ _id: req.body._id }, alldata)
    .then((resp) => {
      res.send({
        type: "success",
        message: "Coupon updated successfully",
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
orderRouter.post("/delete-coupon", function (req, res) {
  var CouponModel = mongoose.model("coupon", couponSchema);
  CouponModel.findByIdAndDelete(req.body.couponId).then(async function () {
    await CouponModel.find({})
      .then(function (response) {
        res.send({
          type: "success",
          message: "Coupon deleted successfully",
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

module.exports = orderRouter;
