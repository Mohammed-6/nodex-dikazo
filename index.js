const express = require("express");

const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const uploadRouter = require("./routes/upload");
const categoryRouter = require("./routes/product/category");
const brandRouter = require("./routes/product/brand");
const attributeRouter = require("./routes/product/attribute");
const colorRouter = require("./routes/product/color");
const sellerRouter = require("./routes/seller/seller");
const productRouter = require("./routes/product/product");
const restoreRouter = require("./routes/restore");
const pageCategoryRouter = require("./routes/page-category");
const orderRouter = require("./routes/order/coupon");
const addressRouter = require("./routes/order/address");
const structuredRouter = require("./routes/structure/structure");

// frontend routes
const frontCategoryRouter = require("./routes/front/category");
const frontProductRouter = require("./routes/front/product");
const customerRouter = require("./routes/front/customer");
const frontProfileRouter = require("./routes/front/profile");
const homepageRouter = require("./routes/front/homepage");

const app = express();

// mongoose.connect("mongodb://localhost/dikazo_");
mongoose.connect("mongodb+srv://rehankhan:B7uzwg8DlkIUJ9xb@cluster0.yimbm.mongodb.net/dikazo_?retryWrites=true&w=majority")
require("./models/product");
require("./models/customer");

app.use(bodyParser.json({ limit: "1000mb" }));

app.use(cors());
app.use(userRoutes);
app.use(uploadRouter);
app.use(categoryRouter);
app.use(brandRouter);
app.use(attributeRouter);
app.use(colorRouter);
app.use(sellerRouter);
app.use(productRouter);
app.use(restoreRouter);
app.use(pageCategoryRouter);
app.use(orderRouter);
app.use(addressRouter);
app.use(structuredRouter);

// frontend routes
app.use("/v2", frontCategoryRouter);
app.use("/v2", frontProductRouter);
app.use("/v2", customerRouter);
app.use("/v2", frontProfileRouter);
app.use("/v2", homepageRouter);

app.listen(process.env.PORT | 4002, function () {
  console.log("now listening for requests");
});
