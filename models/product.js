const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const brandSchema = new Schema(
  {
    oldId: { type: Number, required: false },
    name: { type: String, required: true },
    brandLogo: { type: String, required: false },
    metaTitle: { type: String, required: false },
    metaDescription: { type: String, required: false },
    status: { type: Boolean, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const attributeSchema = new Schema(
  {
    name: { type: String, required: true },
    attributeValue: { type: [], required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const categorySchema = new Schema(
  {
    oldId: { type: Number, required: false },
    name: { type: String, required: true },
    banner: { type: String, required: false },
    icon: { type: String, required: false },
    metaTitle: { type: String, required: false },
    metaDescription: { type: String, required: false },
    status: { type: Boolean, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const colorSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const convertVarientSchema = new Schema({
  variantName: { type: String },
  variantPrice: { type: Number },
  variantQuantity: { type: Number },
  variantImage: [],
});

const productSchema = new Schema(
  {
    oldId: { type: String, required: false },
    productInformation: {
      name: { type: String, required: true },
      brand: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "brand",
      },
      seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "seller",
      },
      brdslr: { type: String, required: false },
      unit: { type: String, required: false },
      weight: { type: String, required: false },
      packOf: { type: String, required: false },
      minPurchaseQty: { type: String, required: false },
      tags: [],
      barcode: { type: String, required: false },
      refundable: { type: Boolean, required: false },
      height: { type: Number, required: false },
      width: { type: Number, required: false },
      length: { type: Number, required: false },
      breadth: { type: Number, required: false },
    },
    productImages: {
      images: [],
      thumbnail: { type: String, required: false },
    },
    productVideos: {
      videoProvider: { type: String, required: false },
      videoLink: { type: String, required: false },
    },
    productVariation: {
      isColor: { type: Boolean, required: false },
      colorList: [],
      attributes: [],
      variation: [],
      convertVarient: [convertVarientSchema],
    },
    productStocks: {
      unitPrice: { type: String, required: false }, // mrp
      sellerPrice: { type: String, required: false },
      sellingPrice: { type: String, required: false },
      discountFrom: { type: String, required: false },
      discountTo: { type: String, required: false },
      discount: { type: Number, required: false },
      sku: { type: String, required: false },
      hsn: { type: String, required: false },
      quantity: { type: Number, required: false },
      discountType: { type: String, required: false },
      setPoint: { type: Number, required: false },
      externalLink: { type: String, required: false },
      externalLinkText: { type: String, required: false },
    },
    productDescription: { type: String, required: false },
    keyDescription: { type: Array, required: false },
    pdfSpecification: { type: String, required: false },
    seoMetaTags: {
      url: { type: String, required: false },
      title: { type: String, required: false },
      description: { type: String, required: false },
      image: { type: String, required: false },
    },
    category: [],
    shippingConfig: {
      freeShipping: { type: Boolean, required: false },
      flatRate: { type: Boolean, required: false },
      shippingCost: { type: Number, required: false },
      isProductQtyMultiple: { type: Boolean, required: false },
    },
    lowStockQuantityWarning: { type: Number, required: false },
    stockVisibilityState: {
      showStockQuantity: { type: Boolean, required: false },
      showStockWithTextOnly: { type: Boolean, required: false },
      hideStock: { type: Boolean, required: false },
    },
    cod: { type: Boolean, required: false },
    featured: { type: Boolean, required: false },
    approvedStatus: { type: Boolean, required: false },
    publishedStatus: { type: Boolean, required: false },
    todaysDeal: { type: Boolean, required: false },
    estimatedShippingTime: { type: String, required: false },
    feeAndCharges: {
      platFormFee: { type: Number, required: false },
      paymentGatewayFee: { type: Number, required: false },
      gst: { type: Number, required: false },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
  {
    strictPopulate: false, // Allow population of fields not explicitly defined in the schema
  }
);

const productStock = new Schema(
  {
    productId: { type: String, required: true },
    variantName: { type: String, required: true },
    sku: { type: String, required: false },
    slug: { type: String, required: false },
    sellerPrice: { type: Number, required: false },
    sellingPrice: { type: Number, required: false },
    mrp: { type: Number, required: false },
    gst: { type: Number, required: false },
    platformFee: { type: Number, required: false },
    logisticFee: { type: Number, required: false },
    paymentGatewayFee: { type: Number, required: false },
    quantity: { type: Number, required: false },
    finalStock: { type: Number, required: false },
    images: { type: Array, required: false },
    discount: { type: Number, required: false },
    discountType: { type: String, required: false },
    discription: { type: String, required: false },
    highlight: { type: String, required: false },
    rating: { type: Number, required: false },
    visibility: { type: Boolean, required: false },
    height: { type: Number, required: false },
    width: { type: Number, required: false },
    length: { type: Number, required: false },
    breadth: { type: Number, required: false },
    weight: { type: Number, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
const orderGateway = new Schema({
  amount: { type: Number, required: false },
  amount_due: { type: Number, required: false },
  amount_paid: { type: Number, required: false },
  attempts: { type: Number, required: false },
  created_at: { type: Number, required: false },
  currency: { type: String, required: false },
  entity: { type: String, required: false },
  id: { type: String, required: false },
  notes: { type: Array, required: false },
  offer_id: { type: String, required: false },
  receipt: { type: String, required: false },
  status: { type: String, required: false },
});

const productDetail = new Schema({
  productId: { type: String, required: false },
  stockId: { type: String, required: false },
  name: { type: String, required: false },
  seoTitle: { type: String, required: false },
  sku: { type: String, required: false },
  images: { type: Array, required: false },
  attribute: { type: Object, required: false },
  quantity: { type: Number, required: false },
  price: { type: Number, required: false },
  mrp: { type: Number, required: false },
  variantName: { type: String, required: false },
  height: { type: String, required: false },
  width: { type: String, required: false },
  length: { type: String, required: false },
  weight: { type: String, required: false },
  breadth: { type: String, required: false },
  discount: { type: Object, required: false },
});
const addressDetail = new Schema({
  name: { type: String, required: true },
  mobile: { type: Number, required: true },
  pincode: { type: String, required: true },
  address: { type: String, required: true },
  locality: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  type: { type: String, required: true },
});

const shopInformation = new Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, required: false },
  name: { type: String, required: true },
  email: { type: String, required: false },
  shopName: { type: String, required: false },
  shopAddress: { type: String, required: false },
  shopPhone: { type: String, required: false },
  gst: { type: String, required: false },
  trademark: { type: String, required: false },
});

const prdInfo = new Schema({
  productDetail: productDetail,
  shopInformation: shopInformation,
});

const paymentInformation = new Schema({
  paymentId: { type: String, required: false },
  orderId: { type: String, required: false },
  signature: { type: String, required: false },
});
const promotionSchema = new Schema({
  code: { type: String, required: false },
  discount: { type: String, required: false },
  discountType: { type: String, required: false },
});
const orderSchema = new Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amountTotal: { type: Number, required: true },
    orderCode: { type: String, required: true },
    accessToken: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    shippingCost: { type: String, required: true },
    paymentStatus: { type: String, required: false, default: "unpaid" },
    orderDetail: orderGateway,
    productDetail: [prdInfo],
    promotionDetail: promotionSchema,
    addressDetail: addressDetail,
    paymentInformation: paymentInformation,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports.attributeSchema = attributeSchema;
module.exports.brandSchema = brandSchema;
module.exports.categorySchema = categorySchema;
module.exports.colorSchema = colorSchema;
module.exports.productSchema = productSchema;
module.exports.productStockSchema = productStock;
module.exports.orderSchema = orderSchema;
