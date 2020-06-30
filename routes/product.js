const express = require("express");
const router = express.Router;

const {getProductById} = require("../controllers/product");
const {isSignedIn, isAuthenticated, isAdmin} = require("../controllers/auth");
const { getUserById } = require("../controllers/user");


//all of params

 router.param("userId", getUserById);
 router.param("productId", getProductById);

 //all actual routes goes here


 module.exports = router;