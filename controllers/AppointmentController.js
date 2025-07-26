const crypto = require('crypto'); 
const path = require('path');
const emailSender = require('../utility/DynamicEmail');
const Appointment = require('../Model/Appointment');
const Notification=require("../Model/Notification");


const UserModel = require('../Model/UserModel');

async function bookAppointment(req, res) {
 

  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

   
    const {
      fullName,              
      email,                   
      phone,                 
      propertyId, propertyTitle, brokerId, brokerName,
      brokerLocation, image, location, price, guest, bedrooms,
    } = req.body;


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
      fullName,              
      email,                
      phone,                 
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


 
    res.status(200).json({
      status: "success",    
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
 
    const appointment = await Appointment.findOne({ confirmationToken: token }).populate('userId brokerId');

    if (!appointment) {
      return res.status(404).send("Invalid or expired confirmation link.");
    }

    if (appointment.status === 'confirmed') {
      return res.status(400).send("Appointment already confirmed.");
    }

    
    appointment.status = 'confirmed';
    appointment.confirmationToken = null; 
    await appointment.save();


    const userEmailPath = path.join(__dirname, '..', 'templates', 'appointmentUserConfirmed.html');
    function getRandomTime() {
   const hours = Math.floor(Math.random() * 9) + 9; 
    const minutes = Math.floor(Math.random() * 2) === 0 ? "00" : "30"; 
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
