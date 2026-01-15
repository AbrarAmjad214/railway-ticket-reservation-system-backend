const express = require("express")
const router = express.Router()
const trainController = require("../controllers/trainController")
const { auth, adminAuth } = require("../middleware/auth")

router.post("/admin/train", auth, adminAuth, trainController.addTrain)
router.put("/admin/:id", auth, adminAuth, trainController.updateTrain)
router.delete("/admin/:id", auth, adminAuth, trainController.deleteTrain)
router.get("/list", trainController.listTrains)
router.get("/:id", trainController.getTrainById)

module.exports = router
