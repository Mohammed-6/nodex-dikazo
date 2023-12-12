const express = require("express");
const uploadRouter = express.Router();
const multer = require("multer");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const AWS = require("aws-sdk");
const fs = require("fs");

// Configure AWS SDK
AWS.config.update({
  accessKeyId: "AKIA2OT2XIIGRVOMXSNP",
  secretAccessKey: "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",
  region: "ap-south-1",
});

const s3 = new AWS.S3();

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
  const alt = [];
  await req.files.forEach(async function (file, i) {
    const ll = await uploadToS3(file);
    alt.push(ll.Location);
    // console.log(alt);
    if (req.files.length - 1 === i) {
      res.json(alt);
    }
  });
}

uploadRouter.post("/upload-single", upload.array("attachment"), uploadFile);
async function uploadFile(req, res) {
  const ll = await uploadToS3(req.files[0]);
  res.json(ll.Location);
}

async function uploadToS3(file) {
  // Upload a file to S3
  const params = {
    Bucket: "dikazo-te-ecom",
    Key: file.filename,
    Body: fs.createReadStream("public/uploads/" + file.filename),
  };

  var s3upload = s3.upload(params).promise();
  return s3upload
    .then(function (data) {
      //   console.log(data);
      return data;
    })
    .catch(function (err) {
      return err;
    });
}

module.exports = uploadRouter;
