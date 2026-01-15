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

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params
    const { trainId, date, departureTime, arrivalTime, ticketPrice } = req.body

    const schedule = await Schedule.findById(id)
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    if (trainId) {
      const train = await Train.findById(trainId)
      if (!train) {
        return res.status(404).json({ message: "Train not found" })
      }
      schedule.train = trainId
    }

    if (date) schedule.date = new Date(date)
    if (departureTime) schedule.departureTime = departureTime
    if (arrivalTime) schedule.arrivalTime = arrivalTime
    if (ticketPrice) schedule.ticketPrice = ticketPrice

    await schedule.save()
    await schedule.populate("train")
    res.json({ message: "Schedule updated successfully", schedule })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params
    const schedule = await Schedule.findById(id)
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    await Schedule.findByIdAndDelete(id)
    res.json({ message: "Schedule deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
