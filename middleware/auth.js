const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")
    req.user = decoded
    console.log("Decoded user from token:", decoded) // Debug log
    next()
  } catch (error) {
    console.error("Auth error:", error) // Debug log
    res.status(401).json({ message: "Invalid token" })
  }
}

const adminAuth = (req, res, next) => {
  // Check if user is already authenticated (from previous auth middleware)
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }
  
  console.log("Admin check - User role:", req.user.role) // Debug log
  
  // Check if user has admin role
  if (req.user.role !== "admin") {
    console.log("Access denied - User role is:", req.user.role) // Debug log
    return res.status(403).json({ message: "Admin access required" })
  }
  
  next()
}

module.exports = { auth, adminAuth }
