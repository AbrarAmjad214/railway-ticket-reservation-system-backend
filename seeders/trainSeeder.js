const Train = require("../models/Train")

const seedTrains = async () => {
  try {
    console.log("Seeding trains...")

    // Check if trains already exist
    const existingTrains = await Train.countDocuments()
    if (existingTrains > 0) {
      console.log("Trains already exist. Skipping train seeding.")
      return
    }

    const trains = [
      {
        trainName: "Green Line Express",
        trainNumber: "GLE001",
        startStation: "Lahore",
        endStation: "Karachi",
        routeStations: ["Lahore", "Multan", "Bahawalpur", "Rohri", "Hyderabad", "Karachi"],
        totalSeats: 500,
      },
      {
        trainName: "Allama Iqbal Express",
        trainNumber: "AIE002",
        startStation: "Lahore",
        endStation: "Peshawar",
        routeStations: ["Lahore", "Gujranwala", "Rawalpindi", "Peshawar"],
        totalSeats: 400,
      },
      {
        trainName: "Karakoram Express",
        trainNumber: "KE003",
        startStation: "Karachi",
        endStation: "Lahore",
        routeStations: ["Karachi", "Hyderabad", "Rohri", "Bahawalpur", "Multan", "Lahore"],
        totalSeats: 450,
      },
      {
        trainName: "Shalimar Express",
        trainNumber: "SE004",
        startStation: "Lahore",
        endStation: "Karachi",
        routeStations: ["Lahore", "Sahiwal", "Bahawalpur", "Rohri", "Sukkur", "Karachi"],
        totalSeats: 420,
      },
      {
        trainName: "Tezgam Express",
        trainNumber: "TE005",
        startStation: "Karachi",
        endStation: "Peshawar",
        routeStations: ["Karachi", "Hyderabad", "Rohri", "Bahawalpur", "Multan", "Lahore", "Rawalpindi", "Peshawar"],
        totalSeats: 380,
      },
      {
        trainName: "Awami Express",
        trainNumber: "AE006",
        startStation: "Karachi",
        endStation: "Lahore",
        routeStations: ["Karachi", "Hyderabad", "Rohri", "Bahawalpur", "Multan", "Lahore"],
        totalSeats: 460,
      },
      {
        trainName: "Jaffar Express",
        trainNumber: "JE007",
        startStation: "Quetta",
        endStation: "Karachi",
        routeStations: ["Quetta", "Sibi", "Rohri", "Hyderabad", "Karachi"],
        totalSeats: 350,
      },
      {
        trainName: "Bolan Express",
        trainNumber: "BE008",
        startStation: "Karachi",
        endStation: "Quetta",
        routeStations: ["Karachi", "Hyderabad", "Rohri", "Sibi", "Quetta"],
        totalSeats: 320,
      },
      {
        trainName: "Millat Express",
        trainNumber: "ME009",
        startStation: "Lahore",
        endStation: "Faisalabad",
        routeStations: ["Lahore", "Sheikhupura", "Faisalabad"],
        totalSeats: 280,
      },
      {
        trainName: "Sir Syed Express",
        trainNumber: "SSE010",
        startStation: "Rawalpindi",
        endStation: "Karachi",
        routeStations: ["Rawalpindi", "Lahore", "Multan", "Rohri", "Karachi"],
        totalSeats: 390,
      },
    ]

    await Train.insertMany(trains)
    console.log("Trains seeded successfully!")
  } catch (error) {
    console.error("Error seeding trains:", error)
    throw error
  }
}

module.exports = seedTrains
