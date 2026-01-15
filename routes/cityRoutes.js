const express = require("express");
const router = express.Router();
const cityController = require("../controllers/cityController");

router.get("/", cityController.getAllCities);
router.get("/:name", cityController.getCityByName);

module.exports = router;
