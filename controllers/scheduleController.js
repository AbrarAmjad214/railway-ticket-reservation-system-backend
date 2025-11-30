const Schedule = require("../models/Schedule")
const Train = require("../models/Train")

exports.addSchedule = async (req, res) => {
  try {
    const { trainId, date, departureTime, arrivalTime, ticketPrice } = req.body

    if (!trainId || !date || !departureTime || !arrivalTime || !ticketPrice) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const train = await Train.findById(trainId)
    if (!train) {
      return res.status(404).json({ message: "Train not found" })
    }

    const schedule = new Schedule({
      train: trainId,
      date: new Date(date),
      departureTime,
      arrivalTime,
      ticketPrice,
      availableSeats: train.totalSeats,
    })

    await schedule.save()
    res.status(201).json({ message: "Schedule added successfully", schedule })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getScheduleByTrainId = async (req, res) => {
  try {
    const schedules = await Schedule.find({ train: req.params.trainId }).populate("train").sort({ date: 1 })
    res.json(schedules)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAvailableSeats = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.scheduleId).populate("train")
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }
    res.json({ availableSeats: schedule.availableSeats })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("train")
      .sort({ date: 1, departureTime: 1 })
    res.json({
      count: schedules.length,
      schedules
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
