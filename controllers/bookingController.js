const Booking = require("../models/Booking")
const Schedule = require("../models/Schedule")
const Train = require("../models/Train")

exports.createBooking = async (req, res) => {
  try {
    const { trainId, scheduleId, seatNumber, passengerName, passengerAge } = req.body
    const userId = req.user.id

    if (!trainId || !scheduleId || !seatNumber || !passengerName || !passengerAge) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const schedule = await Schedule.findById(scheduleId)
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    if (schedule.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" })
    }

    // Check if seat is already booked
    const existingBooking = await Booking.findOne({
      schedule: scheduleId,
      seatNumber,
      bookingStatus: "confirmed",
    })

    if (existingBooking) {
      return res.status(400).json({ message: "Seat already booked" })
    }

    // Generate payment ID
    const paymentId = `PAY-${Date.now()}`

    const booking = new Booking({
      user: userId,
      train: trainId,
      schedule: scheduleId,
      seatNumber,
      passengerName,
      passengerAge,
      paymentStatus: "paid",
      paymentId,
      bookingStatus: "confirmed",
    })

    await booking.save()

    // Update available seats
    schedule.availableSeats -= 1
    await schedule.save()

    // Populate the booking before sending
    await booking.populate(["user", "train", "schedule"])

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("train")
      .populate("schedule")
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    booking.bookingStatus = "cancelled"
    await booking.save()

    // Release the seat
    const schedule = await Schedule.findById(booking.schedule)
    schedule.availableSeats += 1
    await schedule.save()

    res.json({ message: "Booking cancelled successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user")
      .populate("train")
      .populate("schedule")
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
