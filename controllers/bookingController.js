const Booking = require("../models/Booking");
const Schedule = require("../models/Schedule");
const Train = require("../models/Train");
const { sendBookingConfirmationEmail } = require("../services/emailService");
const { generateTicketPDF } = require("../services/pdfService");

exports.createBooking = async (req, res) => {
  try {
    const { trainId, scheduleId, seatNumber, passengerName, passengerAge } =
      req.body;
    const userId = req.user.id;

    if (
      !trainId ||
      !scheduleId ||
      !seatNumber ||
      !passengerName ||
      !passengerAge
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    if (schedule.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    // Check if seat is already booked
    const existingBooking = await Booking.findOne({
      schedule: scheduleId,
      seatNumber,
      bookingStatus: "confirmed",
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    // Generate payment ID
    const paymentId = `PAY-${Date.now()}`;

    const booking = new Booking({
      user: userId,
      train: trainId,
      schedule: scheduleId,
      seatNumber,
      passengerName,
      passengerAge,
      paymentStatus: "paid",
      paymentId,
      bookingStatus: "confirmed",
    });

    await booking.save();

    // Update available seats
    schedule.availableSeats -= 1;
    await schedule.save();

    // Populate the booking before sending
    await booking.populate(["user", "train", "schedule"]);

    // Send confirmation email to user
    try {
      const userEmail = booking.user?.email || req.user?.email;
      if (userEmail) {
        await sendBookingConfirmationEmail(booking, userEmail);
        console.log(`Confirmation email sent to ${userEmail}`);
      } else {
        console.warn("User email not found, skipping email send");
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("train")
      .populate("schedule")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Allow cancellation if user owns the booking OR if admin is cancelling
    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Don't allow cancelling already cancelled bookings
    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    // Release the seat
    const schedule = await Schedule.findById(booking.schedule);
    if (schedule) {
      schedule.availableSeats += 1;
      await schedule.save();
    }

    res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user")
      .populate("train")
      .populate("schedule")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// bookingController.js
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id; // auth middleware se aa raha hai

    const bookings = await Booking.find({ user: userId })
      .populate("train")
      .populate("schedule")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("getMyBookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get booked seats for a schedule
exports.getBookedSeats = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const bookings = await Booking.find({
      schedule: scheduleId,
      bookingStatus: "confirmed",
    }).select("seatNumber");

    const bookedSeatNumbers = bookings.map((booking) => booking.seatNumber);

    res.json({
      bookedSeats: bookedSeatNumbers,
      count: bookedSeatNumbers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download ticket PDF
exports.downloadTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find booking and verify ownership
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Generate PDF
    const pdfBuffer = await generateTicketPDF(id);

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket-${booking._id.toString().slice(-8)}.pdf`
    );

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error downloading ticket:", error);
    res.status(500).json({ message: error.message });
  }
};
