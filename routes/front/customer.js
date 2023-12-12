const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const Schema = mongoose.Schema;

const customerRouter = express.Router();

const {
  customerLoginSchema,
  customerSchema,
} = require("../../models/customer");

const generateRandomAlphanumeric = (length) => {
  const alphanumericChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
    result += alphanumericChars.charAt(randomIndex);
  }

  return result;
};

const generateOTP = (length) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Generates random digit (0-9)
  }
  return otp;
};

customerRouter.post("/generate-otp", function (req, res) {
  const otp = generateOTP(6);
  //   const url = `https://www.fast2sms.com/dev/bulkV2?authorization=f9htlY0aujVGR6MQ2x5PzkNo3dTJbCqDBEp4XgiIWU7vncr1eA6jC3i01KZkqM7tETz9wrYoIh2aQdpm&route=dlt&sender_id=DIKAZS&message=160043&variables_values=${otp}%7C&flash=0&numbers=${req.body.phone}`;

  //   axios.get(url);
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  const CustomerModel = mongoose.model("customer", customerSchema);
  CustomerModel.countDocuments({
    phone: req.body.phone,
  }).then(async (count) => {
    if (count === 0) {
      await CustomerModel.create({ phone: req.body.phone }).then(
        async (cus) => {
          await CustomerLoginModel.create({
            phone: req.body.phone,
            otp: otp,
            accessToken: generateRandomAlphanumeric(30),
            verifiedAttempt: 0,
            customerId: cus._id,
          }).then(function (response) {
            res.send({
              type: "success",
              message: "OTP send successfully",
              data: response.accessToken,
            });
          });
        }
      );
    } else {
      await CustomerModel.findOne({ phone: req.body.phone }).then(
        async (cus) => {
          await CustomerLoginModel.create({
            phone: req.body.phone,
            otp: otp,
            accessToken: generateRandomAlphanumeric(30),
            verifiedAttempt: 0,
            customerId: cus._id,
          }).then(function (response) {
            res.send({
              type: "success",
              message: "OTP send successfully",
              data: response.accessToken,
            });
          });
        }
      );
    }
  });
});

customerRouter.post("/confirm-otp", function (req, res) {
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  CustomerLoginModel.countDocuments({
    accessToken: req.body.accessToken,
    otp: req.body.otp,
    verifiedAttempt: { $lt: 5 },
  }).then((count) => {
    if (count === 0) {
      CustomerLoginModel.findOneAndUpdate(
        { accessToken: req.body.accessToken, otp: req.body.otp },
        {
          $set: {
            $inc: { verifiedAttempt: 1 },
          },
        }
      );
      res.send({ type: "error", message: "OTP not valid", verified: false });
    } else {
      CustomerLoginModel.findOneAndUpdate(
        { accessToken: req.body.accessToken, otp: req.body.otp },
        {
          $set: {
            otpVerified: true,
          },
        }
      ).then(function (response) {
        res.send({
          type: "success",
          message: "OTP verify successfully",
          data: response.accessToken,
          verified: true,
        });
      });
    }
  });
});

module.exports = customerRouter;
