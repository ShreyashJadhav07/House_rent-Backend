const express=require("express");
const app=express();
const mongoose=require("mongoose");
const dotenv=require('dotenv');
const cookieParser=require('cookie-parser');
const cors=require('cors');

dotenv.config();
const dbLink = `mongodb+srv://${process.env.DB_USERNAME}
:${process.env.DB_PASSWORD}@cluster0.f9ow1k7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(dbLink)
    .then(function (connection) {
        console.log("connected to db")
}).catch(err => console.log(err))

app.use(cookieParser());
app.use(express.json());

app.use(cors({
 origin: true,
 credentials: true
}));

const AuthRouter=require("./Routers/AuthRouter");


app.use("/api/auth",AuthRouter);


app.listen(3010,function(){
    console.log("server running on port 3010");
})