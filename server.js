const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db")

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://railway-ticket-reservation-system-opal.vercel.app",
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

// Routes
const authRoutes = require("./routes/authRoutes")
const trainRoutes = require("./routes/trainRoutes")
const scheduleRoutes = require("./routes/scheduleRoutes")
const bookingRoutes = require("./routes/bookingRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/train", trainRoutes)
app.use("/api/schedule", scheduleRoutes)
app.use("/api/booking", bookingRoutes)

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
