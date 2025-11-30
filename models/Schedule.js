const mongoose = require("mongoose")

const scheduleSchema = new mongoose.Schema(
  {
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    ticketPrice: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Schedule", scheduleSchema)
