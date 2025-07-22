const express=require("express");
const { loginHandler, signupHandler, logoutController, forgetPasswordHandler, resetPasswordHandler } = require("../controllers/AuthController");



const AuthRouter=express.Router();


AuthRouter
         .post("/login",loginHandler)
         .post("/signup",signupHandler)
         .get("/logout",logoutController)
         .patch("/forgetPassword",forgetPasswordHandler)
         .patch("/resetPassword",resetPasswordHandler)

module.exports=AuthRouter;

    


