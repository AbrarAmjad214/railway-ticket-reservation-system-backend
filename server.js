const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const trainRoutes = require("./routes/trainRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cityRoutes = require("./routes/cityRoutes");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://railway-ticket-reservation-system-opal.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/train", trainRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cities", cityRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
