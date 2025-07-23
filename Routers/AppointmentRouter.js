const express = require("express");
const { bookAppointment, confirmAppointment } = require("../controllers/AppointmentController");
const { protectRouteMiddleware } = require("../controllers/AuthController");
const router= express.Router();

router.post("/book", protectRouteMiddleware, bookAppointment);

// 🔓 Public route for confirming (via email link)
router.get("/confirm", confirmAppointment);

module.exports = router;


