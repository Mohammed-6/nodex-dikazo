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
  sellerFeedbackSchema,
  sellerDeliverySchema,
  productFeedbackSchema,
} = require("../../models/customer");
const { couponSchema, addressSchema } = require("../../models/order");
const puppeteer = require("puppeteer");

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
    .sort({ created_at: -1 })
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

// submit seller feedback
frontProfileRouter.post("/submit-seller-feedback", async function (req, res) {
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  const customer = await CustomerLoginModel.findOne({
    accessToken: req.body.customerId,
  });

  const SellerFeedbackModel = mongoose.model(
    "seller_feedback",
    sellerFeedbackSchema
  );

  const colte = req.body;
  colte.customerId = customer.customerId;
  await SellerFeedbackModel.create(colte)
    .then((response) => {
      res.send({
        type: "success",
        message: "Feedback submitted successfully",
      });
    })
    .catch(function (err) {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// submit seller feedback
frontProfileRouter.post("/submit-delivery-feedback", async function (req, res) {
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  const customer = await CustomerLoginModel.findOne({
    accessToken: req.body.customerId,
  });

  const DeliveryFeedbackModel = mongoose.model(
    "delivery_feedback",
    sellerDeliverySchema
  );

  const colte = req.body;
  colte.customerId = customer.customerId;
  await DeliveryFeedbackModel.create(colte)
    .then((response) => {
      res.send({
        type: "success",
        message: "Feedback submitted successfully",
      });
    })
    .catch(function (err) {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// submit product review
frontProfileRouter.post("/submit-product-feedback", async function (req, res) {
  const CustomerLoginModel = mongoose.model(
    "customer_login",
    customerLoginSchema
  );
  const customer = await CustomerLoginModel.findOne({
    accessToken: req.body.customerId,
  });

  const ProductFeedbackModel = mongoose.model(
    "product_feedback",
    productFeedbackSchema
  );

  const colte = req.body;
  colte.customerId = customer.customerId;
  await ProductFeedbackModel.create(colte)
    .then((response) => {
      res.send({
        type: "success",
        message: "Feedback submitted successfully",
      });
    })
    .catch(function (err) {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// download invoice
frontProfileRouter.post("/download-invoice", async function (req, res) {
  const OrderModel = mongoose.model("order", orderSchema);
  OrderModel.findById(req.body.orderid).then(async function (order) {
    // console.log(req.body.orderid);
    // Create a browser instance
    const browser = await puppeteer.launch();

    //res.send("Sorry! under development");
    // Create a new page
    const page = await browser.newPage();

    //Get HTML content from HTML file
    const invoiceHTML = createInvoice(order);
    await page.setContent(invoiceHTML, { waitUntil: "domcontentloaded" });

    // To reflect CSS used for screens instead of print
    await page.emulateMediaType("screen");

    // Downlaod the PDF
    const pdf = await page.pdf({
      path: "public/invoice/invoice_" + order.orderCode + ".pdf",
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
      printBackground: true,
      format: "A4",
    });

    // Close the browser instance
    await browser.close();
    res.send({ status: true });
  });
});

function formatDateToDDMMYYYY(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JavaScript
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
const createInvoice = (order) => {
  let productdata = [];
  let sellerData = {};
  let taxAmt = 0;
  order.productDetail !== undefined &&
    order.productDetail.map((prod) => {
      let tax =
        (prod.productDetail.price *
          prod.productDetail.quantity *
          prod.productDetail.gst) /
        100;
      taxAmt += tax;
      const bb = {
        description: prod.productDetail.name,
        unitPrice: prod.productDetail.price,
        quantity: prod.productDetail.quantity,
        netAmount: prod.productDetail.price,
        taxRate: prod.productDetail.gst + "%",
        taxType:
          order.addressDetail?.stateCode === prod.shopInformation.stateCode
            ? "SGST"
            : "IGST",
        taxAmount: tax,
        totalAmount: prod.productDetail.price * prod.productDetail.quantity,
      };
      sellerData = {
        name: prod.shopInformation.shopName,
        address: prod.shopInformation.shopAddress,
        panNo: prod.shopInformation.panNo,
        gstNo: prod.shopInformation.gst,
      };
      productdata.push(bb);
    });

  const invoiceData = {
    orderNumber: order.orderCode,
    invoiceNumber: "IN-2834",
    orderDate: formatDateToDDMMYYYY(new Date(order.created_at)),
    invoiceDate: formatDateToDDMMYYYY(new Date()),
    items: productdata,
    totalTaxAmount: taxAmt,
    totalAmount: order.amountTotal,
    amountInWords: "Five Hundred Ninety-four only",
    reverseCharge: "No",
    paymentDetails: [order.paymentInformation],
    sellerDetails: sellerData,
    billingAddress: {
      name: order.addressDetail?.name,
      address:
        order.addressDetail?.address +
        ", " +
        order.addressDetail?.locality +
        ", " +
        order.addressDetail?.city +
        ", " +
        order.addressDetail?.state +
        ", " +
        order.addressDetail?.pincode,
      stateCode: order.addressDetail?.stateCode,
    },
    shippingAddress: {
      name: order.addressDetail?.name,
      address:
        order.addressDetail?.address +
        ", " +
        order.addressDetail?.locality +
        ", " +
        order.addressDetail?.city +
        ", " +
        order.addressDetail?.state +
        ", " +
        order.addressDetail?.pincode,
      stateCode: order.addressDetail?.stateCode,
    },
    placeOfSupply: order.addressDetail?.state,
    placeOfDelivery: order.addressDetail?.state,
    paymentMethod: order.paymentMethod,
    orderId: order.orderDetail?.id,
  };
  let productList = [];

  {
    invoiceData.items.map((item, index) => {
      const dd = `<tr key=${index}>
    <td style="border: 1px solid #e2e2e2;width:50%" >
      ${item.description}
    </td>
    <td style="border: 1px solid #e2e2e2" >
      ₹${item.unitPrice.toFixed(2)}
    </td>
    <td style="border: 1px solid #e2e2e2" >
      ${item.quantity}
    </td>
    <td style="border: 1px solid #e2e2e2" >
      ₹${item.netAmount.toFixed(2)}
    </td>
    <td style="border: 1px solid #e2e2e2" >
      ${item.taxRate}
    </td>
    <td style="border: 1px solid #e2e2e2" >
      ${item.taxType}
    </td>
    <td style="border: 1px solid #e2e2e2" >
      ₹${item.taxAmount.toFixed(2)}
    </td>
    <td style="border: 1px solid #e2e2e2" >
      ₹${item.totalAmount.toFixed(2)}
    </td>
  </tr>`;
      productList.push(dd);
    });
  }
  return `  <script src="https://cdn.tailwindcss.com"></script>
  <div className="">
      <div style="padding: 0 30px" >
        <div style="" class="flex justify-between" >
          <div>
            <img
              src="https://biyaan.in/assets/images/logo.png"
              style="height: 60px; width: auto" 
            />
          </div>
          <div style="font-weight: 600" >
            <h1>Tax Invoice/Bill of Supply/Cash Memo</h1>
            <p>(Original for Recipient)</p>
          </div>
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin: 20px 0";
        >
          <div>
            <h2 class="font-bold">Seller Details:</h2>
            <p><b>Sold By:</b> ${invoiceData.sellerDetails.name}</p>
            <p><b>Address:</b> ${invoiceData.sellerDetails.address}</p>
          </div>
          <div>
            <h2 class="font-bold">Billing Address:</h2>
            <p><b>Name:</b> ${invoiceData.billingAddress.name}</p>
            <p><b>Address:</b> ${invoiceData.billingAddress.address}</p>
            <p><b>State/UT Code:</b> ${invoiceData.billingAddress.stateCode}</p>
          </div>
        </div>
        <div
        class="grid grid-cols-2 gap-x-2"
          style="
          margin: 20px 0">
          <div>
            <p><b>PAN No:</b> ${invoiceData.sellerDetails.panNo}</p>
            <p><b>GST Registration No:</b> ${
              invoiceData.sellerDetails.gstNo
            }</p>
          </div>
          <div style="" >
            <h2 class="font-bold">Shipping Address</h2>
            <p><b>Name:</b> ${invoiceData.shippingAddress.name}</p>
            <p><b>Address:</b> ${invoiceData.shippingAddress.address}</p>
            <p><b>State/UT Code:</b> ${
              invoiceData.shippingAddress.stateCode
            }</p>
            <div>
              <p><b>Place of Supply:</b> ${invoiceData.placeOfSupply}</p>
              <p><b>Place of Delivery:</b> ${invoiceData.placeOfDelivery}</p>
            </div>
          </div>
        </div>
        <div
          style="
          margin: 20px 0";
            class="grid grid-cols-2"
          >
          <div>
            <p><b>Order Number:</b> ${invoiceData.orderNumber}</p>
            <p><b>Order Date:</b> ${invoiceData.orderDate}</p>
          </div>
          <div>
            <div><b>Invoice Number:</b> ${invoiceData.invoiceNumber}</div>
            <div><b>Invoice Date:</b> ${invoiceData.invoiceDate}</div>
          </div>
        </div>
        <div>
          <table
            border="1"
            cellPadding="10"
            style="border: 1px solid #e2e2e2" 
          >
            <thead>
              <tr class="bg-gray-100">
                <th style="border: 1px solid #e2e2e2" >Description</th>
                <th style="border: 1px solid #e2e2e2" >Unit Price</th>
                <th style="border: 1px solid #e2e2e2" >Quantity</th>
                <th style="border: 1px solid #e2e2e2" >Net Amount</th>
                <th style="border: 1px solid #e2e2e2" >Tax Rate</th>
                <th style="border: 1px solid #e2e2e2" >Tax Type</th>
                <th style="border: 1px solid #e2e2e2" >Tax Amount</th>
                <th style="border: 1px solid #e2e2e2" >Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${productList}
              <tr class="font-bold">
                <td colSpan=${6}>TOTAL</td>
                <td
                  style="
                    border: 1px solid #e2e2e2;"
                    class="bg-gray-100"
                >
                  ₹${taxAmt}
                </td>
                <td
                  style="border: 1px solid #e2e2e2;"
                  class="bg-gray-100"
                >
                  ₹${invoiceData?.totalAmount}
                </td>
              </tr>
              <tr class="font-bold">
                <td
                  colSpan=${8}
                  style="border: 1px solid #e2e2e2;"
                >
                  Amount in Words: <br />
                  ${invoiceData.amountInWords}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <p>
            Whether tax is payable under reverse charge:${" "}
            ${invoiceData.reverseCharge}
          </p>
        </div>
        <div>
          <h2 class="font-bold">Payment Details</h2>
          <table>
            <tr>
              <td
                style="
                  border: 1px solid #e2e2e2;
                  padding: 10px"
                
              >
                Transaction ID: ${invoiceData?.orderId}
              </td>
              <td
                style="
                border: 1px solid #e2e2e2;
                padding: 10px"
                
              >
                Date & Time: ${invoiceData.orderDate}
              </td>
              <td
                style="
                border: 1px solid #e2e2e2;
                padding: 10px"
                
              >
                Mode of Payment: ${invoiceData.paymentMethod}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>`;
};

module.exports = frontProfileRouter;
