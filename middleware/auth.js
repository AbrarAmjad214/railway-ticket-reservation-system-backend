const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }
    next()
  })
}

module.exports = { auth, adminAuth }
