const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productRouter = express.Router();

const {
  brandSchema,
  colorSchema,
  productSchema,
  attributeSchema,
  categorySchema,
  productStockSchema,
} = require("../../models/product");

const sellerSchema = require("../../models/seller");

// load brand
async function loadBrand() {
  var BrandModel = mongoose.model("brand", brandSchema);
  return await BrandModel.find({})
    .then(function (response) {
      return response;
    })
    .catch(function (err) {
      return err;
    });
}

// load attibutes
async function loadAttribute() {
  var AttributeModel = mongoose.model("attribute", attributeSchema);
  return await AttributeModel.find({})
    .then(function (response) {
      return response;
    })
    .catch(function (err) {
      return err;
    });
}

// load category
async function loadCategory() {
  var CategoryModel = mongoose.model("category", categorySchema);
  return await CategoryModel.find({ status: true })
    .then(function (response) {
      return response;
    })
    .catch(function (err) {
      return err;
    });
}

// load color
async function loadColor() {
  var ProductModel = mongoose.model("color", colorSchema);
  return await ProductModel.find({})
    .then(function (response) {
      return response;
    })
    .catch(function (err) {
      return err;
    });
}

// load seller
async function loadSeller() {
  var SellerModel = mongoose.model("seller", sellerSchema);
  return await SellerModel.find({})
    .then(function (response) {
      return response;
    })
    .catch(function (err) {
      return err;
    });
}

// load add edit product resource

productRouter.post("/add-edit-product", async function (req, res) {
  const resource = {};
  loadAttribute().then(function (response) {
    resource.attribute = response;
    loadBrand().then(function (response) {
      resource.brand = response;
      loadCategory().then(function (response) {
        resource.category = response;
        loadColor().then(function (response) {
          resource.color = response;
          loadSeller().then(function (response) {
            resource.seller = response;
            res.send(resource);
          });
        });
      });
    });
  });
});

// add product
productRouter.post("/add-product", async function (req, res) {
  var ProductModel = mongoose.model("product", productSchema);
  var ProductStockModel = mongoose.model("product_stock", productStockSchema);
  const alldata = req.body;
  delete alldata._id;
  await ProductModel.create(alldata).then(async (product) => {
    const db = [];
    const reqMap = alldata.productStock.map((prd, i) => {
      alldata.productStock[i].productId = product._id;
    });
    console.log(alldata.productStock);
    await ProductStockModel.insertMany(alldata.productStock)
      .then(async (stk) => {
        res.send({
          type: "success",
          message: "product added successfully",
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
});

// edit product
productRouter.post("/edit-product", async function (req, res) {
  var ProductModel = mongoose.model("product", productSchema);
  var ProductStockModel = mongoose.model("product_stock", productStockSchema);
  await ProductModel.findOne({ _id: req.body.productId }).then(
    async (response) => {
      await ProductStockModel.find({ productId: req.body.productId }).then(
        (stk) => {
          res.send({
            type: "success",
            message: "product edit successfully",
            data: response,
            stock: stk,
          });
        }
      );
    }
  );
});

// update product
productRouter.post("/update-product", async function (req, res) {
  var ProductModel = mongoose.model("product", productSchema);
  var ProductStockModel = mongoose.model("product_stock", productStockSchema);
  const alldata = req.body;
  delete alldata.productVariation.convertVarient;
  alldata.productStock.map(async (ps) => {
    await ProductStockModel.findOneAndUpdate(
      { _id: ps._id },
      { $set: ps },
      { upsert: true }
    );
  });
  delete alldata.productStock;
  ProductModel.findOneAndUpdate({ _id: req.body._id }, alldata).then(
    (response) => {
      res.send({
        type: "success",
        message: "Product updated successfully",
        data: response,
      });
    }
  );
});

// list product
productRouter.post("/list-product", async function (req, res) {
  var ProductModel = mongoose.model("product", productSchema);
  await ProductModel.find({})
    .limit(100)
    .sort({ oldId: -1 })
    .then((resp) => {
      const resource = {};
      loadAttribute().then(function (response) {
        resource.attribute = response;
        loadBrand().then(function (response) {
          resource.brand = response;
          loadCategory().then(function (response) {
            resource.category = response;
            loadColor().then(function (response) {
              resource.color = response;
              loadSeller().then(function (response) {
                resource.seller = response;
                res.send({
                  type: "success",
                  message: "product list successfully",
                  data: resp,
                  resource: resource,
                });
              });
            });
          });
        });
      });
    })
    .catch((err) => {
      //   console.log(err);
      res.send({
        type: "error",
        message: err,
      });
    });
});

// filter product
productRouter.post("/filter-product", async function (req, res) {
  var ProductModel = mongoose.model("product", productSchema);
  const query = {
    $or: [],
    $and: [],
  };
  if (req.body.seller !== "") {
    query.$or.push({
      "productInformation.seller": new mongoose.Types.ObjectId(req.body.seller),
    });
  }
  //   if (req.body.search !== "") {
  query.$and.push({
    "productInformation.name": new RegExp(req.body.search, "i"),
  });
  if (req.body.category !== "") {
    query.$or.push({
      category: req.body.category,
    });
  }
  if (req.body.brand !== "") {
    query.$or.push({
      "productInformation.brand": new mongoose.Types.ObjectId(req.body.brand),
    });
  }
  //   console.log(query);
  ProductModel.find(query)
    .then((response) => {
      res.send({
        type: "success",
        message: "Product filter list was successfully",
        data: response,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

productRouter.post("/search-product", (req, res) => {
  var ProductModel = mongoose.model("product", productSchema);
  const BrandModel = mongoose.model("brand", brandSchema);
  const SellerModel = mongoose.model("seller", sellerSchema);
  const ProductStock = mongoose.model("product_stock", productStockSchema);
  ProductModel.find({
    "productInformation.name": new RegExp(req.body.search, "i"),
  })
    .select(
      "productInformation.name productInformation.seller productInformation.seller productImages.thumbnail seoMetaTags.url"
    )
    .populate([
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
    ])
    .limit(5)
    .exec()
    .then(async (response) => {
      const stock = [];
      response.map(async (prd, i) => {
        await ProductStock.findOne({ productId: prd._id })
          .select("sellingPrice mrp")
          .then(async function (ps) {
            stock.push(ps);
          });
        if (response.length - 1 === i) {
          res.send({
            type: "success",
            message: "Product filter list",
            data: response,
            stock: stock,
          });
        }
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

productRouter.post("/update-variation/:id", function (req, res) {
  var ProductModel = mongoose.model("product", productSchema);
  const alldata = updateVariation(req.body);
  //   console.log(req.body);
  ProductModel.findOneAndUpdate(
    { _id: req.params.id },
    { "productVariation.convertVarient": req.body }
  )
    .then((response) => {
      res.send({
        type: "success",
        message: "Product updated successfully",
        data: response,
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

// export product
productRouter.post("/export-product", async function (req, res) {
  var ProductModel = mongoose.model("product", productSchema);
  const query = {
    $or: [],
    $and: [],
  };
  if (req.body.seller !== "") {
    query.$or.push({
      "productInformation.seller": new mongoose.Types.ObjectId(req.body.seller),
    });
  }
  query.$and.push({
    "productInformation.name": new RegExp(req.body.search, "i"),
  });
  if (req.body.category !== "") {
    query.$or.push({
      category: req.body.category,
    });
  }
  if (req.body.brand !== "") {
    query.$or.push({
      "productInformation.brand": new mongoose.Types.ObjectId(req.body.brand),
    });
  }
  //   console.log(query);
  ProductModel.find(query)
    .then((response) => {
      res.send({
        type: "success",
        message: "Product export list",
        data: response,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

productRouter.post("/import-product", (req, res) => {
  var ProductModel = mongoose.model("product", productSchema);
  var ProductStockModel = mongoose.model("product_stock", productStockSchema);
  const alldata = req.body;

  // product
  alldata.product.map(async (prd, i) => {
    const colte = prd;
    colte.productVariation.convertVarient = alldata.variant[i];
    if (prd._id !== "") {
      await ProductModel.findOneAndUpdate({ _id: prd._id }, { $set: colte });
      alldata.stock[i].map(async (stk) => {
        await ProductStockModel.findOneAndUpdate(
          { productId: stk.productId, variantName: stk.variantName },
          { $set: stk },
          { upsert: true }
        );
      });
    } else {
      delete colte._id;
      colte.productVariation.convertVarient = alldata.variant[i];
      await ProductModel.create(colte).then((response) => {
        alldata.stock[i].map(async (stk) => {
          const temp = stk;
          temp.productId = response._id;
          await ProductStockModel.create(temp);
        });
      });
    }
  });
  res.send("Product updated successfully");
});

module.exports = productRouter;
