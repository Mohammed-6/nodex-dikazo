const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userRoute = express.Router();
const bcrypt = require("bcrypt");

const userTypeSchema = new Schema({
  userType: { type: String, required: false },
});

const appUserSchema = new Schema(
  {
    fullname: { type: String, required: true },
    loginUsername: { type: String, required: true },
    loginPassword: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    userType: { type: String, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// add usertype
userRoute.post("/add-usertype", async function (req, res) {
  var UserTypeModel = mongoose.model("usertype", userTypeSchema);
  const alldata = req.body;
  UserTypeModel.create(alldata).then(function () {
    UserTypeModel.find({})
      .then((userlist) => {
        res.send({
          type: "success",
          message: "User type added successfully",
          data: userlist,
        });
      })
      .catch((error) => {
        res.send({
          type: "error",
          message: error,
        });
      });
  });
});

async function getUserType() {
  var UserTypeModel = mongoose.model("usertype", userTypeSchema);
  try {
    const list = await UserTypeModel.find({});
    return list;
  } catch (error) {
    return error;
  }
}

// list usertype
userRoute.post("/list-usertype", async function (req, res) {
  getUserType().then((userlist) => {
    res.send({
      type: "success",
      message: "List usertype",
      data: userlist,
    });
  });
});

// list user
userRoute.post("/list-user", async function (req, res) {
  var UserModel = mongoose.model("user", appUserSchema);
  await UserModel.find({})
    .select(["userType", "phone", "email", "_id", "fullname"])
    .then(function (response) {
      getUserType().then((userlist) => {
        res.send({
          type: "success",
          message: "User list",
          data: response,
          usertype: userlist,
        });
      });
    })
    .catch(function (err) {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// add user
userRoute.post("/add-user", async function (req, res) {
  var UserModel = mongoose.model("user", appUserSchema);
  const alldata = req.body;
  await bcrypt.hash(alldata.loginPassword, 10).then(async function (hash) {
    // Store hash in your password DB.
    alldata.loginPassword = hash;
    UserModel.create(alldata)
      .then(() => {
        res.send({
          type: "success",
          message: "User added successfully",
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

// edit user
userRoute.post("/edit-user", async function (req, res) {
  var UserModel = mongoose.model("user", appUserSchema);
  UserModel.findOne({ _id: req.body.userId })
    .select(["userType", "phone", "email", "_id", "fullname", "loginUsername"])
    .then((response) => {
      res.send({
        type: "success",
        message: "User edit successfully",
        data: response,
      });
    });
});

// update user
userRoute.post("/update-user", async function (req, res) {
  var UserModel = mongoose.model("user", appUserSchema);
  const alldata = req.body;
  if (alldata.loginPassword !== undefined && alldata.loginPassword !== "") {
    await bcrypt.hash(alldata.loginPassword, 10).then(function (hash) {
      // Store hash in your password DB.
      if (alldata.loginPassword !== undefined && alldata.loginPassword !== "") {
        alldata.loginPassword = hash;
      } else {
        delete alldata.loginPassword;
      }
    });
  }
  UserModel.findByIdAndUpdate({ _id: req.body._id }, alldata)
    .then((resp) => {
      res.send({
        type: "success",
        message: "User updated successfully",
        data: resp,
      });
    })
    .catch((err) => {
      res.send({
        type: "error",
        message: err,
      });
    });
});

// delete clinic user
userRoute.post("/delete-user", function (req, res) {
  var UserModel = mongoose.model("user", appUserSchema);
  UserModel.findByIdAndDelete(req.body.userId).then(async function () {
    await UserModel.find({})
      .select(["userType", "phone", "email", "_id", "fullname"])
      .then(function (response) {
        getUserType().then((userlist) => {
          res.send({
            type: "success",
            message: "User list",
            data: response,
            usertype: userlist,
          });
        });
      })
      .catch(function (err) {
        res.send({
          type: "error",
          message: err,
        });
      });
  });
});

userRoute.post("/login", async function (req, res) {
  var AppUserModel = mongoose.model("user", appUserSchema);
  var UserTypeModel = mongoose.model("usertype", userTypeSchema);
  // console.log(req.body);
  await AppUserModel.findOne({
    loginUsername: req.body.loginUsername,
  })
    .then(async function (existsUser) {
      // console.log(existsUser);
      if (existsUser !== null) {
        await bcrypt
          .compare(req.body.loginPassword, existsUser.loginPassword)
          .then(function (result) {
            //   console.log(result);
            if (result) {
              AppUserModel.findById(existsUser._id).then((mdata) => {
                UserTypeModel.findById(mdata.userType).then((usd) => {
                  res.send({
                    type: "success",
                    message: "User Login Successfully",
                    data: {
                      // permissions: usd.permissions,
                      fullname: mdata.fullname,
                      username: mdata.loginUsername,
                      email: mdata.email,
                      phone: mdata.phone,
                      id: mdata._id,
                    },
                  });
                });
              });
            } else {
              res.send({
                type: "info",
                message: "Username or Password Incorrect!",
              });
            }
          });
      } else {
        res.send({
          type: "info",
          message: "Username or Password Incorrect",
        });
      }
    })
    .catch(function (err) {
      res.send({
        type: "error",
        message: err,
      });
    });
});

module.exports = userRoute;
