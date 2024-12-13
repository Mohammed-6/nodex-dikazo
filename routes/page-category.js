const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const pageCategoryRouter = express.Router();
const pageCategorySchema = require("../models/page-category");

pageCategoryRouter.post("/list-page-category", async function (req, res) {
  const PageCategoryModel = mongoose.model("page_category", pageCategorySchema);
  PageCategoryModel.find({}).then((rest) => {
    res.send({ type: "success", message: "Successfully fetch", data: rest });
  });
});

pageCategoryRouter.post("/add-page-category", async (req, res) => {
  delete req.body._id;
  const PageCategoryModel = mongoose.model("page_category", pageCategorySchema);
  PageCategoryModel.countDocuments({
    name: req.body.name,
    "seoMetaTags.url": req.body.seoMetaTags.url,
  }).then((count) => {
    if (count !== 0) {
      res.send({ type: "error", message: "Already exists!" });
    } else {
      PageCategoryModel.create(req.body).then((rest) => {
        res.send({ type: "success", message: "Successfully created" });
      });
    }
  });
});

pageCategoryRouter.post("/edit-page-category/:id", async function (req, res) {
  const PageCategoryModel = mongoose.model("page_category", pageCategorySchema);
  PageCategoryModel.findOne({ _id: req.params.id }).then((rest) => {
    res.send({ type: "success", message: "Successfully fetch", data: rest });
  });
});

pageCategoryRouter.post("/update-page-category", function (req, res) {
  const PageCategoryModel = mongoose.model("page_category", pageCategorySchema);
  PageCategoryModel.findOneAndUpdate({ _id: req.body._id }, req.body).then(
    (rest) => {
      res.send({
        type: "success",
        message: "Successfully updated",
        data: rest,
      });
    }
  );
});

pageCategoryRouter.post("/delete-page-category/:id", async function (req, res) {
  const PageCategoryModel = mongoose.model("page_category", pageCategorySchema);
  PageCategoryModel.findByIdAndDelete(req.params.id).then((rest) => {
    PageCategoryModel.find({}).then((category) => {
      res.send({
        type: "success",
        message: "Successfully deleted",
        data: category,
      });
    });
  });
});

module.exports = pageCategoryRouter;
