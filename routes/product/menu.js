const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const menuRouter = express.Router();
const bcrypt = require("bcrypt");
const { menuSchema } = require("../../models/product");

// list Attribute
menuRouter.post("/list-menu", async function (req, res) {
  var MenuModel = mongoose.model("menuList", menuSchema);
  await MenuModel.find({})
    .then(function (response) {
      res.send({
        type: "success",
        message: "menu list",
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
menuRouter.post("/add-menu", async function (req, res) {
  var MenuModel = mongoose.model("menuList", menuSchema);
  const alldata = req.body;
  delete alldata._id;
  MenuModel.create(alldata)
    .then(() => {
      res.send({
        type: "success",
        message: "menu added successfully",
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
menuRouter.post("/edit-menu", async function (req, res) {
  var MenuModel = mongoose.model("menuList", menuSchema);
  MenuModel.findOne({ _id: req.body._id }).then((response) => {
    res.send({
      type: "success",
      message: "menu edit successfully",
      data: response,
    });
  });
});

// update attribute
menuRouter.post("/update-menu", async function (req, res) {
  var MenuModel = mongoose.model("menuList", menuSchema);
  const alldata = req.body;
  MenuModel.findByIdAndUpdate({ _id: req.body._id }, alldata)
    .then((resp) => {
      res.send({
        type: "success",
        message: "menu updated successfully",
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
menuRouter.post("/delete-menu", function (req, res) {
  var MenuModel = mongoose.model("menuList", menuSchema);
  MenuModel.findByIdAndDelete(req.body.menuId).then(async function () {
    await MenuModel.find({})
      .then(function (response) {
        res.send({
          type: "success",
          message: "menu deleted successfully",
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

module.exports = menuRouter;
