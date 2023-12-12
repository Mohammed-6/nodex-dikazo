const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const frontProfileRouter = express.Router();

const {
  brandSchema,
  colorSchema,
  productSchema,
  attributeSchema,
  categorySchema,
  productStockSchema,
  orderSchema,
} = require("../../models/product");

const sellerSchema = require("../../models/seller");
const {
  customerLoginSchema,
  customerWishlistSchema,
  customerCartSchema,
  customerSchema,
} = require("../../models/customer");
const { couponSchema, addressSchema } = require("../../models/order");

const generateOTP = (length) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Generates random digit (0-9)
  }
  return otp;
};

frontProfileRouter.post("/request-otp", async function (req, res) {
  const otp = generateOTP(6);
  //   const url = `https://www.fast2sms.com/dev/bulkV2?authorization=f9htlY0aujVGR6MQ2x5PzkNo3dTJbCqDBEp4XgiIWU7vncr1eA6jC3i01KZkqM7tETz9wrYoIh2aQdpm&route=dlt&sender_id=DIKAZS&message=160043&variables_values=${otp}%7C&flash=0&numbers=${req.body.phone}`;

  //   axios.get(url);

  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );

  await CustomerLoginModel.findOneAndUpdate(
    {
      accessToken: req.body.accessToken,
    },
    { $set: { otp: otp } }
  ).then(function (response) {
    res.send({
      type: "success",
      message: "OTP send successfully",
    });
  });
});

frontProfileRouter.post("/request-confirm-otp", async function (req, res) {
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  const CustomerModel = mongoose.model("customer", customerSchema);

  await CustomerLoginModel.countDocuments({
    accessToken: req.body.accessToken,
    otp: req.body.otp,
  }).then(async function (count) {
    if (count !== 0) {
      const customer = await CustomerLoginModel.findOne({
        accessToken: req.body.accessToken,
      });
      await CustomerModel.findOneAndUpdate(
        { _id: customer.customerId },
        { $set: { phone: req.body.newmobile } }
      ).then(async (cus) => {
        await CustomerLoginModel.findOneAndUpdate(
          {
            otp: req.body.otp,
            accessToken: req.body.accessToken,
          },
          { $set: { phone: req.body.newmobile } }
        ).then(function (response) {
          res.send({
            type: "success",
            message: "OTP matched! mobile number changed successfully",
            // data: response.accessToken,
          });
        });
      });
    } else {
      res.send({
        type: "error",
        message: "OTP not valid",
      });
    }
  });
});

frontProfileRouter.post("/get-profile", async function (req, res) {
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  const CustomerModel = mongoose.model("customer", customerSchema);

  await CustomerLoginModel.countDocuments({
    accessToken: req.body.accessToken,
  }).then(async function (count) {
    if (count !== 0) {
      const customer = await CustomerLoginModel.findOne({
        accessToken: req.body.accessToken,
      });
      await CustomerModel.findOneAndUpdate({ _id: customer.customerId }).then(
        async (cus) => {
          res.send({
            type: "success",
            message: "Customer found successfully",
            data: cus,
          });
        }
      );
    } else {
      res.send({
        type: "error",
        message: "Login invalid",
      });
    }
  });
});

frontProfileRouter.post("/update-profile", async function (req, res) {
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  const CustomerModel = mongoose.model("customer", customerSchema);

  await CustomerLoginModel.countDocuments({
    accessToken: req.body.accessToken,
  }).then(async function (count) {
    if (count !== 0) {
      const customer = await CustomerLoginModel.findOne({
        accessToken: req.body.accessToken,
      });
      delete req.body.data.phone;
      await CustomerModel.findOneAndUpdate(
        { _id: customer.customerId },
        { $set: req.body.data }
      ).then(async (cus) => {
        res.send({
          type: "success",
          message: "Customer updated successfully",
          data: cus,
        });
      });
    } else {
      res.send({
        type: "error",
        message: "Login invalid",
      });
    }
  });
});

// list Address
frontProfileRouter.post("/remove-address", async function (req, res) {
  var AddressModel = mongoose.model("address", addressSchema);
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );

  await CustomerLoginModel.countDocuments({
    accessToken: req.body.accessToken,
  }).then(async function (count) {
    if (count !== 0) {
      await AddressModel.findByIdAndDelete({ _id: req.body.addressId })
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
    }
  });
});

// update default Address
frontProfileRouter.post("/update-default-address", async function (req, res) {
  var AddressModel = mongoose.model("address", addressSchema);
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );

  await CustomerLoginModel.countDocuments({
    accessToken: req.body.accessToken,
  }).then(async function (count) {
    if (count !== 0) {
      const customer = await CustomerLoginModel.findOne({
        accessToken: req.body.accessToken,
      });
      await AddressModel.updateMany(
        { customerId: customer.customerId },
        { $set: { isDefault: false } }
      );
      await AddressModel.findByIdAndUpdate(
        { _id: req.body.addressId, customerId: customer.customerId },
        { $set: { isDefault: true } }
      )
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
    }
  });
});

// list coupons
frontProfileRouter.post("/list-profile-coupon", async function (req, res) {
  var CouponModel = mongoose.model("coupon", couponSchema);
  await CouponModel.find({
    validUntil: { $gte: new Date() },
  })
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

// list coupons
frontProfileRouter.post("/list-profile-orders", async function (req, res) {
  var OrderModel = mongoose.model("order", orderSchema);
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );

  const customer = await CustomerLoginModel.findOne({
    accessToken: req.body.accessToken,
  });
  await OrderModel.find({
    customerId: customer.customerId,
  })
    .then(function (response) {
      res.send({
        type: "success",
        message: "Order list",
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

// list coupons
frontProfileRouter.post("/list-profile-order/:id", async function (req, res) {
  var OrderModel = mongoose.model("order", orderSchema);
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );

  const customer = await CustomerLoginModel.findOne({
    accessToken: req.body.accessToken,
  });
  await OrderModel.findOne({
    customerId: customer.customerId,
    _id: req.params.id,
  })
    .then(function (response) {
      res.send({
        type: "success",
        message: "Order list",
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

module.exports = frontProfileRouter;
