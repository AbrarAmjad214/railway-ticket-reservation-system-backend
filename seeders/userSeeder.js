const User = require("../models/User")
const bcrypt = require("bcrypt")

const seedUsers = async () => {
  try {
    console.log("Seeding users...")

    // Check if users already exist
    const existingUsers = await User.countDocuments()
    if (existingUsers > 0) {
      console.log("Users already exist. Skipping user seeding.")
      return
    }

    // Hash password for all users
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("password123", salt)

    const users = [
      // Admin user
      {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        phone: "03001234567",
        cnic: "12345-1234567-1",
        role: "admin",
      },
      // Simple user
      {
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        phone: "03001234568",
        cnic: "12345-1234567-2",
        role: "user",
      },
      // Additional 10 users
      {
        name: "Alice Smith",
        email: "alice@example.com",
        password: hashedPassword,
        phone: "03001234569",
        cnic: "12345-1234567-3",
        role: "user",
      },
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        password: hashedPassword,
        phone: "03001234570",
        cnic: "12345-1234567-4",
        role: "user",
      },
      {
        name: "Carol Williams",
        email: "carol@example.com",
        password: hashedPassword,
        phone: "03001234571",
        cnic: "12345-1234567-5",
        role: "user",
      },
      {
        name: "David Brown",
        email: "david@example.com",
        password: hashedPassword,
        phone: "03001234572",
        cnic: "12345-1234567-6",
        role: "user",
      },
      {
        name: "Emma Davis",
        email: "emma@example.com",
        password: hashedPassword,
        phone: "03001234573",
        cnic: "12345-1234567-7",
        role: "user",
      },
      {
        name: "Frank Miller",
        email: "frank@example.com",
        password: hashedPassword,
        phone: "03001234574",
        cnic: "12345-1234567-8",
        role: "user",
      },
      {
        name: "Grace Wilson",
        email: "grace@example.com",
        password: hashedPassword,
        phone: "03001234575",
        cnic: "12345-1234567-9",
        role: "user",
      },
      {
        name: "Henry Moore",
        email: "henry@example.com",
        password: hashedPassword,
        phone: "03001234576",
        cnic: "12345-1234567-0",
        role: "user",
      },
      {
        name: "Ivy Taylor",
        email: "ivy@example.com",
        password: hashedPassword,
        phone: "03001234577",
        cnic: "12345-1234567-11",
        role: "user",
      },
      {
        name: "Jack Anderson",
        email: "jack@example.com",
        password: hashedPassword,
        phone: "03001234578",
        cnic: "12345-1234567-12",
        role: "user",
      },
    ]

    await User.insertMany(users)
    console.log("Users seeded successfully!")
  } catch (error) {
    console.error("Error seeding users:", error)
    throw error
  }
}

module.exports = seedUsers
