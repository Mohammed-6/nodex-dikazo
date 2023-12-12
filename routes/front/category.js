const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const frontCategoryRouter = express.Router();

const {
  brandSchema,
  colorSchema,
  productSchema,
  attributeSchema,
  categorySchema,
  productStockSchema,
} = require("../../models/product");

const sellerSchema = require("../../models/seller");
const pageCategorySchema = require("../../models/page-category");

// load brand
async function loadBrand(brand) {
  var BrandModel = mongoose.model("brand", brandSchema);
  return await BrandModel.find({ _id: { $in: brand } })
    .select(["name", "_id"])
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
async function loadCategory(cats) {
  var CategoryModel = mongoose.model("category", categorySchema);
  return await CategoryModel.find({ _id: { $in: cats }, status: true })
    .select(["name", "_id"])
    .then(function (response) {
      return response;
    })
    .catch(function (err) {
      return err;
    });
}

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
function removeDuplicates(array) {
  return array.filter((value, index, self) => self.indexOf(value) === index);
}
function findMinMax(array) {
  const max = Math.max(...array);
  const min = Math.min(...array);
  return { max, min };
}
async function getPreload(cats) {
  const ProductStock = mongoose.model("product_stock", productStockSchema);
  const ProductModel = mongoose.model("product", productSchema);
  const resource = {};
  return await ProductModel.find({
    category: { $in: cats },
    approvedStatus: true,
    publishedStatus: true,
  }).then(async function (pres, i) {
    const brands = [];
    const colors = [];
    const category = [];
    const amountSlider = [];
    const attribute = [];
    await pres.map(async (dd) => {
      brands.push(dd.productInformation.brand);
      colors.push(dd.productVariation.colorList.toString());
      category.push(dd.category.toString());
      dd.productVariation.convertVarient !== undefined &&
        dd.productVariation.convertVarient.map((vr) => {
          amountSlider.push(parseInt(vr.variantPrice));
        });
      dd.productVariation.attributes !== undefined &&
        dd.productVariation.attributes.map((vr, i) => {
          if (vr !== "Color" && vr !== "color") {
            const searchValue = attribute.findIndex((obj) => obj.name === vr);
            if (searchValue !== -1) {
              dd.productVariation.variation[i] !== undefined &&
                dd.productVariation.variation[i].map((v) => {
                  // Value to search for
                  const valueToFind = v;

                  // Find the object with the specified value
                  const foundObject = attribute[searchValue].value.find(
                    (obj) => obj === valueToFind
                  );

                  if (!foundObject) {
                    attribute[searchValue].value.push(v);
                  }
                });
            } else {
              attribute.push({
                name: vr,
                value: dd.productVariation.variation[i],
              });
            }
          }
        });
    });
    resource.filters = {
      //   brands: removeDuplicates(brands),
      //   colors: removeDuplicates(colors),
      //   category: removeDuplicates(category),
      attribute: attribute,
      totalProducts: pres.length,
      amountSlider: findMinMax(amountSlider),
    };
    return await loadBrand(removeDuplicates(brands)).then(async function (
      response
    ) {
      resource.brand = response;
      return await loadCategory(cats).then(async function (response) {
        resource.category = response;
        return await loadColor(removeDuplicates(colors)).then(async function (
          response
        ) {
          resource.color = response;
          return resource;
        });
      });
    });
  });
}

frontCategoryRouter.get("/get-category/:categoryid", function (req, res) {
  const PageCategoryModel = mongoose.model("page_category", pageCategorySchema);
  const ProductStock = mongoose.model("product_stock", productStockSchema);
  const ProductModel = mongoose.model("product", productSchema);

  const categoryParam = req.params.categoryid;
  PageCategoryModel.countDocuments({ "seoMetaTags.url": categoryParam }).then(
    async function (count) {
      if (count === 0) {
        res.send({
          type: "error",
          message: "Category not found",
        });
      } else {
        // getPreload().then(function (dd) {
        //   console.log(dd);
        // });
        // ProductModel.find({})
        //   .select(["productInformation.brand"])
        //   .limit(20)
        //   .then((result) => {
        //     console.log(result);
        //   });
        // return;
        await PageCategoryModel.findOne({
          "seoMetaTags.url": categoryParam,
        }).then(async function (cres) {
          await ProductModel.aggregate([
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
                category: { $in: cres.category },
                // approvedStatus: true,
                // publishedStatus: true,
              },
            },
          ])
            .limit(20)
            .exec()
            .then(async function (pres) {
              getPreload(cres.category).then((ccres) => {
                pres.map(async (dd, i) => {
                  await ProductStock.findOne({ productId: dd._id }).then(
                    async function (ps) {
                      pres[i].productStocks.unitPrice = ps?.mrp;
                      pres[i].productStocks.sellingPrice = ps?.sellingPrice;
                      pres[i].productStocks.quantity = ps?.quantity;
                    }
                  );
                  if (pres.length - 1 === i) {
                    res.send({ type: "success", data: pres, resource: ccres });
                  }
                });
              });
            });
        });
      }
    }
  );
});

frontCategoryRouter.post(
  "/filter-category/:categoryid",
  async function (req, res) {
    const ProductStock = mongoose.model("product_stock", productStockSchema);
    const ProductModel = mongoose.model("product", productSchema);
    const PageCategoryModel = mongoose.model(
      "page_category",
      pageCategorySchema
    );

    const categoryParam = req.params.categoryid;
    const filter = req.body.filter;

    const pageSize = 20; // Number of items per page
    const pageNumber = req.body.page; // Page number (starting from 1)

    const skipAmount = pageNumber * pageSize;

    console.log(skipAmount);

    await PageCategoryModel.findOne({
      "seoMetaTags.url": categoryParam,
    }).then(async function (cres) {
      // category
      let cat = cres.category;
      if (filter.category.length > 0) {
        cat = filter.category;
      }
      const aggregationPipeline = [
        {
          $addFields: {
            productIdAsObjectId: {
              $toObjectId: "$productInformation.brand",
            },
          },
        },
        {
          $lookup: {
            from: "brands",
            localField: "productIdAsObjectId",
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
      ];

      const matchCondition = {};
      //category
      matchCondition.$or = [{ category: { $in: cat } }];

      // brand
      if (filter.brand.length > 0) {
        const objectIdArray = filter.brand.map(
          (str) => new mongoose.Types.ObjectId(str)
        );
        matchCondition.$and = [
          { "productInformation.brand": { $in: objectIdArray } },
        ];
      }
      // color
      if (filter.color.length > 0) {
        matchCondition.$and = [
          { "productVariation.colorList": { $in: filter.color } },
        ];
      }
      // price
      //   if (filter.price.length > 0 && filter.price[0][1] !== null) {
      //     // console.log(filter.price[0][1]);
      //     const min = filter.price[0][0];
      //     const max = filter.price[0][1];
      //     matchCondition.$and = [
      //       {
      //         "productVariation.convertVarient.variantPrice": {
      //           $gte: min,
      //           $lte: max,
      //         },
      //       },
      //     ];
      //   }
      // attribute
      if (filter.attribute.length > 0) {
        filter.attribute.map((attr) => {
          attr.value.map((val) => {
            matchCondition.$and = [
              { "productVariation.variation": { $elemMatch: { $eq: [val] } } },
            ];
          });
        });
      }
      //   matchCondition.$or = [{ approvedStatus: true }];
      aggregationPipeline.push({
        $match: matchCondition,
      });
      //   query.$and.push({
      //     category: cat,
      //   });
      //   query.$and.push({
      //     approvedStatus: true,
      //   });
      //   query.$and.push({
      //     publishedStatus: true,
      //   });
      //   console.log(query);
      await ProductModel.aggregate(aggregationPipeline)
        .skip(skipAmount)
        .limit(pageSize)
        .exec()
        .then(async function (pres) {
          pres.map(async (dd, i) => {
            await ProductStock.findOne({ productId: dd._id }).then(
              async function (ps) {
                if (ps !== null && pres[i] !== undefined) {
                  pres[i].productStocks.unitPrice = ps.mrp;
                  pres[i].productStocks.sellingPrice = ps.sellingPrice;
                  pres[i].productStocks.quantity = ps.quantity;
                  // remove
                  if (filter.price.length > 0 && filter.price[0][1] !== null) {
                    const min = filter.price[0][0];
                    const max = filter.price[0][1];
                    if (ps.sellingPrice > min && ps.sellingPrice < max) {
                      //   console.log(i);
                    } else {
                      pres.splice(i, 1);
                    }
                  }
                }
              }
            );
            if (pres.length - 1 === i) {
              res.send({ type: "success", data: pres });
            }
          });
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }
);

module.exports = frontCategoryRouter;
