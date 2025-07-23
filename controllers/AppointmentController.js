// const path = require('path');
// const emailSender = require('../utility/DynamicEmail');
// const Appointment = require('../Model/Appointment');
// const NotificationModel = require('../Model/NotificationModel');

// const UserModel = require('../Model/UserModel');

// async function bookAppointment(req, res) {
//   console.log("Incoming payload:", req.body);

//   try {
//     const userId = req.userId; // ✅ use userId from middleware

//     // optionally fetch user details from DB if needed
//     const user = await UserModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const {
//       propertyId,
//       propertyTitle,
//       brokerName,
//       brokerLocation,
//       image,
//       location,
//       price,
//       guest,
//       bedrooms,
//     } = req.body;

//     // Validation
//     if (!propertyId || !propertyTitle || !brokerName || !brokerLocation || !image || !location || !price) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required property information.",
//       });
//     }

//     // 1. Save appointment to DB
//     const appointment = await Appointment.create({
//       userId: user._id,
//       propertyId,
//       title: propertyTitle,
//       location,
//       image,
//       price,
//       guest,
//       bedrooms,
//       brokerName,
//     });

//     // 2. Send confirmation email
//     const emailTemplatePath = path.join(__dirname, '..', 'templates', 'appointmentEmail.html');

//     await emailSender(emailTemplatePath, user.email, {
//       userName: user.name || user.email,
//       propertyTitle,
//       brokerName,
//       brokerLocation,
//     });

//     // 3. In-app notification
//     await NotificationModel.create({
//       userId: user._id,
//       type: "appointment",
//       message: `✅ Your appointment for **${propertyTitle}** with broker **${brokerName}** has been confirmed.`,
//     });

//     // 4. Success response
//     res.status(200).json({
//       success: true,
//       message: "Appointment booked, email sent, and notification created.",
//       appointment,
//     });

//   } catch (error) {
//     console.error("❌ Error in bookAppointment:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// }

// module.exports = {
//   bookAppointment,
// };


const crypto = require('crypto'); // For generating token
const path = require('path');
const emailSender = require('../utility/DynamicEmail');
const Appointment = require('../Model/Appointment');
const Notification=require("../Model/Notification");


const UserModel = require('../Model/UserModel');

async function bookAppointment(req, res) {
  console.log("Incoming payload:", req.body);

  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Get form data from req.body instead of user object
    const {
      fullName,              // ✅ From form
      email,                 // ✅ From form  
      phone,                 // ✅ From form
      propertyId, propertyTitle, brokerId, brokerName,
      brokerLocation, image, location, price, guest, bedrooms,
    } = req.body;

    // ✅ Validate form fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({ success: false, message: "Please provide fullName, email, and phone" });
    }

    if (!propertyId || !propertyTitle || !brokerId || !brokerName || !brokerLocation || !image || !location || !price) {
      return res.status(400).json({ success: false, message: "Missing required property information." });
    }

    const broker = await UserModel.findById(brokerId);
    if (!broker || broker.role !== 'broker') {
      return res.status(404).json({ success: false, message: "Broker not found or invalid role" });
    }

    const confirmationToken = crypto.randomUUID();

    // ✅ Use form data instead of user data
    const appointment = await Appointment.create({
      userId: user._id,
      brokerId: broker._id,
      propertyId,
      propertyTitle,
      brokerLocation,
      image,
      price,
      guest,
      bedrooms,
      brokerName,
      fullName,              // ✅ From form data
      email,                 // ✅ From form data
      phone,                 // ✅ From form data
      confirmationToken,
    });

    const brokerEmailPath = path.join(__dirname, '..', 'templates', 'appointmentBrokerConfirm.html');
    const confirmLink = `http://localhost:3010/api/appointment/confirm?token=${confirmationToken}`;

    await emailSender(brokerEmailPath, broker.email, {
      userName: broker.name || broker.email,
      propertyTitle,
      brokerName,
      brokerLocation,
      confirmLink,
    });

  await Notification.create({
    userId:brokerId,
    type:"booked",
    message:`${fullName} has requested an appointment for ${propertyTitle}`,
  });


    // ✅ Frontend expects "status": "success"
    res.status(200).json({
      status: "success",     // ✅ Important for frontend
      message: "Appointment request sent. Broker will confirm via email.",
      appointment,
      user,
    });

  } catch (error) {
    console.error("❌ Error in bookAppointment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}



async function confirmAppointment(req, res) {
  const { token } = req.query;

  try {
    // ✅ 1. Find appointment by token
    const appointment = await Appointment.findOne({ confirmationToken: token }).populate('userId brokerId');

    if (!appointment) {
      return res.status(404).send("Invalid or expired confirmation link.");
    }

    if (appointment.status === 'confirmed') {
      return res.status(400).send("Appointment already confirmed.");
    }

    // ✅ 2. Update status to confirmed
    appointment.status = 'confirmed';
    appointment.confirmationToken = null; // optional: invalidate token
    await appointment.save();

    // ✅ 3. Send confirmation email to the user
    const userEmailPath = path.join(__dirname, '..', 'templates', 'appointmentUserConfirmed.html');
    function getRandomTime() {
   const hours = Math.floor(Math.random() * 9) + 9; // 9 to 17 (9AM–5PM)
    const minutes = Math.floor(Math.random() * 2) === 0 ? "00" : "30"; // 00 or 30
    const period = hours >= 12 ? 'PM' : 'AM';
   const adjustedHour = hours > 12 ? hours - 12 : hours;
    return `${adjustedHour}:${minutes} ${period}`;
}
const appointmentTime = getRandomTime();




    await emailSender(userEmailPath, appointment.email, {
      fullName: appointment.fullName,
      propertyTitle: appointment.propertyTitle,
      brokerName: appointment.brokerName,
      brokerLocation: appointment.brokerLocation,
      appointmentTime: appointmentTime
    });

    // ✅ 4. Optionally send a nice message to broker too

  await Notification.create({
  userId: appointment.userId._id,
  type: "confirmed",
  message: `Your appointment for ${appointment.propertyTitle} has been confirmed by ${appointment.brokerName}`,
});

    res.send("Appointment confirmed! Email has been sent to the user.");

  } catch (error) {
    console.error("Error in confirmAppointment:", error);
    res.status(500).send("Something went wrong while confirming the appointment.");
  }
}



module.exports = { 
  bookAppointment,
  confirmAppointment

 };
