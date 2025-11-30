const Train = require("../models/Train")

exports.addTrain = async (req, res) => {
  try {
    const { trainName, trainNumber, startStation, endStation, routeStations, totalSeats } = req.body

    if (!trainName || !trainNumber || !startStation || !endStation || !totalSeats) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const existingTrain = await Train.findOne({ trainNumber })
    if (existingTrain) {
      return res.status(400).json({ message: "Train number already exists" })
    }

    const train = new Train({
      trainName,
      trainNumber,
      startStation,
      endStation,
      routeStations: routeStations || [],
      totalSeats,
    })

    await train.save()
    res.status(201).json({ message: "Train added successfully", train })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.listTrains = async (req, res) => {
  try {
    const trains = await Train.find()
    res.json(trains)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id)
    if (!train) {
      return res.status(404).json({ message: "Train not found" })
    }
    res.json(train)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
