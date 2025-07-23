const express=require("express");
const { getNotification } = require("../controllers/NotificationController");
const { protectRouteMiddleware } = require("../controllers/AuthController");
const notiRouter=express.Router();


notiRouter.get('/',protectRouteMiddleware,getNotification);

module.exports=notiRouter;