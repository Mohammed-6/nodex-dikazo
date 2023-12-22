const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ordersRouter = express.Router();
const bcrypt = require("bcrypt");
const { orderSchema } = require("../../models/product");
const {
  customerLoginSchema,
  customerSchema,
} = require("../../models/customer");
// list Order
ordersRouter.post("/list-order", async function (req, res) {
  var OrderModel = mongoose.model("order", orderSchema);
  await OrderModel.find({})
    .then(async (ord) => {
      res.send({
        type: "success",
        message: "Order list",
        data: ord,
      });
    })
    .catch(function (err) {
      res.send({
        type: "error",
        message: err,
      });
    });
});

module.exports = ordersRouter;
