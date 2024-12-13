const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restoreRouter = express.Router();

const {
  brandSchema,
  colorSchema,
  productSchema,
  attributeSchema,
  categorySchema,
  productStockSchema,
} = require("../models/product");

const sellerSchema = require("../models/seller");

restoreRouter.post("/restore-color", async (req, res) => {
  //   console.log(req.body);
  //   res.send(req.body);
  //   return;
  const ColorModel = mongoose.model("color", colorSchema);
  await ColorModel.deleteMany({}).then(() => {
    ColorModel.insertMany(req.body).then((rest) => {
      //   console.log(rest);
    });
  });
  res.send("success");
});

restoreRouter.post("/restore-brand", async (req, res) => {
  const BrandModel = mongoose.model("brand", brandSchema);
  await BrandModel.deleteMany({}).then(() => {
    BrandModel.insertMany(req.body).then((rest) => {
      //   console.log(rest);
    });
  });
  res.send("success");
});

restoreRouter.post("/restore-category", async (req, res) => {
  const CategoryModel = mongoose.model("category", categorySchema);
  await CategoryModel.deleteMany({}).then(() => {
    CategoryModel.insertMany(req.body).then((rest) => {
      //   console.log(rest);
    });
  });
  res.send("success");
});

restoreRouter.post("/restore-category", async (req, res) => {
  const CategoryModel = mongoose.model("category", categorySchema);
  await CategoryModel.deleteMany({}).then(() => {
    CategoryModel.insertMany(req.body).then((rest) => {
      //   console.log(rest);
    });
  });
  res.send("success");
});

restoreRouter.post("/restore-seller", async (req, res) => {
  const SellerModel = mongoose.model("seller", sellerSchema);
  await SellerModel.deleteMany({}).then(() => {
    SellerModel.insertMany(req.body).then((rest) => {
      //   console.log(rest);
    });
  });
  res.send("success");
});

restoreRouter.post("/restore-product", async (req, res) => {
  const ProductModel = mongoose.model("product", productSchema);
  const SellerModel = mongoose.model("seller", sellerSchema);
  const CategoryModel = mongoose.model("category", categorySchema);
  const BrandModel = mongoose.model("brand", brandSchema);
  const ProductStockModel = mongoose.model("product_stock", productStockSchema);

  //   console.log(req.body);
  //   return;
  req.body.map(async (dd) => {
    await ProductModel.create(dd.product).then(async (rest) => {
      const iid = rest._id;
      // console.log(iid);
      if (dd.stock.length > 0) {
        dd.stock.map((stock) => {
          stock.productId = iid;
        });
      }
      if (dd.stock.length > 0) {
        await ProductStockModel.insertMany(dd.stock);
      }
      const brdslr = rest.productInformation.brdslr.split(",");
      await SellerModel.findOne({
        oldId: brdslr[1],
      })
        .then(async (sres) => {
          await CategoryModel.findOne({ oldId: rest.category }).then(
            async (cres) => {
              await BrandModel.findOne({
                oldId: brdslr[0],
              })
                .then(async (bres) => {
                  await ProductModel.findOneAndUpdate(
                    { _id: iid },
                    {
                      "productInformation.seller": sres._id,
                      category: [cres._id.toString()],
                      "productInformation.brand": bres._id,
                      $unset: { "productInformation.brdslr": "" },
                    }
                  );
                })
                .catch(async (err) => {
                  await ProductModel.findOneAndUpdate(
                    { _id: iid },
                    {
                      "productInformation.seller": sres?._id,
                      category: [cres._id.toString()],
                      $unset: { "productInformation.brdslr": "" },
                    }
                  );
                });
            }
          );
        })
        .catch(async (err) => {
          console.error(err);
        });
    });
  });
});
module.exports = restoreRouter;
