const UserModel = require("../Model/UserModel");
const jwt=require('jsonwebtoken');
const util=require("util");
const promisify=util.promisify;
const promisifiedJWTsign=promisify(jwt.sign);
const promisifiedJWTverify=promisify(jwt.verify);
const {JWT_SECRET_KEY} =process.env;





async function signupHandler(req,res) {
    try{
        const userObject=req.body;
        if(!userObject.email || !userObject.password){
            return res.status(400).json({
                message:"Bad request :Email and Password are required",
                status:"error"

            })
        }

        const user=await UserModel.findOne({email: userObject.email});
        if(user){
            return res.status(400).json({
                message:"Bad Request:User Already Exists",
                status:"error"
            })
        }
        const newUser=await UserModel.create(userObject);
        const authToken=await promisifiedJWTsign({id: newUser['id']}, JWT_SECRET_KEY);
        res.cookie("jwt",authToken,{
            maxAge: 1000 * 60 * 60 * 24,
            secure: true,
            httpOnly: true,
            sameSite: 'none'

        })
           res.status(201).json({
            message: "User created successfully",
            user: newUser,
            status: "success"
        }); 
    }
  catch(err) {
        console.error("Error in signupHandler:", err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function loginHandler(req,res) {
    try{
        const {email,password}=req.body;
        const user=await UserModel.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"user does not Exist",
                status:"error"
            })
        }
         const areEqual = password == user.password;
        if(!areEqual){
            return res.status(400).json({
                message: "Bad Request: Password is incorrect",
                status: "error"
            })
        }
        const authToken=await promisifiedJWTsign({id: user['_id']},JWT_SECRET_KEY);
        res.cookie("jwt", authToken, {
            maxAge: 1000 * 60 * 60 * 24,
            secure:true,
            httpOnly: true,
            sameSite: 'none'
        });

        res.status(200).json({
            message: "Login successful",
            status: "success",
            user: user
        });

}
    catch(err) {
        console.error("Error in loginHandler:", err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}


module.exports ={
    signupHandler,
    loginHandler
}