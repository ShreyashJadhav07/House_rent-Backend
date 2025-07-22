const express = require('express');
const { getUserWishlist, getCurrentUser, addToWishlist } = require('../controllers/UserController');
const { protectRouteMiddleware } = require('../controllers/AuthController');

const userRouter = express.Router();

userRouter
         .use(protectRouteMiddleware)
         .get("/wishlist",getUserWishlist)
         .get("/",getCurrentUser)
         .post("/wishlist", addToWishlist)

module.exports = userRouter;
        





