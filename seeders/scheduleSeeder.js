const Schedule = require("../models/Schedule")
const Train = require("../models/Train")

const seedSchedules = async () => {
  try {
    console.log("Seeding schedules...")

    // Check if schedules already exist
    const existingSchedules = await Schedule.countDocuments()
    if (existingSchedules > 0) {
      console.log("Schedules already exist. Skipping schedule seeding.")
      return
    }

    // Get all trains
    const trains = await Train.find({})
    if (trains.length === 0) {
      throw new Error("No trains found. Please seed trains first.")
    }

    const schedules = []

    // Create schedules for the next 10 days
    for (let i = 0; i < 10; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i + 1) // Start from tomorrow

      // Use different trains for different schedules
      const trainIndex = i % trains.length
      const train = trains[trainIndex]

      schedules.push({
        train: train._id,
        date: date,
        departureTime: "08:00",
        arrivalTime: "18:00",
        ticketPrice: Math.floor(Math.random() * 5000) + 1000, // Random price between 1000-6000
        availableSeats: train.totalSeats,
      })
    }

    await Schedule.insertMany(schedules)
    console.log("Schedules seeded successfully!")
  } catch (error) {
    console.error("Error seeding schedules:", error)
    throw error
  }
}

module.exports = seedSchedules
