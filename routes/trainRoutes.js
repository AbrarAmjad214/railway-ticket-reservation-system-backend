const express = require("express")
const router = express.Router()
const trainController = require("../controllers/trainController")
const { auth, adminAuth } = require("../middleware/auth")

router.post("/admin/train", auth, adminAuth, trainController.addTrain)
router.get("/list", trainController.listTrains)
router.get("/:id", trainController.getTrainById)

module.exports = router
