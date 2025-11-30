const express = require("express")
const router = express.Router()
const scheduleController = require("../controllers/scheduleController")
const { auth, adminAuth } = require("../middleware/auth")

router.post("/admin/schedule", auth, adminAuth, scheduleController.addSchedule)
router.get("/train/:trainId", scheduleController.getScheduleByTrainId)
router.get("/availability/:scheduleId", scheduleController.getAvailableSeats)
router.get("/admin/all", auth, adminAuth, scheduleController.getAllSchedules)

module.exports = router
