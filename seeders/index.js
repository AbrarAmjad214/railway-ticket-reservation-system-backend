require("dotenv").config();
const connectDB = require("../config/db");
const seedUsers = require("./userSeeder");
const seedTrains = require("./trainSeeder");
const seedSchedules = require("./scheduleSeeder");
const seedBookings = require("./bookingSeeder");
const seedCities = require("./citySeeder");

const runSeeders = async () => {
  try {
    console.log("Starting database seeding...");

    // Connect to database
    await connectDB();
    console.log("Connected to database");

    // Run seeders in order (important for foreign key relationships)
    await seedCities();
    await seedUsers();
    await seedTrains();
    await seedSchedules();
    await seedBookings();

    console.log("All seeders completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error running seeders:", error);
    process.exit(1);
  }
};

// Run seeders
runSeeders();
