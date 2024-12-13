const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Fuse = require("fuse.js");

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
const searchKeywordJson = require("../../public/keywords.json");

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
    for (let xx = 0; xx < pres.length; xx++) {
      const dd = pres[xx];
      brands.push(dd.productInformation.brand);
      colors.push(dd.productVariation.colorList.toString());
      category.push(dd.category.toString());
      await ProductStock.find({ productId: dd._id }).then(async (prod) => {
        for (let i = 0; i < prod.length; i++) {
          amountSlider.push(parseInt(prod[i].sellingPrice));
        }
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
    }
    resource.filters = {
      //   brands: removeDuplicates(brands),
      //   colors: removeDuplicates(colors),
      //   category: removeDuplicates(category),
      attribute: attribute,
      totalProducts: pres.length,
      amountSlider: findMinMax(amountSlider),
    };
    // console.log(amountSlider);
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

function getSearchNgramsProduct(input) {
  const options = {
    includeScore: true,
    includeMatches: true,
    threshold: 0.3,
    keys: ["keyword"],
  };
  const fuse = new Fuse(searchKeywordJson, options);
  const ngrams = generateNGrams(input);
  let results = [];

  ngrams.forEach((ngram) => {
    const matches = fuse.search(ngram);
    results = results.concat(matches);
  });

  // Remove duplicates and sort by score
  results = results
    .filter(
      (v, i, a) => a.findIndex((t) => t.item.keyword === v.item.keyword) === i
    )
    .sort((a, b) => a.score - b.score);
  const dd = results.map((result) => ({
    productId: result.item.productId,
  }));
  return dd;
}

const generateNGrams = (str) => {
  const tokens = str.split(" ").map((token) => token.toLowerCase());
  const ngrams = new Set();

  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j <= tokens.length; j++) {
      ngrams.add(tokens.slice(i, j).join(" "));
    }
  }

  return Array.from(ngrams);
};

frontCategoryRouter.post("/get-category/:categoryid", function (req, res) {
  const PageCategoryModel = mongoose.model("page_category", pageCategorySchema);
  const CategoryModel = mongoose.model("category", categorySchema);
  const ProductStock = mongoose.model("product_stock", productStockSchema);
  const ProductModel = mongoose.model("product", productSchema);

  const categoryParam = req.params.categoryid;
  PageCategoryModel.countDocuments({ "seoMetaTags.url": categoryParam }).then(
    async function (count) {
      if (count === 0) {
        const searchProduct = getSearchNgramsProduct(req.body.q);
        // if search results or direct category
        await CategoryModel.findOne({
          name: categoryParam,
        }).then(async function (cres) {
          const query = { $and: [], $or: [] };
          if (Array.isArray(searchProduct) && searchProduct.length > 0) {
            const arr = searchProduct.map((sr) => {
              return sr.productId;
            });
            query.$and.push({ _id: { $in: arr } });
            console.log(query);
          }
          query.$or.push({ category: cres._id });
          query.$and.push({ approvedStatus: true });
          query.$and.push({ publishedStatus: true });
          await ProductModel.find(query)
            .populate({ path: "productInformation.brand", select: ["name"] })
            .select([
              "productInformation.name",
              "productInformation.brand",
              "productInformation.seller",
              "productImages.thumbnail",
              "productVariation.colorList",
              "productVariation.attributes",
              "productVariation.variation",
              "seoMetaTags.url",
              "category",
              "productStocks.unitPrice",
              "productStocks.sellingPrice",
              "productStocks.quantity",
            ])
            .limit(20)
            .exec()
            .then(async function (pres) {
              getPreload([cres._id]).then((ccres) => {
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
            })
            .catch((err) => {
              console.error(err);
            });
        });
      } else {
        await PageCategoryModel.findOne({
          "seoMetaTags.url": categoryParam,
        }).then(async function (cres) {
          await ProductModel.find({
            category: { $in: cres.category },
            approvedStatus: true,
            publishedStatus: true,
          })
            .populate({ path: "productInformation.brand", select: ["name"] })
            .select([
              "productInformation.name",
              "productInformation.brand",
              "productInformation.seller",
              "productImages.thumbnail",
              "productVariation.colorList",
              "productVariation.attributes",
              "productVariation.variation",
              "seoMetaTags.url",
              "category",
              "productStocks.unitPrice",
              "productStocks.sellingPrice",
              "productStocks.quantity",
            ])
            .limit(20)
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

    // console.log(skipAmount);

    const exists = await PageCategoryModel.findOne({
      "seoMetaTags.url": categoryParam,
    }).exec();
    // console.log(exists);
    // category
    let cat = [];
    if (exists !== null) {
      // cat = [exists.category];
    }
    if (filter.category.length > 0) {
      cat = filter.category;
    }

    const matchCondition = {};
    //category
    if (cat.length > 0) {
      console.log(cat);
      matchCondition.$or = [{ category: { $in: cat } }];
    }

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
    await ProductModel.find(matchCondition)
      .populate({ path: "productInformation.brand", select: ["name"] })
      .select([
        "productInformation.name",
        "productInformation.brand",
        "productInformation.seller",
        "productImages.thumbnail",
        "productVariation.colorList",
        "productVariation.attributes",
        "productVariation.variation",
        "seoMetaTags.url",
        "category",
        "productStocks.unitPrice",
        "productStocks.sellingPrice",
        "productStocks.quantity",
      ])
      .skip(skipAmount)
      .limit(pageSize)
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
    // });
  }
);

module.exports = frontCategoryRouter;
