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
const userRouter = require("./Routers/UserRouter");
const router = require("./Routers/AppointmentRouter");
const notiRouter = require("./Routers/notificationRouter");
const PaymentRouter = require("./Routers/PaymentRouter");



app.use("/api/auth",AuthRouter);
app.use("/api/user",userRouter);
app.use("/api/appointment",router);
app.use("/api/notifications",notiRouter);
app.use("/api/payment",PaymentRouter);

const PORT = process.env.PORT || 3010;

// app.listen(3010,function(){
//     console.log("server running on port 3010");
// })
app.listen(PORT, function(){
    console.log(`Server is running on port ${PORT}`);
});