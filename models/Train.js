const mongoose = require("mongoose")

const trainSchema = new mongoose.Schema(
  {
    trainName: {
      type: String,
      required: true,
    },
    trainNumber: {
      type: String,
      required: true,
      unique: true,
    },
    startStation: {
      type: String,
      required: true,
    },
    endStation: {
      type: String,
      required: true,
    },
    routeStations: [
      {
        type: String,
      },
    ],
    totalSeats: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Train", trainSchema)
