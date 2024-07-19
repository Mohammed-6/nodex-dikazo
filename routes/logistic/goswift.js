const axios = require("axios");
const express = require("express");
const goswiftRouter = express.Router();
const { orderSchema } = require("../../models/product");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GOSWIFT_PREFIX = "https://app.goswift.in/";
const GOSWIFT_USER = "account@biyaan.in";
const GOSWIFT_PASS = "AcountForLogistic@12";
const GOSWIFT_CLIENT = "663356ae92256f56462952e9";

async function generateToken() {
  const url = GOSWIFT_PREFIX + "integrations/v2/auth/token/" + GOSWIFT_CLIENT;
  return axios
    .post(
      url,
      { username: GOSWIFT_USER, password: GOSWIFT_PASS },
      { headers: { "Content-Type": "application/json" } }
    )
    .then((response) => {
      //   console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

goswiftRouter.post("/goswift/generate/:id", async function (req, res) {
  const OrderModel = mongoose.model("order", orderSchema);
  const token = await generateToken();
  const accessToken = token.access_token;
  const orderCode = req.params.id;
  OrderModel.findOne({ orderCode: orderCode })
    .then((result) => {
      result.productDetail.map((pd, k) => {
        let payment_mode = "COD";
        if (result.paymentMethod === "online") {
          payment_mode = "Prepaid";
        }
        const shipmentData = {
          seller_name: pd.shopInformation.name,
          seller_address: pd.shopInformation.shopAddress,
          seller_gst_tin: pd.shopInformation.gst,
          seller_gst_amount: 0,
          consignee_gst_amount: 0,
          integrated_gst_amount: 0,
          // ewbn: "string",
          order_number: result.orderCode + "-" + k,
          invoice_number: result.orderCode,
          invoice_date: result.created_at,
          // document_number: "string",
          // document_date: "string",
          // consignee_gst_tin: "string",
          consignee_name: result.addressDetail.name,
          products_desc: pd.productDetail.name,
          payment_mode: payment_mode,
          category_of_goods: "electronic",
          // hsn_code: "string",
          total_amount: pd.productDetail.price * pd.productDetail.quantity,
          tax_value: 0,
          taxable_amount: pd.productDetail.price * pd.productDetail.quantity,
          commodity_value:
            '"' + pd.productDetail.price * pd.productDetail.quantity + '"',
          cod_amount: pd.productDetail.price * pd.productDetail.quantity,
          quantity: pd.productDetail.quantity,
          // templateName: "string",
          weight:
            pd.productDetail.weight === null
              ? 1
              : parseInt(pd.productDetail.weight),
          length:
            pd.productDetail.length === null
              ? 1
              : parseInt(pd.productDetail.length),
          height:
            pd.productDetail.height === null
              ? 1
              : parseInt(pd.productDetail.height),
          width:
            pd.productDetail.width === null
              ? 1
              : parseInt(pd.productDetail.width),
          // return_reason: "string",
          drop_location: {
            location_type:
              result.addressDetail.type.charAt(0).toUpperCase() +
              result.addressDetail.type.slice(1),
            address: result.addressDetail.address,
            city: result.addressDetail.city,
            state: result.addressDetail.state,
            country: "IN",
            name: result.addressDetail.name,
            phone: result.addressDetail.mobile,
            pin: parseInt(result.addressDetail.pincode),
          },
          pickup_location: {
            name: pd.shopInformation.shopName,
          },
          return_location: {
            name: pd.shopInformation.shopName,
          },
          // what3words_address: "string",
        };
        if (req.body.number === k) {
          axios
            .put(GOSWIFT_PREFIX + "api/v1/package/create", shipmentData, {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
              },
            })
            .then(async (response) => {
              await OrderModel.updateOne(
                { productDetail: req.body.mainId },
                {
                  $set: {
                    shippingDetail: response.data,
                    shippingStatus: true,
                    shippingType: "goswift",
                  },
                }
              ).then(() => {
                OrderModel.findOne({ orderCode: orderCode }).then((resp) => {
                  res.send({
                    type: "success",
                    message: "Shipping order created successfully",
                    data: resp,
                  });
                });
              });
            })
            .catch((error) => {
              // console.error(error.response.data);
              res.send({
                type: "error",
                message: "Some error occurred",
                data: error.response.data,
              });
            });
        }
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

goswiftRouter.post("/goswift/cancel/:id", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  await axios
    .delete(
      GOSWIFT_PREFIX + "api/v1/package/cancel",

      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        params: { tracking_id: req.params.id },
      }
    )
    .then(function (response) {
      res.send({
        type: "success",
        message: "shipping order cancel successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});

goswiftRouter.post("/goswift/track/:id", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  axios
    .get(GOSWIFT_PREFIX + "api/v1/package/track/" + req.params.id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    })
    .then(function (response) {
      res.send({
        type: "success",
        message: "shipping details fetch successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});

goswiftRouter.get("/goswift/label/:id", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  axios
    .post(
      GOSWIFT_PREFIX + "api/v1/package/label",
      { ids: [req.params.id] },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      }
    )
    .then(function (response) {
      res.send({
        type: "success",
        message: "shipping details fetch successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});

goswiftRouter.post("/goswift/manifest/:id", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  axios
    .post(
      GOSWIFT_PREFIX + "data/v2/generate/manifest",
      { ids: [req.params.id] },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      }
    )
    .then(function (response) {
      res.send({
        type: "success",
        message: "shipping manifest fetch successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});

goswiftRouter.post("/goswift/add-address", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  axios
    .post(GOSWIFT_PREFIX + "api/v2/address", req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    })
    .then(function (response) {
      res.send({
        type: "success",
        message: "Address added successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});

goswiftRouter.post("/goswift/list-address", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  axios
    .get(GOSWIFT_PREFIX + "api/v2/addresses", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    })
    .then(function (response) {
      res.send({
        type: "success",
        message: "Address fetch successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});

goswiftRouter.post("/goswift/ndr/rto", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  axios
    .post(GOSWIFT_PREFIX + "api/v2/package/ndr", req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    })
    .then(function (response) {
      res.send({
        type: "success",
        message: "Ndr fetch successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});

goswiftRouter.post("/goswift/ndr/re-attempt", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  axios
    .post(GOSWIFT_PREFIX + "api/v2/package/ndr", req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    })
    .then(function (response) {
      res.send({
        type: "success",
        message: "Ndr fetch successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});

goswiftRouter.post("/goswift/pincode/service/:id", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  axios
    .get(GOSWIFT_PREFIX + "api/v2/serviceability/" + req.params.id, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    })
    .then(function (response) {
      res.send({
        type: "success",
        message: "Pincode fetch successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});

goswiftRouter.post("/goswift/add-address", async function (req, res) {
  const token = await generateToken();
  const accessToken = token.access_token;

  axios
    .post(GOSWIFT_PREFIX + "api/v2/address", req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    })
    .then(function (response) {
      res.send({
        type: "success",
        message: "Pincode fetch successfully",
        data: response.data,
      });
    })
    .catch((error) => {
      // console.error(error.response.data);
      res.send({
        type: "error",
        message: "Some error occurred",
        data: error.response.data,
      });
    });
});
module.exports = goswiftRouter;
