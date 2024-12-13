const mongoose = require("mongoose");
const express = require("express");
const uploadRouter = express.Router();
const multer = require("multer");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");

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

const outputDirectory = "public/images/product";
const size = { width: 800, height: 800 }; // Desired size
const quality = 85; // Desired quality for JPEG

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

uploadRouter.post("/upload", upload.array("attachment"), uploadFiles);
async function uploadFiles(req, res) {
  const promises = req.files.map(async (file, i) => {
    try {
      const filePath = path.join(__dirname, "../" + file.path);
      const data = await fs.promises.readFile(filePath); // Use promises for cleaner async operations

      const buffer = Buffer.from(data);
      const outputFilePath = path.join(outputDirectory, file.filename);

      await sharp(buffer)
        .resize(size.width, size.height)
        .toFormat("jpeg", { quality })
        .toFile(outputFilePath);

      return outputDirectory + "/" + file.filename;
    } catch (error) {
      console.error(`Error processing image from URL: ${url}`, error);
      throw error; // Re-throw the error to be handled in the Promise.all
    }
  });

  try {
    const alt = await Promise.all(promises);
    res.json({
      status: true,
      message: "File uploaded successfully",
      data: alt,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).send("Error uploading files");
  }
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

// thumbnail_
const thumbnail_outputDirectory = "public/images/thumbnail";
const thumbnail_size = { width: 300, height: 300 }; // Desired size
const thumbnail_quality = 85; // Desired quality for JPEG

if (!fs.existsSync(thumbnail_outputDirectory)) {
  fs.mkdirSync(thumbnail_outputDirectory, { recursive: true });
}
uploadRouter.post("/upload-thumbnail", upload.array("attachment"), uploadFile);
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
  console.log(colte);
  await UploadModel.create(colte)
    .then(async function (result) {
      try {
        const filePath = path.join(__dirname, "../" + req.files[0].path);

        fs.readFile(filePath, async (err, data) => {
          if (err) {
            console.error("Error reading file:", err);
            return res.status(500).send("Error reading file");
          }

          // Send the file as array buffer
          const buffer = Buffer.from(data);
          const outputFilePath = path.join(
            thumbnail_outputDirectory,
            req.files[0].filename
          );

          await sharp(buffer)
            .resize(thumbnail_size.width, thumbnail_size.height)
            .toFormat("jpeg", { thumbnail_quality })
            .toFile(outputFilePath);
          res.json({
            status: true,
            message: "File uploaded successfully",
            data: thumbnail_outputDirectory + "/" + req.files[0].filename,
          });
        });

        // console.log(`Processed image ${index + 1} from URL: ${url}`);
      } catch (error) {
        console.error(`Error processing image from URL: ${url}`, error);
      }
    })
    .catch(function (err) {
      res.json({ status: false, message: "Error!", data: err });
    });
}

module.exports = uploadRouter;
