const User = require("../models/User")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { sendPasswordResetEmail } = require("../services/emailService")

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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" })
    }

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
      })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    const clientUrl = process.env.CLIENT_URL
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`

    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetUrl
    )

    if (!emailResult.success) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save({ validateBeforeSave: false })
      return res.status(500).json({
        message: "Failed to send reset email. Please try again later.",
      })
    }

    res.json({
      message: "Password reset link has been sent to your email",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" })
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" })
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character",
      })
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.json({
      message:
        "Password reset successful. You can now login with your new password.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: error.message })
  }
} 