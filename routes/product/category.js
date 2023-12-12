const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const categoryRouter = express.Router();
const bcrypt = require("bcrypt");

const { categorySchema } = require("../../models/product");

// list category
categoryRouter.post("/list-category", async function (req, res) {
  var CategoryModel = mongoose.model("category", categorySchema);
  await CategoryModel.find({})
    .then(function (response) {
      res.send({
        type: "success",
        message: "category list",
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

// add category
categoryRouter.post("/add-category", async function (req, res) {
  var CategoryModel = mongoose.model("category", categorySchema);
  const alldata = req.body;
  delete alldata._id;
  CategoryModel.create(alldata)
    .then(() => {
      res.send({
        type: "success",
        message: "Category added successfully",
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
categoryRouter.post("/edit-category", async function (req, res) {
  var CategoryModel = mongoose.model("category", categorySchema);
  CategoryModel.findOne({ _id: req.body._id }).then((response) => {
    res.send({
      type: "success",
      message: "Category edit successfully",
      data: response,
    });
  });
});

// update user
categoryRouter.post("/update-category", async function (req, res) {
  var CategoryModel = mongoose.model("category", categorySchema);
  const alldata = req.body;
  CategoryModel.findByIdAndUpdate({ _id: req.body._id }, alldata)
    .then((resp) => {
      res.send({
        type: "success",
        message: "Category updated successfully",
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
categoryRouter.post("/delete-category", function (req, res) {
  var CategoryModel = mongoose.model("category", categorySchema);
  CategoryModel.findByIdAndDelete(req.body.categoryId).then(async function () {
    await CategoryModel.find({})
      .then(function (response) {
        res.send({
          type: "success",
          message: "Category deleted successfully",
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

module.exports = categoryRouter;
