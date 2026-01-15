const City = require("../models/City");

// Get all cities
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true })
      .select("name province")
      .sort({ name: 1 });

    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get city by name
exports.getCityByName = async (req, res) => {
  try {
    const city = await City.findOne({
      name: req.params.name,
      isActive: true,
    });

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    res.json(city);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
