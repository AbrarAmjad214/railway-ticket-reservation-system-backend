const Booking = require("../models/Booking")
const User = require("../models/User")
const Schedule = require("../models/Schedule")

const seedBookings = async () => {
  try {
    console.log("Seeding bookings...")

    // Check if bookings already exist
    const existingBookings = await Booking.countDocuments()
    if (existingBookings > 0) {
      console.log("Bookings already exist. Skipping booking seeding.")
      return
    }

    // Get users (excluding admin)
    const users = await User.find({ role: "user" }).limit(10)
    if (users.length === 0) {
      throw new Error("No users found. Please seed users first.")
    }

    // Get schedules
    const schedules = await Schedule.find({}).populate("train").limit(10)
    if (schedules.length === 0) {
      throw new Error("No schedules found. Please seed schedules first.")
    }

    const bookings = []

    for (let i = 0; i < 10; i++) {
      const userIndex = i % users.length
      const scheduleIndex = i % schedules.length

      const user = users[userIndex]
      const schedule = schedules[scheduleIndex]

      bookings.push({
        user: user._id,
        train: schedule.train._id,
        schedule: schedule._id,
        seatNumber: Math.floor(Math.random() * schedule.availableSeats) + 1,
        passengerName: user.name,
        passengerAge: Math.floor(Math.random() * 60) + 18, // Random age between 18-78
        paymentStatus: Math.random() > 0.1 ? "paid" : "pending", // 90% paid, 10% pending
        paymentMethod: "dummy",
        paymentId: `PAY${Date.now()}${i}`,
        bookingStatus: "confirmed",
      })
    }

    await Booking.insertMany(bookings)
    console.log("Bookings seeded successfully!")
  } catch (error) {
    console.error("Error seeding bookings:", error)
    throw error
  }
}

module.exports = seedBookings
