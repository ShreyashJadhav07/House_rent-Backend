const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  brokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  propertyId: {
    type: String,
    required: true,
  },
  image: String,
  brokerName: String,
  brokerLocation: String,
  propertyTitle: String,
  price: Number,
  guest: Number,
  bedrooms: Number,

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined'],
    default: 'pending',
  },

  confirmationToken: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
