const mongoose = require("mongoose");
const express = require("express");
const uploadRouter = express.Router();
const multer = require("multer");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const AWS = require("aws-sdk");
const fs = require("fs");
const { attachmentSchema } = require("../models/customer");
const UploadModel = mongoose.model("upload", attachmentSchema);

var storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: function (req, file, cb) {
    //req.body is empty...
    //How could I get the new_file_name property sent from client here?
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.static("./public/uploads"));

uploadRouter.post("/upload", upload.array("attachment"), uploadFiles);
async function uploadFiles(req, res) {
  let alt = [];
  await req.files.forEach(async function (file, i) {
    // console.log(alt);
    alt.push(file.path);
    if (req.files.length - 1 === i) {
      res.json({ data: alt });
    }
  });
}

uploadRouter.post("/upload-single", upload.array("attachment"), uploadFile);
async function uploadFile(req, res) {
  const colte = {
    destination: req.files[0].destination,
    encoding: req.files[0].encoding,
    fieldname: req.files[0].fieldname,
    filename: req.files[0].filename,
    mimetype: req.files[0].mimetype,
    originalname: req.files[0].originalname,
    path: req.files[0].path,
    size: req.files[0].size,
  };
  await UploadModel.create(colte)
    .then(function (result) {
      res.json({
        status: true,
        message: "File uploaded successfully",
        data: req.files[0].path,
      });
    })
    .catch(function (err) {
      res.json({ status: false, message: "Error!", data: err });
    });
}

module.exports = uploadRouter;
