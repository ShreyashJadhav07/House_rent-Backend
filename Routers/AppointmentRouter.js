const express = require("express");
const { bookAppointment, confirmAppointment } = require("../controllers/AppointmentController");
const { protectRouteMiddleware } = require("../controllers/AuthController");
const router= express.Router();

router.post("/book", protectRouteMiddleware, bookAppointment);


router.get("/confirm", confirmAppointment);

module.exports = router;


