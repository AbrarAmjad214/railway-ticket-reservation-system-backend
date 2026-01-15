const User = require("../models/User")
const jwt = require("jsonwebtoken")

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role || "user" }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "7d",
  })
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, cnic } = req.body

    if (!name || !email || !password || !phone || !cnic) {
      return res.status(400).json({ message: "All fields are required" })
    }

    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    user = new User({
      name,
      email,
      password,
      phone,
      cnic,
      role: "user",
    })

    await user.save()

    const token = generateToken(user._id, user.role)

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken(user._id, user.role)

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.logout = (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logout successful" })
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.json({
      count: users.length,
      users
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" })
    }
    
    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({ message: "You cannot delete your own account" })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Prevent deleting other admin users (optional - you can remove this if you want)
    if (user.role === "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Cannot delete admin users" })
    }

    await User.findByIdAndDelete(id)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ message: error.message })
  }
}
