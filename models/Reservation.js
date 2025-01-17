// models/Reservation.js
const mongoose = require('mongoose');

// Definiraj shemo za Reservation
const reservationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  reservationDate: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    required: true
  }
});

// Ustvari model za Reservation
const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
