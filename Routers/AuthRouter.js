const express=require("express");
const { loginHandler, signupHandler } = require("../controllers/AuthController");



const AuthRouter=express.Router();


AuthRouter
         .post("/login",loginHandler)
         .post("/signup",signupHandler)

module.exports=AuthRouter;

    


