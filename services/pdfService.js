const PDFDocument = require("pdfkit");
const Booking = require("../models/Booking");

// Generate PDF ticket for booking
const generateTicketPDF = async (bookingId) => {
  try {
    // Find booking and populate related data
    const booking = await Booking.findById(bookingId)
      .populate("train")
      .populate("schedule")
      .populate("user");

    if (!booking) {
      throw new Error("Booking not found");
    }

    const train = booking.train;
    const schedule = booking.schedule;
    const user = booking.user;

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Collect PDF data
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    // Header
    doc
      .fontSize(24)
      .fillColor("#667eea")
      .text("RAILWAY TICKET", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("#666")
      .text("Booking Confirmation", { align: "center" })
      .moveDown(1);

    // Booking ID
    doc
      .fontSize(16)
      .fillColor("#000")
      .text(`Booking ID: ${booking._id.toString().slice(-8).toUpperCase()}`, {
        align: "center",
        underline: true,
      })
      .moveDown(1);

    // Line separator
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#ccc")
      .lineWidth(1)
      .stroke()
      .moveDown(1);

    // Train Details Section
    doc.fontSize(14).fillColor("#667eea").text("TRAIN DETAILS", {
      underline: true,
    });
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#000");
    doc.text(`Train Name: ${train?.trainName || "N/A"}`);
    doc.text(`Train Number: ${train?.trainNumber || "N/A"}`);
    doc.text(
      `Route: ${train?.startStation || "N/A"} → ${train?.endStation || "N/A"}`
    );
    doc.moveDown(1);

    // Journey Details Section
    doc.fontSize(14).fillColor("#667eea").text("JOURNEY DETAILS", {
      underline: true,
    });
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#000");
    const travelDate = new Date(schedule?.date || Date.now()).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    doc.text(`Travel Date: ${travelDate}`);
    doc.text(`Departure Time: ${schedule?.departureTime || "N/A"}`);
    doc.text(`Arrival Time: ${schedule?.arrivalTime || "N/A"}`);
    doc.text(`Seat Number: ${booking.seatNumber}`, {
      bold: true,
      fontSize: 14,
      fillColor: "#667eea",
    });
    doc.moveDown(1);

    // Passenger Details Section
    doc.fontSize(14).fillColor("#667eea").text("PASSENGER DETAILS", {
      underline: true,
    });
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#000");
    doc.text(`Name: ${booking.passengerName}`);
    doc.text(`Age: ${booking.passengerAge} years`);
    if (user?.email) {
      doc.text(`Email: ${user.email}`);
    }
    doc.moveDown(1);

    // Payment Details Section
    doc.fontSize(14).fillColor("#667eea").text("PAYMENT DETAILS", {
      underline: true,
    });
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#000");
    doc.text(`Ticket Price: Rs. ${schedule?.ticketPrice?.toLocaleString() || "N/A"}`);
    doc.text(`Payment Status: ${booking.paymentStatus?.toUpperCase() || "PAID"}`);
    doc.text(`Booking Status: ${booking.bookingStatus?.toUpperCase() || "CONFIRMED"}`);
    doc.moveDown(1);

    // Line separator
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#ccc")
      .lineWidth(1)
      .stroke()
      .moveDown(1);

    // Important Instructions
    doc.fontSize(12).fillColor("#d97706").text("IMPORTANT INSTRUCTIONS", {
      underline: true,
    });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor("#000");
    doc.text("• Please arrive at the station at least 30 minutes before departure");
    doc.text("• Carry a valid ID proof for verification");
    doc.text("• Keep this ticket safe and present it at the time of boarding");
    doc.text("• In case of any queries, contact our support team");
    doc.moveDown(1);

    // Footer
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(
        `Generated on: ${new Date().toLocaleString()}`,
        { align: "center" }
      )
      .text(
        "This is a computer-generated ticket. No signature required.",
        { align: "center" }
      )
      .text(
        `© ${new Date().getFullYear()} Railway Ticketing System. All rights reserved.`,
        { align: "center" }
      );

    // Finalize PDF
    doc.end();

    // Wait for PDF to be generated
    return new Promise((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

module.exports = {
  generateTicketPDF,
};
