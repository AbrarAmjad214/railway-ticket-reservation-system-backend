const nodemailer = require("nodemailer");

// Gmail SMTP Configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (booking, userEmail) => {
  try {
    const transporter = createTransporter();

    // Populate booking if needed
    const populatedBooking = await booking.populate([
      "train",
      "schedule",
      "user",
    ]);

    const train = populatedBooking.train;
    const schedule = populatedBooking.schedule;
    const user = populatedBooking.user;

    // Format date
    const travelDate = new Date(schedule.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .ticket-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #666;
          }
          .value {
            color: #333;
          }
          .booking-id {
            background: #667eea;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎫 Booking Confirmed!</h1>
          <p>Your Railway Ticket Booking</p>
        </div>
        
        <div class="content">
          <p>Dear ${populatedBooking.passengerName},</p>
          <p>Your booking has been confirmed successfully. Please find your ticket details below:</p>
          
          <div class="booking-id">
            Booking ID: ${populatedBooking._id
              .toString()
              .slice(-8)
              .toUpperCase()}
          </div>
          
          <div class="ticket-details">
            <h2 style="margin-top: 0; color: #667eea;">Train Details</h2>
            <div class="detail-row">
              <span class="label">Train Name:</span>
              <span class="value">${train.trainName || "N/A"}</span>
            </div>
            <div class="detail-row">
              <span class="label">Train Number:</span>
              <span class="value">${train.trainNumber || "N/A"}</span>
            </div>
            <div class="detail-row">
              <span class="label">Route:</span>
              <span class="value">${train.startStation || "N/A"} → ${
      train.endStation || "N/A"
    }</span>
            </div>
          </div>
          
          <div class="ticket-details">
            <h2 style="margin-top: 0; color: #667eea;">Journey Details</h2>
            <div class="detail-row">
              <span class="label">Travel Date:</span>
              <span class="value">${travelDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Departure Time:</span>
              <span class="value">${schedule.departureTime || "N/A"}</span>
            </div>
            <div class="detail-row">
              <span class="label">Arrival Time:</span>
              <span class="value">${schedule.arrivalTime || "N/A"}</span>
            </div>
            <div class="detail-row">
              <span class="label">Seat Number:</span>
              <span class="value" style="font-weight: bold; color: #667eea; font-size: 18px;">${
                populatedBooking.seatNumber
              }</span>
            </div>
          </div>
          
          <div class="ticket-details">
            <h2 style="margin-top: 0; color: #667eea;">Passenger Details</h2>
            <div class="detail-row">
              <span class="label">Passenger Name:</span>
              <span class="value">${populatedBooking.passengerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Age:</span>
              <span class="value">${populatedBooking.passengerAge} years</span>
            </div>
          </div>
          
          <div class="ticket-details">
            <h2 style="margin-top: 0; color: #667eea;">Payment Details</h2>
            <div class="detail-row">
              <span class="label">Ticket Price:</span>
              <span class="value" style="font-weight: bold; color: #28a745; font-size: 18px;">Rs. ${
                schedule.ticketPrice?.toLocaleString() || "N/A"
              }</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value" style="color: #28a745; font-weight: bold;">${
                populatedBooking.paymentStatus?.toUpperCase() || "PAID"
              }</span>
            </div>
            <div class="detail-row">
              <span class="label">Booking Status:</span>
              <span class="value" style="color: #28a745; font-weight: bold;">${
                populatedBooking.bookingStatus?.toUpperCase() || "CONFIRMED"
              }</span>
            </div>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Important:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Please arrive at the station at least 30 minutes before departure</li>
              <li>Carry a valid ID proof for verification</li>
              <li>Keep this email as your ticket confirmation</li>
              <li>In case of any queries, contact our support team</li>
            </ul>
          </div>
          
          <p>Thank you for choosing our Railway Ticketing Service!</p>
          <p>Have a safe and pleasant journey! 🚂</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Railway Ticketing System. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textContent = `
Booking Confirmed!

Dear ${populatedBooking.passengerName},

Your booking has been confirmed successfully.

Booking ID: ${populatedBooking._id.toString().slice(-8).toUpperCase()}

Train Details:
- Train Name: ${train.trainName || "N/A"}
- Train Number: ${train.trainNumber || "N/A"}
- Route: ${train.startStation || "N/A"} → ${train.endStation || "N/A"}

Journey Details:
- Travel Date: ${travelDate}
- Departure Time: ${schedule.departureTime || "N/A"}
- Arrival Time: ${schedule.arrivalTime || "N/A"}
- Seat Number: ${populatedBooking.seatNumber}

Passenger Details:
- Name: ${populatedBooking.passengerName}
- Age: ${populatedBooking.passengerAge} years

Payment Details:
- Ticket Price: Rs. ${schedule.ticketPrice?.toLocaleString() || "N/A"}
- Payment Status: ${populatedBooking.paymentStatus?.toUpperCase() || "PAID"}
- Booking Status: ${
      populatedBooking.bookingStatus?.toUpperCase() || "CONFIRMED"
    }

Important:
- Please arrive at the station at least 30 minutes before departure
- Carry a valid ID proof for verification
- Keep this email as your ticket confirmation

Thank you for choosing our Railway Ticketing Service!
Have a safe and pleasant journey!
    `;

    const mailOptions = {
      from: `"Railway Ticketing System" <${
        process.env.EMAIL_USER || "syedh2958@gmail.com"
      }>`,
      to: userEmail,
      subject: `🎫 Booking Confirmed - ${train.trainName || "Train"} Ticket`,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmationEmail,
};
