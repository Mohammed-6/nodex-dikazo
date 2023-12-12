const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const addressRouter = express.Router();
const bcrypt = require("bcrypt");
const { addressSchema } = require("../../models/order");
const {
  customerLoginSchema,
  customerSchema,
} = require("../../models/customer");
// list Address
addressRouter.post("/list-address", async function (req, res) {
  var AddressModel = mongoose.model("address", addressSchema);
  const CustomerModel = mongoose.model("customer", customerSchema);
  await CustomerModel.findOne({
    phone: req.body.customerId,
  }).then(async (cus) => {
    await AddressModel.find({ customerId: cus._id })
      .then(function (response) {
        res.send({
          type: "success",
          message: "Address list",
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

// add Address
addressRouter.post("/add-address", async function (req, res) {
  var AddressModel = mongoose.model("address", addressSchema);
  const CustomerModel = mongoose.model("customer", customerSchema);
  await CustomerModel.findOne({
    phone: req.body.customerId,
  }).then(async (cus) => {
    const alldata = req.body;
    alldata.customerId = cus._id;
    delete alldata._id;
    await AddressModel.create(alldata)
      .then(async () => {
        await AddressModel.find({ customerId: cus._id }).then((address) => {
          res.send({
            type: "success",
            message: "Address added successfully",
            data: address,
          });
        });
      })
      .catch((err) => {
        res.send({
          type: "error",
          message: err,
        });
      });
  });
});

// edit Address
addressRouter.post("/edit-address", async function (req, res) {
  var AddressModel = mongoose.model("address", addressSchema);
  AddressModel.findOne({ _id: req.body._id }).then((response) => {
    res.send({
      type: "success",
      message: "Address edit successfully",
      data: response,
    });
  });
});

// update Address
addressRouter.post("/update-address", async function (req, res) {
  var AddressModel = mongoose.model("address", addressSchema);
  const alldata = req.body;
  await AddressModel.findByIdAndUpdate(
    { _id: req.body._id },
    { $set: alldata }
  );
  await AddressModel.find({ customerId: alldata.customerId })
    .then((address) => {
      res.send({
        type: "success",
        message: "Address updated successfully",
        data: address,
      });
    })
    .catch((err) => {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// delete Address
addressRouter.post("/delete-address", function (req, res) {
  var AddressModel = mongoose.model("address", addressSchema);
  AddressModel.findByIdAndDelete(req.body.couponId).then(async function () {
    await AddressModel.find({})
      .then(function (response) {
        res.send({
          type: "success",
          message: "Address deleted successfully",
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

module.exports = addressRouter;
