const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const frontProductRouter = express.Router();

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
} = require("../../models/customer");
const { couponSchema, addressSchema } = require("../../models/order");

const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_test_s7rXzSSkEG43th",
  key_secret: "s1jHaXqUDzoUqfZVHNnm9zbX",
});

// load color
async function loadColor(color) {
  var ProductModel = mongoose.model("color", colorSchema);
  return await ProductModel.find({ name: { $in: color } })
    .select(["name", "code"])
    .then(function (response) {
      return response;
    })
    .catch(function (err) {
      return err;
    });
}

async function getSimilarProduct(brd) {
  const ProductModel = mongoose.model("product", productSchema);
  const ProductStock = mongoose.model("product_stock", productStockSchema);
  if (brd.length === 0) {
    return [];
  }
  return await ProductModel.aggregate([
    {
      $lookup: {
        from: "brands",
        localField: "productInformation.brand",
        foreignField: "_id",
        as: "brd",
      },
    },
    {
      $project: {
        "productInformation.name": 1,
        "productInformation.brand": 1,
        "productInformation.seller": 1,
        "productImages.thumbnail": 1,
        "productVariation.colorList": 1,
        "productVariation.attributes": 1,
        "productVariation.variation": 1,
        "seoMetaTags.url": 1,
        category: 1,
        "brd.name": 1,
        "productStocks.unitPrice": 1,
        "productStocks.sellingPrice": 1,
        "productStocks.quantity": 1,
      },
    },
    {
      $match: {
        "productInformation.brand": brd,
        // approvedStatus: true,
        // publishedStatus: true,
      },
    },
  ])
    .limit(20)
    .exec()
    .then(async function (pres) {
      const promises = pres.map(async (dd, i) => {
        const ps = await ProductStock.findOne({ productId: dd._id });
        if (ps) {
          pres[i].productStocks.unitPrice = ps.mrp;
          pres[i].productStocks.sellingPrice = ps.sellingPrice;
          pres[i].productStocks.quantity = ps.quantity;
        }
        return pres[i];
      });
      return Promise.all(promises)
        .then((result) => {
          // `result` will contain the modified array
          return result;
        })
        .catch((error) => {
          // Handle errors here
          return (500).send({ type: "error", message: error.message });
        });
    });
}

async function getAlsoLikedProduct(tags) {
  const ProductModel = mongoose.model("product", productSchema);
  const ProductStock = mongoose.model("product_stock", productStockSchema);
  console.log(tags);
  if (tags.length === 0) {
    return [];
  }
  return await ProductModel.aggregate([
    {
      $lookup: {
        from: "brands",
        localField: "productInformation.brand",
        foreignField: "_id",
        as: "brd",
      },
    },
    {
      $project: {
        "productInformation.name": 1,
        "productInformation.brand": 1,
        "productInformation.seller": 1,
        "productImages.thumbnail": 1,
        "productVariation.colorList": 1,
        "productVariation.attributes": 1,
        "productVariation.variation": 1,
        "seoMetaTags.url": 1,
        category: 1,
        "brd.name": 1,
        "productStocks.unitPrice": 1,
        "productStocks.sellingPrice": 1,
        "productStocks.quantity": 1,
      },
    },
    {
      $match: {
        "productInformation.tags": { $in: tags },
        // approvedStatus: true,
        // publishedStatus: true,
      },
    },
  ])
    .limit(20)
    .exec()
    .then(async function (pres) {
      const promises = pres.map(async (dd, i) => {
        const ps = await ProductStock.findOne({ productId: dd._id });
        if (ps) {
          pres[i].productStocks.unitPrice = ps.mrp;
          pres[i].productStocks.sellingPrice = ps.sellingPrice;
          pres[i].productStocks.quantity = ps.quantity;
        }
        return pres[i];
      });
      return Promise.all(promises)
        .then((result) => {
          // `result` will contain the modified array
          return result;
        })
        .catch((error) => {
          // Handle errors here
          return (500).send({ type: "error", message: error.message });
        });
    })
    .catch((error) => {
      console.error(error);
    });
}

frontProductRouter.get("/get-product/:product", (req, res) => {
  const ProductModel = mongoose.model("product", productSchema);
  const ProductStock = mongoose.model("product_stock", productStockSchema);

  const productParam = req.params.product;
  ProductModel.countDocuments({ "seoMetaTags.url": productParam }).then(
    async function (count) {
      if (count === 0) {
        res.send({
          type: "error",
          message: "Product not found",
        });
      } else {
        await ProductModel.aggregate([
          {
            $match: {
              "seoMetaTags.url": productParam,
            },
          },
          {
            $lookup: {
              from: "brands",
              localField: "productInformation.brand",
              foreignField: "_id",
              as: "brd",
            },
          },
          {
            $project: {
              productInformation: 1,
              productImages: 1,
              productVariation: 1,
              seoMetaTags: 1,
              productDescription: 1,
              keyDescription: 1,
              category: 1,
              cod: 1,
              "brd.name": 1,
            },
          },
        ])
          .then(async (product) => {
            await ProductStock.find({
              productId: product[0]._id,
            }).then(async (stk) => {
              await loadColor(product[0].productVariation.colorList).then(
                async (color) => {
                  await getSimilarProduct(
                    product[0].productInformation.brand
                  ).then(async (smp) => {
                    await getAlsoLikedProduct(
                      product[0].productInformation.tags
                    )
                      .then(async (alslik) => {
                        res.send({
                          type: "success",
                          data: product[0],
                          color: color,
                          stock: stk,
                          similar: smp,
                          alsoliked: alslik,
                        });
                      })
                      .catch(function (err) {
                        console.error(err);
                      });
                  });
                }
              );
            });
          })
          .catch((err) => console.error(err));
      }
    }
  );
});

const checkUserLogin = (req, res, next) => {
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  CustomerLoginModel.countDocuments({
    accessToken: req.body.accessToken,
    otpVerified: true,
  }).then((count) => {
    if (count > 0) {
      next();
    } else {
      res.send({
        type: "error",
        message: "User invalid, please login again.",
        loginError: true,
      });
    }
  });
};

frontProductRouter.post(
  "/add-to-wishlist",
  checkUserLogin,
  async (req, res) => {
    const CustomerLoginModel = mongoose.model(
      "customer_login",
      customerLoginSchema
    );
    const CustomerWishlist = mongoose.model(
      "customer_wishlist",
      customerWishlistSchema
    );
    await CustomerLoginModel.findOne({
      accessToken: req.body.accessToken,
    }).then(async (result) => {
      const colte = {
        productId: req.body.productId,
        customerId: result._id.toString(),
      };
      await CustomerWishlist.countDocuments(colte).then(async (cnt) => {
        if (cnt === 0) {
          await CustomerWishlist.create(colte).then(async (result) => {
            res.send({
              type: "success",
              message: "Added to Wishlist",
              loginError: false,
            });
          });
        } else {
          res.send({
            type: "success",
            message: "Added to Wishlist",
            loginError: false,
          });
        }
      });
    });
  }
);

frontProductRouter.post("/buy-now", checkUserLogin, async (req, res) => {
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  const CustomerCart = mongoose.model("customer_cart", customerCartSchema);
  await CustomerLoginModel.findOne({
    accessToken: req.body.accessToken,
  }).then(async (result) => {
    const colte = {
      accessToken: req.body.accessToken,
      productId: req.body.productId,
      customerId: result.customerId.toString(),
      variantName: req.body.variantName,
    };
    const colte1 = {
      accessToken: req.body.accessToken,
      productId: req.body.productId,
      customerId: result.customerId.toString(),
      variantName: req.body.variantName,
      quantity: req.body.quantity,
    };
    await CustomerCart.countDocuments(colte).then(async (cnt) => {
      if (cnt === 0) {
        await CustomerCart.create(colte1).then(async (result) => {
          res.send({
            type: "success",
            message: "Added to bag",
            loginError: false,
          });
        });
      } else {
        res.send({
          type: "success",
          message: "Already added to bag!",
          loginError: false,
        });
      }
    });
  });
});

frontProductRouter.post("/get-cart-item", checkUserLogin, async (req, res) => {
  const ProductModel = mongoose.model("product", productSchema);
  const BrandModel = mongoose.model("brand", brandSchema);
  const SellerModel = mongoose.model("seller", sellerSchema);
  const ProductStock = mongoose.model("product_stock", productStockSchema);
  const CustomerCart = mongoose.model("customer_cart", customerCartSchema);

  const accessToken = req.body.accessToken;
  await CustomerCart.find({
    accessToken: accessToken,
  })
    .select("productId variantName isChecked discount quantity _id")
    .populate({
      path: "productId",
      populate: [
        {
          path: "productInformation.brand",
          model: "brand",
          select: "name",
        },
        {
          path: "productInformation.seller",
          model: "seller",
          select: "personalInfomration.name",
        },
      ],
      select:
        "productInformation productImages productStocks productVariation seoMetaTags category cod",
    })
    .exec()
    .then(async (pres) => {
      let total = 0;
      let mrp = 0;
      const processedData = await Promise.all(
        pres.map(async (prd) => {
          const stock = await ProductStock.findOne({
            productId: prd.productId._id,
            variantName: prd.variantName,
          });
          //   console.log(prd.isChecked);
          if (prd.isChecked === true) {
            mrp = mrp + stock.mrp * prd.quantity;
            total = total + stock.sellingPrice * prd.quantity;
          }
          return {
            sellingPrice: stock.sellingPrice,
            quantity: stock.quantity,
            images: stock.images,
          };
        })
      );
      //   console.log(processedData);
      res.send({
        type: "success",
        data: pres,
        stock: processedData,
        total: total,
        mrp: mrp,
      });
    });
});

frontProductRouter.post(
  "/update-cart-item-quantity",
  checkUserLogin,
  async (req, res) => {
    const ProductStock = mongoose.model("product_stock", productStockSchema);
    const CustomerCart = mongoose.model("customer_cart", customerCartSchema);

    const accessToken = req.body.accessToken;
    await CustomerCart.findOneAndUpdate(
      {
        _id: req.body.cartId,
        accessToken: accessToken,
      },
      { $set: { quantity: req.body.quantity } }
    ).then(async () => {
      res.send({
        type: "success",
      });
    });
  }
);

frontProductRouter.post(
  "/delete-cart-item",
  checkUserLogin,
  async (req, res) => {
    const ProductStock = mongoose.model("product_stock", productStockSchema);
    const CustomerCart = mongoose.model("customer_cart", customerCartSchema);

    const accessToken = req.body.accessToken;
    await CustomerCart.findOneAndDelete(
      {
        _id: req.body.cartId,
        accessToken: accessToken,
      },
      { $set: { quantity: req.body.quantity } }
    ).then(async () => {
      //   console.log(processedData);
      res.send({
        type: "success",
      });
    });
  }
);

frontProductRouter.post(
  "/update-cart-item",
  checkUserLogin,
  function (req, res) {
    const CustomerCart = mongoose.model("customer_cart", customerCartSchema);

    CustomerCart.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      { $set: { isChecked: req.body.checked } }
    ).then((count) => {
      res.send({ type: "success", message: "Cart Updated" });
    });
  }
);

frontProductRouter.post("/check-coupon", checkUserLogin, function (req, res) {
  var CouponModel = mongoose.model("coupon", couponSchema);

  CouponModel.countDocuments({
    code: req.body.code,
    validUntil: { $gte: new Date() },
  }).then((count) => {
    if (count === 0) {
      res.send({ type: "error", message: "Coupon not valid" });
    } else {
      CouponModel.findOne({
        code: req.body.code,
      }).then((cres) => {
        res.send({ type: "success", message: "Coupon valid", data: cres });
      });
    }
  });
});

frontProductRouter.post("/apply-coupon", checkUserLogin, async (req, res) => {
  const ProductStock = mongoose.model("product_stock", productStockSchema);
  const CustomerCart = mongoose.model("customer_cart", customerCartSchema);

  const accessToken = req.body.accessToken;
  await CustomerCart.updateMany(
    { accessToken: accessToken },
    {
      $set: {
        discount: {
          code: req.body.coupon.code,
          discount: req.body.coupon.discount,
          discountType: req.body.coupon.discountType,
        },
      },
    }
  );

  res.send({
    type: "success",
  });
});

frontProductRouter.post("/remove-coupon", checkUserLogin, async (req, res) => {
  const CustomerCart = mongoose.model("customer_cart", customerCartSchema);

  const accessToken = req.body.accessToken;
  await CustomerCart.updateMany(
    { accessToken: accessToken },
    {
      $unset: {
        discount: "",
      },
    }
  );

  res.send({
    type: "success",
  });
});

frontProductRouter.post("/create-order", checkUserLogin, async (req, res) => {
  const ProductStock = mongoose.model("product_stock", productStockSchema);
  const ProductModel = mongoose.model("product", productSchema);
  const CustomerCart = mongoose.model("customer_cart", customerCartSchema);
  const OrderModel = mongoose.model("order", orderSchema);
  const AddressModel = mongoose.model("address", addressSchema);
  const SellerModel = mongoose.model("seller", sellerSchema);

  const accessToken = req.body.accessToken;
  let customerId = "";
  //
  const orderin = {
    customerId: "",
    sellerId: "",
    amountTotal: "",
    orderCode: "",
    shippingCost: req.body.collect.shipping,
    accessToken: accessToken,
    paymentMethod: req.body.collect.paymentMethod,
    orderDetail: {},
    productDetail: [],
    promotionDetail: {},
    addressDetail: {},
    paymentInformation: {},
  };
  await AddressModel.findOne({ _id: req.body.collect.address }).then(
    (address) => {
      const add = {
        name: address.contactDetail.name,
        mobile: address.contactDetail.mobile,
        pincode: address.addressDetail.pincode,
        address: address.addressDetail.address,
        locality: address.addressDetail.locality,
        city: address.addressDetail.city,
        state: address.addressDetail.state,
        type: address.addressDetail.type,
      };
      orderin.addressDetail = add;
    }
  );
  await CustomerCart.find({
    accessToken: accessToken,
    isChecked: true,
  })
    .select("productId customerId isChecked variantName discount quantity _id")
    .exec()
    .then(async (pres) => {
      //   console.log(pres.length);
      customerId = pres.customerId;
      let total = 0;
      let mrp = 0;
      let discount = 0;
      await Promise.all(
        pres.map(async (prd) => {
          orderin.customerId = prd.customerId;
          const stock = await ProductStock.findOne({
            productId: prd.productId,
            variantName: prd.variantName,
          });
          total = total + stock.sellingPrice * prd.quantity;
          mrp = mrp + stock.mrp * prd.quantity;
          await ProductModel.findOne({ _id: prd.productId }).then(
            async (pr) => {
              await SellerModel.findOne({
                _id: pr.productInformation.seller,
              }).then(async (sm) => {
                const product_ = {
                  productId: pr._id,
                  stockId: stock._id,
                  name: pr.productInformation.name,
                  seoTitle: pr.seoMetaTags.url,
                  sku: stock.sku,
                  images: stock.images,
                  attribute: {
                    attribute: pr.productVariation.attributes,
                    variation: pr.productVariation.variation,
                  },
                  quantity: prd.quantity,
                  price: stock.sellingPrice,
                  mrp: stock.mrp,
                  variantName: prd.variantName,
                  height: stock.height,
                  width: stock.width,
                  length: stock.length,
                  weight: stock.weight,
                  breadth: stock.breadth,
                  discount: prd.discount,
                };
                const seller = {
                  _id: sm._id,
                  name: sm.personalInfomration.name,
                  email: sm.personalInfomration.email,
                  shopName: sm.shopInformation.shopName,
                  shopAddress: sm.shopInformation.shopAddress,
                  shopPhone: sm.shopInformation.shopPhone,
                  gst: sm.shopInformation.gst,
                  trademark: sm.shopInformation.trademark,
                };
                orderin.sellerId = sm._id;
                orderin.productDetail.push({
                  productDetail: product_,
                  shopInformation: seller,
                });
              });
            }
          );

          return {
            sellingPrice: stock.sellingPrice,
            quantity: stock.quantity,
            images: stock.images,
          };
        })
      );
      pres.map(async (prd) => {
        if (prd.discount && prd.discount !== undefined) {
          orderin.promotionDetail = {
            code: prd.discount.code,
            discount: prd.discount.discount,
            discountType: prd.discount.discountType,
          };
          if (prd.discount.discountType === "percent" && total) {
            var totalValue = total - (total * prd.discount.discount) / 100;

            discount = total - totalValue;
          } else if (prd.discount.discountType === "amount" && total) {
            discount = prd.discount.discount;
          }
        }
      });
      const now = new Date();
      const hours = now.getHours();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const day = now.getDate(); // Day of the month (1-31)
      const month = now.getMonth() + 1; // Month (0-11, add 1 to match human-readable months)
      const year = now.getFullYear(); // Full year (e.g., 2023)

      orderin.orderCode =
        "DKZ-" + year + month + day + "-" + hours + minutes + seconds;
      const amount = parseInt(total - discount);
      orderin.amountTotal = amount;
      var options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_" + Date.now(),
      };
      instance.orders.create(options, async function (err, order) {
        orderin.orderDetail = order;
        await OrderModel.create(orderin)
          .then(function (ores) {
            res.send({
              type: "success",
              data: order,
              amount: amount,
              detail: ores,
            });
          })
          .catch(function (err) {
            console.error(err);
          });
      });
    });
});

frontProductRouter.post("/confirm-order", async function (req, res) {
  const CustomerCart = mongoose.model("customer_cart", customerCartSchema);
  const OrderModel = mongoose.model("order", orderSchema);
  const ProductStock = mongoose.model("product_stock", productStockSchema);

  await OrderModel.findOne({
    "orderDetail.id": req.body.razorpay_order_id,
  }).then(async function (ord) {
    ord.productDetail.map(async function (prd) {
      const qty = prd.quantity;
      await CustomerCart.findOneAndDelete({
        productId: prd.productDetail.productId,
        accessToken: ord.accessToken,
      });
      await ProductStock.findOneAndUpdate(
        {
          _id: prd.productDetail.stockId,
        },
        { $set: { $inc: { quantity: -qty } } }
      );
    });
  });
  await OrderModel.findOneAndUpdate(
    { "orderDetail.id": req.body.razorpay_order_id },
    {
      $set: {
        paymentInformation: {
          paymentId: req.body.razorpay_payment_id,
          orderId: req.body.razorpay_order_id,
          signature: req.body.razorpay_signature,
        },
        paymentStatus: "paid",
      },
    }
  );
  res.send({ type: "success" });
});

frontProductRouter.post("/get-order-payment", async function (req, res) {
  const OrderModel = mongoose.model("order", orderSchema);

  await OrderModel.findOne({
    "orderDetail.id": req.body.orderId,
    accessToken: req.body.accessToken,
  }).then(async function (ord) {
    const colte = {
      address: ord.addressDetail,
      product: ord.productDetail[ord.productDetail.length - 1],
    };
    res.send({ type: "success", data: colte });
  });
});

module.exports = frontProductRouter;
