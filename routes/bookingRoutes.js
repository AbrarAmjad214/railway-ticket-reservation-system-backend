const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { auth, adminAuth } = require("../middleware/auth");

router.post("/create", auth, bookingController.createBooking);
router.get("/user", auth, bookingController.getUserBookings);
router.post("/cancel/:id", auth, bookingController.cancelBooking);
router.get("/admin/all", bookingController.getAllBookings);
router.get("/my-bookings", bookingController.getMyBookings);
router.get("/booked-seats/:scheduleId", bookingController.getBookedSeats);
router.get("/download/:id", auth, bookingController.downloadTicket);

module.exports = router;
